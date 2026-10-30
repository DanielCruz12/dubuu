# ROL
Eres un ingeniero full-stack senior (Next.js + Node.js/Express + Drizzle) y diseñador de producto. Vas a implementar el FLUJO "CREAR PRODUCTO CON IA A PARTIR DE UNA IMAGEN", empezando SOLO por la categoría ALQUILER DE VEHÍCULOS.

# REGLAS DURAS
1. NO crear tablas nuevas. SÍ puedes agregar columnas a tablas existentes (con migración Drizzle, nullable o con default, sin romper datos actuales).
2. NO romper el flujo manual actual (formulario de 6 pasos). Debe seguir funcionando igual.
3. Todo lo nuevo en componentes y rutas SEPARADOS (carpeta propia, p. ej. `components/ai-create/` y `routes/v1/ai-product-routes.ts`). No mezclar con el formulario manual.
4. Todo producto creado con IA se guarda con `status: false` y `active: false` (borrador). Solo el usuario lo activa después.
5. Nunca exponer la API key del modelo en el frontend. Toda llamada a IA pasa por el backend.
6. Textos de UI en español.

# FASE 0 — ANÁLISIS (no escribas código todavía)
a) En CADA repo (frontend y backend) lee primero `HANDOFF.md` y respeta sus convenciones, rutas, auth (Clerk), estructura de carpetas y comandos.
b) Revisa el backend: rutas, controladores, servicios, validaciones, middlewares de auth/roles y cómo se crea hoy un producto de renta de vehículos.
c) Revisa los schemas Drizzle: cómo está armada la tabla de vehículos y las tablas relacionadas (multimedia/imágenes, productos/publicaciones, precios, características, ubicación, etc.). Lista TODOS los campos de vehículo y cuáles son requeridos vs opcionales.
d) Revisa el frontend: el formulario de 6 pasos de renta (`rental-form.tsx` y el componente `MultimediaStep` de add-tour), cómo sube imágenes, cómo valida y cómo envía al backend.
e) Entrégame un resumen corto: (1) mapa campo por campo de la tabla de vehículos con cuáles puede deducir la IA desde una imagen y cuáles NO (esos quedan vacíos y se marcan "completar"), (2) campos que propones agregar, si hace falta (por ejemplo `created_with_ai`, `ai_confidence`, `ai_generated_at`), (3) puntos de integración con el flujo manual. ESPERA mi confirmación antes de la Fase 1.

# FASE 1 — BACKEND
- Endpoint `POST /api/v1/ai-products/vehicles/analyze` (autenticado, rol host/operador): recibe 1 imagen (multipart, validar tipo y máx. de tamaño), la sube al storage que ya usa el proyecto y llama a Muse Spark 1.3 (visión) con salida JSON ESTRICTA validada con Zod contra los campos reales de la tabla de vehículos (marca, modelo, año aproximado, tipo/carrocería, color, transmisión, combustible, nº de asientos y puertas, características visibles, título y descripción atractivos, y precio sugerido por día con un rango, si el schema lo permite).
- El prompt del sistema hacia el modelo debe: devolver solo JSON, usar null en lo que no se pueda deducir (nunca inventar), incluir un `confidence` por campo, y redactar título y descripción en español, claros y sin exageraciones.
- Endpoint `POST /api/v1/ai-products/vehicles/publish`: recibe los datos ya revisados/editados por el usuario y los guarda con `status:false`, `active:false`, asociando la imagen como multimedia principal. Valida con el mismo schema que el flujo manual.
- Límite de usos con IA por usuario: constante configurable `AI_CREATION_LIMIT` (valor de desarrollo = 4, fácil de cambiar) más contador por usuario, usando una columna agregada a una tabla existente. Si se alcanza, responder con código claro (`AI_LIMIT_REACHED`).
- Manejo de errores: imagen que no es un vehículo, imagen borrosa, timeout del modelo, JSON inválido (reintentar 1 vez), límite alcanzado. Logs útiles sin datos sensibles.
- Un solo intento de generación por sesión de creación: no hay botón de "regenerar".

# FASE 2 — FRONTEND (UX)
Antes de diseñar, lee y aplica la skill `frontend-design` (si no está disponible, dime cuál instalar). Mantén la identidad visual de Dubuu: fondo oscuro, acentos dorados/atardecer, tipografía serif itálica en acentos.

Flujo de pantallas:
1. Botón "Crear" → abre un MODAL futurista (glassmorphism sobre fondo oscuro con glow dorado, animación de entrada suave) con 2 tarjetas grandes:
   - "Crear con IA ✨" (imagen/ilustración destacada, etiqueta "Nuevo")
   - "Crear manualmente" (lleva al formulario de 6 pasos actual)
   Si el usuario ya alcanzó el límite de IA, la tarjeta de IA se muestra deshabilitada con un mensaje claro.
2. Pantalla "Sube la foto de tu vehículo": dropzone con drag & drop, vista previa, consejos breves (foto completa del vehículo, buena luz, sin zoom excesivo) y botón "Generar con IA".
3. Pantalla de GENERACIÓN (el momento clave): animación tipo IA, al estilo del indicador de "pensando" de un chat: orbe/gradiente animado o shimmer, línea de escaneo recorriendo la foto, y mensajes de progreso que van cambiando ("Analizando tu vehículo…", "Detectando marca y modelo…", "Redactando tu descripción…", "Calculando un precio sugerido…"). Que se sienta fluido, no un spinner genérico.
4. Pantalla de RESULTADO / PREVIEW: la foto a un lado y una tarjeta con los datos que aparecen poco a poco (efecto de escritura o fade-in escalonado, campo por campo). Cada campo muestra un chip sutil "IA" y su nivel de confianza; los campos que la IA no pudo deducir se resaltan como "Completa este dato". Todos los campos son editables inline. Debajo, un preview de cómo se verá la tarjeta pública del vehículo.
5. Dos botones finales:
   - "Publicar" (crea el borrador con status false / active false y confirma con un mensaje de éxito + enlace al producto)
   - "Editar antes de publicar" (pasa los datos al formulario manual precargado)
6. Confirmación final con animación breve y siguiente paso claro (activar el producto desde el dashboard).

Requisitos de UX: mobile-first (muchos hosts usan iPhone, prueba el modal y la subida de imagen en iOS/Safari), accesible (foco, aria, `prefers-reduced-motion` desactiva animaciones pesadas), estados de carga/error/vacío en cada pantalla, y que sea intuitivo sin instrucciones.

# FASE 3 — VERIFICACIÓN
- Typecheck y lint sin errores; migración Drizzle probada.
- Pruebas manuales: imagen buena, imagen que no es un vehículo, límite alcanzado, corte de red, flujo manual sin regresiones.
- Actualiza el `HANDOFF.md` de cada repo con: qué se hizo, archivos nuevos, endpoints, variables de entorno, cómo cambiar `AI_CREATION_LIMIT` y qué falta.

# ENTREGABLES
Código por fases con commits pequeños, y al final un resumen con lo implementado, supuestos que tomaste y pendientes. Si algo del schema o del HANDOFF contradice este prompt, pregúntame antes de decidir.