import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { LoginRequest } from '../../core/interfaces/auth-interface';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  private readonly _fb = inject(FormBuilder);
  private readonly _authService = inject(AuthService);
  private readonly _router = inject(Router);

  loginForm: FormGroup = this._fb.group({
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    contrasena: ['', [Validators.required, Validators.minLength(1)]],
  });

  isLoading = false;
  errorMessage = '';
  showPassword = false;

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const loginData: LoginRequest = this.loginForm.value as LoginRequest;

    this._authService.login(loginData).subscribe({
      next: () => {
        // AuthService.login ya guarda el token/usuario y programa el refresh
        this._router.navigate(['/bienvenida']);
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Usuario o contraseña incorrectos';
        this.isLoading = false;
      },
    });
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
