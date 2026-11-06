import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { LoginService } from './login.service';
import { Profile } from '@/models/auth/auth.model';
import { API_ENDPOINTS } from '@/core/constants/api.constants';

describe('Sesión de usuario', () => {
  let http: HttpTestingController;
  const profile: Profile = { id: 1, nombre: 'Ana', email: 'ana@example.com', rol: 'VENDEDOR', permisos: ['ventas:read'] };
  beforeEach(() => { sessionStorage.clear(); TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] }); http = TestBed.inject(HttpTestingController); });
  afterEach(() => { http.verify(); sessionStorage.clear(); });
  async function login(service: LoginService) {
    const pending = service.login(profile.email, 'test-password'); const req = http.expectOne(API_ENDPOINTS.login);
    expect(req.request.method).toBe('POST'); expect(req.request.body).toEqual({ email: profile.email, password: 'test-password' });
    req.flush({ data: { user: profile, accessToken: 'unit-test-token', tokenType: 'Bearer', expiresIn: 900 } }); await pending;
  }
  it('guarda solo el token en la pestaña y expone perfil y permisos', async () => {
    const service = TestBed.inject(LoginService); await login(service);
    expect(service.token()).toBe('unit-test-token'); expect(service.user()).toEqual(profile);
    expect(sessionStorage.getItem('autos.access-token')).toBe('unit-test-token'); expect(sessionStorage.length).toBe(1);
    expect(service.can('ventas:read')).toBeTrue(); expect(service.can('usuarios:create')).toBeFalse();
  });
  it('recupera un token existente y consulta el perfil una sola vez para solicitudes simultáneas', async () => {
    sessionStorage.setItem('autos.access-token', 'previous-token'); const service = TestBed.inject(LoginService);
    const first = service.refresh(); const second = service.refresh(); const req = http.expectOne(API_ENDPOINTS.profile);
    req.flush({ data: profile }); expect(await first).toBeTrue(); expect(await second).toBeTrue(); expect(service.user()).toEqual(profile);
  });
  it('sin token no consulta el perfil ni concede permisos', async () => {
    const service = TestBed.inject(LoginService); expect(await service.refresh()).toBeFalse(); expect(service.can('ventas:read')).toBeFalse(); http.expectNone(API_ENDPOINTS.profile);
  });
  it('un fallo del login no crea una sesión', async () => {
    const service = TestBed.inject(LoginService); const rejected = expectAsync(service.login(profile.email, 'incorrect-password')).toBeRejected();
    http.expectOne(API_ENDPOINTS.login).flush({}, { status: 401, statusText: 'Unauthorized' }); await rejected;
    expect(service.token()).toBeNull(); expect(service.user()).toBeNull(); expect(sessionStorage.length).toBe(0);
  });
  it('un fallo al refrescar permite reintentar después', async () => {
    sessionStorage.setItem('autos.access-token', 'previous-token'); const service = TestBed.inject(LoginService);
    let pending = service.refresh(); http.expectOne(API_ENDPOINTS.profile).flush({}, { status: 503, statusText: 'Unavailable' }); expect(await pending).toBeFalse();
    pending = service.refresh(); http.expectOne(API_ENDPOINTS.profile).flush({ data: profile }); expect(await pending).toBeTrue();
  });
  it('cerrar sesión elimina perfil, permisos y token', async () => {
    const service = TestBed.inject(LoginService); await login(service); service.logout();
    expect(service.token()).toBeNull(); expect(service.user()).toBeNull(); expect(service.can('ventas:read')).toBeFalse(); expect(sessionStorage.getItem('autos.access-token')).toBeNull();
  });
  it('permite la sesión en memoria si el almacenamiento está bloqueado', async () => {
    spyOn(sessionStorage, 'getItem').and.throwError('Storage blocked'); spyOn(sessionStorage, 'setItem').and.throwError('Storage blocked'); spyOn(sessionStorage, 'removeItem').and.throwError('Storage blocked');
    const service = TestBed.inject(LoginService); await login(service); expect(service.token()).toBe('unit-test-token'); service.logout(); expect(service.token()).toBeNull();
  });
});
