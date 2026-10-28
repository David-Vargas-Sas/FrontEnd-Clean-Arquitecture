import { editAction, statusAction, deleteAction } from '@/shared/utils/resource-actions.util';
import { ResourceConfig } from '@/shared/models/resource.model';
export const productosConfig: ResourceConfig = {
  key: 'productos', title: 'Productos', singular: 'producto', description: 'Tu catálogo de productos, precios y disponibilidad.', icon: 'box',
  createPermission: 'productos:create',
  rowActions: [editAction('productos:update', 'producto'), statusAction('productos:update'), deleteAction('productos:delete')],
  columns: [{ key: 'nombre', label: 'Producto' }, { key: 'descripcion', label: 'Descripción' }, { key: 'precio', label: 'Precio', type: 'money' }, { key: 'stock', label: 'Existencias', type: 'stock' }, { key: 'activo', label: 'Estado', type: 'status' }],
  filters: [{ key: 'q', label: 'Buscar productos', type: 'text', maxLength: 120 }, { key: 'activo', label: 'Estado', type: 'select', options: [{ id: 'true', label: 'Activos' }, { id: 'false', label: 'Inactivos' }] }],
  fields: [{ key: 'nombre', label: 'Nombre del producto', type: 'text', required: true, maxLength: 120 }, { key: 'descripcion', label: 'Descripción', type: 'textarea', maxLength: 500 }, { key: 'precio', label: 'Precio de venta', type: 'money', required: true, min: 0, max: 9999999999.99, step: '0.01' }],
};
