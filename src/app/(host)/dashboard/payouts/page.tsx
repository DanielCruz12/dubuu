import type { Metadata } from "next";
import { PayoutsContent } from "./(components)/payouts-content";

export const metadata: Metadata = {
  title: "Pagos y Ganancias",
  description: "Administra los pagos a hosts y revisa tus ganancias",
};

export default function PayoutsPage() {
  return <PayoutsContent />;
}
