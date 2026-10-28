export interface Option { id: number | string; label: string; activo?: boolean; precio?: string; stock?: number; }
export interface Field {
  key: string; label: string; type: 'money' | 'text' | 'email' | 'password' | 'number' | 'date' | 'select' | 'textarea';
  required?: boolean; requiredOnCreate?: boolean; min?: number; max?: number; minLength?: number; maxLength?: number; step?: string;
  source?: string; options?: Option[]; hint?: string; valueType?: 'number' | 'string'; defaultValue?: string | number;
}
export interface FieldChange { key: string; value: unknown; }
export type LookupOptions = Record<string, Option[]>;
export type LookupSources = Record<string, () => Promise<Option[]>>;
