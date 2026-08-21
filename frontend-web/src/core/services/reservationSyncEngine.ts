import { useState, useEffect } from "react";
import { apiClient } from "@/core/api/apiClient";
import { getSession } from "@/core/auth/services/session";
import {
  type CachedReservation,
  getReservationsFromDb,
  bulkPutReservationsToDb,
  bulkDeleteReservationsFromDb,
  getCheckpoint,
  setCheckpoint,
  clearReservationsDb,
} from "./reservationStorage";
import { triggerPushNotification } from "./pushNotificationService";

type SyncListener = (items: CachedReservation[]) => void;

class ReservationSyncEngine {
  private inMemoryItems: CachedReservation[] = [];
  private listeners: Set<SyncListener> = new Set();
  private isPolling = false;
  private currentRole: string = "";
  private currentUserId: string = "";
  private channel: BroadcastChannel | null = null;
  private pollIntervalId: any = null;
  public isHydrated = false;

  constructor() {
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      this.channel = new BroadcastChannel("apig_realtime_reservations_channel");
      this.channel.onmessage = (event) => this.handleBroadcastMessage(event.data);
    }
  }

  /**
   * Start or restart synchronization
   */
  public async init(token?: string) {
    const session = getSession();
    const role = (session?.role as string) || "";
    const userId = String(session?.id || (session as any)?.user?.id || "");

    // If role changed, reset database to ensure privacy
    if (this.currentRole && (this.currentRole !== role || this.currentUserId !== userId)) {
      await clearReservationsDb();
      this.inMemoryItems = [];
      this.isHydrated = false;
    }

    this.currentRole = role;
    this.currentUserId = userId;

    // 1. HYDRATION: Instantly load from IndexedDB into in-memory store (0ms UI render)
    try {
      const cached = await getReservationsFromDb();
      if (cached && cached.length > 0) {
        this.inMemoryItems = cached;
        this.isHydrated = true;
        this.notifyListeners();
      } else {
        // Clear stale checkpoint if DB is empty to guarantee full snapshot
        await setCheckpoint("", `checkpoint_${this.currentRole}_${this.currentUserId}`);
      }
    } catch {}

    // 2. Initial Revalidation
    await this.pollChanges();
    this.isHydrated = true;
    this.notifyListeners();

    // 3. Event-Driven Sync (Zero Infinite Polling Loops)
    if (this.pollIntervalId) { clearInterval(this.pollIntervalId); this.pollIntervalId = null; }
  }

  /**
   * Perform incremental change polling
   */
  public async pollChanges() {
    if (this.isPolling) return; // Mutex lock
    if (typeof document !== "undefined" && document.hidden) return;

    const session = getSession();
    const role = (session?.role as string) || this.currentRole || "";
    this.currentRole = role;

    this.isPolling = true;

    try {
      // ONLY use checkpoint if we already have data in memory!
      const lastCheckpoint = this.inMemoryItems.length > 0
        ? await getCheckpoint(`checkpoint_${this.currentRole}_${this.currentUserId}`)
        : null;

      let endpoint = "/reservations/changes";
      if (lastCheckpoint) {
        endpoint += `?since=${encodeURIComponent(lastCheckpoint)}`;
      }

      let data: any = null;

      try {
        data = await apiClient.get<any>(endpoint, { skipToast: true });
      } catch (err) {
        // Fallback for Admin or Doctor if /changes encounters auth edge case
        if (role === "clinic" || role === "admin" || role === "clinic_admin") {
          const fallbackRes: any = await apiClient.get<any>("/admin/reservations", { skipToast: true });
          const list = Array.isArray(fallbackRes) ? fallbackRes : fallbackRes?.data || fallbackRes?.reservations || [];
          if (Array.isArray(list) && list.length > 0) {
            data = { checkpoint: new Date().toISOString(), created: list, updated: [], deleted: [] };
          }
        } else if (role === "doctor") {
          const fallbackRes: any = await apiClient.get<any>("/doctor/queue", { skipToast: true });
          const list = Array.isArray(fallbackRes) ? fallbackRes : fallbackRes?.queue || fallbackRes?.data?.queue || fallbackRes?.reservations || [];
          if (Array.isArray(list) && list.length > 0) {
            data = { checkpoint: new Date().toISOString(), created: list, updated: [], deleted: [] };
          }
        }
      }

      if (!data) return;

      const created: CachedReservation[] = data.created || [];
      const updated: CachedReservation[] = data.updated || [];
      const deleted: (string | number)[] = data.deleted || [];
      const newCheckpoint: string = data.checkpoint;

      const hasDiffs = created.length > 0 || updated.length > 0 || deleted.length > 0;

      if (hasDiffs || !lastCheckpoint || this.inMemoryItems.length === 0) {
        const itemMap = new Map<string, CachedReservation>();

        if (lastCheckpoint && this.inMemoryItems.length > 0) {
          this.inMemoryItems.forEach((item) => itemMap.set(String(item.id), item));
        }

        // 1. Process Created
        created.forEach((item) => itemMap.set(String(item.id), item));

        // 2. Process Updated
        updated.forEach((item) => itemMap.set(String(item.id), item));

        // 3. Process Deleted
        deleted.forEach((id) => itemMap.delete(String(id)));

        const nextList = Array.from(itemMap.values()).sort((a, b) => {
          const timeA = a.date ? new Date(a.date).getTime() : 0;
          const timeB = b.date ? new Date(b.date).getTime() : 0;
          if (timeB !== timeA) return timeB - timeA;
          return Number(b.id || 0) - Number(a.id || 0);
        });

        this.inMemoryItems = nextList;
        this.isHydrated = true;

        // Persist to IndexedDB
        if (created.length > 0 || updated.length > 0) {
          await bulkPutReservationsToDb([...created, ...updated]);
        }
        if (deleted.length > 0) {
          await bulkDeleteReservationsFromDb(deleted);
        }

        // Trigger Notifications
        if (lastCheckpoint && created.length > 0) {
          this.dispatchCreatedNotifications(created);
        }
        if (lastCheckpoint && updated.length > 0) {
          this.dispatchUpdatedNotifications(updated);
        }

        this.notifyListeners();
      }

      if (newCheckpoint) {
        await setCheckpoint(newCheckpoint, `checkpoint_${this.currentRole}_${this.currentUserId}`);
      }
    } catch {
      // Data remains safe
    } finally {
      this.isPolling = false;
      this.isHydrated = true;
      this.notifyListeners();
    }
  }

  /**
   * Broadcast incoming changes to other open tabs
   */
  public broadcastEvent(payload: any) {
    try {
      if (this.channel) {
        this.channel.postMessage(payload);
      }
    } catch {}
  }

  private handleBroadcastMessage(data: any) {
    if (!data) return;

    this.pollChanges();

    const currentRole = this.currentRole;
    const currentUserId = this.currentUserId;

    if (
      (data.type === "guest_booked" || data.type === "patient_booked") &&
      (currentRole === "clinic" || currentRole === "admin" || currentRole === "clinic_admin")
    ) {
      triggerPushNotification({
        title: "🔔 Reservasi Masuk Baru!",
        message: `Pasien: ${data.patientName || "Pasien"} - Layanan: ${data.serviceName || "Pemeriksaan Gigi"}`,
        sender: "Sistem Reservasi",
        role: "admin",
        type: "reservation_new",
        bookingCode: data.bookingCode || "#RSV-000001",
        url: "/#/dashboard/clinic?tab=reservasi",
      });
    }

    if (
      (data.type === "doctor_assigned" || data.type === "reservation_confirmed") &&
      currentRole === "doctor" &&
      (!data.doctorId || String(data.doctorId) === currentUserId)
    ) {
      triggerPushNotification({
        title: "🩺 Pasien Baru Dikonfirmasi!",
        message: `Pasien: ${data.patientName} telah disetujui Admin untuk jadwal ${data.dateStr} (${data.timeStr || "Sesuai Jadwal"})`,
        sender: "Admin Klinik",
        role: "doctor",
        type: "doctor_assigned",
        bookingCode: data.bookingCode || "#RSV-000001",
        url: "/#/dashboard/doctor?tab=reservasi",
      });
    }
  }

  private dispatchCreatedNotifications(items: CachedReservation[]) {
    if (this.currentRole === "clinic" || this.currentRole === "admin" || this.currentRole === "clinic_admin") {
      items.forEach((item) => {
        triggerPushNotification({
          title: "🔔 Reservasi Masuk Baru!",
          message: `Pasien: ${item.name} - Layanan: ${item.treatment_interest || "Pemeriksaan Gigi"}`,
          sender: "Sistem Reservasi",
          role: "admin",
          type: "reservation_new",
          bookingCode: item.code || `#RSV-${String(item.id).padStart(6, "0")}`,
          url: "/#/dashboard/clinic?tab=reservasi",
        });
      });
    }
  }

  private dispatchUpdatedNotifications(items: CachedReservation[]) {
    if (this.currentRole === "doctor") {
      const confirmed = items.filter((i) => (i.status || "").toLowerCase() === "dikonfirmasi");
      confirmed.forEach((item) => {
        triggerPushNotification({
          title: "🩺 Pasien Baru Dikonfirmasi!",
          message: `Pasien: ${item.name} telah disetujui Admin untuk jadwal ${item.displayDate || item.date} (${item.preferred_time || "Sesuai Jadwal"})`,
          sender: "Admin Klinik",
          role: "doctor",
          type: "doctor_assigned",
          bookingCode: item.code || `#RSV-${String(item.id).padStart(6, "0")}`,
          url: "/#/dashboard/doctor?tab=reservasi",
        });
      });
    }

    if (this.currentRole === "patient" || this.currentRole === "user") {
      const confirmed = items.filter((i) => (i.status || "").toLowerCase() === "dikonfirmasi");
      confirmed.forEach((item) => {
        triggerPushNotification({
          title: "🎉 Janji Temu Dikonfirmasi!",
          message: `Reservasi ${item.code} bersama ${item.doctor || "Dokter"} telah disetujui Admin.`,
          sender: "Aesthetic Pondok Indah",
          role: "patient",
          type: "reservation_confirmed",
          bookingCode: item.code || `#RSV-${String(item.id).padStart(6, "0")}`,
          url: "/#/dashboard/user?tab=reservasi",
        });
      });
    }
  }

  public subscribe(listener: SyncListener): () => void {
    this.listeners.add(listener);
    listener([...this.inMemoryItems]);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getItems(): CachedReservation[] {
    return this.inMemoryItems;
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener([...this.inMemoryItems]));
  }
}

export const syncEngine = new ReservationSyncEngine();

/**
 * React Hook for Instant Hydrated Realtime Reservations
 */
export function useRealtimeReservations() {
  const [items, setItems] = useState<CachedReservation[]>(() => syncEngine.getItems());
  const [isHydrated, setIsHydrated] = useState<boolean>(syncEngine.isHydrated);

  useEffect(() => {
    const unsubscribe = syncEngine.subscribe((updatedItems) => {
      setItems(updatedItems);
      setIsHydrated(syncEngine.isHydrated);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  return {
    reservations: items,
    isHydrated,
    loading: !isHydrated && items.length === 0,
    refresh: () => syncEngine.pollChanges(),
  };
}
