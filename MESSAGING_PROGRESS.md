# Módulo de mensajería host ↔ usuario — Progreso

Un chat por reserva, habilitado solo entre sus participantes (viajero + host del producto).

## Fases

- [x] **Fase 1 — Backend: fundamento.** Tablas `messages` + `message_reactions`, migración SQL (sin ejecutar en prod),
  validador anti-evasión + pipeline de moderación extensible (listo para IA), servicio, endpoints REST,
  eventos socket, push al recibir mensaje. Verificación: `tsc` backend + jest anti-evasión (32/32).
- [x] **Fase 2 — Frontend: datos + lista de chats.** RTK slice, tipos, hooks socket, pantalla lista
  (último mensaje, no leídos, datos de reserva), estados de carga/vacío. Verificación: `tsc` sin errores nuevos.
- [x] **Fase 3 — Frontend: conversación.** Burbujas, scroll al último, hora relativa auto-actualizada,
  enviado/entregado/leído, compartir ubicación (Leaflet), reacciones con emojis, aviso anti-evasión.
  Verificación: `tsc` sin errores nuevos + exports react-leaflet confirmados.
- [x] **Fase 4 — Navegación + notificaciones.** Opción "Mensajes" con badge en dropdown y sidebars (host y user),
  notificación/toast al recibir mensaje en ambos lados. Verificación: `tsc` sin errores nuevos.
- [x] **Fase 5 — Verificación.** Revisión cruzada del contrato, limpieza, pulido minimalista, guía E2E manual.
  El E2E con dos roles lo corre el usuario (requiere sesiones, backend y BD).

## Bitácora

### Fase 1 — terminada (2026-10-30)

- Autorizado modificar el backend (`dantours-drizzle-nodejs`).
- Descubrimiento: Socket.IO listo en ambos lados (salas `user:{clerkId}`); participantes del chat =
  `bookings.user_id` (viajero) + `products.user_id` (host); sin tabla de mensajes (se creó).
- Qué se hizo:
  - Tablas `messages` (texto/ubicación, estado sent/delivered/read) + `message_reactions` (1 por usuario/mensaje),
    sin tabla de conversaciones: `booking_id` ES el chat. Migración `drizzle/0030_messaging_tables.sql` generada
    con drizzle-kit (NO aplicada a ninguna BD).
  - Validador anti-evasión en backend: links/URLs/dominios (incl. "punto com"), @menciones y redes sociales,
    teléfonos con separadores o en palabras ("siete siete...", "doble cinco"), emails (incl. "arroba...punto..."),
    frases ("escríbeme a WhatsApp", "te paso mi numero"). Responde 422 + aviso claro; el mensaje no se guarda.
  - Pipeline de moderación extensible (`lib/moderation/pipeline.ts`): pasos componibles, primer bloqueo gana;
    placeholder `ai-moderation` documentado para añadir IA después sin tocar servicio/controlador.
  - Servicio (`services/message-service.ts`): chats (viajero+host, último mensaje, no leídos, datos reserva),
    mensajes con paginación, envío, marcar leído, reacciones upsert/delete, autorización por participantes.
  - Endpoints REST (`/api/v1/messages/...`, con `requireAuth`): `chats`, `unread-count`, `bookings/:id` (GET/POST),
    `bookings/:id/read` (PATCH), `:id/reactions` (POST/DELETE).
  - Tiempo real: eventos `message:new|delivered|read|reaction` a salas `user:{id}` de ambos participantes.
  - Push FCM al destinatario con link al chat según rol (`/account/messages` o `/dashboard/messages`).
  - Test `tests/message-anti-evasion.test.ts`: 32/32 en verde. `tsc --noEmit` limpio.
- Archivos tocados (backend `dantours-drizzle-nodejs/`):
  - nuevos: `src/database/schemas/messages.ts`, `src/lib/moderation/anti-evasion.ts`,
    `src/lib/moderation/pipeline.ts`, `src/services/message-service.ts`,
    `src/controllers/message-controller.ts`, `src/routes/v1/message-routes.ts`,
    `tests/message-anti-evasion.test.ts`, `drizzle/0030_messaging_tables.sql` (+ snapshot/meta).
  - editados: `src/constants/enums.ts`, `src/constants/index.ts`, `src/database/schemas/index.ts`,
    `src/routes/v1/index.ts`.
