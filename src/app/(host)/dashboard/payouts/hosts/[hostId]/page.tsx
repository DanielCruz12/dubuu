import type { Metadata } from "next";
import { HostPaymentDetailsContent } from "../../(components)/host-detail/host-detail-content";

export const metadata: Metadata = {
  title: "Host Payment Details",
  description: "Detalle de pagos del host",
};

export default function HostPaymentDetailsPage({
  params,
}: {
  params: { hostId: string };
}) {
  return <HostPaymentDetailsContent hostId={params.hostId} />;
}
