# Estado actual
Última actualización: 2026-10-18

## Debug pagos reales (Wompi) — campos requeridos y diagnóstico del webhook

- **Campos de dirección ahora requeridos**: `checkout-schema.ts` valida `city` y `zipCode` para tarjeta (antes solo address/country/state — por eso Wompi rechazaba "El campo ciudad es un dato requerido" con el campo vacío). El backend (`payment-3ds-controller.ts`) también valida los 8 campos del cliente (400 con mensaje claro) y avisa 503 si falta `API_URL` (sin ella el webhook no puede confirmarse).
- **Webhook Wompi con diagnóstico seguro**: `wompi-webhook-controller.ts` ahora loguea `[wompi-webhook]` — keys raíz del payload (nunca valores), IdTransaccion extraído, monto/aprobado, fallback legado y firmas rechazadas (403). `extractTransactionId` normaliza a string.
- **Result page escucha el socket**: `payment-result-content.tsx` usa `useOnPaymentCompleted` → estado "paid" instantáneo si el webhook completa mientras el usuario espera (sin esperar el polling).
- **Aclaración**: `payout_status` es el estado de pago al HOST (siempre 'pending' hasta que Dubuu le pague) — no es el estado del pago del viajero. Lo relevante ahora: `bookings.paymentStatus` y `bookings.status`.
- Pendiente del usuario: verificar `API_URL` en Railway (URL pública del backend), revisar en el panel de Wompi las entregas del webhook, y repetir una prueba pegando los logs nuevos `[wompi-webhook]`.

## Vibración háptica en SlideToPay

- `slide-to-pay.tsx` ahora vibra al iniciar el deslizamiento (`vibrateTap()`, pulso ligero de 15ms en `pointerdown`) y al completarlo (`vibrateSuccess()` en `finish()` — también cubre el atajo de teclado). Nuevo helper `vibrateTap` en `src/lib/vibration.ts`. Nota: en iPhone/iOS Safari no hay Vibration API — los guards lo ignoran silenciosamente.

## Flujo de pago 3DS + pantalla de éxito /payment/result (tracker: `payment-3ds-flow.md`)

- **Backend** (`dantours-drizzle-nodejs`): tabla `payment_attempts` + columna `bookings.paymentStatus` (default 'pending'); migración `drizzle/0028_robust_ma_gnuci.sql` **sin ejecutar** (aplicar con `npm run dz:push`). Controller 3DS (`payment-3ds-controller.ts`) exige auth, recibe `bookingId` sin `total`, valida dueño (404/409) y monto desde `booking.total`, redirige a `${FRONTEND_URL}/payment/result?booking=<id>`, guarda intento `pending` y loguea sin datos de tarjeta. Webhook Wompi: HMAC confirmado vs docs oficiales, busca el intento, compara monto, idempotente, marca paid/failed y emite socket/WhatsApp/push solo en la transición; extracción defensiva del payload con TODO para confirmar campos reales. `GET /api/v1/bookings/:id/payment-status` (dueño, devuelve `{status}`). `updateBookingStatusByTransactionId` ahora también pone `paymentStatus='paid'` (cubre Blink).
- **Frontend**: flujo tarjeta invertido — la reserva se crea ANTES del 3DS (ref `createdBookingIdRef` evita duplicados en reintentos) y el 3DS se llama solo con `bookingId` + datos de cliente/tarjeta. Blink navega a `/payment/result?booking=ID` al confirmarse el pago. Nueva ruta pública `/payment/result` con polling (2s × 15) al endpoint de estado, estados pagado/fallido/pendiente/agotado, SignInButton modal si no hay sesión. `CreateBookingInput.idTransaccion` ahora opcional. Claves `home.paymentResult.*` es/en.
- **Env nueva backend**: `FRONTEND_URL` (default `https://www.dubuu.com`). Pendiente del usuario: ejecutar la migración y validar con un pago real el formato del payload del webhook (TODO en `wompi-webhook-controller.ts`).
- Nota backend: lint no disponible (falta `@typescript-eslint/eslint-plugin`); se verificó con `npx tsc --noEmit` por fase.

