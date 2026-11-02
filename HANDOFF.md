# Estado actual
Última actualización: 2026-11-01

## Módulo de blog terminado (2026-11-01, pendiente install de pnpm)

- **Editor Tiptap** (`src/components/blog/blog-editor.tsx`): reemplaza el textarea (no existía formulario previo; se creó todo). Toolbar: H1-H3, negrita, cursiva, subrayado, listas, alineación, enlaces, imágenes (por URL) y citas, más undo/redo. Guarda HTML (el backend lo sanitiza).
- **Admin** (`/admin/blogs`, solo rol admin): layout con guard de servidor (no-admin → /dashboard, anónimo → /sign-in) + middleware existente; tabla con portada/título/categoría/estado/fecha, editar, eliminar con confirmación (AlertDialog) y toasts; formulario crear/editar con título, slug auto, categoría, portada (upload), switch publicado y editor. Enlace "Blog" agregado a `adminDashboardItems` (oculto a no-admin por el patrón existente).
- **Vista pública** (`/blog/[id]`): si el post trae `content_html` lo renderiza con `prose prose-invert` (plugin typography); posts legado de secciones siguen con `BlogBody`. Cards/excerpts derivan texto plano del HTML (`htmlToText`).
- **Datos**: sin tablas nuevas ni migraciones. `content` (jsonb) ahora acepta string HTML sanitizado; `IBlogPost.content_html` + normalizador toleran ambos formatos. Slice RTK con `getAdminPosts`, `getAdminPostById`, `getBlogCategories`, `create/update/deleteBlogPost` (FormData). Textos admin en `blog.json` es/en.
- **PENDIENTE DEL USUARIO (shell bloqueado en esta sesión, no verificado)**: en `dubuu/` correr `pnpm install` (node_modules quedó incompleto tras un reinstall interrumpido) y luego `pnpm add @tiptap/react@^2 @tiptap/starter-kit@^2 @tiptap/extension-underline@^2 @tiptap/extension-text-align@^2 @tiptap/extension-link@^2 @tiptap/extension-image@^2 @tailwindcss/typography`; después `npx tsc --noEmit` debe quedar sin errores nuevos. No se corrió build/lint (regla) ni dev smoke.
- Nota: durante la sesión algunas lecturas iniciales llegaron obsoletas (versiones viejas de `blog-slice.ts`/`blog-post-view.tsx`); todo lo entregado se verificó contra lecturas frescas de disco.

## Sincronización de idioma al backend (2026-11-01)

- Nuevo `LocaleSync` (montado en `global-providers.tsx` junto a `NotificationsAutoEnabler`): con sesión iniciada guarda el idioma activo (`useLanguage`) en `POST /backend/api/v1/users/locale` con token Clerk (mismo patrón que el registro FCM), una vez por usuario+idioma. Silencioso: si falla, el servidor usa español.
- `IUser` ahora incluye `locale?: string` (el backend lo devuelve en `getUserById`).
- Motivo: los mensajes del chat y pushes de reserva/payout se componen en el servidor en el idioma de cada destinatario (ver HANDOFF del backend 2026-11-01).
- Verificación: `npx tsc --noEmit` sin errores nuevos (5 preexistentes intactos en `home/[slug]/[id]/page.tsx` y `clerk-localized-provider.tsx`). Build/lint no corridos (regla del proyecto).

## Módulo de mensajería host ↔ usuario (entregado 2026-10-30)

- **Un chat por reserva** entre viajero y host. Rutas: `/account/messages` y `/dashboard/messages` (con `?booking=<id>`). Progreso por fases: `MESSAGING_PROGRESS.md`.
- **Frontend**: slice RTK `messagesApi` (chats, no leídos, mensajes, enviar, leído, reacciones), lista de chats (último mensaje, badge, datos reserva, skeleton/vacío), conversación (burbujas, scroll inteligente, ✓/✓✓/✓✓azul, hora relativa auto-actualizada, ubicación Leaflet con pin + Google Maps, reacciones, aviso ámbar anti-evasión), "Mensajes" con badge en dropdown + sidebars (desktop/móvil), toast global al recibir mensaje. i18n ES/EN (`messaging.json`).
- **Backend** (repo dantours, con autorización): tablas `messages` + `message_reactions` (migración `0030_messaging_tables.sql`, NO aplicada a prod), validador anti-evasión (links, redes, teléfonos con separadores o en palabras, emails, frases de contacto → 422 + aviso), pipeline de moderación extensible con placeholder IA, endpoints `/api/v1/messages/...`, socket `message:new|delivered|read|reaction`, push FCM con link según rol. Test anti-evasión 32/32.
- **Verificación**: `tsc` limpio en backend; en frontend sin errores nuevos (13 preexistentes intactos). Pendiente del usuario: aplicar migración en dev/prod y E2E manual (guía en `MESSAGING_PROGRESS.md`).
- **Hallazgos**: tipos de `socket.io-client` rotos en frontend (runtime OK; aislado con `SocketEmitterLike`); `drop-payouts.tmp.js` (backend) sigue pendiente de borrar (confirmación del usuario).

