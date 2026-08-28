import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  AppNotification,
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  clearAllNotifications,
} from "@/core/api/notificationApi";
import { handleDeepLink } from "@/core/api/firebaseNotification";
import { getSession } from "@/core/auth/services/session";
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

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

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
    const session = getSession();
    const targetUrl = handleDeepLink(n.type, n.deep_link, (session?.role as string) || "user");
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

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#FAF8F5] border border-[#C59E3F]/30 rounded-3xl max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-5 bg-white border-b border-[#E6DECB] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center">
              <Bell className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">Pusat Notifikasi</h3>
              <p className="text-xs text-gray-500">
                {unreadCount > 0 ? `${unreadCount} pesan belum dibaca` : "Semua notifikasi telah dibaca"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="px-5 py-2.5 bg-gray-50/80 border-b border-[#E6DECB] flex items-center justify-between text-xs text-gray-600">
          <button
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0}
            className="flex items-center gap-1.5 font-medium hover:text-amber-700 disabled:opacity-40 disabled:hover:text-gray-600 cursor-pointer"
          >
            <CheckCheck className="w-4 h-4" />
            Tandai semua dibaca
          </button>
          <button
            onClick={handleClearAll}
            disabled={notifications.length === 0}
            className="flex items-center gap-1.5 font-medium hover:text-red-600 disabled:opacity-40 disabled:hover:text-gray-600 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Hapus semua
          </button>
        </div>

        {/* Content List */}
        <div className="overflow-y-auto flex-1 p-3 space-y-2">
          {loading ? (
            <div className="py-12 text-center text-gray-400 text-sm">Memuat notifikasi...</div>
          ) : notifications.length === 0 ? (
            <div className="py-12 text-center text-gray-400 text-sm flex flex-col items-center gap-2">
              <Bell className="w-8 h-8 text-gray-300 stroke-[1.5]" />
              <p>Belum ada notifikasi</p>
            </div>
          ) : (
            notifications.map((n) => {
              const isUnread = !n.read_at;
              return (
                <div
                  key={n.id}
                  onClick={() => handleItemClick(n)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer relative group flex items-start gap-3.5 ${
                    isUnread
                      ? "bg-white border-amber-300 shadow-xs hover:border-amber-400"
                      : "bg-[#FAF8F5]/60 border-gray-200/80 hover:bg-white hover:border-gray-300"
                  }`}
                >
                  <div className="mt-0.5 p-2 rounded-xl bg-gray-50 border border-gray-100 shrink-0">
                    {getTypeIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0 pr-6">
                    <div className="flex items-center gap-2">
                      <h4 className={`text-sm leading-tight truncate ${isUnread ? "font-bold text-gray-900" : "font-semibold text-gray-700"}`}>
                        {n.title}
                      </h4>
                      {isUnread && (
                        <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2 leading-relaxed">
                      {n.body}
                    </p>
                    <span className="text-[10px] text-gray-400 mt-2 block">
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
    </div>,
    document.body
  );
};
