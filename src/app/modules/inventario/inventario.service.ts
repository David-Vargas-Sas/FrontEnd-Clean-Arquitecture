import { inject, Injectable } from '@angular/core';
import { ApiClientService } from '@/core/services/api-client.service';
import { API_ENDPOINTS } from '@/core/constants/api.constants';
import { ListQuery } from '@/models/api/api.model';
import { Movimiento, MovimientoCreate } from '@/models/inventario/movimiento.model';

@Injectable({ providedIn: 'root' })
export class InventarioService {
  private readonly api = inject(ApiClientService);
  private readonly url = API_ENDPOINTS.inventario;
  list(query: ListQuery = {}) { return this.api.list<Movimiento>(this.url, query); }
  create(input: MovimientoCreate) { return this.api.create<Movimiento, MovimientoCreate>(this.url, input); }
}
