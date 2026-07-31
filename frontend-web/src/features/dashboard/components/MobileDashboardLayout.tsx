import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { clearSession, getSession } from "@/features/auth/services/demoAuth";
import { clearSessionStorage } from "@/features/auth/services/sessionTtl";
import { logger } from "@/lib/logger";
import {
  Home,
  CalendarDays,
  MessageSquareText,
  UserCircle,
  Search,
  SlidersHorizontal,
  Bell,
  MapPin,
  ChevronDown,
  LogOut,
  Settings,
  CreditCard,
  Shield,
  HelpCircle,
  Stethoscope,
  Phone,
  Clock,
} from "lucide-react";

interface MobileDashboardLayoutProps {
  children: React.ReactNode;
  role: "user" | "clinic" | "doctor";
}

interface NavItem {
  label: string;
  icon: React.ElementType;
  href: string;
  badge?: number;
}

export default function MobileDashboardLayout({ children, role }: MobileDashboardLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  let session = getSession();
  const storedUser = localStorage.getItem("apident:user");
  if (storedUser) {
    try {
      const parsed = JSON.parse(storedUser);
      session = { ...(session || {}), ...parsed };
    } catch (e) {
      logger.error("Gagal parse user session", e);
    }
  }

  const isMembership =
    (session as any)?.membership_status === "active" ||
    (session as any)?.membershipStatus === "active" ||
    (session as any)?.membership_status === "member" ||
    (session as any)?.membershipStatus === "member";

  const getNavbarLabel = () => {
    if (role === "clinic") return "Admin Klinik";
    if (role === "doctor") return "Dokter Klinik";
    if (role === "user" && isMembership) return "Member Eksklusif";
    return "Client Klinik";
  };

  useEffect(() => {
    setProfileMenuOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getNavItems = (): NavItem[] => {
    switch (role) {
      case "user":
        return [
          { label: "Beranda", icon: Home, href: "/dashboard/user" },
          { label: "Reservasi", icon: CalendarDays, href: "/dashboard/user?tab=reservasi" },
          { label: "Konsultasi", icon: MessageSquareText, href: "/dashboard/user?tab=konsultasi" },
          { label: "Profil", icon: UserCircle, href: "/settings" },
        ];
      case "clinic":
        return [
          { label: "Beranda", icon: Home, href: "/dashboard/clinic" },
          { label: "Reservasi", icon: CalendarDays, href: "/dashboard/clinic?tab=reservasi" },
          { label: "Dokter", icon: Stethoscope, href: "/dashboard/clinic?tab=doctors" },
          { label: "Profil", icon: UserCircle, href: "/settings" },
        ];
      case "doctor":
        return [
          { label: "Beranda", icon: Home, href: "/dashboard/doctor" },
          { label: "Jadwal", icon: CalendarDays, href: "/dashboard/doctor?tab=jadwal" },
          { label: "Klien", icon: MessageSquareText, href: "/dashboard/doctor?tab=klien" },
          { label: "Profil", icon: UserCircle, href: "/settings" },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  const isActive = (href: string) => {
    const currentPath = location.pathname;
    const currentTab = new URLSearchParams(location.search).get("tab");
    const [hrefPath, hrefQuery] = href.split("?");
    if (currentPath !== hrefPath) return false;
    const hrefTab = hrefQuery ? new URLSearchParams(hrefQuery).get("tab") : null;
    if (!hrefTab) return !currentTab;
    return currentTab === hrefTab;
  };

  const handleLogout = () => {
    clearSession();
    clearSessionStorage();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-lg mx-auto relative shadow-2xl pb-20">
      {/* Mobile Header */}
      <header className="sticky top-0 z-30 bg-white">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Location / Greeting */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <MapPin className="w-3 h-3 text-[#c9a24a]" />
              <span className="truncate">Aesthetic Pondok Indah</span>
              <ChevronDown className="w-3 h-3" />
            </div>
            <h1 className="text-sm font-bold text-gray-900 truncate">
              Halo, {session?.name?.split(" ")[0] || "Pengguna"}!
            </h1>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="relative w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center"
              aria-label="Notifikasi"
            >
              <Bell className="w-4 h-4 text-gray-700" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>

            <div className="relative" ref={profileMenuRef}>
              <button
                type="button"
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="w-9 h-9 rounded-full bg-gradient-to-br from-[#c9a24a] to-[#a8843a] flex items-center justify-center text-white font-bold text-xs"
              >
                {(session?.name || "U")[0].toUpperCase()}
              </button>

              {profileMenuOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl shadow-gray-200/80 py-3 z-50">
                  <div className="px-4 py-3 border-b border-gray-100 mb-1">
                    <p className="text-sm font-semibold text-gray-900">{session?.name || "User"}</p>
                    <p className="text-xs text-gray-500">{getNavbarLabel()}</p>
                  </div>
                  <Link
                    to="/settings"
                    onClick={() => setProfileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-xl mx-1 transition-colors"
                  >
                    <Settings className="w-4 h-4 text-gray-500" />
                    Profil
                  </Link>
                  <Link
                    to="/membership"
                    onClick={() => setProfileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-xl mx-1 transition-colors"
                  >
                    <CreditCard className="w-4 h-4 text-gray-500" />
                    Membership
                  </Link>
                  <Link
                    to="/security"
                    onClick={() => setProfileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-xl mx-1 transition-colors"
                  >
                    <Shield className="w-4 h-4 text-gray-500" />
                    Keamanan
                  </Link>
                  <Link
                    to="/help"
                    onClick={() => setProfileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-xl mx-1 transition-colors"
                  >
                    <HelpCircle className="w-4 h-4 text-gray-500" />
                    Bantuan
                  </Link>
                  <div className="border-t border-gray-100 my-2 mx-3"></div>
                  <button
                    onClick={() => {
                      setProfileMenuOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-xl mx-1 transition-colors w-full"
                  >
                    <LogOut className="w-4 h-4" />
                    Keluar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pt-4 pb-20 px-4 scrollbar-hide">
        {children}
      </main>

      {/* Bottom Navigation - Elegant Curved Style */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 max-w-lg mx-auto">
        <div className="relative">
          {/* Background with elegant curves */}
          <div className="bg-slate-900 rounded-t-[32px] shadow-[0_-8px_40px_-12px_rgba(0,0,0,0.4)]">
            {/* Top highlight line for elegance */}
            <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent"></div>

            <div className="flex items-end justify-around px-2 pb-3 pt-2">
              {navItems.map((item) => {
                const active = isActive(item.href);

                return (
                  <Link
                    key={item.label}
                    to={item.href}
                    className="relative flex flex-col items-center group w-16"
                  >
                    {/* Active indicator with elegant curved notch */}
                    {active && (
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2">
                        <div className="relative">
                          {/* Glow effect behind active icon */}
                          <div className="absolute inset-0 w-16 h-16 bg-emerald-500/20 rounded-full blur-xl"></div>

                          {/* Outer dark circle (creates the notch effect) */}
                          <div className="relative w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center">
                            {/* Elegant SVG curves on sides */}
                            <svg
                              className="absolute -left-4 top-4 w-4 h-8 text-slate-900"
                              viewBox="0 0 16 32"
                              fill="currentColor"
                              preserveAspectRatio="none"
                            >
                              <path d="M16 0 C4 8, 0 16, 0 32 L16 32 Z" />
                            </svg>
                            <svg
                              className="absolute -right-4 top-4 w-4 h-8 text-slate-900"
                              viewBox="0 0 16 32"
                              fill="currentColor"
                              preserveAspectRatio="none"
                            >
                              <path d="M0 0 C12 8, 16 16, 16 32 L0 32 Z" />
                            </svg>

                            {/* Inner active circle */}
                            <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30 ring-4 ring-slate-900">
                              <item.icon className="w-6 h-6 text-white" strokeWidth={2} />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Inactive item */}
                    {!active && (
                      <div className="flex flex-col items-center gap-1.5 py-2 px-3 transition-all duration-300">
                        <div className="relative">
                          <item.icon
                            className="w-5 h-5 text-slate-400 group-hover:text-slate-200 transition-colors duration-300"
                            strokeWidth={1.5}
                          />
                          {item.badge && (
                            <span className="absolute -top-1 -right-2 min-w-[16px] h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1 border-2 border-slate-900 shadow-sm">
                              {item.badge > 9 ? '9+' : item.badge}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-medium text-slate-400 group-hover:text-slate-200 transition-colors duration-300 tracking-wide">
                          {item.label}
                        </span>
                      </div>
                    )}

                    {/* Spacer and label for active item */}
                    {active && (
                      <div className="flex flex-col items-center mt-9">
                        <span className="text-[10px] font-semibold text-emerald-400 tracking-wide">
                          {item.label}
                        </span>
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
            {/* Safe area padding for iOS */}
            <div className="h-[env(safe-area-inset-bottom)] bg-slate-900"></div>
          </div>
        </div>
      </nav>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Reusable mobile dashboard sections                                  */
/* ------------------------------------------------------------------ */

export function MobileSearchBar({
  value,
  onChange,
  placeholder = "Cari dokter, layanan...",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="px-4 py-2">
      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full pl-9 pr-4 py-2.5 bg-gray-100 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#c9a24a]/30"
          />
        </div>
        <button
          type="button"
          className="w-10 h-10 bg-[#c9a24a] rounded-xl flex items-center justify-center text-white shadow-sm"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export function MobileSectionHeader({
  title,
  actionLabel,
  onAction,
}: {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex items-center justify-between px-4 mb-3">
      <h2 className="text-base font-bold text-gray-900">{title}</h2>
      {actionLabel && onAction && (
        <button onClick={onAction} className="text-xs font-medium text-[#c9a24a]">
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export function MobileUpcomingCard({
  doctorName,
  service,
  date,
  time,
  onCall,
}: {
  doctorName: string;
  service: string;
  date: string;
  time: string;
  onCall?: () => void;
}) {
  return (
    <div className="px-4 mb-5">
      <MobileSectionHeader
        title="Jadwal Mendatang"
        actionLabel="Lihat Semua"
        onAction={() => {}}
      />
      <div className="bg-gradient-to-r from-[#3b82f6] to-[#2563eb] rounded-2xl p-4 text-white shadow-lg shadow-blue-200/50">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold">{doctorName}</p>
              <p className="text-xs text-blue-100">{service}</p>
            </div>
          </div>
          {onCall && (
            <button
              onClick={onCall}
              className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <Phone className="w-4 h-4 text-white" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-3 text-xs text-blue-100">
          <div className="flex items-center gap-1">
            <CalendarDays className="w-3.5 h-3.5" />
            <span>{date}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>{time}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function MobileSpecialties({
  items,
  onSelect,
}: {
  items: { label: string; icon: React.ElementType; color: string }[];
  onSelect?: (label: string) => void;
}) {
  return (
    <div className="mb-5">
      <MobileSectionHeader title="Spesialisasi" actionLabel="Lihat Semua" onAction={() => {}} />
      <div className="flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide">
        {items.map((item) => (
          <button
            key={item.label}
            onClick={() => onSelect?.(item.label)}
            className="flex flex-col items-center gap-2 min-w-[72px]"
          >
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center ${item.color}`}
            >
              <item.icon className="w-6 h-6 text-white" />
            </div>
            <span className="text-[11px] font-medium text-gray-700 text-center leading-tight">
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function MobileBranchCard({
  name,
  address,
  rating,
  image,
  onClick,
}: {
  name: string;
  address: string;
  rating: number;
  image?: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="min-w-[220px] bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 text-left"
    >
      <div className="h-28 bg-gray-200 relative">
        {image ? (
          <img src={image} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <MapPin className="w-8 h-8 text-gray-400" />
          </div>
        )}
        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-lg px-1.5 py-0.5 flex items-center gap-0.5">
          <span className="text-yellow-500 text-xs">&#9733;</span>
          <span className="text-xs font-semibold text-gray-900">{rating}</span>
        </div>
      </div>
      <div className="p-3">
        <h3 className="text-sm font-semibold text-gray-900 truncate">{name}</h3>
        <p className="text-xs text-gray-500 truncate mt-0.5">{address}</p>
      </div>
    </button>
  );
}

export function MobileBranches({
  branches,
}: {
  branches: { name: string; address: string; rating: number; image?: string }[];
}) {
  return (
    <div className="mb-5">
      <MobileSectionHeader title="Cabang Terdekat" actionLabel="Lihat Semua" onAction={() => {}} />
      <div className="flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide">
        {branches.map((b, i) => (
          <MobileBranchCard key={i} {...b} />
        ))}
      </div>
    </div>
  );
}

export function MobileStatRow({
  stats,
}: {
  stats: { label: string; value: string; icon: React.ElementType; color: string }[];
}) {
  return (
    <div className="px-4 mb-5">
      <div className="grid grid-cols-4 gap-2">
        {stats.map((s, i) => (
          <div key={i} className="bg-white rounded-2xl p-3 flex flex-col items-center gap-1.5 border border-gray-100 shadow-sm">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color}`}>
              <s.icon className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-bold text-gray-900">{s.value}</span>
            <span className="text-[10px] text-gray-500 text-center leading-tight">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function MobileWorkingHours({
  hours,
}: {
  hours: { day: string; open: string; close: string }[];
}) {
  return (
    <div className="px-4 mb-5">
      <h2 className="text-base font-bold text-gray-900 mb-3">Jam Operasional</h2>
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {hours.map((h, i) => (
          <div
            key={h.day}
            className={`flex items-center justify-between px-4 py-3 ${
              i !== hours.length - 1 ? "border-b border-gray-50" : ""
            }`}
          >
            <span className="text-sm text-gray-700">{h.day}</span>
            <span className="text-sm font-medium text-gray-900">
              {h.open} - {h.close}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function MobileCtaButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <div className="px-4 pb-4">
      <button
        onClick={onClick}
        className="w-full py-3.5 bg-gradient-to-r from-[#3b82f6] to-[#2563eb] text-white font-semibold text-sm rounded-2xl shadow-lg shadow-blue-200/50 active:scale-[0.98] transition-transform"
      >
        {children}
      </button>
    </div>
  );
}
