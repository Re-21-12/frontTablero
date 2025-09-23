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
  selectedEnvironment: 'dev', // Cambia esto a 'prod', 'dev' o 'local' según el entorno deseado
  prod: {
    apiBaseUrl: 'http://157.180.19.137/api/api',  // ⚡ usar /api sin puerto 8080
  },
  dev: {
    apiBaseUrl: 'http://localhost:5232/api',  // ⚡ usar /api sin puerto 8080
  },
  local: {
    apiBaseUrl: 'http://192.168.137.1:8080/api',  // ⚡ usar /api sin puerto 8080
  },
};
