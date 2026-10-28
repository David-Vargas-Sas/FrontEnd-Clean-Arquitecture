import { unsavedChangesGuard } from '@/core/services/unsaved-changes.service';
import { Routes } from '@angular/router';
import { permissionGuard } from '@/core/guards/permission.guard';

export const routes: Routes = [{
  path: '', canActivate: [permissionGuard], canDeactivate: [unsavedChangesGuard], data: { permission: 'ventas:read' },
  loadComponent: () => import('./ventas.component').then(module => module.VentasComponent),
}];
