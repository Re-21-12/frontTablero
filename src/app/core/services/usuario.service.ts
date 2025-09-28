import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { SetUsuario, Usuario } from '../interfaces/usuario';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private http = inject(HttpClient);
  private base = `${environment[environment.selectedEnvironment].apiBaseUrl}/Usuario`;

  getAll(): Observable<Usuario[]> {
    return this.http
      .get<{ usuarios: Usuario[] }>(this.base)
      .pipe(map((r) => r?.usuarios ?? []));
  }

  getById(id: number): Observable<Usuario> {
    return this.http
      .get<{ usuario: Usuario }>(`${this.base}/${id}`)
      .pipe(map((r) => r?.usuario));
  }

  update(id: number, data: Partial<SetUsuario>): Observable<Usuario> {
    const body: Partial<SetUsuario> = {
      id_Usuario: id,
      Nombre: data.Nombre ?? '',
      Rol: data.Rol,
      Contrasena: data.Contrasena || undefined,
    };

    return this.http.put<Usuario>(`${this.base}/${id}`, body);
  }

  remove(id: number): Observable<string> {
    return this.http.delete(`${this.base}/${id}`, { responseType: 'text' });
  }

  register(data: Partial<SetUsuario>): Observable<any> {
    const body: any = {
      Nombre: data.Nombre ?? '',
      Contrasena: data.Contrasena ?? '',
      Rol: data.Rol ?? { Id_rol: 0, Nombre: '' },
    };
    return this.http.post<any>(`${this.base}/register`, body);
  }
}