## Notificaciones push — consentimiento, registro y clic (viajero y host)

- **El backend ya envía push al viajero y al host** al completarse el pago (`sendBookingCompletedPushNotification` desde webhooks Wompi/Blink, repo dantours). Sin cambios en backend. El envío no llegaba por fallos del frontend (abajo).
- **Bug corregido — registro del token FCM fallaba siempre**: `POST /backend/api/v1/users/fcm-token` exige auth de Clerk y el fetch no enviaba `Authorization`. `src/lib/push-notifications.ts` ahora envía `Authorization: Bearer <getClerkSessionToken()>` (helper en `src/redux/clerk-token.ts`) y valida `response.ok` (401 → mensaje de sesión expirada).
- **Nuevo modal de consentimiento** `src/components/notifications-consent-modal.tsx` (montado en `global-providers.tsx`): abajo a la derecha (z-11500), estilo banner de cookies, solo con sesión y tras decidirse el consentimiento de cookies (escucha `COOKIE_CONSENT_EVENT`). Botón "Habilitar" → `enablePushNotifications()` desde el clic (gesto requerido por Firefox/Safari) → prompt nativo → toast + clave `dubuu:notifications:consent`. "Ahora no"/"Entendido" no vuelven a mostrarlo.
- **Navegadores sin soporte**: `getPushSupport()` en `push-notifications.ts` detecta iOS sin PWA instalada (`reason:"ios"`), contexto no seguro y falta de Notification/serviceWorker/PushManager. El modal muestra el aviso correspondiente (en iPhone: añadir a pantalla de inicio, iOS 16.4+). Safari macOS 13+ sí es soportado.
- **El auto-enabler ya no pide permiso sin gesto**: `enablePushNotifications({auto:true})` solo re-registra el token si el permiso ya es `granted` (clave `PROMPTED_KEY` eliminada). Tarjeta de perfil (`activate-notifications.tsx`) sin cambios de flujo; texto idle actualizado.
- **Service worker `public/firebase-messaging-sw.js`**: (1) `notificationclick` propio registrado ANTES de `firebase.messaging()` con `stopImmediatePropagation` (neutraliza el handler del SDK que navegaba a links con route groups → 404); normaliza los links del backend (quita `(user)`/`(host)`, colapsa detalles inexistentes a `/account/bookings` y `/dashboard/bookings`) y resuelve contra el origin del SW; enfoca/navega ventana existente o abre una nueva. (2) `onBackgroundMessage` hace early return si `payload.notification` existe — el SDK ya muestra esa notificación (evita duplicados); solo muestra manualmente mensajes data-only.
- **Foreground**: el handler `onMessage` ahora usa `registration.showNotification` (Chrome Android no permite `new Notification`), con fallback a `new Notification` + onclick → `resolveNotificationLink`.
- **Pendiente backend (futuro)**: corregir los links de `booking-push-notification-service.ts` (apuntan a `(user)/...` y a rutas de detalle inexistentes); considerar tokens multi-dispositivo (hoy `users.fcm_token` es único y se sobrescribe).

## Bug hora de reserva en desktop (alquiler) corregido

- `rental-booking-form.tsx`: los dos `TimePicker` usan siempre la rama `modal` (Dialog). Antes en desktop usaban la rama Popover dentro del Dialog modal de fechas: Dialog (`@radix-ui/react-dialog@1.1.4`, dismissable-layer 1.1.3) y Popover (`@radix-ui/react-popover@1.1.6`, dismissable-layer 1.1.5) no comparten contexto → el Popover heredaba `pointer-events:none` y el focus trap lo cerraba ("no puedo cambiar la hora"). La rama Dialog ya funcionaba en móvil (Dialog dentro de Sheet). `time-picker.tsx` intacto (rama Popover sin uso).

