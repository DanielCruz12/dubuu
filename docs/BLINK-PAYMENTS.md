# Integración Blink (Bitcoin / Lightning) como método de pago

- **Checkout (cliente):** En la pantalla de pago de una reserva, el cliente puede elegir **Blink (Bitcoin / Lightning)** además de tarjeta.
- **Dashboard (host):** En Información de pago, el host puede elegir recibir sus transferencias vía Blink.

## Frontend (este repo)

- **Tipos:** `PaymentMethod` incluye `"blink"`. Ver `src/types/payment-types/index.ts`.
- **Formulario:** El usuario indica su **dirección Blink / Lightning** (ej: `usuario@blink.sv` o wallet ID) y correo.
- **API:** Al guardar se envía a `POST/PUT /api/v1/payments` un body con:
  - `payment_method: "blink"`
  - `blink_wallet_address`: dirección o Lightning address donde recibir
  - `email`: correo de contacto
  - `user_id`: id del usuario

### Checkout (pagar con Blink)

- En el formulario de checkout el cliente puede elegir el método **Blink**.
- Al enviar, se llama a `POST /api/v1/TransaccionCompra/blink` con el mismo payload que el flujo 3DS (datos de reserva, contacto, envío, etc.).
- El backend debe responder con `{ "paymentUrl": "https://...", "idTransaccion": "..." }` para redirigir al cliente a Blink. Si el endpoint no existe o falla, se muestra un error al usuario.

## Backend

El backend debe:

1. **Aceptar y guardar** cuentas con `payment_method === "blink"` y el campo `blink_wallet_address` (y opcionalmente `email`). No es necesario exigir `bank_name`, `account_number`, etc. cuando el método es Blink.

2. **Checkout Blink:** Implementar `POST /api/v1/TransaccionCompra/blink` que reciba los datos de la reserva, cree una factura/pago en Blink (API de Blink), y responda con `{ paymentUrl, idTransaccion }` para redirigir al cliente.

3. **Para enviar transferencias (payouts)** a un host con método Blink, usar la [API de Blink](https://dev.blink.sv/) para enviar a la dirección guardada (`blink_wallet_address`).

## Configuración Blink (backend / servidor)

Para que el **servidor** pueda enviar pagos vía Blink hace falta:

1. **Cuenta y API Key** en [Blink](https://es.blink.sv/en/api) (dashboard: [dashboard.blink.sv](https://dashboard.blink.sv/api-keys)).
2. **Crear API Key** con alcance adecuado (p. ej. WRITE para enviar). La clave solo se muestra una vez; guardarla en un gestor de secretos.
3. **Variable de entorno** en el backend, por ejemplo:
   - `BLINK_API_KEY=blink_...` (el token completo que entrega el dashboard)

Documentación de la API: [dev.blink.sv](https://dev.blink.sv/) — secciones *Authentication*, *Send BTC*, *Send Stablesats USD*.

## Referencias

- [Blink API (es)](https://es.blink.sv/en/api)
- [Blink Developer Documentation](https://dev.blink.sv/)
- [Blink Dashboard – API Keys](https://dashboard.blink.sv/api-keys)
