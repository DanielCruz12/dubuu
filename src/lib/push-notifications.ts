import { getApps, initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { getClerkSessionToken } from "@/redux/clerk-token";

export const ENABLED_KEY = "dubuu:notifications:enabled";
const CONSENT_KEY = "dubuu:notifications:consent";
export const STATUS_EVENT = "dubuu:notifications-status";

// Evita registrar el handler de mensajes en primer plano más de una vez
let foregroundHandlerRegistered = false;
// La activación automática solo se intenta una vez por sesión
let autoAttemptedThisSession = false;

export type PushEnableResult =
  | { status: "active" }
  | { status: "error"; message: string }
  | { status: "skipped" };

export type NotificationsConsent = "accepted" | "declined" | "unsupported";

export function getNotificationsConsent(): NotificationsConsent | null {
  if (typeof window === "undefined") return null;
  const value = localStorage.getItem(CONSENT_KEY);
  return value === "accepted" || value === "declined" || value === "unsupported"
    ? value
    : null;
}

export function setNotificationsConsent(value: NotificationsConsent): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(CONSENT_KEY, value);
}

export type PushSupport =
  | { supported: true }
  | { supported: false; reason: "ios" | "insecure" | "browser" };

/** ¿Este navegador puede recibir notificaciones push? (iOS exige la PWA instalada) */
export function getPushSupport(): PushSupport {
  if (typeof window === "undefined") {
    return { supported: false, reason: "browser" };
  }

  const nav = window.navigator as Navigator & { standalone?: boolean };
  const isIOS =
    /iPad|iPhone|iPod/.test(nav.userAgent) ||
    (nav.platform === "MacIntel" && nav.maxTouchPoints > 1);
  const isStandalone =
    (typeof window.matchMedia === "function" &&
      window.matchMedia("(display-mode: standalone)").matches) ||
    nav.standalone === true;

  // En iOS las notificaciones web solo existen en la PWA instalada (iOS 16.4+).
  if (isIOS && !isStandalone) {
    return { supported: false, reason: "ios" };
  }

  if (!window.isSecureContext) {
    return { supported: false, reason: "insecure" };
  }

  if (
    typeof Notification === "undefined" ||
    !("serviceWorker" in nav) ||
    !("PushManager" in window)
  ) {
    // iOS standalone antiguo (pre-16.4) también cae aquí.
    return { supported: false, reason: isIOS ? "ios" : "browser" };
  }

  return { supported: true };
}

export function isPushSupported(): boolean {
  return getPushSupport().supported;
}

/**
 * Normaliza los links que envía el backend en las push: quita los segmentos de
 * route group `(user)`/`(host)` (no existen en la URL pública) y, mientras no
 * existan páginas de detalle, lleva a las listas de reservas.
 */
export function resolveNotificationLink(rawLink?: string | null): string {
  if (typeof window === "undefined" || !rawLink) return "/";

  try {
    const url = new URL(rawLink, window.location.origin);
    let pathname = url.pathname.replace(/\/\((?:user|host)\)/g, "");

    if (/^\/account\/bookings\/[^/]+\/?$/.test(pathname)) {
      pathname = "/account/bookings";
    } else if (/^\/(?:dashboard\/)?bookings\/[^/]+\/?$/.test(pathname)) {
      pathname = "/dashboard/bookings";
    }

    return `${pathname}${url.search}${url.hash}` || "/";
  } catch {
    return "/";
  }
}

type FirebaseClientConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
};

function getFirebaseConfig() {
  return {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY as string,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN as string,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID as string,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET as string,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID as string,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID as string,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID as string | undefined,
  };
}

function getMissingRequiredEnvVars() {
  const missing: string[] = [];
  if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) missing.push("NEXT_PUBLIC_FIREBASE_API_KEY");
  if (!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN) missing.push("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN");
  if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) missing.push("NEXT_PUBLIC_FIREBASE_PROJECT_ID");
  if (!process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET) missing.push("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET");
  if (!process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID) missing.push("NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID");
  if (!process.env.NEXT_PUBLIC_FIREBASE_APP_ID) missing.push("NEXT_PUBLIC_FIREBASE_APP_ID");
  return missing;
}

function emitStatus(result: PushEnableResult) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent<PushEnableResult>(STATUS_EVENT, { detail: result }));
  }
}

/** ¿Están habilitadas las notificaciones? (flag local + permiso otorgado) */
export function getNotificationsEnabled(): boolean {
  if (typeof window === "undefined") return false;
  return (
    localStorage.getItem(ENABLED_KEY) === "1" &&
    "Notification" in window &&
    Notification.permission === "granted"
  );
}

/**
 * Solicita permiso (si hace falta) y registra el token FCM en el backend.
 * - `auto: true` — activación automática: solo se intenta una vez por sesión y
 *   NUNCA pide permiso (sin gesto del usuario no es fiable); solo re-registra
 *   el token si el permiso ya fue concedido. El modal de consentimiento pide.
 * - `auto: false` — activación manual: el clic del usuario da el gesto para
 *   pedir permiso.
 */
