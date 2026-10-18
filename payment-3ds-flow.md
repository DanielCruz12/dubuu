# Flujo de pago 3DS (Wompi) + pantalla de éxito — tracker de fases

Última actualización: 2026-10-17

Repos: **backend** `dantours-drizzle-nodejs` (Express + Drizzle + Clerk, Railway) · **frontend** `dubuu` (Next.js 14).

Objetivo: tras el 3DS del banco el usuario debe caer en `/payment/result?booking=<id>` con mensaje de éxito (backend envía la redirección vía `urlRedirect` y webhook; Blink también debe llegar a la pantalla de éxito). Al pago se le liga `bookingId` y el monto sale del backend, nunca del cliente. Aplica también: terminar pendientes de notificaciones.

Reglas: nombres reales del código (no inventar), no loguear tarjetas/CVV/errores completos, no tocar fuera del alcance, confirmar lo no verificable, typecheck+lint al final de cada fase (backend), resumen corto tras cada fase.

---

## Pendientes de notificaciones (sesión previa)

- [x] Links de push del backend (`booking-push-notification-service.ts`) → sin route groups, a rutas existentes.
- [ ] Tokens multi-dispositivo (hoy `users.fcm_token` único) — pendiente de decisión del usuario.

## Fase 0 — Reconocimiento (sin cambios de comportamiento)

- [x] Localizar controller 3DS, service, webhook, schema de bookings, form de pago del front.
- [x] Responder: ¿reserva se crea antes o después del pago? ¿qué columna guarda el estado de pago?
- [x] Esperar confirmación del usuario para el flujo propuesto (preguntas enviadas).

**Decisiones confirmadas por el usuario (2026-10-17):**
1. Invertir orden tarjeta: crear reserva ANTES del 3DS (estado in-process) y enviar `bookingId`.
2. Blink: navegar a `/payment/result?booking=ID` al llegar `payment:completed`.
3. Webhook: extracción defensiva del payload (top-level y anidado) con TODO para confirmar contra payload real.
4. Tokens multi-dispositivo: después (pendiente anotado).

**Hallazgos (nombres reales):**
- Backend: `src/controllers/payment-3ds-controller.ts` (`handleCreate3DSTransaction`, ruta `POST /api/v1/TransaccionCompra/3DS` con `requireAuth()` pero sin `getAuth` interno), `src/services/payment-3ds-service.ts` (`createTransaction3DS`, axios a `${WOMPI_URL}/TransaccionCompra/3DS`, traga errores → 502), `src/services/wompi-service.ts` (`getWompiToken`, OAuth `https://id.wompi.sv/connect/token`, `WOMPI_CLIENT_ID`/`WOMPI_CLIENT_SECRET`), webhook en `src/controllers/wompi-webhook-controller.ts` (`POST /api/v1/webhook-wompi`).
- `urlRedirect` hardcodeado `https://www.dubuu.com/home` (payment-3ds-controller.ts:56); `total` viene del body; loguea el objeto error completo (línea 79); teléfonos hardcodeados `77886116`.
- Webhook actual: HMAC-SHA256(rawBody, `WOMPI_CLIENT_SECRET`) vs header `wompi_hash` — **confirmado contra documentación oficial de Wompi SV** (docs.wompi.sv + librerías de referencia). Solo lee `IdTransaccion` top-level; no valida monto ni estado; no es idempotente; `updateBookingStatusByTransactionId` busca por `bookings.idTransaccion`.
- **No confirmable por docs públicas**: forma exacta del body del evento (campos de estado/monto). El handler actual lee `IdTransaccion` top-level y en producción los pagos completan. Pendiente: TODO + extracción defensiva o payload de ejemplo del usuario.
- Schema `bookings` (`src/database/schemas/bookings.ts`): `id, user_id, product_id, booking_kind, status (default 'in-process'), is_live, total decimal(10,2), paymentMethod, idTransaccion (camelCase, no único), payout_status (default 'pending'), created_at, updated_at`. **No existe** `payment_status` ni tabla `payment_attempts`. Estado de pago hoy = `bookings.status` ('in-process' → 'completed').
- Reserva 3DS hoy se crea **después** de iniciar la transacción (frontend), guardando `idTransaccion`; Blink la crea **antes** del pago (backend, estado in-process) vía `createOrAttachBookingForPayment` (booking-service.ts:322-456). No existe `getBookingForUser`.
- Backend sin scripts lint/typecheck: typecheck = `npx tsc --noEmit`, lint = `npx eslint <archivos>` (eslint 9 en devDeps). Migraciones: `dz:gen` genera a `./drizzle`; aplicar con `dz:push` o `dz:mig` (proyecto usa dz:push).
- Frontend: payload 3DS en `checkout-form.tsx:324-332` (`{...bookingData, ...values, phone}`); redirección a `response.urlCompletarPago3Ds` (campo real de la respuesta de Wompi; el request usa `urlRedirect`). `/payment/result` no existe; middleware: `isPublicRoute` no incluye `/payment`; i18n: `getNamespacesForRoute` (src/lib/i18n.ts:72-90) solo carga `home` en `/` y `/home*`.
- Wompi SV docs: request 3DS admite `datosAdicionales` (pares llave/valor) y `urlRedirect` obligatorio; respuesta: `idTransaccion`, `esReal`, `urlCompletarPago3Ds`, `monto`.

