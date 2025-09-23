import {Component, inject} from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {Router, RouterModule} from '@angular/router';
import {AuthService} from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  registerForm: FormGroup;
  isLoading = false;
  showPassword = false;
  errorMessage = '';

  constructor(private fb: FormBuilder) {
    this.registerForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      contrasena: ['', [Validators.required, Validators.minLength(6)]],
      rol: ['', Validators.required]
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  getFieldError(fieldName: string): string {
    const field = this.registerForm.get(fieldName);
    if (field && field.errors && field.touched) {
      if (field.errors['required']) {
        return `${fieldName} es requerido`;
      }
      if (field.errors['minlength']) {
        const minLength = field.errors['minlength'].requiredLength;
        return `${fieldName} debe tener al menos ${minLength} caracteres`;
      }
    }
    return '';
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const formValue = this.registerForm.value;
      const registerData = {
        nombre: formValue.nombre,
        contrasena: formValue.contrasena,
        rol: {
          id_rol: parseInt(formValue.rol),
          nombre: formValue.rol === '16' ? 'Admin' : 'Usuario'
        }
      };

      console.log('Datos de registro:', registerData);

       this.authService.register(registerData).subscribe({
         next: (response: any) => {
          this.isLoading = false;

           // Redirigir o mostrar mensaje de éxito
           this.router.navigate(['/inicio_sesion']);
         },
         error: (error) => {
           this.isLoading = false;
           this.errorMessage = 'Error al crear la cuenta';
        }
       });

      // Simulación de llamada API
      setTimeout(() => {
        this.isLoading = false;
      }, 2000);
    }
  }
}
