import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { Pagina } from '../interfaces/models';

@Injectable({ providedIn: 'root' })
export class PartidoService {
  private base = `${environment[environment.selectedEnvironment].apiBaseUrl}/Partido`;
  constructor(private http: HttpClient) {}

  getAll(): Observable<any[]> {
    return this.http.get<any[]>(this.base);
  }
  create(body: {
    fechaHora: string;
    id_Local: number;
    id_Visitante: number;
  }): Observable<string> {
    return this.http.post(this.base, body, { responseType: 'text' as const });
  }
  getPartidoResultados(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/Resultado`);
  }
  getPaginado(pagina: number, tamanio: number) {
    return this.http.get<Pagina<any>>(
      `${this.base}/Paginado?pagina=${pagina}&tamanio=${tamanio}`,
    );
  }
  update(
    id: number,
    body: {
      fechaHora?: string;
      FechaHora?: string;
      id_Local?: number;
      id_Visitante?: number;
      id_visitante?: number;
    },
  ): Observable<string> {
    return this.http.put(`${this.base}/${id}`, body, {
      responseType: 'text' as const,
    });
  }
}
