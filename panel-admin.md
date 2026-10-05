# Panel de Administración — Progreso por fases

> **Spec canónica (fuente de verdad):** `src/instructions/panel-admin.md`. Ahí está el detalle completo de cada sección (columnas, flujos, validaciones, API). Este archivo solo registra el avance, las decisiones de implementación y las desviaciones.

Reglas transversales:
- Rutas del panel admin: `/api/v1/admin/*` con `requireAuth()` + `requireRole(['admin'])`.
- Comisión única en backend `src/lib/commission.ts`: 9% plataforma + 3% procesamiento = 12% (Dubuu); el host recibe 88% (`HOST_SHARE_RATE`).
- Solo reservas COMPLETED generan deuda con el host. Outstanding = ganancia del host − ya pagado (nunca negativo).
- No cargar detalle de todos los hosts de una vez (spec #13): la tabla de hosts es ligera y el detalle se carga por host en su propia página.

## Fase 1 — Pagos: limpieza y base (completada 2026-10-04)
- Vista `/dashboard/payouts` (solo admin) con tarjetas, filtros de período/host, tabs pendientes/historial, marcar pagado individual/lote (método, notas, adjunto).
- Se eliminó lo que no se usaba (filtro por producto, botón export sin función — luego reimplementado en Fase 2 —, `paymentReference` de mark-paid).
- Endpoints: `/admin/payouts/summary`, `/bookings`, `/mark-paid`, `/mark-paid-batch`, `/history`, `/hosts`.

## Fase 2 — Página Payments (completada 2026-10-04)
Según spec #2 (Summary cards + selector de rango + Generate Report):
- Tarjetas: Total Collected, Commission (12%), Total to pay, Total paid, Outstanding y **Hosts with pending payments** (`pendingHosts` en `/summary`).
- Rango de fechas con presets + calendario (ya existía).
- **Generate Report** → export CSV `GET /admin/payouts/export` (separador `;`, BOM UTF-8, columnas del historial, filename `pagos_dubuu[_desde][_hasta].csv`). El PDF/Excel de la spec #11 queda para la fase de Reports.

## Fase 3 — Tabla de todos los hosts (completada 2026-10-04)
Según spec #3:
- Componente `HostsTable` debajo de las estadísticas con columnas: Host(username), Total to pay, Paid, Outstanding, Last payment, Status, Actions(View).
- Búsqueda de host, filtro por estado (Pending/Partial/Paid), filtro por fecha (hereda el rango global), orden por columnas y paginación.
- **Por defecto ordena por outstanding desc**: primero los hosts a los que más se les debe (agiliza pagar sin revisar host por host — spec #13).
- Badges: verde Paid, ámbar Partial, rojo Pending.
- `View` navega a `/dashboard/payouts/hosts/:hostId` (página placeholder hasta la Fase 4).
- Endpoint nuevo: `GET /admin/payouts/hosts-table?dateFrom&dateTo&search&status&sortBy&sortOrder&page&pageSize` → devuelve exactamente lo que la tabla muestra (`hostId, username, displayName, totalToPay, totalPaid, outstanding, lastPayment, status`). Implementado con agregados por host (grouped queries) y paginación en memoria — escala bien a cientos de hosts sin cargar detalle.

## Fase 4 — Host Payment Details (en progreso: modelo de datos migrado, UI pendiente)
Spec #4–#10: página `/dashboard/payouts/hosts/:hostId` con avatar, nombre, email, teléfono, estado, botón View/Edit Payment Details, 3 estadísticas + barra de progreso, tabs **Overview / Payment History / Bank Details**, modal **Register Payment** (amount, fecha, hora, método — bank transfer/cash/other —, referencia requerida para transferencias, comprobante PDF/JPG/PNG, notas), validaciones (monto ≤ outstanding salvo permiso explícito), modal de comprobante (preview + descarga) y actualización automática de balances.
- **Modelo de datos migrado (2026-10-04)**: la tabla `payouts` pasó de pago-por-reserva a **pago-por-host** con auditoría (spec #12): `host_id, amount, payment_date, payment_time, payment_method (bank_transfer|cash|other), bank_account_used, transaction_reference, receipt_url, notes, paid_by, created_at, updated_at` + índices por host y fecha. Sin datos que preservar (decisión del usuario: reset de esa tabla).
- Se eliminaron los endpoints por-reserva: `/bookings`, `/mark-paid`, `/mark-paid-batch` (y su UI de pendientes). El historial/export/summary/hosts-table ya leen el nuevo modelo. `bookings.payout_status` quedó sin uso (limpieza futura).
- Endpoints previstos para la UI: `GET /admin/payouts/hosts/:hostId` (resumen detalle), `GET /admin/payouts/hosts/:hostId/history`, `GET /admin/payouts/hosts/:hostId/bank-details`, `POST /admin/payouts` (registrar pago), `POST /admin/payouts/:paymentId/receipt`.

## Fase 5 — Reports (pendiente)
Spec #11: sección Payment Reports con filtros (rango, host, estado, formato PDF/Excel/CSV) + historial de reportes generados (fecha, rango, host, formato, generado por, descarga). Por ahora solo existe el CSV directo de la Fase 2.

## Ideas descartadas / no confirmadas
- Pagos automáticos a hosts vía Blink (`src/services/blink-service.ts` existe en el backend pero el flujo manual de la spec es el priorizado). No forma parte de ninguna fase hasta que el usuario lo pida.

## Endpoints actuales de `/admin/payouts`
| Método | Ruta | Fase |
|---|---|---|
| GET | `/summary` | 1–2 |
| GET | `/history` | 1 (adaptado al modelo por-host en Fase 4) |
| GET | `/export` | 2 (adaptado al modelo por-host) |
| GET | `/hosts-table` | 3 |
| GET | `/hosts` | 1 (opciones del selector de host) |
| POST | `/` (registrar pago por host) | 4 pendiente |
