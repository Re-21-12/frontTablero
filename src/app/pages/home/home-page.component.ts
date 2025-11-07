import { Component, inject, OnInit, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableroFacade } from '../../core/tablero.facade';
import { Cuarto, Itabler } from '../../core/interfaces/models';
import { TableroService } from '../../core/services/tablero.service';
import { LocalidadService } from '../../core/services/localidad.service';
import { CuartoService } from '../../core/services/cuarto.service';
import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  Router,
} from '@angular/router';
import { SocketService } from '../../core/services/socket.service';
import { NotifyService } from '../shared/notify.service';

type ResultadoState = {
  locNombre: string;
  local: { nombre: string; puntos: number; faltas: number };
  visit: { nombre: string; puntos: number; faltas: number };
};

@Component({
  standalone: true,
  selector: 'app-home-page',
  imports: [CommonModule, FormsModule],
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css'],
})
export class HomePageComponent implements OnInit {
  private _tableroService = inject(TableroService);
  private _localidadService = inject(LocalidadService);
  private _cuartoService = inject(CuartoService);
  private _routerService = inject(Router);
  private socket = inject(SocketService);
  private notify = inject(NotifyService);
  private activatedRoute = inject(ActivatedRouteSnapshot);

  constructor(private facade: TableroFacade) {}
  Math: any;

  ngOnInit(): void {
    this.getLocalidad();
    this._assignTimeoutsForPeriod();
    this.shotReset(24);
    this._possession.set('none');

    // === Precarga de sonidos  ===
    this.sfxStart.src = 'assets/sounds/start.mp3';
    this.sfxEnd.src = 'assets/sounds/end.mp3';
    this.sfxStart.preload = 'auto';
    this.sfxEnd.preload = 'auto';
    this.sfxStart.volume = 0.9;
    this.sfxEnd.volume = 0.9;
    this.sfxStart.load();
    this.sfxEnd.load();
    this.starEmit();
  }
  starEmit() {
    const id: any = this.activatedRoute.params['id'];
    if (id) {
      this.socket.on(`partido`, `${id}`, (data) => {
        this.notify.info(`Partido actualizado: ${data}`);
      });
    }
  }
  // ===== Estado =====
  scoreLocal = signal(0);
  foulsLocal = signal(0);
  scoreVisit = signal(0);
  foulsVisit = signal(0);
  quarter = signal(1);

  timerSeconds = signal(10 * 60);
  running = signal(false);
  private _handler?: number;
  private _periodEndLock = false;

  winnerMsg = signal<string | null>(null);

  locNombre = '';
  equipoLocalNombre = '';
  equipoVisitNombre = '';
  fechaHoraLocal = '';

  cuartos = [
    { no_Cuarto: 1, total_Punteo: 0, total_Faltas: 0, duenio: 'l' },
    { no_Cuarto: 2, total_Punteo: 0, total_Faltas: 0, duenio: 'v' },
    { no_Cuarto: 3, total_Punteo: 0, total_Faltas: 0, duenio: 'l' },
    { no_Cuarto: 4, total_Punteo: 0, total_Faltas: 0, duenio: 'v' },
  ];

  msg = '';

  // ===== Ayuda =====
  helpOpen = signal(false);
  toggleHelp() {
    this.helpOpen.set(!this.helpOpen());
  }

  // ===== Habilitadores =====
  teamsSelected(): boolean {
    return !!(this.equipoLocalNombre?.trim() && this.equipoVisitNombre?.trim());
  }
  canOperate(): boolean {
    return this.running();
  }
  canStart(): boolean {
    return this.teamsSelected() && !this.running();
  }

  // ===== Marcador =====
  addLocal(n: number) {
    if (!this.canOperate()) return;
    this.scoreLocal.set(Math.max(0, this.scoreLocal() + n));
  }
  addVisit(n: number) {
    if (!this.canOperate()) return;
    this.scoreVisit.set(Math.max(0, this.scoreVisit() + n));
  }

  addFoulLocal() {
    if (!this.canOperate()) return;
    this.foulsLocal.set(this.foulsLocal() + 1);
  }
  subFoulLocal() {
    if (!this.canOperate()) return;
    this.foulsLocal.set(Math.max(0, this.foulsLocal() - 1));
  }
  addFoulVisit() {
    if (!this.canOperate()) return;
    this.foulsVisit.set(this.foulsVisit() + 1);
  }
  subFoulVisit() {
    if (!this.canOperate()) return;
    this.foulsVisit.set(Math.max(0, this.foulsVisit() - 1));
  }

