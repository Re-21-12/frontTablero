import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { ImportResponse } from '../../pages/recursos/importar/importar.model';

@Injectable({ providedIn: 'root' })
export class ImportarService {
  private base = `${environment[environment.selectedEnvironment].apiBaseUrl}/import`;

  constructor(private http: HttpClient) {}

  import(tipo: string, isCsv: boolean, file: File): Observable<ImportResponse> {
    const url = `${this.base}/${tipo}/${isCsv ? 'csv' : 'json'}`;
    const fd = new FormData();
    fd.append('file', file, file.name);
    return this.http.post<ImportResponse>(url, fd);
  }
}