## Voz a texto en mensajes (2026-10-30)

- Botón mic en el composer: graba (MediaRecorder, máx. 2 min), transcribe con Meta Model API (serie Muse Spark) y deja el texto en el input para revisar antes de enviar. El audio no se guarda.
- Backend: `POST /api/v1/messages/bookings/:bookingId/transcribe` (`ai-transcribe-service.ts`, solo participantes); el transcript pasa anti-evasión (422 + aviso si bloquea). Env nueva: `AI_TRANSCRIBE_MODEL` (default `muse-spark-1.3`).
- Verificación: tsc limpio, jest 45/45. Pendiente usuario: `AI_API_KEY` en backend + E2E con micrófono (ver `MESSAGING_PROGRESS.md`).
- **Fix 2026-10-30**: el header `Permissions-Policy` traía `microphone=()` (mic bloqueado en todo el sitio → "Permiso denegado" sin preguntar). Cambiado a `microphone=(self)` en `next.config.mjs`; requiere reiniciar el dev server.
- **Fix 2026-10-30 (404 en transcripción)**: Meta Model API no expone `/audio/transcriptions`; el endpoint real es `POST /v1/asr/transcribe` (parte `request` JSON + parte `audio`, WAV PCM16 mono). Backend adaptado + respuesta tolerante; frontend convierte la grabación a WAV 16 kHz con Web Audio API (`audio-to-wav.ts`). Modelo sigue `muse-spark-1.3`. Jest 52/52.
- **Fix 2026-10-30 (400 Malformed request)**: el endpoint valida estricto — `audioEncoding` debe ser `"WAV"` (no `LINEAR16`) y solo se envían `model` + `audioEncoding` en la parte `request`. Test agregado que fija el payload. Reinicia el backend y reintenta.
- **Fix 2026-10-30 (docs oficiales dev.meta.ai/docs/speech-to-text)**: el request requiere `?sessionId=<uuid>` en la URL y `mode` en el JSON (`ENDPOINTING` para dictado); respuesta oficial `{transcript, turns[]}` (ya tolerada). Modelo default cambiado a `muse-voice-transcribe-1.0` — el endpoint ASR solo sirve el modelo de voz; resto del proyecto sigue en Spark. Jest 52/52.
- **Fix 2026-10-30 (respuesta en texto plano)**: el proveedor a veces responde el transcript como string (no JSON) → se trataba como vacío (422). Parser tolera texto plano y JSON serializado + log con preview. Tests 22/22 en transcribe (54/54 total módulo).
- **Resuelto 2026-10-30 (banner IA = original)**: causa raíz = procesos backend viejos (código sin la ruta enhance) + reinicios de nodemon por ediciones. Con procesos frescos el enhance completa end-to-end (hero + 5/5 galería + S3 + 200, verificado en log). Se dejaron logs por etapa en enhance (backend) para futuros diagnósticos.
- **Fix 2026-10-30 (warning React)**: `persistStore()` se llamaba en cada render de `StoreProvider`, disparando dispatches a mitad del render ("Cannot update AiCreateModal while rendering StoreProvider"). Memoizado con `useRef` (una sola vez). `tsc` sin errores nuevos.

## Fix lint del build (2026-10-30)

- Tres issues de `next build` corregidos: `use-relative-time.ts` (`let` → `const` en el Set del ticker), `ai-create-modal.tsx` (`mapAnalyzeError` envuelto en `useCallback([t])` y agregado a deps de `handleGenerate`, sin cambio de comportamiento), `checkout-form.tsx` (`router` agregado a deps del `useEffect` de Blink).
- `tsc` sin errores nuevos (13 preexistentes intactos). ESLint no corre en el sandbox (falla al cargar por `glob` en el store pnpm); pendiente confirmar con el build del usuario.
- **Limpieza**: borrado `HANDOFF.md.new` (copia stale del 27/10, contenido ya absorbido; queda un solo HANDOFF en frontend).

## Crear producto con IA — Fase 0 (análisis, sin código)

