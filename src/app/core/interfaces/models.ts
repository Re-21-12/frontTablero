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
  id: number;
  localidad:    Localidad;
}

export interface Localidad {
  id: number;
  nombre:       string;
}

export interface Partido {
  fechaHora:    Date;
  id: number;
  id_Local:     number;
  id_Visitante: number;
}

export interface Equipo {
  id_Equipo:    number;
  nombre:       string;
  localidad: number;
  id_localidad: number;
}

export interface PartidoResultado {
  id_Partido: number
  local: string
  visitante: string
  resultado: Resultado
  fechaHora: Date
}

export interface Resultado {
  id_Partido: number
  puntaje_local: number
  puntaje_visitante: number
}


export interface Jugador{
  nombre: string;
  apellido: string;
  edad: number;
  id_Equipo: number;
}
export interface Permiso{
  id_Permiso: number;
  nombre: string;
}
export interface Rol{
  id_Rol: number;
  nombre:string;
}

export interface Pagina<T> {
  items: T[]
  totalRegistros: number
  paginaActual: number
  totalPaginas: number
}


export interface Item<T> {
  data: T
}

export interface PartidoPagina {
  fechaHora: Date
  id_Localidad: number
  id_Local: number
  id_Visitante: number
  local: string
  visitante: string
}
