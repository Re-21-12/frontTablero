import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableroFacade } from '../../core/tablero.facade';
import { Cuarto, Itabler } from '../../core/models';
import { TableroService } from '../../core/services/tablero.service';
import { LocalidadService } from '../../core/services/localidad.service';
import { CuartoService } from '../../core/services/cuarto.service';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-home-page',
  imports: [CommonModule, FormsModule],
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css']
})
export class HomePageComponent implements OnInit {
  private _tableroService = inject(TableroService);
  private _localidadService = inject(LocalidadService);
  private _cuartoService = inject(CuartoService);
  private _routerService = inject(Router);

  constructor(private facade: TableroFacade) {}
  Math: any;

  ngOnInit(): void {
    this.getLocalidad();
    this._assignTimeoutsForPeriod();        // TM correctos desde inicio
    this.shotReset(24);                      // Shot listo
    this._possession.set('none');            // Posesión arranca en NONE
  }

  /* =========================
   *  ESTADO PRINCIPAL
   * ========================= */
  scoreLocal = signal(0);
  foulsLocal = signal(0);
  scoreVisit = signal(0);
  foulsVisit = signal(0);
  quarter = signal(1);

  timerSeconds = signal(10 * 60);
  running = signal(false);
  private _handler?: number;
  private _periodEndLock = false;            // <- evita doble avance al llegar a 0

  locNombre = '';
  equipoLocalNombre = '';
  equipoVisitNombre = '';
  fechaHoraLocal = '';

  cuartos = [
    { no_Cuarto:1, total_Punteo:0, total_Faltas:0, duenio:'l' },
    { no_Cuarto:2, total_Punteo:0, total_Faltas:0, duenio:'v' },
    { no_Cuarto:3, total_Punteo:0, total_Faltas:0, duenio:'l' },
    { no_Cuarto:4, total_Punteo:0, total_Faltas:0, duenio:'v' },
  ];

  msg = '';

  /* ========= Marcador ========= */
  addLocal(n: number){ this.scoreLocal.set(Math.max(0, this.scoreLocal() + n)); }
  addVisit(n: number){ this.scoreVisit.set(Math.max(0, this.scoreVisit() + n)); }

  /* Falta + / - con métodos (más confiable que repetir expresiones en template) */
addFoulLocal(){ this.foulsLocal.set(this.foulsLocal() + 1); }
subFoulLocal(){ this.foulsLocal.set(Math.max(0, this.foulsLocal() - 1)); }
addFoulVisit(){ this.foulsVisit.set(this.foulsVisit() + 1); }
subFoulVisit(){ this.foulsVisit.set(Math.max(0, this.foulsVisit() - 1)); }


  getLocalidad(){
    const s = this._tableroService.getEquiposSeleccionados() ?? [];
    const localidadId = s[0]?.id_Localidad;
    if (localidadId) {
      this._localidadService.get(localidadId).subscribe(loc => this.locNombre = loc.nombre);
    }
    this.equipoLocalNombre = s[0]?.nombre ?? '';
    this.equipoVisitNombre = s[1]?.nombre ?? '';
  }

  createCuarto(id_Equipo: number, totalFaltas: number, totalPunteo: number){
    const cuarto: Cuarto = {
      no_Cuarto: this.quarter(),
      total_Faltas: totalFaltas,
      total_Punteo: totalPunteo,
      id_Partido: Number(this._tableroService.id_partido),
      id_Equipo
    };
    this._cuartoService.create(cuarto).subscribe({
      next: (id) => console.log('Cuarto creado con ID:', id),
      error: (err) => console.error('Error al crear cuarto:', err)
    });
  }

  /* =========================
   *     JUEGO / CRONÓMETRO
   * ========================= */
  start(){
    if (this.running()) return;
    this.running.set(true);
    this._periodEndLock = false;

    // Si quieres que el shot corra junto al juego, descomenta:
    // if (!this._shotRunning()) this.shotStart();

    this._handler = window.setInterval(() => {
      const t = this.timerSeconds() - 1;
      // garantizamos que muestre 00:00
      this.timerSeconds.set(t >= 0 ? t : 0);

      if (t <= 0 && !this._periodEndLock) {
        this._periodEndLock = true;
        this.beep();
        this.pause();              // detiene cronos
        this._handleEndOfPeriod(); // avanza periodo automáticamente
      }
    }, 1000);
  }

  pause(){
    this.running.set(false);
    if (this._handler !== undefined) { clearInterval(this._handler); this._handler = undefined; }
    // Si decidiste ligar el shot al juego, también páralo:
    // this.shotPause();
  }

  finish(){ this._routerService.navigate(['/resultado']); }

