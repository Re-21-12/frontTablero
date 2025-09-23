import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LocalidadService } from '../../core/services/localidad.service';
import { Localidad } from '../../core/interfaces/models';
import { NotifyService } from '../shared/notify.service';

@Component({
  standalone: true,
  selector: 'app-localidades-page',
  imports: [CommonModule, FormsModule],
  templateUrl: './localidades-page.component.html',
  styleUrls: ['./localidades-page.component.css']
})
export class LocalidadesPageComponent implements OnInit {

  locNombre = '';
  errorNombre = '';

  idCrud?: number;

  localidades = signal<Localidad[]>([]);
  loading = signal(false);

  private locService = inject(LocalidadService);
  private notify = inject(NotifyService);

  ngOnInit() { this.cargar(); }

  cargar() {
    this.locService.getAll().subscribe({
      next: d => this.localidades.set(d),
      error: () => this.notify.error('No se pudieron cargar localidades')
    });
  }

  crearLocalidad() {
    const nombre = this.locNombre.trim();
    if (!nombre) { this.notify.info('Ingresa un nombre de localidad'); return; }

    this.loading.set(true);
    this.locService.create({ nombre }).subscribe({
      next: () => {
        this.locNombre = '';
        this.notify.success('Agregado correctamente');
        this.cargar();
      },
      error: () => this.notify.error('Error al agregar localidad'),
      complete: () => this.loading.set(false)
    });
  }

  buscarPorId() {
    const id = Number(this.idCrud);
    if (!id) { this.notify.info('Ingresa un ID'); return; }

    this.loading.set(true);
    this.locService.getById(id).subscribe({
      next: (loc) => {
        this.locNombre = loc?.nombre ?? '';
        this.notify.info('Localidad cargada en el formulario');
      },
      error: () => this.notify.error('No se encontró la localidad'),
      complete: () => this.loading.set(false)
    });
  }

  editarLocalidad() {
    const id = Number(this.idCrud);
    const nombre = this.locNombre.trim();
    if (!id) { this.notify.info('Ingresa el ID a editar'); return; }
    if (!nombre) { this.notify.info('Ingresa el nuevo nombre'); return; }

    this.loading.set(true);
    this.locService.update({ id_Localidad: id, nombre }).subscribe({
      next: () => {
        this.notify.success('Actualizado correctamente');
        this.resetForm();
        this.cargar();
      },
      error: () => this.notify.error('Error al actualizar'),
      complete: () => this.loading.set(false)
    });
  }

  borrarPorId() {
    const id = Number(this.idCrud);
    if (!id) { this.notify.info('Ingresa el ID a borrar'); return; }
    if (!confirm(`¿Eliminar la localidad #${id}?`)) return;

    this.loading.set(true);
    this.locService.delete(id).subscribe({
      next: () => {
        this.notify.success('Eliminado');
        this.resetForm(true);
        this.cargar();
      },
      error: () => this.notify.error('Error al eliminar'),
      complete: () => this.loading.set(false)
    });
  }

  borrarDesdeLista(l: Localidad) {
    if (!l.id_Localidad) return;
    if (!confirm(`¿Eliminar la localidad #${l.id_Localidad}?`)) return;
    this.locService.delete(l.id_Localidad).subscribe({
      next: () => this.cargar()
    });
  }

  private resetForm(keepId = false) {
    this.locNombre = '';
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
}
