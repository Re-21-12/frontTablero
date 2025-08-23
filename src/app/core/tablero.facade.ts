import { Injectable } from '@angular/core';
import { LocalidadService } from './services/localidad.service';
import { EquipoService } from './services/equipo.service';
import { PartidoService } from './services/partido.service';
import { CuartoService } from './services/cuarto.service';
import { Itabler, Localidad, Local, Cuarto } from './models';
import { concatMap, map, of, switchMap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TableroFacade {
  constructor(
    private locSvc: LocalidadService,
    private eqSvc: EquipoService,
    private parSvc: PartidoService,
    private cuaSvc: CuartoService
  ) {}

  save(it: Itabler) {
    const nombreLoc = it.localidad?.nombre?.trim();
    if (!nombreLoc) throw new Error('Localidad.nombre es requerido');

    return this.locSvc.getAll().pipe(
      map(list => list.find(l => l.nombre.toLowerCase() === nombreLoc.toLowerCase())),
      switchMap(found => {
        if (found) return of(found);
        return this.locSvc.create({ nombre: nombreLoc }).pipe(
          switchMap(() => this.locSvc.getAll()),
          map(list => {
            const l = list.find(x => x.nombre.toLowerCase() === nombreLoc.toLowerCase());
            if (!l) throw new Error('No se pudo resolver id_Localidad');
            return l;
          })
        );
      }),
      switchMap((loc: Localidad) => {
        const ensureEquipo = (e: Local) =>
          this.eqSvc.getAll().pipe(
            map(list => list.find(x => x.nombre.toLowerCase() === e.nombre.toLowerCase())),
            switchMap(found => {
              if (found) return of(found);
              return this.eqSvc.create({ nombre: e.nombre, id_Localidad: loc.id_Localidad }).pipe(
                switchMap(() => this.eqSvc.getAll()),
                map(list => {
                  const eq = list.find(x => x.nombre.toLowerCase() === e.nombre.toLowerCase());
                  if (!eq) throw new Error('No se pudo resolver id_Equipo de ' + e.nombre);
                  return eq;
                })
              );
            })
          );

        return ensureEquipo(it.local).pipe(
          concatMap(localTeam =>
            ensureEquipo(it.visitante).pipe(
              map(visitTeam => ({ loc, localTeam, visitTeam }))
            )
          )
        );
      }),
      switchMap(({ loc, localTeam, visitTeam }) => {
        const fechaISO = new Date(it.partido.fechaHora).toISOString();
        const body = {
          fechaHora: fechaISO,
          id_Localidad: loc.id_Localidad,
          id_Local: localTeam.id_Equipo,
          id_Visitante: visitTeam.id_Equipo
        };

 
        return this.parSvc.create(body).pipe(
          switchMap(() => this.parSvc.getAll()),
          map(list => {
            if (!Array.isArray(list) || list.length === 0) {
              throw new Error('No se pudo resolver id_Partido (lista vacía)');
            }
            const getId = (p: any) =>
              Number(p?.id_Partido ?? p?.idPartido ?? p?.Id_Partido ?? 0);

            const pick = [...list].sort((a, b) => getId(b) - getId(a))[0];
            const partidoId = getId(pick);

            if (!partidoId) throw new Error('No se pudo resolver id_Partido');
    
            return { partidoId, localTeam, visitTeam };
          })
        );
      }),
      switchMap(({ partidoId, localTeam, visitTeam }) => {
        const ownerToEquipo = (duenio: string) =>
          duenio?.toLowerCase() === 'l' ? localTeam.id_Equipo : visitTeam.id_Equipo;

        const seq = it.cuartos.reduce((flow, q) => {
          const payload: Omit<Cuarto, 'id_Cuarto'> = {
            no_Cuarto: q.no_Cuarto,
            duenio: q.duenio,
            total_Punteo: q.total_Punteo,
            total_Faltas: q.total_Faltas,
            id_Partido: partidoId,
            id_Equipo: ownerToEquipo(q.duenio)
          } as any;

          return flow.pipe(concatMap(() => this.cuaSvc.create(payload)));
        }, of('start') as any);

        return seq;
      })
    );
  }
}
