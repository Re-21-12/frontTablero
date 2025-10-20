// Definir los tipos para el environment
export interface KeycloakConfig {
  url: string;
  realm: string;
  clientId: string;
}

export interface EnvironmentConfig {
  apiBaseUrl: string;
  keycloak: KeycloakConfig;
  homepage: string;
}

export type EnvironmentType = 'prod' | 'dev' | 'local';

export interface Environment {
  production: boolean;
  prod: EnvironmentConfig;
  dev: EnvironmentConfig;
  local: EnvironmentConfig;
  selectedEnvironment: EnvironmentType;
}

export const environment: Environment = {
  production: true,
  selectedEnvironment: 'prod',
  prod: {
    apiBaseUrl: 'https://api.corazondeseda.lat/api',
    keycloak: {
      url: 'https://auth.corazondeseda.lat/auth',
      realm: 'master',
      clientId: 'frontend',
    },
    homepage: 'https://auth.corazondeseda.lat',
  },
  dev: {
    apiBaseUrl: 'http://localhost:5000/api',
    keycloak: {
      url: 'http://localhost:8080/auth',
      realm: 'master',
      clientId: 'frontend',
    },
    homepage: 'http://localhost:8080',
  },
  local: {
    apiBaseUrl: 'http://192.168.137.1:8080/api',
    keycloak: {
      url: 'http://192.168.137.1:8080/auth',
      realm: 'master',
      clientId: 'frontend',
    },
    homepage: 'http://192.168.137.1:8080',
  },
};
