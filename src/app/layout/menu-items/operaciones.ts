import { MenuItem } from '../menu.model';
export const OPERACIONES_MENU: readonly MenuItem[] = [
  { path: '/inicio', label: 'Inicio', icon: 'grid' },
  { path: '/productos', label: 'Productos', icon: 'box', permission: 'productos:read' },
  { path: '/ventas', label: 'Ventas', icon: 'sale', permission: 'ventas:read' },
  { path: '/vendedores', label: 'Vendedores', icon: 'users', permission: 'vendedores:read' },
  { path: '/inventario', label: 'Inventario', icon: 'inventory', permission: 'inventario:read' },
  { path: '/usuarios', label: 'Usuarios', icon: 'shield', permission: 'usuarios:read' },
  { path: '/auditoria', label: 'Auditoría', icon: 'history', permission: 'auditoria:read' },
];
