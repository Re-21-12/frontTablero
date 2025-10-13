import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import {
  AutoRefreshTokenService,
  includeBearerTokenInterceptor,
  provideKeycloak,
  UserActivityService,
  withAutoRefreshToken,
} from 'keycloak-angular';
import {
  provideHttpClient,
  withFetch,
  withInterceptors,
} from '@angular/common/http';
import { routes } from './app.routes';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';
import { ErrorInterceptor } from './core/interceptors/error.interceptor';
import { loadingInterceptor } from './core/interceptors/loading.interceptor';
import { provideKeycloakAngular } from './keycloak.config';
import { provideAnimations } from '@angular/platform-browser/animations';
export const appConfig: ApplicationConfig = {
  providers: [
    provideKeycloakAngular(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimations(),
    provideHttpClient(
      withFetch(),
      withInterceptors([
        AuthInterceptor,
        // ErrorInterceptor,
        loadingInterceptor,
        includeBearerTokenInterceptor,
      ]),
    ),
  ],
};
