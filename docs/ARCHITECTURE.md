# Arquitectura del frontend

La organización toma como referencia [AfvTecser/gin-erp-front](https://github.com/AfvTecser/gin-erp-front), revisado en el commit `9b4138f2b8040b362cdd3c160bed834f81ee9f19`.

Se estudiaron sus rutas lazy por módulo, servicios junto a sus componentes y piezas `generic-table`, `data-table-wrapper`, `row-actions` y `generic-form`. Autos implementa esas responsabilidades con sus propios contratos, estilos y permisos. Mantiene Angular 19 por el enunciado; el repositorio de referencia utiliza Angular 20. No se instalaron ni ejecutaron scripts del proyecto de referencia.

## Carpetas

```text
src/
  app/
    core/
      constants/api.constants.ts
      guards/
      interceptors/
      services/api-client.service.ts
      utils/
    layout/
      layout.component.ts / html / scss
      menu.model.ts
      menu.service.ts
      menu-items/operaciones.ts
    models/
      api/ auth/ productos/ vendedores/ ventas/ inventario/ usuarios/ auditoria/
    modules/
      productos/
        productos.component.ts
        productos.component.html
        productos.component.scss
        productos.config.ts
        productos.service.ts
        productos.routes.ts
      vendedores/ ventas/ inventario/ usuarios/ auditoria/
      login/
      dashboard/
      not-found/
    shared/
      components/
        data-table-wrapper/
        generic-table/
        generic-form/
        row-actions/
        state-status/
        create-button/
        pagination/
        resource-page/
        modal/
        icon/
      models/
      validators/
      utils/
  environments/environment.ts / environment.prod.ts
  tailwind.css
  styles.scss
```

Los módulos del negocio siguen la misma distribución de productos. No necesitan copiar la tabla, la paginación ni el constructor de formularios.

## Responsabilidades

| Pieza | Responsabilidad |
| --- | --- |
| `*.routes.ts` | Rutas lazy y permiso de entrada al módulo |
| `*.component.ts` | Componer la pantalla y sus reglas específicas |
| `*.component.html` | Declarar los componentes que utiliza la pantalla |
| `*.config.ts` | Campos, columnas, filtros y acciones de la funcionalidad |
| `*.service.ts` | Consumir sus endpoints con DTOs propios |
| `models` | Requests y respuestas tipadas de cada entidad |
| `ApiClientService` | Transporte HTTP común; no conoce pantallas ni reglas de ventas |
| `ResourceSource` | Adaptar servicios tipados a formularios dinámicos en una única frontera |
| `ResourcePageComponent` | Coordinar carga, modales, estados y operaciones comunes |
| `GenericTableComponent` | Mostrar columnas, celdas, estados y acciones; no realiza HTTP |
| `DataTableWrapperComponent` | Integrar tabla, filtros proyectados, selector de columnas y paginación |
| `GenericFormComponent` | Construir y validar el formulario; emitir payload sin enviarlo al servidor |
| `RowActionsComponent` | Emitir acciones visibles de una fila |

El componente de ventas agrega la sugerencia de precio al cambiar de producto; esa regla no está dentro del formulario genérico. El servicio de ventas expone `anular`, pero no eliminación física. Inventario expone lectura y registro; auditoría solo lectura.

## Flujo de una operación

```text
productos.routes.ts
  → ProductosComponent + productos.config.ts
    → ResourcePageComponent
      → GenericFormComponent / DataTableWrapperComponent
      → ResourceSource
        → ProductosService
          → ApiClientService
            → /api/productos
```

Las URLs se centralizan en `core/constants/api.constants.ts`, basadas en `environment.apiUrl`. Las configuraciones y los componentes genéricos no reciben URLs ni el nombre de un endpoint. Los servicios de cada módulo deciden qué operaciones existen. El interceptor agrega el JWT solamente a peticiones bajo la base configurada de la API.

## Tabla dinámica y paginación

Las columnas y acciones se declaran en el módulo. Las acciones se filtran por permisos actuales antes de llegar a la tabla y pueden tener condiciones por fila. Por ejemplo, ventas oculta editar y anular cuando el estado ya es ANULADA. La autorización real permanece en el backend.

El selector de columnas modifica únicamente la presentación. La paginación se hace en servidor, de diez en diez. Como el backend no devuelve un total, una consulta de un registro en el siguiente offset permite saber si hay una página posterior, incluso cuando la última página contiene exactamente diez registros. No se inventan totales ni se filtra una página local como si fuera todo el catálogo.

## Tailwind CSS 4

La integración usa `.postcssrc.json`, `@tailwindcss/postcss` y `src/tailwind.css`, siguiendo la [guía oficial para Angular](https://tailwindcss.com/docs/installation/framework-guides/angular).

`@theme` define los colores Autos y la tipografía. Los nuevos componentes usan utilidades para grid responsive, botones, menús de columnas, espacios, bordes y estados de foco. El diseño existente se conserva en `styles.scss`, dentro de `@layer components`, para que las utilidades puedan sobrescribir reglas cuando corresponde. Los SCSS de componentes quedan disponibles para estilos específicos; no hay procesamiento Sass del import de Tailwind.

Los alias `@/` y `@env/` evitan rutas relativas extensas. La configuración de producción sustituye `environment.ts` por `environment.prod.ts`; no contiene secretos.

## Verificación

`npm.cmd run build` verifica tipos y plantillas estrictas. `npm.cmd run test:e2e` comprueba los flujos de los roles, formulación de requests por módulo, selección de columnas, estilos Tailwind computados en navegador, filtros, auditoría y paginación. El login real es opcional con credenciales en el entorno; no escribe datos en PostgreSQL.


## Usabilidad y estado de las pantallas

- Los filtros se ejecutan en la API antes de paginar. Productos, vendedores y usuarios admiten búsqueda y estado; ventas admite fechas, producto, vendedor y estado. Inventario y auditoría mantienen sus filtros propios.
- PageStateService conserva filtros aplicados y página en memoria durante la navegación, separados por usuario y módulo. No guarda formularios, contraseñas ni tokens y se reinicia al recargar la aplicación.
- UnsavedChangesService y el guard de cada módulo protegen los formularios al navegar. El cierre del modal ofrece continuar editando o descartar; la salida de la pestaña utiliza el aviso nativo del navegador.
- La venta presenta un total calculado y verifica el stock disponible. En edición suma la cantidad de la venta original si corresponde al mismo producto; PostgreSQL conserva la validación definitiva y transaccional.
- Los formularios asocian ayuda y errores con aria-describedby y enfocan el primer campo inválido. Las tablas tienen nombre accesible y encabezados de columna.
