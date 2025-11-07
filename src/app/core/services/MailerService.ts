import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class MailerService {
  private baseUrl = `${environment[environment.selectedEnvironment].apiBaseUrl}/mailer`;

  constructor(private http: HttpClient) {}

  getEmailsPaginated(page: number, pageSize: number): Observable<any> {
    return this.http.get(`${this.baseUrl}?page=${page}&pageSize=${pageSize}`);
  }

  sendEmail(payload: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/send`, payload);
  }

  deleteEmail(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
  createTemplate(payload: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/templates`, payload);
  }

  updateTemplate(id: number, payload: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/templates/${id}`, payload);
  }

  deleteTemplate(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/templates/${id}`);
  }
}
