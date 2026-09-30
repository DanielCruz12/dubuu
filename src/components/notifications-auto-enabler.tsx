"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { enablePushNotifications } from "@/lib/push-notifications";

/**
 * Activa las notificaciones push automáticamente para usuarios con sesión iniciada.
 * Se monta en el layout principal: pide permiso una sola vez y registra el token FCM.
 */
export default function NotificationsAutoEnabler() {
  const { isLoaded, isSignedIn } = useUser();

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    enablePushNotifications({ auto: true });
  }, [isLoaded, isSignedIn]);

  return null;
}
