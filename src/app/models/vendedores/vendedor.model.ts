import { Row } from '@/models/api/api.model';
export interface Vendedor extends Row { nombre: string; email: string; activo: boolean; }
export interface VendedorCreate { nombre: string; email: string; }
export type VendedorPatch = Partial<VendedorCreate> & { activo?: boolean };
