import { Injectable } from '@angular/core';
import { CanDeactivateFn } from '@angular/router';
import { inject } from '@angular/core';
@Injectable({ providedIn: 'root' })
export class UnsavedChangesService {
  pending: () => boolean = () => false;
}
export const unsavedChangesGuard: CanDeactivateFn<unknown> = () => !inject(UnsavedChangesService).pending() || window.confirm('Tienes cambios sin guardar. ¿Quieres salir y descartarlos?');
