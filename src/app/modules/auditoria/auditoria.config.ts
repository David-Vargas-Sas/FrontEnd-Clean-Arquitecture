import { ResourceConfig } from '@/shared/models/resource.model';
export const auditoriaConfig: ResourceConfig = {
  key: 'auditoria', title: 'Auditoría', singular: 'registro', description: 'Cambios de ventas y usuarios, con fecha y responsable.', icon: 'history',
  rowActions: [{ event: 'detail', label: 'Ver detalle' }],
  columns: [{ key: 'creado_en', label: 'Fecha', type: 'datetime' }, { key: 'entidad', label: 'Entidad' }, { key: 'accion', label: 'Acción', type: 'status' }],
  fields: [], filters: [{ key: 'entidad', label: 'Entidad', type: 'select', options: [{ id: 'ventas', label: 'Ventas' }, { id: 'usuarios', label: 'Usuarios' }] }, { key: 'registro_id', label: 'ID del registro', type: 'number', min: 1 }],
};
