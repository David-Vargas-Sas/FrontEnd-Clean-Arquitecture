import { AbstractControl, ValidatorFn } from '@angular/forms';
export const nonBlank: ValidatorFn = control => typeof control.value === 'string' && !control.value.trim() ? { required: true } : null;
export function validNumber(integer: boolean): ValidatorFn {
  return (control: AbstractControl) => control.value === '' || control.value === null ||
    (integer ? Number.isInteger(Number(control.value)) : /^\d+(\.\d{1,2})?$/.test(String(control.value))) ? null : { number: true };
}