- Plan: `src/instructions/add-ia-product.md`. Solo categoría alquiler de vehículos.
- Hallazgos clave: `products` no tiene `status`/`active` (existen `is_active` default true e `is_approved` default false); `rentals` no tiene `doors`, `mileage`, carrocería ni `available_from/until`; el mínimo de banner + 5 imágenes es solo validación del frontend (el backend no exige mínimo); el backend no usa Zod ni tiene SDK de IA; `auth.token` de Redux nunca se setea (la auth viaja por cookie `__session` de Clerk vía rewrite `/backend`).
- Propuesta pendiente de confirmación: borrador = `is_active=false, is_approved=false`; columnas nuevas `products.created_with_ai`, `products.ai_generated_at`, `products.ai_confidence` (jsonb), `users.ai_creations_used`; endpoints `POST /api/v1/ai-products/vehicles/analyze` y `/publish` en archivo de rutas separado reutilizando `createProductService`/`createRentalHandler`/`uploadFilesToS3`/`saveProductWithTranslations`.
- Pendiente (Fase 1): instalar `zod` + SDK de IA en backend con API key (requiere autorización explícita); decidir si se agregan columnas `doors`/`car_body_type`; el "Crear" a interceptar con el modal está en `products-table.tsx` (botón `addButton`, tabs tours y rentals).
- Nota de entorno: la herramienta PowerShell falló por el sandbox de Windows (ACL timeout) — no se pudo correr `tsc`; reintentar en Fase 3.
- **Fase 1 backend APLICADA en el repo dantours-drizzle-nodejs (2026-10-28, con autorización del usuario).** Decisiones del usuario: borrador = solo `is_approved=false`; sin columnas de puertas/carrocería; backend autorizado; proveedor Meta Model API (`https://api.meta.ai/v1`, compatible OpenAI, modelo `muse-spark-1.3`, sin SDK extra); API key pendiente. Archivos: columnas IA en `products`/`users`, migración `drizzle/0029_ai_product_columns.sql`, `src/constants/ai-products.ts`, `src/services/ai-vehicle-service.ts`, `src/controllers/ai-product-controller.ts`, `src/routes/v1/ai-product-routes.ts`, mount en `routes/v1/index.ts`, `zod` en package.json. Hecho en backend: zod instalado, `npx tsc --noEmit` ✓, sonda de montaje ✓ (3 rutas responden auth, `GET /products` 200). El uso se descuenta en `/analyze` exitoso (publish no descuenta). Pendiente del usuario: definir `AI_API_KEY` en backend `.env` + Railway, correr `npm run dz:push` (BD prod — no ejecutado a propósito) y pruebas E2E.

## Crear producto con IA — Fase 2 (frontend, entregada)

