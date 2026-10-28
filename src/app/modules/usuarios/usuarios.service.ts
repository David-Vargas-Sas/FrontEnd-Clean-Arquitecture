import { inject, Injectable } from '@angular/core';
import { ApiClientService } from '@/core/services/api-client.service';
import { API_ENDPOINTS } from '@/core/constants/api.constants';
import { ListQuery } from '@/models/api/api.model';
import { Usuario, UsuarioCreate, UsuarioPatch } from '@/models/usuarios/usuario.model';

@Injectable({ providedIn: 'root' })
export class UsuariosService {
  private readonly api = inject(ApiClientService);
  private readonly url = API_ENDPOINTS.usuarios;
  list(query: ListQuery = {}) { return this.api.list<Usuario>(this.url, query); }
  create(input: UsuarioCreate) { return this.api.create<Usuario, UsuarioCreate>(this.url, input); }
  update(id: number, input: UsuarioPatch) { return this.api.update<Usuario, UsuarioPatch>(this.url + '/' + id, input); }
}
