import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
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
  private sanitizer = inject(DomSanitizer);

  imagenes = signal<ImagenDto[]>([]);
  cargando = signal(false);
  error = signal<string | null>(null);

  q = signal('');
  formUrl = signal('');

  filtradas = computed(() => {
    const term = this.q().trim().toLowerCase();
    if (!term) return this.imagenes().filter(i => this.isValidImageUrl(i.url));
    return this.imagenes().filter(i => this.isValidImageUrl(i.url) && i.url.toLowerCase().includes(term));
  });

  ngOnInit() { this.load(); }

  load() {
    this.cargando.set(true);
    this.error.set(null);
    this.svc.getAll().subscribe({
      next: data => {
        this.imagenes.set(data);
        this.cargando.set(false);
      },
      error: e => {
        this.error.set('No se pudieron cargar las imágenes');
        this.cargando.set(false);
        console.error(e);
      }
    });
  }

  guardar() {
    const url = this.formUrl().trim();
    if (!url) {
      this.error.set('Por favor ingresa una URL válida');
      return;
    }

    // Validación mejorada de URL
    if (!this.isValidImageUrl(url)) {
      this.error.set('La URL debe ser una imagen directa (jpg, png, gif, etc.) y no un enlace de redirección');
      return;
    }

    this.cargando.set(true);
    this.error.set(null);
    this.svc.create({ url }).subscribe({
      next: _ => {
        this.formUrl.set('');
        this.load();
      },
      error: e => {
        this.error.set('No se pudo crear la imagen');
        this.cargando.set(false);
        console.error(e);
      }
    });
  }

  isValidImageUrl(url: string): boolean {
    if (!url || typeof url !== 'string') {
      return false;
    }

    // Verificar que no contenga caracteres CSS o contenido HTML
    if (url.includes('{') || url.includes('}') || url.includes('display:') || url.includes('grid') || url.includes('<')) {
      return false;
    }

    try {
      const validUrl = new URL(url);

      // Solo permitir protocolos HTTP y HTTPS
      if (validUrl.protocol !== 'http:' && validUrl.protocol !== 'https:') {
        return false;
      }

      // Rechazar URLs de redirección conocidas
      const redirectDomains = [
        'google.com',
        'bing.com',
        'yahoo.com',
        'duckduckgo.com',
        'yandex.com',
        't.co',
        'bit.ly',
        'tinyurl.com',
        'short.link'
      ];

      const hostname = validUrl.hostname.toLowerCase();
      const isRedirectUrl = redirectDomains.some(domain =>
        hostname.includes(domain) && (validUrl.pathname.includes('/url') || validUrl.searchParams.has('url'))
      );

      if (isRedirectUrl) {
        return false;
      }

      // Verificar que parezca una URL de imagen directa
      const pathname = validUrl.pathname.toLowerCase();
      const hasImageExtension = /\.(jpg|jpeg|png|gif|webp|svg|bmp|tiff|ico|avif|heic)(\?|$)/i.test(pathname);

      // Servicios conocidos de imágenes que no requieren extensión
      const imageServices = [
        'picsum.photos',
        'via.placeholder.com',
        'images.unsplash.com',
        'source.unsplash.com',
        'cdn.pixabay.com',
        'images.pexels.com',
        'lorempixel.com',
        'placeimg.com',
        'picsum.photos',
        'dummyimage.com'
      ];

      const isImageService = imageServices.some(service => hostname.includes(service));

      return hasImageExtension || isImageService;
    } catch (error) {
      return false;
    }
  }

  sanitizeUrl(url: string): string {
    if (!this.isValidImageUrl(url)) {
      return '';
    }
    return url;
  }

  onImageError(event: any) {
    console.error('Error cargando imagen:', event.target.src);
    // Mostrar una imagen placeholder en caso de error
    event.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjNDQ0Ii8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNiIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlbiBubyBkaXNwb25pYmxlPC90ZXh0Pgo8L3N2Zz4K';
    event.target.alt = 'Imagen no disponible';
    event.target.onerror = null; // Evitar bucle infinito
  }

  onImageLoad(event: any) {
    console.log('Imagen cargada correctamente:', event.target.src);
  }

  // Método helper para mostrar ejemplos de URLs válidas
  getExampleUrls(): string[] {
    return [
      'https://picsum.photos/400/300',
      'https://via.placeholder.com/400x300',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300',
      'https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885_960_720.jpg'
    ];
  }
}
