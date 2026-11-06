# Pruebas del frontend

El proyecto combina pruebas de piezas concretas con recorridos de navegador. Las primeras usan Jasmine, Karma y TestBed de Angular; los recorridos completos siguen usando Playwright.

## Ejecutar

Desde FrontEnd-Autos:

| Comando | Resultado |
| --- | --- |
| `npm.cmd test` | Ejecuta las pruebas unitarias una vez en Chrome sin ventana. |
| `npm.cmd run test:watch` | Mantiene las pruebas escuchando cambios. |
| `npm.cmd run test:coverage` | Ejecuta las unitarias y genera el informe de cobertura. |
| `npm.cmd run test:e2e` | Ejecuta los recorridos de interfaz con Playwright. |
| `npm.cmd run build` | Comprueba la compilación de producción. |

En otras terminales puedes usar npm en lugar de npm.cmd. Las pruebas unitarias no necesitan arrancar el backend ni PostgreSQL.

## Abrir el informe

Después de ejecutar test:coverage, abre `coverage/frontend-autos/index.html` en el navegador. Puedes entrar a cada archivo para localizar líneas, funciones y condiciones que no se ejecutaron.

También se generan `lcov.info` y `coverage-summary.json`, útiles para integraciones y análisis automatizado. La carpeta coverage está ignorada en Git y se vuelve a generar en cada ejecución.

## Qué cubren las pruebas

| Archivo de prueba | Comportamientos comprobados |
| --- | --- |
| form.validators.spec.ts | Texto vacío, enteros, decimales, formatos inválidos y combinación de required/min/max. |
| currency-input.directive.spec.ts | Conversión entre formato colombiano y número, decimales, entradas inválidas, foco, touched y estado deshabilitado con un FormControl real. |
| generic-form.component.spec.ts | Construcción de controles y etiquetas, payload normalizado, validaciones, foco en el primer error, bloqueos de guardado, contraseña opcional al editar, selectores y eventos. |
| api-client.service.spec.ts | Métodos HTTP, parámetros, cuerpos, respuestas sin contenido y propagación de errores. |
| productos.service.spec.ts | Endpoint del módulo y carga de varias páginas para selectores, incluidos registros inactivos. |
| login.service.spec.ts | Login, token en la pestaña, permisos, carga compartida de perfil, fallos, cierre de sesión y almacenamiento bloqueado. |
| auth.interceptor.spec.ts | Envío del token solo a nuestra API y comportamiento ante 401 y 403, sin ciclos de refresco. |
| access.guards.spec.ts | Entrada según sesión/permisos y confirmación de cambios pendientes al salir. |

Las peticiones de las pruebas unitarias se atienden con HttpTestingController: permite comprobar su método, URL y cuerpo y simular la respuesta. No envían solicitudes al backend real. TestBed proporciona las dependencias y crea componentes de Angular con sus plantillas.

## Resultado inicial y alcance

El 6 de noviembre de 2026 pasaron **79 pruebas unitarias**. El informe de esa ejecución midió:

| Métrica | Resultado |
| --- | ---: |
| Sentencias | 98,19 % |
| Ramas | 95,57 % |
| Funciones | 94,82 % |
| Líneas | 98,75 % |

Estos porcentajes corresponden a los **13 archivos de aplicación cargados e instrumentados** por la suite, no a todo el frontend. Los archivos spec se excluyen de la instrumentación. No se han excluido pantallas para subir un porcentaje: las que estas pruebas no importan simplemente no forman parte de esta medición.

ResourcePageComponent, el layout y otras pantallas tienen recorridos cubiertos por Playwright, pero esa ejecución no aporta cobertura a este informe unitario. Tampoco se mide el código de Node.js ni SQL. No debe sumarse este porcentaje al del backend ni presentarse como cobertura general del sistema.

No se fija un mínimo global por ahora: primero interesa ampliar las pruebas de comportamientos importantes. Ejecutar una línea no garantiza que el resultado esté bien comprobado.

## Configuración

- angular.json tiene un target test con el constructor `@angular/build:karma`, disponible en la versión 19 del proyecto.
- tsconfig.spec.json incluye solo los spec de src y los tipos de Jasmine. Las pruebas E2E están en e2e y las ejecuta Playwright.
- karma.conf.cjs configura ChromeHeadless y los formatos del informe. Busca Chrome o Edge en Windows; también acepta CHROME_BIN o CHROME_PATH. En Linux el lanzador puede detectar Chrome en sus rutas habituales.
- Las pruebas se ejecutan con orden aleatorio para detectar dependencias entre casos. Cada prueba restaura su entorno de TestBed y las de sesión limpian el almacenamiento.

La configuración sigue las guías de [pruebas de Angular 19](https://v19.angular.dev/guide/testing) y [cobertura](https://v19.angular.dev/guide/testing/code-coverage).

## GitHub Actions

El archivo .github/workflows/frontend.yml prepara Node 20, instala las dependencias con npm ci, instala Chromium para el entorno de CI, ejecuta cobertura y compila. Conserva el informe como artefacto durante siete días. No necesita secretos ni una base de datos para las pruebas unitarias.

El workflow queda preparado en los archivos locales; su ejecución remota depende de publicar el repositorio en GitHub. Los recorridos E2E siguen disponibles por su comando propio.

## Dependencias

Se añadieron dependencias de desarrollo de Jasmine/Karma y el entorno de pruebas de navegador de la misma versión que Angular core. No se ha cambiado la versión mayor de Angular ni el código de negocio. El proyecto conserva avisos de npm audit en Angular 19 y sus herramientas; este trabajo no los resuelve ni fuerza actualizaciones incompatibles. Revisa las dependencias antes de publicar, como se explica en el README.
