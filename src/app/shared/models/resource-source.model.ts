import { ApiResponse, ListQuery, Row } from '@/models/api/api.model';

export interface ModuleDataService<T extends Row, C extends object = never, U extends object = never> {
  list(query?: ListQuery): Promise<ApiResponse<T[]>>;
  create?(input: C): Promise<ApiResponse<T>>;
  update?(id: number, input: U): Promise<ApiResponse<T>>;
  remove?(id: number): Promise<void>;
}
export interface ResourceSource {
  list(query?: ListQuery): Promise<ApiResponse<Row[]>>;
  create?(input: Record<string, unknown>): Promise<ApiResponse<Row>>;
  update?(id: number, input: Record<string, unknown>): Promise<ApiResponse<Row>>;
  remove?(id: number): Promise<void>;
  cancel?(id: number, reason: string): Promise<ApiResponse<Row>>;
}
// Frontera única entre formularios dinámicos y DTOs propios del módulo.
// Las reglas del formulario validan el payload; el backend vuelve a validarlo.
export function toResourceSource<T extends Row, C extends object = never, U extends object = never>(
  service: ModuleDataService<T, C, U>, extra: Pick<ResourceSource, 'cancel'> = {},
): ResourceSource {
  return {
    list: query => service.list(query),
    ...(service.create ? { create: (input: Record<string, unknown>) => service.create!(input as C) } : {}),
    ...(service.update ? { update: (id: number, input: Record<string, unknown>) => service.update!(id, input as U) } : {}),
    ...(service.remove ? { remove: (id: number) => service.remove!(id) } : {}),
    ...extra,
  };
}
