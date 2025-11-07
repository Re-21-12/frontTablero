import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MailerService } from '../../core/services/MailerService';

@Component({
  selector: 'app-emails',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './emails.component.html',
  styleUrls: ['./emails.component.css']
})
export class EmailsComponent implements OnInit {
  // ==========================
  // Variables principales
  // ==========================
  emails: any[] = [];
  loading = false;
  error = '';
  templateMsg = '';
  templateUpdateMsg = '';

  // Paginación
  page = 1;
  pageSize = 10;
  total = 0;
  totalPages = 1;

  // Formularios
  form = { id: 0, to: '', subject: '', body: '' };
  templateForm = { id: 0, name: '', subject: '', body: '' };

  constructor(private mailer: MailerService) {}

  ngOnInit(): void {
    this.loadEmails();
  }

  // ==========================
  // 📬 CORREOS
  // ==========================
  loadEmails(): void {
    this.loading = true;
    this.mailer.getEmailsPaginated(this.page, this.pageSize).subscribe({
      next: (res: any) => {
        const rawData = res.data || [];
        this.emails = rawData.map((e: any) => ({
          id: e.id ?? e.ID,
          to: e.to ?? e.To,
          subject: e.subject ?? e.Subject,
          body: e.body ?? e.Body,
          status: e.status ?? e.Status,
          created_at: e.created_at ?? e.CreatedAt,
          sent_at: e.sent_at ?? e.SentAt
        }));
        this.total = res.total || res.Total || rawData.length;
        this.totalPages = Math.max(1, Math.ceil(this.total / this.pageSize));
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'Error al cargar correos';
        this.loading = false;
      }
    });
  }

  sendEmail(): void {
    if (!this.form.to || !this.form.subject || !this.form.body) {
      this.error = 'Completa todos los campos.';
      return;
    }

    this.mailer.sendEmail(this.form).subscribe({
      next: () => {
        this.form = { id: 0, to: '', subject: '', body: '' };
        this.loadEmails();
      },
      error: (err) => console.error(err)
    });
  }

  deleteEmail(id: number): void {
    if (!confirm('¿Eliminar este correo?')) return;
    this.mailer.deleteEmail(id).subscribe({
      next: () => this.loadEmails(),
      error: (err) => console.error(err)
    });
  }

  changePage(next: boolean): void {
    const newPage = next ? this.page + 1 : this.page - 1;
    if (newPage < 1 || newPage > this.totalPages) return;
    this.page = newPage;
    this.loadEmails();
  }

  // ==========================
  // 🧩 PLANTILLAS
  // ==========================
  createTemplate(): void {
    if (!this.templateForm.name || !this.templateForm.subject || !this.templateForm.body) {
      this.templateMsg = 'Completa todos los campos.';
      return;
    }

    this.mailer.createTemplate(this.templateForm).subscribe({
      next: () => {
        this.templateMsg = ' Plantilla creada correctamente.';
        this.templateForm = { id: 0, name: '', subject: '', body: '' };
      },
      error: (err) => {
        console.error(err);
        this.templateMsg = ' Error creando la plantilla.';
      }
    });
  }

  updateTemplate(): void {
    if (!this.templateForm.id || !this.templateForm.subject || !this.templateForm.body) {
      this.templateUpdateMsg = 'Completa todos los campos.';
      return;
    }

    const payload = {
      name: this.templateForm.name || 'Sin nombre',
      subject: this.templateForm.subject,
      body: this.templateForm.body
    };

    this.mailer.updateTemplate(this.templateForm.id, payload).subscribe({
      next: () => {
        this.templateUpdateMsg = ' Plantilla actualizada correctamente.';
        this.templateForm = { id: 0, name: '', subject: '', body: '' };
      },
      error: (err) => {
        console.error(err);
        this.templateUpdateMsg = 'Error actualizando la plantilla.';
      }
    });
  }
}
