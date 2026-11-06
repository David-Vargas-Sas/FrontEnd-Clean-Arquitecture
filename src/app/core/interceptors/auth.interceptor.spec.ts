import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { LoginService } from '@/modules/login/login.service';
import { authInterceptor } from './auth.interceptor';

describe('Interceptor de autenticación', () => {
  let client: HttpClient; let http: HttpTestingController; let auth: jasmine.SpyObj<LoginService>; let router: jasmine.SpyObj<Router>;
  beforeEach(() => {
    auth = jasmine.createSpyObj<LoginService>('LoginService', ['token', 'logout', 'refresh']); auth.token.and.returnValue('test-token'); auth.refresh.and.resolveTo(true);
    router = jasmine.createSpyObj<Router>('Router', ['navigate']); router.navigate.and.resolveTo(true);
    TestBed.configureTestingModule({ providers: [provideHttpClient(withInterceptors([authInterceptor])), provideHttpClientTesting(), { provide: LoginService, useValue: auth }, { provide: Router, useValue: router }] });
    client = TestBed.inject(HttpClient); http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  it('agrega el token a nuestra API sin modificar el cuerpo', async () => {
    const pending = firstValueFrom(client.post('/api/productos', { nombre: 'Filtro' })); const req = http.expectOne('/api/productos');
    expect(req.request.headers.get('Authorization')).toBe('Bearer test-token'); expect(req.request.body).toEqual({ nombre: 'Filtro' }); req.flush({}); await pending;
  });
  it('no envía el token a terceros aunque su URL contenga /api', async () => {
    const pending = firstValueFrom(client.get('https://example.test/api/data')); const req = http.expectOne('https://example.test/api/data');
    expect(req.request.headers.has('Authorization')).toBeFalse(); req.flush({}); await pending;
  });
  it('permite peticiones sin token', async () => {
    auth.token.and.returnValue(null); const pending = firstValueFrom(client.get('/api/productos')); const req = http.expectOne('/api/productos');
    expect(req.request.headers.has('Authorization')).toBeFalse(); req.flush({}); await pending;
  });
  it('un 401 de negocio limpia la sesión, redirige y conserva el error', async () => {
    const rejected = expectAsync(firstValueFrom(client.get('/api/productos'))).toBeRejectedWith(jasmine.objectContaining({ status: 401 }));
    http.expectOne('/api/productos').flush({}, { status: 401, statusText: 'Unauthorized' }); await rejected;
    expect(auth.logout).toHaveBeenCalledTimes(1); expect(router.navigate).toHaveBeenCalledWith(['/login'], { queryParams: { expired: '1' } });
  });
  it('un login incorrecto no activa la redirección de sesión expirada', async () => {
    const rejected = expectAsync(firstValueFrom(client.post('/api/auth/login', {}))).toBeRejected();
    http.expectOne('/api/auth/login').flush({}, { status: 401, statusText: 'Unauthorized' }); await rejected;
    expect(auth.logout).not.toHaveBeenCalled(); expect(router.navigate).not.toHaveBeenCalled();
  });
  it('un 403 refresca los permisos sin cerrar sesión', async () => {
    const rejected = expectAsync(firstValueFrom(client.get('/api/usuarios'))).toBeRejected();
    http.expectOne('/api/usuarios').flush({}, { status: 403, statusText: 'Forbidden' }); await rejected;
    expect(auth.refresh).toHaveBeenCalledTimes(1); expect(auth.logout).not.toHaveBeenCalled();
  });
  it('un 403 del perfil no provoca un ciclo de refrescos', async () => {
    const rejected = expectAsync(firstValueFrom(client.get('/api/auth/me'))).toBeRejected();
    http.expectOne('/api/auth/me').flush({}, { status: 403, statusText: 'Forbidden' }); await rejected; expect(auth.refresh).not.toHaveBeenCalled();
  });
});
