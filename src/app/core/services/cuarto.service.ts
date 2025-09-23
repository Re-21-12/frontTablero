import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { Cuarto } from '../interfaces/models';

@Injectable({ providedIn: 'root' })
export class CuartoService {
  private base = `${environment[environment.selectedEnvironment].apiBaseUrl}/Cuarto`;
  constructor(private http: HttpClient) {}

  getAll(): Observable<Cuarto[]> {
    return this.http.get<Cuarto[]>(this.base);
  }
  create(body: Cuarto): Observable<string> {
    return this.http.post(this.base, body, { responseType: 'text' as const });
  }
}
