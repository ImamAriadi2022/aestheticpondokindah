import { Link } from "react-router";
import { getSession, clearSession } from "@/core/auth/services/session";
import { clearSessionStorage } from "@/core/auth/services/sessionTtl";
import {
  User,
  Pencil,
  Settings,
  CreditCard,
  Shield,
  HelpCircle,
  Download,
  LogOut,
  ChevronRight,
  BadgeCheck,
} from "lucide-react";

const menuItems = [
  { label: "Detail Profil", href: "/profile", icon: User, description: "Lihat data diri Anda" },
  { label: "Edit Profil", href: "/profile/edit", icon: Pencil, description: "Perbarui foto & data diri" },
  { label: "Pengaturan", href: "/settings", icon: Settings, description: "Kelola preferensi akun" },
  { label: "Membership", href: "/membership", icon: CreditCard, description: "Tier & benefit member" },
  { label: "Keamanan", href: "/security", icon: Shield, description: "Kata sandi & keamanan" },
  { label: "Bantuan", href: "/help", icon: HelpCircle, description: "Pusat bantuan & FAQ" },
  { label: "Download Aplikasi", href: "/download", icon: Download, description: "Instal sebagai PWA" },
];

export default function DesktopUserAkun() {
  const session = getSession();
  const displayName = session?.name || "Pengguna";
  const email = session?.email || "";
  const whatsapp = session?.whatsapp || session?.phone || "";
  const tierLabel =
    session?.membership_level === "platinum"
      ? "Platinum Member"
      : session?.membership_level === "gold"
        ? "Gold Member"
        : "Bronze Member";

  const handleLogout = () => {
    clearSession();
    clearSessionStorage();
    window.location.href = "/login";
  };

  return (
    <div className="space-y-6 w-full max-w-none">
      {/* Profile Card */}
      <div className="relative overflow-hidden bg-white rounded-3xl p-6 border border-[#C9A24A]/15 shadow-sm">
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-[#C9A24A]/10 to-transparent rounded-full blur-2xl -translate-y-1/3 translate-x-1/3" />
        <div className="relative flex items-center gap-4">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#C9A24A] to-[#A8843A] flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-[#C9A24A]/30 shrink-0">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h2 className="text-lg font-bold text-[#5C4A32] truncate">{displayName}</h2>
              <BadgeCheck className="w-4 h-4 text-[#C9A24A] shrink-0" />
            </div>
            <p className="text-xs text-[#8B7355] truncate">{email || whatsapp || "Member"}</p>
            <span className="inline-flex items-center mt-2 px-3 py-1 rounded-full bg-[#FDF8F0] border border-[#C9A24A]/30 text-[11px] font-semibold text-[#A8843A]">
              {tierLabel}
            </span>
          </div>
        </div>
      </div>

      {/* Menu */}
      <div className="bg-white rounded-3xl border border-[#C9A24A]/10 shadow-sm overflow-hidden divide-y divide-[#C9A24A]/10">
        {menuItems.map(({ label, href, icon: Icon, description }) => (
          <Link
            key={label}
            to={href}
            className="flex items-center gap-4 px-5 py-4 hover:bg-[#FDF8F0] transition-colors group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#FDF8F0] flex items-center justify-center shrink-0 group-hover:bg-[#F5E9D8] transition-colors">
              <Icon className="w-5 h-5 text-[#C9A24A]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#5C4A32]">{label}</p>
              <p className="text-xs text-[#8B7355]">{description}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-[#C9A24A]" />
          </Link>
        ))}
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 px-5 py-4 bg-white rounded-3xl border border-red-100 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors shadow-sm"
      >
        <LogOut className="w-4 h-4" />
        Keluar Sesi
      </button>
    </div>
  );
}
