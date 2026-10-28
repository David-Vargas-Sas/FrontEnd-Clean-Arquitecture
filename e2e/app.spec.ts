import { expect, Page, test } from '@playwright/test';

const grants: Record<string, string[]> = {
  ADMIN: ['productos:read','productos:create','productos:update','productos:delete','vendedores:read','vendedores:create','vendedores:update','vendedores:delete','ventas:read','ventas:create','ventas:update','inventario:read','inventario:create','usuarios:read','usuarios:create','usuarios:update','auditoria:read'],
  VENDEDOR: ['productos:read','vendedores:read','ventas:read','ventas:create'],
  INVENTARIO: ['productos:read','productos:create','productos:update','inventario:read','inventario:create'],
};

async function setup(page: Page, role = 'ADMIN', productCount = 12) {
  page.on('pageerror', error => console.error('BROWSER ERROR:', error.message));
  const profile = { id: 1, nombre: 'David', email: 'admin@example.com', rol: role, permisos: grants[role] };
  const products = Array.from({ length: productCount }, (_, index) => ({ id: index + 1, nombre: 'Producto ' + (index + 1), descripcion: 'Repuesto de prueba', precio: '25000.00', stock: 20, activo: true }));
  const sellers = [{ id: 1, nombre: 'Ana Pérez', email: 'ana@example.com', activo: true }];
  const sales = [{ id: 1, producto_id: 1, vendedor_id: 1, cantidad: 2, precio_unitario: '25000.00', total: '50000.00', fecha: '2026-10-28', estado: 'REGISTRADA' }];
  const users = [{ id: 2, nombre: 'Operador', email: 'operator@example.com', rol: 'VENDEDOR', activo: true, creado_en: '2026-10-28T12:00:00Z' }];
  const movements: object[] = [];
  const writes: { path: string; body: Record<string, unknown> }[] = [];
  await page.route('**/api/**', async route => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname.replace('/api/', '');
    const method = request.method();
    const send = (body: unknown, status = 200) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
    if (path === 'auth/login') {
      if (request.postDataJSON().password !== 'correct-password-123') return send({ error: { code: 'UNAUTHENTICATED', message: 'Email o contraseña incorrectos.' } }, 401);
      return send({ data: { accessToken: 'test-token', expiresIn: 900, tokenType: 'Bearer', user: profile } });
    }
    if (path === 'auth/me') return send({ data: profile });
    const records: Record<string, object[]> = { productos: products, vendedores: sellers, ventas: sales, usuarios: users, 'inventario/movimientos': movements, auditoria: [{ id: 1, entidad: 'usuarios', registro_id: 7, accion: 'EDITAR', usuario_id: 1, creado_en: '2026-10-28T12:00:00Z', antes: { activo: true }, despues: { activo: false } }] };
    if (method === 'GET' && records[path]) {
      const limit = Number(url.searchParams.get('limit') ?? 10), offset = Number(url.searchParams.get('offset') ?? 0);
      let filtered = records[path];
      const search = url.searchParams.get('q')?.toLowerCase();
      if (search) filtered = filtered.filter(row => String((row as Record<string, unknown>)['nombre']).toLowerCase().includes(search));
      const active = url.searchParams.get('activo');
      if (active) filtered = filtered.filter(row => String((row as Record<string, unknown>)['activo']) === active);
      return send({ data: filtered.slice(offset, offset + limit), pagination: { limit, offset } });
    }
    const body = request.postDataJSON() as Record<string, unknown>;
    writes.push({ path, body });
    if (method === 'POST') {
      const row = { id: 20, ...body };
      if (path === 'productos') products.push({ ...row, descripcion: String(body['descripcion'] ?? ''), precio: String(body['precio']), nombre: String(body['nombre']), stock: 0, activo: true });
      if (path === 'ventas') sales.push({ ...row, producto_id: Number(body['producto_id']), vendedor_id: Number(body['vendedor_id']), cantidad: Number(body['cantidad']), precio_unitario: String(body['precio_unitario']), total: '50000.00', fecha: String(body['fecha']), estado: 'REGISTRADA' });
      if (path === 'inventario/movimientos') movements.push({ ...row, cantidad: -Number(body['cantidad']), stock_resultante: 18, creado_en: '2026-10-28T12:00:00Z' });
      return send({ data: row }, 201);
    }
    if (method === 'PATCH') {
      const [resource, id] = path.split('/');
      const row = records[resource]?.find(value => (value as {id:number}).id === Number(id));
      if (row) Object.assign(row, body);
      return send({ data: { id: Number(id), ...body } });
    }
    return send({ error: { message: 'Ruta no simulada' } }, 404);
  });
  return { writes };
}
async function login(page: Page) {
  await page.goto('/login');
  await page.screenshot({ path: 'test-results/autos-login.png', fullPage: true });
  await page.getByLabel('Correo electrónico', { exact: true }).fill('admin@example.com');
  await page.getByLabel('Contraseña', { exact: true }).fill('correct-password-123');
  await page.getByRole('button', { name: 'Ingresar', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Hola, David.' })).toBeVisible();
}

test('login, error de credenciales, catálogo paginado y creación de producto', async ({ page }) => {
  const { writes } = await setup(page);
  await page.goto('/login');
  await page.getByLabel('Correo electrónico', { exact: true }).fill('admin@example.com');
  await page.getByLabel('Contraseña', { exact: true }).fill('incorrecta');
  await page.getByRole('button', { name: 'Ingresar', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Correo o contraseña incorrectos');
  await login(page);
  await page.screenshot({ path: 'test-results/autos-inicio-desktop.png', fullPage: true });
  await page.getByRole('link', { name: 'Productos', exact: true }).click();
  await expect(page.locator('tbody tr')).toHaveCount(10);
  await page.getByRole('button', { name: 'Siguiente', exact: true }).click();
  await expect(page.locator('tbody tr')).toHaveCount(2);
  await page.getByRole('button', { name: 'Crear producto', exact: true }).click();
  await page.getByLabel('Nombre del producto').fill('Filtro nuevo');
  await page.getByLabel('Precio de venta').fill('45000');
  await page.getByRole('button', { name: 'Guardar producto' }).click();
  await expect(page.getByRole('status')).toContainText('Se guardó el producto');
  expect(writes[0].body['nombre']).toBe('Filtro nuevo');
  expect(writes[0].body).not.toHaveProperty('stock');
});

test('vendedor no ve administración y registra una venta con referencias válidas', async ({ page }) => {
  const { writes } = await setup(page, 'VENDEDOR');
  await login(page);
  await expect(page.getByRole('link', { name: 'Usuarios', exact: true })).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Inventario', exact: true })).toHaveCount(0);
  await page.getByRole('link', { name: 'Productos', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Crear producto' })).toHaveCount(0);
  await page.getByRole('link', { name: 'Ventas', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Anular', exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Crear venta', exact: true }).click();
  await page.getByLabel(/^Producto\s*\*/).selectOption('1');
  await page.getByLabel(/^Vendedor\s*\*/).selectOption('1');
  await page.getByLabel(/^Cantidad\s*\*/).fill('2');
  await expect(page.getByLabel('Precio por unidad')).toHaveValue('25.000,00');
  await page.getByLabel('Precio por unidad').fill('25.000,50');
  await page.getByLabel('Precio por unidad').blur();
  await expect(page.getByLabel('Precio por unidad')).toHaveValue('25.000,50');
  await page.getByRole('button', { name: 'Guardar venta' }).click();
  await expect(page.getByRole('status')).toContainText('Se guardó la venta');
  expect(writes[0].body['producto_id']).toBe(1);
  expect(writes[0].body['precio_unitario']).toBe(25000.5);
  expect(writes[0].body).not.toHaveProperty('registrado_por');
  await page.goto('/usuarios');
  await expect(page.getByRole('heading', { name: 'Este espacio no está disponible para tu rol.' })).toBeVisible();
});

test('administrador anula con motivo y no ofrece eliminar ventas', async ({ page }) => {
  const { writes } = await setup(page);
  await login(page);
  await page.getByRole('link', { name: 'Ventas', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Eliminar', exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Anular', exact: true }).click();
  await page.getByRole('button', { name: 'Confirmar', exact: true }).click();
  await expect(page.getByText('Escribe un motivo de hasta 500 caracteres.')).toBeVisible();
  await page.getByLabel('Motivo de la anulación').fill('Solicitud del cliente');
  await page.getByRole('button', { name: 'Confirmar', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Operación completada');
  expect(writes[0].body).toEqual({ estado: 'ANULADA', motivo_anulacion: 'Solicitud del cliente' });
  await expect(page.getByRole('button', { name: 'Anular', exact: true })).toHaveCount(0);
});

test('inventario registra salida y la interfaz se adapta a móvil', async ({ page }) => {
  const { writes } = await setup(page, 'INVENTARIO');
  await login(page);
  await page.getByRole('link', { name: 'Inventario', exact: true }).click();
  await page.getByRole('button', { name: 'Registrar movimiento' }).click();
  await page.getByLabel(/^Producto\s*\*/).selectOption('1');
  await page.getByLabel('Tipo de movimiento').selectOption('SALIDA');
  await page.getByLabel(/^Cantidad\s*\*/).fill('2');
  await page.getByLabel('Motivo del movimiento').fill('Mercancía dañada');
  await page.getByRole('button', { name: 'Guardar movimiento' }).click();
  await expect(page.getByRole('status')).toContainText('Se guardó el movimiento');
  expect(writes[0].body).toMatchObject({ tipo: 'SALIDA', cantidad: 2 });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/inicio');
  await expect(page.getByRole('heading', { name: 'Hola, David.' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: 'test-results/autos-inicio-mobile.png', fullPage: true });
  await page.getByRole('button', { name: 'Abrir menú' }).click();
  await expect(page.getByRole('link', { name: 'Inventario', exact: true })).toBeVisible();
});

test('editar usuario conserva contraseña si el campo se deja vacío', async ({ page }) => {
  const { writes } = await setup(page);
  await login(page);
  await page.getByRole('link', { name: 'Usuarios', exact: true }).click();
  await page.getByRole('button', { name: 'Editar usuario 2', exact: true }).click();
  await page.getByLabel('Nombre completo').fill('Operador actualizado');
  await page.getByRole('button', { name: 'Guardar usuario' }).click();
  await expect(page.getByRole('status')).toContainText('Se guardó el usuario');
  expect(writes[0].body['nombre']).toBe('Operador actualizado');
  expect(writes[0].body).not.toHaveProperty('password');
});

test('login real y lectura de productos con PostgreSQL, sin escrituras', async ({ page }) => {
  test.skip(!process.env['E2E_EMAIL'] || !process.env['E2E_PASSWORD'], 'Se ejecuta solo con credenciales de prueba en el entorno.');
  await page.goto('/login');
  await page.getByLabel('Correo electrónico', { exact: true }).fill(process.env['E2E_EMAIL']!);
  await page.getByLabel('Contraseña', { exact: true }).fill(process.env['E2E_PASSWORD']!);
  await page.getByRole('button', { name: 'Ingresar', exact: true }).click();
  await expect(page).toHaveURL(/\/inicio$/);
  await page.getByRole('link', { name: 'Productos', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Productos.' })).toBeVisible();
  await expect(page.locator('.table-scroll[aria-busy="true"]')).toHaveCount(0);
  await expect(page.getByRole('alert')).toHaveCount(0);
});


test('tabla dinámica permite elegir columnas y Tailwind distribuye el formulario', async ({ page }) => {
  await setup(page);
  await login(page);
  await page.getByRole('link', { name: 'Productos', exact: true }).click();
  await expect(page.getByRole('columnheader', { name: 'Descripción', exact: true })).toBeVisible();
  await page.locator('summary').filter({ hasText: 'Columnas' }).click();
  await page.getByRole('checkbox', { name: 'Descripción', exact: true }).uncheck();
  await expect(page.getByRole('columnheader', { name: 'Descripción', exact: true })).toHaveCount(0);
  await page.locator('summary').filter({ hasText: 'Columnas' }).click();
  await page.getByRole('button', { name: 'Actualizar', exact: true }).click();
  await expect(page.getByRole('columnheader', { name: 'Descripción', exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Crear producto', exact: true }).click();
  const grid = page.locator('app-generic-form .grid');
  await expect(grid).toBeVisible();
  expect(await grid.evaluate(element => getComputedStyle(element).display)).toBe('grid');
  expect(await grid.evaluate(element => getComputedStyle(element).columnGap)).toBe('20px');
  const button = page.getByRole('button', { name: 'Crear producto', exact: true });
  expect(await button.evaluate(element => getComputedStyle(element).backgroundColor)).toBe('rgb(164, 42, 135)');
});

test('vendedores y auditoría consumen su módulo y conservan filtros y detalle', async ({ page }) => {
  const { writes } = await setup(page);
  await login(page);
  await page.getByRole('link', { name: 'Vendedores', exact: true }).click();
  await page.getByRole('button', { name: 'Crear vendedor', exact: true }).click();
  await page.getByLabel('Nombre completo').fill('Nuevo vendedor');
  await page.getByLabel(/^Correo electrónico\s*\*/).fill('nuevo@example.com');
  await page.getByRole('button', { name: 'Guardar vendedor', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Se guardó el vendedor');
  expect(writes[0]).toMatchObject({ path: 'vendedores', body: { nombre: 'Nuevo vendedor', email: 'nuevo@example.com' } });
  await page.getByRole('link', { name: 'Auditoría', exact: true }).click();
  await page.getByRole('combobox', { name: 'Entidad', exact: true }).selectOption('usuarios');
  await page.getByLabel('ID del registro', { exact: true }).fill('7');
  const filtered = page.waitForRequest(request => {
    const url = new URL(request.url());
    return url.pathname === '/api/auditoria' && url.searchParams.get('entidad') === 'usuarios' && url.searchParams.get('registro_id') === '7';
  });
  await page.getByRole('button', { name: 'Filtrar', exact: true }).click();
  await filtered;
  await page.getByRole('button', { name: 'Ver detalle', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Antes del cambio', exact: true })).toBeVisible();
  await expect(page.locator('pre').first()).toContainText('true');
  await expect(page.locator('pre').last()).toContainText('false');
});

test('una última página con exactamente diez registros no ofrece una página vacía', async ({ page }) => {
  await setup(page, 'ADMIN', 10);
  await login(page);
  await page.getByRole('link', { name: 'Productos', exact: true }).click();
  await expect(page.locator('tbody tr')).toHaveCount(10);
  await expect(page.getByRole('button', { name: 'Siguiente', exact: true })).toBeDisabled();
});


for (const viewport of [
  { width: 1440, height: 900 },
  { width: 1024, height: 600 },
  { width: 853, height: 480 },
  { width: 640, height: 360 },
  { width: 390, height: 844 },
  { width: 320, height: 568 },
  { width: 844, height: 390 },
]) {
  test('modal centrado y contenido accesible ' + viewport.width + 'x' + viewport.height, async ({ page }) => {
    await page.setViewportSize(viewport);
    await setup(page);
    await login(page);
    await page.goto('/usuarios');
    const create = page.getByRole('button', { name: 'Crear usuario', exact: true });
    await create.click();
    const modal = page.getByRole('dialog');
    await expect(modal).toBeVisible();
    const box = await modal.boundingBox();
    expect(box).not.toBeNull();
    expect(Math.abs(box!.x + box!.width / 2 - viewport.width / 2)).toBeLessThanOrEqual(10);
    expect(Math.abs(box!.y + box!.height / 2 - viewport.height / 2)).toBeLessThanOrEqual(2);
    expect(box!.x).toBeGreaterThanOrEqual(8);
    expect(box!.y).toBeGreaterThanOrEqual(8);
    expect(box!.x + box!.width).toBeLessThanOrEqual(viewport.width - 8);
    expect(box!.y + box!.height).toBeLessThanOrEqual(viewport.height - 8);
    const sizes = await page.evaluate(() => ({
      documentWidth: document.documentElement.scrollWidth,
      viewportWidth: window.innerWidth,
      overflow: getComputedStyle(document.documentElement).overflowY,
      dialogWidth: document.querySelector('dialog')!.clientWidth,
      dialogScrollWidth: document.querySelector('dialog')!.scrollWidth,
    }));
    expect(sizes.documentWidth).toBeLessThanOrEqual(sizes.viewportWidth);
    expect(sizes.dialogScrollWidth).toBeLessThanOrEqual(sizes.dialogWidth + 1);
    expect(sizes.overflow).toBe('hidden');
    await modal.getByLabel('Nombre completo').fill('Operador responsive');
    await modal.getByLabel(/^Correo electrónico/).fill('responsive@example.com');
    await modal.getByLabel('Rol de acceso').selectOption('INVENTARIO');
    await modal.getByLabel('Contraseña', { exact: false }).fill('Contraseña de prueba larga');
    await modal.getByLabel('Contraseña', { exact: false }).scrollIntoViewIfNeeded();
    await expect(modal.getByLabel('Contraseña', { exact: false })).toBeInViewport({ ratio: 0.99 });
    const save = modal.getByRole('button', { name: 'Guardar usuario', exact: true });
    await expect(save).toBeInViewport({ ratio: 0.99 });
    if ([853, 390].includes(viewport.width)) await page.screenshot({ path: 'test-results/modal-usuario-' + viewport.width + '.png' });
    await page.getByRole('button', { name: 'Cerrar ventana', exact: true }).click();
    await page.getByRole('button', { name: 'Descartar cambios', exact: true }).click();
    await expect(modal).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.style.overflow)).not.toBe('hidden');
    await expect(create).toBeFocused();
  });
}

test('crear producto conserva centrado y desplazamiento interno al ampliar contenido', async ({ page }) => {
  await page.setViewportSize({ width: 853, height: 480 });
  await setup(page);
  await login(page);
  await page.goto('/productos');
  await page.getByRole('button', { name: 'Crear producto', exact: true }).click();
  const modal = page.getByRole('dialog');
  await modal.getByLabel('Nombre del producto').fill('Producto responsive');
  await modal.getByLabel('Descripción', { exact: true }).fill('Descripción de un producto para comprobar el formulario.');
  await modal.getByLabel('Precio de venta').fill('25000');
  await modal.getByLabel('Precio de venta').scrollIntoViewIfNeeded();
  await expect(modal.getByLabel('Precio de venta')).toBeInViewport({ ratio: 0.99 });
  await expect(modal.getByRole('button', { name: 'Guardar producto', exact: true })).toBeInViewport({ ratio: 0.99 });
  await page.screenshot({ path: 'test-results/modal-producto-responsive.png' });
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Descartar cambios', exact: true }).click();
  await expect(modal).toHaveCount(0);
});


test('navegación móvil controla foco, teclado, permisos y scroll', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 620 });
  await setup(page, 'VENDEDOR');
  await login(page);
  const trigger = page.getByRole('button', { name: 'Abrir menú', exact: true });
  await expect(page.getByRole('navigation')).not.toBeVisible();
  await trigger.click();
  const drawer = page.getByRole('dialog', { name: 'Menú principal' });
  await expect(drawer).toBeVisible();
  await expect(drawer.getByRole('button', { name: 'Cerrar menú' })).toBeFocused();
  await expect(drawer.getByRole('link', { name: 'Usuarios', exact: true })).toHaveCount(0);
  await expect(drawer.getByText('Administración', { exact: true })).toHaveCount(0);
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflowY)).toBe('hidden');
  await page.keyboard.press('Shift+Tab');
  await expect(drawer.getByRole('link', { name: 'Autos, ir al inicio' })).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(drawer.getByRole('link', { name: 'Vendedores', exact: true })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(drawer.getByRole('link', { name: 'Autos, ir al inicio' })).toBeFocused();
  await page.screenshot({ path: 'test-results/navbar-mobile.png' });
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
  await expect(page.getByRole('navigation')).not.toBeVisible();
  expect(await page.evaluate(() => document.documentElement.style.overflow)).not.toBe('hidden');
  await trigger.click();
  await drawer.getByRole('link', { name: 'Ventas', exact: true }).click();
  await expect(page).toHaveURL(/ventas/);
  await expect(page.locator('.page-location strong')).toHaveText('Ventas');
  await expect(page.getByRole('navigation')).not.toBeVisible();
  await trigger.click();
  await page.locator('.sidebar-backdrop').click({ position: { x: 370, y: 200 } });
  await expect(trigger).toBeFocused();
});

test('navegación mantiene todos los módulos accesibles en ventanas bajas', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 480 });
  await setup(page);
  await login(page);
  const nav = page.getByRole('navigation');
  await nav.getByRole('link', { name: 'Auditoría', exact: true }).click();
  await expect(nav.getByRole('link', { name: 'Auditoría', exact: true })).toHaveAttribute('aria-current', 'page');
  await expect(page.locator('.page-location strong')).toHaveText('Auditoría');
  await expect(page.locator('.sidebar-bottom')).toBeInViewport({ ratio: .99 });
  await page.screenshot({ path: 'test-results/navbar-desktop.png' });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.setViewportSize({ width: 320, height: 568 });
  await page.getByRole('button', { name: 'Abrir menú', exact: true }).click();
  await page.getByRole('navigation').getByRole('link', { name: 'Usuarios', exact: true }).click();
  await expect(page).toHaveURL(/usuarios/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: 'test-results/navbar-small.png' });
});


test('login conserva ayuda y pie visibles en ventanas bajas y permite scroll en móvil', async ({ page }) => {
  for (const viewport of [{ width: 1264, height: 550 }, { width: 1024, height: 600 }, { width: 853, height: 480 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport);
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: 'Inicia sesión' })).toBeVisible();
    await expect(page.locator('.login-submit')).toBeInViewport({ ratio: .99 });
    await expect(page.locator('.login-help')).toBeInViewport({ ratio: .99 });
    await expect(page.locator('.login-copyright')).toBeInViewport({ ratio: .99 });
    if (viewport.width > 800) {
      await expect(page.locator('.story-assurance')).toBeInViewport({ ratio: .99 });
      await expect(page.locator('.story-footer')).toBeInViewport({ ratio: .99 });
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: 'test-results/login-height-' + viewport.width + '.png' });
  }
  await page.setViewportSize({ width: 320, height: 480 });
  await page.goto('/login');
  await page.getByRole('button', { name: 'Ingresar', exact: true }).click();
  await expect(page.locator('.field-error')).toHaveCount(2);
  await page.locator('.login-copyright').scrollIntoViewIfNeeded();
  await expect(page.locator('.login-copyright')).toBeInViewport({ ratio: .99 });
  await expect(page.locator('#email')).toBeEditable();
});


test('alertas de login no exponen referencias ni detalles internos', async ({ page }) => {
  await page.route('**/api/auth/login', route => route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({error: {message: 'Internal diagnostic password_hash SQL postgres', requestId: 'private-debug-reference'}}) }));
  await page.goto('/login');
  await page.locator('#email').fill('test@example.com');
  await page.locator('#password').fill('test-password');
  await page.getByRole('button', { name: 'Ingresar', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Correo o contraseña incorrectos');
  await expect(page.getByRole('alert')).not.toContainText(/private-debug|password_hash|SQL|postgres/);
  await page.route('**/api/auth/login', route => route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({error: {message: 'Internal diagnostic SQL postgres', requestId: 'private-debug-reference'}}) }));
  await page.getByRole('button', { name: 'Ingresar', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('El servicio no está disponible');
  await expect(page.getByRole('alert')).not.toContainText(/private-debug|SQL|postgres/);
});


test('búsqueda y paginación se conservan al volver al módulo', async ({ page }) => {
  await setup(page);
  await login(page);
  await page.getByRole('link', { name: 'Productos', exact: true }).click();
  await page.getByLabel('Buscar productos').fill('Producto');
  await page.getByRole('button', { name: 'Filtrar', exact: true }).click();
  await page.getByRole('button', { name: 'Siguiente', exact: true }).click();
  await expect(page.locator('tbody tr')).toHaveCount(2);
  await page.getByRole('link', { name: 'Inicio', exact: true }).click();
  await page.getByRole('link', { name: 'Productos', exact: true }).click();
  await expect(page.getByLabel('Buscar productos')).toHaveValue('Producto');
  await expect(page.locator('tbody tr')).toHaveCount(2);
  await page.getByRole('button', { name: 'Limpiar filtros', exact: true }).click();
  await expect(page.locator('tbody tr')).toHaveCount(10);
  await page.getByLabel('Buscar productos').fill('Producto 12');
  await page.getByRole('button', { name: 'Filtrar', exact: true }).click();
  await expect(page.locator('tbody tr')).toHaveCount(1);
  await expect(page.locator('tbody')).toContainText('Producto 12');
});

test('resumen de venta calcula total y bloquea cantidades sin stock', async ({ page }) => {
  const { writes } = await setup(page, 'VENDEDOR');
  await login(page);
  await page.getByRole('link', { name: 'Ventas', exact: true }).click();
  await page.getByRole('button', { name: 'Crear venta', exact: true }).click();
  const modal = page.getByRole('dialog');
  await modal.getByLabel(/^Producto/).selectOption('1');
  await modal.getByLabel(/^Vendedor/).selectOption('1');
  await modal.getByLabel(/^Cantidad/).fill('21');
  await expect(modal.getByRole('button', { name: 'Guardar venta' })).toBeDisabled();
  await expect(modal.getByRole('alert')).toContainText('supera las existencias');
  expect(writes).toHaveLength(0);
  await modal.getByLabel(/^Cantidad/).fill('2');
  await expect(modal.locator('.sale-total')).toContainText('50.000');
  await expect(modal.getByRole('button', { name: 'Guardar venta' })).toBeEnabled();
  await page.screenshot({ path: 'test-results/venta-resumen.png' });
  await modal.getByRole('button', { name: 'Guardar venta' }).click();
  await expect(page.getByRole('status')).toContainText('Se guardó la venta');
  expect(writes[0].body['cantidad']).toBe(2);
});

test('formularios enfocan errores y protegen cambios al cerrar y navegar', async ({ page }) => {
  await setup(page);
  await login(page);
  await page.getByRole('link', { name: 'Productos', exact: true }).click();
  await page.getByRole('button', { name: 'Crear producto', exact: true }).click();
  const modal = page.getByRole('dialog');
  await modal.getByRole('button', { name: 'Guardar producto' }).click();
  await expect(modal.getByLabel('Nombre del producto')).toBeFocused();
  await expect(modal.getByLabel('Nombre del producto')).toHaveAttribute('aria-describedby', 'help-nombre');
  await modal.getByLabel('Nombre del producto').fill('Borrador');
  await modal.getByRole('button', { name: 'Cerrar ventana' }).click();
  await expect(modal.getByText('Tienes cambios sin guardar')).toBeVisible();
  await modal.getByRole('button', { name: 'Seguir editando' }).click();
  await expect(modal.getByLabel('Nombre del producto')).toHaveValue('Borrador');
  await modal.getByRole('button', { name: 'Cancelar', exact: true }).click();
  await modal.getByRole('button', { name: 'Descartar cambios' }).click();
  await expect(modal).toHaveCount(0);
  await page.getByRole('button', { name: 'Crear producto', exact: true }).click();
  await page.getByLabel('Nombre del producto').fill('Otro borrador');
  page.once('dialog', dialog => dialog.dismiss());
  await page.evaluate(() => history.back());
  await expect(page).toHaveURL(/productos/);
  await expect(page.getByLabel('Nombre del producto')).toHaveValue('Otro borrador');
  await page.getByRole('button', { name: 'Cancelar', exact: true }).click();
  await page.getByRole('button', { name: 'Descartar cambios' }).click();
});

test('confirmar estado muestra nombre y consecuencias sin IDs', async ({ page }) => {
  await setup(page);
  await login(page);
  await page.getByRole('link', { name: 'Productos', exact: true }).click();
  await page.getByRole('button', { name: 'Desactivar', exact: true }).first().click();
  const modal = page.getByRole('dialog');
  await expect(modal).toContainText('Producto 1');
  await expect(modal).toContainText('Su historial se conservará');
  await expect(modal).not.toContainText('#1');
  await modal.getByRole('button', { name: 'Volver' }).click();
  await expect(page.getByRole('table')).toHaveAttribute('aria-label', 'Listado de productos');
  await expect(page.getByRole('columnheader', { name: 'ID', exact: true })).toHaveCount(0);
});
