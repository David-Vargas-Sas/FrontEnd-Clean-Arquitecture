import { editAction } from '@/shared/utils/resource-actions.util';
import { ResourceConfig } from '@/shared/models/resource.model';
export const ventasConfig: ResourceConfig = {
  key: 'ventas', title: 'Ventas', singular: 'venta', description: 'Cada venta, su estado y su historial en un solo lugar.', icon: 'sale',
  createPermission: 'ventas:create',
  rowActions: [
    { ...editAction('ventas:update', 'venta'), visible: row => row['estado'] !== 'ANULADA' },
    { event: 'cancel', label: 'Anular', danger: true, permission: 'ventas:update', visible: row => row['estado'] !== 'ANULADA' },
  ],
  columns: [{ key: 'fecha', label: 'Fecha', type: 'date' }, { key: 'producto_id', label: 'Producto', type: 'lookup', source: 'productos' }, { key: 'vendedor_id', label: 'Vendedor', type: 'lookup', source: 'vendedores' }, { key: 'cantidad', label: 'Cantidad' }, { key: 'total', label: 'Total', type: 'money' }, { key: 'estado', label: 'Estado', type: 'status' }],
  filters: [{ key: 'desde', label: 'Desde', type: 'date' }, { key: 'hasta', label: 'Hasta', type: 'date' }, { key: 'producto_id', label: 'Producto', type: 'select', source: 'productos' }, { key: 'vendedor_id', label: 'Vendedor', type: 'select', source: 'vendedores' }, { key: 'estado', label: 'Estado', type: 'select', options: [{ id: 'REGISTRADA', label: 'Registradas' }, { id: 'ANULADA', label: 'Anuladas' }] }],
  fields: [{ key: 'producto_id', label: 'Producto', type: 'select', valueType: 'number', required: true, source: 'productos' }, { key: 'vendedor_id', label: 'Vendedor', type: 'select', valueType: 'number', required: true, source: 'vendedores' }, { key: 'cantidad', label: 'Cantidad', type: 'number', defaultValue: 1, required: true, min: 1, max: 2147483647, step: '1' }, { key: 'precio_unitario', label: 'Precio por unidad', type: 'money', hint: 'Se toma del producto; puedes ajustarlo para esta venta.', required: true, min: 0, max: 9999999999.99, step: '0.01' }, { key: 'fecha', label: 'Fecha de venta', type: 'date', required: true }],
};
