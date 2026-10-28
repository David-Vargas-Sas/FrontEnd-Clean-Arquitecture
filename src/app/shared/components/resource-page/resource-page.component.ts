import { afterNextRender, Component, ElementRef, Injector, HostListener, computed, EventEmitter, inject, Input, OnDestroy, OnInit, Output, signal, ViewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PageStateService } from '@/core/services/page-state.service';
import { UnsavedChangesService } from '@/core/services/unsaved-changes.service';
import { Row } from '@/models/api/api.model';
import { DEFAULT_PAGE_SIZE } from '@/core/constants/api.constants';
import { LoginService } from '@/modules/login/login.service';
import { errorMessage, NotificationService } from '@/core/services/notification.service';
import { ResourceConfig } from '@/shared/models/resource.model';
import { ResourceSource } from '@/shared/models/resource-source.model';
import { Field, FieldChange, LookupOptions, LookupSources, Option } from '@/shared/models/form.model';
import { RowActionEvent } from '@/shared/models/table.model';
import { IconComponent } from '../icon/icon.component';
import { ModalComponent } from '../modal/modal.component';
import { CreateButtonComponent } from '../create-button/create-button.component';
import { GenericFormComponent } from '../generic-form/generic-form.component';
import { DataTableWrapperComponent } from '../data-table-wrapper/data-table-wrapper.component';

