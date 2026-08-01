import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router";
import { getSession } from "@/features/auth/services/session";
import {
  LayoutDashboard,
  Calendar,
  MessageSquare,
  AlertCircle,
  HelpCircle,
  LogOut,
  CreditCard,
  ChevronRight,
  ChevronDown,
  User,
  Pencil,
  LifeBuoy,
  Settings,
  Download,
} from "lucide-react";

interface MenuItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

interface AccountSidebarProps {
  userName?: string;
  onLogout?: () => void;
}

export default function AccountSidebar({ userName, onLogout }: AccountSidebarProps) {
  const location = useLocation();
  const session = getSession();

  const [expanded, setExpanded] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("apident:sidebar_expanded");
      return saved !== null ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  const [userPopupOpen, setUserPopupOpen] = useState(false);
  const [helpDropdownOpen, setHelpDropdownOpen] = useState(false);

  const popupRef = useRef<HTMLDivElement>(null);
  const avatarBtnRef = useRef<HTMLDivElement>(null);

  const toggleSidebar = () => {
    setExpanded((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("apident:sidebar_expanded", JSON.stringify(next));
      } catch {}
      return next;
    });
    setUserPopupOpen(false);
  };

  const handleMenuClick = () => {
    setUserPopupOpen(false);
  };

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

  const mainMenus: MenuItem[] = [
    { label: "Dashboard", href: "/dashboard/user", icon: LayoutDashboard },
    { label: "Membership", href: "/membership", icon: CreditCard },
    { label: "Reservasi", href: "/dashboard/user?tab=reservasi", icon: Calendar },
    { label: "Konsultasi", href: "/dashboard/user?tab=konsultasi", icon: MessageSquare },
  ];

  const helpSubMenus = [
    { label: "Pusat Bantuan (FAQ)", href: "/help", icon: HelpCircle },
    { label: "Pengaduan & Masukan", href: "/dashboard/user?tab=pengaduan", icon: AlertCircle },
  ];

  const isActive = (href: string) => {
    const [path, search] = href.split("?");
    if (location.pathname !== path) return false;

    const expectedParams = new URLSearchParams(search || "");
    const expectedTab = expectedParams.get("tab");

    const actualSearch = location.search.startsWith("?")
      ? location.search.slice(1)
      : location.search;
    const actualParams = new URLSearchParams(actualSearch);
    const actualTab = actualParams.get("tab") || "dashboard";

    if (!expectedTab) {
      return actualTab === "dashboard";
    }

    return expectedTab === actualTab;
  };

  const isHelpSectionActive = helpSubMenus.some((sub) => isActive(sub.href));
  const userDisplayName = userName || session?.name || "Pengguna";
  const userDisplayEmail = session?.email || "user@aestheticpondokindah.local";

  return (
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
          ${expanded ? "w-[240px]" : "w-[72px]"}
        `}
      >
        {/* Gradient Glow Effect */}
        <div className="absolute inset-0 rounded-[28px] bg-gradient-to-br from-[#C9A24A]/10 via-transparent to-[#B8943F]/10 pointer-events-none" />

        {/* Inner Border Glow */}
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
              ${expanded ? "rotate-180" : "rotate-0"}
            `}
            aria-label={expanded ? "Tutup sidebar" : "Buka sidebar"}
          >
            <ChevronRight className="w-5 h-5" strokeWidth={2.5} />
          </button>
        </div>

        {/* Divider */}
        <div className="mx-5 h-px bg-gradient-to-r from-transparent via-[#C9A24A]/40 to-transparent" />

        {/* Navigation */}
        <nav className="relative z-10 flex-1 flex flex-col gap-2 px-3 py-4 overflow-y-auto overflow-x-hidden">
          {mainMenus.map(({ label, href, icon: Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={label}
                to={href}
                onClick={handleMenuClick}
                className={`
                  group relative flex items-center
                  h-12 rounded-2xl
                  transition-all duration-300 ease-out
                  ${active
                    ? "bg-gradient-to-r from-[#C9A24A]/80 to-[#B8943F]/80 shadow-[0_4px_20px_rgba(201,162,74,0.3)]"
                    : "hover:bg-[#2a2319]"
                  }
                  ${expanded ? "px-3 gap-3" : "justify-center px-0"}
                `}
              >
                {/* Active Glow */}
                {active && (
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#C9A24A]/20 to-[#E8C547]/20 blur-xl -z-10" />
                )}

                {/* Icon Container */}
                <div
                  className={`
                  flex items-center justify-center
                  w-9 h-9 rounded-xl
                  transition-all duration-300
                  ${active
                    ? "bg-[#E8C547]/20 text-[#FFF8E1] shadow-inner"
                    : "bg-[#2a2319] text-[#A89F91] group-hover:bg-[#3a3126] group-hover:text-[#E8C547]"
                  }
                `}
                >
                  <Icon className="w-[18px] h-[18px]" strokeWidth={active ? 2.5 : 2} />
                </div>

                {/* Label */}
                <span
                  className={`
                  text-sm font-medium transition-all duration-500
                  ${active ? "text-white" : "text-[#D4C5B0] group-hover:text-[#E8C547]"}
                  ${expanded ? "opacity-100 w-auto" : "opacity-0 w-0"}
                `}
                >
                  {label}
                </span>

                {/* Tooltip when collapsed */}
                {!expanded && (
                  <div
                    className="
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
                  "
                  >
                    {label}
                    <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-[#1a1612] border-l border-t border-[#C9A24A]/40 rotate-45" />
                  </div>
                )}
              </Link>
            );
          })}

          {/* COMBINED DROPDOWN: Bantuan & Pengaduan */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                if (!expanded) setExpanded(true);
                setHelpDropdownOpen((prev) => !prev);
              }}
              className={`
                w-full group relative flex items-center justify-between
                h-12 rounded-2xl
                transition-all duration-300 ease-out cursor-pointer
                ${isHelpSectionActive
                  ? "bg-gradient-to-r from-[#C9A24A]/80 to-[#B8943F]/80 shadow-[0_4px_20px_rgba(201,162,74,0.3)] text-white"
                  : "hover:bg-[#2a2319] text-[#D4C5B0]"
                }
                ${expanded ? "px-3 gap-3" : "justify-center px-0"}
              `}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`
                  flex items-center justify-center
                  w-9 h-9 rounded-xl shrink-0
                  transition-all duration-300
                  ${isHelpSectionActive
                    ? "bg-[#E8C547]/20 text-[#FFF8E1] shadow-inner"
                    : "bg-[#2a2319] text-[#A89F91] group-hover:bg-[#3a3126] group-hover:text-[#E8C547]"
                  }
                `}
                >
                  <LifeBuoy className="w-[18px] h-[18px]" strokeWidth={isHelpSectionActive ? 2.5 : 2} />
                </div>

                <span
                  className={`
                  text-sm font-medium transition-all duration-500 truncate
                  ${isHelpSectionActive ? "text-white" : "text-[#D4C5B0] group-hover:text-[#E8C547]"}
                  ${expanded ? "opacity-100 w-auto" : "opacity-0 w-0"}
                `}
                >
                  Bantuan & Pengaduan
                </span>
              </div>

              {expanded && (
                <ChevronDown
                  className={`w-4 h-4 text-[#A89F91] transition-transform duration-300 shrink-0 ${
                    helpDropdownOpen ? "rotate-180 text-[#E8C547]" : ""
                  }`}
                />
              )}

              {/* Tooltip when collapsed */}
              {!expanded && (
                <div
                  className="
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
                "
                >
                  Bantuan & Pengaduan
                  <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-[#1a1612] border-l border-t border-[#C9A24A]/40 rotate-45" />
                </div>
              )}
            </button>

            {/* Sub-menu Items Accordion */}
            {expanded && (helpDropdownOpen || isHelpSectionActive) && (
              <div className="ml-4 mt-1 pl-3 border-l-2 border-[#C9A24A]/30 space-y-1 py-1">
                {helpSubMenus.map((sub) => {
                  const subActive = isActive(sub.href);
                  const SubIcon = sub.icon;
                  return (
                    <Link
                      key={sub.label}
                      to={sub.href}
                      onClick={handleMenuClick}
                      className={`
                        flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all
                        ${subActive
                          ? "bg-[#C9A24A]/30 text-[#E8C547] border border-[#C9A24A]/40"
                          : "text-[#A89F91] hover:text-[#E8C547] hover:bg-[#2a2319]"
                        }
                      `}
                    >
                      <SubIcon className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{sub.label}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
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
                ${expanded ? "px-3 gap-3" : "justify-center px-0"}
              `}
            >
              {/* Avatar */}
              <div className="relative">
                {(session as any)?.avatar ? (
                  <img
                    src={(session as any).avatar.includes("storage/data:image") ? (session as any).avatar.substring((session as any).avatar.indexOf("data:image")) : (session as any).avatar}
                    alt={userDisplayName}
                    className="w-10 h-10 rounded-full object-cover shadow-[0_4px_15px_rgba(201,162,74,0.4)] ring-2 ring-[#C9A24A]/50"
                  />
                ) : (
                  <div
                    className="
                    w-10 h-10 rounded-full
                    bg-gradient-to-br from-[#E8C547] via-[#C9A24A] to-[#B8943F]
                    flex items-center justify-center
                    text-[#1a1612] font-semibold text-sm
                    shadow-[0_4px_15px_rgba(201,162,74,0.4)]
                    ring-2 ring-[#C9A24A]/50
                  "
                  >
                    {userDisplayName ? userDisplayName.charAt(0).toUpperCase() : "U"}
                  </div>
                )}
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#22C55E] rounded-full border-2 border-[#1a1612]" />
              </div>

              {/* User Info */}
              <div
                className={`
                overflow-hidden transition-all duration-500
                ${expanded ? "w-auto opacity-100" : "w-0 opacity-0"}
              `}
              >
                <p className="text-sm font-semibold text-[#E8C547] whitespace-nowrap">
                  {userDisplayName}
                </p>
                <p className="text-xs text-[#A89F91] whitespace-nowrap">Pasien</p>
              </div>

              {/* Tooltip when collapsed & closed */}
              {!expanded && !userPopupOpen && (
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
                  <p className="font-semibold">{userDisplayName}</p>
                  <p className="text-xs text-[#A89F91]">Pasien</p>
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
                      alt={userDisplayName}
                      className="w-11 h-11 rounded-full object-cover shadow-md shrink-0 border border-[#C9A24A]"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#E8C547] to-[#B8943F] flex items-center justify-center text-[#1a1612] font-bold text-base shadow-md shrink-0">
                      {userDisplayName ? userDisplayName.charAt(0).toUpperCase() : "U"}
                    </div>
                  )}
                  <div className="overflow-hidden min-w-0">
                    <p className="text-sm font-bold text-[#E8C547] truncate">{userDisplayName}</p>
                    <p className="text-xs text-[#A89F91] truncate">{userDisplayEmail}</p>
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
                    Edit Profil
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
                    to="/dashboard/user?tab=download"
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
                      if (onLogout) onLogout();
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
    </div>
  );
}
