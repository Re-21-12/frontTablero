import { Injectable } from '@angular/core';
import {Equipo, Permiso, Resultado} from '../interfaces/models';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PermisoService {
  private base = `${environment[environment.selectedEnvironment].apiBaseUrl}/Permiso`;

  constructor(private http: HttpClient) { }
  getAll(): Observable<Permiso> {
    return this.http.get<Permiso>(`${this.base}`);
  }
  get(id: number): Observable<Permiso> {
    return this.http.get<Permiso>(`${this.base}/${id}`);
  }

}
