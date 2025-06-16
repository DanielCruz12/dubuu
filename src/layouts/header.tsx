"use client";

import type React from "react";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

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

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { user, signOut } = useClerk();
  const { role, hasRole } = useClerkToken();

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
      menuToRender = authenticatedHostOrAdminMenuItems;
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
            dashboardNavItems={navItemsToUse}
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
                        Iniciar sesión
                      </Button>
                    </Link>
                  </DropdownMenuItem>
                )}

                {menuToRender.map((item, index) => (
                  <DropdownMenuItem key={index} asChild className="py-3">
                    <Link href={item.href} className="flex items-center">
                      <item.icon className="mr-2 h-4 w-4" />
                      <span>{item.label}</span>
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
                      <span>Cerrar sesión</span>
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
  return (
    <header className="top-0 z-50 w-full">
      <div className="flex h-16 items-center md:px-20 px-4">
        <div className="flex items-center gap-2">
          <Link href={"/home"} className="flex items-center gap-1">
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

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
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
                    <Button variant="outline" className="w-full justify-center">
                      Iniciar sesión
                    </Button>
                  </Link>
                </DropdownMenuItem>
              )}

              {menuToRender.map((item, index) => (
                <DropdownMenuItem key={index} asChild className="py-3">
                  <Link href={item.href} className="flex items-center">
                    <item.icon className="mr-2 h-4 w-4" />
                    <span>{item.label}</span>
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
                    <span>Cerrar sesión</span>
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
