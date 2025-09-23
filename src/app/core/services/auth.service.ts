import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse, RegisterRequest} from '../interfaces/auth-interface';

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
      return this._httpClient.post<LoginResponse>(environment[environment.selectedEnvironment].apiBaseUrl + '/Auth/login', login);
  }
  register(register: RegisterRequest): Observable<string> {
      return this._httpClient.post<string>(environment[environment.selectedEnvironment].apiBaseUrl + '/Auth/register', register);
  }
  saveLoginData(response: LoginResponse): void {
    localStorage.setItem(this.tokenKey, response.token);
    localStorage.setItem(
      this.userKey,
      JSON.stringify({ nombre: response.nombre, rol: response.role?.nombre, exp: Date.now() + response.expiresIn * 60000 })
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this._router.navigate(['/inicio_sesion']);
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
