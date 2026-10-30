"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useClerkToken } from "@/components/providers/auth-provider";
import { useUser } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";
import {
  accountNavItems,
  commonDashboardItems,
  adminDashboardItems,
  hostDashboardItems,
} from "@/utils/menu-options";
import { useGetUnreadCountQuery } from "@/redux/slices/messaging/messaging-slice";
import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/i18n-context";

export function SideNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { hasRole, isLoadingRole } = useClerkToken();
  const { user } = useUser();
  const [navItems, setNavItems] = useState(accountNavItems);
  const { t } = useLanguage();

  const { data: unread } = useGetUnreadCountQuery(undefined, {
    skip: !user?.id,
  });
  const unreadCount = unread?.unreadCount ?? 0;

  // Handle all redirects and navigation items in a single useEffect
  useEffect(() => {
    if (isLoadingRole) return;

    // Determine which navigation items to show based on the role
    let items = accountNavItems;

    // If user is admin or host
    if (hasRole("admin") || hasRole("host")) {
      // Start with common items
      items = [...commonDashboardItems];

      // Add admin items if user is admin
      if (hasRole("admin")) {
        items = [...items, ...adminDashboardItems];
      }

      // Add host items if user is host
      if (hasRole("host")) {
        items = [...items, ...hostDashboardItems];
      }

      // Redirect from account to dashboard if needed
      if (pathname?.startsWith("/account")) {
        router.push("/dashboard");
        return;
      }
    } else if (pathname?.startsWith("/dashboard/")) {
      // Regular users shouldn't see dashboard items, redirect them
      router.push("/account");
      return;
    }

    // Update nav items state
    setNavItems(items);
  }, [isLoadingRole, hasRole, pathname, router]);

  if (isLoadingRole) {
    return (
      <div className="flex flex-col justify-start gap-4 pr-4 items-center py-4">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  return (
    <nav className="flex flex-col justify-start gap-4 pr-4">
      {navItems.map((item) => {
        const showUnread =
          item.href.endsWith("/messages") && unreadCount > 0;
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
            {t(item.title)}
            {showUnread && (
              <Badge className="ml-auto h-5 min-w-5 justify-center rounded-full px-1.5 text-[11px]">
                {unreadCount > 99 ? "99+" : unreadCount}
              </Badge>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
