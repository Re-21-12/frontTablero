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
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  private readonly _authService = inject(AuthService);
  private readonly _navigationService = inject(NavigationService);
  readonly _router = inject(Router);

  title = 'frontTablero';

  isDarkMode = signal(true);
  sidebarOpen = signal(false);
  navigationSections = signal<NavigationSection[]>([]);

  ngOnInit() {
    this.setInitialTheme();
    this.loadNavigation();
  }

  private async loadNavigation() {
    const filtered = await this._navigationService.getFilteredNavigation();

    // Clonamos y normalizamos títulos
    const sections: NavigationSection[] = [...filtered].map(s => ({
      ...s,
      title: (s.title ?? '').trim(),
    }));

    // Buscar "Recursos" robusto
    const findIdx = sections.findIndex(
      s => s.title?.trim().toLowerCase() === 'recursos'
    );

    let recursos: NavigationSection;
    if (findIdx >= 0) {
      recursos = { ...sections[findIdx] };
      sections[findIdx] = recursos;
    } else {
      recursos = { title: 'Recursos', items: [] };
      sections.push(recursos);
    }

    // Inyectar Emails si no existe
    const hasEmails = (recursos.items ?? []).some(i => i.route === '/emails');
    if (!hasEmails) {
      recursos.items = [...(recursos.items ?? []), { label: 'Emails', route: '/emails' }];
    }

    this.navigationSections.set(sections);

    // DEBUG opcional:
    console.log('[NAV] Final:', JSON.parse(JSON.stringify(sections)));
  }

  private setInitialTheme() {
    const hour = new Date().getHours();
    const shouldBeDark = hour >= 18 || hour < 6;
    this.isDarkMode.set(shouldBeDark);
    this.applyTheme();
  }

  logout() {
    this._authService.logout();
    this._router.navigate(['/inicio_sesion']);
  }

  toggleTheme() {
    this.isDarkMode.update(c => !c);
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

  toggleSidebar() { this.sidebarOpen.update(c => !c); }
  closeSidebar() { this.sidebarOpen.set(false); }
  onSidebarClick(e: Event) { e.stopPropagation(); }

  get isAuthenticated(): boolean { return this._authService.isAuthenticated(); }
  get shouldShowNavigation(): boolean { return this.isAuthenticated && this.navigationSections().length > 0; }

  getCurrentSectionName(): string {
    const u = this._router.url;
    if (u.startsWith('/admin')) return 'Administración';
    if (u.startsWith('/recursos')) return 'Recursos';
    if (u.startsWith('/emails')) return 'Emails';
    if (u.includes('/tablero') || u.includes('/resultado')) return 'Marcador';
    return 'Marcador';
  }
}
