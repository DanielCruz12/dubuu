# Estado actual
Última actualización: 2026-10-05

## Sesión: ajustes finales de UI en pagos y sidebar
- Columna "Pagado": ahora se colorea según deuda — rojo si el host aún debe (outstanding > 0) aunque pagado sea 0.00; verde solo si está al día.
- Card "Total pagado" con descripción corta (igual que las otras 2 cards); descripciones de las 3 cards recortadas a ~2 líneas.
- Columna "Por pagar" de la tabla con más ancho (min-w 130px en header y celdas).
- Sidebar del dashboard un poco más ancho (260px md / 280px lg).
- Verificado: tsc sin errores; JSON válidos.

## Sesión: concordancia de selects y pulido final de la vista de pagos
- Cards responsive: en mobile Total Recaudado ocupa el 100% y Total pagado/Comisión/Total a pagar van en una fila de 3 columnas; en desktop se mantiene 80/20 + 2 cards.
- Selects con concordancia: la tabla All Hosts ahora respeta el `hostId` seleccionado arriba (si hay host elegido, la tabla muestra solo ese host; "Todos los hosts" muestra la lista). Backend `getHostsTable` filtra por `hostId`.
- Colores de la tabla: Por pagar, Pagado y Pendiente usan rojo cuando > 0 y verde cuando es $0.00.
- Verificado: tsc sin errores en ambos repos.

## Sesión: pulido de la vista de pagos
- Tooltips eliminados de las tarjetas; card "Total pagado" con icono a la par de la etiqueta (estilo comisión) y montos responsivos.
- Tabla All Hosts: columna "Por pagar" en rojo; "Pendiente" rojo cuando > 0 y verde cuando es 0.
- Select de hosts: se preselecciona automáticamente el primer host pendiente (el de mayor deuda) vía `onDefaultHost` de `HostsTable`; si no hay pendientes queda "Todos los hosts". La opción "Todos los hosts" sigue disponible.
- Verificado: tsc sin errores (frontend).

## Sesión: ajustes finos de la vista de pagos
- "Total pagado" ahora es card propia en la misma fila del hero (80/20: Total Recaudado 4/5, Total pagado 1/5).
- Select de hosts usa `username` (backend `getHosts` cambió `name` a username; reiniciar backend/nodemon lo recarga).
- La tabla All Hosts carga por defecto el filtro **Pendiente** (evita traer todo de una vez); "Limpiar filtros" también vuelve a Pendiente.
- Verificado: tsc sin errores en ambos repos.

## Sesión: reorganización de la vista de pagos admin
- Tarjetas simplificadas: hero "Total Recaudado" con "Total pagado" a la par (más pequeño); debajo solo "Comisión (12%)" y "Total a pagar" (antes "Saldo Pendiente"). Eliminadas: "Pagable a Hosts", "Pagado" (como card) y "Hosts por pagar".
- El historial de pagos global se quitó de esta pantalla (irá en el detalle de cada host, Fase 4). Se borró `payout-history-table.tsx` (recuperable con git) y se quitó `getPayoutHistory` del slice y `PayoutHistoryResponse` de los tipos. El endpoint backend `/history` sigue existiendo (lo usará el detalle del host y el export).
- i18n es/en de payouts actualizados.
- Verificado: `tsc --noEmit` sin errores; JSON válidos.

