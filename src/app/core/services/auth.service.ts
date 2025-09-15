import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LoginResponse } from '../interfaces/login-response-interface';
import { Login as LoginRequest } from '../interfaces/login-request-interface';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly _httpClient = inject(HttpClient);
  private readonly _router = inject(Router);

  private tokenKey = 'auth_token';
  private readonly userKey = 'auth_user';


  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }

  login(login: LoginRequest): Observable<LoginResponse> {
      return this._httpClient.post<LoginResponse>(environment.apiBaseUrl + '/auth/login', login);
  }

  saveLoginData(response: LoginResponse): void {
    localStorage.setItem(this.tokenKey, response.token);
    localStorage.setItem(
      this.userKey,
      JSON.stringify({ username: response.username, role: response.role?.name })
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this._router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getToken(): string | null {
    if (!this.isBrowser())
      return null;
    return localStorage.getItem(this.tokenKey);
  }

  getUsername(): string | null {
    return this.getUser()?.username ?? null;
  }

  getRole(): string | null {
    return this.getUser()?.role ?? null;
  }

  private getUser(): { username: string; role: string } | null {
    const raw = localStorage.getItem(this.userKey);
    return raw ? JSON.parse(raw) : null;
  }

}
