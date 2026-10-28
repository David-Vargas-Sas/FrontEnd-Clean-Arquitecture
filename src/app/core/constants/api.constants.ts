import { environment } from '@env/environment';
export const API_BASE_URL = environment.apiUrl;
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;
export const API_ENDPOINTS = Object.freeze({
  login: API_BASE_URL + '/auth/login', profile: API_BASE_URL + '/auth/me',
  productos: API_BASE_URL + '/productos', vendedores: API_BASE_URL + '/vendedores',
  ventas: API_BASE_URL + '/ventas', inventario: API_BASE_URL + '/inventario/movimientos',
  usuarios: API_BASE_URL + '/usuarios', auditoria: API_BASE_URL + '/auditoria',
});
