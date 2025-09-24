import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Localidad } from '../interfaces/models';

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


  create(body: { nombre: string }): Observable<Localidad | string> {
    return this.http.post(this.base, body, { responseType: 'text' as const });
  }


  update(body: { id: number; nombre: string }): Observable<Localidad | string> {
    return this.http.put(this.base, body, { responseType: 'text' as const });
  }


  delete(id: number): Observable<void | string> {
    return this.http.delete(`${this.base}/${id}`, { responseType: 'text' as const });
  }
}
