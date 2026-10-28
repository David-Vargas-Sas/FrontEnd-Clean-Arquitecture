import { inject, Injectable } from '@angular/core';
import { ApiClientService } from '@/core/services/api-client.service';
import { API_ENDPOINTS } from '@/core/constants/api.constants';
import { ListQuery } from '@/models/api/api.model';
import { Auditoria } from '@/models/auditoria/auditoria.model';

@Injectable({ providedIn: 'root' })
export class AuditoriaService {
  private readonly api = inject(ApiClientService);
  private readonly url = API_ENDPOINTS.auditoria;
  list(query: ListQuery = {}) { return this.api.list<Auditoria>(this.url, query); }
}
