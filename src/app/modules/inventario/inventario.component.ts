import { Component, inject } from '@angular/core';
import { ResourcePageComponent } from '@/shared/components/resource-page/resource-page.component';
import { toResourceSource } from '@/shared/models/resource-source.model';
import { InventarioService } from './inventario.service';
import { inventarioConfig } from './inventario.config';
import { ProductosService } from '@/modules/productos/productos.service';

@Component({
  selector: 'app-inventario', standalone: true, imports: [ResourcePageComponent],
  templateUrl: './inventario.component.html', styleUrl: './inventario.component.scss',
})
export class InventarioComponent {
  readonly config = inventarioConfig;
  private readonly service = inject(InventarioService);
  readonly source = toResourceSource(this.service);
  private readonly productos = inject(ProductosService);
  readonly lookupSources = { productos: () => this.productos.options() };
}
