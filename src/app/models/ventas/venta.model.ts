import { Row } from '@/models/api/api.model';
export interface VentaCreate { producto_id: number; vendedor_id: number; cantidad: number; precio_unitario: string | number; fecha: string; }
export type VentaPatch = Partial<VentaCreate>;
export interface Venta extends Row { producto_id: number; vendedor_id: number; cantidad: number; precio_unitario: string; total: string; fecha: string; estado: 'REGISTRADA' | 'ANULADA'; motivo_anulacion: string | null; registrado_por: number | null; }