## Sesión: migración de payouts a modelo por-host (preparación Fase 4)
- **Backend**: tabla `payouts` redefinida a pago-por-host con auditoría (host_id, amount, payment_date/time, método bank_transfer|cash|other, bank_account_used, transaction_reference, receipt_url, notes, paid_by, created_at/updated_at + índices). `payout-service.ts`, `payout-controller.ts` y `payout-routes.ts` reescritos al nuevo modelo; eliminados `/bookings`, `/mark-paid`, `/mark-paid-batch` (flujo por-reserva). `bookings.payout_status` quedó sin uso (limpieza futura).
- **Frontend**: eliminada la pestaña "Pendientes" y el flujo mark-paid (`payouts-table.tsx` borrado — recuperable con git); `types/payout.ts` y `payout-slice.ts` reescritos; `payouts-content.tsx` simplificado (tarjetas + filtros + tabla hosts + historial global); `payout-history-table.tsx` con columnas del nuevo modelo (fecha+hora, host, monto, método, referencia, notas); i18n es/en reescritos.
- **Migración de BD (backend)**: `dz:gen` ya generó `drizzle/0027_yellow_nehzno.sql`. La BD NO tiene `__drizzle_migrations` (siempre se manejó con `dz:push`), así que `dz:mig` no aplica: usar **`npm run dz:push`** (aplica solo el diff de payouts). Se recreó `0022_add_is_active_to_products.sql` como no-op (el cambio real lo aplica 0023) para sanear el journal. Deuda técnica: si algún día se quiere flujo migrate, hay que baselinar la BD (marcar migraciones 0–26 como aplicadas).
- **Pendiente después**: Fase 4 UI (detalle del host, Register Payment, tabs, comprobantes) y Fase 5 Reports.
- Verificado: `tsc --noEmit` sin errores en ambos repos; JSON válidos.

## Sesión: Fases 2 y 3 del panel admin (spec src/instructions/panel-admin.md)
- **Fase 2 (completada)**: tarjeta "Hosts with pending payments" agregada al summary (`pendingHosts` en backend, 6ª tarjeta en `summary-cards.tsx`, i18n es/en). El Generate Report ya existía (CSV de la sesión anterior).
- **Fase 3 (completada)**: tabla ligera "All Hosts" debajo de las estadísticas:
  - Backend: `GET /admin/payouts/hosts-table` (search, status pending/partial/paid, sortBy/sortOrder, paginación; orden por defecto outstanding desc — primero a quién más se le debe). Nuevos helpers `getHostAggregates`, `hostOutstanding`, `hostStatus` en `payout-service.ts`.
  - Frontend: componente `hosts-table.tsx` (búsqueda con debounce, filtro de estado, headers ordenables, badges verde/ámbar/rojo, botón View → `/dashboard/payouts/hosts/:hostId`), integrado en `payouts-content.tsx` con el rango global.
  - Página placeholder `payouts/hosts/[hostId]/page.tsx` (se reemplaza en Fase 4).
- **Docs**: `panel-admin.md` (raíz) reescrito como tracker de progreso apuntando a la spec canónica `src/instructions/panel-admin.md`; `CLAUDE.md` actualizado con la referencia y estructura de payouts.
- **Pendiente**: Fase 4 (Host Payment Details + Register Payment — requiere migrar la tabla `payouts` de pago-por-reserva a pago-por-host) y Fase 5 (Reports PDF/Excel/CSV). El flujo actual de mark-paid por reserva se mantiene hasta esa migración.
- Verificado: `npx tsc --noEmit` sin errores en ambos repos; JSON de traducciones válidos.

## Sesión: Fase 2 del panel-admin.md (export CSV de pagos)
- Backend: `GET /api/v1/admin/payouts/export` implementado — CSV con separador `;`, BOM UTF-8, columnas del historial, sin paginación, mismos filtros (`dateFrom`/`dateTo`/`hostId`). Se extrajeron `payoutHistoryConds` y `fetchPayoutRows` compartidos entre `/history` y `/export` en `payout-service.ts`; handler `exportCsv` en `payout-controller.ts`.
- Frontend: botón "Exportar" restaurado en `payouts-filters.tsx` con descarga por `fetch`+blob (auth por cookie de Clerk), estado de carga y toasts; traducciones nuevas en `payouts.json` (es/en).
- `panel-admin.md`: Fase 2 marcada como completada con detalles de implementación.
- Verificado: `npx tsc --noEmit` sin errores en ambos repos; JSON válidos.

