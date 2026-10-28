import { inject, Injectable } from '@angular/core';
import { ApiClientService } from '@/core/services/api-client.service';
import { API_ENDPOINTS } from '@/core/constants/api.constants';
import { ListQuery } from '@/models/api/api.model';
import { Producto, ProductoCreate, ProductoPatch } from '@/models/productos/producto.model';
import { loadCatalogOptions } from '@/core/utils/catalog-options.util';

@Injectable({ providedIn: 'root' })
export class ProductosService {
  private readonly api = inject(ApiClientService);
  private readonly url = API_ENDPOINTS.productos;
  list(query: ListQuery = {}) { return this.api.list<Producto>(this.url, query); }
  create(input: ProductoCreate) { return this.api.create<Producto, ProductoCreate>(this.url, input); }
  update(id: number, input: ProductoPatch) { return this.api.update<Producto, ProductoPatch>(this.url + '/' + id, input); }
  remove(id: number) { return this.api.remove(this.url + '/' + id); }
  options() { return loadCatalogOptions(query => this.list(query), row => ({ id: row.id, label: row.nombre, activo: row.activo, precio: row.precio, stock: row.stock })); }
}
