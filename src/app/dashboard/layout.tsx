import type React from "react";
import { SideNav } from "./(components)/side-nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="md:grid md:grid-cols-[220px_minmax(0,1fr)] lg:grid-cols-[240px_minmax(0,1fr)] px-3 md:px-14">
      <aside className="fixed z-30 hidden  w-full shrink-0 md:sticky md:block">
        <SideNav />
      </aside>
      <main className="flex w-full flex-col overflow-hidden px-2 md:px-5">
        <div>{children}</div>
      </main>
    </div>
  );
}
