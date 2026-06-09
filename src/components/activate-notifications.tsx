"use client";

import React, { useState } from "react";
import { getApps, initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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

export default function ActivateNotifications() {
  const [status, setStatus] = useState<"idle" | "loading" | "active" | "error">("idle");
  const [error, setError] = useState<string>("");
  const canUse = typeof window !== "undefined";

  const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY as string | undefined;

  const handleEnable = async () => {
    setError("");
    if (!canUse) return;

    const missingEnvVars = getMissingRequiredEnvVars();
    if (missingEnvVars.length > 0) {
      setError(`Faltan variables de Firebase: ${missingEnvVars.join(", ")}.`);
      return;
    }
    if (!vapidKey) {
      setError("Falta NEXT_PUBLIC_FIREBASE_VAPID_KEY en el .env.");
      return;
    }

    if (!("Notification" in window)) {
      setError("Este navegador no soporta notificaciones.");
      return;
    }
    if (!("serviceWorker" in navigator)) {
      setError("Este navegador no soporta Service Workers.");
      return;
    }

    setStatus("loading");
    try {
      let permission = Notification.permission;
      if (permission !== "granted") {
        permission = await Notification.requestPermission();
      }
      if (permission !== "granted") {
        setError("Permiso de notificaciones denegado. Habilítalo en el navegador e intenta de nuevo.");
        setStatus("error");
        return;
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
        setError("No se pudo obtener el token FCM. Revisa la configuración de Firebase.");
        setStatus("error");
        return;
      }

      // Registrar el token en el backend
      await fetch("/backend/api/v1/users/fcm-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: fcmToken }),
      });

      // Foreground message handler
      onMessage(messaging, (payload) => {
        const title = payload.notification?.title || payload.data?.title || "Dubuu";
        const body = payload.notification?.body || payload.data?.body || "";
        const icon = payload.notification?.icon || "/icon.svg";

        if (Notification.permission === "granted") {
          new Notification(title, { body, icon, data: payload.data });
        }
      });

      setStatus("active");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error desconocido.";
      setError(`Error al activar notificaciones: ${message}`);
      setStatus("error");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notificaciones push</CardTitle>
        <CardDescription>
          {status === "active"
            ? "Notificaciones activadas. Recibirás alertas cuando se confirmen tus reservas."
            : "Activa las notificaciones para recibir alertas en tiempo real."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {status === "active" ? (
          <div className="rounded-md border border-primary/30 bg-primary/10 p-3 text-sm text-primary">
            Notificaciones activadas correctamente.
          </div>
        ) : (
          <Button onClick={handleEnable} disabled={status === "loading"}>
            {status === "loading" ? "Activando..." : "Activar notificaciones"}
          </Button>
        )}

        {error ? (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
