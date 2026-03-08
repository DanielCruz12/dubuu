"use client";

import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

/**
 * Socket.IO usa el mismo patrón que el resto de la API: mismo origen + path /backend.
 * Next.js reescribe /backend/:path* → BACKEND_URL (next.config). La URL del backend
 * nunca se expone al cliente.
 */
const SOCKET_PATH = "/backend/socket.io";

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
    if (!userId || typeof window === "undefined") return;

    const socket = io(window.location.origin, {
      path: SOCKET_PATH,
      autoConnect: true,
    });
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
