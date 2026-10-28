import { Field } from './form.model';
import { ColumnDefinition, RowAction } from './table.model';
export interface ResourceConfig {
  key: string; title: string; singular: string; description: string; icon: string;
  columns: ColumnDefinition[]; fields: Field[]; createPermission?: string;
  rowActions: RowAction[]; filters?: Field[];
}
