import { RowAction } from '@/shared/models/table.model';
export function editAction(permission: string, singular: string): RowAction {
  return { event: 'edit', label: 'Editar', icon: 'edit', permission, ariaLabel: row => 'Editar ' + singular + ' ' + row.id };
}
export function statusAction(permission: string): RowAction {
  return { event: 'status', label: row => row['activo'] ? 'Desactivar' : 'Activar', permission };
}
export function deleteAction(permission: string): RowAction {
  return { event: 'delete', label: 'Eliminar', danger: true, permission };
}
