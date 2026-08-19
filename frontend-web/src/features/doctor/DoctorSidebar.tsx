import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router";
import { getSession } from "@/core/auth/services/session";
import { getMenuItems } from "@/core/permissions/index";
import { ChevronRight, LogOut, User, Settings, Download } from "lucide-react";

interface DoctorSidebarProps {
  onLogout: () => void;
}

export default function DoctorSidebar({ onLogout }: DoctorSidebarProps) {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [userPopupOpen, setUserPopupOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const avatarBtnRef = useRef<HTMLDivElement>(null);

  const location = useLocation();
  const session = getSession();

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
    setUserPopupOpen(false);
  };

  const handleMenuClick = () => {
    setSidebarExpanded(false);
    setUserPopupOpen(false);
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

  const menuItems = getMenuItems("doctor");

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
                  {session?.name || "Dokter Klinik"}
                </p>
                <p className="text-xs text-[#A89F91] whitespace-nowrap">Dokter Spesialis</p>
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
                  <p className="font-semibold">{session?.name || "Dokter Klinik"}</p>
                  <p className="text-xs text-[#A89F91]">Dokter Spesialis</p>
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
                    onClick={handleMenuClick}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-[#D4C5B0] hover:text-[#E8C547] hover:bg-[#2a2319] transition-all"
                  >
                    <User className="w-4 h-4 text-[#C9A24A]" />
                    Detail Profil
                  </Link>

                  <Link
                    to="/settings"
                    onClick={handleMenuClick}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-[#D4C5B0] hover:text-[#E8C547] hover:bg-[#2a2319] transition-all"
                  >
                    <Settings className="w-4 h-4 text-[#C9A24A]" />
                    Pengaturan
                  </Link>

                  <Link
                    to="/download"
                    onClick={handleMenuClick}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-[#D4C5B0] hover:text-[#E8C547] hover:bg-[#2a2319] transition-all"
                  >
                    <Download className="w-4 h-4 text-[#C9A24A]" />
                    Download Aplikasi
                  </Link>

                  <button
                    onClick={() => {
                      setUserPopupOpen(false);
                      onLogout();
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
