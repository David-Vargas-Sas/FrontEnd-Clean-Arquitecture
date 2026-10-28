import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ScrollLockService {
  private readonly document = inject(DOCUMENT);
  private locks = 0;
  private restore: (() => void) | null = null;

  lock(): () => void {
    if (this.locks++ === 0) {
      const html = this.document.documentElement;
      const elements = [html, this.document.body];
      const saved = elements.map(element => ({
        element,
        overflow: element.style.getPropertyValue('overflow'),
        priority: element.style.getPropertyPriority('overflow'),
      }));
      const gutter = html.style.getPropertyValue('scrollbar-gutter');
      const gutterPriority = html.style.getPropertyPriority('scrollbar-gutter');
      if (html.scrollHeight > html.clientHeight) html.style.setProperty('scrollbar-gutter', 'stable');
      for (const { element } of saved) element.style.setProperty('overflow', 'hidden');
      this.restore = () => {
        for (const { element, overflow, priority } of saved) {
          if (overflow) element.style.setProperty('overflow', overflow, priority);
          else element.style.removeProperty('overflow');
        }
        if (gutter) html.style.setProperty('scrollbar-gutter', gutter, gutterPriority);
        else html.style.removeProperty('scrollbar-gutter');
      };
    }
    let released = false;
    return () => {
      if (released) return;
      released = true;
      if (--this.locks === 0) { this.restore?.(); this.restore = null; }
    };
  }
}
