# Estado actual
Última actualización: 2026-10-04

## Sesión: CLAUDE.md
Se creó `CLAUDE.md` con la estructura del proyecto, las rutas de los formularios de Crear Tour / Alquiler (entradas `/dashboard/products/add?type=/?edit=`, pasos de cada wizard) y las convenciones de validación implementadas en la sesión anterior, para evitar re-explorar en futuras sesiones.

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
