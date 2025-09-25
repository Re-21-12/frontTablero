import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EquipoService } from '../../core/services/equipo.service';
import { LocalidadService } from '../../core/services/localidad.service';
import { Equipo, Localidad, Item, Pagina } from '../../core/interfaces/models';
import { NotifyService } from '../shared/notify.service';
import {MatSelectModule} from '@angular/material/select';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
@Component({
  standalone: true,
  selector: 'app-equipos-page',
  imports: [CommonModule, FormsModule, MatSelectModule, MatPaginator],
  templateUrl: './equipos-page.component.html',
  styleUrls: ['./equipos-page.component.css']
})
export class EquiposPageComponent implements OnInit {

  nombre = '';
  idLocalidad?: number;
  idCrud?: number;
  errorNombre = '';
  equipos = signal<Equipo[]>([]);
  localidades = signal<Localidad[]>([]);
  loading = signal(false);
    totalRegistros =signal(0);
    tamanio = 5;
    pagina = 1;
    items = signal<Equipo[]>([]);

  private equipoSvc = inject(EquipoService);
  private locSvc = inject(LocalidadService);
  private notify = inject(NotifyService);

  ngOnInit() {
    this.cargar();
    this.cargarLocalidades();
    this.cargarPagina();
  }

  cargar() {
    this.equipoSvc.getAll().subscribe({
      next: d => this.equipos.set(d),
      error: () => this.notify.error('No se pudieron cargar equipos')
    });
  }

  cargarLocalidades() {
    this.locSvc.getAll().subscribe({
      next: d => {
        console.log(d);
        this.localidades.set(d);
      },
      error: () => this.notify.error('No se pudieron cargar localidades')
    });
  }

  crear() {
    const nombre = this.nombre.trim();
    const id_Localidad = Number(this.idLocalidad);
    if (!nombre) { this.notify.info('Ingresa un nombre de equipo'); return; }
    if (!id_Localidad) { this.notify.info('Selecciona una localidad'); return; }

    this.loading.set(true);
    this.equipoSvc.create({ nombre, id_Localidad: id_Localidad }).subscribe({
      next: () => {
        this.resetForm();
        this.notify.success('Equipo agregado');
        this.cargar();
        this.cargarPagina();
      },
      error: () => this.notify.error('Error al agregar equipo'),
      complete: () => this.loading.set(false)
    });
    
  }

  buscarPorId() {
    const id = Number(this.idCrud);
    if (!id) { this.notify.info('Ingresa un ID'); return; }

    this.loading.set(true);
    this.equipoSvc.getById(id).subscribe({
      next: (e) => {
        this.nombre = e?.nombre ?? '';
        this.idLocalidad = e?.localidad;
        this.notify.info('Equipo cargado en el formulario');
      },
      error: () => this.notify.error('No se encontró el equipo'),
      complete: () => this.loading.set(false)
    });
  }

  editar() {
    const id_Equipo = Number(this.idCrud);
    const nombre = this.nombre.trim();
    const id = Number(this.idLocalidad);

    if (!id_Equipo) { this.notify.info('Ingresa el ID a editar'); return; }
    if (!nombre) { this.notify.info('Ingresa el nombre'); return; }
    if (!id) { this.notify.info('Selecciona una localidad'); return; }

    this.loading.set(true);
    this.equipoSvc.update({ id_Equipo, nombre, id_Localidad: id }).subscribe({
      next: () => {
        this.notify.success('Equipo actualizado');
        this.resetForm();
        this.cargar();
      },
      error: () => this.notify.error('Error al actualizar equipo'),
      complete: () => this.loading.set(false)
    });
  }

  borrarPorId() {
    const id = Number(this.idCrud);
    if (!id) { this.notify.info('Ingresa el ID a borrar'); return; }
    if (!confirm(`¿Eliminar el equipo #${id}?`)) return;

    this.loading.set(true);
    this.equipoSvc.delete(id).subscribe({
      next: () => {
        this.notify.success('Equipo eliminado');
        this.resetForm(true);
        this.cargar();
      },
      error: () => this.notify.error('Error al eliminar equipo'),
      complete: () => this.loading.set(false)
    });
  }

  borrarDesdeLista(e: Equipo) {
    if (!e.id_Equipo) return;
    if (!confirm(`¿Eliminar el equipo #${e.id_Equipo}?`)) return;

    this.equipoSvc.delete(e.id_Equipo).subscribe({
      next: () => this.cargar(),
      error: () => this.notify.error('No se pudo eliminar')
    });
  }

  private resetForm(keepId = false) {
    this.nombre = '';
    this.idLocalidad = undefined;
    if (!keepId) this.idCrud = undefined;
  }

  validarNombre(valor: string) {

    if (!valor.trim()) {
      this.errorNombre = 'El nombre no puede estar vacío.';
      this.notify.error(this.errorNombre);
    } else if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(valor)) {
      this.errorNombre = 'El nombre solo puede contener letras y espacios.';
      this.notify.error(this.errorNombre);
    } else {
      this.errorNombre = '';

    }
  }
  
    cambiarPagina(event: PageEvent) {
    this.pagina = event.pageIndex + 1; 
    this.tamanio = event.pageSize;
    this.cargarPagina();
  }
  cargarPagina() {
    this.equipoSvc.getPaginado(this.pagina, this.tamanio)
      .subscribe((res: Pagina<Equipo>) => {
        this.items.set(res.items);             
        this.totalRegistros.set(res.totalRegistros);
      });
   
  }
}
