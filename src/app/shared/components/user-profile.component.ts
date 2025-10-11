import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { KeycloakConfigService } from '../../core/services/keycloak-config.service';
import { KeycloakService } from 'keycloak-angular';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css',
})
export class UserProfileComponent implements OnInit {
  private readonly _authService = inject(AuthService);
  private readonly _keycloakConfigService = inject(KeycloakConfigService);
  private readonly _keycloakService = inject(KeycloakService);

  userInfo: any = null;
  isKeycloakAuth = false;
  isLocalAuth = false;
  loading = true;

  async ngOnInit(): Promise<void> {
    await this.loadUserInfo();
  }

  private async loadUserInfo(): Promise<void> {
    try {
      this.loading = true;

      // Verificar estado de autenticación
      this.isKeycloakAuth =
        await this._authService.isAuthenticatedWithKeycloak();
      this.isLocalAuth = this._authService.isAuthenticated();

      // Obtener información completa del usuario
      this.userInfo = await this._keycloakConfigService.getCompleteUserInfo();
    } catch (error) {
      console.error('Error al cargar información del usuario:', error);
    } finally {
      this.loading = false;
    }
  }

  async logout(): Promise<void> {
    try {
      await this._authService.hybridLogout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }

  async refreshUserInfo(): Promise<void> {
    await this.loadUserInfo();
  }

  async syncKeycloak(): Promise<void> {
    try {
      await this._authService.syncKeycloakWithLocal();
      await this.loadUserInfo();
    } catch (error) {
      console.error('Error al sincronizar con Keycloak:', error);
    }
  }

  getAuthStatusClass(): string {
    if (this.isKeycloakAuth && this.isLocalAuth) {
      return 'auth-status--both';
    } else if (this.isKeycloakAuth) {
      return 'auth-status--keycloak';
    } else if (this.isLocalAuth) {
      return 'auth-status--local';
    }
    return 'auth-status--none';
  }

  getAuthStatusText(): string {
    if (this.isKeycloakAuth && this.isLocalAuth) {
      return 'Autenticado (Híbrido)';
    } else if (this.isKeycloakAuth) {
      return 'Autenticado (Keycloak)';
    } else if (this.isLocalAuth) {
      return 'Autenticado (Local)';
    }
    return 'No autenticado';
  }
}
