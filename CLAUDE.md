# Dubuu (frontend) — contexto y estructura

Marketplace B2C de tours/experiencias y alquiler de vehículos en El Salvador. Next.js 14 (App Router) + TypeScript, RTK Query/Redux Toolkit, Clerk, shadcn/ui, Tailwind. Backend en repo aparte (`dantours-drizzle-nodejs`), expuesto vía rewrite `/backend` → `http://localhost:3002` en dev.

> Reglas obligatorias del proyecto (no ejecutar build/lint, no instalar deps, cambios mínimos, responder en español, actualizar `HANDOFF.md` al terminar): ver `AGENTS.md`.

## Estructura

- Código fuente en `src/` (no `app/`). Rutas App Router: `src/app/`, con grupos `(host)` (dashboard del anfitrión) y `(user)` (viajeros).
- UI base shadcn en `src/components/ui/`. Módulos de dominio en `src/components/modules/`. Slices de RTK Query en `src/redux/slices/`. Tipos de dominio en `src/types/`.
- i18n: `useLanguage()` → `t("clave.punto")`. Traducciones en JSON por namespace: `public/locales/{es,en}/*.json` (dashboard.json cubre las rutas del dashboard). Si `t()` devuelve la clave, falta agregarla en esos JSON.

## Formularios de Crear Tour y Alquiler de Vehículo

**Entrada**: `/dashboard/products/add?type=<productTypeId>` (crear) o `?edit=<productId>` (editar) →
`src/app/(host)/dashboard/products/add/page.tsx` → `add-product-content.tsx` → decide entre `TourForm` y `RentalForm` según el tipo de producto. La edición desde la tabla usa `src/app/(host)/dashboard/products/(components)/edit-product-modal.tsx` (mismo par de formularios con `editProductId`).

**Ambos son wizards de 5 pasos** (estado `step` en el índice, un `<form>` react-hook-form por paso; el botón Continuar/Crear dispara `requestSubmit()` del form visible vía `formRef`):

- **Tour**: `src/components/modules/add-tour/`
  - `index.tsx` (TourForm; orquesta pasos, borrador localStorage, arma FormData y llama `useCreateProductMutation`/`useUpdateProductMutation`)
  - Pasos: `basic-info-step.tsx` (1: nombre, descripción, punto de partida, máx. personas, dirección, país, duración), `location-step.tsx` (2: LocationPicker + campos ocultos lat/lng/address), `details-step.tsx` (3: highlight, incluido, dificultad, itinerario dnd-kit, gastos, empaque, fechas con react-day-picker), `categorization-step.tsx` (4: comboboxes de tipo/categoría/audiencia/amenities — también lo usa el rental), `multimedia-step.tsx` (5: subida de archivos, precio, acepta niños/precio niño — también lo usa el rental con `hideChildrenSection`).
  - `types.ts`: esquemas zod (fábricas `getXSchema(t)`) + tipos inferidos. `utils.ts`: draft localStorage, `scrollToFirstError`/`scrollToErrorField`, `focusFirstStepField`, `validateFiles`, `pairTourDatesMetaWithDates`.
- **Alquiler**: `src/components/modules/add-rental/`
  - `index.tsx` (RentalForm), pasos: `basic-step.tsx` (1: nombre/descripción), `vehicle-step.tsx` (2: marca, modelo, color, condición, transmisión, combustible, año, asientos, motor, placa, VIN, GPS, depósito), `delivery-step.tsx` (3: país, fee por km, modo entrega áreas específicas/cobertura), luego reutiliza `categorization-step` y `multimedia-step` del tour.
  - `types.ts` (esquemas), `draft.ts` (borrador localStorage propio).
  - Sin UI de rango de fechas: `available_from/until` se generan por defecto al crear y se preservan del backend al editar.

**Convenciones de validación (implementadas, mantener el patrón al tocar estos forms)**:
- React Hook Form + `zodResolver`, `mode: "onTouched"` + `reValidateMode: "onChange"`; `<FormErrorSummary />` arriba de cada form; `noValidate` en el `<form>`.
- Helpers compartidos en `src/components/modules/add-tour/validation.ts`: `filterDecimalChars`/`filterIntegerChars`/`filterSafeText`/`filterPlateChars`/`filterVinChars` (filtrar en `onChange`, `onKeyDown` y `onPaste` vía `handleFilteredChange/KeyDown/Paste`), `sanitizeText` (anti-inyección `< > { }` y `<script>`), `findBlockedChar`, `numericBlockedMessage`/`textBlockedMessage`, `fieldBorderClass`, límites en `VALIDATION_LIMITS` (precio máx. USD 100,000, máx/mín de textos y números).
- Carácter bloqueado al escribir → `form.setError(campo, { type: "manual", message }, { shouldFocus: false })` (la revalidación zod lo reemplaza al blur/corregir).
- Números: inputs `type="text"` + `inputMode="numeric|decimal"` (el `type="number"` nativo permite `e + -`), coerción con `z.coerce.number()`.
- Textos: `z.string().trim().transform(sanitizeText).pipe(z.string().min/max)`. Selects y comboboxes: `data-error-field={field.name}` para que `scrollToFirstError` los encuentre (comboboxes envueltos en `<span data-error-field>` dentro de `FormControl`).
- Mensajes de error i18n: genéricos compartidos en `dashboard.addTour.validation.*` (usados también por rental), específicos en `dashboard.addRental.*.validation.*`.
- Errores de red/validación del backend del tour: `getTourSaveErrorInfo` en `utils.ts` (el rental aún muestra error genérico).
- Envío: FormData multipart (archivos comprimidos a WebP en multimedia-step); guard de doble envío con `submitInFlightRef` en ambos índices; borrador se limpia al crear.

## Panel admin de pagos

- **Spec canónica del panel admin**: `src/instructions/panel-admin.md` (escrita por el usuario; columnas, flujos, validaciones y API por fases). `panel-admin.md` (raíz) registra el progreso por fases y las decisiones de implementación.
- Vista: `src/app/(host)/dashboard/payouts/` (solo admin, backend `/api/v1/admin/payouts/*` en el repo dantours). Componentes: `payouts-content`, `summary-cards` (6 tarjetas), `payouts-filters` (+export CSV), `hosts-table` (tabla ligera All Hosts), `payouts-table` (pendientes), `payout-history-table`.
- Fases completadas: 1 (limpieza), 2 (tarjetas + Generate Report CSV), 3 (tabla All Hosts con endpoint `/hosts-table`). Fase 4 en progreso: la tabla `payouts` ya migró a **pago-por-host** (schema `src/database/schemas/payouts.ts` en el backend: host_id, amount, payment_date/time, método, referencia, comprobante, auditoría); los endpoints por-reserva (`/bookings`, `/mark-paid*`) se eliminaron y el frontend ya no tiene la pestaña de pendientes. Falta la UI: página de detalle del host, modal Register Payment, tabs y comprobantes. Fase 5 (Reports PDF/Excel/CSV) pendiente.

## Otros puntos útiles

- `isProductType(product, "tours" | "rental")` y `productTypeNameToFormKind` en `src/utils/` para distinguir tipos de producto.
- Verificación rápida de tipos: `npx tsc --noEmit` (permitido; no correr build/lint).
