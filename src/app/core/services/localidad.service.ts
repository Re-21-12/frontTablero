import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { Localidad } from '../interfaces/models';

@Injectable({ providedIn: 'root' })
export class LocalidadService {
  private base = `${environment[environment.selectedEnvironment].apiBaseUrl}/Localidad`;
  constructor(private http: HttpClient) {}

  getAll(): Observable<Localidad[]> {
    return this.http.get<Localidad[]>(this.base);
  }
  get(id: number): Observable<Localidad> {
    return this.http.get<Localidad>(`${this.base}/${id}`);
  }
  create(body: { nombre: string }): Observable<string> {
    return this.http.post(this.base, body, { responseType: 'text' as const });
  }
}
