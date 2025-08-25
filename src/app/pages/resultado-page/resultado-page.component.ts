import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableroService } from '../../core/services/tablero.service';
import { Resultado } from '../../core/models';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-resultado-page',
  imports: [CommonModule],
  templateUrl: './resultado-page.component.html',
  styleUrls: ['./resultado-page.component.css'] 
})
export class ResultadoPageComponent implements OnInit {
  private _tableroService = inject(TableroService);
  private _activatedRoute = inject(ActivatedRoute);
  private _router = inject(Router);

  resultado: Resultado | null = null;
  id: number | null = null;


  private readonly st: any = history.state ?? {};

  ngOnInit(): void {
    this.verResultado();
  }

  getIdFromRoute() {
    this.id = Number(this._activatedRoute.snapshot.paramMap.get('id'));
  }

  verResultado(){
   
    this._tableroService.get(Number(this._tableroService.id_partido)).subscribe({
      next: (data) => { this.resultado = data; },
      error: (err) => { console.error('Error al obtener el resultado del partido:', err); }
    });
  }

  // ---------- GETTERS PARA LA VISTA ----------
  // Localidad
  get locNombre(): string {
    return this.st?.locNombre
        ?? (this.resultado as any)?.localidad?.nombre
        ?? (this.resultado as any)?.partido?.localidad?.nombre
        ?? '';
  }

  // Nombres de equipos
  get localNombre(): string {
    return this.st?.local?.nombre
        ?? (this.resultado as any)?.local?.nombre
        ?? (this.resultado as any)?.equipoLocal?.nombre
        ?? 'Local';
  }
  get visitNombre(): string {
    return this.st?.visit?.nombre
        ?? (this.resultado as any)?.visitante?.nombre
        ?? (this.resultado as any)?.equipoVisitante?.nombre
        ?? 'Visitante';
  }

  // Puntos totales (prioriza los enviados desde Home)
  get puntosLocal(): number {
    return Number(
      this.st?.local?.puntos
      ?? (this.resultado as any)?.marcador?.local
      ?? (this.resultado as any)?.totalLocal
      ?? (this.resultado as any)?.puntosLocal
      ?? 0
    );
  }
  get puntosVisit(): number {
    return Number(
      this.st?.visit?.puntos
      ?? (this.resultado as any)?.marcador?.visit
      ?? (this.resultado as any)?.totalVisitante
      ?? (this.resultado as any)?.puntosVisitante
      ?? 0
    );
  }

  // Faltas totales
  get faltasLocal(): number {
    return Number(
      this.st?.local?.faltas
      ?? (this.resultado as any)?.faltas?.local
      ?? (this.resultado as any)?.totalFaltasLocal
      ?? 0
    );
  }
  get faltasVisit(): number {
    return Number(
      this.st?.visit?.faltas
      ?? (this.resultado as any)?.faltas?.visit
      ?? (this.resultado as any)?.totalFaltasVisitante
      ?? 0
    );
  }
}