- Qué sigue: Fase 2 (frontend datos + lista de chats). Rutas front previstas: `/account/messages` y
  `/dashboard/messages` (con `?booking=<id>` para abrir un chat directo desde push).

### Fase 2 — terminada (2026-10-30)

- Qué se hizo:
  - Tipos `src/types/messaging.ts` (espejo de la API + payloads socket + error 422 anti-evasión).
  - RTK Query `messagesApi` (`redux/slices/messaging/messaging-slice.ts`): chats, no leídos, mensajes,
    enviar, marcar leído, reacciones. Registrado en `store.tsx` (reducer, middleware, reset por idioma).
  - Hooks: `useRelativeTime` ("hace 2 minutos", auto-actualizado c/30s, ES/EN) y `useMessagingSocket`
    (eventos `message:*` → invalidación de caché RTK).
  - Lista de chats (`components/messaging/chat-list.tsx`): avatar/nombre contraparte, producto, último
    mensaje ("Tú:" si propio, 📍 si ubicación), hora relativa, badge no leídos, skeleton de carga y
    estado vacío con CTA a reservas.
  - Vista `messaging-view.tsx` mobile-first (lista O conversación en móvil, columnas en desktop) +
    páginas server `/account/messages` y `/dashboard/messages` con `?booking=<id>`.
  - Namespace i18n `messaging.json` (es/en) cargado en rutas dashboard/account.
- Archivos tocados (frontend `dubuu/`): nuevos `src/types/messaging.ts`,
  `src/redux/slices/messaging/messaging-slice.ts`, `src/hooks/use-relative-time.ts`,
  `src/hooks/use-messaging-socket.ts`, `src/components/messaging/{messaging-utils,chat-list,messaging-view}.tsx`,
  `src/app/(user)/account/messages/page.tsx`, `src/app/(host)/dashboard/messages/page.tsx`,
  `public/locales/{es,en}/messaging.json`; editados `src/redux/store.tsx`, `src/lib/i18n.ts`.
- Verificación: `tsc --noEmit` sin errores nuevos (quedan 13 preexistentes: 8 en `socket-context.tsx`,
  4 en `home/[slug]/[id]/page.tsx`, 1 en `clerk-localized-provider.tsx`, todos anteriores a este módulo).
- Hallazgo: los tipos de `socket.io-client` están rotos en este proyecto (`Socket.on/off` no resuelven;
  runtime funciona bien). `useMessagingSocket` usa una interfaz mínima `EmitterLike` para no propagar
  el problema; no se tocaron dependencias (regla del proyecto).
- Qué sigue: Fase 3 (conversación: burbujas, scroll, estados, ubicación Leaflet, reacciones, aviso bloqueo).

### Fase 3 — terminada (2026-10-30)

- Qué se hizo:
  - `conversation.tsx`: cabecera (avatar/nombre/producto, atrás en móvil), lista con scroll inteligente
    (al fondo al abrir, auto-scroll solo si estabas abajo, botón "Nuevos mensajes (N)" si estabas arriba),
    "Cargar anteriores" con paginación `before` + dedupe y posición conservada, skeleton/error/vacío,
    marcado de leídos automático (al abrir y al llegar nuevos).
  - `message-bubble.tsx`: burbujas diferenciadas (propias vs. ajenas), hora relativa, estado
    enviado ✓ / entregado ✓✓ / leído ✓✓ azul (solo propias, con etiqueta accesible).
  - `message-reactions.tsx`: picker de 6 emojis (popover) + chips agregados (click alterna; resaltado propio).
  - `message-composer.tsx`: input multilínea (Enter envía), botón ubicación, aviso inline ámbar con el
    mensaje del backend cuando se bloquea (422) sin enviar; otros errores van a toast.
  - `location-map.tsx` (client-only, `dynamic ssr:false`): `LocationPreview` (mini-mapa Leaflet de lectura
    + link a Google Maps) y `LocationPickerDialog` (pin centrado, "Mi ubicación", etiqueta opcional).
    Se reutilizan tiles CARTO + centro ES; no se reutilizó `LeafletMapComponent` (instancia única con id
    fijo y pesado para un diálogo; el picker del chat es un caso distinto y compacto).
  - `useRelativeTime` optimizado con ticker compartido (un intervalo global en vez de uno por burbuja).
  - Slice: `getMessages` acepta `limit`. Traducciones ES/EN ampliadas.
  - `messaging-view.tsx`: integra `<Conversation>` con alturas fijas para scroll interno (móvil y desktop).
