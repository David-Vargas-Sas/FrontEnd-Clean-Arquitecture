import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Row } from '@/models/api/api.model';
import { RowAction, RowActionEvent } from '@/shared/models/table.model';
import { IconComponent } from '../icon/icon.component';

@Component({ selector: 'app-row-actions', standalone: true, imports: [IconComponent], templateUrl: './row-actions.component.html', styleUrl: './row-actions.component.scss' })
export class RowActionsComponent {
  @Input({ required: true }) row!: Row;
  @Input() actions: RowAction[] = [];
  @Output() actionTriggered = new EventEmitter<RowActionEvent>();
  get visibleActions() { return this.actions.filter(action => !action.visible || action.visible(this.row)); }
  label(action: RowAction) { return typeof action.label === 'function' ? action.label(this.row) : action.label; }
}
