import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CurrencyInputDirective } from './currency-input.directive';

@Component({ standalone: true, imports: [ReactiveFormsModule, CurrencyInputDirective], template: '<input appCurrency [formControl]="amount" />' })
class CurrencyHost { readonly amount = new FormControl<number | null>(null); }

describe('Campo monetario con formulario real', () => {
  let fixture: ComponentFixture<CurrencyHost>;
  let input: HTMLInputElement;
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [CurrencyHost] });
    fixture = TestBed.createComponent(CurrencyHost);
    fixture.detectChanges();
    input = fixture.nativeElement.querySelector('input');
  });
  function enter(text: string) { input.value = text; input.dispatchEvent(new Event('input')); fixture.detectChanges(); }
  it('formatea valores del formulario sin cambiar el número guardado', () => {
    fixture.componentInstance.amount.setValue(25000.5);
    expect(input.value).toBe('25.000,50');
    expect(fixture.componentInstance.amount.value).toBe(25000.5);
  });
  for (const [text, value] of [['25.000,50', 25000.5], ['25000', 25000], ['0,01', 0.01], ['1.234.567,89', 1234567.89]] as const) {
    it('convierte ' + text + ' a su importe numérico', () => { enter(text); expect(fixture.componentInstance.amount.value).toBe(value); });
  }
  for (const text of ['abc', '-1', '25,123', '1.2345']) {
    it('no interpreta silenciosamente el importe inválido ' + text, () => { enter(text); expect(fixture.componentInstance.amount.value).toBeNaN(); });
  }
  it('permite vaciar el campo y marcarlo como tocado al perder foco', () => {
    enter('1000'); enter('');
    expect(fixture.componentInstance.amount.value).toBeNull();
    input.dispatchEvent(new Event('blur'));
    expect(fixture.componentInstance.amount.touched).toBeTrue();
    expect(input.value).toBe('');
  });
  it('normaliza al perder el foco y conserva la selección al enfocar', () => {
    enter('25000,5'); input.dispatchEvent(new Event('blur'));
    expect(input.value).toBe('25.000,50');
    input.setSelectionRange(0, input.value.length); input.dispatchEvent(new Event('focus'));
    expect(input.selectionStart).toBe(0);
    expect(input.selectionEnd).toBe(9);
  });
  it('respeta el estado deshabilitado del formulario', () => {
    fixture.componentInstance.amount.disable(); expect(input.disabled).toBeTrue();
    fixture.componentInstance.amount.enable(); expect(input.disabled).toBeFalse();
  });
});
