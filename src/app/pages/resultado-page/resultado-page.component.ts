import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableroService } from '../../core/services/tablero.service';
import { Resultado } from '../../core/models';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-resultado-page',
  imports: [CommonModule],
  templateUrl: './resultado-page.component.html',
  styleUrl: './resultado-page.component.css'
})
export class ResultadoPageComponent implements OnInit {

  private _tableroService = inject(TableroService);
  private _activatedRoute = inject(ActivatedRoute);
  resultado: Resultado | null = null;
  id: number | null = null;
  ngOnInit(): void {
    this.verResultado()
  }

  getIdFromRoute() {
    this.id = Number(this._activatedRoute.snapshot.paramMap.get('id'));
    ;
  }

  verResultado(){
    this._tableroService.get(Number(this._tableroService.id_partido)).subscribe({
      next: (data) => {
        this.resultado = data;
      },
      error: (err) => {
        console.error('Error al obtener el resultado del partido:', err);
      }
    });
  }

}
