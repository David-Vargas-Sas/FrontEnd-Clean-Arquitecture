# Autos · Frontend

Interfaz para trabajar con el catálogo, las ventas y el inventario de Autos. Está hecha con **Angular 19 y Tailwind CSS 4**, en español y con navegación adaptada a escritorio y móvil.

Necesita la API de `BackEnd-Autos`. El menú y las acciones cambian según los permisos de la cuenta con la que se inicia sesión.

## Ponerlo en marcha

Necesitas Node.js 20 con npm. Primero prepara el backend siguiendo su README: configura PostgreSQL, aplica las migraciones, crea una cuenta y deja la API ejecutándose en el puerto 3000.

Después, desde la carpeta del frontend:

```powershell
npm.cmd ci
npm.cmd start
```

Abre **http://127.0.0.1:4200**. Los comandos usan PowerShell en Windows; en otras terminales puedes usar `npm` en lugar de `npm.cmd`.

No necesitas un `.env` en el frontend. La dirección base está en `src/environments/environment.ts` y vale `/api`. Durante el desarrollo, `proxy.conf.json` envía las peticiones a `http://127.0.0.1:3000`. Si cambias el puerto del backend, ajusta ese archivo y reinicia Angular.

## Entrar por primera vez

Usa una cuenta creada en el backend. No hay una contraseña predeterminada en el código ni registro público. El primer administrador se crea con el script `auth:create-user` del backend; las demás cuentas se pueden crear desde **Usuarios**.

| Rol | Qué encontrarás en la interfaz |
| --- | --- |
| Administrador | Todos los módulos, administración de cuentas y auditoría. Puede editar y anular ventas. |
| Vendedor | Consulta de productos y vendedores, listado y registro de ventas. |
| Inventario | Consulta y mantenimiento de productos, entradas y salidas de existencias. |

Ocultar una opción ayuda a evitar acciones que no corresponden al rol. La seguridad también se comprueba en la API; no depende de que un botón esté visible.

Los usuarios que inician sesión y los vendedores asignados a una venta son registros distintos. Crear una cuenta con rol Vendedor no crea automáticamente un vendedor comercial.

## Recorrido por la aplicación

### Inicio y navegación

Inicio ofrece accesos a las herramientas de tu cuenta. Sus cifras corresponden a los primeros diez productos consultados, no a totales generales del negocio.

El menú se divide en General, Operaciones y Administración. En móvil se abre desde el botón de menú y puede cerrarse con su botón, con Escape o tocando fuera. La cabecera muestra el módulo abierto y permite cerrar sesión.

### Productos y vendedores

Puedes buscar, filtrar por estado y consultar las listas de diez en diez. Los permisos determinan si puedes crear, editar, activar, desactivar o eliminar un registro.

Desactivar conserva el historial y evita su uso en nuevas operaciones. Eliminar es permanente y el backend lo rechaza si hay historial asociado.

Los IDs se usan internamente y no se muestran como columnas. El selector **Columnas** permite elegir qué información ver.

### Registrar una venta

1. Entra a Ventas y pulsa **Crear venta**.
2. Elige el producto y el vendedor. Cada venta contiene un solo producto.
3. Revisa la cantidad, el precio por unidad y la fecha.
4. Comprueba el resumen y guarda la venta.

El precio del producto se carga como sugerencia y puede ajustarse para esa venta. Los campos monetarios usan formato colombiano, por ejemplo `$ 25.000,50 COP`, y envían un valor numérico a la API.

El resumen muestra stock disponible, cantidad y total. Si la cantidad supera las existencias consultadas, aparece un aviso y se bloquea el guardado. La API vuelve a validar el stock al guardar, porque otro usuario podría haber registrado una operación mientras tanto.

Un administrador puede editar una venta o anularla con un motivo. La anulación conserva el registro y devuelve el stock correspondiente. Las ventas no se eliminan ni se reactivan después de anularse.

### Inventario, usuarios y auditoría

En Inventario se registran entradas y salidas con cantidad y motivo. El historial se puede filtrar por producto. Si un movimiento quedó mal, se corrige con otro movimiento; no se modifica el anterior.

Desde Usuarios, el administrador puede crear cuentas y cambiar datos, rol, contraseña o estado. Al editar, dejar la contraseña vacía conserva la actual. Cambiarla invalida las sesiones anteriores. El backend impide desactivar o quitar el rol al último administrador activo.

Auditoría permite consultar cambios de ventas y usuarios, filtrar por entidad o registro y ver el estado anterior y posterior. Los movimientos de inventario tienen su propio historial.

## Filtros, formularios y mensajes

