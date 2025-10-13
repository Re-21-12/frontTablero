// Definir los tipos para el environment
export interface KeycloakConfig {
  url: string;
  realm: string;
  clientId: string;
}

export interface EnvironmentConfig {
  apiBaseUrl: string;
  keycloak: KeycloakConfig;
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
    apiBaseUrl: '/api/api',
    keycloak: {
      url: 'https://keycloack:8080.com/auth',
      realm: 'master',
      clientId: 'frontend',
    },
  },
  dev: {
    apiBaseUrl: 'http://localhost:5232/api',
    keycloak: {
      url: 'http://localhost:8080/auth',
      realm: 'master',
      clientId: 'frontend',
    },
  },
  local: {
    apiBaseUrl: 'http://192.168.137.1:8080/api',
    keycloak: {
      url: 'http://192.168.137.1:8080/auth',
      realm: 'master',
      clientId: 'frontend',
    },
  },
};
