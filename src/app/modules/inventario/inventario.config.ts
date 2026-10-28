import { ResourceConfig } from '@/shared/models/resource.model';
export const inventarioConfig: ResourceConfig = {
  key: 'inventario', title: 'Inventario', singular: 'movimiento', description: 'Entradas, salidas y trazabilidad de tus existencias.', icon: 'inventory',
  createPermission: 'inventario:create', rowActions: [],
  columns: [{ key: 'creado_en', label: 'Fecha', type: 'datetime' }, { key: 'producto_id', label: 'Producto', type: 'lookup', source: 'productos' }, { key: 'tipo', label: 'Movimiento', type: 'status' }, { key: 'cantidad', label: 'Variación', type: 'quantity' }, { key: 'stock_resultante', label: 'Stock resultante', type: 'stock' }, { key: 'motivo', label: 'Motivo' }],
  filters: [{ key: 'producto_id', label: 'Producto', type: 'select', valueType: 'number', source: 'productos' }],
  fields: [{ key: 'producto_id', label: 'Producto', type: 'select', valueType: 'number', required: true, source: 'productos' }, { key: 'tipo', label: 'Tipo de movimiento', type: 'select', defaultValue: 'ENTRADA', required: true, options: [{ id: 'ENTRADA', label: 'Entrada' }, { id: 'SALIDA', label: 'Salida' }] }, { key: 'cantidad', label: 'Cantidad', type: 'number', defaultValue: 1, required: true, min: 1, max: 2147483647, step: '1' }, { key: 'motivo', label: 'Motivo del movimiento', type: 'textarea', required: true, maxLength: 500 }],
};
