import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-recursos-page',
  imports: [CommonModule, RouterOutlet],
  template: `
    <section style="padding:16px">
      <h2>Recursos</h2>
      <router-outlet />
    </section>
  `
})
export class RecursosPageComponent {}
