import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router";
import {
  Bell,
  CheckCircle2,
  Clock,
  ExternalLink,
  Info,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  X,
  Trash2,
  Calendar,
  User,
  Settings,
  Upload,
  LogOut,
  ChevronDown,
  FileText,
} from "lucide-react";
import {
  subscribeToPushNotifications,
  type PushNotificationPayload,
  markNotificationAsRead,
  clearNotificationHistory,
} from "@/core/services/pushNotificationService";
import { getSession, clearSession } from "@/core/auth/services/session";
import { clearSessionStorage } from "@/core/auth/services/sessionTtl";
import { subscribeToWebPush } from "@/core/services/webPushManager";
import { apiClient } from "@/core/api/apiClient";

interface DashboardTopBarProps {
  role: "user" | "clinic" | "doctor";
  navbarLabel?: string;
}

export default function DashboardTopBar({ role, navbarLabel }: DashboardTopBarProps) {
  const session = getSession();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "";
  const pathname = location.pathname;

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
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(e.target as Node)
      ) {
        setIsProfileOpen(false);
      }
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    clearSession();
    clearSessionStorage();
    navigate("/login");
  };

  const getPageInfo = () => {
    if (role === "clinic") {
      switch (activeTab) {
        case "reservasi":
          return { title: "Daftar Reservasi & Antrean", subtitle: "Kelola data reservasi dan antrean pasien klinik" };
        case "konsultasi":
          return { title: "Layanan Konsultasi", subtitle: "Pantau dan kelola konsultasi medis pasien" };
        case "pengaduan":
          return { title: "Pengaduan & Masukan Pasien", subtitle: "Tindak lanjut keluhan dan aspirasi pasien" };
        case "doctors":
          return { title: "Manajemen Tim Dokter Spesialis", subtitle: "Kelola profil dan spesialisasi dokter" };
        case "users":
          return { title: "Kelola Data Pasien & Pengguna", subtitle: "Kelola akun pengguna terdaftar" };
        case "jadwal-dokter":
          return { title: "Kelola Jadwal Praktik", subtitle: "Atur ketersediaan dan sesi praktik dokter" };
        case "membership":
          return { title: "Manajemen Keanggotaan", subtitle: "Kelola program loyalty dan tier membership" };
        case "analytics":
          return { title: "Analitik & Statistik Klinik", subtitle: "Ringkasan data operasional dan pengunjung" };
        case "content-blog":
          return { title: "Manajemen Artikel Blog", subtitle: "Kelola publikasi edukasi kesehatan gigi" };
        case "content-promo":
          return { title: "Manajemen Promo & Diskon", subtitle: "Kelola program promo dan penawaran spesial" };
        case "content-gallery":
          return { title: "Galeri & Dokumentasi", subtitle: "Kelola foto fasilitas dan hasil perawatan" };
        case "content-testimonials":
          return { title: "Ulasan & Testimoni", subtitle: "Kelola testimoni resmi pasien klinik" };
        case "content-popup":
          return { title: "Banner Promo & Pengumuman", subtitle: "Kelola banner popup publik" };
        case "content-download":
          return { title: "File & Aplikasi Mobile", subtitle: "Kelola file unduhan aplikasi mobile" };
        case "settings":
          return { title: "Pengaturan Sistem Klinik", subtitle: "Konfigurasi kop surat, logo, syarat & ketentuan, dan surat perjanjian" };
        default:
          return { title: "Dashboard Utama Klinik", subtitle: "Ringkasan operasional klinik hari ini" };
      }
    }

    if (role === "doctor") {
      switch (activeTab) {
        case "reservasi":
          return { title: "Jadwal & Antrean Pasien", subtitle: "Daftar pasien terkonfirmasi dan jadwal tindakan" };
        case "konsultasi":
          return { title: "Konsultasi Medis Online", subtitle: "Sesi tanya jawab medis bersama pasien" };
        case "pengaduan":
          return { title: "Tinjauan Pengaduan Pasien", subtitle: "Evaluasi dan umpan balik layanan dokter" };
        case "jadwal":
          return { title: "Pengaturan Jadwal Praktik", subtitle: "Atur hari dan jam ketersediaan praktik" };
        case "settings":
          return { title: "Pengaturan Akun Dokter", subtitle: "Preferensi akun dan keamanan" };
        default:
          return { title: "Dashboard Dokter Spesialis", subtitle: "Ringkasan jadwal dan antrean pasien hari ini" };
      }
    }

    if (pathname.startsWith("/profile")) {
      return { title: "Detail Profil Pasien", subtitle: "Informasi data pribadi dan riwayat medis" };
    }
    if (pathname.startsWith("/settings")) {
      return { title: "Pengaturan Akun & Keamanan", subtitle: "Preferensi akun dan kata sandi" };
    }
    if (pathname.startsWith("/membership")) {
      return { title: "Status & Program Membership", subtitle: "Keuntungan dan tingkatan loyalty member" };
    }

    switch (activeTab) {
      case "reservasi":
        return { title: "Pemesanan & Jadwal Reservasi", subtitle: "Buat janji temu dan pantau riwayat perawatan gigi" };
      case "konsultasi":
        return { title: "Konsultasi Dokter Gigi", subtitle: "Tanya jawab langsung dengan dokter spesialis" };
      case "pengaduan":
        return { title: "Pusat Bantuan & Pengaduan", subtitle: "Sampaikan pertanyaan atau kendala layanan" };
      default:
        return { title: "Dashboard Pasien", subtitle: "Ringkasan janji temu dan riwayat perawatan gigi Anda" };
    }
  };

  const { title: pageTitle, subtitle: pageSubtitle } = getPageInfo();

  const getLoginAsText = () => {
    if (role === "clinic") return "Admin Klinik";
    if (role === "doctor") {
      return session?.name ? `${session.name} (Dokter Spesialis)` : "Dokter Spesialis";
    }
    return session?.name ? `${session.name} (Pasien Member)` : "Pasien Member";
  };

  const fetchDatabaseNotifications = async () => {
    try {
      const res: any = await apiClient.get("/user/notifications", { skipToast: true });
      const list = res?.notifications || res?.data?.notifications || res?.data || (Array.isArray(res) ? res : []);
      if (Array.isArray(list) && list.length > 0) {
        const mapped: PushNotificationPayload[] = list.map((item: any) => ({
          id: String(item.id),
          title: item.title || "🔔 Notifikasi Klinik",
          message: item.body || item.message || "",
          sender: item.type === "appointment" ? "Sistem Reservasi" : "Aesthetic Pondok Indah",
          role: role === "clinic" ? "admin" : role === "doctor" ? "doctor" : "patient",
          type: item.type || "general",
          bookingCode: item.data?.code || item.data?.bookingCode,
          url: item.data?.url || (role === "clinic" ? "/dashboard/clinic?tab=reservasi" : "/dashboard/user?tab=reservasi"),
        }));

        setNotifications((prev: PushNotificationPayload[]) => {
          const combined = [...mapped, ...prev.filter((p: PushNotificationPayload) => !mapped.some((m: PushNotificationPayload) => m.id === p.id))];
          try {
            localStorage.setItem("apig_recent_push_notifications", JSON.stringify(combined.slice(0, 30)));
          } catch {}
          return combined.slice(0, 30);
        });

        const unreadItems = list.filter((item: any) => !item.read_at && !item.is_read);
        if (unreadItems.length > 0) {
          setUnreadCount(unreadItems.length);
          localStorage.setItem("apig_push_unread_count", String(unreadItems.length));
        }
      }
    } catch {}
  };

  useEffect(() => {
    fetchDatabaseNotifications();

    const unsubscribe = subscribeToPushNotifications((payload: PushNotificationPayload) => {
      setNotifications((prev: PushNotificationPayload[]) => {
        const updated = [payload, ...prev.filter((p: PushNotificationPayload) => p.id !== payload.id)];
        try {
          localStorage.setItem("apig_recent_push_notifications", JSON.stringify(updated.slice(0, 30)));
        } catch {}
        return updated.slice(0, 30);
      });

      setUnreadCount((prev: number) => {
        const next = prev + 1;
        try {
          localStorage.setItem("apig_push_unread_count", String(next));
        } catch {}
        return next;
      });
    });

    return () => {
      unsubscribe();
    };
  }, [role]);

  const requestPushPermission = async () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      try {
        const perm = await Notification.requestPermission();
        setNotificationPermission(perm);
        if (perm === "granted") {
          await subscribeToWebPush();
        }
      } catch {}
    }
  };

  useEffect(() => {
    if (notificationPermission === "default") {
      const timer = setTimeout(() => {
        requestPushPermission();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [notificationPermission]);

  const handleClearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
    clearNotificationHistory();
    try {
      apiClient.delete("/user/notifications", { skipToast: true });
    } catch {}
  };

  const handleMarkAllAsRead = async () => {
    setUnreadCount(0);
    localStorage.setItem("apig_push_unread_count", "0");
    notifications.forEach((n: PushNotificationPayload) => {
      if (n.id) markNotificationAsRead(`id_${n.id}`);
      if (n.bookingCode) markNotificationAsRead(`code_${n.type || "gen"}_${n.bookingCode}`);
    });
    try {
      await apiClient.post("/user/notifications/read-all", {}, { skipToast: true });
    } catch {}
  };

  const handleItemClick = async (item: PushNotificationPayload) => {
    setIsDropdownOpen(false);
    if (item.id) markNotificationAsRead(`id_${item.id}`);
    if (item.bookingCode) markNotificationAsRead(`code_${item.type || "gen"}_${item.bookingCode}`);

    if (item.id) {
      try {
        await apiClient.post(`/user/notifications/${item.id}/read`, {}, { skipToast: true });
      } catch {}
    }

    setUnreadCount((prev: number) => Math.max(0, prev - 1));

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
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E8DFC8] px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3 shadow-xs">
      {/* Left: Penjelasan Halaman & Status Login */}
      <div className="flex flex-col gap-0.5 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-xs sm:text-sm font-bold text-[#2C2416] tracking-tight truncate">
            {pageTitle}
          </h1>
          <span className="text-[10px] font-semibold text-[#8C6B1C] bg-[#FAF5EA] border border-[#EADBBD] px-2 py-0.5 rounded-full flex items-center gap-1">
            <span className="text-[#8C8272] font-normal">Login sebagai:</span>
            <span className="font-bold">{getLoginAsText()}</span>
          </span>
        </div>
        <p className="text-[10px] text-[#8C8272] hidden sm:block truncate">
          {pageSubtitle}
        </p>
      </div>

      {/* Right: Ikon Notifikasi & Profil Dropdown (Termasuk Pengaturan Klinik) */}
      <div className="flex items-center gap-2.5">
        {/* Notification Bell */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => {
              setIsDropdownOpen((prev) => !prev);
              setIsProfileOpen(false);
            }}
            className="relative p-2 rounded-xl text-[#6B5E4F] hover:text-[#8C6B1C] hover:bg-[#FAF5EA] border border-[#E8DFC8] transition-all cursor-pointer shadow-2xs"
            title="Lihat Notifikasi"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center border-2 border-white shadow-xs animate-in zoom-in-50">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown Panel */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-[#E8DFC8] rounded-2xl shadow-xl overflow-hidden z-50 animate-in fade-in-50 zoom-in-95 duration-150 text-left">
              <div className="px-4 py-3 bg-[#FAF8F5] border-b border-[#E8DFC8] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-[#8C6B1C]" />
                  <span className="text-xs font-bold text-[#2C2416]">Notifikasi Masuk</span>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-md bg-[#8C6B1C] text-white text-[9px] font-bold">
                      {unreadCount} baru
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={handleMarkAllAsRead}
                      className="text-[10px] text-[#8C6B1C] hover:underline font-semibold cursor-pointer"
                    >
                      Tandai Dibaca
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearAll}
                      className="text-[10px] text-rose-600 hover:text-rose-700 font-semibold cursor-pointer ml-1"
                    >
                      Hapus
                    </button>
                  )}
                </div>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-[#F0EAE1]">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center px-4 space-y-1">
                    <CheckCircle2 className="w-7 h-7 text-emerald-500 mx-auto stroke-1" />
                    <p className="text-xs font-semibold text-[#2C2416]">Tidak Ada Notifikasi Baru</p>
                    <p className="text-[10px] text-[#8C8272]">Semua notifikasi dan janji temu telah ditinjau.</p>
                  </div>
                ) : (
                  notifications.map((item: PushNotificationPayload, idx: number) => (
                    <div
                      key={item.id || idx}
                      onClick={() => handleItemClick(item)}
                      className="p-3.5 hover:bg-[#FAF8F5] transition-colors cursor-pointer space-y-1"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#8C6B1C] shrink-0" />
                          <p className="text-xs font-bold text-[#2C2416] line-clamp-1">{item.title}</p>
                        </div>
                        <span className="text-[9px] text-[#8C8272] shrink-0">
                          {(item as any).receivedAt ? new Date((item as any).receivedAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) : "Baru"}
                        </span>
                      </div>
                      <p className="text-xs text-[#5C5546] pl-3.5 line-clamp-2 leading-relaxed">{item.message}</p>
                      {item.bookingCode && (
                        <div className="pl-3.5 pt-0.5">
                          <span className="inline-block px-1.5 py-0.5 rounded bg-[#FAF5EA] border border-[#EADBBD] text-[9px] font-mono font-bold text-[#8C6B1C]">
                            {item.bookingCode}
                          </span>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Avatar Button & Dropdown (Area Profil / Pengaturan Klinik) */}
        <div className="relative" ref={profileDropdownRef}>
          <button
            type="button"
            onClick={() => {
              setIsProfileOpen((prev) => !prev);
              setIsDropdownOpen(false);
            }}
            className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-xl border border-[#E8DFC8] hover:border-[#C9A24A] bg-white hover:bg-[#FAF8F5] transition-all cursor-pointer shadow-2xs group"
          >
            {(session as any)?.avatar ? (
              <img
                src={(session as any).avatar.includes("storage/data:image") ? (session as any).avatar.substring((session as any).avatar.indexOf("data:image")) : (session as any).avatar}
                alt={session?.name || "User"}
                className="w-7 h-7 rounded-lg object-cover ring-1 ring-[#C9A24A]/40 shrink-0"
              />
            ) : (
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#C9A24A] to-[#A8843A] flex items-center justify-center text-white font-bold text-xs shadow-2xs shrink-0">
                {(session?.name || "A").charAt(0).toUpperCase()}
              </div>
            )}
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-[11px] font-bold text-[#4A3F35] leading-tight group-hover:text-[#8C6B1C] transition-colors truncate max-w-[110px]">
                {session?.name || (role === "clinic" ? "Admin Klinik" : "Pengguna")}
              </span>
              <span className="text-[9px] text-[#8A7B6B] leading-tight capitalize">
                {role === "clinic" ? "Administrator" : role === "doctor" ? "Dokter" : "Pasien"}
              </span>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-gray-400 group-hover:text-[#8C6B1C] transition-transform duration-200 ${isProfileOpen ? "rotate-180" : ""}`} />
          </button>

          {/* Profile Dropdown Menu */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-[#E8DFC8] rounded-2xl shadow-xl overflow-hidden z-50 animate-in fade-in-50 zoom-in-95 duration-150 text-left">
              <div className="p-3.5 bg-gradient-to-br from-[#FAF8F5] to-[#F5EFE6] border-b border-[#E8DFC8] flex items-center gap-3">
                {(session as any)?.avatar ? (
                  <img
                    src={(session as any).avatar.includes("storage/data:image") ? (session as any).avatar.substring((session as any).avatar.indexOf("data:image")) : (session as any).avatar}
                    alt={session?.name || "User"}
                    className="w-10 h-10 rounded-xl object-cover ring-2 ring-[#C9A24A]/40 shrink-0 shadow-xs"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C9A24A] to-[#A8843A] flex items-center justify-center text-white font-bold text-sm shadow-xs shrink-0">
                    {(session?.name || "A").charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#4A3F35] truncate">{session?.name || "Admin Klinik"}</p>
                  <p className="text-[10px] text-[#8A7B6B] truncate">{session?.email || "admin@aestheticpondokindah.id"}</p>
                  <span className="inline-block px-1.5 py-0.2 rounded bg-white text-[#8C6B1C] border border-[#EADBBD] text-[9px] font-bold mt-1">
                    {role === "clinic" ? "Super Admin" : role === "doctor" ? "Dokter Spesialis" : "Member"}
                  </span>
                </div>
              </div>

              <div className="p-2 space-y-1 text-xs">
                {role === "clinic" && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileOpen(false);
                      navigate("/dashboard/clinic?tab=settings");
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-bold text-[#8C6B1C] bg-[#FAF5EA] hover:bg-[#F3EAD8] border border-[#EADBBD] transition-all text-left cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-[#C9A24A] shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-[#4A3F35]">Pengaturan Klinik</p>
                      <p className="text-[9px] text-[#8A7B6B] font-normal">Kop Surat, Logo, Syarat & Perjanjian</p>
                    </div>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setIsProfileOpen(false);
                    navigate("/profile");
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-gray-700 hover:text-[#8C6B1C] hover:bg-[#FAF8F5] transition-colors text-left cursor-pointer"
                >
                  <User className="w-4 h-4 text-gray-400 shrink-0" />
                  <span>Detail Profil Akun</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsProfileOpen(false);
                    navigate("/settings");
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-gray-700 hover:text-[#8C6B1C] hover:bg-[#FAF8F5] transition-colors text-left cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-gray-400 shrink-0" />
                  <span>Keamanan & Password</span>
                </button>

                {role === "clinic" && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileOpen(false);
                      navigate("/dashboard/clinic?tab=content-download");
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-gray-700 hover:text-[#8C6B1C] hover:bg-[#FAF8F5] transition-colors text-left cursor-pointer"
                  >
                    <Upload className="w-4 h-4 text-gray-400 shrink-0" />
                    <span>Upload & Rilis Aplikasi</span>
                  </button>
                )}

                <div className="pt-1.5 border-t border-gray-100 mt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 font-semibold transition-colors text-left cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>Keluar Sesi</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}