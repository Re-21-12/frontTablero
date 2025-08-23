import { Injectable } from '@angular/core';
import { Equipo } from '../models';

@Injectable({
  providedIn: 'root'
})
export class TableroService {

  private _equiposSeleccionados: Equipo[] = [];
  id_partido: string = '';
  constructor() { }

  setEquiposSeleccionados(equipos: Equipo[]) {
    this._equiposSeleccionados = equipos;
  }

  getEquiposSeleccionados(): Equipo[] {
    return this._equiposSeleccionados;
  }
}
