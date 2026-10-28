import { Injectable, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  readonly message = signal('');
  private timeout?: ReturnType<typeof setTimeout>;
  success(message: string) {
    clearTimeout(this.timeout);
    this.message.set(message);
    this.timeout = setTimeout(() => this.message.set(''), 5000);
  }
}
export function errorMessage(error: unknown, context: 'general' | 'login' = 'general'): string {
  if (!(error instanceof HttpErrorResponse)) return 'No pudimos completar la operación. Inténtalo nuevamente.';
  // Los detalles de la respuesta y las referencias técnicas no se presentan en la interfaz.
  if (error.status === 0) return 'No pudimos conectar. Revisa tu conexión e inténtalo nuevamente.';
  if (error.status === 401) return context === 'login'
    ? 'Correo o contraseña incorrectos. Revisa tus datos e inténtalo de nuevo.'
    : 'Tu sesión terminó. Inicia sesión nuevamente para continuar.';
  if (error.status === 403) return 'Tu cuenta no tiene permiso para realizar esta acción.';
  if (error.status === 404) return 'El registro ya no está disponible. Actualiza la lista e inténtalo de nuevo.';
  if (error.status === 429) return 'Has realizado varios intentos. Espera unos minutos antes de volver a intentarlo.';
  if (error.status === 400 || error.status === 422) return 'Revisa los datos ingresados y los campos obligatorios antes de continuar.';
  if (error.status === 409) return 'No pudimos guardar los cambios. Actualiza la información y revisa el estado del registro antes de intentarlo de nuevo.';
  if (error.status === 413) return 'La información enviada es demasiado extensa. Reduce su tamaño e inténtalo nuevamente.';
  return 'El servicio no está disponible en este momento. Inténtalo nuevamente en unos minutos.';
}