@Component({
  selector: 'app-resource-page', standalone: true,
  imports: [ReactiveFormsModule, IconComponent, ModalComponent, CreateButtonComponent, GenericFormComponent, DataTableWrapperComponent],
  templateUrl: './resource-page.component.html', styleUrl: './resource-page.component.scss',
})
export class ResourcePageComponent implements OnInit, OnDestroy {
  @Input({ required: true }) config!: ResourceConfig;
  @Input({ required: true }) source!: ResourceSource;
  @Input() lookupSources: LookupSources = {};
  @Output() fieldChanged = new EventEmitter<FieldChange>();
  @ViewChild(GenericFormComponent) private formComponent?: GenericFormComponent;
  readonly auth = inject(LoginService);
  private readonly notices = inject(NotificationService);
  readonly rows = signal<Row[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal('');
  readonly modalError = signal('');
  readonly offset = signal(0);
  readonly hasNext = signal(false);
  readonly editor = signal<'create' | 'edit' | null>(null);
  readonly selected = signal<Row | null>(null);
  readonly confirmation = signal<'status' | 'cancel' | 'delete' | null>(null);
  readonly detail = signal<Row | null>(null);
  readonly options = signal<LookupOptions>({});
  readonly lookupsLoading = signal(false);
  readonly lookupError = signal(false);
  readonly actions = computed(() => this.config.rowActions.filter(action => !action.permission || this.auth.can(action.permission)));
  readonly reason = new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(500)] });
  readonly filters = new FormGroup<Record<string, FormControl>>({});
  @ViewChild('discardNotice') private discardNotice?: ElementRef<HTMLElement>;
  private readonly injector = inject(Injector);
  readonly discardPrompt = signal(false);
  private readonly pageState = inject(PageStateService);
  private readonly unsaved = inject(UnsavedChangesService);
  private stateKey() { return this.auth.user()?.id + ':' + this.config.key; }
  private readonly hasUnsaved = () => !!this.editor() && (!!this.formComponent?.form.dirty || this.saving());
  @HostListener('window:beforeunload', ['$event']) beforeUnload(event: BeforeUnloadEvent) { if (this.hasUnsaved()) { event.preventDefault(); event.returnValue = ''; } }
  private appliedFilters: Record<string, unknown> = {};
  private destroyed = false;
  private generation = 0;

  async ngOnInit() {
    for (const field of this.config.filters ?? []) this.filters.addControl(field.key, new FormControl(''));
    const previous = this.pageState.get(this.stateKey());
    if (previous) { this.offset.set(previous.offset); this.filters.patchValue(previous.filters); }
    this.appliedFilters = this.filters.getRawValue();
    this.unsaved.pending = this.hasUnsaved;
    await Promise.all([this.load(), this.loadOptions()]);
  }
  ngOnDestroy() { if (this.unsaved.pending === this.hasUnsaved) this.unsaved.pending = () => false; this.destroyed = true; this.generation++; }
  async load() {
    this.pageState.set(this.stateKey(), { offset: this.offset(), filters: { ...this.appliedFilters } });
    const generation = ++this.generation;
    this.loading.set(true); this.error.set('');
    try {
      const filters: Record<string, string> = {};
      for (const [key, value] of Object.entries(this.appliedFilters)) if (value !== null && value !== '') filters[key] = String(value);
      const page = await this.source.list({ offset: this.offset(), limit: DEFAULT_PAGE_SIZE, filters });
      if (this.destroyed || generation !== this.generation) return;
      if (!page.data.length && this.offset() > 0) { this.offset.update(value => Math.max(0, value - DEFAULT_PAGE_SIZE)); await this.load(); return; }
      this.rows.set(page.data);
      this.hasNext.set(false);
      // El backend no devuelve total: consultar un registro evita páginas vacías.
      if (page.data.length === DEFAULT_PAGE_SIZE) {
        const next = await this.source.list({ offset: this.offset() + DEFAULT_PAGE_SIZE, limit: 1, filters });
        if (!this.destroyed && generation === this.generation) this.hasNext.set(next.data.length > 0);
      }
    } catch (error) { if (!this.destroyed && generation === this.generation) this.error.set(errorMessage(error)); }
    finally { if (!this.destroyed && generation === this.generation) this.loading.set(false); }
  }
  async page(direction: number) { this.offset.update(value => Math.max(0, value + direction * DEFAULT_PAGE_SIZE)); await this.load(); }
  async applyFilters() {
    const values = this.filters.getRawValue();
    if (values['desde'] && values['hasta'] && values['desde'] > values['hasta']) { this.error.set('La fecha inicial debe ser anterior o igual a la fecha final.'); return; }
    this.appliedFilters = values; this.offset.set(0); await this.load();
  }
  async clearFilters() { this.filters.reset(); await this.applyFilters(); }
  async refresh() { await Promise.all([this.load(), this.loadOptions()]); }
  async loadOptions() {
    this.lookupsLoading.set(true); this.lookupError.set(false);
    try {
      const entries = await Promise.all(Object.entries(this.lookupSources).map(async ([name, load]) => [name, await load()] as const));
      if (!this.destroyed) this.options.set(Object.fromEntries(entries));
    } catch (error) {
      if (!this.destroyed) { this.lookupError.set(true); this.error.set(errorMessage(error)); }
    } finally { if (!this.destroyed) this.lookupsLoading.set(false); }
  }
  fieldOptions(field: Field): Option[] { return field.options ?? this.options()[field.source ?? ''] ?? []; }
  lookupOption(source: string, value: unknown) { return this.options()[source]?.find(option => String(option.id) === String(value)); }
  setFieldValue(key: string, value: unknown) { this.formComponent?.setValue(key, value); }
  async openEditor(row?: Row) {
    this.discardPrompt.set(false); this.modalError.set(''); this.selected.set(row ?? null); this.editor.set(row ? 'edit' : 'create');
    await this.loadOptions();
  }
  closeEditor() {
    if (this.saving()) return;
    if (this.hasUnsaved()) { this.discardPrompt.set(true); afterNextRender(() => this.discardNotice?.nativeElement.focus(), { injector: this.injector }); return; }
    this.editor.set(null);
  }
  discardEditor() { this.discardPrompt.set(false); this.editor.set(null); }
  get saleSummary() {
    if (this.config.key !== 'ventas' || !this.formComponent) return null;
    const value = this.formComponent.form.getRawValue();
    const product = this.lookupOption('productos', value['producto_id']);
    const quantity = Number(value['cantidad']);
    const price = Number(value['precio_unitario']);
    const original = this.selected();
    const available = (product?.stock ?? 0) + (this.editor() === 'edit' && String(original?.['producto_id']) === String(value['producto_id']) ? Number(original?.['cantidad'] ?? 0) : 0);
    return { product: product?.label ?? 'Selecciona un producto', available, quantity, price, total: Number.isFinite(quantity * price) ? quantity * price : 0,
      exceeded: !!product && quantity > available, selected: !!product };
  }
  money(value: number) { return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 2 }).format(value); }
  recordName() {
    const row = this.selected();
    if (!row) return '';
    return String(row['nombre'] ?? (this.lookupOption('productos', row['producto_id'])?.label ? 'Venta de ' + this.lookupOption('productos', row['producto_id'])?.label + ' · ' + String(row['fecha']).slice(0, 10) : this.config.singular));
  }
  async save(body: Record<string, unknown>) {
    if (this.saving() || this.lookupsLoading() || this.lookupError()) return;
    if (this.saleSummary?.exceeded) { this.modalError.set('La cantidad supera las existencias disponibles.'); return; }
    this.saving.set(true); this.modalError.set('');
    try {
      if (this.editor() === 'create') {
        if (!this.source.create) throw new Error('Creación no disponible.');
        await this.source.create(body);
      } else {
        if (!this.source.update) throw new Error('Edición no disponible.');
        await this.source.update(this.selected()!.id, body);
      }
      this.editor.set(null);
      this.notices.success('Se guardó ' + (this.config.key === 'ventas' ? 'la ' : 'el ') + this.config.singular + ' correctamente.');
      await this.refresh();
      if (this.config.key === 'usuarios') await this.auth.refresh();
    } catch (error) { this.modalError.set(errorMessage(error)); }
    finally { this.saving.set(false); }
  }
  onRowAction({ event, row }: RowActionEvent) {
    if (event === 'edit') { void this.openEditor(row); return; }
    if (event === 'detail') { this.detail.set(row); return; }
    this.selected.set(row); this.confirmation.set(event); this.modalError.set(''); this.reason.reset();
  }
  closeConfirmation() { if (!this.saving()) this.confirmation.set(null); }
  async execute() {
    if (this.saving()) return;
    if (this.confirmation() === 'cancel' && (!this.reason.value.trim() || this.reason.invalid)) { this.reason.markAsTouched(); return; }
    this.saving.set(true); this.modalError.set('');
    const row = this.selected()!;
    try {
      switch (this.confirmation()) {
        case 'delete':
          if (!this.source.remove) throw new Error('Eliminación no disponible.');
          await this.source.remove(row.id); break;
        case 'status':
          if (!this.source.update) throw new Error('Cambio de estado no disponible.');
          await this.source.update(row.id, { activo: !row['activo'] }); break;
        case 'cancel':
          if (!this.source.cancel) throw new Error('Anulación no disponible.');
          await this.source.cancel(row.id, this.reason.value.trim()); break;
      }
      this.confirmation.set(null); this.notices.success('Operación completada correctamente.');
      await this.refresh(); if (this.config.key === 'usuarios') await this.auth.refresh();
    } catch (error) { this.modalError.set(errorMessage(error)); } finally { this.saving.set(false); }
  }
  pretty(value: unknown) { return value == null ? 'Sin datos anteriores' : JSON.stringify(value, null, 2); }
}
