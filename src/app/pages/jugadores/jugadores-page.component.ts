import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { JugadorService, Jugador } from '../../core/services/jugador.service';
import { EquipoService } from '../../core/services/equipo.service';
import { PaisService } from '../../core/services/country.service';

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
  paises    = signal<{ codigo: string; nombre: string }[]>([]);

  // Campos del formulario
  nombre = '';
  apellido = '';
  estatura?: number;
  posicion = '';
  nacionalidad = '';
  edad?: number;
  idEquipo?: number;

  idCrud?: number;
  loading = signal(false);

  private jugSvc = inject(JugadorService);
  private eqSvc  = inject(EquipoService);
  private paisSvc = inject(PaisService);

  ngOnInit(): void {
    this.cargarEquipos();
    this.cargarJugadores();
    this.cargarPaises();
  }

  cargarEquipos()   { this.eqSvc.getAll().subscribe(e => this.equipos.set(e)); }
  cargarJugadores() { this.jugSvc.getAll().subscribe(j => this.jugadores.set(j)); }
  cargarPaises() { this.paisSvc.getPaises().subscribe((p: any[]) => this.paises.set(p)); }

  crear() {
    const nombre = this.nombre.trim();
    const apellido = this.apellido.trim();
    const estatura = Number(this.estatura);
    const posicion = this.posicion.trim();
    const nacionalidad = this.nacionalidad;
    const edad = Number(this.edad);
    const id_Equipo = Number(this.idEquipo);

    if (!nombre || !apellido || !estatura || !posicion || !nacionalidad || !edad || !id_Equipo) return;

    const payload: Jugador = {
      nombre,
      apellido,
      estatura,
      posicion,
      nacionalidad,
      edad,
      id_Equipo
    };

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
        this.nombre = j.nombre;
        this.apellido = j.apellido;
        this.estatura = j.estatura;
        this.posicion = j.posicion;
        this.nacionalidad = j.nacionalidad;
        this.edad = j.edad;
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
    const estatura = Number(this.estatura);
    const posicion = this.posicion.trim();
    const nacionalidad = this.nacionalidad;
    const edad = Number(this.edad);
    const id_Equipo = Number(this.idEquipo);

    if (!nombre || !apellido || !estatura || !posicion || !nacionalidad || !edad || !id_Equipo) return;

    const payload: Jugador = {
      id_Jugador: id,
      nombre,
      apellido,
      estatura,
      posicion,
      nacionalidad,
      edad,
      id_Equipo
    };

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
    this.estatura = undefined;
    this.posicion = '';
    this.nacionalidad = '';
    this.edad = undefined;
    this.idEquipo = undefined;
    if (!keepId) this.idCrud = undefined;
  }

   validarNombre(valor: string) {

    if (!valor.trim()) {
      this.errorNombre = 'Esto no puede estar vacío.';
      this.notify.error(this.errorNombre);
    } else if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(valor)) {
      this.errorNombre = 'solo puede contener letras y espacios.';
      this.notify.error(this.errorNombre);
    } else {
      this.errorNombre = '';

    }
  }
 
}
