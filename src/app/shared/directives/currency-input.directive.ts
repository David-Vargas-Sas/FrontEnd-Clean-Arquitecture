import { Directive, ElementRef, HostListener, forwardRef, inject } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Directive({ selector: 'input[appCurrency]', standalone: true, providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => CurrencyInputDirective), multi: true }] })
export class CurrencyInputDirective implements ControlValueAccessor {
  private readonly input = inject(ElementRef<HTMLInputElement>).nativeElement;
  private value: number | null = null;
  private editing = false;
  private changed: (value: number | null) => void = () => {};
  private touched = () => {};
  writeValue(value: unknown) {
    this.value = value === '' || value === null || value === undefined ? null : Number(value);
    this.render();
  }
  registerOnChange(fn: (value: number | null) => void) { this.changed = fn; }
  registerOnTouched(fn: () => void) { this.touched = fn; }
  setDisabledState(disabled: boolean) { this.input.disabled = disabled; }
  @HostListener('focus') focus() { this.editing = true; }
  @HostListener('input') update() {
    const text = this.input.value.trim();
    const valid = /^(?:[0-9]+|[0-9]{1,3}(?:\.[0-9]{3})+)(?:,[0-9]{0,2})?$/.test(text);
    this.value = text === '' ? null : valid ? Number(text.replaceAll('.', '').replace(',', '.')) : NaN;
    this.changed(this.value);
  }
  @HostListener('blur') blur() { this.editing = false; this.render(); this.touched(); }
  private render() {
    if (this.value === null) { this.input.value = ''; return; }
    if (!Number.isFinite(this.value)) return;
    this.input.value = this.editing ? String(this.value).replace('.', ',') : new Intl.NumberFormat('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(this.value);
  }
}
