"use client";

import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

/**
 * URL del backend donde corre Socket.IO (mismo host/puerto que la API).
 * En .env.local: NEXT_PUBLIC_API_URL=http://localhost:3002 (dev) o https://api.tudominio.com (prod)
 */
const SOCKET_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";

export type PaymentCompletedPayload = {
  bookingId: string;
  status: string;
};

export function usePaymentSocket(
  userId: string | null,
  onPaymentCompleted: (data: PaymentCompletedPayload) => void,
) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!userId) return;

    const socket = io(SOCKET_URL, { path: "/socket.io", autoConnect: true });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join", { userId });
    });

    socket.on("payment:completed", onPaymentCompleted);

    return () => {
      socket.off("payment:completed");
      socket.disconnect();
      socketRef.current = null;
    };
  }, [userId, onPaymentCompleted]);

  return socketRef.current;
}
