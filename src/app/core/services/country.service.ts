import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Pais {
  codigo: string;
  nombre: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaisService {
  private http = inject(HttpClient);

  getPaises(): Observable<Pais[]> {
    // Especificamos los campos que necesitamos: name y cca2
    const url = 'https://restcountries.com/v3.1/all?fields=name,cca2';

    return this.http.get<any[]>(url)
      .pipe(
        map(paises =>
          paises.map(p => ({
            codigo: p.cca2, // Código de 2 letras
            nombre: p.name.common
          })).sort((a, b) => a.nombre.localeCompare(b.nombre))
        )
      );
  }
}