  getLocalidad() {
    const s = this._tableroService.getEquiposSeleccionados() ?? [];
    const localidadId = s[0]?.id_localidad;
    if (localidadId) {
      this._localidadService
        .get(localidadId)
        .subscribe((loc) => (this.locNombre = loc.nombre));
    }
    this.equipoLocalNombre = s[0]?.nombre ?? '';
    this.equipoVisitNombre = s[1]?.nombre ?? '';
  }

  createCuarto(id_Equipo: number, totalFaltas: number, totalPunteo: number) {
    const cuarto: Cuarto = {
      no_Cuarto: this.quarter(),
      total_Faltas: totalFaltas,
      total_Punteo: totalPunteo,
      id_Partido: Number(this._tableroService.id_partido),
      id_Equipo,
    };
    this._cuartoService.create(cuarto).subscribe({
      next: (id) => console.log('Cuarto creado con ID:', id),
      error: (err) => console.error('Error al crear cuarto:', err),
    });
  }

  // ====== SFX ======
  private sfxStart = new Audio();
  private sfxEnd = new Audio();
  private audioUnlocked = false;

  private playSfx(a: HTMLAudioElement) {
    try {
      a.currentTime = 0;
      void a.play();
    } catch {}
  }

  @HostListener('document:click')
  @HostListener('document:keydown')
  _unlockAudioOnce() {
    if (this.audioUnlocked) return;
    this.audioUnlocked = true;

    const warmup = async (el: HTMLAudioElement) => {
      try {
        el.muted = true;
        el.currentTime = 0;
        await el.play();
        el.pause();
        el.currentTime = 0;
        el.muted = false;
      } catch {}
    };
    warmup(this.sfxStart);
    warmup(this.sfxEnd);
  }

  // ===== Juego / Cronómetro =====
  start() {
    if (!this.teamsSelected()) {
      this.msg = 'Selecciona equipos (local y visitante) antes de iniciar.';
      return;
    }
    if (this.running()) return;

    this._unlockAudioOnce();

    this.running.set(true);
    this._periodEndLock = false;
    this.winnerMsg.set(null);

    // sonido de inicio
    this.playSfx(this.sfxStart);

    if (!this._shotRunning()) this.shotStart();

    this._handler = window.setInterval(() => {
      const t = this.timerSeconds() - 1;
      this.timerSeconds.set(t >= 0 ? t : 0);

      if (t <= 0 && !this._periodEndLock) {
        this._periodEndLock = true;
        // sonido de fin de periodo
        this.playSfx(this.sfxEnd);
        this.pause();
        this._onTimeExpired();
      }
    }, 1000);
  }

  pause() {
    this.running.set(false);
    if (this._handler !== undefined) {
      clearInterval(this._handler);
      this._handler = undefined;
    }
    this.shotPause();
  }

  // AJUSTADO: enviar datos al resultado
  finish() {
    this.pause();
    this._advancePeriod();

    const state: ResultadoState = {
      locNombre: this.locNombre,
      local: {
        nombre: this.equipoLocalNombre,
        puntos: this.scoreLocal(),
        faltas: this.foulsLocal(),
      },
      visit: {
        nombre: this.equipoVisitNombre,
        puntos: this.scoreVisit(),
        faltas: this.foulsVisit(),
      },
    };

    this._routerService.navigate(['/resultado'], { state });
  }

  reset() {
    this.pause();
    this.timerSeconds.set(10 * 60);
    this._periodEndLock = false;
    this.winnerMsg.set(null);
  }

  prevQuarter() {
    if (this.running()) return;
    if (this.quarter() > 1) {
      this.quarter.set(this.quarter() - 1);
      this.timerSeconds.set(10 * 60);
      this._resetPeriodState();
    }
  }

  nextQuarter() {
    this.winnerMsg.set(null);
    if (this.running()) return;
    this._advancePeriod();
  }

