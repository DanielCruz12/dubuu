"use client";

import type React from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import {
  LayoutDashboard,
  CalendarDays,
  User,
  CreditCard,
  List,
} from "lucide-react";

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
}

export function SideNav() {
  const pathname = usePathname();

  // Simular que el usuario es admin para mostrar todas las opciones
  const isAdmin = true;

  const navItems: NavItem[] = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard className="h-4 w-4" />,
    },
    {
      title: "Mis Reservas",
      href: "/dashboard/bookings",
      icon: <CalendarDays className="h-4 w-4" />,
    },
    {
      title: "Perfil",
      href: "/dashboard/profile",
      icon: <User className="h-4 w-4" />,
    },
    {
      title: "Pagos",
      href: "/dashboard/payments",
      icon: <CreditCard className="h-4 w-4" />,
    },

    {
      title: "Productos",
      href: "/dashboard/admin/product-list",
      icon: <List className="h-4 w-4" />,
      adminOnly: true,
    },
  ];

  return (
    <nav className="flex flex-col justify-start gap-5 mr-5 ">
      {navItems.map((item) => {
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
