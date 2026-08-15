import { apiClient } from "@/core/api/apiClient";
import { getDemoBranches, type Branch } from "@/features/guest/reservation/services/bookingDemo";

export type BranchWithSlug = Branch & {
  slug: string;
};

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export async function fetchPublicBranches(): Promise<BranchWithSlug[]> {
  try {
    const res = await apiClient.get<Branch[]>("/public/branches");
    if (Array.isArray(res) && res.length > 0) {
      return res.map((b) => ({
        ...b,
        slug: slugify(b.name),
      }));
    }
  } catch {
    // Fallback to initial clinic branches
  }
  return getDemoBranches().map((b) => ({ ...b, slug: slugify(b.name) }));
}

export function getBranchesList(): BranchWithSlug[] {
  return getDemoBranches().map((b) => ({ ...b, slug: slugify(b.name) }));
}

export async function getBranchBySlug(slug: string): Promise<BranchWithSlug | undefined> {
  const list = await fetchPublicBranches();
  return list.find((b) => b.slug === slug || b.id === slug);
}
