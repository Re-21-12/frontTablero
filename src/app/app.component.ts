import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  private readonly _authService = inject(AuthService);
  readonly _router = inject(Router);
  title = 'frontTablero';

  // Signals para el estado
  isDarkMode = signal(true);
  sidebarOpen = signal(false);


  ngOnInit() {
    this.setInitialTheme();
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
    this._router.navigate(['/login']);
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
}
