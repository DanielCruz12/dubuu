# Estado actual
Última actualización: 2026-10-05

## Vista de pagos admin (`/dashboard/payouts`) — estado final tras todos los ajustes

**Tarjetas** (`summary-cards.tsx`):
- Hero: Total Recaudado (80%) + Total pagado (20%) en la misma fila (desktop). En mobile: Total Recaudado 100% y debajo 3 columnas (Total pagado, Comisión, Total a pagar).
- Solo 4 métricas: collected, paid, commission, outstanding ("Total a pagar"). Sin tooltips. "Ganancia de Dubuu" como descripción de comisión. La tendencia usa `previousTotalCollected`; el conteo de reservas se quitó del hero.
- Cards eliminadas: Pagable a Hosts, Hosts por pagar (el backend aún devuelve `pendingHosts` — sin uso; se puede quitar).

**Barra de la tabla** (`hosts-table.tsx` + `payouts-filters.tsx` + `payouts-content.tsx`):
- Fila superior: [Host] + [Estado] a la par (mobile también, host primero, tamaño natural).
- Fila principal: [Buscador (más largo, al inicio, w-64/72, full-width mobile)] [Período "Este mes"] [Rango de fechas — SOLO si el preset es "Personalizado"] … [Exportar al final].
- `payouts-filters.tsx` se dividió en `PayoutPeriodFilter` y `PayoutHostFilter` (el host usa username del backend `getHosts`).
- Export CSV: `GET /admin/payouts/export` (separador `;`, BOM, filename `pagos_dubuu[_desde][_hasta].csv`), descarga con `fetch`+blob en `payouts-content.tsx` (auth por cookie de Clerk).

**Tabla All Hosts**:
- Columnas: Host(username) · Por pagar · Pagado · Pendiente · Último pago · Estado · View.
- Colores: Por pagar > 0 rojo / 0 verde; Pagado según deuda (outstanding > 0 → rojo aunque sea 0.00; al día → verde); Pendiente igual.
- Por defecto: filtro **Pendiente**, orden outstanding desc (primero a quien más se le debe). `onDefaultHost` preselecciona el primer host pendiente en el select de host de arriba.
- Concordancia: si hay host seleccionado, la tabla muestra solo ese host (backend filtra por `hostId`). "Todos los estados" sigue disponible en el select de estado.
- View → `/dashboard/payouts/hosts/:hostId` (página placeholder hasta Fase 4).

**Quitado de esta pantalla**: historial global de pagos (irá en el detalle del host, Fase 4). `payout-history-table.tsx` borrado (git lo tiene). Endpoint backend `/history` sigue existiendo (lo usarán Fase 4 y el export).

**Sidebar**: layout dashboard 260px (md) / 280px (lg) en `src/app/(host)/dashboard/layout.tsx`. El sheet mobile quedó en `w-[250px]` (ajuste manual del usuario en `src/layouts/sidebar.tsx`).

## Backend de pagos (dantours-drizzle-nodejs)
- Modelo por-HOST en `payouts`: host_id(text→users.id), amount, payment_date/time, payment_method(bank_transfer|cash|other), bank_account_used, transaction_reference, receipt_url, notes, paid_by, created_at/updated_at + índices. (Antes era pago-por-reserva; se eliminaron `/bookings`, `/mark-paid`, `/mark-paid-batch` y su UI.)
- Endpoints vivos: `/admin/payouts/summary` (incluye previousTotalCollected, bookingCount, pendingHosts), `/history`, `/export`, `/hosts-table` (params: dateFrom, dateTo, hostId, search, status, sortBy, sortOrder, page, pageSize), `/hosts`.
- **Migración aplicada en la BD (confirmada por el usuario, 2026-10-05)**: la tabla `payouts` ya vive en la BD con el modelo por-host. Queda pendiente solo borrar el script temporal `drop-payouts.tmp.js` del backend (ya no se necesita).
- BD sin `__drizzle_migrations` (siempre se usó `dz:push`): `dz:mig` no aplica hasta baselinar (deuda técnica). Journal saneado (0022 recreado como no-op; 0023 aplica el is_active real).
- `bookings.payout_status` quedó sin uso (limpieza futura).

## Seguridad (backend, hecho en sesiones previas)
- `updateProduct`/`deleteProduct`: propiedad validada contra `req.auth.userId` (nunca el body); admin bypass vía `(req as any).userRoles` (adjuntado en `role-validator.ts`). `user_id` del body se descarta.
- `POST /api/v1/products`: ahora con `requireAuth()` + `requireRole(['host','admin'])` y `createProduct` fuerza `user_id` = sesión.

## Validación de formularios (Crear Tour / Alquiler)
Implementada completa (ver sesión en CLAUDE.md): filtros en vivo por tipo de campo, sanitización anti-inyección, zod con trim/min/max, errores en tiempo real, resumen de errores, doble envío bloqueado. Convenciones en `src/components/modules/add-tour/validation.ts` y `form-error-summary.tsx`.

## Docs
- Spec canónica del panel admin: `src/instructions/panel-admin.md` (del usuario). Tracker de progreso: `panel-admin.md` (raíz).
- `CLAUDE.md`: estructura, formularios, validación y estado del panel admin.

## Pendientes globales
- **Fase 4** (spec #4–#10): página Host Payment Details (avatar, email, teléfono, 3 stats + barra de progreso, tabs Overview/Payment History/Bank Details, modal Register Payment con monto libre/fecha/hora/método/referencia/comprobante y validaciones, modal de comprobante, auditoría "Created by"). Endpoints previstos: `GET /admin/payouts/hosts/:hostId`, `/hosts/:hostId/history`, `/hosts/:hostId/bank-details`, `POST /admin/payouts`, `POST /admin/payouts/:paymentId/receipt`. Nota: los datos bancarios viven en `users` (bank_name, account_number, account_type).
- **Fase 5**: Reports (PDF/Excel/CSV + historial de reportes).
- Deuda técnica BD: baselinar `__drizzle_migrations` si algún día se quiere flujo `dz:mig` (hoy la BD se maneja con `dz:push`).
