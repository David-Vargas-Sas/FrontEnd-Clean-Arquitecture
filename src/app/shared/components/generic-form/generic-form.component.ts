import { Component, ElementRef, inject, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Row } from '@/models/api/api.model';
import { Field, FieldChange, LookupOptions, Option } from '@/shared/models/form.model';
import { nonBlank, validNumber } from '@/shared/validators/form.validators';

import { CurrencyInputDirective } from '@/shared/directives/currency-input.directive';

let formSequence = 0;

@Component({ selector: 'app-generic-form', standalone: true, imports: [ReactiveFormsModule, CurrencyInputDirective], templateUrl: './generic-form.component.html', styleUrl: './generic-form.component.scss' })
export class GenericFormComponent implements OnChanges, OnDestroy {
  private readonly element: ElementRef<HTMLElement> = inject(ElementRef);
  readonly formId = 'resource-form-' + ++formSequence;
  @Input() showActions = true;
  @Input() fields: Field[] = [];
  @Input() mode: 'create' | 'edit' = 'create';
  @Input() initialData: Row | null = null;
  @Input() options: LookupOptions = {};
  @Input() saving = false;
  @Input() loading = false;
  @Input() blocked = false;
  @Input() error = '';
  @Input() externalErrors: Record<string, string> = {};
  @Input() submitLabel = 'Guardar';
  @Output() submitted = new EventEmitter<Record<string, unknown>>();
  @Output() cancelled = new EventEmitter<void>();
  @Output() fieldChanged = new EventEmitter<FieldChange>();
  form = new FormGroup<Record<string, FormControl>>({});
  private subscriptions: Subscription[] = [];
  ngOnChanges(changes: SimpleChanges) {
    if (changes['fields'] || changes['initialData'] || changes['mode']) this.buildForm();
  }
  ngOnDestroy() { this.subscriptions.forEach(subscription => subscription.unsubscribe()); }
  private buildForm() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe()); this.subscriptions = [];
    const controls: Record<string, FormControl> = {};
    for (const field of this.fields) {
      const validators: ValidatorFn[] = [];
      if (field.required || field.requiredOnCreate && this.mode === 'create') validators.push(Validators.required, nonBlank);
      if (field.maxLength) validators.push(Validators.maxLength(field.maxLength));
      if (field.minLength) validators.push(Validators.minLength(field.minLength));
      if (field.type === 'email') validators.push(Validators.email);
      if (field.min !== undefined) validators.push(Validators.min(field.min));
      if (field.max !== undefined) validators.push(Validators.max(field.max));
      if ((field.type === 'number' || field.type === 'money')) validators.push(validNumber(field.step === '1'));
      let value: unknown = this.initialData?.[field.key] ?? field.defaultValue ?? '';
      if (field.type === 'password') value = '';
      if (field.type === 'date') value = this.initialData ? String(value).slice(0, 10) : this.localDate();
      controls[field.key] = new FormControl(value, validators);
      this.subscriptions.push(controls[field.key].valueChanges.subscribe(value => this.fieldChanged.emit({ key: field.key, value })));
    }
    this.form = new FormGroup(controls);
  }
  fieldOptions(field: Field): Option[] { return field.options ?? this.options[field.source ?? ''] ?? []; }
  setValue(key: string, value: unknown) { this.form.controls[key]?.setValue(value, { emitEvent: false }); }
  localDate() { const date = new Date(); return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-'); }
  fieldError(field: Field): string {
    if (this.externalErrors[field.key]) return this.externalErrors[field.key];
    const control = this.form.controls[field.key];
    if (!control?.touched || !control.invalid) return '';
    if (control.hasError('required')) return 'Este campo es obligatorio.';
    if (control.hasError('email')) return 'Ingresa un correo válido.';
    if (control.hasError('minlength')) return 'Usa al menos ' + field.minLength + ' caracteres.';
    if (control.hasError('maxlength')) return 'Máximo ' + field.maxLength + ' caracteres.';
    if (control.hasError('number')) return field.type === 'money' ? 'Ingresa un importe válido con hasta dos decimales.' : 'Ingresa una cantidad válida.';
    if (control.hasError('max')) return 'El valor máximo es ' + field.max + '.';
    if (control.hasError('min')) return 'El valor mínimo es ' + field.min + '.';
    return 'Revisa el valor ingresado.';
  }
  submit() {
    if (this.form.invalid || this.saving || this.loading || this.blocked) { this.form.markAllAsTouched();
      const invalid = this.fields.find(field => this.form.controls[field.key]?.invalid);
      if (invalid) this.element.nativeElement.querySelector<HTMLElement>('#field-' + invalid.key)?.focus();
      return; }
    const body = this.form.getRawValue();
    for (const field of this.fields) {
      if ((field.type === 'number' || field.type === 'money') || field.valueType === 'number') body[field.key] = Number(body[field.key]);
      else if (typeof body[field.key] === 'string' && field.type !== 'password') body[field.key] = body[field.key].trim();
      if (field.type === 'password' && this.mode === 'edit' && !body[field.key]) delete body[field.key];
    }
    this.submitted.emit(body);
  }
}
