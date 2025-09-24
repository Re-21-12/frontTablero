import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, timer, of, throwError } from 'rxjs';
import { switchMap, tap, catchError, finalize } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse, RegisterRequest, RefreshTokenRequest, RefreshTokenResponse, Permiso } from '../interfaces/auth-interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly _httpClient = inject(HttpClient);
  private readonly _router = inject(Router);

  private readonly tokenKey = 'auth_token';
  private readonly refreshTokenKey = 'refresh_token';
  private readonly userKey = 'auth_user';
  private readonly expirationKey = 'token_expiration';
  private readonly permissionsKey = 'auth_permissions';
  private readonly roleKey = 'auth_role';

  private refreshTokenInProgress = false;
  private refreshTokenSubject = new BehaviorSubject<string | null>(null);
  private refreshTimer?: any;

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }

  login(login: LoginRequest): Observable<LoginResponse> {
    return this._httpClient.post<LoginResponse>(
      environment[environment.selectedEnvironment].apiBaseUrl + '/Auth/login',
      login
    ).pipe(
      tap(response => this.handleAuthSuccess(response))
    );
  }

  register(register: RegisterRequest): Observable<string> {
    return this._httpClient.post<string>(
      environment[environment.selectedEnvironment].apiBaseUrl + '/Auth/register',
      register
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
    const expirationTime = Date.now() + (expiresIn * 60 * 1000);

    // Guardar información básica del usuario
    localStorage.setItem(this.tokenKey, response.token);
    localStorage.setItem(this.refreshTokenKey, response.refresToken);
    localStorage.setItem(this.expirationKey, expirationTime.toString());

    // Guardar información del usuario
    localStorage.setItem(
      this.userKey,
      JSON.stringify({
        nombre: response.nombre
      })
    );

    // Guardar rol completo
    if (response.rol) {
      localStorage.setItem(this.roleKey, JSON.stringify(response.rol));
    }

    // Guardar permisos
    if (response.permisos && response.permisos.length > 0) {
      localStorage.setItem(this.permissionsKey, JSON.stringify(response.permisos));
    }
  }

  private startTokenRefreshTimer(): void {
    this.clearRefreshTimer();

    const expirationTime = this.getTokenExpiration();
    if (!expirationTime) return;

    const now = Date.now();
    const timeUntilRefresh = expirationTime - now - (5 * 60 * 1000); // 5 minutos antes

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
      return this.refreshTokenSubject.asObservable().pipe(
        switchMap(token => token ? of(token) : throwError(() => new Error('Token refresh failed')))
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

    return this._httpClient.post<RefreshTokenResponse>(
      environment[environment.selectedEnvironment].apiBaseUrl + '/Auth/refresh',
      refreshRequest
    ).pipe(
      tap(response => {
        const loginResponse: any = {
          token: response.token,
          refresToken: response.refreshToken,
        };
        this.handleAuthSuccess(loginResponse);
      }),
      switchMap(response => of(response.token)),
      catchError(error => {
        console.error('Error refreshing token:', error);
        this.logout();
        return throwError(() => error);
      }),
      finalize(() => {
        this.refreshTokenInProgress = false;
      })
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

    this.refreshTokenSubject.next(null);
    this._router.navigate(['/inicio_sesion']);
  }

  isAuthenticated(): boolean {
    if (!this.isBrowser()) return false;

    const token = this.getToken();
    const expiration = this.getTokenExpiration();

    if (!token || !expiration) return false;

    const isExpired = Date.now() >= expiration;

    if (isExpired) {
      // Intentar refresh automático si está disponible
      const refreshToken = localStorage.getItem(this.refreshTokenKey);
      if (refreshToken) {
        this.refreshToken().subscribe({
          error: () => this.logout()
        });
      } else {
        this.logout();
      }
      return false;
    }

    return true;
  }

  getToken(): string | null {
    if (!this.isBrowser()) return null;

    const token = localStorage.getItem(this.tokenKey);
    const expiration = this.getTokenExpiration();

    if (!token || !expiration) return null;

    // Si el token expira en menos de 1 minuto, intentar refresh
    const timeUntilExpiration = expiration - Date.now();
    if (timeUntilExpiration < 60000 && timeUntilExpiration > 0) {
      this.refreshToken().subscribe({
        error: () => console.warn('Failed to refresh token automatically')
      });
    }

    return token;
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

  getPermissions(): Permiso[] {
    if (!this.isBrowser()) return [];

    const permissionsData: Permiso[] = JSON.parse(localStorage.getItem(this.permissionsKey) || '[]');

    // Eliminar todos los espacios en blanco de los nombres de los permisos
    const cleanedPermissions = permissionsData.map(permission => ({
      ...permission,
      nombre: permission.nombre.replace(/\s+/g, '')
    }));

    console.log('Permisos del usuario obtenidos (espacios eliminados):', cleanedPermissions);
    return cleanedPermissions;
  }

  hasPermission(permissionName: string): boolean {
    const permissions = this.getPermissions();
    return permissions.some(permission => {
      console.log('Verificando permiso:', permission.nombre, 'contra', permissionName);
      return permission.nombre === permissionName.replace(' ', '')
    });
  }

  hasAnyPermission(permissionNames: string[]): boolean {
    console.log('Verificando permisos:', permissionNames);
    const permissions = this.getPermissions();
    console.log('Permisos del usuario:', permissions);
    const anyPermissions = permissionNames.some(permissionName =>{
      console.log('Verificando permiso:', permissionName.trim());
      return permissions.some(permission => permission.nombre.trim() === permissionName.trim())
    }
    );
    console.log('Resultado de verificación de permisos:', anyPermissions);
    return anyPermissions;
  }

  getPermissionsByAction(action: string): Permiso[] {
    const permissions = this.getPermissions();
    return permissions.filter(permission => permission.nombre.includes(action));
  }

  getPermissionsByModule(module: string): Permiso[] {
    const permissions = this.getPermissions();
    return permissions.filter(permission => permission.nombre.startsWith(module + ':'));
  }

  private getUser(): { nombre: string } | null {
    if (!this.isBrowser()) return null;

    const raw = localStorage.getItem(this.userKey);
    return raw ? JSON.parse(raw) : null;
  }

  // Método para inicializar el servicio al cargar la app
  initializeAuth(): void {
    if (this.isAuthenticated()) {
      this.startTokenRefreshTimer();
    }
  }

  // Método para verificar si el token está por expirar
  isTokenExpiringSoon(): boolean {
    const expiration = this.getTokenExpiration();
    if (!expiration) return false;

    const timeUntilExpiration = expiration - Date.now();
    return timeUntilExpiration < (10 * 60 * 1000); // 10 minutos
  }

  // Método para obtener el tiempo restante hasta la expiración
  getTimeUntilExpiration(): number {
    const expiration = this.getTokenExpiration();
    if (!expiration) return 0;

    return Math.max(0, expiration - Date.now());
  }

  // Método para obtener información completa del usuario autenticado
  getCurrentUser(): { nombre: string; rol: { id_rol: number; nombre: string } | null; permisos: Permiso[] } | null {
    if (!this.isAuthenticated()) return null;

    return {
      nombre: this.getUsername() || '',
      rol: this.getRoleComplete(),
      permisos: this.getPermissions()
    };
  }
}
