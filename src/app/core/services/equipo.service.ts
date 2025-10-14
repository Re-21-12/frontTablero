import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Equipo, Pagina } from '../interfaces/models';

@Injectable({ providedIn: 'root' })
export class EquipoService {
  private base = `${environment[environment.selectedEnvironment].apiBaseUrl}/Equipo`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Equipo[]> {
    return this.http.get<Equipo[]>(this.base);
  }

  getById(id: number): Observable<Equipo> {
    return this.http.get<Equipo>(`${this.base}/${id}`);
  }

  get(id: number): Observable<Equipo> { return this.getById(id); }

  create(body: { nombre: string; id_Localidad: number }): Observable<string> {
    return this.http.post(this.base, body, { responseType: 'text' as const });
  }


update(body: { id_Equipo: number; nombre: string; id_Localidad: number }): Observable<string> {
  const urlSinId = this.base;
  const urlConId = `${this.base}/${body.id_Equipo}`;

  return this.http.put(urlSinId, body, { responseType: 'text' as const }).pipe(
    // Si el backend no acepta PUT /Equipo, probamos PUT /Equipo/{id}
    catchError(err => {
      if (err?.status === 404 || err?.status === 405 || err?.status === 400) {
        return this.http.put(urlConId, body, { responseType: 'text' as const });
      }
      return throwError(() => err);
    }),
    map(x => (x as unknown as string) ?? 'OK')
  );
}

  delete(id: number): Observable<string> {
    return this.http.delete(`${this.base}/${id}`, { responseType: 'text' as const }).pipe(
      catchError(err => {
        if (err?.status === 404 || err?.status === 405) {
          return this.http.delete(`${this.base}?id=${id}`, { responseType: 'text' as const });
        }
        return throwError(() => err);
      }),
      map(x => (x as unknown as string) ?? 'OK')
    );
  }

  getByLocalidad(id: number): Observable<Equipo[]> {
    return this.http.get<Equipo[]>(`${this.base}/Localidad/${id}`);
  }

  getPaginado(pagina: number, tamanio: number) {
    return this.http.get<Pagina<any>>(`${this.base}/Paginado?pagina=${pagina}&tamanio=${tamanio}`);
  }

  patchUrl(body: { id_Equipo: number; url: string }): Observable<string> {
    return this.http.patch(`${this.base}`, body, { responseType: 'text' as const }).pipe(
      map(x => (x as unknown as string) ?? 'OK')
    );
  }
}
