import { DashboardContent } from "./(components)/dashboard-content";
import { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Panel de Control",
  description: "Bienvenido a tu panel de control",
  robots: {
    index: false,
    follow: true,
  },
};

export default async function DashboardPage() {
  const { sessionClaims } = await auth();
  const metadata = sessionClaims?.publicMetadata as Record<string, unknown> | undefined;
  const roles = (metadata?.roles as string[]) ?? [];

  if (roles.includes("admin")) {
    redirect("/dashboard/payouts");
  }

  return <DashboardContent />;
}
