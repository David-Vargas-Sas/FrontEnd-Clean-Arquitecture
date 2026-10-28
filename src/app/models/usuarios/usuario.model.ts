import { Row } from '@/models/api/api.model';
import { UserRole } from '@/models/auth/auth.model';
export interface Usuario extends Row { nombre: string; email: string; rol: UserRole; activo: boolean; creado_en: string; }
export interface UsuarioCreate { nombre: string; email: string; password: string; rol: UserRole; }
export type UsuarioPatch = Partial<UsuarioCreate> & { activo?: boolean };
