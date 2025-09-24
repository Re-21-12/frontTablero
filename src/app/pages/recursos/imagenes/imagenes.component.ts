import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ImagenService } from '../../../core/services/imagen.service';
import { ImagenDto } from '../../../core/interfaces/imagen';

@Component({
  standalone: true,
  selector: 'app-imagenes',
  imports: [CommonModule, FormsModule],
  templateUrl: './imagenes.component.html',
  styleUrls: ['./imagenes.component.css']
})
export class ImagenesComponent {
  private svc = inject(ImagenService);

  imagenes = signal<ImagenDto[]>([]);
  cargando = signal(false);
  error = signal<string | null>(null);

  q = signal('');
  formUrl = signal('');

  filtradas = computed(() => {
    const term = this.q().trim().toLowerCase();
    if (!term) return this.imagenes();
    return this.imagenes().filter(i => i.url.toLowerCase().includes(term));
  });

  ngOnInit() { this.load(); }

  load() {
    this.cargando.set(true);
    this.svc.getAll().subscribe({
      next: data => { this.imagenes.set(data); this.cargando.set(false); },
      error: e => { this.error.set('No se pudieron cargar las imágenes'); this.cargando.set(false); console.error(e); }
    });
  }

  guardar() {
    const url = this.formUrl().trim();
    if (!url) return;
    this.cargando.set(true);
    this.svc.create({ url }).subscribe({
      next: _ => { this.formUrl.set(''); this.load(); },
      error: e => { this.error.set('No se pudo crear la imagen'); this.cargando.set(false); console.error(e); }
    });
  }
}
