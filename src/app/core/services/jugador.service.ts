import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Pagina } from '../interfaces/models';

export interface Jugador {
  id_Jugador?: number;
  nombre: string;
  apellido: string;
  estatura: number;
  posicion: string;
  nacionalidad: string;
  edad: number;
  id_Equipo: number;
}

@Injectable({ providedIn: 'root' })
export class JugadorService {
  private base = `${environment[environment.selectedEnvironment].apiBaseUrl}/Jugador`;

  constructor(private http: HttpClient) {}

  getAll()             { return this.http.get<Jugador[]>(this.base); }
  getById(id: number)  { return this.http.get<Jugador>(`${this.base}/${id}`); }
  create(body: Jugador){ return this.http.post(this.base, body); }
  update(body: Jugador){ return this.http.put(this.base, body); }
  delete(id: number)   { return this.http.delete(`${this.base}/${id}`); }
  getByTeam(id_Equipo: number){return this.http.get<Jugador[]>(`${this.base}/byTeam/${id_Equipo}`);}
  getPaginado(pagina: number, tamanio: number){return this.http.get<Pagina<any>>(`${this.base}/Paginado?pagina=${pagina}&tamanio=${tamanio}`)}
  
}
