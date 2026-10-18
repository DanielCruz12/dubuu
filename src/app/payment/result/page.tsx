import type { Metadata } from "next";
import PaymentResultContent from "./payment-result-content";

export const metadata: Metadata = {
  title: "Estado del pago | Dubuu",
};

/**
 * Pantalla de resultado de pago. El backend (Wompi 3DS) redirige aquí al
 * terminar el flujo del banco; Blink navega aquí al confirmarse el pago.
 * NO confía en query params de Wompi: solo consulta el estado al backend.
 */
export default function PaymentResultPage({
  searchParams,
}: {
  searchParams: { booking?: string };
}) {
  const bookingId =
    typeof searchParams?.booking === "string" ? searchParams.booking : "";

  return <PaymentResultContent bookingId={bookingId} />;
}
