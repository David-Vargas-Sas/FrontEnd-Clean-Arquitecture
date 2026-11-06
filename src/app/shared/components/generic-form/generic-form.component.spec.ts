import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GenericFormComponent } from './generic-form.component';
import { Field } from '@/shared/models/form.model';

describe('Formulario genérico', () => {
  let fixture: ComponentFixture<GenericFormComponent>;
  let component: GenericFormComponent;
  const fields: Field[] = [
    { key: 'nombre', label: 'Nombre', type: 'text', required: true, maxLength: 10 },
    { key: 'cantidad', label: 'Cantidad', type: 'number', required: true, min: 1, max: 20, step: '1' },
    { key: 'precio', label: 'Precio', type: 'money', required: true, min: 0, max: 100000, step: '0.01' },
  ];
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [GenericFormComponent] }).compileComponents();
    fixture = TestBed.createComponent(GenericFormComponent);
    component = fixture.componentInstance;
  });
  function build(config: Field[] = fields, mode: 'create' | 'edit' = 'create', data: Record<string, unknown> | null = null) {
    fixture.componentRef.setInput('fields', config);
    fixture.componentRef.setInput('mode', mode);
    fixture.componentRef.setInput('initialData', data);
    fixture.detectChanges();
  }
  function valid() { component.form.setValue({ nombre: ' Filtro ', cantidad: '2', precio: 25000.5 }); }
  it('construye controles desde los campos y muestra etiquetas asociadas', () => {
    build();
    expect(Object.keys(component.form.controls)).toEqual(['nombre', 'cantidad', 'precio']);
    expect(fixture.nativeElement.querySelector('label[for="field-nombre"]').textContent).toContain('Nombre');
    expect(fixture.nativeElement.querySelector('#field-nombre').getAttribute('aria-describedby')).toBe('help-nombre');
  });
  it('no emite datos inválidos y enfoca el primer campo con error', () => {
    build(); const emitted = spyOn(component.submitted, 'emit');
    component.submit(); fixture.detectChanges();
    expect(emitted).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(fixture.nativeElement.querySelector('#field-nombre'));
    expect(component.fieldError(fields[0])).toContain('obligatorio');
  });
  it('emite textos recortados e importes y cantidades numéricos', () => {
    build(); valid(); const emitted = spyOn(component.submitted, 'emit'); component.submit();
    expect(emitted).toHaveBeenCalledOnceWith({ nombre: 'Filtro', cantidad: 2, precio: 25000.5 });
  });
  for (const state of ['saving', 'loading', 'blocked'] as const) {
    it('evita guardar cuando ' + state + ' está activo', () => {
      build(); valid(); fixture.componentRef.setInput(state, true); fixture.detectChanges();
      const emitted = spyOn(component.submitted, 'emit'); component.submit(); expect(emitted).not.toHaveBeenCalled();
    });
  }
  for (const [key, value, message] of [['nombre', '            ', 'obligatorio'], ['nombre', 'nombre demasiado largo', 'Máximo'], ['cantidad', 0, 'mínimo'], ['cantidad', 21, 'máximo'], ['cantidad', 1.5, 'cantidad válida'], ['precio', 1.234, 'dos decimales']] as const) {
    it('explica el error de ' + key + ': ' + String(value), () => {
      build(); valid(); component.form.controls[key].setValue(value); component.form.controls[key].markAsTouched();
      expect(component.fieldError(fields.find(field => field.key === key)!)).toContain(message);
      expect(component.form.invalid).toBeTrue();
    });
  }
  it('exige contraseña al crear y la omite al editar si está vacía', () => {
    const password: Field = { key: 'password', label: 'Contraseña', type: 'password', requiredOnCreate: true, minLength: 12 };
    build([password]); expect(component.form.invalid).toBeTrue();
    fixture.componentRef.setInput('mode', 'edit'); fixture.componentRef.setInput('initialData', { id: 1 }); fixture.detectChanges();
    expect(component.form.valid).toBeTrue(); const emitted = spyOn(component.submitted, 'emit'); component.submit();
    expect(emitted).toHaveBeenCalledOnceWith({});
  });
  it('conserva exactamente la contraseña escrita y valida la longitud', () => {
    const password: Field = { key: 'password', label: 'Contraseña', type: 'password', required: true, minLength: 12 };
    build([password]); component.form.controls['password'].setValue('corta'); component.form.controls['password'].markAsTouched();
    expect(component.fieldError(password)).toContain('12');
    component.form.controls['password'].setValue('  contraseña larga  ');
    const emitted = spyOn(component.submitted, 'emit'); component.submit();
    expect(emitted).toHaveBeenCalledOnceWith({ password: '  contraseña larga  ' });
  });
  it('valida email y presenta los errores externos asociados al campo', () => {
    const email: Field = { key: 'email', label: 'Correo', type: 'email', required: true };
    build([email]); component.form.controls['email'].setValue('incorrecto'); component.form.controls['email'].markAsTouched();
    expect(component.fieldError(email)).toContain('correo');
    fixture.componentRef.setInput('externalErrors', { email: 'El correo ya está registrado.' }); fixture.detectChanges();
    expect(component.fieldError(email)).toBe('El correo ya está registrado.');
    expect(fixture.nativeElement.querySelector('#field-email').getAttribute('aria-invalid')).toBe('true');
  });
  it('carga opciones y fechas al editar y deshabilita opciones inactivas', () => {
    build([{ key: 'producto_id', label: 'Producto', type: 'select', source: 'productos', valueType: 'number' }, { key: 'fecha', label: 'Fecha', type: 'date' }], 'edit', { id: 1, producto_id: 2, fecha: '2026-10-28T00:00:00Z' });
    fixture.componentRef.setInput('options', { productos: [{ id: 2, label: 'Filtro', activo: false, stock: 0 }] }); fixture.detectChanges();
    expect(component.form.controls['fecha'].value).toBe('2026-10-28');
    expect(fixture.nativeElement.querySelector('option[value="2"]').disabled).toBeTrue();
    const emitted = spyOn(component.submitted, 'emit'); component.submit();
    expect(emitted).toHaveBeenCalledOnceWith({ producto_id: 2, fecha: '2026-10-28' });
  });
  it('las sugerencias del módulo no vuelven a disparar eventos de cambio', () => {
    build(); const changed = spyOn(component.fieldChanged, 'emit'); component.setValue('precio', 1000);
    expect(changed).not.toHaveBeenCalled(); expect(component.form.controls['precio'].value).toBe(1000);
    component.form.controls['cantidad'].setValue(3);
    expect(changed).toHaveBeenCalledOnceWith({ key: 'cantidad', value: 3 });
  });
  it('deja de emitir cambios de controles anteriores al reconstruirse', () => {
    build(); const old = component.form.controls['nombre']; const changed = spyOn(component.fieldChanged, 'emit');
    fixture.componentRef.setInput('fields', [{ key: 'email', label: 'Correo', type: 'email' }]); fixture.detectChanges();
    old.setValue('Anterior'); expect(changed).not.toHaveBeenCalled();
  });
});
