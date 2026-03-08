# Socket.IO – Requerimientos para el backend

Documento para el equipo de backend: qué debe exponer el servidor para que el frontend (Next.js) se conecte por Socket.IO sin exponer la URL del backend.

---

## 1. Cómo llega la petición al backend

El frontend se conecta a **mismo origen** (ej. `https://www.dubuu.com`) con **path** `/backend/socket.io`.

Next.js hace un **rewrite** en el servidor:

- **Origen:** `https://www.dubuu.com/backend/socket.io?...`
- **Destino:** `{BACKEND_URL}/socket.io?...`

Es decir: la petición que **recibe el backend** es a la **raíz de tu servidor** con path **`/socket.io`** (sin `/backend`). El prefijo `/backend` solo existe en el frontend; al reescribir, se sustituye por la URL del backend y el path que llega es solo `/socket.io`.

**Requisito:** Socket.IO debe estar montado en el **mismo host y puerto** que la API REST, en el path por defecto **`/socket.io`** (sin prefijos).

Ejemplo en Node/Express:

```js
const http = require('http');
const express = require('express');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

// Socket.IO en path por defecto "/socket.io" (no cambiar)
const io = new Server(server, {
  path: '/socket.io',
  cors: {
    origin: process.env.FRONTEND_URL, // ej. https://www.dubuu.com
    methods: ['GET', 'POST'],
  },
});

// ... rutas REST en app (ej. /api/v1/...)
// ... después:
server.listen(PORT);
```

No usar algo como `path: '/backend/socket.io'` en el backend; el path que llega tras el rewrite es **`/socket.io`**.

---

## 2. URL que debe responder

El backend debe responder correctamente a:

- **Método:** GET (y POST para el handshake de Socket.IO).
- **Path:** exactamente **`/socket.io`** (con query que Socket.IO añade: `EIO=4&transport=polling` o `transport=websocket`, etc.).

Si este endpoint devuelve **404**, el cliente no podrá conectar (como en el caso actual).

Comprobación desde donde esté desplegado el backend (o desde un servidor que tenga acceso a `BACKEND_URL`):

```bash
curl -i "https://TU_BACKEND_URL/socket.io/?EIO=4&transport=polling"
```

Debe devolver una respuesta de Socket.IO (código 200 y cuerpo típico de handshake), **no** 404.

---

## 3. Eventos que usa el frontend

| Dirección | Evento              | Payload / Uso |
|----------|----------------------|----------------|
| Cliente → Servidor | `join` | `{ userId: string }` — mismo `user_id` que en bookings (ej. Clerk `user.id`). El servidor debe unir el socket a la sala `user:{userId}`. |
| Servidor → Cliente | `payment:completed` | `{ bookingId: string, status: string }` — cuando el webhook (Wompi/Blink) confirma el pago y el backend actualiza el booking a `completed`. |

Ejemplo servidor (pseudocódigo):

```js
io.on('connection', (socket) => {
  socket.on('join', ({ userId }) => {
    if (userId) socket.join(`user:${userId}`);
  });
});

// Cuando el webhook confirma el pago:
function onPaymentCompleted(booking) {
  const userId = booking.user_id;
  io.to(`user:${userId}`).emit('payment:completed', {
    bookingId: booking.id,
    status: 'completed',
  });
}
```

---

## 4. CORS

El **origin** de las peticiones será el sitio del frontend (ej. `https://www.dubuu.com`), porque el rewrite se hace en el servidor de Next.js y la petición sale del navegador hacia el mismo dominio; en producción, si en algún momento el cliente hablara directo con el backend, el origin sería el del front.

Si el backend recibe peticiones con `Origin: https://www.dubuu.com`, debe aceptar ese origen en CORS para Socket.IO (y en general para la API). Configurar en el servidor HTTP/Socket.IO el origen del frontend (variable de entorno tipo `FRONTEND_URL`).

---

## 5. Resumen checklist backend

- [ ] Socket.IO montado en el **mismo servidor** que la API (mismo `BACKEND_URL`).
- [ ] Path de Socket.IO: **`/socket.io`** (por defecto; no usar `/backend/socket.io` en el backend).
- [ ] `GET (y POST) /socket.io?...` responden **200** (handshake), no 404.
- [ ] Escuchar evento **`join`** con `{ userId }` y unir el socket a la sala **`user:{userId}`**.
- [ ] Tras confirmar pago (webhook), emitir **`payment:completed`** a **`user:{userId}`** con `{ bookingId, status }`.
- [ ] CORS configurado para el origen del frontend (`FRONTEND_URL`).

Con esto, el frontend que conecta a `https://www.dubuu.com/backend/socket.io` (rewrite a `BACKEND_URL/socket.io`) debería conectar y recibir `payment:completed` sin exponer la URL/IP del backend al cliente.
