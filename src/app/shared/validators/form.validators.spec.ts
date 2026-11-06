import { FormControl, Validators } from '@angular/forms';
import { nonBlank, validNumber } from './form.validators';

describe('Validadores de formularios', () => {
  it('rechaza espacios y acepta texto con contenido', () => {
    expect(nonBlank(new FormControl('   '))).toEqual({ required: true });
    expect(nonBlank(new FormControl(' Filtro '))).toBeNull();
  });
  for (const value of [1, '2', 2147483647]) {
    it('acepta una cantidad entera: ' + value, () => expect(validNumber(true)(new FormControl(value))).toBeNull());
  }
  for (const value of [1.5, 'abc', NaN, Infinity]) {
    it('rechaza una cantidad no entera: ' + value, () => expect(validNumber(true)(new FormControl(value))).toEqual({ number: true }));
  }
  for (const value of [0, '25000.50', '9999999999.99']) {
    it('acepta un importe decimal válido: ' + value, () => expect(validNumber(false)(new FormControl(value))).toBeNull());
  }
  for (const value of [-1, '1.234', '1e3', NaN, Infinity, '25.000,50']) {
    it('rechaza un importe sin normalizar o inválido: ' + value, () => expect(validNumber(false)(new FormControl(value))).toEqual({ number: true }));
  }
  it('deja que required controle valores vacíos y min/max controlen los límites', () => {
    for (const value of ['', null]) expect(validNumber(false)(new FormControl(value))).toBeNull();
    const quantity = new FormControl(0, [Validators.required, validNumber(true), Validators.min(1), Validators.max(20)]);
    expect(quantity.hasError('min')).toBeTrue();
    quantity.setValue(21);
    expect(quantity.hasError('max')).toBeTrue();
    quantity.setValue(2);
    expect(quantity.valid).toBeTrue();
  });
});
