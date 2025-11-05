import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { EmailItem, EmailResponse, SendEmailRequest } from '../interfaces/models';
import { Observable } from 'rxjs';


@Injectable({ providedIn: 'root' })
export class EmailService {
  private http = inject(HttpClient);
  private base = `${environment.dev.apiBaseUrl}/email`; 


  //  POST /api/email/send
  send(req: SendEmailRequest): Observable<EmailResponse> {
    return this.http.post<EmailResponse>(`${this.base}/send`, req);
  }

  //  POST /api/email/drafts  (crear borrador)
  createDraft(req: SendEmailRequest): Observable<{ success: boolean; id: number }> {
    return this.http.post<{ success: boolean; id: number }>(`${this.base}/drafts`, req);
  }

  //  PUT /api/email/drafts/{id} (editar borrador)
  updateDraft(id: number, req: SendEmailRequest): Observable<{ success: boolean }> {
    return this.http.put<{ success: boolean }>(`${this.base}/drafts/${id}`, req);
  }

  //  GET /api/email (listar)
  list(status?: string, limit = 50, offset = 0): Observable<EmailItem[]> {
    let params = new HttpParams().set('limit', limit).set('offset', offset);
    if (status) params = params.set('status', status);
    return this.http.get<EmailItem[]>(`${this.base}`, { params });
  }

  //  GET /api/email/{id}
  getById(id: number): Observable<EmailItem> {
    return this.http.get<EmailItem>(`${this.base}/${id}`);
  }

  // DELETE /api/email/{id}
  delete(id: number): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(`${this.base}/${id}`);
  }
}
