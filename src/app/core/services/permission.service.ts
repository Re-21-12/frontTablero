import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PermissionService {
  private http = inject(HttpClient);
  private base = '/api/Permiso'; 

  getAll(): Observable<any[]> {
    return this.http.get<any[]>(this.base);
  }

  getById(id: number): Observable<any> {
    return this.http.get<any>(`${this.base}/${id}`);
  }

  create(data: { Nombre?: string; nombre?: string }): Observable<any> {
    const body = { Nombre: data.Nombre ?? data.nombre ?? '' };
    return this.http.post<any>(this.base, body);
  }

  update(id: number, data: { Nombre?: string; nombre?: string }): Observable<any> {
    const body = { Nombre: data.Nombre ?? data.nombre ?? '' };
    return this.http.put<any>(`${this.base}/${id}`, body);
  }

  remove(id: number): Observable<string | void> {
    return this.http.delete(`${this.base}/${id}`, { responseType: 'text' });
  }
}
