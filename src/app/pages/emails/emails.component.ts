import { Component, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmailService } from '../../core/services/email.service';
import { EmailItem, SendEmailRequest } from '../../core/interfaces/models';

type Mode = 'send' | 'draft' | 'edit-draft';

@Component({
  standalone: true,
  selector: 'app-emails',
  imports: [CommonModule, FormsModule],
  templateUrl: './emails.component.html',
  styleUrls: ['./emails.component.css']
})
export class EmailsComponent {
  private api = inject(EmailService);

  // tabla
  emails = signal<EmailItem[]>([]);
  loading = signal(false);
  private _filterStatus = signal<string>(''); // <-- signal privada

  // formulario (signals)
  private _form = signal<SendEmailRequest>({
    to: '',
    subject: '',
    body: '<h1>Hola</h1><p>Este es un correo de prueba</p>',
  });

  // modo/edición
  mode = signal<Mode>('send');
  editingId = signal<number | null>(null);
  msg = signal<string>('');
  err = signal<string>('');

  constructor() {
    this.load();
    effect(() => { this.mode(); this.msg.set(''); this.err.set(''); });
  }

  // ====== Getters/Setters para usar con [(ngModel)] ======
  get filterStatusValue(): string { return this._filterStatus(); }
  set filterStatusValue(v: string) { this._filterStatus.set(v); }

  get to(): string { return this._form().to; }
  set to(v: string) { this._form.update(f => ({ ...f, to: v })); }

  get subject(): string { return this._form().subject; }
  set subject(v: string) { this._form.update(f => ({ ...f, subject: v })); }

  get body(): string { return this._form().body; }
  set body(v: string) { this._form.update(f => ({ ...f, body: v })); }

  // ====== Lógica ======
  load() {
    this.loading.set(true);
    this.api.list(this._filterStatus()).subscribe({
      next: (data) => { this.emails.set(data); this.loading.set(false); },
      error: (e)   => { this.err.set(this.httpMsg(e)); this.loading.set(false); }
    });
  }

  refresh() { this.load(); }

  send() {
    this.msg.set(''); this.err.set('');
    this.api.send(this._form()).subscribe({
      next: (r) => { this.msg.set(r.message ?? 'Enviado'); this.load(); },
      error: (e) => this.err.set(this.httpMsg(e))
    });
  }

  saveDraft() {
    this.msg.set(''); this.err.set('');
    this.api.createDraft(this._form()).subscribe({
      next: (r) => {
        if (r.success) { this.msg.set(`Borrador creado (#${r.id})`); this.load(); }
        else this.err.set('No se pudo crear el borrador.');
      },
      error: (e) => this.err.set(this.httpMsg(e))
    });
  }

  editDraft(row: EmailItem) {
    if (row.status !== 'queued') { this.err.set('Solo se pueden editar borradores (queued).'); return; }
    this.mode.set('edit-draft');
    this.editingId.set(row.id);
    this._form.set({ to: row.to, subject: row.subject, body: row.body });
  }

  updateDraft() {
    const id = this.editingId();
    if (!id) return;
    this.msg.set(''); this.err.set('');
    this.api.updateDraft(id, this._form()).subscribe({
      next: (r) => {
        if (r.success) {
          this.msg.set('Borrador actualizado');
          this.mode.set('send');
          this.editingId.set(null);
          this.load();
        } else this.err.set('No se pudo actualizar el borrador.');
      },
      error: (e) => this.err.set(this.httpMsg(e))
    });
  }

  remove(row: EmailItem) {
    if (!confirm(`Eliminar email #${row.id}?`)) return;
    this.api.delete(row.id).subscribe({
      next: () => this.load(),
      error: (e) => this.err.set(this.httpMsg(e))
    });
  }

  clearForm() {
    this._form.set({ to: '', subject: '', body: '' });
    this.mode.set('send');
    this.editingId.set(null);
    this.msg.set(''); this.err.set('');
  }

  private httpMsg(e: any) {
    if (e?.error?.error) return e.error.error;
    if (e?.error?.message) return e.error.message;
    return 'Error de red o servidor';
  }
}
