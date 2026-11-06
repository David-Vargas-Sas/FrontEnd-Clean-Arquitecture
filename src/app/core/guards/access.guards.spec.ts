import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree, provideRouter } from '@angular/router';
import { LoginService } from '@/modules/login/login.service';
import { UnsavedChangesService, unsavedChangesGuard } from '@/core/services/unsaved-changes.service';
import { authGuard } from './auth.guard';
import { permissionGuard } from './permission.guard';

describe('Guards de acceso y cambios pendientes', () => {
  let auth: jasmine.SpyObj<LoginService>; let router: Router;
  const route = { data: { permission: 'ventas:create' } } as unknown as ActivatedRouteSnapshot;
  const state = {} as RouterStateSnapshot;
  beforeEach(() => {
    auth = jasmine.createSpyObj<LoginService>('LoginService', ['refresh', 'can']); auth.refresh.and.resolveTo(true); auth.can.and.returnValue(true);
    TestBed.configureTestingModule({ providers: [provideRouter([]), { provide: LoginService, useValue: auth }] }); router = TestBed.inject(Router);
  });
  it('permite entrar con una sesión válida', async () => expect(await TestBed.runInInjectionContext(() => authGuard(route, state))).toBeTrue());
  it('dirige al login si la sesión no es válida', async () => {
    auth.refresh.and.resolveTo(false); const result = await TestBed.runInInjectionContext(() => authGuard(route, state)); expect(router.serializeUrl(result as UrlTree)).toBe('/login');
  });
  it('comprueba el permiso configurado en la ruta', async () => {
    expect(await TestBed.runInInjectionContext(() => permissionGuard(route, state))).toBeTrue(); expect(auth.can).toHaveBeenCalledWith('ventas:create');
  });
  it('envía a sin-permiso cuando falta autorización', async () => {
    auth.can.and.returnValue(false); const result = await TestBed.runInInjectionContext(() => permissionGuard(route, state)); expect(router.serializeUrl(result as UrlTree)).toBe('/sin-permiso');
  });
  it('sin sesión no intenta conceder permisos', async () => {
    auth.refresh.and.resolveTo(false); const result = await TestBed.runInInjectionContext(() => permissionGuard(route, state)); expect(router.serializeUrl(result as UrlTree)).toBe('/login'); expect(auth.can).not.toHaveBeenCalled();
  });
  it('sin cambios pendientes permite salir sin mostrar confirmación', () => {
    const confirm = spyOn(window, 'confirm'); const result = TestBed.runInInjectionContext(() => unsavedChangesGuard({}, route, state, state)); expect(result).toBeTrue(); expect(confirm).not.toHaveBeenCalled();
  });
  for (const decision of [true, false]) {
    it('respeta la decisión de descartar cambios: ' + decision, () => {
      TestBed.inject(UnsavedChangesService).pending = () => true; const confirm = spyOn(window, 'confirm').and.returnValue(decision);
      expect(TestBed.runInInjectionContext(() => unsavedChangesGuard({}, route, state, state))).toBe(decision); expect(confirm).toHaveBeenCalledTimes(1);
    });
  }
});
