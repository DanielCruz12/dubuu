import {
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
  LayoutDashboardIcon,
  User2,
} from "lucide-react";
import { MenuNavItem, NavItem, RoleNavItem } from "@/types/dashboard-nav";

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
    icon: Handshake,
    label: "¿Quieres ser parte?",
    href: "/contact",
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
    icon: Home,
    label: "Inicio",
    href: "/home",
  },
  {
    icon: User2,
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
    title: "Panel",
    href: "/dashboard",
    icon: <LayoutDashboardIcon className="h-4 w-4 mr-2" />,
  },
  {
    title: "Reservas",
    href: "/dashboard/bookings",
    icon: <CalendarDays className="h-4 w-4 mr-2" />,
  },
  {
    title: "Productos",
    href: "/dashboard/products",
    icon: <List className="h-4 w-4 mr-2" />,
  },
  {
    title: "Pagos",
    href: "/dashboard/payments",
    icon: <CreditCard className="h-4 w-4 mr-2" />,
  },
  {
    title: "Guardados",
    href: "/dashboard/saved",
    icon: <Bookmark className="h-4 w-4 mr-2" />,
  },
];

// Combined dashboard items with role flags (for backward compatibility)
export const dashboardNavItems: RoleNavItem[] = [
  ...commonDashboardItems,
  ...adminDashboardItems.map((item) => ({ ...item, adminOnly: true })),
  ...hostDashboardItems.map((item) => ({ ...item, hostOnly: true })),
];
