import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Permiso } from '../interfaces/models';

// Interfaz para la respuesta de autenticación
interface AuthResponse {
  token: string;
  expiresIn: number;
  nombre: string;
  rol: {
    id_rol: number;
    nombre: string;
  };
  refresToken: string;
  permisos: {
    nombre: string;
    id_Rol: number;
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class PermisoService {
  private base = `${environment[environment.selectedEnvironment].apiBaseUrl}/Permiso`;

  constructor(private http: HttpClient) { }

  getAll(): Observable<Permiso[]> {
    return this.http.get<Permiso[]>(`${this.base}`);
  }

  get(id: number): Observable<Permiso> {
    return this.http.get<Permiso>(`${this.base}/${id}`);
  }


}
