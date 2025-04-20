// TypeScript interfaces for navigation items
export interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
}

export interface RoleNavItem extends NavItem {
  adminOnly?: boolean;
  hostOnly?: boolean;
}

export interface MenuNavItem {
  icon: React.ElementType;
  label: string;
  href: string;
}