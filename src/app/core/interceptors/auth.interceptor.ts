import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import Keycloak from 'keycloak-js';
import { from, switchMap } from 'rxjs';

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const keycloak = inject(Keycloak);

  // Intentar obtener token de Keycloak primero, luego fallback al sistema local
  return from(getToken()).pipe(
    switchMap((token) => {
      if (token) {
        const newReq = req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`,
          },
        });
        return next(newReq);
      }

      // Si no hay token disponible, proceder sin autorización
      return next(req);
    }),
  );

  async function getToken(): Promise<string | null> {
    try {
      // Verificar si Keycloak está inicializado y el usuario está logueado
      if (keycloak.authenticated) {
        // Actualizar token si es necesario (se actualiza automáticamente si expira en < 70 segundos)
        await keycloak.updateToken(70);
        return keycloak.token || null;
      }
    } catch (error) {
      console.warn('Error al obtener token de Keycloak:', error);
    }

    // Fallback al token del sistema local
    const localToken = auth.getToken();
    if (localToken) {
      return localToken;
    }

    return null;
  }
};