- Archivos tocados (frontend `dubuu/`): nuevos `src/components/messaging/{conversation,message-bubble,
  message-reactions,message-composer,location-map}.tsx`; editados `src/components/messaging/messaging-view.tsx`,
  `src/hooks/use-relative-time.ts`, `src/redux/slices/messaging/messaging-slice.ts`,
  `public/locales/{es,en}/messaging.json`.
- Verificación: `tsc --noEmit` sin errores nuevos (solo los 13 preexistentes); JSONs validados;
  exports de react-leaflet v5 (`MapContainer`, `TileLayer`, `CircleMarker`, `useMap`, `useMapEvents`) confirmados.
- Qué sigue: Fase 4 (opción "Mensajes" con badge en dropdown + sidebars host/user, toast al recibir mensaje).

### Fase 4 — terminada (2026-10-30)

- Qué se hizo:
  - "Mensajes" en dropdown del header (usuario → `/account/messages`, host/admin → `/dashboard/messages`) y en
    sidebars (`accountNavItems` y `hostDashboardItems`, clave traducida `messaging.title`), con badge de no
    leídos (99+) en header (ambas variantes), `SideNav` (desktop) y `MenuProfileSheet` (móvil).
  - `messaging-notifications.tsx` montado en providers globales: mantiene chats/badge actualizados en toda la
    app y muestra toast al recibir mensajes ajenos (nombre + vista previa, botón Ver → chat según rol,
    vibración sutil). Sin toast si ya estás en Mensajes (la vista se actualiza sola).
  - Se quitó la suscripción socket local de `messaging-view` (redundante con la global).
- Archivos tocados (frontend `dubuu/`): nuevo `src/components/messaging/messaging-notifications.tsx`;
  editados `src/utils/menu-options.tsx`, `src/layouts/{header,side-nav,sidebar}.tsx`,
  `src/components/providers/global-providers.tsx`, `src/components/messaging/messaging-view.tsx`,
  `src/hooks/use-messaging-socket.ts` (exporta `SocketEmitterLike`).
- Verificación: `tsc --noEmit` sin errores nuevos (solo los 13 preexistentes).
- Qué sigue: Fase 5 (verificación E2E manual con ambos roles + pulido + HANDOFF.md).

### Fase 5 — terminada (2026-10-30)

- Revisión cruzada del contrato (todo ✓): endpoints backend ↔ slice RTK (rutas, bodies, `?before&limit`),
  error 422 `{message, code, reason}` ↔ `MessageBlockedError`, eventos socket ↔ payloads TS, links push
  ↔ `?booking=<id>` de las páginas, rewrite `/backend` en `next.config.mjs`, `<Toaster>` montado en layout,
  claves `messaging.*` usadas existen en ES/EN.
- Limpieza: claves i18n sin usar eliminadas (`conversation.sending`, `toast.newMessageTitle`);
  `mapsLink` pasó a función local; set `AMBIGUOUS_SOCIAL_WORDS` sin entradas inertes (`wa`, `x`);
  `conversation.loading` ahora se usa (aria-label del skeleton); sin imports ni exports muertos en el módulo.
- Pulido minimalista: botón de reacción oculto en desktop hasta hover/focus (siempre visible en móvil);
  fallback de nombre traducido (`messaging.unknownUser`); preview de ubicación sin `<a>` anidada
  (HTML válido, atribución del mapa clicable, teclado soportado).
- Verificación: `tsc` backend limpio; `tsc` frontend sin errores nuevos (13 preexistentes intactos);
  jest anti-evasión 32/32; JSONs validados. `HANDOFF.md` actualizado en ambos repos.
- Qué sigue: E2E manual del usuario (guía abajo), aplicar migración `0030` en dev/prod, futura IA
  (paso `ai-moderation` en `lib/moderation/pipeline.ts`).

## Voz a texto (2026-10-30)

Dictar por micrófono y que aparezca como texto en el input (el audio NO se guarda ni se envía).

