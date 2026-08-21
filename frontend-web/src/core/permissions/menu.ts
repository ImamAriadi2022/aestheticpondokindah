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
  Settings,
} from "lucide-react";
import { ROLES, type AppRole } from "@/core/permissions/roles";

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
  { label: "Daftar Aplikasi Mobile", href: "/dashboard/clinic?tab=content-download" },
];

const BOOKING_SUBMENU: MenuItem["submenu"] = [
  { label: "Reservasi", href: "/dashboard/clinic?tab=reservasi" },
  { label: "Konsultasi", href: "/dashboard/clinic?tab=konsultasi" },
];

const USER_MANAGEMENT_SUBMENU: MenuItem["submenu"] = [
  { label: "Daftar Pengguna", href: "/dashboard/clinic?tab=users" },
  { label: "Membership", href: "/dashboard/clinic/membership" },
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
      {
        label: "Sistem Booking",
        icon: Calendar,
        href: "/dashboard/clinic?tab=reservasi",
        submenu: BOOKING_SUBMENU,
      },
      { label: "Pengaduan", icon: AlertCircle, href: "/dashboard/clinic?tab=pengaduan" },
      {
        label: "Konten",
        icon: FileText,
        href: "/dashboard/clinic?tab=content-blog",
        submenu: CONTENT_SUBMENU,
      },
      {
        label: "Kelola Pengguna",
        icon: Users,
        href: "/dashboard/clinic?tab=users",
        submenu: USER_MANAGEMENT_SUBMENU,
      },
      { label: "Dokter", icon: Stethoscope, href: "/dashboard/clinic?tab=doctors" },
      { label: "Pengaturan Klinik", icon: FileText, href: "/dashboard/clinic?tab=settings" },
    ],
    [ROLES.DOCTOR]: [
      { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard/doctor" },
      { label: "Jadwal Praktik", icon: Calendar, href: "/dashboard/doctor?tab=jadwal" },
      { label: "Daftar Pasien", icon: Users, href: "/dashboard/doctor?tab=reservasi" },
    ],
  },
};

export function getMenuItems(role: Exclude<AppRole, "guest">): MenuItem[] {
  return MENU.root[role] ?? [];
}
