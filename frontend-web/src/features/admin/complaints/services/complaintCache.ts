const STORAGE_KEY = "apident:admin_complaints_cache";
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

let memoryCache: any[] | null = null;
let memoryCacheTimestamp = 0;

export function getCachedComplaints(): any[] | null {
  // Check memory cache first (instant 0ms)
  if (memoryCache && Array.isArray(memoryCache) && Date.now() - memoryCacheTimestamp < CACHE_TTL_MS) {
    return memoryCache;
  }

  // Fallback to localStorage
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.data)) {
      memoryCache = parsed.data;
      memoryCacheTimestamp = parsed.timestamp || Date.now();
      return parsed.data;
    }
  } catch (e) {
    console.warn("Gagal membaca cache pengaduan", e);
  }

  return null;
}

export function setCachedComplaints(data: any[]): void {
  if (!Array.isArray(data)) return;
  memoryCache = data;
  memoryCacheTimestamp = Date.now();

  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        data,
        timestamp: Date.now(),
      })
    );
  } catch (e) {
    console.warn("Gagal menyimpan cache pengaduan ke localStorage", e);
  }
}

export function updateSingleCachedComplaint(updatedItem: any): any[] {
  const current = getCachedComplaints() || [];
  const index = current.findIndex((c) => String(c.id) === String(updatedItem.id));
  let nextList: any[];

  if (index >= 0) {
    nextList = [...current];
    nextList[index] = { ...nextList[index], ...updatedItem };
  } else {
    nextList = [updatedItem, ...current];
  }

  setCachedComplaints(nextList);
  return nextList;
}

export function removeSingleCachedComplaint(id: string | number): any[] {
  const current = getCachedComplaints() || [];
  const nextList = current.filter((c) => String(c.id) !== String(id));
  setCachedComplaints(nextList);
  return nextList;
}

export function clearComplaintCache(): void {
  memoryCache = null;
  memoryCacheTimestamp = 0;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}
