export type UserRole = 'ADMIN' | 'VENDEDOR' | 'INVENTARIO';
export interface Profile { id: number; nombre: string; email: string; rol: UserRole; permisos: string[]; }
export interface Session { accessToken: string; tokenType: string; expiresIn: number; user: Profile; }
