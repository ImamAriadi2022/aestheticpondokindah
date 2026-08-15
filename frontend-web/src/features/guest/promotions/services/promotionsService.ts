import { apiClient } from "@/core/api/apiClient";

export interface PromoItem {
  id: string;
  slug?: string;
  title: string;
  description: string;
  discount?: string;
  discountType?: string;
  image?: string;
  validUntil?: string;
  terms?: string[];
  badge?: string;
  code?: string;
}

export async function getPublicPromos(): Promise<PromoItem[]> {
  try {
    const res = await apiClient.get<PromoItem[]>("/public/promos");
    return res || [];
  } catch {
    return [];
  }
}

export async function getPublicPromoBySlug(slug: string): Promise<PromoItem | null> {
  try {
    const res = await apiClient.get<PromoItem>(`/public/promos/${slug}`);
    return res;
  } catch {
    return null;
  }
}
