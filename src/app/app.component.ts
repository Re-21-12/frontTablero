import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { NavigationService } from './core/services/navigation.service';
import { NavigationSection } from './core/interfaces/navigation.interface';
import { GlobalLoaderComponent } from './shared/components/global-loader/global-loader.component';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, GlobalLoaderComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  private readonly _authService = inject(AuthService);
  private readonly _navigationService = inject(NavigationService);
  
  readonly _router = inject(Router);

  title = 'frontTablero';

  // Signals para el estado
  isDarkMode = signal(true);
  sidebarOpen = signal(false);
  navigationSections = signal<NavigationSection[]>([]);

  ngOnInit() {
    this.setInitialTheme();
    this.loadNavigation();


  }

  private loadNavigation() {
    console.log('Cargando navegación...');

    // El NavigationService ya maneja internamente la verificación de autenticación
    const filteredNavigation = this._navigationService.getFilteredNavigation();
    this.navigationSections.set(filteredNavigation);
    console.log('Navegación filtrada:', filteredNavigation);
    if (filteredNavigation.length > 0) {
      console.log('Navegación cargada:', filteredNavigation);
    } else {
      console.log('Sin navegación disponible para el usuario actual');
    }
  }

  private setInitialTheme() {
    const hour = new Date().getHours();
    // Modo oscuro entre 18:00 y 6:00
    const shouldBeDark = hour >= 18 || hour < 6;
    this.isDarkMode.set(shouldBeDark);
    this.applyTheme();
  }

  logout() {
    this._authService.logout();
    this._router.navigate(['/inicio_sesion']);
  }

  toggleTheme() {
    this.isDarkMode.update(current => !current);
    this.applyTheme();
  }

  private applyTheme() {
    const body = document.body;
    if (this.isDarkMode()) {
      body.classList.remove('light-theme');
      body.classList.add('dark-theme');
    } else {
      body.classList.remove('dark-theme');
      body.classList.add('light-theme');
    }
  }

  toggleSidebar() {
    this.sidebarOpen.update(current => !current);
  }

  closeSidebar() {
    this.sidebarOpen.set(false);
  }

  onSidebarClick(event: Event) {
    event.stopPropagation();
  }

  // Métodos auxiliares para la template
  get isAuthenticated(): boolean {
    return this._authService.isAuthenticated();
  }

  // Método para verificar si se debe mostrar el menú de navegación
  get shouldShowNavigation(): boolean {
    return this.isAuthenticated && this.navigationSections().length > 0;
  }

  // Método para obtener el nombre de la sección actual
  getCurrentSectionName(): string {
    const currentUrl = this._router.url;

    if (currentUrl.startsWith('/admin')) {
      return 'Administración';
    } else if (currentUrl.startsWith('/recursos')) {
      return 'Recursos';
    } else if (currentUrl.includes('/tablero') || currentUrl.includes('/resultado')) {
      return 'Marcador';
    } else {
      return 'Marcador';
    }
  }
}