  private _onTimeExpired() {
    if (this.quarter() < 4) {
      this._advancePeriod();
      return;
    }
    const l = this.scoreLocal();
    const v = this.scoreVisit();
    if (l === v) {
      this._startOvertime();
    } else {
      const ganador =
        l > v
          ? this.equipoLocalNombre || 'Local'
          : this.equipoVisitNombre || 'Visitante';
      this.winnerMsg.set(
        `Ganador: ${ganador} (${Math.max(l, v)} - ${Math.min(l, v)})`,
      );
      this._periodEndLock = false;
    }
  }

  private _startOvertime() {
    this._saveQuarterStats();
    this.quarter.set(this.quarter() + 1);
    this.timerSeconds.set(5 * 60);
    this._resetPeriodState();
    this._periodEndLock = false;
  }

  private _advancePeriod() {
    this._saveQuarterStats();
    if (this.quarter() < 4) {
      this.quarter.set(this.quarter() + 1);
      this.timerSeconds.set(10 * 60);
    } else {
      this.quarter.set(this.quarter() + 1);
      this.timerSeconds.set(5 * 60);
    }
    this._resetPeriodState();
    this._periodEndLock = false;
  }

  private _saveQuarterStats() {
    const s = this._tableroService.getEquiposSeleccionados() ?? [];
    this.createCuarto(
      s[0]?.id_Equipo ?? 0,
      this.foulsLocal(),
      this.scoreLocal(),
    );
    this.createCuarto(
      s[1]?.id_Equipo ?? 0,
      this.foulsVisit(),
      this.scoreVisit(),
    );
  }

  private _resetPeriodState() {
    this.foulsLocal.set(0);
    this.foulsVisit.set(0);
    this._assignTimeoutsForPeriod();
    this.shotReset(24);
    this.winnerMsg.set(null);
  }

  clearValues() {
    this.foulsLocal.set(0);
    this.foulsVisit.set(0);
    this.scoreLocal.set(0);
    this.scoreVisit.set(0);
  }

  hardReset() {
    this.pause();
    this.scoreLocal.set(0);
    this.scoreVisit.set(0);
    this.foulsLocal.set(0);
    this.foulsVisit.set(0);
    this.quarter.set(1);
    this.timerSeconds.set(10 * 60);
    this.msg = '';
    this._assignTimeoutsForPeriod();
    this._possession.set('none');
    this.shotPause();
    this.shotReset(24);
    this._backcourtStop();
    this._periodEndLock = false;
    this.winnerMsg.set(null);
  }

  mmSS(s: number) {
    const m = Math.floor(s / 60)
      .toString()
      .padStart(2, '0');
    const ss = (s % 60).toString().padStart(2, '0');
    return `${m}:${ss}`;
  }

  //  beep simple
  beep() {
    try {
      const ctx = new (window as any).AudioContext();
      const o = ctx.createOscillator();
      o.type = 'sine';
      o.frequency.value = 880;
      o.connect(ctx.destination);
      o.start();
      setTimeout(() => {
        o.stop();
        ctx.close();
      }, 350);
    } catch {}
  }

  finalizarGuardar() {
    if (
      !this.locNombre.trim() ||
      !this.equipoLocalNombre.trim() ||
      !this.equipoVisitNombre.trim() ||
      !this.fechaHoraLocal
    ) {
      this.msg = 'Completa Localidad, equipos y la fecha/hora.';
      return;
    }
    const payload: Itabler = {
      localidad: { id: 0, nombre: this.locNombre.trim() },
      local: {
        id_Equipo: 0,
        nombre: this.equipoLocalNombre.trim(),
        id: 0,
        localidad: { id: 0, nombre: this.locNombre.trim() },
      },
      visitante: {
        id_Equipo: 0,
        nombre: this.equipoVisitNombre.trim(),
        id: 0,
        localidad: { id: 0, nombre: this.locNombre.trim() },
      },
      partido: {
        fechaHora: new Date(this.fechaHoraLocal),
        id: 0,
        id_Local: 0,
        id_Visitante: 0,
      },
      cuartos: this.cuartos.map((q) => ({
        id_Cuarto: 0,
        no_Cuarto: q.no_Cuarto,
        total_Punteo: Number(q.total_Punteo) || 0,
        total_Faltas: Number(q.total_Faltas) || 0,
        id_Partido: 0,
        id_Equipo: 0,
        duenio: q.duenio,
      })),
    };
    this.msg = 'Guardando...';
    this.facade.save(payload).subscribe({
      next: () => (this.msg = 'Partido y cuartos guardados'),
      error: (e) => (this.msg = 'Error: ' + (e?.message ?? e)),
    });
  }

