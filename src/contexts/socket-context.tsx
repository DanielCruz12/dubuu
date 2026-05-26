"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { io, type Socket } from "socket.io-client";
import { useUser } from "@clerk/nextjs";

export type PaymentCompletedPayload = {
  bookingId: string;
  status: "completed";
};

type SocketContextValue = {
  socket: Socket | null;
  isConnected: boolean;
};

const SocketContext = createContext<SocketContextValue>({
  socket: null,
  isConnected: false,
});

export function SocketProvider({ children }: { children: ReactNode }) {
  const { user, isLoaded } = useUser();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!isLoaded || !user?.id) return;

    const direct = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
    const url = direct ?? "";
    const path = direct ? "/socket.io" : "/backend/socket.io";

    const s = io(url, {
      path,
      transports: ["websocket", "polling"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
    });

    setSocket(s);

    s.on("connect", () => {
      setIsConnected(true);
      s.emit("join", { userId: user.id });
    });

    s.on("disconnect", () => setIsConnected(false));
    s.on("connect_error", () => setIsConnected(false));

    return () => {
      s.off("connect");
      s.off("disconnect");
      s.off("connect_error");
      s.disconnect();
      setSocket(null);
      setIsConnected(false);
    };
  }, [isLoaded, user?.id]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error("useSocket must be used within SocketProvider");
  return ctx;
}

export function useOnPaymentCompleted(
  callback: (payload: PaymentCompletedPayload) => void
) {
  const { socket } = useSocket();
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    if (!socket) return;
    const handler = (payload: PaymentCompletedPayload) => {
      callbackRef.current(payload);
    };
    socket.on("payment:completed", handler);
    return () => {
      socket.off("payment:completed", handler);
    };
  }, [socket]);
}
