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

export const appConfig: ApplicationConfig = {
  providers: [
    provideKeycloak({
      config: {
        url: 'https://localhost:8080/',
        realm: 'master',
        clientId: 'frontend',
      },
      initOptions: {
        onLoad: 'check-sso',
        silentCheckSsoRedirectUri:
          window.location.origin + '/assets/silent-check-sso.html',
        redirectUri: window.location.origin + '/',
        checkLoginIframe: false,
      },
      features: [
        withAutoRefreshToken({
          sessionTimeout: 300000, // 5 minutes
          onInactivityTimeout: 'logout',
        }),
      ],

      providers: [AutoRefreshTokenService, UserActivityService],
    }),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(
      withFetch(),
      withInterceptors([
        AuthInterceptor,
        ErrorInterceptor,
        loadingInterceptor,
        includeBearerTokenInterceptor,
      ]),
    ),
  ],
};
