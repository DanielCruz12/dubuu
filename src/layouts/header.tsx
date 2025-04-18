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
import { NavItem } from "@/types/dashboard-nav";

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { user, signOut } = useClerk();
  const isDashboard = pathname?.startsWith("/dashboard");
  const isAdmin = true; //! modified for role

  // Choose which menu to render based on authentication status
  const menuToRender = user ? authenticatedMenuItems : guestMenuItems;

  // For dashboard routes, we'll use a simplified header with the mobile sidebar
  if (isDashboard) {
    return (
      <header className="top-0 z-40 w-full">
        <div className="flex h-16 items-center px-4 md:px-20">
          <MenuProfileSheet
            dashboardNavItems={dashboardNavItems}
            isAdmin={isAdmin}
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

// Menu items for authenticated users
const authenticatedMenuItems = [
  {
    icon: LayoutDashboard,
    label: "Panel",
    href: "/dashboard",
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

// Menu items for guests
const guestMenuItems = [
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

export const dashboardNavItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard className="h-4 w-4 mr-2" />,
  },
  {
    title: "Mis Reservas",
    href: "/dashboard/bookings",
    icon: <CalendarDays className="h-4 w-4 mr-2" />,
  },
  {
    title: "Perfil",
    href: "/dashboard/profile",
    icon: <User className="h-4 w-4 mr-2" />,
  },
  {
    title: "Pagos",
    href: "/dashboard/payments",
    icon: <CreditCard className="h-4 w-4 mr-2" />,
  },
  {
    title: "Productos",
    href: "/dashboard/admin/product-list",
    icon: <List className="h-4 w-4 mr-2" />,
    adminOnly: true,
  },
];
