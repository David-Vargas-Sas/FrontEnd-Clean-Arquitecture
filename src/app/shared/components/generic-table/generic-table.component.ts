import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Row } from '@/models/api/api.model';
import { LookupOptions } from '@/shared/models/form.model';
import { ColumnDefinition, RowAction, RowActionEvent } from '@/shared/models/table.model';
import { StateStatusComponent } from '../state-status/state-status.component';
import { RowActionsComponent } from '../row-actions/row-actions.component';
import { IconComponent } from '../icon/icon.component';

@Component({ selector: 'app-generic-table', standalone: true, imports: [StateStatusComponent, RowActionsComponent, IconComponent], templateUrl: './generic-table.component.html', styleUrl: './generic-table.component.scss' })
export class GenericTableComponent {
  @Input() caption = 'Listado de registros';
  @Input() data: Row[] = [];
  @Input() columns: ColumnDefinition[] = [];
  @Input() rowActions: RowAction[] = [];
  @Input() options: LookupOptions = {};
  @Input() loading = false;
  @Input() error = false;
  @Input() icon = 'grid';
  @Input() noDataMessage = 'No hay registros para mostrar';
  @Output() rowActionTriggered = new EventEmitter<RowActionEvent>();

  format(row: Row, column: ColumnDefinition): string {
    const value = row[column.key];
    if (value === null || value === undefined || value === '') return '—';
    if (column.type === 'money') return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 2 }).format(Number(value));
    if (column.type === 'lookup') return this.options[column.source ?? '']?.find(option => String(option.id) === String(value))?.label ?? 'No disponible';
    if (column.type === 'date' || column.type === 'datetime') {
      const date = new Date(column.type === 'date' ? String(value).slice(0, 10) + 'T12:00:00Z' : String(value));
      if (!Number.isFinite(date.getTime())) return String(value);
      return column.type === 'date'
        ? new Intl.DateTimeFormat('es-CO', { timeZone: 'UTC' }).format(date)
        : new Intl.DateTimeFormat('es-CO', { dateStyle: 'short', timeStyle: 'short' }).format(date);
    }
    if (column.type === 'quantity') return (Number(value) > 0 ? '+' : '') + value;
    return String(value);
  }
}
