"use client";

import type React from "react";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ModeToggle } from "@/components/mode-toggle";
import { useClerk } from "@clerk/nextjs";
import { MenuProfileSheet } from "./sidebar";
import { useClerkToken } from "@/components/providers/auth-provider";
import { RoleNavItem } from "@/types/dashboard-nav";
import Image from "next/image";
import {
  accountNavItems,
  adminDashboardItems,
  authenticatedHostOrAdminMenuItems,
  authenticatedUserMenuItems,
  commonDashboardItems,
  guestMenuItems,
  hostDashboardItems,
} from "@/utils/menu-options";
import { useGetUnreadCountQuery } from "@/redux/slices/messaging/messaging-slice";
// Selector de moneda deshabilitado por el momento
// import CurrencySelectorDrawer from "@/components/currency-selector";
import { LanguageSelector } from "@/components/language-selector";
import { useLanguage } from "@/lib/i18n-context";

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { user, signOut } = useClerk();
  const { role, hasRole } = useClerkToken();
  const { t } = useLanguage();

  const { data: unread } = useGetUnreadCountQuery(undefined, {
    skip: !user?.id,
  });
  const unreadCount = unread?.unreadCount ?? 0;

  // Home/landing (marketing) usa un header transparente que se superpone al hero
  // full-bleed y pasa a sólido al hacer scroll.
  const isLanding = pathname === "/";
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    if (!isLanding) return;
    const onScroll = () => setIsScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isLanding]);

  // Fix: Check exact path for /account as well as paths that start with /account/ or /dashboard/
  const isDashboard =
    pathname === "/account" ||
    pathname?.startsWith("/account/") ||
    pathname === "/dashboard" ||
    pathname?.startsWith("/dashboard/");

  // Determine which menu items to show
  let menuToRender = guestMenuItems;

  if (user) {
    if (role === "admin" || role === "host") {
      menuToRender = authenticatedHostOrAdminMenuItems.map((item) => {
        if (item.label === "Panel" && role === "admin") {
          return { ...item, href: "/dashboard/payouts" };
        }
        return item;
      });
    } else {
      menuToRender = authenticatedUserMenuItems;
    }
  }

  // For dashboard routes, we'll use a simplified header with the mobile sidebar
  if (isDashboard) {
    // Generate navigation items based on role
    let navItemsToUse: RoleNavItem[] = [];

    if (pathname === "/dashboard" || pathname?.startsWith("/dashboard/")) {
      // Start with common items
      navItemsToUse = [...commonDashboardItems];

      // Add admin items if user is admin
      if (hasRole("admin")) {
        navItemsToUse = [...navItemsToUse, ...adminDashboardItems];
      }

      // Add host items if user is host
      if (hasRole("host")) {
        navItemsToUse = [...navItemsToUse, ...hostDashboardItems];
      }
    } else {
      // For account routes
      navItemsToUse = accountNavItems;
    }

    return (
      <header className="top-0 z-40 w-full">
        <div className="flex h-16 items-center px-4 md:px-20">
          <MenuProfileSheet
            dashboardNavItems={navItemsToUse.map((item) => ({
              ...item,
              title: t(item.title),
            }))}
            open={open}
            setOpen={setOpen}
            pathname={pathname}
          />

          <div className="">
            <Link href="/home" className="flex items-center gap-1">
              <Image
                src="/logo.svg"
                priority
                alt="Dubuu Logo"
                width={100}
                height={40}
              />
            </Link>
          </div>

          <div className="ml-auto flex items-center gap-4">
            <ModeToggle />
            <LanguageSelector />
            {/* <CurrencySelectorDrawer /> */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user ? user.imageUrl : ""} />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="start" className="w-60 p-2">
                {user ? (
                  <>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {user.fullName}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.emailAddresses[0]?.emailAddress}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                  </>
                ) : (
                  <DropdownMenuItem asChild className="py-3">
                    <Link href="/sign-in" className="cursor-pointer w-full">
                      <Button
                        variant="outline"
                        className="w-full justify-center"
                      >
                        {t("common.login")}
                      </Button>
                    </Link>
                  </DropdownMenuItem>
                )}

                {menuToRender.map((item, index) => (
                  <DropdownMenuItem key={index} asChild className="py-3">
                    <Link href={item.href} className="flex items-center w-full">
                      <item.icon className="mr-2 h-4 w-4" />
                      <span>{item.label}</span>
                      {item.href.includes("/messages") && unreadCount > 0 && (
                        <Badge className="ml-auto h-5 min-w-5 justify-center rounded-full px-1.5 text-[11px]">
                          {unreadCount > 99 ? "99+" : unreadCount}
                        </Badge>
                      )}
                    </Link>
                  </DropdownMenuItem>
                ))}

                {user && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => signOut()}
                      className="cursor-pointer py-3"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>{t("common.logout")}</span>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
    );
  }

  // Rest of the component remains the same...
  const landingTransparent = isLanding && !isScrolled;

  return (
    <header
      className={
        isLanding
          ? `fixed top-0 inset-x-0 z-50 w-full transition-colors duration-300 ${
              landingTransparent
                ? "bg-transparent border-b border-transparent"
                : "bg-zinc-950/90 backdrop-blur-md border-b border-white/10"
            }`
          : "top-0 z-50 w-full"
      }
    >
      <div className="flex h-16 items-center md:px-20 px-4">
        <div className="flex items-center gap-2">
          <Link href={"/home"} className="flex items-center gap-1">
            <Image
              src="/logo.svg"
              priority
              alt="Dubuu Logo"
              width={100}
              height={40}
              className={isLanding ? "brightness-0 invert" : ""}
            />
          </Link>
        </div>

        <div
          className={`ml-auto flex items-center gap-4 ${
            isLanding ? "text-white [&_svg]:text-white" : ""
          }`}
        >
          <ModeToggle />
          <LanguageSelector
            triggerClassName={
              isLanding
                ? "bg-white/5 border-white/15 text-white hover:bg-white/10 hover:text-white"
                : undefined
            }
          />
          {/* <CurrencySelectorDrawer /> */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user ? user.imageUrl : ""} />
                  <AvatarFallback className="text-muted-foreground">
                    CN
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="start" className="w-60 p-2">
              {user ? (
                <>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.fullName}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.emailAddresses[0]?.emailAddress}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                </>
              ) : (
                <DropdownMenuItem asChild className="py-3">
                  <Link href="/sign-in" className="cursor-pointer w-full">
                    <Button variant="outline" className="w-full justify-center">
                      {t("common.login")}
                    </Button>
                  </Link>
                </DropdownMenuItem>
              )}

              {menuToRender.map((item, index) => (
                <DropdownMenuItem key={index} asChild className="py-3">
                  <Link href={item.href} className="flex items-center w-full">
                    <item.icon className="mr-2 h-4 w-4" />
                    <span>{item.label}</span>
                    {item.href.includes("/messages") && unreadCount > 0 && (
                      <Badge className="ml-auto h-5 min-w-5 justify-center rounded-full px-1.5 text-[11px]">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </Badge>
                    )}
                  </Link>
                </DropdownMenuItem>
              ))}

              {user && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => signOut()}
                    className="cursor-pointer py-3"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{t("common.logout")}</span>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
