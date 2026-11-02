import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Administración",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId, sessionClaims } = await auth();
  if (!userId) redirect("/sign-in");
  const roles =
    ((sessionClaims?.publicMetadata as Record<string, unknown> | undefined)
      ?.roles as string[]) ?? [];
  if (!roles.includes("admin")) redirect("/dashboard");

  return <div className="min-h-screen bg-background">{children}</div>;
}
