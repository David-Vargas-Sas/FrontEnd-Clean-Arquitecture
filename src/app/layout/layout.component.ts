import { afterNextRender, Component, ElementRef, HostListener, Injector, OnDestroy, ViewChild, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { UnsavedChangesService } from '@/core/services/unsaved-changes.service';
import { LoginService } from '@/modules/login/login.service';
import { MenuService } from './menu.service';
import { NotificationService } from '@/core/services/notification.service';
import { ScrollLockService } from '@/core/services/scroll-lock.service';
import { IconComponent } from '@/shared/components/icon/icon.component';

@Component({ selector: 'app-layout', standalone: true, imports: [RouterOutlet, RouterLink, RouterLinkActive, IconComponent],
  templateUrl: './layout.component.html', styleUrl: './layout.component.scss' })
export class LayoutComponent implements OnDestroy {
  private readonly unsaved = inject(UnsavedChangesService);
  readonly auth = inject(LoginService);
  readonly notifications = inject(NotificationService);
  readonly menu = inject(MenuService);
  private readonly router = inject(Router);
  private readonly scrollLock = inject(ScrollLockService);
  private readonly injector = inject(Injector);
  private readonly navigation = toSignal(this.router.events.pipe(filter(event => event instanceof NavigationEnd)));
  readonly mobileOpen = signal(false);
  readonly currentPage = computed(() => {
    this.navigation();
    return this.menu.visibleItems().find(item => item.path === this.router.url.split('?')[0])?.label ?? 'Panel de operaciones';
  });
  readonly groups = computed(() => [
    { label: 'General', items: this.menu.visibleItems().filter(item => item.path === '/inicio') },
    { label: 'Operaciones', items: this.menu.visibleItems().filter(item => !['/inicio', '/usuarios', '/auditoria'].includes(item.path)) },
    { label: 'Administración', items: this.menu.visibleItems().filter(item => ['/usuarios', '/auditoria'].includes(item.path)) },
  ].filter(group => group.items.length));
  readonly today = new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());
  @ViewChild('sidebar') private sidebar!: ElementRef<HTMLElement>;
  @ViewChild('menuTrigger') private menuTrigger!: ElementRef<HTMLButtonElement>;
  private releaseScroll?: () => void;
  role() { return ({ ADMIN: 'Administrador', VENDEDOR: 'Vendedor', INVENTARIO: 'Inventario' })[this.auth.user()?.rol ?? 'VENDEDOR']; }
  openMenu() {
    this.mobileOpen.set(true);
    this.releaseScroll ??= this.scrollLock.lock();
    afterNextRender(() => requestAnimationFrame(() => { if (this.mobileOpen()) this.sidebar.nativeElement.querySelector<HTMLButtonElement>('.sidebar-close')?.focus(); }), { injector: this.injector });
  }
  closeMenu() {
    if (!this.mobileOpen()) return;
    this.mobileOpen.set(false);
    this.releaseScroll?.(); this.releaseScroll = undefined;
    afterNextRender(() => this.menuTrigger.nativeElement.focus({ preventScroll: true }), { injector: this.injector });
  }
  @HostListener('window:resize') onResize() { if (window.innerWidth > 800) this.closeMenu(); }
  @HostListener('document:keydown', ['$event']) onKeydown(event: KeyboardEvent) {
    if (!this.mobileOpen()) return;
    if (event.key === 'Escape') { event.preventDefault(); this.closeMenu(); }
    if (event.key !== 'Tab') return;
    const elements = Array.from(this.sidebar.nativeElement.querySelectorAll<HTMLElement>('a[href], button')).filter(element => element.getClientRects().length);
    const first = elements[0], last = elements[elements.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  }
  ngOnDestroy() { this.releaseScroll?.(); }
  async logout() {
    if (this.unsaved.pending() && !window.confirm('Tienes cambios sin guardar. ¿Quieres cerrar sesión y descartarlos?')) return;
    this.unsaved.pending = () => false;
    this.auth.logout(); await this.router.navigate(['/login']);
  }
}
