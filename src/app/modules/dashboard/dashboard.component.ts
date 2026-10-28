import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductosService } from '@/modules/productos/productos.service';
import { LoginService } from '@/modules/login/login.service';
import { errorMessage } from '@/core/services/notification.service';
import { Row } from '@/models/api/api.model';
import { IconComponent } from '@/shared/components/icon/icon.component';

@Component({ selector: 'app-dashboard', standalone: true, imports: [RouterLink, IconComponent], templateUrl: './dashboard.component.html', styleUrl: './dashboard.component.scss' })
export class DashboardComponent implements OnInit {
  readonly auth = inject(LoginService);
  private readonly productos = inject(ProductosService);
  readonly products = signal<Row[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');
  get units() { return this.products().reduce((sum, row) => sum + Number(row['stock'] ?? 0), 0); }
  get withoutStock() { return this.products().filter(row => Number(row['stock']) === 0).length; }
  async ngOnInit() {
    if (!this.auth.can('productos:read')) { this.loading.set(false); return; }
    try { this.products.set((await this.productos.list()).data); }
    catch (error) { this.error.set(errorMessage(error)); } finally { this.loading.set(false); }
  }
}
