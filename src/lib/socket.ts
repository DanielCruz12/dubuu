"use client";

import { io, Socket } from "socket.io-client";

// Mismo origen: el navegador pide a tu sitio /backend/socket.io
// Next rewrites a BACKEND_URL/socket.io (el backend no queda expuesto)
const socketOptions = {
  path: "/backend/socket.io",
  transports: ["websocket"],
};

export const socket: Socket =
  typeof window !== "undefined" ? io("", socketOptions) : ({} as Socket);