export async function enablePushNotifications(
  options: { auto?: boolean } = {},
): Promise<PushEnableResult> {
  const { auto = false } = options;
  if (typeof window === "undefined") return { status: "skipped" };

  if (auto) {
    if (autoAttemptedThisSession) return { status: "skipped" };
    autoAttemptedThisSession = true;

    if (!isPushSupported() || Notification.permission !== "granted") {
      return { status: "skipped" };
    }
  } else {
    // Modo manual: comprobar soporte de forma síncrona para conservar el gesto
    // del usuario hasta Notification.requestPermission().
    const support = getPushSupport();
    if (!support.supported) {
      const message =
        support.reason === "ios"
          ? "Este navegador no soporta notificaciones. En iPhone o iPad, instala la app en la pantalla de inicio (requiere iOS 16.4 o superior)."
          : support.reason === "insecure"
            ? "Las notificaciones requieren una conexión segura (HTTPS)."
            : "Este navegador no soporta notificaciones.";
      const result: PushEnableResult = { status: "error", message };
      emitStatus(result);
      return result;
    }
  }

  const missingEnvVars = getMissingRequiredEnvVars();
  if (missingEnvVars.length > 0) {
    const result: PushEnableResult = {
      status: "error",
      message: `Faltan variables de Firebase: ${missingEnvVars.join(", ")}.`,
    };
    emitStatus(result);
    return result;
  }

  const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY as string | undefined;
  if (!vapidKey) {
    const result: PushEnableResult = {
      status: "error",
      message: "Falta NEXT_PUBLIC_FIREBASE_VAPID_KEY en el .env.",
    };
    emitStatus(result);
    return result;
  }

  try {
    let permission = Notification.permission;
    if (permission !== "granted") {
      if (permission === "denied") {
        const result: PushEnableResult = {
          status: "error",
          message: "Permiso de notificaciones denegado. Habilítalo en el navegador e intenta de nuevo.",
        };
        emitStatus(result);
        return result;
      }
      permission = await Notification.requestPermission();
    }

    if (permission !== "granted") {
      const result: PushEnableResult = {
        status: "error",
        message: "Permiso de notificaciones denegado. Habilítalo en el navegador e intenta de nuevo.",
      };
      emitStatus(result);
      localStorage.removeItem(ENABLED_KEY);
      return result;
    }

    await navigator.serviceWorker.register("/firebase-messaging-sw.js", {
      updateViaCache: "none",
    });
    const swRegistration = await navigator.serviceWorker.ready;

    const firebaseConfig = getFirebaseConfig();
    const typedConfig: FirebaseClientConfig = {
      apiKey: firebaseConfig.apiKey!,
      authDomain: firebaseConfig.authDomain!,
      projectId: firebaseConfig.projectId!,
      storageBucket: firebaseConfig.storageBucket!,
      messagingSenderId: firebaseConfig.messagingSenderId!,
      appId: firebaseConfig.appId!,
      measurementId: firebaseConfig.measurementId,
    };

    const app = getApps().length > 0 ? getApps()[0] : initializeApp(typedConfig);
    const messaging = getMessaging(app);

    const fcmToken = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: swRegistration,
    });

    if (!fcmToken) {
      const result: PushEnableResult = {
        status: "error",
        message: "No se pudo obtener el token FCM. Revisa la configuración de Firebase.",
      };
      emitStatus(result);
      return result;
    }

    // Registrar el token en el backend (requiere la sesión de Clerk)
    const sessionToken = await getClerkSessionToken();
    const response = await fetch("/backend/api/v1/users/fcm-token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {}),
      },
      body: JSON.stringify({ token: fcmToken }),
    });
    if (!response.ok) {
      throw new Error(
        response.status === 401
          ? "Tu sesión expiró. Inicia sesión de nuevo para activar las notificaciones."
          : `No se pudo registrar el token de notificaciones (HTTP ${response.status}).`,
      );
    }

    // Foreground message handler (solo una vez por sesión)
    if (!foregroundHandlerRegistered) {
      foregroundHandlerRegistered = true;
      onMessage(messaging, (payload) => {
        const title = payload.notification?.title || payload.data?.title || "Dubuu";
        const body = payload.notification?.body || payload.data?.body || "";
        const icon = payload.notification?.icon || "/icon.svg";
        const data = payload.data ?? {};

        void (async () => {
          // Preferir el SW: en Chrome Android `new Notification` no está permitido.
          const registration = await navigator.serviceWorker.getRegistration(
            "/firebase-messaging-sw.js",
          );
          if (registration) {
            try {
              await registration.showNotification(title, { body, icon, data });
              return;
            } catch {
              // Continuar con el fallback de la API de ventana.
            }
          }

          try {
            const notification = new Notification(title, { body, icon, data });
            notification.onclick = () => {
              notification.close();
              window.focus();
              window.location.assign(resolveNotificationLink(data.link));
            };
          } catch {
            // Sin SW ni API de ventana: no se puede mostrar la notificación.
          }
        })();
      });
    }

    localStorage.setItem(ENABLED_KEY, "1");
    const result: PushEnableResult = { status: "active" };
    emitStatus(result);
    return result;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido.";
    const result: PushEnableResult = {
      status: "error",
      message: `Error al activar notificaciones: ${message}`,
    };
    emitStatus(result);
    localStorage.removeItem(ENABLED_KEY);
    return result;
  }
}
