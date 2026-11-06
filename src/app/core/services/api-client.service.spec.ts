import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ApiClientService } from './api-client.service';

describe('Cliente HTTP compartido', () => {
  let api: ApiClientService; let http: HttpTestingController;
  beforeEach(() => { TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] }); api = TestBed.inject(ApiClientService); http = TestBed.inject(HttpTestingController); });
  afterEach(() => http.verify());
  it('consulta diez registros por defecto', async () => {
    const result = api.list('/api/productos'); const req = http.expectOne(r => r.url === '/api/productos');
    expect(req.request.method).toBe('GET'); expect(req.request.params.get('limit')).toBe('10'); expect(req.request.params.get('offset')).toBe('0');
    req.flush({ data: [] }); expect(await result).toEqual({ data: [] });
  });
  it('envía filtros y paginación y omite filtros vacíos', async () => {
    const result = api.list('/api/productos', { limit: 5, offset: 10, filters: { q: 'Filtro & aceite', activo: 'false', vacio: '' } });
    const req = http.expectOne(r => r.url === '/api/productos');
    expect(req.request.params.get('q')).toBe('Filtro & aceite'); expect(req.request.params.get('activo')).toBe('false');
    expect(req.request.params.has('vacio')).toBeFalse(); expect(req.request.params.get('offset')).toBe('10'); expect(req.request.params.get('limit')).toBe('5');
    req.flush({ data: [] }); await result;
  });
  for (const operation of ['create', 'update'] as const) {
    it('envía el cuerpo correcto mediante ' + operation, async () => {
      const body = { nombre: 'Filtro', precio: 25000.5 }; const result = api[operation]('/api/productos/7', body);
      const req = http.expectOne('/api/productos/7'); expect(req.request.method).toBe(operation === 'create' ? 'POST' : 'PATCH'); expect(req.request.body).toEqual(body);
      req.flush({ data: { id: 7, ...body } }); expect(await result).toEqual({ data: { id: 7, ...body } });
    });
  }
  it('acepta un borrado sin cuerpo de respuesta', async () => {
    const result = api.remove('/api/productos/7'); const req = http.expectOne('/api/productos/7'); expect(req.request.method).toBe('DELETE');
    req.flush(null, { status: 204, statusText: 'No Content' }); await result;
  });
  it('propaga los errores para que la pantalla decida qué mostrar', async () => {
    const rejected = expectAsync(api.list('/api/productos')).toBeRejectedWith(jasmine.objectContaining({ status: 500 }));
    http.expectOne(r => r.url === '/api/productos').flush({ error: { code: 'INTERNAL_ERROR' } }, { status: 500, statusText: 'Server Error' }); await rejected;
  });
});
