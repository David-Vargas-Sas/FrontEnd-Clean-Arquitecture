import { AfterViewInit, Component, ElementRef, EventEmitter, inject, Input, OnDestroy, Output, ViewChild } from '@angular/core';
import { ScrollLockService } from '@/core/services/scroll-lock.service';
import { DOCUMENT } from '@angular/common';
import { IconComponent } from '../icon/icon.component';

let modalSequence = 0;

@Component({
  selector: 'app-modal', standalone: true, imports: [IconComponent],
  templateUrl: './modal.component.html', styleUrl: './modal.component.scss',
})
export class ModalComponent implements AfterViewInit, OnDestroy {
  @Input() title = '';
  @Input() subtitle = '';
  @Output() closed = new EventEmitter<void>();
  @ViewChild('dialog', { static: true }) dialog!: ElementRef<HTMLDialogElement>;
  readonly headingId = 'modal-heading-' + ++modalSequence;
  private readonly scrollLock = inject(ScrollLockService);
  private readonly document = inject(DOCUMENT);
  private releaseScroll?: () => void;
  private opener: HTMLElement | null = null;

  ngAfterViewInit() {
    this.opener = this.document.activeElement instanceof HTMLElement ? this.document.activeElement : null;
    this.releaseScroll = this.scrollLock.lock();
    try { this.dialog.nativeElement.showModal(); }
    catch (error) { this.releaseScroll(); throw error; }
  }
  ngOnDestroy() {
    if (this.dialog.nativeElement.open) this.dialog.nativeElement.close();
    this.releaseScroll?.();
    const opener = this.opener;
    queueMicrotask(() => { if (opener?.isConnected) opener.focus({ preventScroll: true }); });
  }
  cancel(event: Event): void { event.preventDefault(); this.closed.emit(); }
  backdrop(event: MouseEvent): void {
    const dialog = this.dialog.nativeElement;
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    // El clic en el contenido o la barra de desplazamiento no es un clic fuera.
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) this.closed.emit();
  }
}
