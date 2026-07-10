import type React from "react";
import type { Metadata } from "next";
import { SideNav } from "@/layouts/side-nav";

// Área privada detrás de autenticación: no debe indexarse. Las páginas hijas
// pueden fijar su propio título/descripción sin perder este noindex.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="md:grid md:grid-cols-[220px_minmax(0,1fr)] lg:grid-cols-[240px_minmax(0,1fr)] px-2 md:px-20 min-h-screen">
      <aside className="z-30 hidden shrink-0 md:block md:sticky md:top-4 md:self-start md:max-h-[calc(100dvh-2rem)] md:overflow-y-auto">
        <SideNav />
      </aside>
      <main className="flex w-full min-w-0 flex-col pb-6">
        <div>{children}</div>
      </main>
    </div>
  );
}