  // ===== FIBA: TMs / Posesión / Shot / 8s =====
  private _timeoutsLocal = signal(2);
  private _timeoutsVisit = signal(2);
  private _timeoutsUsedInLast2minLocal = signal(0);
  private _timeoutsUsedInLast2minVisit = signal(0);
  timeoutsLocal() {
    return this._timeoutsLocal();
  }
  timeoutsVisit() {
    return this._timeoutsVisit();
  }

  private _inLastTwoMinutes(): boolean {
    return this.quarter() === 4 && this.timerSeconds() <= 120;
  }

  canTimeout(side: 'local' | 'visit') {
    if (!this.canOperate()) return false;
    if (side === 'local') {
      if (this._inLastTwoMinutes() && this._timeoutsUsedInLast2minLocal() >= 2)
        return false;
      return this._timeoutsLocal() > 0;
    } else {
      if (this._inLastTwoMinutes() && this._timeoutsUsedInLast2minVisit() >= 2)
        return false;
      return this._timeoutsVisit() > 0;
    }
  }

  takeTimeout(side: 'local' | 'visit') {
    if (!this.canTimeout(side)) return;
    this.pause();
    if (side === 'local') {
      this._timeoutsLocal.set(this._timeoutsLocal() - 1);
      if (this._inLastTwoMinutes()) {
        this._timeoutsUsedInLast2minLocal.set(
          this._timeoutsUsedInLast2minLocal() + 1,
        );
      }
    } else {
      this._timeoutsVisit.set(this._timeoutsVisit() - 1);
      if (this._inLastTwoMinutes()) {
        this._timeoutsUsedInLast2minVisit.set(
          this._timeoutsUsedInLast2minVisit() + 1,
        );
      }
    }
  }

  private _assignTimeoutsForPeriod() {
    if (this.quarter() <= 2) {
      this._timeoutsLocal.set(2);
      this._timeoutsVisit.set(2);
      this._timeoutsUsedInLast2minLocal.set(0);
      this._timeoutsUsedInLast2minVisit.set(0);
    } else if (this.quarter() <= 4) {
      this._timeoutsLocal.set(3);
      this._timeoutsVisit.set(3);
      this._timeoutsUsedInLast2minLocal.set(0);
      this._timeoutsUsedInLast2minVisit.set(0);
    } else {
      this._timeoutsLocal.set(1);
      this._timeoutsVisit.set(1);
      this._timeoutsUsedInLast2minLocal.set(0);
      this._timeoutsUsedInLast2minVisit.set(0);
    }
  }

  // Posesión
  private _possession = signal<'local' | 'visit' | 'none'>('none');
  possession() {
    return this._possession();
  }
  setPossession(side: 'local' | 'visit') {
    if (!this.canOperate()) return;
    this._possession.set(side);
  }
  clearPossession() {
    if (!this.canOperate()) return;
    this._possession.set('none');
  }
  possessionIsLeftOn() {
    return this._possession() === 'local';
  }
  possessionIsRightOn() {
    return this._possession() === 'visit';
  }
  possessionLabel() {
    const p = this._possession();
    return p === 'local' ? 'Local' : p === 'visit' ? 'Visitante' : 'None';
  }
  changePossession() {
    if (!this.canOperate()) return;
    this.shotReset(24);
    if (this._possession() === 'local') this._possession.set('visit');
    else if (this._possession() === 'visit') this._possession.set('local');
  }

  // Shot clock
  private _shot = signal(24);
  private _shotRunningFlag = signal(false);
  private _shotHandler?: number;
  shotClock() {
    return this._shot();
  }
  shotRunning() {
    return this._shotRunning();
  }
  private _shotRunning() {
    return this._shotRunningFlag();
  }

  shotStart() {
    if (this._shotRunning()) return;
    this._shotRunningFlag.set(true);
    this._shotHandler = window.setInterval(() => {
      const v = this._shot() - 1;
      this._shot.set(Math.max(0, v));
      if (v <= 0) {
        // this.beep();
        this.shotPause();
      }
    }, 1000);
  }

