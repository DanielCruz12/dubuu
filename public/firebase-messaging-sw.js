/* eslint-disable no-undef */
/* Service Worker para Firebase Cloud Messaging (FCM) - Web Push */

// Firebase v9/v10 usa compat en SW por simplicidad con importScripts.
// Nota: el servicio funciona cuando el archivo es servido desde la raíz del dominio.
importScripts(
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js"
);

// Config usando el mismo proyecto que el front (desde .env del repo).
firebase.initializeApp({
  apiKey: "AIzaSyBowXk2aPKZVMumvYu0PkmD_QP85LNKGz8",
  authDomain: "dubuu-prod.firebaseapp.com",
  projectId: "dubuu-prod",
  storageBucket: "dubuu-prod.firebasestorage.app",
  messagingSenderId: "175481068928",
  appId: "1:175481068928:web:63f06ae1fd6e9b08867565",
  measurementId: "G-YRG7VZZHZN",
});

/**
 * Normaliza los links que envía el backend: quita los segmentos de route group
 * `(user)`/`(host)` (no existen en la URL pública) y, mientras no existan
 * páginas de detalle, lleva a las listas de reservas. Se resuelve contra el
 * origin del SW para que en desarrollo no abra producción.
 */
function normalizeLink(rawLink) {
  try {
    const url = new URL(rawLink, self.location.origin);
    let path = url.pathname.replace(/\/\((?:user|host)\)/g, "");

    if (/^\/account\/bookings\/[^/]+\/?$/.test(path)) {
      path = "/account/bookings";
    } else if (/^\/(?:dashboard\/)?bookings\/[^/]+\/?$/.test(path)) {
      path = "/dashboard/bookings";
    }

    return `${path}${url.search}${url.hash}` || "/";
  } catch {
    return "/";
  }
}

// Debe registrarse ANTES de crear la instancia de messaging: el SDK registra
// su propio `notificationclick` (con stopImmediatePropagation) que navega al
// link del backend tal cual (con route groups → 404). Este handler lo
// neutraliza y navega a la ruta normalizada.
self.addEventListener("notificationclick", (event) => {
  event.stopImmediatePropagation();
  event.notification.close();

  const data = event.notification.data || {};
  const fcmMsg = data.FCM_MSG || {};
  const rawLink =
    data.link ||
    fcmMsg.fcmOptions?.link ||
    fcmMsg.notification?.click_action ||
    fcmMsg.data?.link ||
    "/";

  const targetUrl = new URL(normalizeLink(rawLink), self.location.origin).href;

  event.waitUntil(
    (async () => {
      const windowsList = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });

      const existing = windowsList.find((client) => {
        try {
          return new URL(client.url).origin === self.location.origin;
        } catch {
          return false;
        }
      });

      if (existing) {
        await existing.focus();
        try {
          await existing.navigate(targetUrl);
        } catch {
          await self.clients.openWindow(targetUrl);
        }
        return;
      }

      await self.clients.openWindow(targetUrl);
    })(),
  );
});

const messaging = firebase.messaging();

// Mensajes en background.
messaging.onBackgroundMessage((payload) => {
  // El SDK ya muestra automáticamente los mensajes con payload.notification
  // (y aun así llama a este handler); evitar mostrarlos dos veces.
  if (payload?.notification) return;

  // Mensajes data-only: mostrarlos manualmente.
  const title = payload?.data?.title || "Notificación";
  return self.registration.showNotification(title, {
    body: payload?.data?.body || "",
    data: payload?.data || {},
    icon: "/icon.svg",
    badge: "/icon.svg",
  });
});
