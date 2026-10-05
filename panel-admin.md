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

## Fase 2 — Página Payments (completada y ajustada con el usuario hasta 2026-10-05)
Según spec #2, con simplificaciones acordadas:
- Tarjetas finales (4): hero **Total Recaudado** (80%) + **Total pagado** (20%) en la misma fila (desktop; en mobile: recaudado 100% y 3 columnas abajo); debajo **Comisión (12%)** ("Ganancia de Dubuu") y **Total a pagar** (antes "Saldo Pendiente"). Se quitaron: Pagable a Hosts, Hosts por pagar (card) y el conteo de reservas del hero. Sin tooltips.
- Rango de fechas: presets (semana/mes/año) + calendario **solo visible con "Personalizado"**.
- **Generate Report** → export CSV `GET /admin/payouts/export` (separador `;`, BOM UTF-8, filename `pagos_dubuu[_desde][_hasta].csv`). Botón al final de la barra de la tabla. El PDF/Excel de la spec #11 queda para la fase de Reports.
- El historial global de pagos NO vive en esta pantalla (se movió al detalle del host — Fase 4).

## Fase 3 — Tabla de todos los hosts (completada y ajustada hasta 2026-10-05)
Según spec #3:
- `HostsTable` debajo de las estadísticas. Columnas: Host(username), Total to pay, Paid, Outstanding, Last payment, Status, Actions(View). Colores: rojo cuando hay monto/deuda, verde cuando es 0/al día.
- Barra en 2 filas: **[Host]+[Estado]** arriba; **[Buscador (largo, al inicio)] [Período] [Fechas si custom]** … **[Exportar]** abajo. Responsive en mobile.
- Por defecto: filtro **Pendiente** (no carga todo de una vez) y orden outstanding desc — primero a quién más se le debe (spec #13). Preselecciona automáticamente el primer host pendiente en el select de host superior.
- Concordancia: si hay host seleccionado, la tabla muestra solo ese host; "Todos los hosts" muestra la lista.
- `View` → `/dashboard/payouts/hosts/:hostId` (placeholder hasta Fase 4).
- Endpoint: `GET /admin/payouts/hosts-table?dateFrom&dateTo&hostId&search&status&sortBy&sortOrder&page&pageSize` → devuelve exactamente lo que la tabla muestra. Agregados por host con grouped queries y paginación en memoria.

## Fase 4 — Host Payment Details (en progreso: modelo de datos listo, falta aplicar migración en BD y la UI)
Spec #4–#10: página `/dashboard/payouts/hosts/:hostId` con avatar, nombre, email, teléfono, estado, botón View/Edit Payment Details, 3 estadísticas + barra de progreso, tabs **Overview / Payment History / Bank Details**, modal **Register Payment** (amount, fecha, hora, método — bank transfer/cash/other —, referencia requerida para transferencias, comprobante PDF/JPG/PNG, notas), validaciones (monto ≤ outstanding salvo permiso explícito), modal de comprobante (preview + descarga) y actualización automática de balances.
- **Modelo de datos (código) listo**: la tabla `payouts` pasó de pago-por-reserva a **pago-por-host** con auditoría (spec #12): `host_id` (text, users.id es text no uuid), `amount, payment_date, payment_time, payment_method (bank_transfer|cash|other), bank_account_used, transaction_reference, receipt_url, notes, paid_by, created_at, updated_at` + índices.
- **Migración aplicada en la BD (2026-10-05, confirmada por el usuario)**: `payouts` ya vive con el modelo por-host. (El error del primer push — host_id uuid vs users.id text — se corrigió antes de re-aplicar.) Queda borrar el script temporal `drop-payouts.tmp.js`.
- Se eliminaron los endpoints por-reserva: `/bookings`, `/mark-paid`, `/mark-paid-batch` (y su UI). `bookings.payout_status` quedó sin uso (limpieza futura). Nota: datos bancarios del host viven en `users` (`bank_name`, `account_number`, `account_type`).
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
