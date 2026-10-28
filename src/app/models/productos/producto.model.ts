import { Row } from '@/models/api/api.model';
export interface Producto extends Row { nombre: string; descripcion: string; precio: string; stock: number; activo: boolean; }
export interface ProductoCreate { nombre: string; descripcion?: string; precio: string | number; }
export type ProductoPatch = Partial<ProductoCreate> & { activo?: boolean };
