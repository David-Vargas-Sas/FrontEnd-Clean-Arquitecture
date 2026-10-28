import { Component, inject } from '@angular/core';
import { ResourcePageComponent } from '@/shared/components/resource-page/resource-page.component';
import { toResourceSource } from '@/shared/models/resource-source.model';
import { UsuariosService } from './usuarios.service';
import { usuariosConfig } from './usuarios.config';

@Component({
  selector: 'app-usuarios', standalone: true, imports: [ResourcePageComponent],
  templateUrl: './usuarios.component.html', styleUrl: './usuarios.component.scss',
})
export class UsuariosComponent {
  readonly config = usuariosConfig;
  private readonly service = inject(UsuariosService);
  readonly source = toResourceSource(this.service);
}