  reset(){
    this.pause();
    this.timerSeconds.set(10 * 60);
    this._periodEndLock = false;
  }

  /* Avance de periodo manual (botón) */
  nextQuarter(){
    this._saveQuarterStatsAndAdvance();
  }

  /* Avance de periodo automático cuando llega a 00:00 */
  private _handleEndOfPeriod(){
    this._saveQuarterStatsAndAdvance();
  }

  /* Guarda las stats del periodo actual y avanza según FIBA */
  private _saveQuarterStatsAndAdvance(){
    const s = this._tableroService.getEquiposSeleccionados() ?? [];
    this.createCuarto(s[0]?.id_Equipo ?? 0, this.foulsLocal(), this.scoreLocal());
    this.createCuarto(s[1]?.id_Equipo ?? 0, this.foulsVisit(), this.scoreVisit());

    if (this.quarter() < 4){
      this.quarter.set(this.quarter() + 1);
      this.timerSeconds.set(10 * 60);
    } else {
      // Prórroga (5:00)
      this.quarter.set(this.quarter() + 1);
      this.timerSeconds.set(5 * 60);
    }

    // Reset de faltas por periodo/OT, TMs, shot y posesión si quieres
    this.foulsLocal.set(0);
    this.foulsVisit.set(0);
    this._assignTimeoutsForPeriod();
    this.shotReset(24);
    // this._possession.set('none'); // si quieres limpiar posesión al cambiar de periodo

    this._periodEndLock = false;
  }

  clearValues(){
    this.foulsLocal.set(0);
    this.foulsVisit.set(0);
    this.scoreLocal.set(0);
    this.scoreVisit.set(0);
  }

  hardReset(){
    this.pause();
    this.scoreLocal.set(0); this.scoreVisit.set(0);
    this.foulsLocal.set(0); this.foulsVisit.set(0);
    this.quarter.set(1);
    this.timerSeconds.set(10 * 60);
    this.msg = '';

    this._assignTimeoutsForPeriod();
    this._possession.set('none');
    this.shotPause(); this.shotReset(24);
    this._backcourtStop();
    this._periodEndLock = false;
  }

  mmSS(s:number){
    const m = Math.floor(s/60).toString().padStart(2,'0');
    const ss = (s%60).toString().padStart(2,'0');
    return `${m}:${ss}`;
  }

  beep(){
    try{
      const ctx=new (window as any).AudioContext();
      const o=ctx.createOscillator(); o.type='sine'; o.frequency.value=880;
      o.connect(ctx.destination); o.start();
      setTimeout(()=>{o.stop();ctx.close();}, 350);
    }catch{}
  }

  finalizarGuardar(){
    if (!this.locNombre.trim() || !this.equipoLocalNombre.trim() || !this.equipoVisitNombre.trim() || !this.fechaHoraLocal) {
      this.msg = 'Completa Localidad, equipos y la fecha/hora.';
      return;
    }
    const payload: Itabler = {
      localidad: { id_Localidad: 0, nombre: this.locNombre.trim() },
      local:     { id_Equipo:0, nombre: this.equipoLocalNombre.trim(), id_Localidad:0, localidad: { id_Localidad:0, nombre: this.locNombre.trim() } },
      visitante: { id_Equipo:0, nombre: this.equipoVisitNombre.trim(), id_Localidad:0, localidad: { id_Localidad:0, nombre: this.locNombre.trim() } },
      partido:   { fechaHora: new Date(this.fechaHoraLocal), id_Localidad: 0, id_Local: 0, id_Visitante: 0 },
      cuartos: this.cuartos.map(q => ({
        id_Cuarto: 0, no_Cuarto: q.no_Cuarto, total_Punteo: Number(q.total_Punteo)||0,
        total_Faltas: Number(q.total_Faltas)||0, id_Partido: 0, id_Equipo: 0, duenio: q.duenio
      }))
    };
    this.msg = 'Guardando...';
    this.facade.save(payload).subscribe({
      next: () => this.msg = 'Partido y cuartos guardados',
      error: (e) => this.msg = 'Error: ' + (e?.message ?? e)
    });
  }

  /* ===========================================================
   *     FIBA: Tiempos muertos / Posesión / Shot / 8s
   * =========================================================== */

  /* ------ Tiempos muertos ------ */
  private _timeoutsLocal = signal(2);
  private _timeoutsVisit = signal(2);
  private _timeoutsUsedInLast2minLocal = signal(0);
  private _timeoutsUsedInLast2minVisit = signal(0);

  timeoutsLocal(){ return this._timeoutsLocal(); }
  timeoutsVisit(){ return this._timeoutsVisit(); }

  private _inLastTwoMinutes(): boolean {
    return this.quarter() === 4 && this.timerSeconds() <= 120;
  }

