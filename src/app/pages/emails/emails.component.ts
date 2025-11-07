import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Email, MailerService } from '../../core/services/email.service';

@Component({
  selector: 'app-emails',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './emails.component.html',
  styleUrls: ['./emails.component.css']
})
export class EmailsComponent implements OnInit {
  emails: Email[] = [];
  loading = false;
  error: string | null = null;
  newEmail = { to: '', subject: '', body: '' };

  constructor(private mailerService: MailerService) {}

  ngOnInit(): void {
    this.loadEmails();
  }

  /** 🔹 Cargar correos */
  loadEmails(): void {
    this.loading = true;
    this.mailerService.getEmails().subscribe({
      next: (res) => {
        this.emails = res.data ?? [];
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'Error al obtener correos';
        this.loading = false;
      }
    });
  }

  /** 🔹 Enviar correo */
  sendEmail(): void {
    if (!this.newEmail.to || !this.newEmail.subject || !this.newEmail.body) {
      this.error = 'Todos los campos son requeridos';
      return;
    }

    this.loading = true;
    this.mailerService.sendEmail(this.newEmail).subscribe({
      next: () => {
        alert('✅ Correo enviado exitosamente');
        this.newEmail = { to: '', subject: '', body: '' };
        this.loadEmails();
      },
      error: (err) => {
        console.error(err);
        this.error = '❌ Error al enviar correo';
        this.loading = false;
      }
    });
  }

  /** 🔹 Eliminar correo */
  deleteEmail(id?: number): void {
    if (!id) return;
    if (!confirm('¿Deseas eliminar este correo?')) return;

    this.mailerService.deleteEmail(id).subscribe({
      next: () => this.loadEmails(),
      error: (err) => {
        console.error(err);
        this.error = 'Error eliminando correo';
      }
    });
  }
}
