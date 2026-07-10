import type React from "react";
import type { Metadata } from "next";
import { SideNav } from "@/layouts/side-nav";

// Área privada detrás de autenticación: no debe indexarse.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="md:grid md:grid-cols-[220px_minmax(0,1fr)] lg:grid-cols-[240px_minmax(0,1fr)] px-2 md:px-20 min-h-screen">
      <aside className="fixed z-30 hidden w-full shrink-0 md:sticky md:block">
        <SideNav />
      </aside>
      <main className="flex w-full flex-col overflow-hidden pb-6">
        <div>{children}</div>
      </main>
    </div>
  );
}
