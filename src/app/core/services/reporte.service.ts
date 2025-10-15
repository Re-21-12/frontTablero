import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ReporteService {
  private http = inject(HttpClient);
  private api = environment[environment.selectedEnvironment].apiBaseUrl;

  /** ==== Endpoints de reportería ==== */

  reportePartidos(): Observable<HttpResponse<Blob>> {
    return this.http.get(`${this.api}/Partido/reporte`, {
      responseType: 'blob',
      observe: 'response'
    });
  }


  reporteRosterPartido(id_partido: number) {
  return this.http.get(`${this.api}/partido/reporte/roster`, {
    params: { id_partido },
    responseType: 'blob',
    observe: 'response'
  });
}

  reporteEstadisticasJugador(id_jugador: number): Observable<HttpResponse<Blob>> {
    return this.http.get(`${this.api}/Jugador/Reporte/EstadisticasJugador`, {
      params: { id_jugador },
      responseType: 'blob',
      observe: 'response'
    });
  }

  reporteEquipos(): Observable<HttpResponse<Blob>> {
    return this.http.get(`${this.api}/Equipo/reporte`, {
      responseType: 'blob',
      observe: 'response'
    });
  }
  /** ==== Métodos de descarga de reportes ==== */

  descargarReportePartidos() {
    return this.reportePartidos().pipe(
      tap(res => this.descargar(res, `reporte_partidos_${hoy()}.pdf`))
    );
  }

  descargarReporteRosterPartido(id_partido: number) {
  return this.reporteRosterPartido(id_partido).pipe(
    tap(res => this.descargar(res, `reporte_roster_${id_partido}_${new Date().toISOString().slice(0,10)}.pdf`))
  );
}
  descargarReporteEstadisticasJugador(id_jugador: number) {
    return this.reporteEstadisticasJugador(id_jugador).pipe(
      tap(res => this.descargar(res, `reporte_jugador_${id_jugador}_${hoy()}.pdf`))
    );
  }

  descargarReporteEquipos() {
    return this.reporteEquipos().pipe(
      tap(res => this.descargar(res, `reporte_equipos_${hoy()}.pdf`))
    );
  }

  private descargar(res: HttpResponse<Blob>, defaultName: string) {
    const cd = res.headers.get('Content-Disposition') || '';
    const m = /filename\*?=(?:UTF-8''|")(.*?)(?:\"|;|$)/i.exec(cd);
    const filename = m ? decodeURIComponent(m[1]) : defaultName;

    const blob = res.body!;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  }
}

function hoy() { return new Date().toISOString().slice(0,10); }
