# Estado actual
Última actualización: 2026-10-16

## Recibo PDF y detalles de reserva del host
- **Recibo (PDF del cliente)**: la fecha de reserva ahora sale en minúscula y legible (`sábado, 31 de octubre 12:00 PM`; en inglés `Saturday, October 31 12:00 PM`). Para alquileres, recogida y devolución van en **líneas separadas** dentro del PDF (se quitó el separador `→`/`—` que jsPDF 4 renderizaba mal — era la causa del texto "muy separado"). `pdf-button.tsx` ahora dibuja la fecha multi-línea y desplaza el contenido siguiente (`reservationExtra`). Fuentes de datos: `booking-status.tsx` y `booking-details.tsx` (user) con `"\n"`.
- **Modal de detalles del host** (`booking-details-modal.tsx`): las fechas de reserva/recogida/entrega ahora usan el mismo formato legible (antes `DD/MM/YYYY h:mm A`). Se agregó botón **"Ver en Google Maps"** (`https://www.google.com/maps/search/?api=1&query=<dirección>`, misma URL que usa rental-booking-form): en alquileres usa `pickup_location`; en tours usa la dirección del producto (`products` del listado, prop nueva `tourAddress` desde `bookings-table.tsx` — sin cambio de backend). En tours también se muestra la dirección en el modal.
- Traducciones nuevas `dashboard.clientDetails.location` y `.viewOnGoogleMaps` (es/en).


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
