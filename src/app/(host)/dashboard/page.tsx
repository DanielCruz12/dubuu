import { DashboardContent } from "./(components)/dashboard-content";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Panel de Control",
  description: "Bienvenido a tu panel de control",
  robots: {
    index: false,
    follow: true,
  },
};

export default function DashboardPage() {
  return <DashboardContent />;
}
