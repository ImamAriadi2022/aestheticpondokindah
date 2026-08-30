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
  Store,
  BookOpen,
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

export const ETALASE_SUBMENU: MenuItem["submenu"] = [
  { label: "Edit Beranda", href: "/dashboard/clinic?tab=etalase-beranda" },
  { label: "Edit Tentang", href: "/dashboard/clinic?tab=etalase-tentang" },
];

export const CONTENT_SUBMENU: MenuItem["submenu"] = [
  { label: "Blog", href: "/dashboard/clinic?tab=content-blog" },
  { label: "Promo", href: "/dashboard/clinic?tab=content-promo" },
  { label: "Pop Up", href: "/dashboard/clinic?tab=content-popup" },
  { label: "Galeri", href: "/dashboard/clinic?tab=content-gallery" },
  { label: "Testimoni", href: "/dashboard/clinic?tab=content-testimonials" },
  { label: "Daftar Aplikasi Mobile", href: "/dashboard/clinic?tab=content-download" },
];

export const BOOKING_SUBMENU: MenuItem["submenu"] = [
  { label: "Booking", href: "/dashboard/clinic?tab=reservasi" },
  { label: "Konsultasi", href: "/dashboard/clinic?tab=konsultasi" },
  { label: "Pengaduan", href: "/dashboard/clinic?tab=pengaduan" },
];

export const USER_MANAGEMENT_SUBMENU: MenuItem["submenu"] = [
  { label: "Pengguna", href: "/dashboard/clinic?tab=users" },
  { label: "Dokter", href: "/dashboard/clinic?tab=doctors" },
  { label: "Membership", href: "/dashboard/clinic/membership" },
];

export const MENU: AppMenu = {
  root: {
    [ROLES.USER]: [
      { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard/user" },
      { label: "Konsultasi", icon: Calendar, href: "/dashboard/user?tab=konsultasi" },
      { label: "Pengaduan", icon: AlertCircle, href: "/dashboard/user?tab=pengaduan" },
      { label: "Panduan Pasien", icon: BookOpen, href: "/dashboard/user?tab=panduan" },
    ],
    [ROLES.CLINIC]: [
      { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard/clinic" },
      {
        label: "Etalase",
        icon: Store,
        href: "/dashboard/clinic?tab=etalase-beranda",
        submenu: ETALASE_SUBMENU,
      },
      {
        label: "Sistem Booking",
        icon: Calendar,
        href: "/dashboard/clinic?tab=reservasi",
        submenu: BOOKING_SUBMENU,
      },
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
      {
        label: "Pengaturan",
        icon: Settings,
        href: "/dashboard/clinic?tab=settings",
      },
      {
        label: "Panduan Admin",
        icon: BookOpen,
        href: "/dashboard/clinic?tab=panduan",
      },
    ],
    [ROLES.DOCTOR]: [
      { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard/doctor" },
      { label: "Jadwal Praktik", icon: Calendar, href: "/dashboard/doctor?tab=jadwal" },
      { label: "Daftar Pasien", icon: Users, href: "/dashboard/doctor?tab=reservasi" },
      { label: "Panduan Dokter", icon: BookOpen, href: "/dashboard/doctor?tab=panduan" },
    ],
    [ROLES.DEVELOPER]: [
      { label: "REST API Docs", icon: FileText, href: "/docs-api" },
    ],
  },
};

export function getMenuItems(role: Exclude<AppRole, "guest">): MenuItem[] {
  return MENU.root[role] ?? [];
}