## Recibo PDF y detalles de reserva del host
- **Recibo (PDF del cliente)**: la fecha de reserva ahora sale en minúscula y legible (`sábado, 31 de octubre 12:00 PM`; en inglés `Saturday, October 31 12:00 PM`). Para alquileres, recogida y devolución van en **líneas separadas** dentro del PDF (se quitó el separador `→`/`—` que jsPDF 4 renderizaba mal — era la causa del texto "muy separado"). `pdf-button.tsx` ahora dibuja la fecha multi-línea y desplaza el contenido siguiente (`reservationExtra`). Fuentes de datos: `booking-status.tsx` y `booking-details.tsx` (user) con `"\n"`.
- **Modal de detalles del host** (`booking-details-modal.tsx`): las fechas de reserva/recogida/entrega ahora usan el mismo formato legible (antes `DD/MM/YYYY h:mm A`). Se agregó botón **"Ver en Google Maps"** (`https://www.google.com/maps/search/?api=1&query=<dirección>`, misma URL que usa rental-booking-form): en alquileres usa `pickup_location`; en tours usa la dirección del producto (`products` del listado, prop nueva `tourAddress` desde `bookings-table.tsx` — sin cambio de backend). En tours también se muestra la dirección en el modal.
- **Recogida/Entrega separadas (alquiler)**: en el recibo PDF, la sección FECHA DE RESERVA ahora muestra bloques RECOGIDA (fecha+hora+lugar) y ENTREGA (fecha+hora+lugar) con sus lugares (`pickupDateTime/pickupLocation/dropoffDateTime/dropoffLocation` nuevos en `ReceiptProps`; los llenan `booking-status.tsx` y `booking-details.tsx`; `reservationDate` quedó solo para tours). En el modal del host, recogida y entrega son bloques separados (cuándo, a qué hora y dónde) y **cada uno tiene su propio botón** "Ver en Google Maps".
- Traducciones nuevas `dashboard.clientDetails.location`, `.viewOnGoogleMaps`, `.pickup` y `.dropoff` (es/en).
- **Dashboard del host**: la tabla de historial de pagos ahora vive dentro del mismo grid que "Actividad de reservas" y "Próximas reservas" — ocupa el 100% del ancho en desktop (`md:col-span-2 lg:col-span-7`) debajo de ambas; en mobile se apila al final. **Solo se muestra si el host tiene pagos** (`useGetOwnPaymentHistoryQuery` con pageSize 1 para saber el total; la tabla sigue con su propia consulta paginada).
- **Badge de estado en el modal de reservas del usuario**: antes era outline/transparente con letra verde sobre la imagen (no se notaba); ahora usa fondo sólido (verde completado/confirmado, ámbar pendiente, rojo cancelado) con texto blanco.


## Comisiones — tasas definitivas y concordancia frontend/backend
- **Tasas definitivas (decisión del usuario): 8.5% plataforma (ganancia Dubuu) + 3.5% Wompi = 12% total.**
- Frontend `src/lib/price.ts`: eliminados `getTaxBreakdown` (sumaba comisiones ENCIMA del precio publicado y etiquetaba `iva: paymentProcessing` — modelo abandonado) y `getCommissionRates` (sin uso). Quedan `getHostEarningsFromFinalPrice` y `getHostEarningsFromTotalSum`. El desglose ahora redondea el 12% combinado (`totalFee`), igual que el backend → sin diferencias de centavos entre dashboard del host y panel de pagos. Se quitó el comentario huérfano en `multimedia-step.tsx`.
- Backend `src/lib/commission.ts` alineado: 0.09/0.03 → 0.085/0.035. Los cálculos solo usan el total (12%) y host share (88%) en `payout-service.ts`; el desglose individual no entra en ninguna fórmula.
- Flujo verificado: el viajero paga **exactamente el precio publicado** (booking-form envía `userPays` sin recargo; Wompi cobra ese monto; `booking-service` lo guarda tal cual). Las comisiones se descuentan del host (88%).
- **Funciones muertas con recargo viejo eliminadas** (no las usaba ninguna pantalla): `calculateTotal` (`src/utils/index.tsx`, sumaba 13% IVA + 5% turismo + 3% fee encima), `calculatePrices` (`src/components/modules/add-tour/utils.ts`, 5% turismo + 10% plataforma) y `calculateRentalPrice` duplicada (`utils/index.tsx` y `utils/product-helpers.tsx`).

