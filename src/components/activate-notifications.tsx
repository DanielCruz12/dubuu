"use client";

import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  enablePushNotifications,
  getNotificationsEnabled,
  STATUS_EVENT,
  type PushEnableResult,
} from "@/lib/push-notifications";

export default function ActivateNotifications() {
  const [status, setStatus] = useState<"idle" | "loading" | "active" | "error">(() =>
    getNotificationsEnabled() ? "active" : "idle",
  );
  const [error, setError] = useState<string>("");

  // Sincroniza con la activación automática global (layout principal)
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<PushEnableResult>).detail;
      if (!detail) return;
      if (detail.status === "active") {
        setStatus("active");
        setError("");
      } else if (detail.status === "error") {
        setStatus("error");
        setError(detail.message);
      }
    };
    window.addEventListener(STATUS_EVENT, handler);
    return () => window.removeEventListener(STATUS_EVENT, handler);
  }, []);

  const handleEnable = useCallback(async () => {
    setError("");
    setStatus("loading");
    const result = await enablePushNotifications({ auto: false });
    if (result.status === "active") {
      setStatus("active");
    } else if (result.status === "error") {
      setStatus("error");
      setError(result.message);
    }
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notificaciones push</CardTitle>
        <CardDescription>
          {status === "active"
            ? "Notificaciones activadas. Recibirás alertas cuando se confirmen tus reservas."
            : "Las notificaciones se activan automáticamente. Si no lo están, inténtalo con el botón."}
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
