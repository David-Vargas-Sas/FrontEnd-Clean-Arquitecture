import { Injectable } from '@angular/core';
@Injectable({ providedIn: 'root' })
export class PageStateService {
  private readonly states = new Map<string, { offset: number; filters: Record<string, unknown> }>();
  get(key: string) { return this.states.get(key); }
  set(key: string, state: { offset: number; filters: Record<string, unknown> }) { this.states.set(key, state); }
}
