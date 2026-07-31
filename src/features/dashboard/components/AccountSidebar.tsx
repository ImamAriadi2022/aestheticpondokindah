import { useState } from "react";
import { Link, useLocation } from "react-router";
import {
  LayoutDashboard,
  Calendar,
  MessageSquare,
  AlertCircle,
  HelpCircle,
  LogOut,
  Settings,
  CreditCard,
  ChevronRight,
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
  const [expanded, setExpanded] = useState(false);
  const [userExpanded, setUserExpanded] = useState(false);

  const toggleSidebar = () => {
    setExpanded((prev) => !prev);
  };

  const handleMenuClick = () => {
    setExpanded(false);
  };

  const homeMenus: MenuItem[] = [
    { label: "Dashboard", href: "/dashboard/user", icon: LayoutDashboard },
    { label: "Membership", href: "/membership", icon: CreditCard },
    { label: "Reservasi", href: "/dashboard/user?tab=reservasi", icon: Calendar },
    { label: "Konsultasi", href: "/dashboard/user?tab=konsultasi", icon: MessageSquare },
    { label: "Pengaduan", href: "/dashboard/user?tab=pengaduan", icon: AlertCircle },
    { label: "Bantuan", href: "/help", icon: HelpCircle },
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
          overflow-hidden
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
        <nav className="relative z-10 flex-1 flex flex-col gap-2 px-3 py-4">
          {homeMenus.map(({ label, href, icon: Icon }) => {
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
                <div className={`
                  flex items-center justify-center
                  w-9 h-9 rounded-xl
                  transition-all duration-300
                  ${active
                    ? "bg-[#E8C547]/20 text-[#FFF8E1] shadow-inner"
                    : "bg-[#2a2319] text-[#A89F91] group-hover:bg-[#3a3126] group-hover:text-[#E8C547]"
                  }
                `}>
                  <Icon className="w-[18px] h-[18px]" strokeWidth={active ? 2.5 : 2} />
                </div>

                {/* Label */}
                <span className={`
                  text-sm font-medium tracking-wide
                  transition-all duration-500
                  ${active ? "text-white" : "text-[#D4C5B0] group-hover:text-[#E8C547]"}
                  ${expanded ? "opacity-100 w-auto" : "opacity-0 w-0"}
                `}>
                  {label}
                </span>

                {/* Tooltip when collapsed */}
                {!expanded && (
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
                    {label}
                    {/* Tooltip Arrow */}
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
          
          {/* Settings */}
          <Link
            to="/settings"
            onClick={handleMenuClick}
            className={`
              group relative flex items-center
              h-12 rounded-2xl
              hover:bg-[#2a2319]
              transition-all duration-300
              ${expanded ? "px-3 gap-3" : "justify-center px-0"}
            `}
          >
            <div className="
              flex items-center justify-center
              w-9 h-9 rounded-xl
              bg-[#2a2319] text-[#A89F91]
              group-hover:bg-[#3a3126] group-hover:text-[#E8C547]
              transition-all duration-300
            ">
              <Settings className="w-[18px] h-[18px]" strokeWidth={2} />
            </div>
            <span className={`
              text-sm font-medium text-[#D4C5B0] group-hover:text-[#E8C547]
              transition-all duration-500
              ${expanded ? "opacity-100 w-auto" : "opacity-0 w-0"}
            `}>
              Settings
            </span>

            {!expanded && (
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
                Settings
                <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-[#1a1612] border-l border-t border-[#C9A24A]/40 rotate-45" />
              </div>
            )}
          </Link>

          {/* User Profile */}
          <div className={`
            group relative flex items-center
            h-14 rounded-2xl
            hover:bg-[#2a2319]
            transition-all duration-300 cursor-pointer
            ${expanded ? "px-3 gap-3" : "justify-center px-0"}
          `}>
            {/* Avatar */}
            <div className="relative">
              <div className="
                w-10 h-10 rounded-full
                bg-gradient-to-br from-[#E8C547] via-[#C9A24A] to-[#B8943F]
                flex items-center justify-center
                text-[#1a1612] font-semibold text-sm
                shadow-[0_4px_15px_rgba(201,162,74,0.4)]
                ring-2 ring-[#C9A24A]/50
              ">
                {userName ? userName.charAt(0).toUpperCase() : "U"}
              </div>
              {/* Online Indicator */}
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#22C55E] rounded-full border-2 border-[#1a1612]" />
            </div>

            {/* User Info */}
            <div className={`
              overflow-hidden transition-all duration-500
              ${expanded ? "w-auto opacity-100" : "w-0 opacity-0"}
            `}>
              <p className="text-sm font-semibold text-[#E8C547] whitespace-nowrap">
                {userName || "User"}
              </p>
              <p className="text-xs text-[#A89F91] whitespace-nowrap">
                Pasien
              </p>
            </div>

            {/* Logout Icon (when expanded) */}
            {expanded && (
              <button
                onClick={onLogout}
                className="
                  ml-auto p-2 rounded-lg
                  text-[#A89F91] hover:text-rose-400
                  hover:bg-rose-500/10
                  transition-all duration-200
                "
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}

            {/* Tooltip when collapsed */}
            {!expanded && (
              <div className="
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
              ">
                <p className="font-semibold">{userName || "User"}</p>
                <p className="text-xs text-[#A89F91]">Pasien</p>
                <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-[#1a1612] border-l border-t border-[#C9A24A]/40 rotate-45" />
              </div>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}
