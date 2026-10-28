import { Row } from '@/models/api/api.model';
export interface Auditoria extends Row { entidad: 'ventas' | 'usuarios'; registro_id: number; accion: string; usuario_id: number | null; antes: Record<string, unknown> | null; despues: Record<string, unknown>; creado_en: string; }
