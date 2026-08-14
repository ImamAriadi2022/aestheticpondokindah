import { getDownloadApps, type DownloadAppItem } from "@/features/guest/download/services/downloadApi";

export type { DownloadAppItem };

export async function getDoctorDownloadApps(): Promise<DownloadAppItem[]> {
  return getDownloadApps();
}
