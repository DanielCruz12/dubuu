"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { useClerkToken } from "@/components/providers/auth-provider";
import { Loader2 } from "lucide-react";
import {
  accountNavItems,
  commonDashboardItems,
  adminDashboardItems,
  hostDashboardItems,
} from "./header";
import { useEffect, useState } from "react";

export function SideNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { hasRole, isLoadingRole } = useClerkToken();
  const [navItems, setNavItems] = useState(accountNavItems)


 // Handle all redirects and navigation items in a single useEffect
 useEffect(() => {
  if (isLoadingRole) return

  // Determine which navigation items to show based on the role
  let items = accountNavItems

  // If user is admin or host
  if (hasRole("admin") || hasRole("host")) {
    // Start with common items
    items = [...commonDashboardItems]

    // Add admin items if user is admin
    if (hasRole("admin")) {
      items = [...items, ...adminDashboardItems]
    }

    // Add host items if user is host
    if (hasRole("host")) {
      items = [...items, ...hostDashboardItems]
    }

    // Redirect from account to dashboard if needed
    if (pathname?.startsWith("/account")) {
      router.push("/dashboard")
      return
    }
  } else if (pathname?.startsWith("/dashboard/")) {
    // Regular users shouldn't see dashboard items, redirect them
    router.push("/account")
    return
  }

  // Update nav items state
  setNavItems(items)
}, [isLoadingRole, hasRole, pathname, router])

if (isLoadingRole) {
  return (
    <div className="flex flex-col justify-start gap-4 pr-4 items-center py-4">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      <p className="text-sm text-muted-foreground">Cargando...</p>
    </div>
  )
}

  return (
    <nav className="flex flex-col justify-start gap-4 pr-4">
      {navItems.map((item) => {
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