- **Backend**: `POST /api/v1/messages/bookings/:bookingId/transcribe` (auth + solo participantes).
  Servicio `ai-transcribe-service.ts` → Meta Model API `POST /v1/asr/transcribe` (parte JSON `request`
  con modelo/encoding/idioma + parte `audio`) con modelo serie Muse Spark (`AI_TRANSCRIBE_MODEL`,
  default = `AI_MODEL` = `muse-spark-1.3`), idioma es/en según locale. Respuesta tolerante
  (`text`/`transcript`/`turns`). El transcript pasa por el anti-evasión: si bloquea, 422 con el mismo
  aviso (no se inserta nada). Upload `audioUpload` (multer memoria, 10 MB, audio/* + mp4/webm).
- **Frontend**: botón mic en el composer → grabación (MediaRecorder nativo, punto rojo + timer, máx. 2 min
  con corte automático) → ✓ convierte a WAV PCM16 mono 16 kHz (`audio-to-wav.ts`, Web Audio API, único
  formato del proveedor), transcribe e inserta el texto al input (revisable antes de enviar), X descarta.
  Errores: permiso denegado / navegador sin soporte / fallo de transcripción (toast), bloqueo
  anti-evasión (aviso ámbar). Claves `messaging.voice.*` ES/EN.
- Archivos: backend `src/services/ai-transcribe-service.ts`, `tests/message-transcribe.test.ts`;
  editados `src/constants/ai-products.ts`, `src/middlewares/multer.ts`, `src/services/message-service.ts`,
  `src/controllers/message-controller.ts`, `src/routes/v1/message-routes.ts`, `.env.example`.
  Frontend `src/hooks/use-voice-recorder.ts`, `src/components/messaging/audio-to-wav.ts`;
  editados `message-composer.tsx`, `messaging-slice.ts`, `public/locales/{es,en}/messaging.json`,
  `next.config.mjs` (`microphone=(self)` en Permissions-Policy).
- Verificación: `tsc` backend limpio; `tsc` frontend sin errores nuevos; jest 52/52 (32 anti-evasión +
  20 transcribe: validación + servicio con proveedor mockeado); JSONs validados. `AI_API_KEY` presente en
  backend `.env`. E2E con audio real pendiente del usuario (requiere micrófono + sesión):
  dictar texto normal, dictar un teléfono (debe avisar y no insertar), denegar permiso, probar en móvil.

## Verificación manual E2E (guía para el usuario)

Pre-requisitos: migración `0030` aplicada en dev (backend `npm run dz:push` — SOLO dev),
backend `npm run dev`, frontend `pnpm dev`, dos cuentas (viajero + host) con una reserva entre ambos.

1. **Lista vacía**: cuenta sin reservas → "Sin conversaciones" + botón a reservas.
2. **Lista con chats**: nombre/avatar contraparte, producto, último mensaje ("Tú:" si propio),
   hora relativa, badge de no leídos; skeleton al cargar.
3. **Texto ambos lados**: enviar como viajero y como host; el otro lo recibe al instante (socket).
4. **Toast**: con otra pantalla abierta, al recibir mensaje → toast con nombre + vista previa + "Ver".
5. **Badge**: header/dropdown/sidebars (desktop y móvil) muestran el conteo; al leer baja a 0.
6. **Estados**: ✓ enviado → ✓✓ entregado (al abrir el otro) → ✓✓ azul (leído).
7. **Ubicación**: enviar con pin + etiqueta; mini-mapa visible + "Abrir en Google Maps".
8. **Reacciones**: poner/cambiar/quitar; se reflejan en ambos lados al instante.
9. **Bloqueos** (aviso ámbar, no se envía): `7777-8888`, `77 88 99 00`, `siete siete ocho ocho...`,
   `https://...`, `misitio.com`, `juan@gmail.com`, `escríbeme a WhatsApp`, `@usuario`.
   **Permitidos**: `Somos 4 personas`, `cuesta 25.00`, `Llegamos el 27 a las 10:00`.
10. **Responsive**: móvil lista ↔ chat con atrás; desktop dos columnas.
11. **Hora relativa**: "ahora mismo" → "hace 1 minuto" sin recargar.
12. **Seguridad**: un tercer usuario no abre el chat (403) ni por URL directa.