  shotPause() {
    this._shotRunningFlag.set(false);
    if (this._shotHandler !== undefined) {
      clearInterval(this._shotHandler);
      this._shotHandler = undefined;
    }
  }

  shotReset(to: 24 | 14) {
    this._shot.set(to);
  }
  shot24() {
    if (!this.canOperate()) return;
    this.shotReset(24);
    this.shotStart();
  }

  // 8s backcourt
  private _backcourt = signal<number | null>(null);
  private _backcourtHandler?: number;
  showBackcourt8() {
    return this._backcourt() !== null;
  }
  backcourtSeconds() {
    return this._backcourt() ?? 0;
  }

  startBackcourt8() {
    if (!this.canOperate()) return;
    if (this._backcourtHandler !== undefined) {
      clearInterval(this._backcourtHandler);
      this._backcourtHandler = undefined;
    }
    this._backcourt.set(8);
    this._backcourtHandler = window.setInterval(() => {
      const val = this._backcourt();
      if (val === null) {
        this._backcourtStop();
        return;
      }
      const v = val - 1;
      this._backcourt.set(v >= 0 ? v : 0);
      if (v <= 0) {
        // this.beep();
        this._backcourtStop();
      }
    }, 1000);
  }
  crossedMidcourt() {
    if (!this.canOperate()) return;
    this._backcourtStop();
  }
  private _backcourtStop() {
    if (this._backcourtHandler !== undefined) {
      clearInterval(this._backcourtHandler);
      this._backcourtHandler = undefined;
    }
    this._backcourt.set(null);
  }

  // ========= ATAJOS DE TECLADO =========
  @HostListener('window:keydown', ['$event'])
  handleKeys(e: KeyboardEvent) {
    const k = e.key.toLowerCase();
    const tag = (e.target as HTMLElement)?.tagName;
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) return;
    const prevent = () => {
      e.preventDefault();
      e.stopPropagation();
    };

    if (k === ' ') {
      prevent();
      this.running() ? this.pause() : this.canStart() && this.start();
      return;
    }
    if (k === 'r') {
      prevent();
      this.reset();
      return;
    }
    if (k === 'escape') {
      prevent();
      this.hardReset();
      return;
    }

    if (!this.running()) {
      if (k === 'q') {
        prevent();
        this.prevQuarter();
        return;
      }
      if (k === 'n') {
        prevent();
        this.nextQuarter();
        return;
      }
    }

    if (k === 'c') {
      prevent();
      this.shot24();
      return;
    }
    if (k === 'b') {
      prevent();
      this.startBackcourt8();
      return;
    }
    if (k === 'v') {
      prevent();
      this.crossedMidcourt();
      return;
    }

    if (e.key === 'ArrowLeft') {
      prevent();
      this.setPossession('local');
      return;
    }
    if (e.key === 'ArrowRight') {
      prevent();
      this.setPossession('visit');
      return;
    }
    if (k === 'o') {
      prevent();
      this.clearPossession();
      return;
    }
    if (k === 'p') {
      prevent();
      this.changePossession();
      return;
    }

    if (k === '1') {
      prevent();
      this.addLocal(1);
      return;
    }
    if (k === '2') {
      prevent();
      this.addLocal(2);
      return;
    }
    if (k === '3') {
      prevent();
      this.addLocal(3);
      return;
    }
    if (k === '4') {
      prevent();
      this.addLocal(-1);
      return;
    }

    if (k === '9') {
      prevent();
      this.addVisit(1);
      return;
    }
    if (k === '8') {
      prevent();
      this.addVisit(2);
      return;
    }
    if (k === '7') {
      prevent();
      this.addVisit(3);
      return;
    }
    if (k === '0') {
      prevent();
      this.addVisit(-1);
      return;
    }

    if (k === 'f') {
      prevent();
      this.addFoulLocal();
      return;
    }
    if (k === 'g') {
      prevent();
      this.subFoulLocal();
      return;
    }
    if (k === 'j') {
      prevent();
      this.addFoulVisit();
      return;
    }
    if (k === 'k') {
      prevent();
      this.subFoulVisit();
      return;
    }
  }
}
