import {
  provideKeycloak,
  createInterceptorCondition,
  IncludeBearerTokenCondition,
  INCLUDE_BEARER_TOKEN_INTERCEPTOR_CONFIG,
  withAutoRefreshToken,
  AutoRefreshTokenService,
  UserActivityService,
} from 'keycloak-angular';
import { environment } from '../environments/environment';

const localhostCondition =
  createInterceptorCondition<IncludeBearerTokenCondition>({
    urlPattern: /^(http:\/\/localhost:8181)(\/.*)?$/i,
  });

export const provideKeycloakAngular = () =>
  provideKeycloak({
    config: {
      realm: 'master',
      url: environment[environment.selectedEnvironment].keycloak.url,
      clientId: 'frontend',
    },
    initOptions: {
      onLoad: 'check-sso',
      // Use the homepage configured in the environment for redirect URIs so
      // the Keycloak redirect matches the selected environment (prod/dev/local)
      silentCheckSsoRedirectUri:
        environment[environment.selectedEnvironment].homepage +
        '/silent-check-sso.html',
      redirectUri: environment[environment.selectedEnvironment].homepage + '/',
    },
    features: [
      withAutoRefreshToken({
        onInactivityTimeout: 'logout',
        sessionTimeout: 1000,
      }),
    ],
    providers: [
      AutoRefreshTokenService,
      UserActivityService,
      {
        provide: INCLUDE_BEARER_TOKEN_INTERCEPTOR_CONFIG,
        useValue: [localhostCondition],
      },
    ],
  });
