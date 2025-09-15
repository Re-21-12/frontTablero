import { Injectable } from '@angular/core';
import { Equipo, Resultado } from '../interfaces/models';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class TableroService {
  private base = `${environment.apiBaseUrl}/Tablero`;

  private _equiposSeleccionados: Equipo[] = [];
  id_partido: string = '';
  constructor(private http: HttpClient) { }

    get(id: number): Observable<Resultado> {
      return this.http.get<Resultado>(`${this.base}/${id}/resultado`);
    }

  setEquiposSeleccionados(equipos: Equipo[]) {
    this._equiposSeleccionados = equipos;
  }

  getEquiposSeleccionados(): Equipo[] {
    return this._equiposSeleccionados;
  }



}
