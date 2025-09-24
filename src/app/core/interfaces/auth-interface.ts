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
    nombre: string;
    refresToken: string;
    expiresIn: number;
    rol: {
        id_rol: number;
        nombre: string;
    };
    permisos: Permiso[];
}
export interface Permiso{
    nombre: string;
    id_Rol: number;
}