## Sesión: panel-admin.md + limpieza de Pagos admin
- Se creó `panel-admin.md` (raíz del repo): documento vivo de especificaciones del panel admin por fases. Fase 1 = Pagos (completada), Fase 2 = export CSV (pendiente), Fase 3 = pagos automáticos Blink (pendiente).
- **Limpieza de Pagos admin** (decisiones del usuario en esta sesión):
  - Backend (`payout-service.ts`, `payout-controller.ts`, `payout-routes.ts`): summary ahora devuelve `previousTotalCollected` y `bookingCount`; se eliminó el endpoint `GET /admin/payouts/hosts/:hostId/products` y el filtro por producto interno; `paymentReference` se quitó de `mark-paid` (queda reservado para pagos automáticos Blink).
  - Frontend: se quitó el botón "Exportar" sin función (+ traducciones es/en), el estado `productId` muerto, el endpoint `getProductsByHost` del slice y el tipo `ProductOption`.
- Verificado: `npx tsc --noEmit` sin errores en ambos repos; JSON de traducciones válidos.

## Sesión: CLAUDE.md
Se creó `CLAUDE.md` con la estructura del proyecto, las rutas de los formularios de Crear Tour / Alquiler (entradas `/dashboard/products/add?type=/?edit=`, pasos de cada wizard) y las convenciones de validación implementadas en la sesión anterior, para evitar re-explorar en futuras sesiones.

## Sesión: panel admin + fix de seguridad en backend
- **Frontend**: el select "Filtrar por host" del panel admin (`admin-products-content.tsx`) ahora muestra solo el nombre de usuario (se quitó email y resumen por tipo; se eliminó `summarizeByType`).
- **Backend (repo dantours-drizzle-nodejs, con permiso explícito del usuario)**: se cerró el hueco de autorización en productos:
  - `updateProduct` (`src/controllers/product-controller.ts`): la propiedad ya NO se valida contra el `user_id` del body (cualquier host podía falsificarlo para editar productos ajenos). Ahora se compara contra el id de la sesión autenticada (`req.auth.userId`), y `user_id`/`userId` del body se eliminan de `updateData` (no se puede reasignar dueño). Los admin tienen bypass (rol validado por `requireRole`).
  - `deleteProduct`: NO tenía validación de propiedad alguna (cualquier host podía borrar cualquier producto). Se agregó el mismo chequeo con bypass para admin.
  - `role-validator.ts`: ahora adjunta `(req as any).userRoles` para que los controladores no repitan la llamada a Clerk.
  - Efecto colateral positivo: el admin ya puede actualizar productos de otros hosts desde el formulario de edición (el pendiente "dejemos eso para después" quedó resuelto de paso; el dueño no se reasigna porque `user_id` se descarta).
- **Hueco de creación (aplicado tras confirmación)**: `POST /api/v1/products` ahora tiene `requireAuth()` + `requireRole(['host', 'admin'])` en `product-routes.ts`, y `createProduct` (`product-controller.ts`) fuerza `user_id` = usuario autenticado (ignora el del body), cerrando la suplantación en creación. Verificado que el middleware del frontend ya restringe el dashboard a host/admin, así que ningún flujo legítimo se rompe.
- Verificado: `npx tsc --noEmit` sin errores en ambos repos.

## Sesión: Validación frontend en formularios de Crear Tour y Alquiler de Vehículo

### Qué se hizo
Se agregó validación completa en el frontend para que los datos inválidos ya no lleguen al backend:

1. **Validación por tipo de campo**
   - Numéricos (precio, max_people, duración, año, asientos, depósito, fee por km): solo dígitos y un punto decimal (máx. 2 decimales). Se bloquean `$ , - e +` y letras mientras se escribe (onKeyDown), al pegar (onPaste) y en cada cambio (onChange).
   - Texto libre (nombre, descripción, punto de partida, dirección, highlight, incluido, itinerario, gastos, empaque, marca, modelo, motor): se bloquean en vivo `< > { }` y backtick; al enviar se sanitiza de nuevo (bloques `<script>`, protocolo `javascript:`) vía zod `transform`.
   - Placa: solo letras/números/espacios/guiones (máx. 20). VIN: letras/números/guiones (máx. 20).
   - Fechas del tour: el calendario ya bloqueaba fechas pasadas; se agregó regla zod (superRefine) como defensa.
