import { inject, Injectable } from '@angular/core';
import { ApiClientService } from '@/core/services/api-client.service';
import { API_ENDPOINTS } from '@/core/constants/api.constants';
import { ListQuery } from '@/models/api/api.model';
import { Venta, VentaCreate, VentaPatch } from '@/models/ventas/venta.model';

@Injectable({ providedIn: 'root' })
export class VentasService {
  private readonly api = inject(ApiClientService);
  private readonly url = API_ENDPOINTS.ventas;
  list(query: ListQuery = {}) { return this.api.list<Venta>(this.url, query); }
  create(input: VentaCreate) { return this.api.create<Venta, VentaCreate>(this.url, input); }
  update(id: number, input: VentaPatch) { return this.api.update<Venta, VentaPatch>(this.url + '/' + id, input); }
  anular(id: number, motivo: string) { return this.api.update<Venta, {estado: 'ANULADA'; motivo_anulacion: string}>(this.url + '/' + id, { estado: 'ANULADA', motivo_anulacion: motivo }); }
}
