
export interface Rol {
  Id_Rol: number;
  Nombre: string;
  Permisos?: Permiso[];
}

export interface Permiso {
  Id_Permiso: number;
  Nombre: string;
}
