import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ProductosService } from './productos.service';
import { API_ENDPOINTS } from '@/core/constants/api.constants';

describe('Servicio de productos', () => {
  let service: ProductosService; let http: HttpTestingController;
  beforeEach(() => { TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] }); service = TestBed.inject(ProductosService); http = TestBed.inject(HttpTestingController); });
  afterEach(() => http.verify());
  it('lista desde el endpoint del módulo con sus filtros', async () => {
    const pending = service.list({ filters: { q: 'Filtro' } }); const req = http.expectOne(r => r.url === API_ENDPOINTS.productos);
    expect(req.request.params.get('q')).toBe('Filtro'); req.flush({ data: [] }); expect((await pending).data).toEqual([]);
  });
  it('crea, actualiza y elimina con el ID correcto', async () => {
    const pending = service.create({ nombre: 'Filtro', descripcion: '', precio: 25000 }); let req = http.expectOne(API_ENDPOINTS.productos);
    expect(req.request.method).toBe('POST'); expect(req.request.body.precio).toBe(25000); req.flush({ data: { id: 7 } }); await pending;
    const changed = service.update(7, { activo: false }); req = http.expectOne(API_ENDPOINTS.productos + '/7');
    expect(req.request.method).toBe('PATCH'); expect(req.request.body).toEqual({ activo: false }); req.flush({ data: { id: 7, activo: false } }); await changed;
    const removed = service.remove(7); req = http.expectOne(API_ENDPOINTS.productos + '/7'); expect(req.request.method).toBe('DELETE'); req.flush(null); await removed;
  });
  it('carga todas las páginas de opciones y conserva estado, precio y stock', async () => {
    const pending = service.options(); const rows = Array.from({ length: 100 }, (_, i) => ({ id: i + 1, nombre: 'Producto ' + i, activo: true, precio: '25000.00', stock: 20 }));
    let req = http.expectOne(r => r.url === API_ENDPOINTS.productos && r.params.get('offset') === '0'); expect(req.request.params.get('limit')).toBe('100'); req.flush({ data: rows });
    await Promise.resolve(); await Promise.resolve();
    req = http.expectOne(r => r.url === API_ENDPOINTS.productos && r.params.get('offset') === '100'); req.flush({ data: [{ id: 101, nombre: 'Inactivo', activo: false, precio: '1.50', stock: 0 }] });
    const options = await pending; expect(options.length).toBe(101); expect(options[100]).toEqual({ id: 101, label: 'Inactivo', activo: false, precio: '1.50', stock: 0 });
  });
});
