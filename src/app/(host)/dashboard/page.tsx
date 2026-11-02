import { DashboardContent } from "./(components)/dashboard-content";
import { Metadata } from "next";
import { auth, clerkClient } from "@clerk/nextjs/server";
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
  const { userId } = await auth();
  // Rol en vivo: sessionClaims no trae publicMetadata por defecto.
  let roles: string[] = [];
  if (userId) {
    try {
      const client = await clerkClient();
      const user = await client.users.getUser(userId);
      roles = (user.publicMetadata?.roles as string[]) ?? [];
    } catch {
      roles = [];
    }
  }

  if (roles.includes("admin")) {
    redirect("/dashboard/payouts");
  }

  return <DashboardContent />;
}