## Historial de pagos para el HOST (dashboard)
- Nuevo endpoint `GET /api/v1/payments/history` (rol host, en `payment-account-routes.ts`): devuelve los pagos del host autenticado reutilizando `getHostPaymentHistory` del servicio de payouts (misma forma que el admin).
- El dashboard del host (`dashboard-content.tsx`) muestra debajo de los gráficos la **misma tabla del admin** (Fecha, Monto, Referencia, Estado, Comprobante) reutilizando `HostHistoryTable` con `own` (usa `useGetOwnPaymentHistoryQuery`) y `showExport={false}` (el export es admin-only). El comprobante se ve con el mismo `ReceiptModal`.
- Los gráficos se achicaron: el bar chart de actividad pasó de 290px a 200px de alto.
- Traducciones `dashboard.paymentHistory` agregadas (es/en).

## Tabla All Hosts: solo hosts con reservas y sin select de host
- Backend `getHostsTable`: solo devuelve hosts con **al menos una reserva** (join a bookings); sin reservas no hay nada que pagar ni revisar.
- Se eliminó el select de host de la barra (y su endpoint `GET /admin/payouts/hosts` + query `getHosts` + tipo `HostOption` + traducciones allHosts/searchHost/noHostsFound). La tabla se gestiona solo con: estado (fila superior), búsqueda, período, fechas y exportar.
- Se eliminó también `hostId` de la tabla/params del frontend (el backend de summary/export sigue aceptando hostId opcional por compatibilidad) y la lógica de preselección `onDefaultHost`.

## Vista de pagos admin (`/dashboard/payouts`) — estado final

**Tarjetas** (`summary-cards.tsx`): hero Total Recaudado (80%) + Total pagado (20%) en fila (desktop); mobile: Recaudado 100% + 3 columnas (Pagado, Comisión, Total a pagar). Solo 4 métricas, sin tooltips. "Ganancia de Dubuu" en comisión. Tendencia vs período anterior (`previousTotalCollected`).

**Tabla All Hosts** (`hosts-table.tsx` + `payouts-filters.tsx` + `payouts-content.tsx`):
- Columnas: **Host(username) · Por pagar · Pagado · Último pago · Estado · View** (sin "Pendiente" — duplicaba "Por pagar").
- "Por pagar" = **lo que falta por pagar** (disminuye con los pagos). Colores: rojo si hay monto/deuda, verde en 0.00; "Pagado" rojo si aún se debe.
- Barra 2 filas: [Host]+[Estado] arriba; [Buscador (largo, al inicio)] [Período] [Fechas solo con "Personalizado"] … [Exportar] abajo. Mobile apilado.
- Default: filtro **Pendiente**, orden "Por pagar" desc, preselección del primer host pendiente (`onDefaultHost`). Concordancia: host seleccionado → tabla solo ese host.
- Export CSV global: `GET /admin/payouts/export` (`;`, BOM, `pagos_dubuu[_desde][_hasta].csv`), descarga fetch+blob.

## Detalle del host (`/dashboard/payouts/hosts/:hostId`) — Fase 4, estado final

