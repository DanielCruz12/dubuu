"use client";

import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

// Opción B: mismo origen + rewrite en next.config → /backend/socket.io → BACKEND_URL/socket.io
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
      transports: ["websocket"],
      autoConnect: true,
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join", { userId });
    });

    socket.on("payment:completed", onPaymentCompleted);

    socket.on("connect_error", (err) => {
      console.error("Socket connect_error", err.message);
    });

    return () => {
      socket.off("payment:completed");
      socket.disconnect();
      socketRef.current = null;
    };
  }, [userId, onPaymentCompleted]);

  return socketRef.current;
}
