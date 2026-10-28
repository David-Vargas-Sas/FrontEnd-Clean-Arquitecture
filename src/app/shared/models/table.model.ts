import { Row } from '@/models/api/api.model';
export interface ColumnDefinition { key: string; label: string; type?: 'money' | 'date' | 'datetime' | 'status' | 'stock' | 'quantity' | 'lookup'; source?: string; }
export type RowActionName = 'edit' | 'status' | 'cancel' | 'delete' | 'detail';
export interface RowAction {
  event: RowActionName; label: string | ((row: Row) => string); permission?: string;
  icon?: string; danger?: boolean; visible?: (row: Row) => boolean; ariaLabel?: (row: Row) => string;
}
export interface RowActionEvent { event: RowActionName; row: Row; }
