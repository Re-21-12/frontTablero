import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const ErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Ha ocurrido un error inesperado';

      switch (error.status) {
        case 401:
          // Token expirado o no válido
          authService.logout();
          router.navigate(['/login']);
          errorMessage = 'Sesión expirada. Por favor, inicia sesión nuevamente.';
          break;
        case 403:
          errorMessage = 'No tienes permisos para realizar esta acción.';
          break;
        case 404:
          errorMessage = 'El recurso solicitado no fue encontrado.';
          break;
        case 500:
          errorMessage = 'Error interno del servidor. Intenta más tarde.';
          break;
        default:
          errorMessage = error.error?.message || errorMessage;
      }

      console.error('Error HTTP:', error);

      // Aquí podrías mostrar un toast/notification con el error
      // this.notificationService.showError(errorMessage);

      return throwError(() => new Error(errorMessage));
    })
  );
};
