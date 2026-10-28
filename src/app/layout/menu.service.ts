import { computed, inject, Injectable } from '@angular/core';
import { LoginService } from '@/modules/login/login.service';
import { OPERACIONES_MENU } from './menu-items/operaciones';

@Injectable({ providedIn: 'root' })
export class MenuService {
  private readonly auth = inject(LoginService);
  readonly visibleItems = computed(() => OPERACIONES_MENU.filter(item => !item.permission || this.auth.can(item.permission)));
}
