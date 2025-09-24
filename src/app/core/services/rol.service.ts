import { Injectable } from '@angular/core';
import {environment} from '../../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Permiso} from '../interfaces/models';
import {Rol} from '../interfaces/models';
@Injectable({
  providedIn: 'root'
})
export class RolService {
  private base = `${environment[environment.selectedEnvironment].apiBaseUrl}/Rol`;

  constructor(private http: HttpClient) { }
  getAll(): Observable<Rol> {
    return this.http.get<Rol>(`${this.base}`);
  }
  get(id: number): Observable<Rol> {
    return this.http.get<Rol>(`${this.base}/${id}`);
  }
}
