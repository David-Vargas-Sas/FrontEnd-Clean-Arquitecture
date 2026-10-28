import { Component, Input } from '@angular/core';
export const STATUS_LABELS: Record<string, string> = {
  REGISTRADA: 'Registrada', ANULADA: 'Anulada', ADMIN: 'Administrador', VENDEDOR: 'Vendedor',
  INVENTARIO: 'Inventario', ENTRADA: 'Entrada', SALIDA: 'Salida', VENTA: 'Venta',
  ANULACION: 'Anulación', AJUSTE_VENTA: 'Ajuste de venta', CREAR: 'Creación', EDITAR: 'Edición', ANULAR: 'Anulación',
};
export function statusLabel(value: unknown): string {
  if (typeof value === 'boolean') return value ? 'Activo' : 'Inactivo';
  return STATUS_LABELS[String(value)] ?? String(value ?? '—');
}
@Component({ selector: 'app-state-status', standalone: true, template: '<span class="badge" [class.success]="positive" [class.neutral]="!positive">{{ label }}</span>' })
export class StateStatusComponent {
  @Input() value: unknown;
  get label() { return statusLabel(this.value); }
  get positive() { return this.value === true || ['REGISTRADA', 'ENTRADA', 'ADMIN', 'CREAR'].includes(String(this.value)); }
}
