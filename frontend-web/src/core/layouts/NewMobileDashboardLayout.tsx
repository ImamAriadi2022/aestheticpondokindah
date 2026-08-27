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
  Users,
  MoreHorizontal,
  X,
  AlertCircle,
  FileText,
  Image,
  Sparkles,
  Download,
  Building2,
  Layers,
  Mail,
  Info,
  LayoutDashboard,
  MessageSquare,
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
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
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
          { label: "Konsultasi", icon: MessageSquare, href: "/dashboard/clinic?tab=konsultasi" },
        ];
      case "doctor":
        return [
          { label: "Beranda", icon: Home, href: "/dashboard/doctor" },
          { label: "Jadwal", icon: CalendarDays, href: "/dashboard/doctor?tab=jadwal" },
          { label: "Daftar Pasien", icon: Users, href: "/dashboard/doctor?tab=reservasi" },
          { label: "Profil", icon: UserCircle, href: "/settings" },
        ];
      default:
        return [];
    }
  };

  // Admin "More" menu groups — all features not in the main bottom nav
  const clinicMoreGroups = [
    {
      title: "Kelola",
      items: [
        { label: "Dokter", icon: Stethoscope, href: "/dashboard/clinic?tab=doctors" },
        { label: "Pengguna", icon: Users, href: "/dashboard/clinic?tab=users" },
        { label: "Cabang", icon: Building2, href: "/dashboard/clinic?tab=branches" },
        { label: "Membership", icon: Sparkles, href: "/dashboard/clinic/membership" },
      ],
    },
    {
      title: "Konten & CMS",
      items: [
        { label: "Edit Beranda", icon: LayoutDashboard, href: "/dashboard/clinic?tab=etalase-beranda" },
        { label: "Edit Tentang", icon: Info, href: "/dashboard/clinic?tab=etalase-tentang" },
        { label: "Pop Up Promo", icon: Sparkles, href: "/dashboard/clinic?tab=content-popup" },
        { label: "Promo", icon: FileText, href: "/dashboard/clinic?tab=content-promo" },
        { label: "Blog", icon: FileText, href: "/dashboard/clinic?tab=content-blog" },
        { label: "Galeri", icon: Image, href: "/dashboard/clinic?tab=content-gallery" },
        { label: "Testimoni", icon: MessageSquareText, href: "/dashboard/clinic?tab=content-testimonials" },
        { label: "Download App", icon: Download, href: "/dashboard/clinic?tab=content-download" },
      ],
    },
    {
      title: "Informasi Publik",
      items: [
        { label: "Layanan", icon: Layers, href: "/dashboard/clinic?tab=public-services" },
        { label: "FAQ", icon: HelpCircle, href: "/dashboard/clinic?tab=public-faqs" },
        { label: "Pesan Kontak", icon: Mail, href: "/dashboard/clinic?tab=public-contact-messages" },
        { label: "Pengaduan", icon: AlertCircle, href: "/dashboard/clinic?tab=pengaduan" },
        { label: "Kebijakan", icon: Shield, href: "/dashboard/clinic?tab=public-legal" },
      ],
    },
    {
      title: "Pengaturan",
      items: [
        { label: "Pengaturan Klinik", icon: Settings, href: "/dashboard/clinic?tab=settings" },
        { label: "Preferensi", icon: UserCircle, href: "/settings" },
      ],
    },
  ];

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
    if (path === "/settings") return "Preferensi";
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
    <div className="mobile-dashboard-shell min-h-[100dvh] bg-[#FAFAFA] flex flex-col max-w-lg mx-auto relative shadow-2xl">
      {/* Header */}
      {!hideHeader && (
        <header className="mobile-dashboard-header sticky top-0 z-30 bg-white">
          <div className="flex items-center justify-between px-5 py-3">
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
      <main className={`mobile-dashboard-main flex-1 min-w-0 overflow-y-auto scrollbar-hide ${hideBottomNav ? '' : 'pb-24'}`}>
        <div className="mobile-dashboard-content">
          {children}
        </div>
      </main>

      {/* Bottom Navigation */}
      {!hideBottomNav && (
        <nav className="mobile-dashboard-nav fixed bottom-0 left-0 right-0 z-40 max-w-lg mx-auto bg-white border-t border-gray-100 px-2 pt-2 pb-2" style={{ paddingBottom: 'calc(0.5rem + env(safe-area-inset-bottom))' }}>
          <div className={`flex items-center ${role === 'clinic' ? 'justify-around' : 'justify-around'}`}>
            {navItems.map((item) => {
              const active = isActive(item.href);
              
              return (
                <Link
                  key={item.label}
                  to={item.href}
                  onClick={() => setMoreMenuOpen(false)}
                  className={`relative flex flex-col items-center py-2 px-3 min-w-[60px] transition-all duration-200 ${
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

            {/* "Lainnya" button — only for clinic admin */}
            {role === 'clinic' && (
              <button
                type="button"
                onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                className={`relative flex flex-col items-center py-2 px-3 min-w-[60px] transition-all duration-200 ${
                  moreMenuOpen ? "text-[#c9a24a]" : "text-gray-400"
                }`}
              >
                <MoreHorizontal
                  className={`w-6 h-6 transition-all duration-200 ${
                    moreMenuOpen ? "stroke-[2.5px]" : "stroke-[1.5px]"
                  }`}
                />
                <span className={`text-[10px] mt-1 font-medium ${
                  moreMenuOpen ? "text-[#c9a24a]" : "text-gray-400"
                }`}>
                  Lainnya
                </span>
              </button>
            )}
          </div>
        </nav>
      )}

      {/* Admin "Lainnya" bottom sheet */}
      {role === 'clinic' && moreMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm"
            onClick={() => setMoreMenuOpen(false)}
          />
          {/* Sheet */}
          <div className="fixed bottom-0 left-0 right-0 z-50 max-w-lg mx-auto bg-white rounded-t-3xl shadow-2xl overflow-y-auto max-h-[80vh]" style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}>
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 pb-3 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900">Menu Admin</h2>
              <button
                onClick={() => setMoreMenuOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* Feature Groups */}
            <div className="px-4 pt-4 pb-6 space-y-5">
              {clinicMoreGroups.map((group) => (
                <div key={group.title}>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2.5 px-1">
                    {group.title}
                  </p>
                  <div className="grid grid-cols-4 gap-2">
                    {group.items.map((item) => {
                      const currentTab = new URLSearchParams(location.search).get("tab");
                      const [, hrefQuery] = item.href.split("?");
                      const hrefTab = hrefQuery ? new URLSearchParams(hrefQuery).get("tab") : null;
                      const isItemActive = location.pathname === "/dashboard/clinic" && hrefTab === currentTab;

                      return (
                        <Link
                          key={item.label}
                          to={item.href}
                          onClick={() => setMoreMenuOpen(false)}
                          className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all duration-150 ${
                            isItemActive
                              ? "bg-[#c9a24a]/15 text-[#c9a24a]"
                              : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          <item.icon className={`w-5 h-5 ${isItemActive ? "stroke-[2px]" : "stroke-[1.5px]"}`} />
                          <span className="text-[9px] font-medium text-center leading-tight">{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Logout */}
              <div className="pt-1 border-t border-gray-100">
                <button
                  onClick={() => {
                    setMoreMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-red-500 bg-red-50 hover:bg-red-100 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="text-sm font-medium">Keluar</span>
                </button>
              </div>
            </div>
          </div>
        </>
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
