export interface Itabler {
  partido:   Partido;
  local:     Local;
  visitante: Local;
  localidad: Localidad;
  cuartos:   Cuarto[];
}

export interface Cuarto {
  id_Cuarto:    number;
  no_Cuarto:    number;
  total_Punteo: number;
  total_Faltas: number;
  id_Partido:   number;
  id_Equipo:    number;
  duenio:       string; // "l" | "v"
}

export interface Local {
  id_Equipo:    number;
  nombre:       string;
  id_Localidad: number;
  localidad:    Localidad;
}

export interface Localidad {
  id_Localidad: number;
  nombre:       string;
}

export interface Partido {
  fechaHora:    Date;   
  id_Localidad: number;
  id_Local:     number;
  id_Visitante: number;
}
