import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { ImportarService } from '../../../core/services/importar.service'; // <-- ruta ajustada
import { ImportResponse } from './importar.model';

@Component({
  selector: 'app-importar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './importar.component.html',
  styleUrls: ['./importar.component.css'],
})
export class ImportarComponent {
  form: FormGroup;
  file?: File;
  loading = false;
  result?: ImportResponse;
  error?: string;

  tipos = [
    { key: 'equipo', label: 'Equipo' },
    { key: 'jugador', label: 'Jugador' },
    { key: 'localidad', label: 'Localidad' },
    { key: 'partido', label: 'Partido' },
  ];

  constructor(
    private fb: FormBuilder,
    private svc: ImportarService,
  ) {
    this.form = this.fb.group({
      tipo: ['equipo', Validators.required],
      formato: ['csv', Validators.required],
    });
  }

  onFileChange(ev: Event) {
    const input = ev.target as HTMLInputElement;
    if (input.files && input.files.length) {
      this.file = input.files[0];
      this.error = undefined;
    } else {
      this.file = undefined;
    }
  }

  async submit() {
    if (!this.file) {
      this.error = 'Selecciona un archivo.';
      return;
    }
    const tipo = this.form.get('tipo')!.value;
    const formato = this.form.get('formato')!.value;
    const isCsv = formato === 'csv';

    this.loading = true;
    this.result = undefined;
    this.error = undefined;

    try {
      this.result = await firstValueFrom(
        this.svc.import(tipo, isCsv, this.file),
      );
    } catch (err: any) {
      this.error =
        err?.error?.message ?? err?.message ?? 'Error en la importación';
    } finally {
      this.loading = false;
    }
  }

  reset() {
    this.form.reset({ tipo: 'equipo', formato: 'csv' });
    this.file = undefined;
    this.result = undefined;
    this.error = undefined;
  }
}
