import { Component, inject } from '@angular/core';
import { ResourcePageComponent } from '@/shared/components/resource-page/resource-page.component';
import { toResourceSource } from '@/shared/models/resource-source.model';
import { AuditoriaService } from './auditoria.service';
import { auditoriaConfig } from './auditoria.config';

@Component({
  selector: 'app-auditoria', standalone: true, imports: [ResourcePageComponent],
  templateUrl: './auditoria.component.html', styleUrl: './auditoria.component.scss',
})
export class AuditoriaComponent {
  readonly config = auditoriaConfig;
  private readonly service = inject(AuditoriaService);
  readonly source = toResourceSource(this.service);
}
