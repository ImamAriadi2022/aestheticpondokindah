/**
 * Native IndexedDB Wrapper for Persistent Reservation Cache
 * Zero external dependencies.
 */

const DB_NAME = "apig_reservation_cache_db";
const DB_VERSION = 1;
const STORE_RESERVATIONS = "reservations";
const STORE_META = "metadata";

export interface CachedReservation {
  id: string;
  code: string;
  user_id?: string | null;
  patient_id?: string | null;
  patient_name?: string;
  name?: string;
  phone?: string;
  email?: string;
  date?: string | null;
  displayDate?: string;
  preferred_time?: string;
  time?: string;
  doctor_id?: string | null;
  doctorId?: string | null;
  doctor_schedule_id?: string | null;
  doctor?: string;
  doctor_name?: string;
  doctorName?: string;
  complaint?: string;
  treatment_interest?: string;
  service?: string;
  branch_name?: string;
  source?: string;
  status?: string;
  payment_status?: string;
  paymentStatus?: string;
  admin_notes?: string;
  signature_data?: string;
  terms_accepted_at?: string;
  rescheduled_at?: string;
  created_at?: string;
  createdAt?: string;
  updated_at?: string;
  updatedAt?: string;
  [key: string]: any;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      return reject(new Error("IndexedDB is not supported in this environment"));
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result as IDBDatabase;

      if (!db.objectStoreNames.contains(STORE_RESERVATIONS)) {
        const store = db.createObjectStore(STORE_RESERVATIONS, { keyPath: "id" });
        store.createIndex("updated_at", "updated_at", { unique: false });
        store.createIndex("status", "status", { unique: false });
        store.createIndex("doctor_id", "doctor_id", { unique: false });
        store.createIndex("user_id", "user_id", { unique: false });
      }

      if (!db.objectStoreNames.contains(STORE_META)) {
        db.createObjectStore(STORE_META, { keyPath: "key" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get all cached reservations from IndexedDB
 */
export async function getReservationsFromDb(): Promise<CachedReservation[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_RESERVATIONS, "readonly");
      const store = tx.objectStore(STORE_RESERVATIONS);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn("[IndexedDB] Could not load reservations:", err);
    return [];
  }
}

/**
 * Bulk save / update reservations in IndexedDB
 */
export async function bulkPutReservationsToDb(items: CachedReservation[]): Promise<void> {
  if (!items || items.length === 0) return;
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_RESERVATIONS, "readwrite");
      const store = tx.objectStore(STORE_RESERVATIONS);
      items.forEach((item) => {
        if (item && item.id) {
          store.put(item);
        }
      });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn("[IndexedDB] Bulk put error:", err);
  }
}

/**
 * Bulk remove deleted reservations from IndexedDB
 */
export async function bulkDeleteReservationsFromDb(ids: (string | number)[]): Promise<void> {
  if (!ids || ids.length === 0) return;
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_RESERVATIONS, "readwrite");
      const store = tx.objectStore(STORE_RESERVATIONS);
      ids.forEach((id) => {
        store.delete(String(id));
      });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn("[IndexedDB] Bulk delete error:", err);
  }
}

/**
 * Clear all reservations for a fresh sync or role switch
 */
export async function clearReservationsDb(): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_RESERVATIONS, STORE_META], "readwrite");
      tx.objectStore(STORE_RESERVATIONS).clear();
      tx.objectStore(STORE_META).clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn("[IndexedDB] Clear error:", err);
  }
}

/**
 * Get last sync checkpoint for incremental change polling
 */
export async function getCheckpoint(key = "last_sync_checkpoint"): Promise<string | null> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_META, "readonly");
      const store = tx.objectStore(STORE_META);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result ? req.result.value : null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

/**
 * Save sync checkpoint
 */
export async function setCheckpoint(value: string, key = "last_sync_checkpoint"): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_META, "readwrite");
      const store = tx.objectStore(STORE_META);
      store.put({ key, value, updated_at: new Date().toISOString() });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn("[IndexedDB] setCheckpoint error:", err);
  }
}
