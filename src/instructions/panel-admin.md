Quiero que construyas una interfaz completa y profesional para el panel administrativo de pagos de **Dubuu**
 
El objetivo del módulo es permitir que un administrador pueda controlar cuánto dinero se le debe a cada host, cuánto ya se le ha pagado, registrar nuevos pagos, consultar los datos bancarios del host, visualizar comprobantes y generar reportes.

## Concepto principal

El sistema NO debe cargar inicialmente toda la información detallada. La vista inicial debe mostrar únicamente un resumen general y una tabla ligera con el primer host cargado, . Cuando el administrador cambie de host, entonces se debe cargar su información detallada.

Esto es importante para evitar saturar la API.


# 2. Página Payments

Título:

**Payouts & Earnings**

Descripción:

**Manage host payments, outstanding balances and payment history.**

En la parte superior mostrar:

### Summary cards

* Total Collected
* Commission (12%)
* Total to pay
* Total paid
* Total outstanding
* Hosts with pending payments

Ejemplo:

Total Collected: $10,000.00
Commission (12%): $1,200.00
Total to pay: $8,800.00
Total paid: $4,200.00
Outstanding: $4,600.00
Pending hosts: 8

Agregar selector de rango de fechas:

`01 Jun 2025 - 30 Jun 2025`

Y botón:

**Generate Report**

---

# 3. Tabla de todos los hosts

Debajo de las estadísticas mostrar:

**All Hosts**

La tabla debe ser ligera y contener solamente información resumida.

Columnas:

* Host(username)
* Total to pay
* Total paid
* Outstanding
* Last payment
* Status
* Actions

Ejemplo:

| Host          | Total to pay |   Paid | Outstanding | Last payment | Status  |
| ------------- | -----------: | -----: | ----------: | ------------ | ------- |
| María López   |         $720 |   $420 |        $300 | Jun 25, 2025 | Partial |
| Carlos García |       $1,200 | $1,200 |          $0 | Jun 20, 2025 | Paid    |
| Ana Torres    |         $950 |   $600 |        $350 | Jun 18, 2025 | Partial |
| Luis Ramírez  |         $680 |     $0 |        $680 | —            | Pending |

Agregar:

* Search host
* Filter by payment status
* Filter by date
* Sort
* Pagination

Cada fila debe tener un botón:

**View**

Al hacer click en View NO mostrar toda la información dentro de la tabla. Abrir la página/detalle del host y hacer una nueva llamada a la API para obtener la información completa.

---

# 4. Host detail

Crear una página:

**Host Payment Details**

En la parte superior:

Avatar
Host name
Email
Phone
Status

Mostrar tres estadísticas:

### Total to pay

$720.00

### Total paid

$420.00

### Outstanding

$300.00

Agregar una barra de progreso:

58% paid

---

# 5. Tabs del host

Crear tabs:

### Payment History

### Bank Details

---

Crear también una sección:

## Next payment (weekly) cada semana (osea cada viernes van a recibir su pago)

Mostrar:

Estimated date
Jul 05, 2025

Amount
$300.00

Status
Pending

Agregar botón:

**Register Payment**

---

# 7. Bank Details

Crear una card/modal llamada:

**Bank Details**

Mostrar:

Bank:
Banco Agrícola

Account type:
Savings

Account number:
1234 **** 9012 (agregas un boton de copy a todos los datos para facilitar el copiar)

Account holder:
María López

También mostrar:

Last updated:
Jun 12, 2025

---

# 8. Register Payment Modal

Al hacer click en:

**Register Payment**

abrir un modal grande.

Título:

**Register Payment**

Mostrar:

Host:
María López

Outstanding balance:
$300.00

Campos:

### Amount to pay

Input

### Payment date

Date picker

### Payment time

Time picker

### Transaction/reference number

Input

### Payment receipt

File upload

Aceptar:

* PDF
* JPG
* PNG

Mostrar nombre y tamaño del archivo después de subirlo.

### Notes

Textarea opcional.

Botones:

Cancel
Register Payment

Antes de guardar mostrar validaciones:

* Amount cannot exceed outstanding balance unless explicitly allowed.
* Payment date required.
* Receipt recommended/required depending on configuration.
* Reference number required for bank transfers.

Después de registrar correctamente:

Toast:

**Payment registered successfully.**

Actualizar automáticamente:

Total paid
Outstanding
Payment history

---

# 9. Payment History

Crear una vista completa:

**Payment History**

Tabla:

* Date & Time
* Amount
* Payment method
* Reference
* Status
* Receipt
* Notes
* Actions

Ejemplo:

Jun 25, 2025 — 10:24 AM
$200
Bank Transfer
TRX-82931
Paid
View receipt

Permitir:

* Search
* Date range
* Payment method filter
* Status filter
* Export

---

# 10. Payment Receipt

Al hacer click en:

**View receipt**

abrir un modal con preview del documento.

Mostrar:

Payment Receipt

Bank transfer

Date
Jun 25, 2025 — 10:24 AM

Amount
$200.00

Destination account
****9012

Account holder
María López

Reference
TRX-82931

