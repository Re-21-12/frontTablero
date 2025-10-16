import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { from, Observable, BehaviorSubject, timer, of, throwError } from 'rxjs';
import { switchMap, tap, catchError, finalize } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RefreshTokenRequest,
  RefreshTokenResponse,
  Permiso,
} from '../interfaces/auth-interface';
import Keycloak from 'keycloak-js';
import { jwtDecode } from 'jwt-decode';
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly _httpClient = inject(HttpClient);
  private readonly _router = inject(Router);
  private readonly _keycloakService = inject(Keycloak);

  private readonly tokenKey = 'auth_token';
  private readonly refreshTokenKey = 'refresh_token';
  private readonly userKey = 'auth_user';
  private readonly expirationKey = 'token_expiration';
  private readonly permissionsKey = 'auth_permissions';
  private readonly roleKey = 'auth_role';

  private refreshTokenInProgress = false;
  private refreshTokenSubject = new BehaviorSubject<string | null>(null);
  private refreshTimer?: any;
  private keycloakRefreshInterval: any;

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }

  login(login: LoginRequest): Observable<LoginResponse> {
    return this._httpClient
      .post<LoginResponse>(
        environment[environment.selectedEnvironment].apiBaseUrl + '/Auth/login',
        login,
      )
      .pipe(tap((response) => this.handleAuthSuccess(response)));
  }

  register(register: RegisterRequest): Observable<string> {
    return this._httpClient.post<string>(
      environment[environment.selectedEnvironment].apiBaseUrl +
        '/Auth/register',
      register,
    );
  }

  private handleAuthSuccess(response: LoginResponse): void {
    this.saveLoginData(response);
    this.startTokenRefreshTimer();
    this.refreshTokenSubject.next(response.token);
  }

  saveLoginData(response: LoginResponse): void {
    if (!this.isBrowser()) return;

    // Validar que expiresIn sea un número válido
    const expiresIn = Number(response.expiresIn);
    if (isNaN(expiresIn) || expiresIn <= 0) {
      console.error('Invalid expiresIn value:', response.expiresIn);
      return;
    }

    // Convertir expiresIn de minutos a millisegundos
    const expirationTime = Date.now() + expiresIn * 60 * 1000;

    // Guardar información básica del usuario
    localStorage.setItem(this.tokenKey, response.token);
    localStorage.setItem(this.refreshTokenKey, response.refresToken);
    localStorage.setItem(this.expirationKey, expirationTime.toString());

    // Guardar información del usuario
    localStorage.setItem(
      this.userKey,
      JSON.stringify({
        nombre: response.nombre,
      }),
    );

    // Guardar rol completo
    if (response.rol) {
      localStorage.setItem(this.roleKey, JSON.stringify(response.rol));
    }

    // Guardar permisos
    if (response.permisos && response.permisos.length > 0) {
      localStorage.setItem(
        this.permissionsKey,
        JSON.stringify(response.permisos),
      );
    }
  }

  private startTokenRefreshTimer(): void {
    this.clearRefreshTimer();

    const expirationTime = this.getTokenExpiration();
    if (!expirationTime) return;

    const now = Date.now();
    const timeUntilRefresh = expirationTime - now - 2 * 60 * 1000; // 2 minutos antes

    if (timeUntilRefresh > 0) {
      this.refreshTimer = timer(timeUntilRefresh).subscribe(() => {
        this.refreshToken().subscribe();
      });
    }
  }

  private clearRefreshTimer(): void {
    if (this.refreshTimer) {
      this.refreshTimer.unsubscribe();
      this.refreshTimer = null;
    }
  }

  refreshToken(): Observable<string> {
    if (!this.isBrowser()) {
      return throwError(() => new Error('No browser environment'));
    }

    if (this.refreshTokenInProgress) {
      return this.refreshTokenSubject
        .asObservable()
        .pipe(
          switchMap((token) =>
            token
              ? of(token)
              : throwError(() => new Error('Token refresh failed')),
          ),
        );
    }

    const refreshToken = localStorage.getItem(this.refreshTokenKey);
    if (!refreshToken) {
      this.logout();
      return throwError(() => new Error('No refresh token available'));
    }

    this.refreshTokenInProgress = true;
    this.refreshTokenSubject.next(null);

    const refreshRequest: RefreshTokenRequest = { refreshToken };

    return this._httpClient
      .post<RefreshTokenResponse>(
        environment[environment.selectedEnvironment].apiBaseUrl +
          '/Auth/refresh',
        refreshRequest,
      )
      .pipe(
        tap((response) => {
          const loginResponse: any = {
            token: response.token,
            refresToken: response.refreshToken,
          };
          this.handleAuthSuccess(loginResponse);
        }),
        switchMap((response) => of(response.token)),
        catchError((error) => {
          console.error('Error refreshing token:', error);
          this.logout();
          return throwError(() => error);
        }),
        finalize(() => {
          this.refreshTokenInProgress = false;
        }),
      );
  }

  logout(): void {
    this.clearRefreshTimer();

    if (this.isBrowser()) {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.refreshTokenKey);
      localStorage.removeItem(this.userKey);
      localStorage.removeItem(this.expirationKey);
      localStorage.removeItem(this.permissionsKey);
      localStorage.removeItem(this.roleKey);
    }

    this._keycloakService.logout();
    this.refreshTokenSubject.next(null);

    this._router.navigate(['/inicio_sesion']);
  }

  isAuthenticated(): boolean {
    if (!this.isBrowser()) return false;

    const token = this._keycloakService.token;
    return true;
  }

  async getToken(): Promise<string | null> {
    if (!this.isBrowser()) return null;

    const token = this._keycloakService.token;
    const expiration = this.getTokenExpiration();

    if (!token) return null;

    return token;
  }
  getPermissionsByToken(): any[] {
    if (!this.isBrowser()) return [];
    return this._keycloakService.tokenParsed?.realm_access?.roles || [];
  }

  getTokenExpiration(): number | null {
    if (!this.isBrowser()) return null;

    const expiration = localStorage.getItem(this.expirationKey);
    return expiration ? parseInt(expiration, 10) : null;
  }

  getUsername(): string | null {
    return this.getUser()?.nombre ?? null;
  }

  getRole(): string | null {
    const role = this.getRoleComplete();
    return role?.nombre ?? null;
  }

  getRoleId(): number | null {
    const role = this.getRoleComplete();
    return role?.id_rol ?? null;
  }

  getRoleComplete(): { id_rol: number; nombre: string } | null {
    if (!this.isBrowser()) return null;

    const roleData = localStorage.getItem(this.roleKey);
    return roleData ? JSON.parse(roleData) : null;
  }

  getPermissions(): any[] {
    console.log('Obteniendo permisos del usuario');
    if (!this.isBrowser()) return [];

    // Primero intenta obtener los permisos guardados
    const permissions = this._keycloakService.tokenParsed?.realm_access?.roles;
    console.log('Permisos desde Keycloak:', permissions);
    if (permissions) {
      return permissions.map((p) => ({
        nombre: p.replace(/\s+/g, ''),
        id_Rol: 0,
      }));
    } else {
      return [];
    }
  }

  async hasPermission(permissionName: string): Promise<boolean> {
    // Verifica si el usuario tiene el permiso/rol solicitado usando el JWT
    const permissions: Permiso[] = await this.getPermissions();
    const cleanName = permissionName.replace(/\s+/g, '');
    return permissions.some((permission) => permission.nombre === cleanName);
  }

  async getPermissionsByAction(action: string): Promise<Permiso[]> {
    const permissions = await this.getPermissions();
    return permissions.filter((permission) =>
      permission.nombre.includes(action),
    );
  }

  async getPermissionsByModule(module: string): Promise<Permiso[]> {
    const permissions = await this.getPermissions();
    return permissions.filter((permission) =>
      permission.nombre.startsWith(module + ':'),
    );
  }

  private getUser(): { nombre: string } | null {
    if (!this.isBrowser()) return null;

    const raw = localStorage.getItem(this.userKey);
    return raw ? JSON.parse(raw) : null;
  }

  // Método para inicializar el servicio al cargar la app
  initializeAuth(): void {
    if (this.isAuthenticatedWithKeycloak()) {
      // Inicia el timer para refrescar el token cada 60 segundos
      this.clearKeycloakRefreshInterval();
      this.keycloakRefreshInterval = setInterval(() => {
        this.updateKeycloakToken();
      }, 60 * 1000); // cada 60 segundos
    }
    // ...si usas autenticación local, puedes mantener tu lógica actual...
    if (this.isAuthenticated()) {
      this.startTokenRefreshTimer();
    }
  }

  private clearKeycloakRefreshInterval(): void {
    if (this.keycloakRefreshInterval) {
      clearInterval(this.keycloakRefreshInterval);
      this.keycloakRefreshInterval = null;
    }
  }

  // Método para verificar si el token está por expirar
  isTokenExpiringSoon(): boolean {
    const expiration = this.getTokenExpiration();
    if (!expiration) return false;

    const timeUntilExpiration = expiration - Date.now();
    return timeUntilExpiration < 10 * 60 * 1000; // 10 minutos
  }

  // Método para obtener el tiempo restante hasta la expiración
  getTimeUntilExpiration(): number {
    const expiration = this.getTokenExpiration();
    if (!expiration) return 0;

    return Math.max(0, expiration - Date.now());
  }

  // Método para obtener información completa del usuario autenticado
  async getCurrentUser(): Promise<{
    nombre: string;
    rol: { id_rol: number; nombre: string } | null;
    permisos: Permiso[];
    username?: string;
    emailVerified?: boolean;
  } | null> {
    if (!this.isAuthenticated()) return null;
    try {
      const profile = await this._keycloakService.loadUserProfile();
      console.log('Perfil de usuario cargado desde Keycloak:', profile);
      return {
        nombre: `${profile.firstName ?? ''} ${profile.lastName ?? ''}`.trim(),
        rol: this.getRoleComplete(),
        permisos: this.getPermissions(),
        username: profile.username,
        emailVerified: profile.emailVerified,
      };
    } catch (e) {
      // Si falla, retorna datos mínimos
      return {
        nombre: '',
        rol: this.getRoleComplete(),
        permisos: this.getPermissions(),
        username: undefined,
        emailVerified: undefined,
      };
    }
  }

  getCurrentUser$(): Observable<{
    nombre: string;
    rol: { id_rol: number; nombre: string } | null;
    permisos: Permiso[];
  } | null> {
    if (!this.isAuthenticated()) return of(null);
    return from(this.getCurrentUser());
  }

  // ========================= KEYCLOAK METHODS =========================

  /**
   * Inicializar sesión con Keycloak
   */
  async loginWithKeycloak(): Promise<void> {
    try {
      await this._keycloakService.login();
    } catch (error) {
      console.error('Error al iniciar sesión con Keycloak:', error);
      throw error;
    }
  }

  /**
   * Cerrar sesión con Keycloak
   */
  async logoutWithKeycloak(): Promise<void> {
    try {
      // Limpiar datos locales primero
      this.clearLocalStorage();

      // Hacer logout de Keycloak
      await this._keycloakService.logout();
    } catch (error) {
      console.error('Error al cerrar sesión con Keycloak:', error);
      // Asegurar que se limpien los datos locales incluso si Keycloak falla
      this.clearLocalStorage();
      this._router.navigate(['/inicio_sesion']);
    }
  }

  /**
   * Verificar si el usuario está autenticado con Keycloak
   */
  isAuthenticatedWithKeycloak(): boolean {
    try {
      return this._keycloakService.authenticated;
    } catch (error) {
      console.error('Error al verificar autenticación con Keycloak:', error);
      // Si falla Keycloak, limpiar estado y redirigir
      this.logout();
      return false;
    }
  }

  /**
   * Obtener el token de Keycloak
   */
  getKeycloakToken(): string {
    try {
      return this._keycloakService.token || '';
    } catch (error) {
      console.error('Error al obtener token de Keycloak:', error);
      throw error;
    }
  }

  /**
   * Obtener información del usuario desde Keycloak
   */
  getKeycloakUserProfile(): any {
    try {
      return this._keycloakService.profile;
    } catch (error) {
      console.error('Error al obtener perfil de usuario de Keycloak:', error);
      return null;
    }
  }

  /**
   * Obtener roles del usuario desde Keycloak
   */
  getKeycloakUserRoles(): string[] {
    try {
      const realmRoles = this._keycloakService.realmAccess?.roles || [];
      const resourceRoles: string[] = [];

      // Obtener roles de recursos si existen
      if (this._keycloakService.resourceAccess) {
        Object.values(this._keycloakService.resourceAccess).forEach(
          (resource) => {
            resourceRoles.push(...resource.roles);
          },
        );
      }

      // Combinar roles de realm y recursos
      return [...realmRoles, ...resourceRoles];
    } catch (error) {
      console.error('Error al obtener roles de Keycloak:', error);
      return [];
    }
  }

  /**
   * Verificar si el usuario tiene un rol específico en Keycloak
   */
  hasKeycloakRole(role: string): boolean {
    try {
      // Verificar primero en roles de realm
      if (this._keycloakService.hasRealmRole(role)) {
        return true;
      }

      // Verificar en roles de recursos (usando clientId por defecto)
      return this._keycloakService.hasResourceRole(role);
    } catch (error) {
      console.error('Error al verificar rol en Keycloak:', error);
      return false;
    }
  }

  /**
   * Verificar si el usuario tiene un rol específico de realm en Keycloak
   */
  hasKeycloakRealmRole(role: string): boolean {
    try {
      return this._keycloakService.hasRealmRole(role);
    } catch (error) {
      console.error('Error al verificar rol de realm en Keycloak:', error);
      return false;
    }
  }

  /**
   * Verificar si el usuario tiene un rol específico de recurso en Keycloak
   */
  hasKeycloakResourceRole(role: string, resource?: string): boolean {
    try {
      return this._keycloakService.hasResourceRole(role, resource);
    } catch (error) {
      console.error('Error al verificar rol de recurso en Keycloak:', error);
      return false;
    }
  }

  /**
   * Actualizar token de Keycloak
   */
  async updateKeycloakToken(): Promise<boolean> {
    try {
      return await this._keycloakService.updateToken(70);
    } catch (error) {
      console.error('Error al actualizar token de Keycloak:', error);
      return false;
    }
  }

  /**
   * Método híbrido que usa tanto el sistema local como Keycloak
   */
  async isFullyAuthenticated(): Promise<boolean> {
    const localAuth = this.isAuthenticated();
    const keycloakAuth = await this.isAuthenticatedWithKeycloak();

    return localAuth || keycloakAuth;
  }

  /**
   * Login híbrido que intenta primero con Keycloak, luego con el sistema local
   */
  async hybridLogin(loginData?: LoginRequest): Promise<void> {
    try {
      // Intentar primero con Keycloak
      const isKeycloakAuth = await this.isAuthenticatedWithKeycloak();

      if (!isKeycloakAuth) {
        await this.loginWithKeycloak();
        return;
      }

      // Si Keycloak está autenticado pero necesitamos datos adicionales del backend
      if (loginData) {
        this.login(loginData).subscribe({
          next: (response) => {
            console.log('Autenticación híbrida exitosa');
          },
          error: (error) => {
            console.error('Error en login local después de Keycloak:', error);
          },
        });
      }
    } catch (error) {
      console.error('Error en login híbrido:', error);
      // Fallback al login tradicional si se proporciona
      if (loginData) {
        this.login(loginData).subscribe({
          error: (error) => {
            console.error('Error en fallback login:', error);
            throw error;
          },
        });
      } else {
        throw error;
      }
    }
  }

  /**
   * Logout híbrido que cierra sesión tanto en Keycloak como localmente
   */
  async hybridLogout(): Promise<void> {
    try {
      // Intentar logout de Keycloak primero
      const isKeycloakAuth = await this.isAuthenticatedWithKeycloak();

      if (isKeycloakAuth) {
        await this.logoutWithKeycloak();
      } else {
        // Fallback al logout tradicional
        this.logout();
      }
    } catch (error) {
      console.error('Error en logout híbrido:', error);
      // Asegurar limpieza local en caso de error
      this.logout();
    }
  }

  /**
   * Limpiar localStorage
   */
  private clearLocalStorage(): void {
    if (!this.isBrowser()) return;

    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    localStorage.removeItem(this.userKey);
    localStorage.removeItem(this.expirationKey);
    localStorage.removeItem(this.permissionsKey);
    localStorage.removeItem(this.roleKey);
  }

  /**
   * Sincronizar datos de Keycloak con el sistema local
   */
  async syncKeycloakWithLocal(): Promise<void> {
    try {
      const isKeycloakAuth = await this.isAuthenticatedWithKeycloak();

      if (isKeycloakAuth) {
        const userProfile = this.getKeycloakUserProfile();
        const userRoles = this.getKeycloakUserRoles();
        const token = await this.getKeycloakToken();

        // Simular una respuesta de login para guardar en localStorage
        if (userProfile && token) {
          const mockLoginResponse: any = {
            token: token,
            refresToken: '', // Keycloak maneja esto automáticamente
            expiresIn: 60, // Valor por defecto, Keycloak maneja la expiración
            nombre:
              userProfile.firstName + ' ' + userProfile.lastName ||
              userProfile.username,
            rol:
              userRoles.length > 0 ? { id_rol: 1, nombre: userRoles[0] } : null,
            permisos: [], // Se pueden mapear desde los roles de Keycloak
          };

          this.saveLoginData(mockLoginResponse);
        }
      }
    } catch (error) {
      console.error('Error al sincronizar Keycloak con datos locales:', error);
    }
  }

  hasAnyPermission(requiredPermissions: string[]): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      // Roles del realm
      const realmRoles: string[] = this.getPermissionsByToken() || [];

      // Limpiar espacios en blanco de los permisos requeridos
      const cleanedRequired = requiredPermissions.map((perm) =>
        perm.replace(/\s+/g, ''),
      );

      // Validar si el usuario tiene al menos uno de los permisos requeridos
      return cleanedRequired.some((perm) => realmRoles.includes(perm));
    } catch (e) {
      console.warn('Error decodificando el token:', e);
      return false;
    }
  }
}
