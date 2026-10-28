import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ApiResponse, ListQuery } from '@/models/api/api.model';
import { DEFAULT_PAGE_SIZE } from '@/core/constants/api.constants';

@Injectable({ providedIn: 'root' })
export class ApiClientService {
  private readonly http = inject(HttpClient);
  list<T>(url: string, query: ListQuery = {}) {
    let params = new HttpParams().set('limit', query.limit ?? DEFAULT_PAGE_SIZE).set('offset', query.offset ?? 0);
    for (const [key, value] of Object.entries(query.filters ?? {})) if (value) params = params.set(key, value);
    return firstValueFrom(this.http.get<ApiResponse<T[]>>(url, { params }));
  }
  create<T, B extends object>(url: string, body: B) { return firstValueFrom(this.http.post<ApiResponse<T>>(url, body)); }
  update<T, B extends object>(url: string, body: B) { return firstValueFrom(this.http.patch<ApiResponse<T>>(url, body)); }
  remove(url: string) { return firstValueFrom(this.http.delete<void>(url)); }
}
