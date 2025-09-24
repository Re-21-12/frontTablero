import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ImagenDto, CreateImagenDto } from '../interfaces/imagen';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ImagenService {
  private http = inject(HttpClient);
  private base = `${environment[environment.selectedEnvironment].apiBaseUrl}/Imagen`;


  getAll(): Observable<ImagenDto[]> {
    return this.http.get<ImagenDto[]>(this.base);
  }

  getById(id: number): Observable<ImagenDto> {
    return this.http.get<ImagenDto>(`${this.base}/${id}`);
  }

  create(data: CreateImagenDto): Observable<ImagenDto> {
    return this.http.post<ImagenDto>(this.base, data);
  }
}
