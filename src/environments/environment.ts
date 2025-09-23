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
  selectedEnvironment: 'dev',  
  prod: {
    apiBaseUrl: 'http://157.180.19.137/api/api',  
  },
  dev: {
    apiBaseUrl: 'http://localhost:5232/api',  
  },
  local: {
    apiBaseUrl: 'http://192.168.137.1:8080/api',  
  },
};
