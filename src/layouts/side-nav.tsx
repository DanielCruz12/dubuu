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
import { useEffect } from "react";

export function SideNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { hasRole, isLoadingRole } = useClerkToken();

  // Redirect admins and hosts from /account to /dashboard
  useEffect(() => {
    if (
      !isLoadingRole &&
      (hasRole("admin") || hasRole("host")) &&
      pathname?.startsWith("/account")
    ) {
      router.push("/dashboard");
    }
  }, [isLoadingRole, hasRole, pathname, router]);

  // Determine which navigation items to show based on the role
  let navItems = accountNavItems;

  // If user is admin or host, show dashboard items
  if (hasRole("admin") || hasRole("host")) {
    // Start with common items
    navItems = [...commonDashboardItems];

    // Add admin items if user is admin
    if (hasRole("admin")) {
      navItems = [...navItems, ...adminDashboardItems];
    }

    // Add host items if user is host
    if (hasRole("host")) {
      navItems = [...navItems, ...hostDashboardItems];
    }
  } else if (pathname?.startsWith("/dashboard/")) {
    // Regular users shouldn't see dashboard items, redirect them
    router.push("/account");
  }

  if (isLoadingRole) {
    return (
      <div className="flex flex-col justify-start gap-4 pr-4 items-center py-4">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Loading navigation...</p>
      </div>
    );
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
