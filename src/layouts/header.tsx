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
  Menu,
  CalendarDays,
  User,
  CreditCard,
  List,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
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

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
}

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const { user, signOut } = useClerk();

  // Check if we're in the dashboard section
  const isDashboard = pathname?.startsWith("/dashboard");

  // Simular que el usuario es admin para mostrar todas las opciones
  const isAdmin = true;

  // Dashboard navigation items
  const dashboardNavItems: NavItem[] = [
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
      href: "/investment",
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

  // Choose which menu to render based on authentication status
  const menuToRender = user ? authenticatedMenuItems : guestMenuItems;

  // For dashboard routes, we'll use a simplified header with the mobile sidebar
  if (isDashboard) {
    return (
      <header className="top-0 z-40 w-full">
        <div className="flex h-16 items-center px-5 md:px-20">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden mr-2"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="pr-0">
              <div className="mb-4 flex items-center">
                <MapPin className="h-5 w-5 text-primary" />
                <span className="font-bold">Dan&apos;s Tours</span>
              </div>
              <ScrollArea className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
                <div className="flex flex-col space-y-6">
                  {dashboardNavItems.map((item) => {
                    // Ocultar elementos de administrador si el usuario no es admin
                    if (item.adminOnly && !isAdmin) return null;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center text-sm font-medium",
                          pathname === item.href
                            ? "text-primary"
                            : "text-muted-foreground"
                        )}
                        onClick={() => setOpen(false)}
                      >
                        {item.icon}
                        {item.title}
                      </Link>
                    );
                  })}
                </div>
              </ScrollArea>
            </SheetContent>
          </Sheet>

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
