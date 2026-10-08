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

## Fase 4 — Host Payment Details (completada 2026-10-08)
Spec #4–#10, #12:
- **Página** `/dashboard/payouts/hosts/:hostId` (`host-detail-content.tsx` + componentes en `(components)/host-detail/`): cabecera con avatar, nombre/@username, email, teléfono, badge de estado y botón "Ver / Editar datos de pago" (abre la pestaña Banco); 3 estadísticas (Por pagar/Pagado/Pendiente) + barra de progreso "% pagado"; skeletons de carga.
- **Tabs**: Overview (próximo pago cada viernes con fecha estimada, monto = outstanding y botón Registrar pago; pagos recientes con ver comprobante) · Payment History (tabla con fecha+hora, monto, método, referencia, estado, comprobante, notas; búsqueda, rango de fechas, filtro por método, paginación y export CSV del host) · Bank Details (banco, tipo de cuenta, número enmascarado con botón copiar, última actualización, alerta de verificación).
- **Register Payment** (`register-payment-modal.tsx`): host + saldo pendiente; monto (filtrado a decimales, máx. 2), fecha, hora, método (bank_transfer/cash/other), referencia (obligatoria en transferencias), comprobante PDF/JPG/PNG (se sube al seleccionar vía `/files/upload` y muestra nombre/tamaño), notas; validaciones inline (monto > 0, monto ≤ outstanding salvo checkbox "Permitir exceder", fecha y método obligatorios); toast de éxito y actualización automática (RTK tags invalidan summary/detalle/historial).
- **Comprobante** (`receipt-modal.tsx`): metadatos del pago (fecha, monto, host, referencia, estado PAID), preview de imagen o PDF en iframe, descargar y abrir en nueva pestaña.
- **Backend**: `GET /admin/payouts/hosts/:hostId` (detalle + finanzas históricas del host), `GET /hosts/:hostId/history` (filtros fecha/búsqueda/método + paginación), `GET /hosts/:hostId/bank-details` (datos de `users`), `POST /admin/payouts` (registra pago validando monto/fecha/método/referencia/outstanding; `paid_by` = sesión; auditoría spec #12 completa). El export por host reutiliza `GET /export?hostId=`.
- **Nota**: `POST /admin/payouts/:paymentId/receipt` (spec #14) no fue necesario — el comprobante se sube antes de registrar el pago y queda asociado al pago en `receipt_url`.
- **Modelo de datos**: `payouts` por-host con auditoría, migrado y aplicado en la BD. `bookings.payout_status` quedó sin uso (limpieza futura). Queda borrar el script temporal `drop-payouts.tmp.js` del backend.

## Fase 5 — Reports (pendiente)
Spec #11: sección Payment Reports con filtros (rango, host, estado, formato PDF/Excel/CSV) + historial de reportes generados (fecha, rango, host, formato, generado por, descarga). Por ahora solo existe el CSV directo (global y por host) de las Fases 2 y 4.

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
