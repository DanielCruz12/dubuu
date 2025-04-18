"use client";

import type React from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { dashboardNavItems } from "@/layouts/header";


export function SideNav() {
  const pathname = usePathname();
  const isAdmin = true; //! modified for role

  return (
    <nav className="flex flex-col justify-start gap-4 mr-4">
      {dashboardNavItems.map((item) => {
        // Ocultar elementos de administrador si el usuario no es admin
        if (item.adminOnly && !isAdmin) return null;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              buttonVariants({ variant: "ghost" }),
              pathname === item.href
                ? "bg-muted hover:bg-muted"
                : "hover:bg-transparent hover:underline",
              "justify-start"
            )}
          >
            {item.icon}
            {item.title}
          </Link>
        );
      })}
    </nav>
  );
}