import { getApps, initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

export const ENABLED_KEY = "dubuu:notifications:enabled";
const PROMPTED_KEY = "dubuu:notifications:prompted";
export const STATUS_EVENT = "dubuu:notifications-status";

// Evita registrar el handler de mensajes en primer plano más de una vez
let foregroundHandlerRegistered = false;
// La activación automática solo se intenta una vez por sesión
let autoAttemptedThisSession = false;

export type PushEnableResult =
  | { status: "active" }
  | { status: "error"; message: string }
  | { status: "skipped" };

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
 *   no vuelve a pedir permiso si ya se pidió automáticamente antes sin éxito.
 * - `auto: false` — activación manual: siempre pide permiso.
 */
export async function enablePushNotifications(
  options: { auto?: boolean } = {},
): Promise<PushEnableResult> {
  const { auto = false } = options;
  if (typeof window === "undefined") return { status: "skipped" };

  if (auto) {
    if (autoAttemptedThisSession) return { status: "skipped" };
    autoAttemptedThisSession = true;
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

  if (!("Notification" in window)) {
    const result: PushEnableResult = {
      status: "error",
      message: "Este navegador no soporta notificaciones.",
    };
    emitStatus(result);
    return result;
  }
  if (!("serviceWorker" in navigator)) {
    const result: PushEnableResult = {
      status: "error",
      message: "Este navegador no soporta Service Workers.",
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
      // "default": si ya se pidió automáticamente antes y no aceptó, no molestar de nuevo
      if (auto && localStorage.getItem(PROMPTED_KEY) === "1") {
        return { status: "skipped" };
      }
      permission = await Notification.requestPermission();
      if (auto) localStorage.setItem(PROMPTED_KEY, "1");
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

    await navigator.serviceWorker.register("/firebase-messaging-sw.js");
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

    // Registrar el token en el backend
    await fetch("/backend/api/v1/users/fcm-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: fcmToken }),
    });

    // Foreground message handler (solo una vez por sesión)
    if (!foregroundHandlerRegistered) {
      foregroundHandlerRegistered = true;
      onMessage(messaging, (payload) => {
        const title = payload.notification?.title || payload.data?.title || "Dubuu";
        const body = payload.notification?.body || payload.data?.body || "";
        const icon = payload.notification?.icon || "/icon.svg";

        if (Notification.permission === "granted") {
          new Notification(title, { body, icon, data: payload.data });
        }
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
