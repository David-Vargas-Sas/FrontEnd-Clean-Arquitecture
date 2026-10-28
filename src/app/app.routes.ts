import { Routes } from '@angular/router';
import { authGuard } from '@/core/guards/auth.guard';

export const routes: Routes = [
  { path: 'login', loadChildren: () => import('@/modules/login/login.routes').then(module => module.routes) },
  { path: '', canActivate: [authGuard], loadComponent: () => import('@/layout/layout.component').then(module => module.LayoutComponent), children: [
    { path: '', pathMatch: 'full', redirectTo: 'inicio' },
    { path: 'inicio', loadChildren: () => import('@/modules/dashboard/dashboard.routes').then(module => module.routes) },
    { path: 'productos', loadChildren: () => import('@/modules/productos/productos.routes').then(module => module.routes) },
    { path: 'vendedores', loadChildren: () => import('@/modules/vendedores/vendedores.routes').then(module => module.routes) },
    { path: 'ventas', loadChildren: () => import('@/modules/ventas/ventas.routes').then(module => module.routes) },
    { path: 'inventario', loadChildren: () => import('@/modules/inventario/inventario.routes').then(module => module.routes) },
    { path: 'usuarios', loadChildren: () => import('@/modules/usuarios/usuarios.routes').then(module => module.routes) },
    { path: 'auditoria', loadChildren: () => import('@/modules/auditoria/auditoria.routes').then(module => module.routes) },
    { path: 'sin-permiso', loadComponent: () => import('@/modules/not-found/not-found.component').then(module => module.NotFoundComponent), data: { denied: true } },
    { path: '**', loadComponent: () => import('@/modules/not-found/not-found.component').then(module => module.NotFoundComponent) },
  ] },
];
