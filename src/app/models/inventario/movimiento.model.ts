import { Row } from '@/models/api/api.model';
export interface MovimientoCreate { producto_id: number; tipo: 'ENTRADA' | 'SALIDA'; cantidad: number; motivo: string; }
export interface Movimiento extends Row { producto_id: number; tipo: 'ENTRADA' | 'SALIDA' | 'VENTA' | 'ANULACION' | 'AJUSTE_VENTA'; cantidad: number; stock_resultante: number; motivo: string; creado_en: string; }
