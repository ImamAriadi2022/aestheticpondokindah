import { toast } from "@/shared/ui/toast";
import { logger } from "@/core/utils/logger";

export type SyncChannel = "profile" | "membership" | "appointments" | "notifications" | "settings" | "all";

type SyncListener = (channel: SyncChannel, payload?: any) => void;

class MobileSyncManager {
  private listeners: Set<SyncListener> = new Set();
  private lastSyncTimes: Map<SyncChannel, number> = new Map();
  private isOnline: boolean = typeof navigator !== "undefined" ? navigator.onLine : true;
  private MIN_SYNC_INTERVAL_MS = 2000; // 2 seconds deduplication window

  constructor() {
    if (typeof window !== "undefined") {
      window.addEventListener("online", this.handleOnline);
      window.addEventListener("offline", this.handleOffline);
      document.addEventListener("visibilitychange", this.handleVisibilityChange);
    }
  }

  private handleOnline = () => {
    this.isOnline = true;
    logger.info("SyncManager", "Connection restored, triggering full data resynchronization...");
    toast.success("Koneksi internet pulih. Memperbarui data terbaru...");
    this.syncAll(true);
  };

  private handleOffline = () => {
    this.isOnline = false;
    logger.warn("SyncManager", "App went offline. Serving cached state.");
  };

  private handleVisibilityChange = () => {
    if (document.visibilityState === "visible" && this.isOnline) {
      logger.info("SyncManager", "App foregrounded, refreshing stale data...");
      this.syncAll(false);
    }
  };

  public subscribe(listener: SyncListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public notify(channel: SyncChannel, payload?: any, force: boolean = false): void {
    const now = Date.now();
    const lastSync = this.lastSyncTimes.get(channel) || 0;

    if (!force && now - lastSync < this.MIN_SYNC_INTERVAL_MS) {
      logger.debug("SyncManager", `Skipping duplicate sync for channel: ${channel}`);
      return;
    }

    this.lastSyncTimes.set(channel, now);
    logger.info("SyncManager", `Publishing sync event on channel: ${channel}`, payload);

    for (const listener of this.listeners) {
      try {
        listener(channel, payload);
      } catch (err) {
        logger.error("SyncManager", "Error in sync listener:", err);
      }
    }
  }

  public syncAll(force: boolean = false): void {
    this.notify("all", null, force);
  }

  public parseValidationErrors(error: any): Record<string, string> {
    const fieldErrors: Record<string, string> = {};
    if (error && typeof error === "object" && error.errors) {
      for (const [key, messages] of Object.entries(error.errors)) {
        if (Array.isArray(messages) && messages.length > 0) {
          fieldErrors[key] = messages[0];
        } else if (typeof messages === "string") {
          fieldErrors[key] = messages;
        }
      }
    }
    return fieldErrors;
  }
}

export const mobileSyncManager = new MobileSyncManager();
