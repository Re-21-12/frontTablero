export interface LoginRequest {
    nombre: string;
    contrasena: string;
}
export interface RegisterRequest {
  nombre: string;
  contrasena: string;
  rol:{
    nombre:string
  }
}
export interface RefreshTokenRequest {
    refreshToken: string;
}
export interface RefreshTokenResponse {
    token: string;
    refreshToken: string;
}
export interface LoginResponse {
    token: string;
    username: string;
    role: any;
}
