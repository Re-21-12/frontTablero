import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

type UserInfo = {
  nombre: string;
  rol: { id_rol: number; nombre: string } | null;
  permisos: Array<{ id?: number; nombre: string }>;
} | null;

@Component({
  standalone: true,
  selector: 'app-bienvenida-pages',
  imports: [CommonModule],
  templateUrl: './bienvenida-page.component.html',
  styleUrls: ['./bienvenida-page.component.css'],
})
export class BienvenidaPagesComponent implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);

  user = signal<UserInfo>(this.auth.getCurrentUser());

  nombre   = computed(() => this.user()?.nombre ?? 'Usuario');
  rol      = computed(() => this.user()?.rol?.nombre ?? '—');
  permisos = computed(() => this.user()?.permisos ?? []);

  private showAll = signal(false);

  sortedPermisos = computed(() =>
    [...this.permisos()].sort((a, b) => (a?.nombre ?? '').localeCompare(b?.nombre ?? ''))
  );

  permisosVisibles = computed(() => {
    const list = this.sortedPermisos();
    return this.showAll() ? list : list.slice(0, 12);
  });

  restantes = computed(() => Math.max(this.sortedPermisos().length - 12, 0));

  togglePerms(): void {
    if (this.restantes() <= 0) return;
    this.showAll.update(v => !v);
  }

  viendoTodos = computed(() => this.showAll());

  horaSaludo = computed(() => {
    const h = new Date().getHours();
    if (h < 12) return 'Buenos días';
    if (h < 19) return 'Buenas tardes';
    return 'Buenas noches';
  });

  initials = computed(() => {
    const n = (this.nombre() || '').trim().split(/\s+/).slice(0, 2);
    return (n[0]?.[0] ?? '?') + (n[1]?.[0] ?? '');
  });

  puedeAdmin = computed(() =>
    this.auth.hasAnyPermission([
      'Localidad:Consultar',
      'Equipo:Consultar',
      'Partido:Consultar',
      'Jugador:Consultar',
    ])
  );

  ngOnInit(): void {
    if (!this.auth.isAuthenticated()) this.router.navigate(['/inicio_sesion']);
  }

  ir(path: string): void {
    this.router.navigate([path]);
  }

  trackByPerm = (_: number, p: { id?: number; nombre: string }) => p?.id ?? p?.nombre ?? _;
}
