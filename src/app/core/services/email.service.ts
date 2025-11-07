import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Email {
  id?: number;
  to_addr?: string;
  subject?: string;
  body?: string;
  status?: string;
  created_at?: string;
}

@Injectable({ providedIn: 'root' })
export class MailerService {
  // Ajusta esta URL si tu backend cambia de puerto o dominio
  private readonly baseUrl = 'https://localhost:7146/api/mailer';

  constructor(private http: HttpClient) {}

  /** 🔹 Obtener todos los correos */
  getEmails(): Observable<{ success: boolean; data: Email[] }> {
    return this.http.get<{ success: boolean; data: Email[] }>(this.baseUrl);
  }

  /** 🔹 Obtener un correo por ID */
  getEmailById(id: number): Observable<{ success: boolean; data: Email }> {
    return this.http.get<{ success: boolean; data: Email }>(`${this.baseUrl}/${id}`);
  }

  /** 🔹 Enviar nuevo correo */
  sendEmail(payload: { to: string; subject: string; body: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/send`, payload);
  }

  /** 🔹 Eliminar un correo (opcional) */
  deleteEmail(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}
