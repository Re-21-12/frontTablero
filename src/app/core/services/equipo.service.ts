import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Equipo } from '../interfaces/models';

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

  get(id: number): Observable<Equipo> {
    return this.getById(id);
  }

  create(body: { nombre: string; id_Localidad: number }): Observable<string | Equipo> {
    return this.http.post(this.base, body, { responseType: 'text' as const });
  }

  update(body: { id_Equipo: number; nombre: string; id_Localidad: number }): Observable<string | Equipo> {
    return this.http.put(this.base, body, { responseType: 'text' as const });
  }

  delete(id: number): Observable<void | string> {
    return this.http.delete(`${this.base}/${id}`, { responseType: 'text' as const });
  }


  getByLocalidad(id_Localidad: number): Observable<Equipo[]> {
    return this.http.get<Equipo[]>(`${this.base}/Localidad/${id_Localidad}`);
  }
}
