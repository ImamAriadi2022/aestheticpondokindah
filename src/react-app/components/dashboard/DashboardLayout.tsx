import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { clearSession, getSession } from "@/react-app/lib/demoAuth";
import { clearSessionStorage, touchSessionLastActive } from "@/react-app/lib/sessionTtl";
import AccountSidebar from "@/react-app/components/dashboard/AccountSidebar";
import MobileDashboardLayout from "./MobileDashboardLayout";
import { logger } from "@/react-app/lib/logger";
import DashboardRightPanel from "./DashboardRightPanel";
import {
  LayoutDashboard,
  Calendar,
  Users,
  FileText,
  MessageSquare,
  AlertCircle,
  LogOut,
  ChevronDown,
  Stethoscope,
  ChevronRight,
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

interface MenuItem {
  label: string;
  icon: React.ElementType;
  href: string;
  badge?: number;
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

  const toggleSidebar = () => {
    setSidebarExpanded((prev) => !prev);
    setContentMenuOpen(false);
  };

  const handleMenuClick = () => {
    setSidebarExpanded(false);
    setContentMenuOpen(false);
  };
  const location = useLocation();
  const navigate = useNavigate();
  
  // Ambil session dari demo atau backend asli
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

  // 4-Tier Membership System
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
    diamond: {
      label: 'VIP Member',
      shortLabel: 'VIP',
      gradient: 'from-[#B9F2FF] to-[#7DD3E8]',
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
    if (role === "user" && isMembership) return config.label;
    return "Client Klinik";
  };

  const navbarLabel = getNavbarLabel();

  useEffect(() => {
    touchSessionLastActive();
  }, [location.pathname, location.search]);

  const getMenuItems = (): MenuItem[] => {
    switch (role) {
      case "user":
        return [
          { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard/user" },
          { label: "Konsultasi", icon: Calendar, href: "/dashboard/user?tab=konsultasi" },
          { label: "Pengaduan", icon: AlertCircle, href: "/dashboard/user?tab=pengaduan" },
        ];
      case "clinic":
        return [
          { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard/clinic" },
          { label: "Reservasi", icon: Calendar, href: "/dashboard/clinic?tab=reservasi" },
          { label: "Konsultasi", icon: MessageSquare, href: "/dashboard/clinic?tab=konsultasi" },
          { label: "Pengaduan", icon: AlertCircle, href: "/dashboard/clinic?tab=pengaduan" },
          { label: "Konten", icon: FileText, href: "/dashboard/clinic?tab=content-blog" },
          { label: "Pengguna", icon: Users, href: "/dashboard/clinic?tab=users" },
          { label: "Dokter", icon: Stethoscope, href: "/dashboard/clinic?tab=doctors" },
        ];
      case "doctor":
        return [
          { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard/doctor" },
          { label: "Jadwal", icon: Calendar, href: "/dashboard/doctor?tab=jadwal" },
          { label: "Klien", icon: Users, href: "/dashboard/doctor?tab=klien", badge: 3 },
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

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
  const hideRightPanelPages = ["/membership", "/settings", "/help"];
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
              overflow-hidden
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

              {/* Logout */}
              <button
                onClick={() => {
                  handleMenuClick();
                  handleLogout();
                }}
                className={`
                  group relative flex items-center w-full
                  h-12 rounded-2xl
                  hover:bg-[#2a2319]
                  transition-all duration-300
                  ${sidebarExpanded ? "px-3 gap-3" : "justify-center px-0"}
                `}
              >
                <div className="
                  flex items-center justify-center w-9 h-9 rounded-xl
                  bg-[#2a2319] text-[#A89F91]
                  group-hover:bg-rose-500/10 group-hover:text-rose-400
                  transition-all duration-300
                ">
                  <LogOut className="w-[18px] h-[18px]" strokeWidth={2} />
                </div>
                <span className={`
                  text-sm font-medium text-[#D4C5B0] group-hover:text-rose-400
                  transition-all duration-500
                  ${sidebarExpanded ? "opacity-100 w-auto" : "opacity-0 w-0"}
                `}>
                  Keluar
                </span>
                
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
                    Keluar
                    <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-[#1a1612] border-l border-t border-[#C9A24A]/40 rotate-45" />
                  </div>
                )}
              </button>
            </div>
          </aside>
          {/* Floating Content Submenu */}
          {contentMenuOpen && (
            <div
              className="fixed z-[60] bg-[#1a1612] border border-[#C9A24A]/40 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] p-2 min-w-[180px] pointer-events-auto flex flex-col gap-1"
              style={{ top: contentMenuPos.top, left: contentMenuPos.left }}
            >
              {[
                { label: "Blog", href: "/dashboard/clinic?tab=content-blog" },
                { label: "Promo", href: "/dashboard/clinic?tab=content-promo" },
                { label: "Pop Up", href: "/dashboard/clinic?tab=content-popup" },
                { label: "Galeri", href: "/dashboard/clinic?tab=content-gallery" },
                { label: "Testimoni", href: "/dashboard/clinic?tab=content-testimonials" },
                { label: "Download App", href: "/dashboard/clinic?tab=content-download" },
              ].map((sub) => {
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
