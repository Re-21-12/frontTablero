
import { Injectable, inject } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class NotifyService {
  private snack = inject(MatSnackBar);

  private baseCfg: MatSnackBarConfig = {
    duration: 2500,
    horizontalPosition: 'right',
    verticalPosition: 'top',
    panelClass: ['snack-base']
  };

  success(msg: string, cfg: MatSnackBarConfig = {}) {
    this.snack.open(msg, 'OK', { ...this.baseCfg, panelClass: ['snack-base','snack-success'], ...cfg });
  }

  error(msg: string, cfg: MatSnackBarConfig = {}) {
    this.snack.open(msg, 'Cerrar', { ...this.baseCfg, panelClass: ['snack-base','snack-error'], ...cfg });
  }

  info(msg: string, cfg: MatSnackBarConfig = {}) {
    this.snack.open(msg, 'OK', { ...this.baseCfg, panelClass: ['snack-base','snack-info'], ...cfg });
  }
}
