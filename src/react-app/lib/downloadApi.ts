import { API_BASE } from "@/react-app/lib/apiConfig";

export interface DownloadAppItem {
  id: string;
  title: string;
  description: string | null;
  version: string | null;
  platform: string | null;
  apk_url: string | null;
  download_link: string | null;
  file_size: number;
  file_size_formatted: string | null;
  is_development: boolean;
}

export async function getDownloadApps(): Promise<DownloadAppItem[]> {
  try {
    const res = await fetch(`${API_BASE}/public/download-apps`);
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}
