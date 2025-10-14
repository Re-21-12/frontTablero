// src/app/core/services/jugador.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
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
  private jsonOpts = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    responseType: 'text' as const,
    observe: 'response' as const
  };

  constructor(private http: HttpClient) {}

  getAll(): Observable<Jugador[]> { return this.http.get<Jugador[]>(this.base); }
  getById(id: number): Observable<Jugador> { return this.http.get<Jugador>(`${this.base}/${id}`); }
  create(body: Jugador): Observable<string> {
    return this.http.post(this.base, body, { responseType: 'text' as const });
  }
  update(body: Jugador): Observable<string> {
    const id = body.id_Jugador;
    if (!id) return throwError(() => new Error('id_Jugador requerido'));
    const shaped: any = { ...body, id: id, idEquipo: body.id_Equipo };
    return this.http.put(`${this.base}/${id}`, shaped, this.jsonOpts).pipe(
      catchError(err => {
        if (err?.status === 404 || err?.status === 405) {
          return this.http.put(this.base, shaped, this.jsonOpts);
        }
        return throwError(() => err);
      }),
      map((res: HttpResponse<string>) => res.body ?? 'OK')
    );
  }

  delete(id: number): Observable<string> {
    return this.http.delete(`${this.base}/${id}`, { responseType: 'text' as const, observe: 'response' as const })
      .pipe(map(r => r.body ?? 'OK'));
  }

  getByTeam(id_Equipo: number): Observable<Jugador[]> {
    return this.http.get<Jugador[]>(`${this.base}/byTeam/${id_Equipo}`);
  }

  getPaginado(pagina: number, tamanio: number): Observable<Pagina<Jugador>> {
    return this.http.get<Pagina<Jugador>>(`${this.base}/Paginado?pagina=${pagina}&tamanio=${tamanio}`);
  }
}
