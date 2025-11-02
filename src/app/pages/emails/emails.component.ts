import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { EmailService, EmailRequest, EmailListResponse, EmailResponse } from '../../core/services/email.service';

@Component({
  selector: 'app-emails',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './emails.component.html',
  styleUrls: ['./emails.component.css']
})
export class EmailsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private emailSvc = inject(EmailService);

  form = this.fb.nonNullable.group({
    to: ['', [Validators.required, Validators.email]],
    subject: ['', [Validators.required, Validators.maxLength(256)]],
    body: ['', [Validators.required]]
  });

  loading = false;
  page = 1; size = 10; total = 0;
  items: any[] = [];
  msgOk: string | null = null;
  msgErr: string | null = null;

  ngOnInit() { this.load(); }

  load(p = this.page) {
    this.loading = true; this.msgErr = null; this.page = p;
    this.emailSvc.list(this.page, this.size).subscribe({
      next: (r: EmailListResponse) => {
        this.items = r.items ?? [];
        this.total = r.total ?? 0;
        this.loading = false;
      },
      error: (e: any) => {
        this.msgErr = e?.error?.message || 'Error cargando correos';
        this.loading = false;
      }
    });
  }

  submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const payload: EmailRequest = this.form.getRawValue();
    this.msgOk = null; this.msgErr = null;

    this.emailSvc.send(payload).subscribe({
      next: (r: EmailResponse) => {
        this.msgOk = r.message ?? 'Correo enviado';
        this.form.reset();
        this.load(1);
      },
      error: (e: any) => {
        this.msgErr = e?.error?.error || e?.error?.message || 'No se pudo enviar';
      }
    });
  }

  sendDraft(id: number) {
    this.msgOk = null; this.msgErr = null;
    this.emailSvc.sendDraft(id).subscribe({
      next: () => { this.msgOk = 'Borrador enviado'; this.load(this.page); },
      error: (e: any) => { this.msgErr = e?.error?.error || e?.error?.message || 'No se pudo enviar el borrador'; }
    });
  }

  remove(id: number) {
    if (!confirm('¿Eliminar este registro?')) return;
    this.msgOk = null; this.msgErr = null;
    this.emailSvc.delete(id).subscribe({
      next: () => {
        this.msgOk = 'Eliminado';
        if (this.items.length === 1 && this.page > 1) this.page--;
        this.load(this.page);
      },
      error: (e: any) => { this.msgErr = e?.error?.message || 'No se pudo eliminar'; }
    });
  }

  get totalPages() { return Math.max(1, Math.ceil(this.total / this.size)); }
}
