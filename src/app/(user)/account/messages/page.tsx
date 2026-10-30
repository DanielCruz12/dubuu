import type { Metadata } from "next";
import { MessagingView } from "@/components/messaging/messaging-view";

export const metadata: Metadata = {
  title: "Mensajes | Dubuu",
};

/** Chat viajero ↔ anfitrión. `?booking=<id>` abre un chat directo (push). */
export default function AccountMessagesPage({
  searchParams,
}: {
  searchParams: { booking?: string };
}) {
  const bookingId =
    typeof searchParams?.booking === "string" ? searchParams.booking : null;

  return (
    <MessagingView
      activeBookingId={bookingId}
      basePath="/account/messages"
      bookingsPath="/account/bookings"
      isHostView={false}
    />
  );
}
