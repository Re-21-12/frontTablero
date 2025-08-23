import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  template: `
    <header class="wrap">
      <h1>🏀 Tablero</h1>
      <nav>
        <a routerLink="">Marcador</a>
        <a routerLink="admin">Admin</a>
      </nav>
    </header>
    <router-outlet />
  `,
  styles: [`
    .wrap{display:flex;justify-content:space-between;align-items:center;padding:12px 16px;border-bottom:1px solid #eee}
    nav a{margin-right:12px;text-decoration:none}
    nav a:last-child{margin-right:0}
  `]
})
export class AppComponent {}
