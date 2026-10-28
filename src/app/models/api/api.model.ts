export interface ApiResponse<T> { data: T; pagination?: { limit: number; offset: number }; }
export interface ListQuery { limit?: number; offset?: number; filters?: Record<string, string>; }
export interface Row { id: number; [key: string]: unknown; }
