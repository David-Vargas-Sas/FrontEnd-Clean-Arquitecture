import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { IconComponent } from '@/shared/components/icon/icon.component';
@Component({ standalone: true, imports: [RouterLink, IconComponent], template: `<section class="status-page"><span class="empty-icon"><app-icon name="shield"/></span><span class="eyebrow">{{ denied ? 'ACCESO RESTRINGIDO' : 'PÁGINA NO ENCONTRADA' }}</span><h1>{{ denied ? 'Este espacio no está disponible para tu rol.' : 'No encontramos esta página.' }}</h1><p>Regresa al inicio para ver las herramientas disponibles.</p><a routerLink="/inicio" class="button primary">Volver al inicio</a></section>` })
export class NotFoundComponent {
  readonly denied = inject(ActivatedRoute).snapshot.data['denied'] === true;
}
