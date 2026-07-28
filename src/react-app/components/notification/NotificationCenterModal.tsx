import React, { useEffect, useState } from "react";
import {
  AppNotification,
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  clearAllNotifications,
} from "@/react-app/lib/notificationApi";
import { handleDeepLink } from "@/react-app/lib/firebaseNotification";
import { Bell, Calendar, Crown, Tag, FileText, Trash2, CheckCheck, X } from "lucide-react";

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  onUnreadCountChange?: (count: number) => void;
}

export const NotificationCenterModal: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose,
  onUnreadCountChange,
}) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  const loadData = async () => {
    setLoading(true);
    const { notifications: list, unreadCount: count } = await fetchNotifications();
    setNotifications(list);
    setUnreadCount(count);
    if (onUnreadCountChange) onUnreadCountChange(count);
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleItemClick = async (n: AppNotification) => {
    if (!n.read_at) {
      await markNotificationRead(n.id);
      loadData();
    }
    const targetUrl = handleDeepLink(n.type, n.deep_link);
    onClose();
    window.location.href = targetUrl;
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead();
    loadData();
  };

  const handleDeleteItem = async (e: React.MouseEvent, id: string | number) => {
    e.stopPropagation();
    await deleteNotification(id);
    loadData();
  };

  const handleClearAll = async () => {
    await clearAllNotifications();
    loadData();
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "appointment":
        return <Calendar className="w-5 h-5 text-amber-600" />;
      case "membership":
        return <Crown className="w-5 h-5 text-amber-500" />;
      case "promo":
        return <Tag className="w-5 h-5 text-emerald-600" />;
      case "article":
        return <FileText className="w-5 h-5 text-blue-600" />;
      default:
        return <Bell className="w-5 h-5 text-yellow-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#FAF8F5] border border-[#C59E3F]/30 rounded-3xl max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-5 bg-white border-b border-[#E6DECB] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#F4EFE4] flex items-center justify-center text-[#C59E3F]">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-[#2C2416]">Pusat Notifikasi</h3>
              <span className="text-xs text-[#5C5546]">
                {unreadCount > 0 ? `${unreadCount} belum dibaca` : "Tidak ada notifikasi baru"}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Control Action Toolbar */}
        {notifications.length > 0 && (
          <div className="px-5 py-2.5 bg-[#F4EFE4]/50 border-b border-[#E6DECB] flex items-center justify-between text-xs">
            <button
              onClick={handleMarkAllRead}
              className="text-[#A37E28] hover:text-[#2C2416] font-semibold flex items-center gap-1 transition-all"
            >
              <CheckCheck className="w-3.5 h-3.5" /> Tandai Semua Dibaca
            </button>
            <button
              onClick={handleClearAll}
              className="text-red-500 hover:text-red-700 font-semibold flex items-center gap-1 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" /> Bersihkan Riwayat
            </button>
          </div>
        )}

        {/* Notification List */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3">
          {loading ? (
            <div className="py-12 text-center text-[#5C5546] text-sm">Memuat notifikasi...</div>
          ) : notifications.length === 0 ? (
            <div className="py-16 text-center px-4">
              <div className="w-16 h-16 rounded-full bg-[#F4EFE4] flex items-center justify-center text-[#C59E3F] mx-auto mb-3">
                <Bell className="w-8 h-8" />
              </div>
              <h4 className="font-display font-semibold text-[#2C2416] mb-1">Belum Ada Notifikasi</h4>
              <p className="text-xs text-[#5C5546]">Pemberitahuan tentang janji temu, promo, dan membership akan muncul di sini.</p>
            </div>
          ) : (
            notifications.map((n) => {
              const isUnread = !n.read_at;
              return (
                <div
                  key={n.id}
                  onClick={() => handleItemClick(n)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 relative ${
                    isUnread
                      ? "bg-white border-[#C59E3F]/40 shadow-sm"
                      : "bg-[#FAF8F5]/80 border-transparent opacity-80"
                  } hover:shadow-md hover:border-[#C59E3F]/50`}
                >
                  <div className="p-2.5 rounded-xl bg-[#F4EFE4] shrink-0 mt-0.5">
                    {getTypeIcon(n.type)}
                  </div>
                  <div className="flex-1 pr-6">
                    <div className="flex items-center gap-2 mb-1">
                      <h5 className="font-semibold text-sm text-[#2C2416] leading-snug">{n.title}</h5>
                      {isUnread && (
                        <span className="w-2 h-2 rounded-full bg-[#C59E3F] shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-[#5C5546] leading-relaxed mb-2">{n.body}</p>
                    <span className="text-[10px] text-gray-400 font-medium">
                      {new Date(n.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <button
                    onClick={(e) => handleDeleteItem(e, n.id)}
                    className="absolute top-3 right-3 text-gray-300 hover:text-red-500 transition-all p-1"
                    title="Hapus"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
