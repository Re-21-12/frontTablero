// Definir los tipos para el environment
export interface EnvironmentConfig {
  apiBaseUrl: string;
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
    apiBaseUrl: '/api/api', // relativo al mismo dominio
  },
  dev: {
    apiBaseUrl: 'http://localhost:5000/api', // para desarrollo local
  },
  local: {
    apiBaseUrl: 'http://192.168.137.1:8080/api', // entorno local
  },
};
