import { Component, inject, OnInit, signal } from '@angular/core';
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
  imports: [FormsModule],
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
    this._assignTimeoutsForPeriod();   // TMs correctos desde el inicio
    this.shotReset(24);                // Shot listo
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

  addLocal(n: number){ this.scoreLocal.set(Math.max(0, this.scoreLocal()+n)); }
  addVisit(n: number){ this.scoreVisit.set(Math.max(0, this.scoreVisit()+n)); }

  getLocalidad(){
    const s = this._tableroService.getEquiposSeleccionados();
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
      id_Equipo: id_Equipo
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

    // sincronizar shot clock (si lo usas)
    if (!this._shotRunning()) this.shotStart();

    this._handler = window.setInterval(() => {
      const t = this.timerSeconds() - 1;
      this.timerSeconds.set(Math.max(0, t));
      if (t <= 0) { this.pause(); this.beep(); }
    }, 1000);
  }

  pause(){
    this.running.set(false);
    if (this._handler) { clearInterval(this._handler); this._handler = undefined; }
    this.shotPause(); // pausa shot clock con el juego
  }

  finish(){ this._routerService.navigate(['/resultado']); }

  reset(){
    this.pause();
    this.timerSeconds.set(10 * 60);
  }

  nextQuarter(){
    // Guarda estadística del cuarto actual
    const s = this._tableroService.getEquiposSeleccionados();
    this.createCuarto(s[0]?.id_Equipo ?? 0, this.foulsLocal(), this.scoreLocal());
    this.createCuarto(s[1]?.id_Equipo ?? 0, this.foulsVisit(), this.scoreVisit());

    // Avanza periodo según FIBA (4x10:00; luego OT 5:00)
    if (this.quarter() < 4){
      this.quarter.set(this.quarter() + 1);
      this.reset();
    } else {
      // Prórroga 5:00
      this.quarter.set(this.quarter() + 1);
      this.pause();
      this.timerSeconds.set(5 * 60);
    }

    // FIBA: reinicia faltas de equipo al cambiar de periodo/OT
    this.foulsLocal.set(0);
    this.foulsVisit.set(0);

    // TMs por periodo/OT
    this._assignTimeoutsForPeriod();

    // Shot listo para la nueva posesión
    this.shotReset(24);
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
    this._possession.set('local');     // flecha por defecto
    this.shotPause();
    this.shotReset(24);
    this._backcourtStop();
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
   *         FIBA: Tiempos muertos / Posesión / Shot / 8s
   * =========================================================== */

  /* -------- Tiempos muertos -------- */
  private _timeoutsLocal = signal(2);  // Q1-Q2 -> 2; Q3-Q4 -> 3; OT -> 1
  private _timeoutsVisit = signal(2);
  private _timeoutsUsedInLast2minLocal = signal(0);
  private _timeoutsUsedInLast2minVisit = signal(0);

  timeoutsLocal(){ return this._timeoutsLocal(); }
  timeoutsVisit(){ return this._timeoutsVisit(); }

  private _inLastTwoMinutes(): boolean {
    // Aplica para Q4 cuando quedan <= 120s
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

    // Pausa reloj de juego y shot clock
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
    // 1ª mitad (Q1-Q2) 2 TM; 2ª mitad (Q3-Q4) 3 TM; OT 1 TM
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

  /* -------- Flecha de posesión (local | visit | none) -------- */
  private _possession = signal<'local'|'visit'|'none'>('none');

  possession(){ return this._possession(); }
  setPossession(side:'local'|'visit'){ this._possession.set(side); }
  clearPossession(){ this._possession.set('none'); }

  // helpers para el template (pintar flechas/label)
  possessionIsLeftOn(){ return this._possession() === 'local'; }
  possessionIsRightOn(){ return this._possession() === 'visit'; }
  possessionLabel(){
    const p = this._possession();
    return p === 'local' ? 'Local' : p === 'visit' ? 'Visitante' : 'None';
  }

  changePossession(){
    // Cambio de control → reset 24 y alternar flecha (si no estaba en 'none')
    this.shotReset(24);
    if (this._possession() === 'local') this._possession.set('visit');
    else if (this._possession() === 'visit') this._possession.set('local');
    // si estaba en 'none', no hacemos nada
  }

  /* -------- Shot clock 24/14 -------- */
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
        // Violación 24s: pitar, parar todo
        this.beep();
        this.shotPause();
        this.pause();
      }
    }, 1000);
  }

  shotPause(){
    this._shotRunningFlag.set(false);
    if (this._shotHandler) { clearInterval(this._shotHandler); this._shotHandler = undefined; }
  }

  shotReset(to: 24|14){ this._shot.set(to); }

  /* -------- 8 segundos backcourt (opcional) -------- */
  private _backcourt = signal<number|null>(null); // null = no activo
  private _backcourtHandler?: number;

  showBackcourt8(){ return this._backcourt() !== null; }
  backcourtSeconds(){ return this._backcourt() ?? 0; }

  startBackcourt8(){
    if (this._backcourtHandler) { clearInterval(this._backcourtHandler); this._backcourtHandler = undefined; }
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
    if (this._backcourtHandler) { clearInterval(this._backcourtHandler); this._backcourtHandler = undefined; }
    this._backcourt.set(null);
  }
}
