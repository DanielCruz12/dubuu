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

## Fase 3 — Tabla de todos los hosts (completada y ajustada hasta 2026-10-10)
Según spec #3:
- `HostsTable` debajo de las estadísticas. Columnas finales (sin duplicidad): **Host(username), Por pagar, Pagado, Último pago, Estado, Actions(View)**.
  - **"Por pagar" = lo que falta por pagar** (disminuye con cada pago; ya NO es el total histórico). La columna "Pendiente" se eliminó porque duplicaba "Por pagar".
  - Colores: rojo cuando hay monto/deuda, verde cuando es 0/al día; "Pagado" rojo si aún se debe (outstanding > 0) aunque sea 0.00.
- Barra en 2 filas: **[Estado]** arriba; **[Buscador (largo, al inicio)] [Período] [Fechas si custom]** … **[Exportar]** abajo. Responsive en mobile. (El select de host se eliminó — decisión del usuario: la tabla se gestiona con búsqueda/estado y el detalle por fila.)
- **Solo hosts con al menos una reserva** (join a bookings en el backend): sin reservas no hay fila que revisar.
- Por defecto: filtro **Pendiente** (no carga todo de una vez) y orden "Por pagar" desc — primero a quién más se le debe (spec #13).
- `View` → `/dashboard/payouts/hosts/:hostId` (detalle de la Fase 4).
- Endpoint: `GET /admin/payouts/hosts-table?dateFrom&dateTo&hostId&search&status&sortBy&sortOrder&page&pageSize`. El campo `outstanding` sigue en la respuesta (lo usan estados/colores), pero `totalToPay` ya es el saldo restante. Agregados por host con grouped queries y paginación en memoria.

## Fase 4 — Host Payment Details (completada y ajustada con el usuario hasta 2026-10-10)
Spec #4–#10, #12:
- **Página** `/dashboard/payouts/hosts/:hostId` (`host-detail-content.tsx` + componentes en `(components)/host-detail/`): cabecera con avatar, nombre/@username, email y teléfono **desencriptados**; **2 estadísticas (Por pagar / Pagado)** + barra de progreso "% pagado" (solo si el host tiene actividad); skeletons de carga. Sin badge de estado ni botón "Ver / Editar datos de pago".
- **Tabs (solo 2)**: **Payment History** (default; tabla fecha+hora, monto, referencia, estado, comprobante, notas; búsqueda, rango de fechas, paginación y export CSV del host; botón **Registrar pago** arriba a la derecha SOLO si `outstanding > 0`) · **Bank Details**. La tab "Resumen" (próximo pago semanal + pagos recientes) se eliminó por decisión del usuario.
- **Register Payment** (`register-payment-modal.tsx`): host + saldo pendiente; monto (decimales filtrados, ≤ outstanding salvo checkbox "Permitir exceder"), fecha, hora (precarga la hora actual), **referencia obligatoria siempre**, comprobante PDF/JPG/PNG (se sube al seleccionar y muestra nombre/tamaño), notas. **Único método: transferencia bancaria** (sin select; backend fija `payment_method = 'bank_transfer'`). Toast y actualización automática vía tags RTK.
- **Bank Details** (`bank-details-card.tsx`): lee de `payment_accounts` (payment_method='bank'), con **todos los campos desencriptados** en el endpoint. Muestra Banco, Tipo de cuenta, Número de cuenta (enmascarado; el botón copiar copia el completo) y Titular — con botón copiar en cada dato. Sin correo de contacto ni alerta (por decisión del usuario).
- **Comprobante** (`receipt-modal.tsx`): metadatos del pago + preview con `next/image` (fill/contain/unoptimized; iframe para PDF) y **descarga real** fetch→blob (fallback: pestaña nueva). Subida vía `/files/upload` con key único `receipts/<ts>-<i>-<nombre seguro><ext>` por CloudFront.
- **Backend**: `GET /admin/payouts/hosts/:hostId` (detalle + finanzas; email/teléfono desencriptados), `GET /hosts/:hostId/history` (fecha/búsqueda + paginación), `GET /hosts/:hostId/bank-details` (desencriptado), `POST /admin/payouts` (monto>0, ≤ outstanding salvo allowExceed, fecha, referencia obligatoria; `paid_by` = sesión; auditoría spec #12). Export por host reutiliza `GET /export?hostId=` (sin columna de método).
- **Nota**: `POST /admin/payouts/:paymentId/receipt` (spec #14) no fue necesario — el comprobante se sube antes de registrar el pago y queda en `receipt_url`.
- **Modelo de datos**: `payouts` por-host con auditoría, migrado y aplicado en la BD. `bookings.payout_status` sin uso (limpieza futura). Queda borrar `drop-payouts.tmp.js` del backend.

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
