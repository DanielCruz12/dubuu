"use client";

import type React from "react";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MapPin,
  LogOut,
  Rss,
  Handshake,
  Info,
  LayoutDashboard,
  Home,
  CalendarDays,
  User,
  CreditCard,
  List,
  Bookmark,
  Settings,
  Users,
} from "lucide-react";
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
import { MenuNavItem, NavItem, RoleNavItem } from "@/types/dashboard-nav";

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
              <MapPin className="h-5 w-5 text-primary" />
              <span className="font-bold">Dan&apos;s Tours</span>
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
                    {user ? (
                      <AvatarImage
                        src={user.imageUrl || "/placeholder.svg"}
                        alt={user.fullName || "User"}
                        onError={(e) => {
                          // Fallback if image fails to load
                          const target = e.target as HTMLImageElement;
                          target.src = "/placeholder.svg";
                        }}
                      />
                    ) : (
                      <AvatarImage src="/placeholder.svg" alt="Guest" />
                    )}
                    <AvatarFallback>
                      {user ? user.firstName?.[0] : "G"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="start" className="w-56">
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
                    <DropdownMenuItem asChild className="cursor-pointer py-3">
                      <Link href="/home">
                        <Home className="mr-2 h-4 w-4" />
                        <span>Inicio</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer py-3">
                      <Link href="/investment">
                        <Handshake className="mr-2 h-4 w-4" />
                        <span>¿Quieres ser parte?</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer py-3">
                      <Link href="/blog">
                        <Rss className="mr-2 h-4 w-4" />
                        <span>Blog</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => signOut()}
                      className="cursor-pointer"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Cerrar sesión</span>
                    </DropdownMenuItem>
                  </>
                ) : (
                  <DropdownMenuItem asChild>
                    <Link href="/sign-in" className="cursor-pointer w-full">
                      Iniciar sesión
                    </Link>
                  </DropdownMenuItem>
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
            <MapPin className="h-5 w-5 text-primary" />
            <span className="font-bold">Dan&apos;s Tours</span>
          </Link>
        </div>

        <div className="ml-auto flex items-center gap-4">
          <ModeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  {user ? (
                    <AvatarImage
                      src={user.imageUrl || "/placeholder.svg"}
                      alt={user.fullName || "User"}
                      onError={(e) => {
                        // Fallback if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.src = "/placeholder.svg";
                      }}
                    />
                  ) : (
                    <AvatarImage src="/placeholder.svg" alt="Guest" />
                  )}
                  <AvatarFallback>
                    {user ? user.firstName?.[0] : "G"}
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

// Menu items for guests
export const guestMenuItems: MenuNavItem[] = [
  {
    icon: Home,
    label: "Inicio",
    href: "/home",
  },
  {
    icon: Info,
    label: "Centro de ayuda",
    href: "/support",
  },
  {
    icon: Rss,
    label: "Blog",
    href: "/blog",
  },
];

// Menu items for authenticated users (Dropdown)
export const authenticatedUserMenuItems: MenuNavItem[] = [
  {
    icon: LayoutDashboard,
    label: "Cuenta",
    href: "/account",
  },
  {
    icon: Handshake,
    label: "¿Quieres ser parte?",
    href: "/contact",
  },
  {
    icon: Info,
    label: "Centro de ayuda",
    href: "/support",
  },
  {
    icon: Rss,
    label: "Blog",
    href: "/blog",
  },
];

// Menu items for hosts/admins (Dropdown)
export const authenticatedHostOrAdminMenuItems: MenuNavItem[] = [
  {
    icon: LayoutDashboard,
    label: "Panel",
    href: "/dashboard",
  },
  {
    icon: Info,
    label: "Centro de ayuda",
    href: "/support",
  },
  {
    icon: Rss,
    label: "Blog",
    href: "/blog",
  },
];

// SideNav for normal users (/account)
export const accountNavItems: NavItem[] = [
  {
    title: "Perfil",
    href: "/account/profile",
    icon: <User className="h-4 w-4 mr-2" />,
  },
  {
    title: "Mis reservas",
    href: "/account/bookings",
    icon: <CalendarDays className="h-4 w-4 mr-2" />,
  },
  {
    title: "Guardados",
    href: "/account/saved",
    icon: <Bookmark className="h-4 w-4 mr-2" />,
  },
];

// Common dashboard items for all roles
export const commonDashboardItems: NavItem[] = [
  {
    title: "Perfil",
    href: "/dashboard/profile",
    icon: <User className="h-4 w-4 mr-2" />,
  },
];

// Admin-only dashboard items
export const adminDashboardItems: NavItem[] = [
  {
    title: "Usuarios",
    href: "/dashboard/users",
    icon: <Users className="h-4 w-4 mr-2" />,
  },
  {
    title: "Configuración",
    href: "/dashboard/settings",
    icon: <Settings className="h-4 w-4 mr-2" />,
  },
];

// Host-only dashboard items
export const hostDashboardItems: NavItem[] = [
  {
    title: "Mis Reservas",
    href: "/dashboard/bookings",
    icon: <CalendarDays className="h-4 w-4 mr-2" />,
  },
  {
    title: "Pagos",
    href: "/dashboard/payments",
    icon: <CreditCard className="h-4 w-4 mr-2" />,
  },
  {
    title: "Productos",
    href: "/dashboard/products",
    icon: <List className="h-4 w-4 mr-2" />,
  },
];

// Combined dashboard items with role flags (for backward compatibility)
export const dashboardNavItems: RoleNavItem[] = [
  ...commonDashboardItems,
  ...adminDashboardItems.map((item) => ({ ...item, adminOnly: true })),
  ...hostDashboardItems.map((item) => ({ ...item, hostOnly: true })),
];
