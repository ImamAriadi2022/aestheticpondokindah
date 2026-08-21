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
} from "lucide-react";
import {
  subscribeToPushNotifications,
  type PushNotificationPayload,
  markNotificationAsRead,
  clearNotificationHistory,
} from "@/core/services/pushNotificationService";
import { getSession } from "@/core/auth/services/session";
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

  // Determine Page Title & Subtitle based on Route / Tab
  const getPageInfo = () => {
    if (role === "clinic") {
      switch (activeTab) {
        case "reservasi":
          return { title: "Daftar Reservasi & Antrean", subtitle: "Kelola data reservasi dan antrean pasien klinik" };
        case "konsultasi":
          return { title: "Layanan Konsultasi", subtitle: "Pantau dan kelola konsultasi medis pasien" };
        case "pengaduan":
          return { title: "Pengaduan & Masukan Pasien", subtitle: "Tindak lanjut keluhan dan aspirasi pasien" };
        case "dokter":
          return { title: "Manajemen Tim Dokter", subtitle: "Kelola profil dan spesialisasi dokter" };
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
          return { title: "Pengaturan Sistem Klinik", subtitle: "Konfigurasi operasional dan preferensi klinik" };
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

    // Patient / User role
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

  // Determine Login As text
  const getLoginAsText = () => {
    if (role === "clinic") return "Admin Klinik";
    if (role === "doctor") {
      return session?.name ? `${session.name} (Dokter Spesialis)` : "Dokter Spesialis";
    }
    return session?.name ? `${session.name} (Pasien Member)` : "Pasien Member";
  };

  // Fetch real notifications from database
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
          type: item.type || "general",
          url: item.deep_link || (role === "clinic" ? "/#/dashboard/clinic?tab=reservasi" : role === "doctor" ? "/#/dashboard/doctor?tab=reservasi" : "/#/dashboard/user?tab=reservasi"),
          bookingCode: item.data?.code || item.data?.bookingCode,
          dateStr: item.created_at ? new Date(item.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) : "",
        }));

        setNotifications((prev) => {
          const prevMap = new Map(prev.map((p) => [p.id || p.title + p.dateStr, p]));
          mapped.forEach((m) => prevMap.set(m.id || m.title + m.dateStr, m));
          const combined = Array.from(prevMap.values()).slice(0, 50);
          try {
            localStorage.setItem("apig_recent_push_notifications", JSON.stringify(combined));
          } catch {}
          return combined;
        });

        if (typeof res?.unread_count === "number") {
          setUnreadCount(res.unread_count);
          try {
            localStorage.setItem("apig_push_unread_count", String(res.unread_count));
          } catch {}
        }
      }
    } catch (e) {
      // Graceful fallback
    }
  };

  // Subscribe to real-time push notification dispatcher
  useEffect(() => {
    const unsubscribe = subscribeToPushNotifications((payload) => {
      setNotifications((prev) => {
        const notifId = payload.id || `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        // Deduplicate in list
        if (prev.some((p) => p.id === notifId || (p.bookingCode && p.bookingCode === payload.bookingCode && p.type === payload.type))) {
          return prev;
        }

        const updated = [
          {
            ...payload,
            id: notifId,
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

  // Sync notification permission status, auto-register WebPush & load DB notifications on mount
  useEffect(() => {
    fetchDatabaseNotifications();

    if (typeof window !== "undefined" && "Notification" in window) {
      setNotificationPermission(Notification.permission);
      if (Notification.permission === "granted") {
        subscribeToWebPush(role).catch(() => {});
      }
    }
  }, [role]);

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

  const handleClearAll = async () => {
    setNotifications([]);
    setUnreadCount(0);
    clearNotificationHistory();
    try {
      await apiClient.delete("/user/notifications", { skipToast: true });
    } catch {}
  };

  const handleMarkAllAsRead = async () => {
    setUnreadCount(0);
    localStorage.setItem("apig_push_unread_count", "0");
    notifications.forEach((n) => {
      if (n.id) markNotificationAsRead(`id_${n.id}`);
      if (n.bookingCode) markNotificationAsRead(`code_${n.type || 'gen'}_${n.bookingCode}`);
    });
    try {
      await apiClient.post("/user/notifications/read-all", {}, { skipToast: true });
    } catch {}
  };

  const handleItemClick = async (item: PushNotificationPayload) => {
    setIsDropdownOpen(false);
    if (item.id) markNotificationAsRead(`id_${item.id}`);
    if (item.bookingCode) markNotificationAsRead(`code_${item.type || 'gen'}_${item.bookingCode}`);

    if (item.id) {
      try {
        await apiClient.post(`/user/notifications/${item.id}/read`, {}, { skipToast: true });
      } catch {}
    }

    setUnreadCount((prev) => Math.max(0, prev - 1));

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
      {/* Left: Penjelasan Halaman & Status Login (Tanpa Logo & Profil) */}
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

      {/* Right: Ikon Notifikasi Saja */}
      <div className="flex items-center gap-2" ref={dropdownRef}>
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsDropdownOpen((prev) => !prev)}
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
              {/* Dropdown Header */}
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

              {/* Notification List */}
              <div className="max-h-80 overflow-y-auto divide-y divide-[#F0EAE1]">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center px-4 space-y-1">
                    <CheckCircle2 className="w-7 h-7 text-emerald-500 mx-auto stroke-1" />
                    <p className="text-xs font-semibold text-[#2C2416]">Tidak Ada Notifikasi Baru</p>
                    <p className="text-[10px] text-[#8C8272]">Semua notifikasi dan janji temu telah ditinjau.</p>
                  </div>
                ) : (
                  notifications.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      onClick={() => handleItemClick(item)}
                      className="p-3.5 hover:bg-[#FAF8F5] transition-colors cursor-pointer space-y-1"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-bold text-[#2C2416] flex items-center gap-1.5 truncate">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#8C6B1C] shrink-0" />
                          {item.title}
                        </span>
                        {item.dateStr && (
                          <span className="text-[9px] text-[#8C8272] shrink-0">{item.dateStr}</span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#5C5346] leading-snug line-clamp-2">
                        {item.message}
                      </p>
                      {item.bookingCode && (
                        <div className="pt-0.5">
                          <span className="text-[9px] font-mono font-bold bg-[#FAF5EA] text-[#8C6B1C] px-1.5 py-0.5 rounded border border-[#EADBBD]">
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
      </div>
    </header>
  );
}
