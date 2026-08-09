import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { clearSession, getSession } from "@/core/auth/services/session";
import { clearSessionStorage } from "@/core/auth/services/sessionTtl";
import { NotificationCenterModal } from "@/core/layouts/NotificationCenterModal";
import { fetchNotifications } from "@/core/api/notificationApi";
import { initializePushNotifications } from "@/core/api/firebaseNotification";
import {
  Home,
  CalendarDays,
  MessageSquareText,
  Clock,
  UserCircle,
  Bell,
  MapPin,
  ChevronDown,
  LogOut,
  Settings,
  CreditCard,
  Shield,
  HelpCircle,
  Stethoscope,
  Search,
  SlidersHorizontal,
  Calendar,
} from "lucide-react";

interface NewMobileDashboardLayoutProps {
  children: React.ReactNode;
  role: "user" | "clinic" | "doctor";
  hideBottomNav?: boolean;
  hideHeader?: boolean;
}

interface NavItem {
  label: string;
  icon: React.ElementType;
  href: string;
  badge?: number;
}

export default function NewMobileDashboardLayout({ 
  children, 
  role, 
  hideBottomNav = false,
  hideHeader = false 
}: NewMobileDashboardLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Inisialisasi Push Notification & token registration
    initializePushNotifications();

    // Fetch initial unread count
    fetchNotifications().then(({ unreadCount }) => {
      setUnreadNotifCount(unreadCount);
    });
  }, []);

  const session = getSession();

  const isMembership =
    (session as any)?.membership_status === "active" ||
    (session as any)?.membershipStatus === "active" ||
    (session as any)?.membership_status === "member" ||
    (session as any)?.membershipStatus === "member";

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
          { label: "Booking", icon: CalendarDays, href: "/dashboard/user?tab=booking" },
          { label: "Konsultasi", icon: MessageSquareText, href: "/dashboard/user?tab=konsultasi" },
          { label: "Riwayat", icon: Clock, href: "/dashboard/user?tab=riwayat" },
          { label: "Akun", icon: UserCircle, href: "/dashboard/user?tab=akun" },
        ];
      case "clinic":
        return [
          { label: "Beranda", icon: Home, href: "/dashboard/clinic" },
          { label: "Reservasi", icon: CalendarDays, href: "/dashboard/clinic?tab=reservasi" },
          { label: "Dokter", icon: Stethoscope, href: "/dashboard/clinic?tab=doctors" },
          { label: "Pengaturan", icon: Settings, href: "/dashboard/clinic?tab=settings" },
          { label: "Profil", icon: UserCircle, href: "/settings" },
        ];
      case "doctor":
        return [
          { label: "Beranda", icon: Home, href: "/dashboard/doctor" },
          { label: "Jadwal", icon: CalendarDays, href: "/dashboard/doctor?tab=jadwal" },
          { label: "Reservasi", icon: Calendar, href: "/dashboard/doctor?tab=reservasi" },
          { label: "Konsultasi", icon: MessageSquareText, href: "/dashboard/doctor?tab=konsultasi" },
          { label: "Profil", icon: UserCircle, href: "/settings" },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  const isActive = (href: string) => {
    const currentPath = location.pathname;
    const currentTab = new URLSearchParams(location.search).get("tab") || "dashboard";
    
    // Handle href with query params
    const [hrefPath, hrefQuery] = href.split("?");
    const hrefTab = hrefQuery ? new URLSearchParams(hrefQuery).get("tab") : "dashboard";
    
    if (currentPath !== hrefPath) return false;
    return currentTab === hrefTab;
  };

  const handleLogout = () => {
    clearSession();
    clearSessionStorage();
    navigate("/login");
  };

  const getPageTitle = () => {
    const path = location.pathname;
    const tab = new URLSearchParams(location.search).get("tab") || "dashboard";
    if (path === "/dashboard/user") {
      if (tab === "booking") return "Booking";
      if (tab === "reservasi") return "Reservasi";
      if (tab === "riwayat") return "Riwayat";
      if (tab === "konsultasi") return "Konsultasi";
      if (tab === "pengaduan") return "Pengaduan";
      if (tab === "promo") return "Promo";
      if (tab === "blog" || tab === "blog-detail") return "Artikel";
      if (tab === "download") return "Download";
      if (tab === "akun" || tab === "profile") return "Profil Saya";
      return "Beranda";
    }
    if (path === "/dashboard/clinic") {
      if (tab === "reservasi") return "Reservasi";
      if (tab === "konsultasi") return "Konsultasi";
      if (tab === "doctors") return "Dokter";
      if (tab === "users") return "Pengguna";
      if (tab === "membership") return "Membership";
      if (tab === "settings") return "Pengaturan Klinik";
      if (tab.startsWith("content")) return "Konten";
      return "Dashboard Klinik";
    }
    if (path === "/dashboard/doctor") {
      if (tab === "jadwal") return "Jadwal";
      if (tab === "reservasi") return "Reservasi";
      if (tab === "konsultasi") return "Konsultasi";
      return "Dashboard Dokter";
    }
    if (path.startsWith("/dashboard/user/consultation/")) return "Konsultasi";
    if (path === "/profile") return "Detail Profil";
    if (path === "/profile/edit") return "Edit Profil";
    if (path === "/settings") return "Pengaturan";
    if (path === "/membership") return "Membership";
    if (path === "/security") return "Keamanan";
    if (path === "/help") return "Bantuan";
    if (path === "/download") return "Download";
    return "";
  };

  const isRootPage = () => {
    const path = location.pathname;
    if (path === "/dashboard/user") return true;
    if (path === "/dashboard/clinic") return true;
    if (path === "/dashboard/doctor") return true;
    return false;
  };

  const showBackButton = !isRootPage();

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col max-w-lg mx-auto relative shadow-2xl">
      {/* Header */}
      {!hideHeader && (
        <header className="sticky top-0 z-30 bg-white">
          <div className="flex items-center justify-between px-4 py-3">
            {/* Left: Back or Location */}
            {showBackButton ? (
              <button
                onClick={() => navigate(-1)}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              >
                <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            ) : (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <MapPin className="w-3.5 h-3.5 text-[#c9a24a]" />
                <span className="truncate max-w-[100px]">Pondok Indah</span>
                <ChevronDown className="w-3 h-3" />
              </div>
            )}

            {/* Center: Page Title */}
            {showBackButton && (
              <h1 className="text-base font-semibold text-gray-900 absolute left-1/2 -translate-x-1/2">
                {getPageTitle()}
              </h1>
            )}

            {/* Right: Notification & Profile */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsNotifModalOpen(true)}
                className="relative w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                aria-label="Notifikasi"
              >
                <Bell className="w-4 h-4 text-gray-600" />
                {unreadNotifCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                    {unreadNotifCount > 9 ? "9+" : unreadNotifCount}
                  </span>
                )}
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
                  <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl py-3 z-50 border border-gray-100">
                    <div className="px-4 py-3 border-b border-gray-100 mb-1">
                      <p className="text-sm font-semibold text-gray-900">{session?.name || "User"}</p>
                      <p className="text-xs text-gray-500">{(session as any)?.membership_level === 'gold' ? "Gold Member" : (session as any)?.membership_level === 'platinum' ? "Platinum Member" : "Bronze Member"}</p>
                    </div>
                    <Link
                      to="/dashboard/user?tab=akun"
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
      )}

      {/* Main Content */}
      <main className={`flex-1 overflow-y-auto scrollbar-hide ${hideBottomNav ? '' : 'pb-24'}`}>
        {children}
      </main>

      {/* Bottom Navigation - Modern Style from UI */}
      {!hideBottomNav && (
        <nav className="fixed bottom-0 left-0 right-0 z-40 max-w-lg mx-auto bg-white border-t border-gray-100 px-2 pt-2 pb-safe">
          <div className="flex items-center justify-around">
            {navItems.map((item) => {
              const active = isActive(item.href);
              
              return (
                <Link
                  key={item.label}
                  to={item.href}
                  className={`relative flex flex-col items-center py-2 px-3 min-w-[56px] transition-all duration-200 ${
                    active ? "text-[#c9a24a]" : "text-gray-400"
                  }`}
                >
                  <div className="relative">
                    <item.icon 
                      className={`w-6 h-6 transition-all duration-200 ${
                        active ? "stroke-[2.5px]" : "stroke-[1.5px]"
                      }`} 
                    />
                    {item.badge && (
                      <span className="absolute -top-1 -right-2 min-w-[16px] h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1 border-2 border-white">
                        {item.badge > 9 ? '9+' : item.badge}
                      </span>
                    )}
                  </div>
                  <span className={`text-[10px] mt-1 font-medium transition-all duration-200 ${
                    active ? "text-[#c9a24a]" : "text-gray-400"
                  }`}>
                    {item.label}
                  </span>
                  {active && (
                    <div className="absolute -bottom-2 w-1 h-1 bg-[#c9a24a] rounded-full" />
                  )}
                </Link>
              );
            })}
          </div>
          {/* Safe area padding for iOS */}
          <div className="h-[env(safe-area-inset-bottom)]" />
        </nav>
      )}

      {/* Notification Center Modal */}
      <NotificationCenterModal
        isOpen={isNotifModalOpen}
        onClose={() => setIsNotifModalOpen(false)}
        onUnreadCountChange={setUnreadNotifCount}
      />
    </div>
  );
}

// Reusable Components
export function MobileSearchHeader({
  value,
  onChange,
  placeholder = "Cari layanan, dokter...",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="px-4 py-3 bg-white">
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full pl-12 pr-4 py-3 bg-gray-100 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#c9a24a]/30"
          />
        </div>
        <button className="w-11 h-11 bg-[#c9a24a] rounded-xl flex items-center justify-center text-white shadow-sm">
          <SlidersHorizontal className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
