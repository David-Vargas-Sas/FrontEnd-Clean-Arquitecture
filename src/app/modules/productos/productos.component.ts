import { Component, inject } from '@angular/core';
import { ResourcePageComponent } from '@/shared/components/resource-page/resource-page.component';
import { toResourceSource } from '@/shared/models/resource-source.model';
import { ProductosService } from './productos.service';
import { productosConfig } from './productos.config';

@Component({
  selector: 'app-productos', standalone: true, imports: [ResourcePageComponent],
  templateUrl: './productos.component.html', styleUrl: './productos.component.scss',
})
export class ProductosComponent {
  readonly config = productosConfig;
  private readonly service = inject(ProductosService);
  readonly source = toResourceSource(this.service);
}
