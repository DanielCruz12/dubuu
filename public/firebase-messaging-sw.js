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

const messaging = firebase.messaging();

// (Opcional) Para que en background se muestre una notificación.
messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Background message received:",
    payload
  );

  const title =
    payload?.notification?.title ||
    payload?.data?.title ||
    "Notificación";
  const options = {
    body: payload?.notification?.body || payload?.data?.body || "",
    data: payload?.data || {},
    icon: "/logo.svg",
  };

  // Muestra notificación incluso si el backend solo manda data.
  self.registration.showNotification(title, options);
});

