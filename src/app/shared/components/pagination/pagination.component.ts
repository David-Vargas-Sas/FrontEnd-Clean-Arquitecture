import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DEFAULT_PAGE_SIZE } from '@/core/constants/api.constants';
@Component({ selector: 'app-pagination', standalone: true, templateUrl: './pagination.component.html' })
export class PaginationComponent {
  @Input() offset = 0;
  @Input() count = 0;
  @Input() loading = false;
  @Input() hasNext = false;
  @Output() pageChange = new EventEmitter<number>();
  readonly size = DEFAULT_PAGE_SIZE;
  get pageNumber() { return Math.floor(this.offset / this.size) + 1; }
}
