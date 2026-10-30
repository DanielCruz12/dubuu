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
  LayoutDashboardIcon,
  User2,
  Tags,
  Wallet,
  MessageCircle,
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
    icon: MessageCircle,
    label: "Mensajes",
    href: "/account/messages",
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
    icon: MessageCircle,
    label: "Mensajes",
    href: "/dashboard/messages",
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
    title: "dashboard.nav.profile",
    href: "/account/profile",
    icon: <User className="h-4 w-4 mr-2" />,
  },
  {
    title: "dashboard.nav.myBookings",
    href: "/account/bookings",
    icon: <CalendarDays className="h-4 w-4 mr-2" />,
  },
  {
    title: "messaging.title",
    href: "/account/messages",
    icon: <MessageCircle className="h-4 w-4 mr-2" />,
  },
  {
    title: "dashboard.nav.saved",
    href: "/account/saved",
    icon: <Bookmark className="h-4 w-4 mr-2" />,
  },
];

// Common dashboard items for all roles
export const commonDashboardItems: NavItem[] = [
  {
    title: "dashboard.nav.profile",
    href: "/dashboard/profile",
    icon: <User className="h-4 w-4 mr-2" />,
  },
];

// Admin-only dashboard items
export const adminDashboardItems: NavItem[] = [
  {
    title: "Productos",
    href: "/dashboard/admin-products",
    icon: <List className="h-4 w-4 mr-2" />,
  },
  {
    title: "Catálogos",
    href: "/dashboard/catalog",
    icon: <Tags className="h-4 w-4 mr-2" />,
  },
  {
    title: "Pagos",
    href: "/dashboard/payouts",
    icon: <Wallet className="h-4 w-4 mr-2" />,
  },
];

// Host-only dashboard items
export const hostDashboardItems: NavItem[] = [
  {
    title: "dashboard.nav.dashboard",
    href: "/dashboard",
    icon: <LayoutDashboardIcon className="h-4 w-4 mr-2" />,
  },
  {
    title: "dashboard.nav.bookings",
    href: "/dashboard/bookings",
    icon: <CalendarDays className="h-4 w-4 mr-2" />,
  },
  {
    title: "messaging.title",
    href: "/dashboard/messages",
    icon: <MessageCircle className="h-4 w-4 mr-2" />,
  },
  {
    title: "dashboard.nav.products",
    href: "/dashboard/products",
    icon: <List className="h-4 w-4 mr-2" />,
  },
  {
    title: "dashboard.nav.payments",
    href: "/dashboard/payments",
    icon: <CreditCard className="h-4 w-4 mr-2" />,
  },
  {
    title: "dashboard.nav.saved",
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
