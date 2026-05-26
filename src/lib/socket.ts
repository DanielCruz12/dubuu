"use client";

import { io, Socket } from "socket.io-client";

// Vercel no soporta WebSocket: el rewrite /backend → BACKEND_URL no hace upgrade.
// Conectamos directo al backend cuando NEXT_PUBLIC_API_URL está definida (producción).
// En local sin esa variable usamos mismo origen + /backend/socket.io (rewrite en next.config).
function getSocketConfig() {
  const direct = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
  if (direct) {
    return { url: direct, path: "/socket.io" };
  }
  return { url: "", path: "/backend/socket.io" };
}

const { url, path } = getSocketConfig();

export const socket: Socket =
  typeof window !== "undefined"
    ? io(url, {
        path,
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 10000,
      })
    : ({} as Socket);