## Fase 1 — Base de datos ✅

- [x] Tabla `payment_attempts` (`src/database/schemas/payment-attempts.ts`): id, bookingId (FK→bookings cascade), wompiTransactionId UNIQUE, amount numeric(10,2), status pending|paid|failed (default pending), createdAt/updatedAt.
- [x] `bookings.paymentStatus` (text, default 'pending'). Enum `PaymentStatus` en `src/constants/enums.ts` + re-export en `index.ts`.
- [x] Migración generada: `drizzle/0028_robust_ma_gnuci.sql` — **NO ejecutada**. Comando: `npm run dz:push` (flujo del proyecto; alternativo `dz:mig` requiere baselinar `__drizzle_migrations`). Nota: incluye un ALTER redundante de `payouts.host_id` (no-op; artefacto del snapshot de drizzle-kit, 0027 ya lo creó text).
- Typecheck ✓. Lint no disponible (falta `@typescript-eslint/eslint-plugin` en el repo; no se instalan deps).

## Fase 2 — Controller de creación 3DS ✅

- [x] `payment-3ds-controller.ts` reescrito: `getAuth(req)` → 401; body con `bookingId` SIN `total`; validaciones UUID/tarjeta/CVV/MM-YY; 404 si no es suya; 409 si ya pagada; monto desde `booking.total`; `parseInt(x,10)`; `urlRedirect: ${FRONTEND_URL}/payment/result?booking=ID`; `savePaymentAttempt(pending)`; catch loguea solo `mensajes?.[0] ?? error?.message`.
- [x] `services/payment-attempts-service.ts` nuevo: `getBookingForUser` + `savePaymentAttempt` (también liga `bookings.idTransaccion` como Blink — mantiene lookup legado).
- [x] `payment-3ds-service.ts`: ahora relanza Error saneado con `mensajes` (antes tragaba errores → 502 genérico); nunca loguea `response.data` completo (podría contener la tarjeta).

## Fase 3 — Webhook Wompi ✅

- [x] Firma HMAC-SHA256(rawBody, `WOMPI_CLIENT_SECRET`) vs header `wompi_hash` — **confirmada contra docs oficiales de Wompi SV**; se añadió `timingSafeEqual`.
- [x] Busca `payment_attempt` por `wompiTransactionId`; compara monto (ignora evento si no coincide); marca paid/failed según el evento.
- [x] Idempotente: estado final → 200 sin efectos; socket/WhatsApp/push solo en la transición; 200 rápido (efectos con catch en segundo plano).
- [x] Extracción defensiva del payload (top-level y `data.transaccion`) con **TODO** para confirmar contra payload real.
- [x] Fallback legado por `bookings.idTransaccion` para reservas iniciadas antes del cambio (con idempotencia).
- [x] `updateBookingStatusByTransactionId` (booking-service.ts) también pone `paymentStatus='paid'` al completar → cubre el webhook de **Blink**.

## Fase 4 — Endpoint de estado ✅

- [x] `GET /api/v1/bookings/:id/payment-status` (requireAuth; dueño; 404 si no) → `{ status }`. Mapeo legado: status 'completed' + paymentStatus 'pending' → 'paid'.

## Fase 5 — Frontend ✅

- [x] `checkout-form.tsx`: flujo tarjeta invertido (reserva primero, con ref `createdBookingIdRef` para reintentos sin duplicar y reset si cambia bookingData; 3DS solo con bookingId + datos cliente/tarjeta). Blink → `router.push('/payment/result?booking=ID')` al confirmarse (socket + visibilitychange).
- [x] Ruta `/payment/result` (`src/app/payment/result/`): page server + `payment-result-content.tsx` (polling 2s × 15 con Bearer fresco de Clerk, estados paid/failed/pending/agotado/sin-booking, SignInButton modal si no hay sesión, 401 → sesión expirada).
- [x] Middleware: `/payment(.*)` en rutas públicas (evita fallback de rol a `/` con sesión rota). No existe redirect de `/home` a `/`.
- [x] i18n: `getNamespacesForRoute` carga `home`+`menu` en `/payment`; claves `home.paymentResult.*` es/en.
- [x] `CreateBookingInput` con `idTransaccion` opcional (la reserva se crea antes de la transacción).
- Typecheck frontend ✓.

## Fase 6 — Configuración ✅

- Backend (Railway, servicio dantours): `FRONTEND_URL` (nueva, default `https://www.dubuu.com`; local `http://localhost:3000`), `API_URL` (ya existe; debe ser la URL pública del backend para `urlWebhook`), `WOMPI_CLIENT_ID`/`WOMPI_CLIENT_SECRET`/`WOMPI_URL` (ya existen). Frontend: sin variables nuevas (usa rewrite `/backend`).
- Migración: `npm run dz:push` en el backend (**el usuario la ejecuta cuando despliegue**).

## Fase 7 — Verificación ✅

- [x] Lista de pruebas manuales (abajo, en Entrega final).

## Entrega final ✅

Ver sección "Entrega final" al pie de este archivo.
