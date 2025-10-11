import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { LoginRequest } from '../../core/interfaces/auth-interface';
import Keycloak from 'keycloak-js';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  providers: [Keycloak],
})
export class LoginComponent implements OnInit {
  private readonly _fb = inject(FormBuilder);
  private readonly _authService = inject(AuthService);
  private readonly _keycloackService = inject(Keycloak);
  private readonly _router = inject(Router);

  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  showPassword = false;
  useKeycloak = false; // Opción para alternar entre Keycloak y login tradicional

  constructor() {
    this.loginForm = this._fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      contrasena: ['', [Validators.required, Validators.minLength(1)]],
    });
  }

  async ngOnInit(): Promise<void> {
    // Verificar si el usuario ya está autenticado
    await this.checkExistingAuthentication();
  }

  private async checkExistingAuthentication(): Promise<void> {
    try {
      const isFullyAuth = await this._authService.isFullyAuthenticated();
      if (isFullyAuth) {
        this._router.navigate(['/seleccion']);
      }
    } catch (error) {
      console.error('Error al verificar autenticación existente:', error);
    }
  }

  onSubmit(): void {
    if (this.useKeycloak) {
      this.loginWithKeycloak();
    } else {
      this.loginTraditional();
    }
  }

  private async loginWithKeycloak(): Promise<void> {
    try {
      this.isLoading = true;
      this.errorMessage = '';

      await this._authService.hybridLogin();

      // Configurar eventos de Keycloak
      this._keycloackService.login();

      this._router.navigate(['/seleccion']);
    } catch (error) {
      console.error('Error en login con Keycloak:', error);
      this.errorMessage = 'Error al autenticar con Keycloak';
    } finally {
      this.isLoading = false;
    }
  }

  private loginTraditional(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const loginData: LoginRequest = this.loginForm.value;

      this._authService.login(loginData).subscribe({
        next: (response) => {
          this._authService.saveLoginData(response);
          this._router.navigate(['/seleccion']);
          this.isLoading = false;
        },
        error: (error) => {
          this.errorMessage = 'Usuario o contraseña incorrectos';
          this.isLoading = false;
        },
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  toggleAuthMethod(): void {
    this.useKeycloak = !this.useKeycloak;
    this.errorMessage = '';
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach((key) => {
      this.loginForm.get(key)?.markAsTouched();
    });
  }

  getFieldError(field: string): string {
    const control = this.loginForm.get(field);
    if (control?.errors && control.touched) {
      if (control.errors['required'])
        return `${field === 'nombre' ? 'nombre' : 'contrasena'} es requerido`;
      if (control.errors['minlength'])
        return `Mínimo ${control.errors['minlength'].requiredLength} caracteres`;
    }
    return '';
  }
}
