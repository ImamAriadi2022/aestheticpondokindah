import { getDemoBranches, type Branch } from "@/features/guest/reservation/services/bookingDemo";

export type BranchWithSlug = Branch & {
  slug: string;
};

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export function getBranchesList(): BranchWithSlug[] {
  return getDemoBranches().map((b) => ({ ...b, slug: slugify(b.name) }));
}

export function getBranchBySlug(slug: string): BranchWithSlug | undefined {
  return getBranchesList().find((b) => b.slug === slug || b.id === slug);
}
