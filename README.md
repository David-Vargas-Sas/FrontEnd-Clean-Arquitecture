# Autos — Frontend

Aplicación de gestión comercial desarrollada con **Angular 19, TypeScript y Tailwind CSS 4**. Permite administrar productos, vendedores, ventas e inventario mediante la API de `BackEnd-Autos`.

## Requisitos

- Node.js 20 y npm.
- Backend configurado y disponible en `http://127.0.0.1:3000`.
- Una cuenta de acceso creada en la base del backend.

Los comandos usan PowerShell en Windows. En otras terminales, utiliza `npm` en lugar de `npm.cmd`.

## Instalación y ejecución

```powershell
npm.cmd ci
npm.cmd start
```

Abre **http://127.0.0.1:4200** e inicia sesión con tu cuenta. El primer administrador se crea siguiendo el README del backend; las cuentas adicionales se gestionan desde Usuarios.

### Conexión con la API

El frontend no necesita `.env`. La base `/api` se define en `src/environments/environment.ts` y `environment.prod.ts`.

En desarrollo, `proxy.conf.json` redirige `/api` a `http://127.0.0.1:3000`. Si cambia el servidor o puerto del backend, actualiza ese archivo y reinicia Angular. Las credenciales de PostgreSQL y el secreto JWT pertenecen al backend.

## Funcionalidades

- Inicio de sesión y navegación según los permisos de la cuenta.
- Productos y vendedores con búsqueda, filtros y mantenimiento según el rol.
- Registro de ventas con precio sugerido, resumen del total y comprobación de stock; edición y anulación para administradores.
- Entradas y salidas de inventario con motivo e historial por producto.
- Gestión de usuarios y consulta de auditoría para administradores.
- Tablas con paginación en servidor de diez registros, selector de columnas y acciones por fila.
- Formularios con validación, importes en COP y protección de cambios sin guardar.
- Interfaz adaptable a móvil, modales con scroll interno y navegación con teclado.

| Rol | Módulos disponibles |
| --- | --- |
| Administrador | Todos los módulos. |
| Vendedor | Inicio, productos, vendedores y ventas. |
| Inventario | Inicio, productos e inventario. |

El backend vuelve a comprobar los permisos y el stock en cada operación. El usuario de acceso y el vendedor comercial son registros distintos. Las cifras de Inicio corresponden a los primeros diez productos consultados, no a totales globales.

## Arquitectura

Aplicación basada en componentes standalone y módulos por funcionalidad, con rutas de carga diferida y servicios de acceso a datos por módulo.

```text
src/app/core/      # HTTP, endpoints, sesión, guards e interceptor
src/app/layout/    # Menú, cabecera y estructura de navegación
src/app/models/    # Contratos tipados de la API
src/app/modules/   # Pantallas, configuración, rutas y servicios por funcionalidad
src/app/shared/    # Tablas, formularios, modales, directivas y validadores
```

Los servicios consumen la API; los componentes compartidos reciben datos y emiten eventos. Los campos, columnas, filtros y acciones se declaran en la configuración de cada módulo. Los colores del tema están en `src/tailwind.css` y los estilos generales en `src/styles.scss`.

Consulta las responsabilidades y el recorrido de una operación en [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Pruebas

| Comando | Propósito |
| --- | --- |
| `npm.cmd test` | Pruebas unitarias con Jasmine/Karma en Chrome sin ventana. |
| `npm.cmd run test:watch` | Pruebas unitarias al editar archivos. |
| `npm.cmd run test:coverage` | Informe HTML de cobertura en `coverage/frontend-autos/index.html`. |
| `npm.cmd run test:e2e` | Recorridos de interfaz con Playwright. |

Las pruebas unitarias simulan HTTP y no necesitan el backend. Las E2E también usan principalmente respuestas simuladas; el caso opcional con API real requiere `E2E_EMAIL` y `E2E_PASSWORD` en el entorno y solo realiza login y lecturas.

Necesitas un navegador compatible. Para las unitarias puedes indicar `CHROME_BIN` o `CHROME_PATH`; para Playwright, `CHROME_PATH`. La configuración detecta navegadores instalados en Windows y Playwright también permite instalar Chromium con `npx playwright install chromium`.

El alcance del informe y la configuración de pruebas están en [docs/TESTING.md](docs/TESTING.md). El porcentaje corresponde a los archivos instrumentados, no a todo el frontend. El workflow `.github/workflows/frontend.yml` prepara pruebas, cobertura y compilación para GitHub Actions.

## Compilación y despliegue

```powershell
npm.cmd run build
```

Los archivos se generan en `dist/frontend-autos/browser`. El servidor de publicación debe devolver `index.html` para las rutas de Angular y redirigir `/api` al backend. `proxy.conf.json` solo se utiliza durante el desarrollo.

## Sesión y alcance

El JWT se guarda en `sessionStorage` y se elimina al cerrar sesión o recibir un 401. No se almacenan contraseñas. No hay registro público, recuperación de contraseña por correo ni renovación automática del token.

Antes de publicar, revisa los avisos de dependencias con `npm audit` y configura HTTPS y las políticas de seguridad del navegador. Se conserva Angular 19 por los requisitos de la prueba técnica.