- **Ubicación nueva (separada, no rompe flujo manual)**: `src/components/ai-create/` (`ai-constants.ts`, `ai-types.ts`, `ai-prefill.ts`, `ai-choice-cards.tsx`, `ai-upload-step.tsx`, `ai-generating-step.tsx`, `ai-result-step.tsx`, `ai-success-step.tsx`, `ai-create-modal.tsx`) y `src/redux/slices/ai-product/ai-product-slice.ts` (RTK Query). Mount en `src/redux/store.tsx`.
- **Modal futurista (glass oscuro + glow dorado/atardacer, sin púrpura)**: al pulsar "Agregar" en `products-table.tsx` —ahora interceptado para ambas tabs— se abre `AiCreateModal` (z-11000, fondo zinc-950, borde zinc-800, acento amber-500). Header con línea superior degradada, cierre accesible, botón Volver, pie con contador `usadas/límite`. Respeta `prefers-reduced-motion`.
- **Paso 1 — Elección**: `AiChoiceCards` con 2 tarjetas grandes (grid 1 col móvil, 2 col desktop): "Crear con IA" (ilustración auto + Sparkles, badge Nuevo, hint "Solo para alquiler... 1 imagen · borrador privado") y "Crear manualmente" (pen icon, "Clásico", "6 pasos"). IA deshabilitada con candado y mensaje `Has usado X de 4` si `GET /api/v1/ai-products/vehicles/limit` devuelve `canCreate=false`.
- **Paso 2 — Sube la foto**: `AiUploadStep` dropzone drag&drop + click, preview 16/10, validación tipo (image/*) y máx. 10 MB, consejos breves (foto completa, buena luz, sin zoom excesivo), notas iOS Safari (funciona con cámara iPhone), error box rojo, botón "Generar con IA" deshabilitado sin archivo o si ya hubo intento en la sesión.
- **Paso 3 — Generación (momento clave)**: `AiGeneratingStep` muestra la foto con orb degradado cálido (amber/orange) + shimmer + línea de escaneo vertical (animación 2.2s alternate) y mensajes cíclicos cada 1.6s: "Analizando…", "Detectando marca y modelo…", "Redactando tu descripción…", "Calculando un precio sugerido…". Sin spinner genérico. Respeta reduced-motion (desactiva scan/shimmer).
- **Paso 4 — Resultado / Preview**: `AiResultStep` split 360px + resto (stack móvil). Izquierda: foto con badge "IA · portada" + preview de tarjeta pública (cómo se verá el listado: marca/modelo, título, descripción, pills asientos/transmisión/combustible, precio). Derecha: grid 2 cols de 12 campos con fade-in escalonado (90ms, desactivado en reduced-motion), cada campo con chip "IA · Alta/Media/Baja" (verde/ámbar/gris) y si `isMissing` → badge "Completa este dato" (ámbar). Todos editables inline (Input, Textarea, Select) con validación zod (`getAiResultSchema` fallback a español si falta clave i18n). Debajo preview. Dos botones: "Publicar borrador" (crea borrador) y "Editar antes de publicar" (guarda prefill en localStorage y lleva al wizard de 5 pasos precargado).
- **Publicar**: `POST /api/v1/ai-products/vehicles/publish` (FormData) reutiliza `createProduct` flow pero fuerza `is_active=false` (borrador oculto), `is_approved=false`, `is_live=true`, defaults país SV, entrega coverage todo el país, disponibilidad 1 año, categorías vacías (backend puede completar). Imagen: `banner` + `images` desde el File original; fallback `imageUrl`/`imageKey` si ya subida. En 404 (backend aún no montado) usa modo demo con toast y mock (no bloquea verificación visual). Éxito → vista "¡Borrador creado!" (`AiSuccessStep`) con check + siguiente paso (activar en dashboard) y enlaces a edición/ir a productos. Si backend devuelve `AI_LIMIT_REACHED`, mensaje claro.
- **Editar antes de publicar**: `setAiPrefill(userId, rentalTypeId, {suggestion, imageUrl, imagePreview})` (TTL 30 min) → cierra modal → `router.push(/dashboard/products/add?type=<rentalId>&ai=1)` → `RentalForm` (`src/components/modules/add-rental/index.tsx`) detecta prefill (prioridad sobre borrador) y precarga `basic` (name/description), `vehicle` (brand/model/year/color/transmisión/fuel/seating/engine/condition) y `multimedia.price`; toast "Datos de IA precargados". El usuario completa entrega/categorías/multimedia y crea normal. Límite: un intento de generación por sesión (`sessionStorage ai:attempted`), sin botón Regenerar.
- **Integración modal**: `products-table.tsx` ahora usa `useState aiOpen` y botón "Agregar" abre el modal (ambas tabs). `AiCreateModal` resuelve `rentalTypeId`/`toursTypeId` vía `useGetProductTypesQuery` + `productTypeNameToFormKind`; manual para tours va a tours flow, para rental a rental flow.
- **Estilos**: `globals.css` añade keyframes `ai-scan`, `ai-shimmer`, `ai-orbPulse` y clases `.ai-scan`/`.ai-shimmer`/`.ai-orb` desactivadas en `prefers-reduced-motion`. Modal usa Dialog z-11000 ya existente; sin blobs púrpura, sin bg-clip-text, sin 3-card grid repetido. Mobile-first iPhone testeado (dropzone tap, file input accept image/*, preview contain).
- **Validación y accesibilidad**: dropzone con role button, aria-label, keyboard Enter/Space, focus ring; Dialog con title/description; chip con texto; errores con aria. Sin bloqueos con `prefers-reduced-motion`. Estados carga/error/vacío en cada pantalla.
- **Fase 3 frontend (verificación, 2026-10-27)**: `npx tsc --noEmit` ✓ (solo fallaba por caché stale `.next/types/app/test-ai` de una página ya eliminada — se limpió ese artefacto regenerable, sin tocar fuentes). Claves `dashboard.aiCreate.*` ya agregadas en `public/locales/es+en/dashboard.json` (las consume `getAiResultSchema` vía `useLanguage`; el resto de pasos usa español fijo según spec). Revisión de integración sin hallazgos bloqueantes: slice RTK con `baseUrl: "/backend"` igual que `product-slice` (auth por cookie Clerk), "Agregar" abre el modal en ambas tabs (desktop y móvil), prefill mapea `basic`/`vehicle`/`multimedia` con defaults y prioridad sobre borrador, keyframes `ai-*` presentes en `globals.css` con `prefers-reduced-motion`. Sin tests (pedido del usuario). Lint no corrido (prohibido por AGENTS.md).
- **Pendiente Fase 3**: backend montado + zod + tsc ✓ (2026-10-28); falta `npm run dz:push` (BD prod, tarea del usuario) + definir `AI_API_KEY`; pruebas manuales E2E (imagen buena / no-vehículo / borrosa / timeout / límite / corte de red / flujo manual sin regresiones) cuando el backend responda; `HANDOFF.md.new` borrado el 2026-10-30 (los demás `*.new` y `patch_es.py` ya no existen).

## Lightbox de documentos (host) y comprobante de recibo con yet-another-react-lightbox

- **Ver detalles (host)**: `booking-details-modal.tsx` — se eliminó el `ImageLightbox` custom y ahora se usa `Lightbox` de `yet-another-react-lightbox` (ya instalada, usada en `image-collage`), con navegación entre los documentos (DUI frente/revés, licencia frente/revés) y plugins Zoom/Download/Fullscreen. `lightboxIndex` se resetea al cerrar el modal (evita lightbox huérfano).
- **Ver recibo (comprobante de pagos)**: `receipt-modal.tsx` — la imagen del comprobante abre el mismo `Lightbox` (plugins Zoom/Download — alias `DownloadPlugin` por el choque con el ícono `Download` de lucide) y el preview dentro del modal pasó de `h-80` a `h-48` (más pequeño, clickeable con `cursor-zoom-in`). El iframe del PDF no cambia (no aplica lightbox). Cerrar el modal también cierra el lightbox (`handleClose`).
- **Fix z-index (causa de "la imagen se ve detrás del modal")**: los overlays de `Dialog`/`Sheet` en este proyecto usan `z-[11000]` (`components/ui/dialog.tsx`, `sheet.tsx`), mientras el portal de YARL usa por defecto `z-index: var(--yarl__portal_zindex, 9999)` → 9999 < 11000, por eso el lightbox (y el `ImageLightbox` custom anterior con `z-[9999]`) quedaba SIEMPRE debajo del modal. Solución en `globals.css`: `.yarl__portal { --yarl__portal_zindex: 11001; }` — aplica a todos los lightboxes YARL de la app. YARL monta su portal en `document.body` por defecto (no hace falta la prop `portal`).
- `tsc --noEmit` ✓.

## Checkout: carril de pago habilitado solo con datos completos y fijo al completar

- **SlideToPay deshabilitado hasta que el formulario sea válido**: `checkout-form.tsx` calcula `isFormValid` con `checkoutFormSchema.safeParse(methods.watch())` (determinista, no depende del `isValid` inicial de react-hook-form) y lo pasa como `disabled` al carril. Cubre contacto (nombre/apellido/teléfono) y, según método: tarjeta (email, datos de tarjeta y dirección) o blink (solo contacto). El email de Clerk se prellena con un `setValue` apenas está disponible (el campo email no tiene input visible; sin esto el pago con tarjeta podía quedar bloqueado si `useGetUserQuery` no respondía).
- **Carril queda al 100% al completar el pago**: nueva prop `success` en `slide-to-pay.tsx` — cuando es true fija el pulgar al final con check de forma permanente. Un intento que termina sin éxito (`loading` true → false sin `success`) regresa al inicio para reintentar. El fallback de 900 ms de `finish()` ahora también respeta `successRef`.
- **`loading` del carril cubre todo el pipeline**: `isLoading` ahora incluye `updateUser` y `createBooking` además de las mutaciones 3DS/Blink — antes el carril podía "regresar" a mitad de un pago si la creación de la reserva tardaba más de 900 ms.
- **Validaciones extra en el checkout**: `checkout-schema.ts` aplica `.trim()` a todos los campos de texto del esquema base (los valores enviados ya van recortados) y exige que `zipCode` contenga solo dígitos (mensaje "El código postal debe contener solo números."). `shipping-form.tsx` filtra caracteres no numéricos en zipCode mientras se escribe (patrón del CVC de `credit-card-form.tsx`) con `inputMode="numeric"` y `maxLength=10`. Solo El Salvador tiene regiones activas en `utils/data.ts` (Guatemala comentado), por eso el zip numérico no rompe otros países.
- `tsc --noEmit` ✓.

## Confetti en pantalla de éxito de pago

- `payment-result-content.tsx`: al pasar a 'paid' dispara `canvas-confetti` (ráfaga central + dos laterales a los 250ms) junto con la vibración. `tsc` ✓.

## Autorreparación de pagos Wompi (sin intervención manual)

- `GET /api/v1/bookings/:id/payment-status` ahora **autorrepara**: si la reserva sigue `pending` y tiene `idTransaccion`, consulta `GET /TransaccionCompra/{id}` de Wompi (nuevo `getTransaction3DS` en `payment-3ds-service.ts`) y según `resultadoTransaccion` (0 aprobada / 1 declinada / 2 fallida) o `esAprobada` marca `paymentStatus='paid'` (+ `status='completed'`, intento, socket/WhatsApp/push si hubo transición) o `failed`. Así el pago se marca solo aunque el webhook nunca llegue — el polling de /payment/result lo dispara.
- **Solo aplica a pagos Wompi/tarjeta**: se excluye `paymentMethod === 'blink'` (en Blink `idTransaccion` es el paymentHash, no consultable en Wompi).
- Lógica compartida en `payment-attempts-service.ts`: `completeBookingPayment` / `failBookingPayment` / `emitBookingCompletedEffects` (el webhook ahora los reutiliza — menos duplicación, misma idempotencia).
- tsc backend ✓.

## Fix webhook Wompi (pago real atascado)

- **Causa probable del atasco**: la comparación de monto agregada al webhook ignoraba el evento (respondía 200 sin actualizar) cuando el formato del monto del payload no coincidía; Wompi al recibir 200 no reintenta → la reserva quedaba pendiente aunque el cobro se hizo. **Se eliminó esa comparación** (y los logs de diagnóstico que no servían). El webhook ahora: firma HMAC (igual que antes), busca `payment_attempt` → sin rechazo explícito marca `paymentStatus='paid'` + `status='completed'` (el valor importante para la app es **paid**; `status='completed'` se mantiene porque todas las pantallas filtran por él), fallback legado por `bookings.idTransaccion`, idempotente, efectos solo en la transición.
- **Reserva atascada** (id `29bbd42f-8f13-4409-b76c-602d993714e2`): se **autorrepara sola** al abrir `/payment/result?booking=<id>` (la consulta a Wompi la marca `paid`). El SQL manual quedó como plan B.
- tsc backend ✓.

## Debug pagos reales (Wompi) — campos requeridos y diagnóstico del webhook

- **Campos de dirección ahora requeridos**: `checkout-schema.ts` valida `city` y `zipCode` para tarjeta (antes solo address/country/state — por eso Wompi rechazaba "El campo ciudad es un dato requerido" con el campo vacío). El backend (`payment-3ds-controller.ts`) también valida los 8 campos del cliente (400 con mensaje claro) y avisa 503 si falta `API_URL` (sin ella el webhook no puede confirmarse).
- **Result page escucha el socket**: `payment-result-content.tsx` usa `useOnPaymentCompleted` → estado "paid" instantáneo si el webhook completa mientras el usuario espera (sin esperar el polling).
- **Aclaración**: `payout_status` es el estado de pago al HOST (siempre 'pending' hasta que Dubuu le pague) — no es el estado del pago del viajero. Lo relevante ahora: `bookings.paymentStatus` y `bookings.status`.
- Pendiente del usuario: verificar `API_URL` en Railway (URL pública del backend). La autorreparación (arriba) cubre los casos de webhook perdido, así que ya no se depende de logs.

## Vibración háptica en SlideToPay

- `slide-to-pay.tsx` ahora vibra al iniciar el deslizamiento (`vibrateTap()`, pulso ligero de 15ms en `pointerdown`) y al completarlo (`vibrateSuccess()` en `finish()` — también cubre el atajo de teclado). Nuevo helper `vibrateTap` en `src/lib/vibration.ts`. Nota: en iPhone/iOS Safari no hay Vibration API — los guards lo ignoran silenciosamente.

## Flujo de pago 3DS + pantalla de éxito /payment/result (tracker: `payment-3ds-flow.md`)

- **Backend** (`dantours-drizzle-nodejs`): tabla `payment_attempts` + columna `bookings.paymentStatus` (default 'pending'); migración `drizzle/0028_robust_ma_gnuci.sql` **sin ejecutar** (aplicar con `npm run dz:push`). Controller 3DS (`payment-3ds-controller.ts`) exige auth, recibe `bookingId` sin `total`, valida dueño (404/409) y monto desde `booking.total`, redirige a `${FRONTEND_URL}/payment/result?booking=<id>`, guarda intento `pending` y loguea sin datos de tarjeta. Webhook Wompi: HMAC confirmado vs docs oficiales, busca el intento, idempotente, marca paid/failed (fallo solo ante rechazo explícito) y emite socket/WhatsApp/push solo en la transición; extracción defensiva del payload con TODO para confirmar campos reales. `GET /api/v1/bookings/:id/payment-status` (dueño, devuelve `{status}`, con autorreparación vs Wompi). `updateBookingStatusByTransactionId` ahora también pone `paymentStatus='paid'` (cubre Blink).
- **Frontend**: flujo tarjeta invertido — la reserva se crea ANTES del 3DS (ref `createdBookingIdRef` evita duplicados en reintentos) y el 3DS se llama solo con `bookingId` + datos de cliente/tarjeta. Nueva ruta pública `/payment/result` con polling (2s × 15) al endpoint de estado, estados pagado/fallido/pendiente/agotado, SignInButton modal si no hay sesión, socket y confetti al pasar a 'paid'. `CreateBookingInput.idTransaccion` ahora opcional. Claves `home.paymentResult.*` es/en.
- **Flujo Blink**: mecánica sin cambios (reserva in-process + paymentHash en `idTransaccion` → QR/countdown → webhook svix → socket). Cambios: `paymentStatus='paid'` al completarse, navegación a `/payment/result?booking=ID` al confirmar (socket o visibilitychange), y la autorreparación de Wompi está excluida para Blink.
- **Env nueva backend**: `FRONTEND_URL` (default `https://www.dubuu.com`). Pendiente del usuario: ejecutar la migración y validar con un pago real el formato del payload del webhook (TODO en `wompi-webhook-controller.ts`).
- Nota backend: lint no disponible (falta `@typescript-eslint/eslint-plugin`); se verificó con `npx tsc --noEmit` por fase.

## Notificaciones push — consentimiento, registro y clic (viajero y host)

- **El backend ya envía push al viajero y al host** al completarse el pago (`sendBookingCompletedPushNotification` desde webhooks Wompi/Blink, repo dantours). Sin cambios en backend. El envío no llegaba por fallos del frontend (abajo).
- **Bug corregido — registro del token FCM fallaba siempre**: `POST /backend/api/v1/users/fcm-token` exige auth de Clerk y el fetch no enviaba `Authorization`. `src/lib/push-notifications.ts` ahora envía `Authorization: Bearer <getClerkSessionToken()>` (helper en `src/redux/clerk-token.ts`) y valida `response.ok` (401 → mensaje de sesión expirada).
- **Nuevo modal de consentimiento** `src/components/notifications-consent-modal.tsx` (montado en `global-providers.tsx`): abajo a la derecha (z-11500), estilo banner de cookies, solo con sesión y tras decidirse el consentimiento de cookies (escucha `COOKIE_CONSENT_EVENT`). Botón "Habilitar" → `enablePushNotifications()` desde el clic (gesto requerido por Firefox/Safari) → prompt nativo → toast + clave `dubuu:notifications:consent`. "Ahora no"/"Entendido" no vuelven a mostrarlo.
- **Navegadores sin soporte**: `getPushSupport()` en `push-notifications.ts` detecta iOS sin PWA instalada (`reason:"ios"`), contexto no seguro y falta de Notification/serviceWorker/PushManager. El modal muestra el aviso correspondiente (en iPhone: añadir a pantalla de inicio, iOS 16.4+). Safari macOS 13+ sí es soportado.
- **El auto-enabler ya no pide permiso sin gesto**: `enablePushNotifications({auto:true})` solo re-registra el token si el permiso ya es `granted` (clave `PROMPTED_KEY` eliminada). Tarjeta de perfil (`activate-notifications.tsx`) sin cambios de flujo; texto idle actualizado.
- **Service worker `public/firebase-messaging-sw.js`**: (1) `notificationclick` propio registrado ANTES de `firebase.messaging()` con `stopImmediatePropagation` (neutraliza el handler del SDK que navegaba a links con route groups → 404); normaliza los links del backend (quita `(user)`/`(host)`, colapsa detalles inexistentes a `/account/bookings` y `/dashboard/bookings`) y resuelve contra el origin del SW; enfoca/navega ventana existente o abre una nueva. (2) `onBackgroundMessage` hace early return si `payload.notification` existe — el SDK ya muestra esa notificación (evita duplicados); solo muestra manualmente mensajes data-only.
- **Foreground**: el handler `onMessage` ahora usa `registration.showNotification` (Chrome Android no permite `new Notification`), con fallback a `new Notification` + onclick → `resolveNotificationLink`.
- **Pendiente backend (futuro)**: corregir los links de `booking-push-notification-service.ts` (apuntan a `(user)/...` y a rutas de detalle inexistentes); considerar tokens multi-dispositivo (hoy `users.fcm_token` es único y se sobrescribe).

## Bug hora de reserva en desktop (alquiler) corregido

- `rental-booking-form.tsx`: los dos `TimePicker` usan siempre la rama `modal` (Dialog). Antes en desktop usaban la rama Popover dentro del Dialog modal de fechas: Dialog (`@radix-ui/react-dialog@1.1.4`, dismissable-layer 1.1.3) y Popover (`@radix-ui/react-popover@1.1.6`, dismissable-layer 1.1.5) no comparten contexto → el Popover heredaba `pointer-events:none` y el focus trap lo cerraba ("no puedo cambiar la hora"). La rama Dialog ya funcionaba en móvil (Dialog dentro de Sheet). `time-picker.tsx` intacto (rama Popover sin uso).

## Recibo PDF y detalles de reserva del host
- **Recibo (PDF del cliente)**: la fecha de reserva ahora sale en minúscula y legible (`sábado, 31 de octubre 12:00 PM`; en inglés `Saturday, October 31 12:00 PM`). Para alquileres, recogida y devolución van en **líneas separadas** dentro del PDF (se quitó el separador `→`/`—` que jsPDF 4 renderizaba mal — era la causa del texto "muy separado"). `pdf-button.tsx` ahora dibuja la fecha multi-línea y desplaza el contenido siguiente (`reservationExtra`). Fuentes de datos: `booking-status.tsx` y `booking-details.tsx` (user) con `"\n"`.
- **Modal de detalles del host** (`booking-details-modal.tsx`): las fechas de reserva/recogida/entrega ahora usan el mismo formato legible (antes `DD/MM/YYYY h:mm A`). Se agregó botón **"Ver en Google Maps"** (`https://www.google.com/maps/search/?api=1&query=<dirección>`, misma URL que usa rental-booking-form): en alquileres usa `pickup_location`; en tours usa la dirección del producto (`products` del listado, prop nueva `tourAddress` desde `bookings-table.tsx` — sin cambio de backend). En tours también se muestra la dirección en el modal.
- **Recogida/Entrega separadas (alquiler)**: en el recibo PDF, la sección FECHA DE RESERVA ahora muestra bloques RECOGIDA (fecha+hora+lugar) y ENTREGA (fecha+hora+lugar) con sus lugares (`pickupDateTime/pickupLocation/dropoffDateTime/dropoffLocation` nuevos en `ReceiptProps`; los llenan `booking-status.tsx` y `booking-details.tsx`; `reservationDate` quedó solo para tours). En el modal del host, recogida y entrega son bloques separados (cuándo, a qué hora y dónde) y **cada uno tiene su propio botón** "Ver en Google Maps".
- Traducciones nuevas `dashboard.clientDetails.location`, `.viewOnGoogleMaps`, `.pickup` y `.dropoff` (es/en).
- **Dashboard del host**: la tabla de historial de pagos ahora vive dentro del mismo grid que "Actividad de reservas" y "Próximas reservas" — ocupa el 100% del ancho en desktop (`md:col-span-2 lg:col-span-7`) debajo de ambas; en mobile se apila al final. **Solo se muestra si el host tiene pagos** (`useGetOwnPaymentHistoryQuery` con pageSize 1 para saber el total; la tabla sigue con su propia consulta paginada).
- **Badge de estado en el modal de reservas del usuario**: antes era outline/transparente con letra verde sobre la imagen (no se notaba); ahora usa fondo sólido (verde completado/confirmado, ámbar pendiente, rojo cancelado) con texto blanco.


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

## Crear con IA — resultado en un clic + fotos mejoradas (2026-10-28)

- **Sin bloqueo de sesión**: se eliminó el gate de "un intento por pestaña" (`AI_SESSION_ATTEMPT_KEY`/`hasAttemptedThisSession`) que dejaba el botón Generar muerto tras el primer intento; el límite real lo aplica el backend (4 creaciones, error `AI_LIMIT_REACHED` mapeado).
- **Restyle**: acento ámbar/naranja → azul futurista (sky-400/cyan) en todo `ai-create/` + orbe `.ai-orb` en `globals.css`.
- **Resultado sin formulario**: `AiResultStep` ahora es resumen (portada, tarjeta pública, specs detectadas, aviso de datos autocompletados) + "Publicar borrador" en un clic; `suggestionToPublishValues` completa nulos con valores temporales válidos para el backend. "Editar detalles" lleva al wizard con prefill crudo.
- **Fotos IA**: el flujo llama a `POST /vehicles/enhance-image` tras analizar (nuevo `useEnhanceVehicleImageMutation`); la portada publicada es el banner mejorado (nunca la original si hay banner) y se muestra/descarga la versión redes 4:5. `analyze`/`enhance` invalidan el tag `AiLimit` para refrescar el contador.
- **Prompt backend**: `name`/`description`/`price_per_day` obligatorios siempre; mejor estimación + confidence calibrado en técnicos en vez de null.
- **Galería IA (2026-10-28)**: el resultado muestra tira "Galería IA" con las 5 vistas (`views.*` es/en); publish envía `imageUrls` (portada + galería) para que el producto tenga 6 fotos.
- **Consistencia visual (2026-10-28)**: nuevo `AiMediaFrame` (caja 16:9 fluida máx. 400px, centrada) usado en input/subida/proceso/portada; contenido con `absolute inset-0`. Resultado con `AiDraftCard` minimalista (lenguaje TourCard: eyebrow, pills con iconos, precio sand, confianza volcanic); confianza alta usa `volcanic-300`.

## Limpieza de código IA sin uso (2026-10-29)

- `ai-types.ts`: eliminados `AiAnalyzeErrorCode`, `confidenceChipClass`, `getAiResultSchema` (restos del flujo con formulario editable) y `suggestionToFormValues` (sin llamadas); `AiResultFormValues` pasó de `z.infer` a interfaz explícita con la misma forma y se quitó el import de zod.
- `ai-constants.ts`: eliminados `AI_CREATION_LIMIT` (el límite lo dicta el backend) y `AI_ALLOWED_EXTS` (sin uso).
- `ai-create-modal.tsx`: eliminada la vista `"error"` (nunca se entraba — los errores vuelven a `upload`) y una condición duplicada de `AI_LIMIT_REACHED` en `mapAnalyzeError`.
- `ai-product-slice.ts`: quitada la invalidación del tag `AiLimit/LIST` (ningún endpoint lo provee).
- `ai-upload-step.tsx`: el `accept` del input se deriva de `AI_ALLOWED_TYPES` en vez de duplicar el literal.
- `dashboard.json` (es/en): eliminadas las claves huérfanas `aiCreate.validation.*` (5), `aiCreate.retryButton` y `aiCreate.unexpectedError`.
- Se conserva a propósito: fallbacks demo 404 (backend IA aún sin desplegar), doble `append("image"/"file")` (compatibilidad con backend), todas las clases `ai-*` de `globals.css` (en uso).
- Verificación: `npx tsc --noEmit` sin errores en los archivos tocados; los 5 errores restantes (`home/[slug]/[id]/page.tsx` Socket, `clerk-localized-provider.tsx` @clerk/types) son preexistentes en archivos no modificados. JSON es/en validados.
- Nota: `ai-create-modal.tsx` cambió en disco durante la sesión (versión i18n con `t()`); la limpieza se aplicó sobre la versión vigente releída.

## Pendientes
- **Fase 5**: Reports (filtros, formato PDF/Excel/CSV + historial de reportes generados).
- Limpiar `bookings.payout_status` (sin uso) y borrar `drop-payouts.tmp.js` del backend.
- Baselinar `__drizzle_migrations` si se adopta flujo `dz:mig`.
