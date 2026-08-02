import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { clearSession, getSession } from "@/features/auth/services/session";
import { clearSessionStorage, touchSessionLastActive } from "@/features/auth/services/sessionTtl";
import AccountSidebar from "@/components/dashboard/AccountSidebar";
import MobileDashboardLayout from "./MobileDashboardLayout";
import DashboardRightPanel from "./DashboardRightPanel";
import { getMenuItems, CONTENT_SUBMENU, type MenuItem } from "@/authorization";
import {
  LogOut,
  ChevronDown,
  ChevronRight,
  User,
  Pencil,
  Settings,
  Download,
} from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: "user" | "clinic" | "doctor";
  consultationsCount?: number;
  activeTreatmentsCount?: number;
  availableDoctorsCount?: number;
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const onChange = () => setIsMobile(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return isMobile;
}

export default function DashboardLayout({ 
  children, 
  role, 
  consultationsCount = 0,
  activeTreatmentsCount = 0,
  availableDoctorsCount = 0,
}: DashboardLayoutProps) {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [contentMenuOpen, setContentMenuOpen] = useState(false);
  const contentButtonRef = useRef<HTMLButtonElement>(null);
  const [contentMenuPos, setContentMenuPos] = useState({ top: 0, left: 0 });

  const [userPopupOpen, setUserPopupOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const avatarBtnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(e.target as Node) &&
        avatarBtnRef.current &&
        !avatarBtnRef.current.contains(e.target as Node)
      ) {
        setUserPopupOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleSidebar = () => {
    setSidebarExpanded((prev) => !prev);
    setContentMenuOpen(false);
    setUserPopupOpen(false);
  };

  const handleMenuClick = () => {
    setSidebarExpanded(false);
    setContentMenuOpen(false);
    setUserPopupOpen(false);
  };
  const location = useLocation();
  const navigate = useNavigate();
  
  // Ambil session dari backend asli
  const session = getSession();

  // Helper: calculate progress (same logic as MembershipPage)
  const calculateProgress = () => {
    if (!session) return 0;
    const fields = ["name","email","phone","gender","birthDate","bloodType","job","address","province","city","sourceInfo"];
    const filledFields = fields.filter((field) => {
      const value = (session as any)[field] || (session as any)[field.replace(/([A-Z])/g, "_$1").toLowerCase()] ||
                    (session as any)[field === 'phone' ? 'whatsapp' : field] ||
                    (session as any)[field === 'bloodType' ? 'blood_type' : field] ||
                    (session as any)[field === 'address' ? 'address_line' : field];
      return !!value;
    });
    const interests = (session as any).interests || [];
    const interestScore = interests.length > 0 ? 1 : 0;
    return Math.round(((filledFields.length + interestScore) / (fields.length + 1)) * 100);
  };
  const progress = calculateProgress();
  const isProfileComplete = progress >= 100;

  const hasDentalSegmentation =
    Array.isArray((session as any)?.dentalComplaints) && (session as any)?.dentalComplaints?.length > 0 &&
    Array.isArray((session as any)?.desiredServices) && (session as any)?.desiredServices?.length > 0;

  // Bronze, Gold, and Platinum membership system.
  const currentTier = (session as any)?.membership_level || 'bronze';

  const tierConfig = {
    bronze: {
      label: 'Basic Member',
      shortLabel: 'Basic',
      gradient: 'from-[#CD7F32] to-[#A0522D]',
    },
    gold: {
      label: 'Premium Member',
      shortLabel: 'Premium',
      gradient: 'from-[#c9a24a] to-[#a8843a]',
    },
    platinum: {
      label: 'Priority Member',
      shortLabel: 'Priority',
      gradient: 'from-[#8B9DAF] to-[#6B7D8F]',
    },
  };

  const config = tierConfig[currentTier as keyof typeof tierConfig] || tierConfig.bronze;

  // Cek status membership dengan berbagai kemungkinan key dari backend/frontend
  const isMembership =
    (session as any)?.membership_status === "active" ||
    (session as any)?.membershipStatus === "active" ||
    (session as any)?.membership_status === "member" ||
    (session as any)?.membershipStatus === "member" ||
    currentTier !== 'bronze' ||
    (isProfileComplete && hasDentalSegmentation);

  const getNavbarLabel = () => {
    if (role === "clinic") return "Admin Klinik";
    if (role === "doctor") return "Dokter Klinik";
    if (role === "user") return config.label;
    return "Client Klinik";
  };

  const navbarLabel = getNavbarLabel();

  useEffect(() => {
    touchSessionLastActive();
  }, [location.pathname, location.search]);

  const menuItems = getMenuItems(role);

  const handleLogout = () => {
    clearSession();
    clearSessionStorage();
    navigate("/login");
  };

  const isActive = (href: string) => {
    const currentPath = location.pathname;
    const currentTab = new URLSearchParams(location.search).get("tab");

    const [hrefPath, hrefQuery] = href.split("?");
    if (currentPath !== hrefPath) return false;

    const hrefTab = hrefQuery ? new URLSearchParams(hrefQuery).get("tab") : null;

    if (!hrefTab) return !currentTab;
    return currentTab === hrefTab;
  };

  const isClinicContentTab = () => {
    if (role !== "clinic") return false;
    const currentTab = new URLSearchParams(location.search).get("tab") || "dashboard";
    return currentTab === "content" || currentTab.startsWith("content-");
  };

  // Check if current tab is dashboard (only show right panel on dashboard)
  const currentTab = new URLSearchParams(location.search).get("tab") || "dashboard";
  const pathname = location.pathname;
  
  // Pages that should NOT show right panel and should have wider content
  const hideRightPanelPages = ["/membership", "/settings", "/help", "/profile"];
  const shouldHideRightPanel = (
    (role === "user" && (currentTab === "reservasi" || currentTab === "konsultasi" || currentTab === "pengaduan")) || // Specific tabs in user dashboard
    (role === "doctor" && currentTab !== "dashboard") || // Non-dashboard tabs in doctor dashboard
    role === "clinic" || // Clinic dashboard tidak perlu right panel
    hideRightPanelPages.some(page => pathname.startsWith(page)) // Membership, settings, help pages
  );
  const isDashboardTab = (role === "user" || role === "clinic") && currentTab === "dashboard" && !hideRightPanelPages.some(page => pathname.startsWith(page));

  const isMobile = useIsMobile();
  if (isMobile) {
    return <MobileDashboardLayout role={role}>{children}</MobileDashboardLayout>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 flex items-start">
      {/* Left Sidebar */}
      {role === "user" ? (
        <AccountSidebar userName={session?.name || "User"} onLogout={handleLogout} />
      ) : (
        <div className="sticky top-4 left-0 h-[calc(100vh-32px)] self-start z-[100] pointer-events-auto ml-2 mr-2 flex-shrink-0">
          {/* Floating Glassmorphism Sidebar - Elegant Gold Theme */}
          <aside
            className={`
              pointer-events-auto flex flex-col h-full
              bg-[#1a1612]
              border-2 border-[#C9A24A]/50
              rounded-[28px]
              shadow-[0_8px_32px_rgba(0,0,0,0.4)]
              transition-all duration-300
              overflow-visible relative
              ${sidebarExpanded ? "w-[260px]" : "w-[72px]"}
            `}
          >
            {/* Gradient Glow Effect */}
            <div className="absolute inset-0 rounded-[28px] bg-gradient-to-br from-[#C9A24A]/10 via-transparent to-[#B8943F]/10 pointer-events-none" />
            <div className="absolute inset-[1px] rounded-[27px] border border-[#C9A24A]/10 pointer-events-none" />

            {/* Toggle Arrow Button */}
            <div className="relative z-10 flex items-center justify-center h-16 px-4">
              <button
                onClick={toggleSidebar}
                className={`
                  flex items-center justify-center
                  w-10 h-10 rounded-xl
                  bg-[#2a2319] hover:bg-[#3a3126]
                  text-[#E8C547]
                  transition-all duration-300 ease-out
                  hover:scale-110 active:scale-95
                  border border-[#C9A24A]/40
                  ${sidebarExpanded ? "rotate-180" : "rotate-0"}
                `}
                aria-label={sidebarExpanded ? "Tutup sidebar" : "Buka sidebar"}
              >
                <ChevronRight className="w-5 h-5" strokeWidth={2.5} />
              </button>
            </div>

            {/* Divider */}
            <div className="mx-5 h-px bg-gradient-to-r from-transparent via-[#C9A24A]/40 to-transparent" />

            {/* Navigation */}
            <nav className="relative z-10 flex-1 flex flex-col gap-2 px-3 py-4">
              {menuItems.map((item) => {
                const active = isActive(item.href);
                const isContent = role === "clinic" && item.label === "Konten";

                // Floating Content Submenu trigger
                if (isContent) {
                  const contentActive = isClinicContentTab();
                  return (
                    <button
                      key={item.label}
                      ref={contentButtonRef}
                      type="button"
                      onClick={() => {
                        const nextOpen = !contentMenuOpen;
                        if (nextOpen && contentButtonRef.current) {
                          const rect = contentButtonRef.current.getBoundingClientRect();
                          setContentMenuPos({ top: rect.top, left: rect.right + 12 });
                        }
                        if (nextOpen && !contentActive) navigate(item.href);
                        setContentMenuOpen(nextOpen);
                      }}
                      className={`
                        group relative flex items-center
                        h-12 rounded-2xl w-full
                        transition-all duration-300
                        ${contentActive
                          ? "bg-gradient-to-r from-[#C9A24A]/80 to-[#B8943F]/80 shadow-[0_4px_20px_rgba(201,162,74,0.3)]"
                          : "hover:bg-[#2a2319]"
                        }
                        ${sidebarExpanded ? "px-3 gap-3" : "justify-center px-0"}
                      `}
                    >
                      {contentActive && (
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#C9A24A]/20 to-[#E8C547]/20 blur-xl -z-10" />
                      )}
                      <div className={`
                        flex items-center justify-center w-9 h-9 rounded-xl
                        transition-all duration-300
                        ${contentActive
                          ? "bg-[#E8C547]/20 text-[#FFF8E1] shadow-inner"
                          : "bg-[#2a2319] text-[#A89F91] group-hover:bg-[#3a3126] group-hover:text-[#E8C547]"
                        }
                      `}>
                        <item.icon className="w-[18px] h-[18px]" strokeWidth={contentActive ? 2.5 : 2} />
                      </div>
                      {sidebarExpanded && (
                        <>
                          <span className={`
                            flex-1 text-sm font-medium tracking-wide text-left
                            transition-all duration-300
                            ${contentActive ? "text-white" : "text-[#D4C5B0] group-hover:text-[#E8C547]"}
                          `}>
                            {item.label}
                          </span>
                          <ChevronDown className={`
                            w-4 h-4 transition-transform duration-300
                            ${contentActive ? "text-white" : "text-[#A89F91]"}
                            ${contentMenuOpen ? "rotate-180" : ""}
                          `} />
                        </>
                      )}

                      {/* Tooltip when collapsed */}
                      {!sidebarExpanded && (
                        <div className="
                          absolute left-full ml-3 px-3 py-1.5
                          bg-[#1a1612] backdrop-blur-sm
                          border border-[#C9A24A]/40 rounded-lg
                          text-xs text-[#E8C547] font-medium
                          whitespace-nowrap
                          opacity-0 invisible
                          group-hover:opacity-100 group-hover:visible
                          transition-all duration-200
                          shadow-[0_4px_20px_rgba(0,0,0,0.3)]
                          z-50
                        ">
                          {item.label}
                          <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-[#1a1612] border-l border-t border-[#C9A24A]/40 rotate-45" />
                        </div>
                      )}
                    </button>
                  );
                }

                // Non-content items
                return (
                  <Link
                    key={item.label}
                    to={item.href}
                    onClick={handleMenuClick}
                    className={`
                      group relative flex items-center
                      h-12 rounded-2xl
                      transition-all duration-300 ease-out
                      ${active
                        ? "bg-gradient-to-r from-[#C9A24A]/80 to-[#B8943F]/80 shadow-[0_4px_20px_rgba(201,162,74,0.3)]"
                        : "hover:bg-[#2a2319]"
                      }
                      ${sidebarExpanded ? "px-3 gap-3" : "justify-center px-0"}
                    `}
                  >
                    {active && (
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#C9A24A]/20 to-[#E8C547]/20 blur-xl -z-10" />
                    )}
                    <div className={`
                      flex items-center justify-center w-9 h-9 rounded-xl
                      transition-all duration-300 relative
                      ${active
                        ? "bg-[#E8C547]/20 text-[#FFF8E1] shadow-inner"
                        : "bg-[#2a2319] text-[#A89F91] group-hover:bg-[#3a3126] group-hover:text-[#E8C547]"
                      }
                    `}>
                      <item.icon className="w-[18px] h-[18px]" strokeWidth={active ? 2.5 : 2} />
                      {item.badge && (
                        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-[#1a1612]" />
                      )}
                    </div>
                    <span className={`
                      text-sm font-medium tracking-wide
                      transition-all duration-500
                      ${active ? "text-white" : "text-[#D4C5B0] group-hover:text-[#E8C547]"}
                      ${sidebarExpanded ? "opacity-100 w-auto" : "opacity-0 w-0"}
                    `}>
                      {item.label}
                    </span>

                    {/* Tooltip when collapsed */}
                    {!sidebarExpanded && (
                      <div className="
                        absolute left-full ml-3 px-3 py-1.5
                        bg-[#1a1612] backdrop-blur-sm
                        border border-[#C9A24A]/40 rounded-lg
                        text-xs text-[#E8C547] font-medium
                        whitespace-nowrap
                        opacity-0 invisible
                        group-hover:opacity-100 group-hover:visible
                        transition-all duration-200
                        shadow-[0_4px_20px_rgba(0,0,0,0.3)]
                        z-50
                      ">
                        {item.label}
                        <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-[#1a1612] border-l border-t border-[#C9A24A]/40 rotate-45" />
                      </div>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Bottom Section */}
            <div className="relative z-10 flex flex-col gap-2 px-3 pb-4">
              <div className="mx-2 h-px bg-gradient-to-r from-transparent via-[#C9A24A]/40 to-transparent" />

              {/* User Profile Avatar Entry Point */}
              <div className="relative">
                <div
                  ref={avatarBtnRef}
                  onClick={() => setUserPopupOpen((prev) => !prev)}
                  className={`
                    group flex items-center
                    h-14 rounded-2xl
                    hover:bg-[#2a2319]
                    transition-all duration-300 cursor-pointer
                    ${userPopupOpen ? "bg-[#2a2319] ring-1 ring-[#C9A24A]/50" : ""}
                    ${sidebarExpanded ? "px-3 gap-3" : "justify-center px-0"}
                  `}
                >
                  {/* Avatar */}
                  <div className="relative">
                    {(session as any)?.avatar ? (
                      <img
                        src={(session as any).avatar.includes("storage/data:image") ? (session as any).avatar.substring((session as any).avatar.indexOf("data:image")) : (session as any).avatar}
                        alt={session?.name || "User"}
                        className="w-10 h-10 rounded-full object-cover shadow-[0_4px_15px_rgba(201,162,74,0.4)] ring-2 ring-[#C9A24A]/50 shrink-0"
                      />
                    ) : (
                      <div
                        className="
                        w-10 h-10 rounded-full
                        bg-gradient-to-br from-[#E8C547] via-[#C9A24A] to-[#B8943F]
                        flex items-center justify-center
                        text-[#1a1612] font-semibold text-sm
                        shadow-[0_4px_15px_rgba(201,162,74,0.4)]
                        ring-2 ring-[#C9A24A]/50 shrink-0
                      "
                      >
                        {(session?.name || "U").charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#22C55E] rounded-full border-2 border-[#1a1612]" />
                  </div>

                  {/* User Info */}
                  <div
                    className={`
                    overflow-hidden transition-all duration-500
                    ${sidebarExpanded ? "w-auto opacity-100" : "w-0 opacity-0"}
                  `}
                  >
                    <p className="text-sm font-semibold text-[#E8C547] whitespace-nowrap">
                      {session?.name || (role === "doctor" ? "Dokter Klinik" : "Admin Klinik")}
                    </p>
                    <p className="text-xs text-[#A89F91] whitespace-nowrap">
                      {role === "doctor" ? "Dokter Spesialis" : role === "clinic" ? "Admin Klinik" : "Pasien"}
                    </p>
                  </div>

                  {/* Tooltip when collapsed & closed */}
                  {!sidebarExpanded && !userPopupOpen && (
                    <div
                      className="
                      absolute left-full ml-3 px-3 py-2
                      bg-[#1a1612] backdrop-blur-sm
                      border border-[#C9A24A]/40 rounded-lg
                      text-sm text-[#E8C547] font-medium
                      whitespace-nowrap
                      opacity-0 invisible
                      group-hover:opacity-100 group-hover:visible
                      transition-all duration-200
                      shadow-[0_4px_20px_rgba(0,0,0,0.3)]
                      z-50
                    "
                    >
                      <p className="font-semibold">{session?.name || (role === "doctor" ? "Dokter Klinik" : "Admin Klinik")}</p>
                      <p className="text-xs text-[#A89F91]">
                        {role === "doctor" ? "Dokter Spesialis" : role === "clinic" ? "Admin Klinik" : "Pasien"}
                      </p>
                      <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-[#1a1612] border-l border-t border-[#C9A24A]/40 rotate-45" />
                    </div>
                  )}
                </div>

                {/* Profile Dropdown Popup */}
                {userPopupOpen && (
                  <div
                    ref={popupRef}
                    className="
                      absolute left-full bottom-0 ml-3 w-64
                      bg-[#1a1612] backdrop-blur-md
                      border-2 border-[#C9A24A]/50 rounded-2xl
                      shadow-[0_12px_40px_rgba(0,0,0,0.6)]
                      p-4 z-50
                      transition-all duration-200 ease-out
                    "
                  >
                    {/* Header User Info */}
                    <div className="flex items-center gap-3 pb-3 border-b border-[#C9A24A]/20">
                      {(session as any)?.avatar ? (
                        <img
                          src={(session as any).avatar.includes("storage/data:image") ? (session as any).avatar.substring((session as any).avatar.indexOf("data:image")) : (session as any).avatar}
                          alt={session?.name || "User"}
                          className="w-11 h-11 rounded-full object-cover shadow-md shrink-0 border border-[#C9A24A]"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#E8C547] to-[#B8943F] flex items-center justify-center text-[#1a1612] font-bold text-base shadow-md shrink-0">
                          {(session?.name || "U").charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="overflow-hidden min-w-0">
                        <p className="text-sm font-bold text-[#E8C547] truncate">{session?.name || "User"}</p>
                        <p className="text-xs text-[#A89F91] truncate">{session?.email || ""}</p>
                      </div>
                    </div>

                    {/* Dropdown Menu Items */}
                    <div className="pt-2 space-y-1">
                      <Link
                        to="/profile"
                        onClick={() => {
                          setUserPopupOpen(false);
                          handleMenuClick();
                        }}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-[#D4C5B0] hover:text-[#E8C547] hover:bg-[#2a2319] transition-all"
                      >
                        <User className="w-4 h-4 text-[#C9A24A]" />
                        Detail Profil
                      </Link>

                      <Link
                        to="/profile/edit"
                        onClick={() => {
                          setUserPopupOpen(false);
                          handleMenuClick();
                        }}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-[#D4C5B0] hover:text-[#E8C547] hover:bg-[#2a2319] transition-all"
                      >
                        <Pencil className="w-4 h-4 text-[#C9A24A]" />
                        Edit Profil (Foto)
                      </Link>

                      <Link
                        to="/settings"
                        onClick={() => {
                          setUserPopupOpen(false);
                          handleMenuClick();
                        }}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-[#D4C5B0] hover:text-[#E8C547] hover:bg-[#2a2319] transition-all"
                      >
                        <Settings className="w-4 h-4 text-[#C9A24A]" />
                        Pengaturan
                      </Link>

                      <Link
                        to="/download"
                        onClick={() => {
                          setUserPopupOpen(false);
                          handleMenuClick();
                        }}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-[#D4C5B0] hover:text-[#E8C547] hover:bg-[#2a2319] transition-all"
                      >
                        <Download className="w-4 h-4 text-[#C9A24A]" />
                        Download Aplikasi
                      </Link>

                      <button
                        onClick={() => {
                          setUserPopupOpen(false);
                          handleLogout();
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all text-left mt-1 border-t border-[#C9A24A]/10 pt-2"
                      >
                        <LogOut className="w-4 h-4 text-rose-400" />
                        Keluar Sesi
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </aside>
          {/* Floating Content Submenu */}
          {contentMenuOpen && (
            <div
              className="fixed z-[60] bg-[#1a1612] border border-[#C9A24A]/40 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] p-2 min-w-[180px] pointer-events-auto flex flex-col gap-1"
              style={{ top: contentMenuPos.top, left: contentMenuPos.left }}
            >
              {CONTENT_SUBMENU?.map((sub) => {
                const subActive = isActive(sub.href);
                return (
                  <Link
                    key={sub.label}
                    to={sub.href}
                    onClick={handleMenuClick}
                    className={`
                      flex items-center py-2.5 px-3 rounded-xl text-sm
                      transition-all duration-200
                      ${subActive
                        ? "bg-[#C9A24A]/30 text-[#E8C547] font-semibold"
                        : "text-[#A89F91] hover:bg-[#2a2319] hover:text-[#E8C547]"
                      }
                    `}
                  >
                    <span className="w-1.5 h-1.5 rounded-full mr-2.5 bg-current" />
                    {sub.label}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Content + Right Panel */}
        <div className="flex-1 flex min-h-0 bg-gray-50/50">
          <main className={`flex-1 min-w-0 pt-4 pb-6 px-4 sm:pt-5 sm:px-5 lg:pt-6 lg:px-6 overflow-y-auto transition-all duration-300`}>
            {children}
          </main>
          {!shouldHideRightPanel && (
            <DashboardRightPanel 
              session={session} 
              navbarLabel={navbarLabel} 
              role={role} 
              consultationsCount={consultationsCount}
              activeTreatmentsCount={activeTreatmentsCount}
              availableDoctorsCount={availableDoctorsCount}
            />
          )}
        </div>
      </div>
    </div>
  );
}
