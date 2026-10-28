import { Component, Input } from '@angular/core';

const PATHS: Record<string, string> = {
  power: 'M12 2v10 M5.6 5.6a9 9 0 1 0 12.8 0',
  trash: 'M3 6h18 M9 6V3h6v3 M5 6l1 15h12l1-15 M10 10v7 M14 10v7',
  grid: 'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z',
  box: 'M12 3 3 8l9 5 9-5-9-5Z M3 8v10l9 5 9-5V8 M12 13v10 M7 5.5l10 5',
  sale: 'M3 3h2l3 12h10l3-9H6 M9 21h.01 M18 21h.01 M9 18h9',
  users: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M22 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75',
  inventory: 'M3 7h18 M5 7v14h14V7 M3 3h18v4H3z M10 12h4',
  shield: 'M12 3 3 7v5c0 5 9 10 9 10s9-5 9-10V7l-9-4Z M8 12l3 3 5-6',
  history: 'M3 11a9 9 0 1 1 2 7 M3 4v7h7 M12 7v5l3 2',
  plus: 'M12 5v14 M5 12h14', arrow: 'M5 12h14 M13 6l6 6-6 6',
  logout: 'M9 21H3V3h6 M9 12h12 M16 7l5 5-5 5',
  menu: 'M3 6h18 M3 12h18 M3 18h18', close: 'M6 6l12 12 M18 6 6 18',
  edit: 'm16 3 5 5-12 12-6 1 1-6L16 3Z M13 6l5 5',
  check: 'M5 12l4 4L19 6', search: 'M21 21l-6-6 M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0',
};
@Component({ selector: 'app-icon', standalone: true, template: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path [attr.d]="path" /></svg>`, styles: [':host{display:inline-flex;width:20px;height:20px;flex-shrink:0}svg{width:100%;height:100%}'] })
export class IconComponent {
  @Input() name = 'grid';
  get path() { return PATHS[this.name] ?? PATHS['grid']; }
}
