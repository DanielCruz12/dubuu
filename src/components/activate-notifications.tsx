"use client";

import React, { useState } from "react";
import { getApps, initializeApp } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

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
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID as
      | string
      | undefined,
  };
}

function getMissingRequiredEnvVars() {
  // Importante: en componentes "use client", Next inlines env vars solo si
  // se referencian de forma estática; por eso NO usamos `process.env[key]`.
  const missing: string[] = [];
  if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY)
    missing.push("NEXT_PUBLIC_FIREBASE_API_KEY");
  if (!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN)
    missing.push("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN");
  if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID)
    missing.push("NEXT_PUBLIC_FIREBASE_PROJECT_ID");
  if (!process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET)
    missing.push("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET");
  if (!process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID)
    missing.push("NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID");
  if (!process.env.NEXT_PUBLIC_FIREBASE_APP_ID)
    missing.push("NEXT_PUBLIC_FIREBASE_APP_ID");

  return missing;
}

export default function ActivateNotifications() {
  const [token, setToken] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [testState, setTestState] = useState<{
    status: "idle" | "loading" | "success" | "error";
    message?: string;
  }>({ status: "idle" });

  const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY as
    | string
    | undefined;

  const canUse = typeof window !== "undefined";

  const handleEnable = async () => {
    setError("");
    setToken("");
    if (!canUse) return;

    const missingEnvVars = getMissingRequiredEnvVars();
    if (missingEnvVars.length > 0) {
      setError(
        `Faltan variables de Firebase en el front (en el bundle del navegador): ${missingEnvVars.join(
          ", "
        )}. Reinicia el dev server después de editar el .env.`
      );
      return;
    }
    if (!vapidKey) {
      setError("Falta `NEXT_PUBLIC_FIREBASE_VAPID_KEY` en el front (.env).");
      return;
    }

    const firebaseConfig = getFirebaseConfig();
    const typedFirebaseConfig: FirebaseClientConfig = {
      apiKey: firebaseConfig.apiKey!,
      authDomain: firebaseConfig.authDomain!,
      projectId: firebaseConfig.projectId!,
      storageBucket: firebaseConfig.storageBucket!,
      messagingSenderId: firebaseConfig.messagingSenderId!,
      appId: firebaseConfig.appId!,
      measurementId: firebaseConfig.measurementId,
    };

    if (!("Notification" in window)) {
      setError("Este navegador no soporta la API de Notificaciones.");
      return;
    }
    if (!("serviceWorker" in navigator)) {
      setError("Este navegador no soporta Service Workers.");
      return;
    }

    setIsLoading(true);
    try {
      // 1) Pedir permiso primero.
      let permission = Notification.permission;
      if (permission !== "granted") {
        permission = await Notification.requestPermission();
      }
      if (permission !== "granted") {
        setError(
          "Permiso de notificaciones `denegado`. Habilita notificaciones en el navegador e intenta de nuevo."
        );
        return;
      }

      // 2) Registrar SW (necesario para que getToken funcione).
      await navigator.serviceWorker.register(
        "/firebase-messaging-sw.js"
      );
      const swRegistration = await navigator.serviceWorker.ready;

      // 3) Inicializar Firebase client (si no existe aún).
      const app =
        getApps().length > 0
          ? getApps()[0]
          : initializeApp(typedFirebaseConfig);

      // 4) Obtener token.
      const messaging = getMessaging(app);
      const fcmToken = await getToken(messaging, {
        vapidKey,
        serviceWorkerRegistration: swRegistration,
      });

      if (!fcmToken) {
        setError(
          "No se pudo obtener el token. Revisa configuración de Firebase, VAPID key y que el service worker esté registrado."
        );
        return;
      }

      setToken(fcmToken);
      // Recomendado para copiar luego:
      console.log("FCM token (web):", fcmToken);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Error desconocido al obtener FCM token.";
      setError(
        `Error al activar notificaciones: ${message}. (Revisa que permission sea "granted" y que el service worker esté disponible.)`
      );
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestNotification = async () => {
    if (!token) {
      setTestState({
        status: "error",
        message: "Primero genera el FCM token (web) para poder probar.",
      });
      return;
    }

    setTestState({ status: "loading" });

    try {
      // Usamos rewrite de Next para evitar CORS.
      // En next.config.mjs: /backend/:path* -> BACKEND_URL/:path*
      const res = await fetch("/backend/api/v1/test-notification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          title: "Prueba",
          body: "Si llega, funcionó todo",
          link: "https://dubuu.com",
        }),
      });

      const text = await res.text();

      if (!res.ok) {
        setTestState({
          status: "error",
          message: `El backend respondió con error (${res.status}). ${text}`,
        });
        return;
      }

      setTestState({
        status: "success",
        message: text || "Notificación de prueba enviada al backend.",
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error desconocido.";
      setTestState({
        status: "error",
        message: `No se pudo contactar el backend: ${message}`,
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activar notificaciones</CardTitle>
        <CardDescription>
          Obtén tu token de FCM para poder usarlo en el backend (solo prueba).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={handleEnable} disabled={isLoading}>
          {isLoading ? "Solicitando..." : "Activar notificaciones"}
        </Button>

        {error ? (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        {token ? (
          <div className="space-y-2">
            <div className="text-sm font-medium">FCM token (web)</div>
            <Textarea value={token} readOnly className="h-[120px]" />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(token);
                  console.log("Token copiado al portapapeles.");
                } catch (e) {
                  console.error(e);
                }
              }}
            >
              Copiar token
            </Button>

            <div className="pt-2 space-y-2">
              <Button
                type="button"
                variant="default"
                disabled={testState.status === "loading"}
                onClick={handleTestNotification}
              >
                {testState.status === "loading"
                  ? "Enviando prueba..."
                  : "Probar notificación en backend"}
              </Button>

              {testState.status === "error" && testState.message ? (
                <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                  {testState.message}
                </div>
              ) : null}

              {testState.status === "success" && testState.message ? (
                <div className="rounded-md border border-primary/30 bg-primary/10 p-3 text-sm text-primary">
                  {testState.message}
                </div>
              ) : null}
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

