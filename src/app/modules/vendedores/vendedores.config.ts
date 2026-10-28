import { editAction, statusAction, deleteAction } from '@/shared/utils/resource-actions.util';
import { ResourceConfig } from '@/shared/models/resource.model';
export const vendedoresConfig: ResourceConfig = {
  key: 'vendedores', title: 'Vendedores', singular: 'vendedor', description: 'Las personas que acompañan cada venta.', icon: 'users',
  createPermission: 'vendedores:create',
  rowActions: [editAction('vendedores:update', 'vendedor'), statusAction('vendedores:update'), deleteAction('vendedores:delete')],
  columns: [{ key: 'nombre', label: 'Nombre' }, { key: 'email', label: 'Correo electrónico' }, { key: 'activo', label: 'Estado', type: 'status' }],
  filters: [{ key: 'q', label: 'Buscar vendedores', type: 'text', maxLength: 120 }, { key: 'activo', label: 'Estado', type: 'select', options: [{ id: 'true', label: 'Activos' }, { id: 'false', label: 'Inactivos' }] }],
  fields: [{ key: 'nombre', label: 'Nombre completo', type: 'text', required: true, maxLength: 120 }, { key: 'email', label: 'Correo electrónico', type: 'email', required: true, maxLength: 254 }],
};
