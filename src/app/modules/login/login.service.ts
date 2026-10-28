import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ApiResponse } from '@/models/api/api.model';
import { Profile, Session } from '@/models/auth/auth.model';
import { API_ENDPOINTS } from '@/core/constants/api.constants';

const STORAGE_KEY = 'autos.access-token';
@Injectable({ providedIn: 'root' })
export class LoginService {
  private readonly http = inject(HttpClient);
  readonly user = signal<Profile | null>(null);
  private readonly accessToken = signal<string | null>(this.readToken());
  private pending: Promise<boolean> | null = null;

  token() { return this.accessToken(); }
  can(permission: string) { return this.user()?.permisos.includes(permission) ?? false; }
  private readToken(): string | null { try { return sessionStorage.getItem(STORAGE_KEY); } catch { return null; } }
  async login(email: string, password: string) {
    const { data } = await firstValueFrom(this.http.post<ApiResponse<Session>>(API_ENDPOINTS.login, { email, password }));
    this.accessToken.set(data.accessToken);
    try { sessionStorage.setItem(STORAGE_KEY, data.accessToken); } catch { /* La sesión en memoria sigue disponible. */ }
    this.user.set(data.user);
  }
  async refresh(): Promise<boolean> {
    if (!this.token()) return false;
    if (this.pending) return this.pending;
    this.pending = this.loadProfile();
    try { return await this.pending; } finally { this.pending = null; }
  }
  private async loadProfile(): Promise<boolean> {
    try {
      const { data } = await firstValueFrom(this.http.get<ApiResponse<Profile>>(API_ENDPOINTS.profile));
      this.user.set(data);
      return true;
    } catch { return false; }
  }
  logout() {
    this.accessToken.set(null);
    this.user.set(null);
    try { sessionStorage.removeItem(STORAGE_KEY); } catch { /* Sin almacenamiento persistente. */ }
  }
}
