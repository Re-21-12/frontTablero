import { Component, OnDestroy } from '@angular/core';
import { Router, RouterLink, RouterOutlet, RouterLinkActive } from '@angular/router';
import { NavigationEnd } from '@angular/router';
import { filter, Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnDestroy {
  // Menú responsive (si usas el botón de hamburguesa)
  menuOpen = false;

  private navSub: Subscription;

  constructor(public router: Router) {
    // Cierra el menú al cambiar de ruta
    this.navSub = this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => (this.menuOpen = false));
  }

  ngOnDestroy(): void {
    this.navSub?.unsubscribe();
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(): void {
    this.menuOpen = false;
  }

  // Texto útil para el subtítulo del header, si lo usas
  get currentSection(): string {
    const u = this.router.url || '';
    return u.startsWith('/admin') ? 'Administración' : 'Marcador';
  }
}
