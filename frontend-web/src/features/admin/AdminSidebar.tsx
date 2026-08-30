import { useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router";
import {
  LayoutDashboard,
  Calendar,
  Users,
  FileText,
  AlertCircle,
  Stethoscope,
  Settings,
  Building2,
  MessageSquare,
  Sparkles,
  ChevronRight,
  ChevronDown,
  HelpCircle,
  Bell,
  Download,
  Image,
  Quote,
  Info,
  Shield,
  Layers,
  Store,
  Home,
} from "lucide-react";

type Props = {
  activeTab: string;
  onSelectTab?: (tab: string) => void;
};

export default function AdminSidebar({ activeTab }: Props) {
  const [searchParams] = useSearchParams();
  const currentTab = searchParams.get("tab") || activeTab || "dashboard";

  const publicInfoTabs = [
    "public-services",
    "public-faqs",
    "public-about",
    "public-legal",
  ];

  const contentTabs = [
    "content-popup",
    "content-promo",
    "content-blog",
    "content-gallery",
    "content-testimonials",
    "content-download",
  ];

  const etalaseTabs = [
    "etalase-beranda",
    "etalase-tentang",
  ];

  const isPublicInfoActive = publicInfoTabs.includes(currentTab);
  const [isPublicInfoOpen, setIsPublicInfoOpen] = useState(true);

    const navGroups = useMemo(
    () => [
      {
        title: "Utama",
        items: [
          {
            id: "dashboard",
            label: "Dashboard & Analytics",
            icon: LayoutDashboard,
            href: "/dashboard/clinic?tab=dashboard",
          },
        ],
      },
      {
        title: "Etalase (CMS Website)",
        items: [
          {
            id: "etalase-beranda",
            label: "Edit Beranda",
            icon: Home,
            href: "/dashboard/clinic?tab=etalase-beranda",
          },
          {
            id: "etalase-tentang",
            label: "Edit Tentang",
            icon: Info,
            href: "/dashboard/clinic?tab=etalase-tentang",
          },
        ],
      },
      {
        title: "Sistem Booking",
        items: [
          {
            id: "reservasi",
            label: "Booking (Reservasi)",
            icon: Calendar,
            href: "/dashboard/clinic?tab=reservasi",
          },
          {
            id: "konsultasi",
            label: "Konsultasi Pasien",
            icon: MessageSquare,
            href: "/dashboard/clinic?tab=konsultasi",
          },
          {
            id: "pengaduan",
            label: "Pengaduan Pasien",
            icon: AlertCircle,
            href: "/dashboard/clinic?tab=pengaduan",
          },
        ],
      },
      {
        title: "Konten & Promosi",
        items: [
          {
            id: "content-popup",
            label: "Pop Up Promo",
            icon: Sparkles,
            href: "/dashboard/clinic?tab=content-popup",
          },
          {
            id: "content-promo",
            label: "Katalog Promo",
            icon: FileText,
            href: "/dashboard/clinic?tab=content-promo",
          },
          {
            id: "content-blog",
            label: "Artikel & Blog",
            icon: FileText,
            href: "/dashboard/clinic?tab=content-blog",
          },
          {
            id: "content-gallery",
            label: "Galeri Klinik",
            icon: Image,
            href: "/dashboard/clinic?tab=content-gallery",
          },
          {
            id: "content-testimonials",
            label: "Testimoni Pasien",
            icon: Quote,
            href: "/dashboard/clinic?tab=content-testimonials",
          },
          {
            id: "content-download",
            label: "Daftar Aplikasi Mobile",
            icon: Download,
            href: "/dashboard/clinic?tab=content-download",
          },
        ],
      },
      {
        title: "Kelola Pengguna",
        items: [
          {
            id: "users",
            label: "Pengguna",
            icon: Users,
            href: "/dashboard/clinic?tab=users",
          },
          {
            id: "doctors",
            label: "Dokter",
            icon: Stethoscope,
            href: "/dashboard/clinic?tab=doctors",
          },
          {
            id: "membership",
            label: "Keanggotaan (Membership)",
            icon: Sparkles,
            href: "/dashboard/clinic/membership",
          },
          {
            id: "branches",
            label: "Cabang Klinik",
            icon: Building2,
            href: "/dashboard/clinic?tab=branches",
          },
        ],
      },
      {
        title: "Informasi Publik",
        items: [
          {
            id: "public-services",
            label: "Katalog Layanan",
            icon: Layers,
            href: "/dashboard/clinic?tab=public-services",
          },
          {
            id: "public-faqs",
            label: "Pusat Bantuan (FAQ)",
            icon: HelpCircle,
            href: "/dashboard/clinic?tab=public-faqs",
          },
          {
            id: "public-legal",
            label: "Kebijakan & Ketentuan",
            icon: Shield,
            href: "/dashboard/clinic?tab=public-legal",
          },
        ],
      },
    ],
    []
  );

  return (
    <aside className="w-64 bg-white border-r border-[#F0E6D3] min-h-screen p-4 flex flex-col justify-between hidden lg:flex">
      <div className="space-y-6">
        {/* Header Branding */}
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#C9A24A] to-[#B8943F] flex items-center justify-center shadow-md shadow-[#C9A24A]/20 text-white font-bold text-lg">
            A
          </div>
          <div>
            <h1 className="text-sm font-bold text-[#4A3F35] leading-tight">Admin Clinic</h1>
            <p className="text-[10px] font-semibold text-[#8A7B6B]">Aesthetic Pondok Indah</p>
          </div>
        </div>

        {/* Menu Navigation Groups */}
        <div className="space-y-4">
          {navGroups.map((group, idx) => (
            <div key={idx} className="space-y-1">
              <p className="px-3 text-[10px] font-bold text-[#A89887] uppercase tracking-wider">
                {group.title}
              </p>
              <div className="space-y-0.5 mt-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;
                  return (
                    <Link
                      key={item.id}
                      to={item.href}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? "bg-[#FDF8F0] text-[#B8943F] font-bold border border-[#F5E6C8] shadow-2xs"
                          : "text-[#5C5546] hover:bg-[#FAF8F5] hover:text-[#4A3F35]"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${isActive ? "text-[#B8943F]" : "text-[#8A7B6B]"}`} />
                        <span>{item.label}</span>
                      </div>
                      {isActive && <ChevronRight className="w-3.5 h-3.5 text-[#B8943F]" />}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-4 border-t border-[#F0E6D3] px-2 text-[11px] text-[#8A7B6B] flex items-center justify-between">
        <span className="flex items-center gap-1">
          <HelpCircle className="w-3.5 h-3.5 text-[#B8943F]" />
          Bantuan Admin
        </span>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FDF8F0] text-[#B8943F]">v2.5</span>
      </div>
    </aside>
  );
}
