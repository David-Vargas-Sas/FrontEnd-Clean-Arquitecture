import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IconComponent } from '../icon/icon.component';
@Component({ selector: 'app-create-button', standalone: true, imports: [IconComponent], template: '<button class="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-autos-accent px-4 py-2.5 text-[13px] leading-5 font-semibold text-white shadow-sm transition hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-autos-accent disabled:cursor-not-allowed disabled:opacity-50 max-sm:max-w-40 max-sm:px-3 max-sm:text-[10px]" type="button" [disabled]="disabled" (click)="create.emit()"><app-icon name="plus"/>{{ label }}</button>' })
export class CreateButtonComponent {
  @Input() label = 'Crear';
  @Input() disabled = false;
  @Output() create = new EventEmitter<void>();
}
