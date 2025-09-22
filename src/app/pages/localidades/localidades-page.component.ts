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

  localidades = signal<Localidad[]>([]);
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
    this.locService.create({ nombre }).subscribe({
      next: () => { this.locNombre = ''; this.notify.success('Agregado correctamente'); this.cargar(); },
      error: () => this.notify.error('Error al agregar localidad')
    });
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
