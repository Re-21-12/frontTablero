import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PartidoService {
  private base = `${environment.dev.apiBaseUrl}/Partido`;
  constructor(private http: HttpClient) {}

  getAll(): Observable<any[]> {
    return this.http.get<any[]>(this.base);
  }
  create(body: { fechaHora: string; id_Local: number; id_Visitante: number }): Observable<string> {
    return this.http.post(this.base, body, { responseType: 'text' as const });
  }
}
