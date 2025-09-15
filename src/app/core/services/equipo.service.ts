import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { Equipo, Local } from '../interfaces/models';

@Injectable({ providedIn: 'root' })
export class EquipoService {
  private base = `${environment.apiBaseUrl}/Equipo`;
  constructor(private http: HttpClient) {}

  getAll(): Observable<Equipo[]> {
    return this.http.get<Equipo[]>(this.base);
  }
  create(body: { nombre: string; id_Localidad: number }): Observable<string> {
    return this.http.post(this.base, body, { responseType: 'text' as const });
  }
}
