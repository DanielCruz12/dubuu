"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAuth, useUser, SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n-context";
import { useOnPaymentCompleted } from "@/contexts/socket-context";
import { vibrateSuccess } from "@/lib/vibration";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Loader2,
  XCircle,
} from "lucide-react";

const MAX_ATTEMPTS = 15;
const POLL_INTERVAL_MS = 2000;

type PaymentStatus = "paid" | "failed" | "pending";

export default function PaymentResultContent({ bookingId }: { bookingId: string }) {
  const { t } = useLanguage();
  const { isLoaded, isSignedIn } = useUser();
  const { getToken } = useAuth();

  const [status, setStatusState] = useState<PaymentStatus | null>(null);
  const [exhausted, setExhausted] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);

  const statusRef = useRef<PaymentStatus | null>(null);
  const attemptsRef = useRef(0);

  const setStatus = (value: PaymentStatus) => {
    statusRef.current = value;
    setStatusState(value);
    if (value === "paid") vibrateSuccess();
  };

  // Si el webhook marca la reserva como pagada mientras el usuario espera, el
  // socket confirma al instante (sin esperar el siguiente ciclo de polling).
  useOnPaymentCompleted((payload) => {
    if (payload.bookingId === bookingId) {
      setStatus("paid");
    }
  });

  const poll = useCallback(async () => {
    if (!bookingId) return;
    try {
      const token = await getToken();
      const response = await fetch(
        `/backend/api/v1/bookings/${bookingId}/payment-status`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        },
      );

      if (response.status === 401) {
        setSessionExpired(true);
        return;
      }
      if (!response.ok) {
        // 404 o error transitorio: reintentar en el siguiente ciclo
        return;
      }

      const data = (await response.json()) as { status?: string };
      if (data?.status === "paid" || data?.status === "failed") {
        setStatus(data.status);
      }
    } catch {
      // Error de red transitorio: reintentar en el siguiente ciclo
    }
  }, [bookingId, getToken]);

  // Polling: 1 intento inmediato + cada 2 s, máximo 15
  useEffect(() => {
    if (!isLoaded || !isSignedIn || !bookingId || status || exhausted) return;
    setSessionExpired(false);
    attemptsRef.current = 0;

    let stopped = false;

    const tick = async () => {
      if (stopped || statusRef.current) return;
      attemptsRef.current += 1;
      await poll();
      if (stopped) return;
      if (!statusRef.current && attemptsRef.current >= MAX_ATTEMPTS) {
        setExhausted(true);
      }
    };

    void tick();
    const interval = setInterval(() => {
      void tick();
    }, POLL_INTERVAL_MS);

    return () => {
      stopped = true;
      clearInterval(interval);
    };
  }, [isLoaded, isSignedIn, bookingId, status, exhausted, poll]);

  // Sin booking en la URL
  if (!bookingId) {
    return (
      <ResultShell>
        <AlertTriangle className="h-10 w-10 text-amber-500" />
        <ResultTitle>{t("home.paymentResult.invalidTitle")}</ResultTitle>
        <ResultText>{t("home.paymentResult.invalidDesc")}</ResultText>
        <ResultActions>
          <Button asChild>
            <Link href="/account/bookings">
              {t("home.paymentResult.viewBookings")}
            </Link>
          </Button>
        </ResultActions>
      </ResultShell>
    );
  }

  // Sesión de Clerk cargando (al volver del banco puede tardar)
  if (!isLoaded) {
    return (
      <ResultShell>
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </ResultShell>
    );
  }

  // Sin sesión (o expiró): iniciar sesión y continuar en la misma página
  if (!isSignedIn || sessionExpired) {
    return (
      <ResultShell>
        <Clock className="h-10 w-10 text-primary" />
        <ResultTitle>{t("home.paymentResult.signInTitle")}</ResultTitle>
        <ResultText>{t("home.paymentResult.signInDesc")}</ResultText>
        <ResultActions>
          <SignInButton mode="modal">
            <Button>{t("home.paymentResult.signIn")}</Button>
          </SignInButton>
        </ResultActions>
      </ResultShell>
    );
  }

  // Pago exitoso
  if (status === "paid") {
    return (
      <ResultShell>
        <CheckCircle2 className="h-14 w-14 text-green-500" />
        <ResultTitle>{t("home.paymentResult.paidTitle")}</ResultTitle>
        <ResultText>{t("home.paymentResult.paidDesc")}</ResultText>
        <ResultActions>
          <Button asChild>
            <Link href="/account/bookings">
              {t("home.paymentResult.viewBookings")}
            </Link>
          </Button>
        </ResultActions>
      </ResultShell>
    );
  }

  // Pago fallido
  if (status === "failed") {
    return (
      <ResultShell>
        <XCircle className="h-14 w-14 text-red-500" />
        <ResultTitle>{t("home.paymentResult.failedTitle")}</ResultTitle>
        <ResultText>{t("home.paymentResult.failedDesc")}</ResultText>
        <ResultActions>
          <Button asChild>
            <Link href="/account/bookings">
              {t("home.paymentResult.viewBookings")}
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/home">{t("home.paymentResult.goHome")}</Link>
          </Button>
        </ResultActions>
      </ResultShell>
    );
  }

  // Intentos agotados: el pago puede confirmarse después
  if (exhausted) {
    return (
      <ResultShell>
        <Clock className="h-14 w-14 text-amber-500" />
        <ResultTitle>{t("home.paymentResult.timeoutTitle")}</ResultTitle>
        <ResultText>{t("home.paymentResult.timeoutDesc")}</ResultText>
        <ResultActions>
          <Button asChild>
            <Link href="/account/bookings">
              {t("home.paymentResult.viewBookings")}
            </Link>
          </Button>
        </ResultActions>
      </ResultShell>
    );
  }

  // Confirmando
  return (
    <ResultShell>
      <Loader2 className="h-14 w-14 animate-spin text-primary" />
      <ResultTitle>{t("home.paymentResult.pending")}</ResultTitle>
      <ResultText>{t("home.paymentResult.pendingDesc")}</ResultText>
    </ResultShell>
  );
}

function ResultShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-16">
      <div className="flex w-full max-w-md flex-col items-center gap-3 rounded-2xl border bg-background p-8 text-center shadow-sm">
        {children}
      </div>
    </div>
  );
}

function ResultTitle({ children }: { children: React.ReactNode }) {
  return <h1 className="text-xl font-semibold">{children}</h1>;
}

function ResultText({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-muted-foreground">{children}</p>;
}

function ResultActions({ children }: { children: React.ReactNode }) {
  return <div className="mt-3 flex flex-wrap justify-center gap-2">{children}</div>;
}
