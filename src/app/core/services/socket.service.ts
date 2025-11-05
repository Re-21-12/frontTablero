import { Injectable } from '@angular/core';
import io from 'socket.io-client';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket;

  constructor() {
    this.socket = io(environment[environment.selectedEnvironment].socketUrl || '');
  }

  // Escuchar cualquier evento
  on(eventType: string, id: string, callback: (data: any) => void): void {
    this.socket.on(eventType + ":" + id, callback);
    console.log(`Listening to event: ${eventType}:${id}`);
  }

  // Emitir eventos
  emit(eventType: string, id: string, data?: any): void {
    this.socket.emit(eventType + ":" + id, data);
  }

  // Desconectar
  disconnect(): void {
    this.socket.disconnect();
  }
}