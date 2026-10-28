import { Component, inject } from '@angular/core';
import { ResourcePageComponent } from '@/shared/components/resource-page/resource-page.component';
import { toResourceSource } from '@/shared/models/resource-source.model';
import { VentasService } from './ventas.service';
import { ventasConfig } from './ventas.config';
import { ProductosService } from '@/modules/productos/productos.service';
import { VendedoresService } from '@/modules/vendedores/vendedores.service';
import { FieldChange } from '@/shared/models/form.model';

@Component({
  selector: 'app-ventas', standalone: true, imports: [ResourcePageComponent],
  templateUrl: './ventas.component.html', styleUrl: './ventas.component.scss',
})
export class VentasComponent {
  readonly config = ventasConfig;
  private readonly service = inject(VentasService);
  readonly source = toResourceSource(this.service, { cancel: (id, reason) => this.service.anular(id, reason) });
  private readonly productos = inject(ProductosService);
  private readonly vendedores = inject(VendedoresService);
  readonly lookupSources = { productos: () => this.productos.options(), vendedores: () => this.vendedores.options() };
  onFieldChanged(event: FieldChange, page: ResourcePageComponent) {
    if (event.key !== 'producto_id') return;
    const product = page.lookupOption('productos', event.value);
    if (product?.precio !== undefined) page.setFieldValue('precio_unitario', product.precio);
  }
}
