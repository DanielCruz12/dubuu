"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { enablePushNotifications } from "@/lib/push-notifications";

/**
 * Para usuarios con sesión iniciada, re-registra el token FCM en silencio cuando
 * el permiso de notificaciones ya fue concedido. Nunca pide permiso sin gesto del
 * usuario: eso lo hace NotificationsConsentModal (montado en el layout principal).
 */
export default function NotificationsAutoEnabler() {
  const { isLoaded, isSignedIn } = useUser();

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    enablePushNotifications({ auto: true });
  }, [isLoaded, isSignedIn]);

  return null;
}