- Cabecera: avatar, nombre/@username, email y teléfono **desencriptados** (el backend los devuelve planos). Sin badge de estado, sin botón "Ver / Editar datos de pago".
- Stats: **Por pagar + Pagado** (2 cards) + barra de progreso (solo si hay actividad).
- **Tabs: Historial de pagos (default) y Datos bancarios** (la tab "Resumen" se eliminó).
- **Registrar pago**: botón arriba a la derecha del Historial, SOLO si `outstanding > 0`. Modal: monto (decimales filtrados, ≤ outstanding salvo checkbox "permitir exceder"), fecha, hora (precarga la hora actual), **referencia obligatoria siempre**, comprobante PDF/JPG/PNG (se sube al seleccionar, muestra nombre/tamaño), notas. **Método fijo: transferencia bancaria** (sin select).
- Historial: tabla (fecha+hora, monto, referencia, estado, comprobante, notas), búsqueda, rango de fechas, paginación y export CSV del host (`/export?hostId=`). Sin columna ni filtro de método.
- **Datos bancarios**: lee de `payment_accounts` (payment_method='bank'), todos los campos **desencriptados** en el endpoint. Muestra: Banco, Tipo de cuenta, Número de cuenta (enmascarado; copiar copia el completo) y Titular — cada uno con botón copiar. Sin correo de contacto ni alerta (por decisión del usuario).
- **Comprobante**: modal con metadatos + preview (`next/image` fill/contain/unoptimized para imágenes; iframe para PDF) + descarga real fetch→blob (fallback: abrir en pestaña). Sin "Abrir en nueva pestaña" como botón.
- Subida de comprobantes: `/files/upload` genera key único `receipts/<ts>-<i>-<nombre seguro><ext>` vía CloudFront (antes usaba el nombre original → URLs rotas).

## Backend de pagos (dantours-drizzle-nodejs)

- `payouts` por-HOST (migrado y aplicado en BD): host_id(text→users.id), amount, payment_date/time, payment_method ('bank_transfer' fijo), bank_account_used, transaction_reference, receipt_url, notes, paid_by, created_at/updated_at + índices.
- Endpoints: `/admin/payouts/summary` (previousTotalCollected, bookingCount, pendingHosts), `/history`, `/export`, `/hosts-table` (dateFrom, dateTo, hostId, search, status, sortBy, sortOrder, page, pageSize), `/hosts`, `/hosts/:hostId`, `/hosts/:hostId/history`, `/hosts/:hostId/bank-details`, `POST /admin/payouts` (validaciones: monto>0 y ≤ outstanding salvo allowExceed, fecha, referencia obligatoria; paid_by = sesión).
- **PII encriptada en BD** (AES, `utils/crypto.ts`): users.email/phone_number y todos los campos de payment_accounts. Los endpoints de admin los desencriptan (fallback legado). `payment_method` de payment_accounts también está encriptado.
- BD sin `__drizzle_migrations` (se maneja con `dz:push`; baselinar si se quiere `dz:mig`). `bookings.payout_status` sin uso (limpieza futura). Queda borrar `drop-payouts.tmp.js` del backend.

## Seguridad (backend, hecho en sesiones previas)
- `updateProduct`/`deleteProduct`: propiedad contra `req.auth.userId` (nunca el body); bypass admin vía `(req as any).userRoles` (adjuntado en `role-validator.ts`); `user_id` del body se descarta.
- `POST /api/v1/products`: `requireAuth()` + `requireRole(['host','admin'])`; `createProduct` fuerza `user_id` = sesión.

## Validación de formularios (Crear Tour / Alquiler)
Completa (detalles en CLAUDE.md): filtros en vivo por tipo de campo, sanitización anti-inyección, zod trim/min/max, errores en tiempo real con aria, resumen de errores, doble envío bloqueado. Convenciones en `src/components/modules/add-tour/validation.ts` y `form-error-summary.tsx`.

## Docs
- Spec canónica del panel admin: `src/instructions/panel-admin.md`. Tracker de progreso: `panel-admin.md` (raíz). Este archivo: estado actual consolidado.
- `CLAUDE.md`: estructura, formularios, validación y panel admin.

## Pendientes
- **Fase 5**: Reports (filtros, formato PDF/Excel/CSV + historial de reportes generados).
- Limpiar `bookings.payout_status` (sin uso) y borrar `drop-payouts.tmp.js` del backend.
- Baselinar `__drizzle_migrations` si se adopta flujo `dz:mig`.
