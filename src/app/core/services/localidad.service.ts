import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Localidad, Pagina } from '../interfaces/models';

@Injectable({ providedIn: 'root' })
export class LocalidadService {
  private base = `${environment[environment.selectedEnvironment].apiBaseUrl}/Localidad`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Localidad[]> {
    return this.http.get<Localidad[]>(this.base);
  }

  getById(id: number): Observable<Localidad> {
    return this.http.get<Localidad>(`${this.base}/${id}`);
  }

  get(id: number): Observable<Localidad> {
    return this.getById(id);
  }

  create(body: { nombre: string }): Observable<string> {
    return this.http.post(this.base, body, { responseType: 'text' as const });
  }

 
  update(body: { id: number; nombre: string }): Observable<string> {
    const urlConId = `${this.base}/${body.id}`;
    return this.http.put(urlConId, body, { responseType: 'text' as const }).pipe(
      catchError(err => {
        if (err?.status === 404 || err?.status === 405) {
          return this.http.put(this.base, body, { responseType: 'text' as const });
        }
        return throwError(() => err);
      })
    );
  }

  delete(id: number): Observable<string> {
    return this.http.delete(`${this.base}/${id}`, { responseType: 'text' as const });
  }

  getPaginado(pagina: number, tamanio: number) {
    return this.http.get<Pagina<any>>(
      `${this.base}/Paginado?pagina=${pagina}&tamanio=${tamanio}`
    );
  }
}