- Productos y vendedores permiten buscar y filtrar por estado. Usuarios añade el rol; Ventas permite filtrar por fechas, producto, vendedor y estado.
- Los filtros se ejecutan en el servidor antes de paginar. **Limpiar filtros** restablece la consulta.
- Al salir de un módulo y volver, se conservan página y filtros aplicados. Ese contexto vive en memoria, separado por usuario y módulo, y se reinicia al recargar la aplicación.
- Los errores se muestran junto al campo y el primer campo inválido recibe el foco al intentar guardar. Los importes aceptan hasta dos decimales.
- Si cierras un formulario con cambios, puedes seguir editando o descartarlos. Al salir de la ruta o recargar, también se avisa de los cambios pendientes.
- Las alertas muestran mensajes para el usuario, sin referencias de solicitud ni detalles internos del servidor.

Los modales tienen desplazamiento interno y dejan las acciones fuera del área de campos. También hay estados de carga, listas vacías, errores, nombres accesibles de tablas y soporte de teclado.

## Dónde está cada cosa

```text
src/app/
  core/            # HTTP, endpoints, sesión, guards y servicios comunes
  layout/          # Navegación y estructura de las pantallas
  models/          # Contratos de cada entidad
  modules/
    login/ dashboard/
    productos/ vendedores/ ventas/
    inventario/ usuarios/ auditoria/
  shared/
    components/    # Tablas, formularios, modales, acciones y paginación
    directives/    # Entrada de importes
    models/        # Configuración de componentes compartidos
    validators/
    utils/
```

Cada módulo de negocio tiene componente, plantilla, estilos, configuración, servicio y rutas. Por ejemplo, `productos.config.ts` define campos, columnas, filtros y acciones; `productos.service.ts` consume los endpoints de productos. Las tablas y formularios compartidos no hacen peticiones HTTP.

La organización tomó como referencia [gin-erp-front](https://github.com/AfvTecser/gin-erp-front), principalmente la separación por módulos y los componentes de tabla y formulario. Para revisar las responsabilidades y el recorrido de una petición, consulta [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Estilos y colores

La paleta se inspira en la referencia Colserauto utilizada para la prueba; no pretende reproducir un manual oficial de marca.

| Uso | Color |
| --- | --- |
| Azul principal | `#193D77` |
| Morado | `#3B2C73` |
| Acción principal | `#A42A87` |
| Acción al pasar el cursor | `#88216F` |
| Fondo | `#F6F7FB` |
| Texto | `#26354F` |

Los colores están en `src/tailwind.css`. Tailwind se procesa con PostCSS; `src/styles.scss` contiene las reglas generales y cada componente puede añadir sus estilos. Para cambiar la paleta, empieza por los valores del tema, sin reemplazar colores por toda la aplicación.

## Pruebas y compilación

```powershell
npm.cmd run test:e2e
npm.cmd run build
```

Las pruebas usan Playwright y cubren login, permisos, formularios, filtros, paginación, resumen de venta, cambios sin guardar y adaptación a distintos tamaños. La mayoría usa respuestas simuladas y no modifica PostgreSQL.

La configuración busca un navegador instalado en las rutas de Windows definidas en `playwright.config.ts`. Si no lo encuentra, puedes indicar el ejecutable con `CHROME_PATH` o instalar Chromium con `npx playwright install chromium`.

Hay una prueba opcional de login y lectura con la API real. Se habilita al definir `E2E_EMAIL` y `E2E_PASSWORD` en el entorno de la terminal; si no están, se omite. No guardes credenciales en el código ni en el README. Las capturas y trazas se generan en `test-results/`.

El build queda en `dist/frontend-autos/browser`. Para publicarlo, el servidor debe servir `index.html` al acceder directamente a una ruta de Angular y enviar `/api` al backend. El proxy de desarrollo no se incluye como servidor en el build.

## Sesión y alcance actual

El token se conserva en `sessionStorage` para permitir recargas en la misma pestaña. Se elimina al cerrar sesión o recibir un 401; las contraseñas no se almacenan. El backend controla la duración de la sesión y los permisos vigentes.

No hay recuperación de contraseña por correo, registro público ni renovación automática del token. Para recuperar acceso se necesita al administrador.

Se mantiene Angular 19 por el rango exigido en la prueba técnica. Antes de desplegar, revisa las dependencias con `npm audit` y acuerda las actualizaciones necesarias; no fuerces cambios de versión mayor sin comprobar su compatibilidad. También deben revisarse HTTPS, CSP y la política de almacenamiento del token.

## Problemas frecuentes

| Problema | Qué revisar |
| --- | --- |
| No conecta o el proxy devuelve un error | Que el backend esté iniciado en el puerto de `proxy.conf.json`. |
| Correo o contraseña incorrectos | Que la cuenta exista en la base configurada por el backend y esté activa. |
| No aparece un módulo o una acción | Los permisos de la cuenta. El menú cambia según el rol. |
| No permite guardar una venta | Los campos obligatorios, el stock y el estado del producto y del vendedor. |
| Al recargar una ruta publicada aparece 404 | El servidor debe devolver `index.html` para las rutas de Angular. |
