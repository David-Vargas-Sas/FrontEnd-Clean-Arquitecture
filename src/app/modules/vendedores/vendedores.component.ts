import { Component, inject } from '@angular/core';
import { ResourcePageComponent } from '@/shared/components/resource-page/resource-page.component';
import { toResourceSource } from '@/shared/models/resource-source.model';
import { VendedoresService } from './vendedores.service';
import { vendedoresConfig } from './vendedores.config';

@Component({
  selector: 'app-vendedores', standalone: true, imports: [ResourcePageComponent],
  templateUrl: './vendedores.component.html', styleUrl: './vendedores.component.scss',
})
export class VendedoresComponent {
  readonly config = vendedoresConfig;
  private readonly service = inject(VendedoresService);
  readonly source = toResourceSource(this.service);
}
