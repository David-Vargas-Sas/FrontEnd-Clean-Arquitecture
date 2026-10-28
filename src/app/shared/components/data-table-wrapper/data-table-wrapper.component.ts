import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { Row } from '@/models/api/api.model';
import { LookupOptions } from '@/shared/models/form.model';
import { ColumnDefinition, RowAction, RowActionEvent } from '@/shared/models/table.model';
import { GenericTableComponent } from '../generic-table/generic-table.component';
import { PaginationComponent } from '../pagination/pagination.component';
import { IconComponent } from '../icon/icon.component';

@Component({ selector: 'app-data-table-wrapper', standalone: true, imports: [GenericTableComponent, PaginationComponent, IconComponent], templateUrl: './data-table-wrapper.component.html', styleUrl: './data-table-wrapper.component.scss' })
export class DataTableWrapperComponent implements OnChanges {
  @Input() title = '';
  @Input() icon = 'grid';
  @Input() data: Row[] = [];
  @Input() columns: ColumnDefinition[] = [];
  @Input() rowActions: RowAction[] = [];
  @Input() options: LookupOptions = {};
  @Input() loading = false;
  @Input() error = false;
  @Input() offset = 0;
  @Input() hasNext = false;
  @Output() refresh = new EventEmitter<void>();
  @Output() pageChange = new EventEmitter<number>();
  @Output() rowActionTriggered = new EventEmitter<RowActionEvent>();
  selectedColumns = new Set<string>();
  ngOnChanges(changes: SimpleChanges) {
    if (changes['columns']) this.selectedColumns = new Set(this.columns.map(column => column.key));
  }
  get visibleColumns() { return this.columns.filter(column => this.selectedColumns.has(column.key)); }
  toggleColumn(key: string) {
    if (this.selectedColumns.has(key) && this.selectedColumns.size > 1) this.selectedColumns.delete(key);
    else this.selectedColumns.add(key);
  }
}
