import React, { useEffect, useState } from "react";

export const PwaManager: React.FC = () => {
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);
  const [showReconnectedToast, setShowReconnectedToast] = useState<boolean>(false);
  const [newVersionAvailable, setNewVersionAvailable] = useState<boolean>(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      window.__pwaInstallPrompt = event as any;
      window.dispatchEvent(new Event("pwa-install-available"));
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    // 1. Online / Offline Event Listeners
    const handleOnline = () => {
      setIsOffline(false);
      setShowReconnectedToast(true);
      setTimeout(() => setShowReconnectedToast(false), 4000);
    };

    const handleOffline = () => {
      setIsOffline(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // 2. Service Worker Registration & Update Detection
    if ("serviceWorker" in navigator && import.meta.env.PROD) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          console.log("[PWA] Service Worker registered successfully:", reg.scope);

          if (reg.waiting) {
            setWaitingWorker(reg.waiting);
            setNewVersionAvailable(true);
          }

          reg.addEventListener("updatefound", () => {
            const newWorker = reg.installing;
            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                  setWaitingWorker(newWorker);
                  setNewVersionAvailable(true);
                }
              });
            }
          });
        })
        .catch((err) => {
          console.warn("[PWA] Service Worker registration failed:", err);
        });
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleUpdateClick = () => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: "SKIP_WAITING" });
    }
    window.location.reload();
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 pointer-events-none flex flex-col gap-2 items-center sm:items-end">
      {/* 1. Offline Mode Banner */}
      {isOffline && (
        <div className="pointer-events-auto bg-[#2C2416] text-[#FAF8F5] border border-[#C59E3F]/40 shadow-xl px-4 py-3 rounded-2xl flex items-center gap-3 text-sm animate-fade-in">
          <span className="text-xl">📡</span>
          <div>
            <strong className="block font-semibold">Mode Offline Aktif</strong>
            <span className="text-xs text-amber-200/80">Menampilkan data cache aplikasi & halaman offline.</span>
          </div>
        </div>
      )}

      {/* 2. Reconnected Toast */}
      {showReconnectedToast && (
        <div className="pointer-events-auto bg-emerald-900 text-emerald-100 border border-emerald-500/40 shadow-xl px-4 py-3 rounded-2xl flex items-center gap-3 text-sm animate-fade-in">
          <span className="text-xl">✨</span>
          <div>
            <strong className="block font-semibold">Terhubung Kembali</strong>
            <span className="text-xs text-emerald-200">Koneksi internet pulih. Mengupdate data...</span>
          </div>
        </div>
      )}

      {/* 3. New SW Version Update Notification Banner */}
      {newVersionAvailable && (
        <div className="pointer-events-auto bg-gradient-to-r from-[#2C2416] to-[#433722] text-white border border-[#C59E3F] shadow-2xl p-4 rounded-2xl flex items-center justify-between gap-4 text-sm max-w-md w-full animate-bounce-short">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚡</span>
            <div>
              <strong className="block text-[#C59E3F]">Versi Baru Tersedia</strong>
              <span className="text-xs text-gray-300">Pembaruan sistem klinik siap dipasang.</span>
            </div>
          </div>
          <button
            onClick={handleUpdateClick}
            className="bg-[#C59E3F] hover:bg-[#A37E28] text-white font-semibold text-xs px-3 py-2 rounded-xl transition-all shadow-md text-nowrap"
          >
            Perbarui
          </button>
        </div>
      )}
    </div>
  );
};