2. **Rangos y límites**: precio > 0 y ≤ 100,000; depósito ≤ 100,000; max_people 1–200; duración 1–100; textos con min/max (name 5–100, description 20–2000, etc.); asientos 1–50; año 1900–actual+1; radio 1–200.
3. **Comportamiento en tiempo real**: `mode: "onTouched"` + `reValidateMode: "onChange"` en los 8 steps; error debajo del campo en rojo; borde rojo en el campo; `aria-invalid` + `aria-describedby` (ya lo daba shadcn FormControl; se agregó a mano en el input de itinerario). Mensajes específicos, ej. "Solo se admiten números. El carácter $ no está permitido."
4. **Envío**: resumen de errores arriba de cada formulario (componente `FormErrorSummary`, cada error hace scroll+focus al campo); scroll + foco al primer campo con error (mejorado en `scrollToFirstError` con fallback al primer campo visible); botón deshabilitado mientras se envía; guard síncrono contra doble envío agregado también en RentalForm (antes solo lo tenía TourForm); trim + sanitización de textos y coerción numérica al enviar.
5. Los inputs numéricos pasaron de `type="number"` a `type="text"` + `inputMode="numeric|decimal"` para poder controlar los caracteres (el type="number" del navegador permite `e`, `+`, `-`, `$`).

### Archivos modificados/creados
- Nuevos: `src/components/modules/add-tour/validation.ts` (filtros, sanitización, límites, handlers), `src/components/modules/add-tour/form-error-summary.tsx` (resumen de errores).
- `src/components/modules/add-tour/types.ts` — esquemas zod con trim, sanitización, máx/mín, decimales y fechas pasadas.
- `src/components/modules/add-tour/utils.ts` — `scrollToFirstError` ahora enfoca el campo y acepta el root del formulario; nuevo `scrollToErrorField`.
- Steps tour: `basic-info-step.tsx`, `location-step.tsx`, `details-step.tsx`, `categorization-step.tsx`, `multimedia-step.tsx`.
- `src/components/modules/add-rental/types.ts` — esquemas con trim/sanitización/patrones de placa/VIN/depósito/fee_per_km.
- Steps rental: `basic-step.tsx`, `vehicle-step.tsx`, `delivery-step.tsx`; `index.tsx` (guard doble envío).
- `public/locales/es/dashboard.json` y `public/locales/en/dashboard.json` — nuevas claves `addTour.validation.*`, `addRental.vehicle.validation.depositInvalid`, `addRental.terms.validation.feePerKmInvalid`.
- Limpieza menor: se quitó un `console.log("isEditMode", ...)` en `add-rental/basic-step.tsx`.

### Decisiones tomadas
- Mensajes genéricos compartidos en `dashboard.addTour.validation.*` para no duplicar traducciones entre tour y rental.
- `mode: "onTouched"` (no "onChange") para no mostrar errores desde el primer carácter; tras el primer blur valida en cada cambio.
- El carácter bloqueado se reporta con `form.setError` tipo "manual" (mensaje puntual); la revalidación zod lo reemplaza al corregir/blur.
- "máximo razonable" de precio = USD 100,000 (ajustable en `VALIDATION_LIMITS`).

### Pendientes / avisos
- No hay UI de rango de fechas en el formulario de alquiler (available_from/until se generan por defecto al crear y se preservan del backend al editar), así que la regla "fecha fin posterior a inicio" no aplica ahí; si en el futuro se agrega ese UI, reutilizar el patrón del tour.
- La validación de inyección es de entrada; el backend sigue siendo la barrera definitiva (CSP report-only y JWT en Redux siguen pendientes de la lista previa).
- Verificado con `npx tsc --noEmit` (sin errores) y JSON de traducciones válido. No se ejecutó build ni lint (regla del proyecto).
