import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { JugadorService, Jugador } from '../../core/services/jugador.service';
import { EquipoService } from '../../core/services/equipo.service';

@Component({
  standalone: true,
  selector: 'app-jugadores-page',
  imports: [CommonModule, FormsModule],
  templateUrl: './jugadores-page.component.html',
  styleUrls: ['./jugadores-page.component.css']
})
export class JugadoresPageComponent implements OnInit {

  jugadores = signal<Jugador[]>([]);
  equipos   = signal<{ id_Equipo: number; nombre: string }[]>([]);


  nombre = '';
  apellido = '';
  edad?: number;
  idEquipo?: number;

 
  idCrud?: number;

  loading = signal(false);

  private jugSvc = inject(JugadorService);
  private eqSvc  = inject(EquipoService);

  ngOnInit(): void {
    this.cargarEquipos();
    this.cargarJugadores();
  }

  cargarEquipos()   { this.eqSvc.getAll().subscribe(e => this.equipos.set(e)); }
  cargarJugadores() { this.jugSvc.getAll().subscribe(j => this.jugadores.set(j)); }

  crear() {
    const nombre = this.nombre.trim();
    const apellido = this.apellido.trim();
    const edad = Number(this.edad);
    const id_Equipo = Number(this.idEquipo);

    if (!nombre || !apellido || !edad || !id_Equipo) return;

    const payload: Jugador = { nombre, apellido, edad, id_Equipo };
    this.loading.set(true);
    this.jugSvc.create(payload).subscribe({
      next: () => { this.resetForm(); this.cargarJugadores(); },
      complete: () => this.loading.set(false)
    });
  }


  buscarPorId() {
    const id = Number(this.idCrud);
    if (!id) return;
    this.loading.set(true);
    this.jugSvc.getById(id).subscribe({
      next: (j) => {

        this.nombre   = j.nombre;
        this.apellido = j.apellido;
        this.edad     = j.edad;
        this.idEquipo = j.id_Equipo;
      },
      complete: () => this.loading.set(false)
    });
  }


  editar() {
    const id = Number(this.idCrud);
    if (!id) return;
    const nombre = this.nombre.trim();
    const apellido = this.apellido.trim();
    const edad = Number(this.edad);
    const id_Equipo = Number(this.idEquipo);
    if (!nombre || !apellido || !edad || !id_Equipo) return;

    const payload: Jugador = { id_Jugador: id, nombre, apellido, edad, id_Equipo };
    this.loading.set(true);
    this.jugSvc.update(payload).subscribe({
      next: () => { this.resetForm(); this.cargarJugadores(); },
      complete: () => this.loading.set(false)
    });
  }


  borrarPorId() {
    const id = Number(this.idCrud);
    if (!id) return;
    if (!confirm(`¿Eliminar jugador #${id}?`)) return;

    this.loading.set(true);
    this.jugSvc.delete(id).subscribe({
      next: () => { this.resetForm(true); this.cargarJugadores(); },
      complete: () => this.loading.set(false)
    });
  }


  borrar(j: Jugador) {
    if (!j.id_Jugador) return;
    if (!confirm(`¿Eliminar jugador #${j.id_Jugador}?`)) return;
    this.jugSvc.delete(j.id_Jugador).subscribe(() => this.cargarJugadores());
  }

  private resetForm(keepId = false) {
    this.nombre = '';
    this.apellido = '';
    this.edad = undefined;
    this.idEquipo = undefined;
    if (!keepId) this.idCrud = undefined;
  }
}
