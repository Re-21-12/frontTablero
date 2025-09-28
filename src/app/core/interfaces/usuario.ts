export interface Usuario {
  id_Usuario: number;
  nombre: string;
  id_Rol: number;
  Contrasena?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: number;
  updatedBy?: number;
}
export interface SetUsuario {
  id_Usuario: number;
  Nombre: string;
  Rol: { Id_rol: string; Nombre: string };
  Contrasena?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: number;
  updatedBy?: number;
}
