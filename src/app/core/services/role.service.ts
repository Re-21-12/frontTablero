import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Rol } from '../interfaces/role';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class RoleService {
  private http = inject(HttpClient);
  private base = `${environment[environment.selectedEnvironment].apiBaseUrl}/Rol`;


  getAll(): Observable<Rol[]> {
    return this.http.get<Rol[]>(this.base);
  }

  getById(id: number): Observable<Rol> {
    return this.http.get<Rol>(`${this.base}/${id}`);
  }

  create(data: Partial<Rol>): Observable<Rol> {
    return this.http.post<Rol>(this.base, data);
  }

  update(id: number, data: Partial<Rol>): Observable<Rol> {
    return this.http.put<Rol>(`${this.base}/${id}`, data);
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  assignPermissions(rolId: number, permisoIds: number[]): Observable<string> {
    return this.http.post(`${this.base}/${rolId}/permisos`, permisoIds, { responseType: 'text' });
  }

  removePermission(rolId: number, permisoId: number): Observable<string> {
    return this.http.delete(`${this.base}/${rolId}/permisos/${permisoId}`, { responseType: 'text' });
  }
}