Status:

PAID

Mostrar el documento PDF/JPG dentro de un preview.

Botones:

* Download
* Open in new tab
* Close

---

# 11. Reports

Crear una sección independiente:

**Payment Reports**

Permitir generar reportes.

Filtros:

### Date range

Start date / End date

### Host

All hosts / Specific host

### Status

All / Paid / Partial / Pending

### Format

PDF / Excel / CSV

Botón:

**Generate Report**

Debajo mostrar:

## Recent Reports

Tabla:

* Generated date
* Date range
* Host
* Format
* Generated by
* Download

---

# 12. Payment audit / traceability

El sistema debe estar diseñado pensando en auditoría.

Cada pago registrado debe guardar:

* Payment ID
* Host ID
* Amount
* Payment date
* Payment time
* Bank account used
* Transaction/reference number
* Receipt/document
* Notes
* Created by
* Created at
* Updated at

Mostrar "Created by Admin" cuando corresponda.

---

# 13. Important UX behavior

NO cargar toda la información detallada de todos los hosts inicialmente.

Flujo:

1. Admin entra a Payments.
2. API devuelve únicamente resumen de un host. (pero el select tendra la opcion de ver todos los hosts)
3. Admin selecciona un host.
4. Se realiza una nueva API request.
5. Se carga el detalle del host.
6. Admin revisa balance y datos bancarios.
7. Admin registra el pago.
8. Se sube el comprobante.
9. Se actualiza el balance.
10. El pago aparece inmediatamente en Payment History.
11. El documento queda asociado al Payment ID.
12. El administrador puede posteriormente generar reportes.
13. verifica como podemos agilizar a quien le debemos y quien le ya le pagamos 
para no estar revisando host por host, no sera funcional cuando ya hayan mas de 100 hosts y nos tardaremos mucho, o que en la tabla se carguen inicialmente los de status partial o outstanding 

Agregar estados de loading con skeletons mientras se obtiene la información del host.

---

# 14. API architecture

Preparar el frontend pensando en endpoints separados.

Ejemplo:

GET /api/admin/payments/summary

GET /api/admin/payments/hosts

GET /api/admin/payments/hosts/:hostId

GET /api/admin/payments/hosts/:hostId/history

GET /api/admin/payments/hosts/:hostId/bank-details

POST /api/admin/payments

POST /api/admin/payments/:paymentId/receipt

GET /api/admin/payments/reports

POST /api/admin/payments/reports

No hacer una petición gigante que devuelva todos los pagos, datos bancarios e información completa de todos los hosts.

---

# 15. Components

Organizar el código en componentes reutilizables:

PaymentsDashboard
PaymentSummaryCards
HostsPaymentTable
HostPaymentDetails
PaymentOverview
PaymentHistory
BankDetailsCard
BankDetailsModal
RegisterPaymentModal
PaymentReceiptModal
PaymentStatusBadge
PaymentFilters
PaymentReports
ReportGenerator
ReportHistory

---

# 16. Visual style

Usar el estilo visual que ya tenemos en Dubuu, no hagas tantos cambios, ya hay tablas tambien, asi que usa o reutiliza ese diseño

* Blanco
* Azul como color principal
* Gris claro para backgrounds
* Bordes suaves
* Cards con border-radius moderado
* Sombras muy sutiles
* Tipografía moderna
* Mucho espacio en blanco
* Tablas fáciles de leer
* Estados mediante badges
* Verde para Paid
* Amarillo/naranja para Partial
* Rojo para Outstanding/Pending
* Azul para información

No hacer el diseño excesivamente colorido.

Debe sentirse como un **panel financiero administrativo profesional**, no como una landing page.

---

# 17. Important business logic

El sistema debe diferenciar claramente:

**Amount earned**

Dinero generado por las reservas del host.

**Amount paid**

Dinero que Dubuu ya entregó al host.

**Outstanding**

Dinero que Dubuu todavía debe entregar al host.

Formula:

Outstanding = Amount Earned - Total Paid

Nunca mezclar "ganancias de Dubuu" con "dinero que se le debe al host".

La comisión de Dubuu debe mantenerse separada.

Ejemplo:

Booking:
$100

Host earning:
$88

Dubuu commission:
$12

Host paid:
$50

Host outstanding:
$38

El dashboard administrativo debe permitir entender estas cantidades claramente.

---

# 18. Final goal

El resultado debe sentirse como un sistema real de administración financiera para Dubuu, donde un administrador pueda responder rápidamente:

* ¿Cuánto dinero debo actualmente?
* ¿A qué hosts les debo?
* ¿Cuánto le debo específicamente a este host?
* ¿Cuánto ya le pagué?
* ¿Cuándo fue el último pago?
* ¿A qué cuenta bancaria debo enviar el dinero?
* ¿Cuál es la referencia de la transferencia?
* ¿Dónde está el comprobante?
* ¿Quién registró el pago?
* ¿Qué pagos hice durante un determinado período?
* ¿Puedo descargar un reporte?

Prioriza claridad, trazabilidad, seguridad y escalabilidad del frontend.
