import { editAction, statusAction } from '@/shared/utils/resource-actions.util';
import { ResourceConfig } from '@/shared/models/resource.model';
export const usuariosConfig: ResourceConfig = {
  key: 'usuarios', title: 'Usuarios', singular: 'usuario', description: 'Gestiona el acceso y las responsabilidades de tu equipo.', icon: 'shield',
  createPermission: 'usuarios:create',
  rowActions: [editAction('usuarios:update', 'usuario'), statusAction('usuarios:update')],
  columns: [{ key: 'nombre', label: 'Nombre' }, { key: 'email', label: 'Correo electrónico' }, { key: 'rol', label: 'Rol', type: 'status' }, { key: 'activo', label: 'Estado', type: 'status' }, { key: 'creado_en', label: 'Creación', type: 'date' }],
  filters: [{ key: 'q', label: 'Buscar usuarios', type: 'text', maxLength: 120 }, { key: 'activo', label: 'Estado', type: 'select', options: [{ id: 'true', label: 'Activos' }, { id: 'false', label: 'Inactivos' }] }, { key: 'rol', label: 'Rol', type: 'select', options: [{ id: 'ADMIN', label: 'Administrador' }, { id: 'VENDEDOR', label: 'Vendedor' }, { id: 'INVENTARIO', label: 'Inventario' }] }],
  fields: [{ key: 'nombre', label: 'Nombre completo', type: 'text', required: true, maxLength: 120 }, { key: 'email', label: 'Correo electrónico', type: 'email', required: true, maxLength: 254 }, { key: 'rol', label: 'Rol de acceso', type: 'select', defaultValue: 'VENDEDOR', required: true, options: [{ id: 'VENDEDOR', label: 'Vendedor · registrar y consultar ventas' }, { id: 'INVENTARIO', label: 'Inventario · gestionar catálogo y existencias' }, { id: 'ADMIN', label: 'Administrador · acceso completo' }] }, { key: 'password', label: 'Contraseña', type: 'password', requiredOnCreate: true, minLength: 12, maxLength: 128, hint: 'Entre 12 y 128 caracteres. Al editar, deja vacío para conservarla. Cambiarla cierra las sesiones anteriores.' }],
};
