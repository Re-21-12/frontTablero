import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface EmailRequest {
  to: string;
  subject: string;
  body: string;
}
export interface EmailResponse {
  success: boolean;
  message: string;
  error?: string;
  id?: number;
}
export interface EmailListResponse {
  items: any[];
  total: number;
}

@Injectable({ providedIn: 'root' })
export class EmailService {
  private http = inject(HttpClient);
  private base = `${environment[environment.selectedEnvironment].apiBaseUrl}/Emails`;

  send(data: EmailRequest): Observable<EmailResponse> {
    return this.http.post<EmailResponse>(`${this.base}`, data);
  }
  draft(data: EmailRequest) {
    return this.http.post(`${this.base}/draft`, data);
  }
  sendDraft(id: number) {
    return this.http.post(`${this.base}/${id}/send`, {});
  }
  list(page = 1, size = 20): Observable<EmailListResponse> {
    return this.http.get<EmailListResponse>(`${this.base}`, {
      params: { page, size } as any,
    });
  }
  delete(id: number) {
    return this.http.delete(`${this.base}/${id}`);
  }
}
