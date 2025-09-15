import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'frontTablero';

  // Signals para el estado
  isDarkMode = signal(true);
  sidebarOpen = signal(false);

  constructor(public router: Router) {}

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
