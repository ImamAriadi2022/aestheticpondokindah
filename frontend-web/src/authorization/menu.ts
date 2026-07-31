import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Calendar,
  Users,
  FileText,
  MessageSquare,
  AlertCircle,
  Stethoscope,
  Crown,
} from "lucide-react";
import { ROLES, type AppRole } from "./roles";

export interface MenuItem {
  label: string;
  icon: LucideIcon;
  href: string;
  badge?: number;
  submenu?: { label: string; href: string }[];
}

export interface AppMenu {
  root: Record<Exclude<AppRole, "guest">, MenuItem[]>;
}

export const CONTENT_SUBMENU: MenuItem["submenu"] = [
  { label: "Blog", href: "/dashboard/clinic?tab=content-blog" },
  { label: "Promo", href: "/dashboard/clinic?tab=content-promo" },
  { label: "Pop Up", href: "/dashboard/clinic?tab=content-popup" },
  { label: "Galeri", href: "/dashboard/clinic?tab=content-gallery" },
  { label: "Testimoni", href: "/dashboard/clinic?tab=content-testimonials" },
  { label: "Download App", href: "/dashboard/clinic?tab=content-download" },
];

export const MENU: AppMenu = {
  root: {
    [ROLES.USER]: [
      { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard/user" },
      { label: "Konsultasi", icon: Calendar, href: "/dashboard/user?tab=konsultasi" },
      { label: "Pengaduan", icon: AlertCircle, href: "/dashboard/user?tab=pengaduan" },
    ],
    [ROLES.CLINIC]: [
      { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard/clinic" },
      { label: "Reservasi", icon: Calendar, href: "/dashboard/clinic?tab=reservasi" },
      { label: "Konsultasi", icon: MessageSquare, href: "/dashboard/clinic?tab=konsultasi" },
      { label: "Pengaduan", icon: AlertCircle, href: "/dashboard/clinic?tab=pengaduan" },
      {
        label: "Konten",
        icon: FileText,
        href: "/dashboard/clinic?tab=content-blog",
        submenu: CONTENT_SUBMENU,
      },
      { label: "Pengguna", icon: Users, href: "/dashboard/clinic?tab=users" },
      { label: "Membership", icon: Crown, href: "/dashboard/clinic/membership" },
      { label: "Dokter", icon: Stethoscope, href: "/dashboard/clinic?tab=doctors" },
    ],
    [ROLES.DOCTOR]: [
      { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard/doctor" },
      { label: "Jadwal", icon: Calendar, href: "/dashboard/doctor?tab=jadwal" },
      { label: "Klien", icon: Users, href: "/dashboard/doctor?tab=klien", badge: 3 },
    ],
  },
};

export function getMenuItems(role: Exclude<AppRole, "guest">): MenuItem[] {
  return MENU.root[role] ?? [];
}
