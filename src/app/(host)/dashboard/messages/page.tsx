import type { Metadata } from "next";
import { MessagingView } from "@/components/messaging/messaging-view";

export const metadata: Metadata = {
  title: "Mensajes | Dubuu",
};

/** Chat anfitrión ↔ viajero. `?booking=<id>` abre un chat directo (push). */
export default function DashboardMessagesPage({
  searchParams,
}: {
  searchParams: { booking?: string };
}) {
  const bookingId =
    typeof searchParams?.booking === "string" ? searchParams.booking : null;

  return (
    <MessagingView
      activeBookingId={bookingId}
      basePath="/dashboard/messages"
      bookingsPath="/dashboard/bookings"
      isHostView
    />
  );
}
