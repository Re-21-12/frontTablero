export interface Itabler {
  partido:   Partido;
  local:     Local;
  visitante: Local;
  localidad: Localidad;
  cuartos:   Cuarto[];
}

export interface Cuarto {
  no_Cuarto:    number;
  total_Punteo: number;
  total_Faltas: number;
  id_Partido:   number;
  id_Equipo:    number;
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

export interface Equipo {
  id_Equipo:    number;
  nombre:       string;
  id_Localidad: number;
}

export interface Resultado {
  nombreLocal: string;
  nombreVisitante: string;
  localidad: string;
  totalFaltasLocal: number;
  totalFaltasVisitante: number;
  totalPunteoLocal: number;
  totalPunteoVisitante: number;
}

export interface Jugador{
  nombre: string;
  apellido: string;
  edad: number;
  id_Equipo: number;
}
