import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router";
import {
  Bell,
  CheckCircle2,
  Clock,
  ExternalLink,
  Info,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Volume2,
  VolumeX,
  X,
  Trash2,
  Check,
  AlertCircle,
  Calendar,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import {
  subscribeToPushNotifications,
  playNotificationChime,
  type PushNotificationPayload,
} from "@/core/services/pushNotificationService";
import { getSession } from "@/core/auth/services/session";

interface DashboardTopBarProps {
  role: "user" | "clinic" | "doctor";
  navbarLabel?: string;
}

export default function DashboardTopBar({ role, navbarLabel }: DashboardTopBarProps) {
  const session = getSession();
  const navigate = useNavigate();

  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(
    typeof window !== "undefined" && "Notification" in window ? Notification.permission : "default"
  );
  const [notifications, setNotifications] = useState<PushNotificationPayload[]>(() => {
    try {
      const cached = localStorage.getItem("apig_recent_push_notifications");
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  const [unreadCount, setUnreadCount] = useState<number>(() => {
    try {
      return Number(localStorage.getItem("apig_push_unread_count") || 0);
    } catch {
      return 0;
    }
  });

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Subscribe to real-time push notification dispatcher
  useEffect(() => {
    const unsubscribe = subscribeToPushNotifications((payload) => {
      setNotifications((prev) => {
        const updated = [
          {
            ...payload,
            id: payload.id || `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            dateStr: payload.dateStr || new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
          },
          ...prev.slice(0, 49),
        ];
        try {
          localStorage.setItem("apig_recent_push_notifications", JSON.stringify(updated));
        } catch {}
        return updated;
      });

      setUnreadCount((prev) => {
        const next = prev + 1;
        try {
          localStorage.setItem("apig_push_unread_count", String(next));
        } catch {}
        return next;
      });
    });

    return () => unsubscribe();
  }, []);

  // Sync notification permission status
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleRequestPermission = async () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      try {
        const perm = await Notification.requestPermission();
        setNotificationPermission(perm);
        if (perm === "granted") {
          playNotificationChime("confirmed");
          new Notification("🔔 Notifikasi Berhasil Diaktifkan", {
            body: "Anda akan menerima notifikasi instan untuk setiap reservasi baru dan update status pasien.",
            icon: "/logo/logo.png",
          });
        }
      } catch (e) {
        console.warn("Failed to request permission:", e);
      }
    }
  };

  const handleClearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
    localStorage.removeItem("apig_recent_push_notifications");
    localStorage.setItem("apig_push_unread_count", "0");
  };

  const handleMarkAllAsRead = () => {
    setUnreadCount(0);
    localStorage.setItem("apig_push_unread_count", "0");
  };

  const handleItemClick = (item: PushNotificationPayload) => {
    setIsDropdownOpen(false);
    if (item.onClick) {
      item.onClick();
    } else if (item.url) {
      navigate(item.url.replace(/^#/, ""));
    } else if (role === "clinic") {
      navigate("/dashboard/clinic?tab=reservasi");
    } else if (role === "doctor") {
      navigate("/dashboard/doctor?tab=reservasi");
    } else {
      navigate("/dashboard/user?tab=reservasi");
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#E8DFC8] px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3 shadow-xs">
      {/* Left: Branding & Role Context */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#8C6B1C] to-[#C9A24A] flex items-center justify-center text-white font-bold text-sm shadow-xs">
            A
          </div>
          <div>
            <h1 className="text-xs sm:text-sm font-bold text-[#2C2416] flex items-center gap-1.5 leading-tight">
              <span>Aesthetic Pondok Indah</span>
              <span className="hidden sm:inline-block text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#FAF5EA] text-[#8C6B1C] border border-[#EADBBD]">
                {role === "clinic" ? "Admin Klinik" : role === "doctor" ? "Dokter Spesialis" : "Pasien Member"}
              </span>
            </h1>
            <p className="text-[10px] text-[#8C8272] hidden sm:block">
              {navbarLabel || "Sistem Manajemen Klinik & Reservasi Terpadu"}
            </p>
          </div>
        </div>

        {/* Live Realtime Pulse Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold shadow-2xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="hidden md:inline">Realtime Aktif (1s)</span>
        </div>
      </div>

      {/* Right: Actions & Notification Bell */}
      <div className="flex items-center gap-2 sm:gap-3" ref={dropdownRef}>
        {/* Permission Request Prompt Button (If not granted) */}
        {notificationPermission !== "granted" && (
          <button
            type="button"
            onClick={handleRequestPermission}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#8C6B1C] hover:bg-[#735614] text-white text-[11px] font-bold shadow-xs transition-all cursor-pointer animate-pulse"
            title="Klik untuk mengaktifkan notifikasi popup desktop & suara"
          >
            <Bell className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Izinkan Notifikasi Push</span>
            <span className="sm:hidden">Notif ON</span>
          </button>
        )}

        {/* Sound Test / Toggle */}
        <button
          type="button"
          onClick={() => {
            playNotificationChime("new_booking");
          }}
          className="w-9 h-9 rounded-xl border border-[#E8DFC8] bg-[#FAF8F5] hover:bg-[#FAF5EA] text-[#8C6B1C] flex items-center justify-center transition-colors cursor-pointer"
          title="Uji Suara Notifikasi (Chime Sound)"
        >
          <Volume2 className="w-4 h-4" />
        </button>

        {/* Notification Bell Dropdown Button */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setIsDropdownOpen((prev) => !prev);
              if (!isDropdownOpen) {
                handleMarkAllAsRead();
              }
            }}
            className={`relative w-9 h-9 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
              isDropdownOpen
                ? "bg-[#8C6B1C] text-white border-[#8C6B1C] shadow-md"
                : "bg-white border-[#D9D0BC] hover:border-[#8C6B1C] text-[#3D332A] shadow-xs"
            }`}
            title="Pusat Notifikasi Realtime"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-600 text-white text-[10px] font-extrabold flex items-center justify-center border-2 border-white shadow-xs animate-bounce">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {/* Notification Center Dropdown Drawer */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-[92vw] sm:w-96 max-w-sm bg-white rounded-3xl border border-[#E8DFC8] shadow-2xl overflow-hidden z-50 animate-in fade-in-50 zoom-in-95 duration-200 text-left">
              {/* Drawer Header */}
              <div className="px-4 py-3.5 bg-[#FAF8F5] border-b border-[#EDE5D6] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-[#8C6B1C]" />
                  <h3 className="text-xs font-bold text-[#2C2416]">Pusat Notifikasi Realtime</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EADBBD] text-[#5C4510]">
                    {notifications.length}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {notifications.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearAll}
                      className="text-[10px] text-rose-600 hover:text-rose-700 font-semibold p-1 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                      title="Bersihkan Semua"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Hapus</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(false)}
                    className="w-6 h-6 rounded-full bg-white hover:bg-gray-100 text-gray-500 flex items-center justify-center cursor-pointer ml-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Drawer Body: Notification List */}
              <div className="max-h-[380px] overflow-y-auto divide-y divide-[#F5EFE6]">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center space-y-2 text-[#8C8272]">
                    <div className="w-12 h-12 rounded-full bg-[#FAF5EA] text-[#8C6B1C] flex items-center justify-center mx-auto">
                      <Bell className="w-6 h-6 opacity-60" />
                    </div>
                    <p className="text-xs font-semibold text-[#3D332A]">Belum Ada Notifikasi Baru</p>
                    <p className="text-[11px] leading-relaxed">
                      Setiap ada booking dari Guest, Pasien, atau konfirmasi dokter, notifikasi akan otomatis muncul di sini secara realtime.
                    </p>
                  </div>
                ) : (
                  notifications.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      onClick={() => handleItemClick(item)}
                      className="p-3.5 hover:bg-[#FAF8F5] transition-colors cursor-pointer flex items-start gap-3 group"
                    >
                      <div className="w-9 h-9 rounded-xl bg-[#FAF5EA] border border-[#EADBBD] flex items-center justify-center text-[#8C6B1C] shrink-0 shadow-2xs group-hover:scale-105 transition-transform mt-0.5">
                        {item.type === "reservation_confirmed" ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : item.type === "doctor_assigned" ? (
                          <Stethoscope className="w-4 h-4 text-[#8C6B1C]" />
                        ) : (
                          <Calendar className="w-4 h-4 text-[#8C6B1C]" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0 space-y-0.5">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[10px] font-bold text-[#8C6B1C] truncate">
                            {item.sender || "Sistem Reservasi"}
                          </span>
                          <span className="text-[9px] text-[#A0988A] shrink-0 flex items-center gap-0.5">
                            <Clock className="w-2.5 h-2.5" />
                            {item.dateStr || "Baru saja"}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-[#2C2416] line-clamp-1 group-hover:text-[#8C6B1C]">
                          {item.title}
                        </p>
                        <p className="text-[11px] text-[#5C5546] line-clamp-2 leading-relaxed">
                          {item.message}
                        </p>
                        {item.bookingCode && (
                          <span className="inline-block text-[9px] font-bold text-[#8C6B1C] bg-[#FAF5EA] px-2 py-0.5 rounded-md border border-[#EADBBD] mt-1">
                            {item.bookingCode}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Drawer Footer */}
              <div className="p-3 bg-[#FAF8F5] border-t border-[#EDE5D6] text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    if (role === "clinic") navigate("/dashboard/clinic?tab=reservasi");
                    else if (role === "doctor") navigate("/dashboard/doctor?tab=reservasi");
                    else navigate("/dashboard/user?tab=reservasi");
                  }}
                  className="text-xs font-bold text-[#8C6B1C] hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>Buka Semua Data Reservasi</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
