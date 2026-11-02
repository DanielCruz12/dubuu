import type { Metadata } from "next";
import { auth, clerkClient } from "@clerk/nextjs/server";
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
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  // Leer el rol en vivo: el token de sesión no incluye publicMetadata
  // salvo que se personalice en el Dashboard de Clerk, así que
  // sessionClaims no es fiable aquí (igual que en el middleware).
  let roles: string[] = [];
  try {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    roles = (user.publicMetadata?.roles as string[]) ?? [];
  } catch {
    roles = [];
  }
  if (!roles.includes("admin")) redirect("/dashboard");

  return <div className="min-h-screen bg-background">{children}</div>;
}
