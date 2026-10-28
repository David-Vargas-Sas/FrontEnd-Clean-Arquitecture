import { inject, Injectable } from '@angular/core';
import { ApiClientService } from '@/core/services/api-client.service';
import { API_ENDPOINTS } from '@/core/constants/api.constants';
import { ListQuery } from '@/models/api/api.model';
import { Vendedor, VendedorCreate, VendedorPatch } from '@/models/vendedores/vendedor.model';
import { loadCatalogOptions } from '@/core/utils/catalog-options.util';

@Injectable({ providedIn: 'root' })
export class VendedoresService {
  private readonly api = inject(ApiClientService);
  private readonly url = API_ENDPOINTS.vendedores;
  list(query: ListQuery = {}) { return this.api.list<Vendedor>(this.url, query); }
  create(input: VendedorCreate) { return this.api.create<Vendedor, VendedorCreate>(this.url, input); }
  update(id: number, input: VendedorPatch) { return this.api.update<Vendedor, VendedorPatch>(this.url + '/' + id, input); }
  remove(id: number) { return this.api.remove(this.url + '/' + id); }
  options() { return loadCatalogOptions(query => this.list(query), row => ({ id: row.id, label: row.nombre, activo: row.activo })); }
}