  canTimeout(side:'local'|'visit'){
    if (side === 'local'){
      if (this._inLastTwoMinutes() && this._timeoutsUsedInLast2minLocal() >= 2) return false;
      return this._timeoutsLocal() > 0;
    } else {
      if (this._inLastTwoMinutes() && this._timeoutsUsedInLast2minVisit() >= 2) return false;
      return this._timeoutsVisit() > 0;
    }
  }

  takeTimeout(side:'local'|'visit'){
    if (!this.canTimeout(side)) return;
    this.pause();
    if (side === 'local'){
      this._timeoutsLocal.set(this._timeoutsLocal() - 1);
      if (this._inLastTwoMinutes()){
        this._timeoutsUsedInLast2minLocal.set(this._timeoutsUsedInLast2minLocal()+1);
      }
    } else {
      this._timeoutsVisit.set(this._timeoutsVisit() - 1);
      if (this._inLastTwoMinutes()){
        this._timeoutsUsedInLast2minVisit.set(this._timeoutsUsedInLast2minVisit()+1);
      }
    }
  }

  private _assignTimeoutsForPeriod(){
    if (this.quarter() <= 2) {
      this._timeoutsLocal.set(2); this._timeoutsVisit.set(2);
      this._timeoutsUsedInLast2minLocal.set(0); this._timeoutsUsedInLast2minVisit.set(0);
    } else if (this.quarter() <= 4) {
      this._timeoutsLocal.set(3); this._timeoutsVisit.set(3);
      this._timeoutsUsedInLast2minLocal.set(0); this._timeoutsUsedInLast2minVisit.set(0);
    } else {
      this._timeoutsLocal.set(1); this._timeoutsVisit.set(1);
      this._timeoutsUsedInLast2minLocal.set(0); this._timeoutsUsedInLast2minVisit.set(0);
    }
  }

  /* ------ Posesión (local | visit | none) ------ */
  private _possession = signal<'local'|'visit'|'none'>('none');

  possession(){ return this._possession(); }
  setPossession(side:'local'|'visit'){ this._possession.set(side); }
  clearPossession(){ this._possession.set('none'); }

  possessionIsLeftOn(){ return this._possession() === 'local'; }
  possessionIsRightOn(){ return this._possession() === 'visit'; }
  possessionLabel(){
    const p = this._possession();
    return p === 'local' ? 'Local' : p === 'visit' ? 'Visitante' : 'None';
  }

  changePossession(){
    this.shotReset(24);
    if (this._possession() === 'local') this._possession.set('visit');
    else if (this._possession() === 'visit') this._possession.set('local');
  }

  /* ------ Shot clock 24/14 ------ */
  private _shot = signal(24);
  private _shotRunningFlag = signal(false);
  private _shotHandler?: number;

  shotClock(){ return this._shot(); }
  shotRunning(){ return this._shotRunning(); }
  private _shotRunning(){ return this._shotRunningFlag(); }

  shotStart(){
    if (this._shotRunning()) return;
    this._shotRunningFlag.set(true);
    this._shotHandler = window.setInterval(() => {
      const v = this._shot() - 1;
      this._shot.set(Math.max(0, v));
      if (v <= 0){
        this.beep();
        this.shotPause();
        // si quieres, pausa también el juego al violar 24s:
        // this.pause();
      }
    }, 1000);
  }

  shotPause(){
    this._shotRunningFlag.set(false);
    if (this._shotHandler !== undefined) { clearInterval(this._shotHandler); this._shotHandler = undefined; }
  }

  shotReset(to: 24|14){ this._shot.set(to); }

  /* ------ 8 segundos backcourt (opcional) ------ */
  private _backcourt = signal<number|null>(null);
  private _backcourtHandler?: number;

  showBackcourt8(){ return this._backcourt() !== null; }
  backcourtSeconds(){ return this._backcourt() ?? 0; }

  startBackcourt8(){
    if (this._backcourtHandler !== undefined) { clearInterval(this._backcourtHandler); this._backcourtHandler = undefined; }
    this._backcourt.set(8);
    this._backcourtHandler = window.setInterval(() => {
      const val = this._backcourt();
      if (val === null) { this._backcourtStop(); return; }
      const v = val - 1;
      this._backcourt.set(v >= 0 ? v : 0);
      if (v <= 0) { this.beep(); this._backcourtStop(); }
    }, 1000);
  }

  crossedMidcourt(){ this._backcourtStop(); }

  private _backcourtStop(){
    if (this._backcourtHandler !== undefined) { clearInterval(this._backcourtHandler); this._backcourtHandler = undefined; }
    this._backcourt.set(null);
  }
}
