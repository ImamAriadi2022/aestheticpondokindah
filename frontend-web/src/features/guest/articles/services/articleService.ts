import { apiClient } from "@/core/api/apiClient";

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  image?: string;
  author?: string;
  authorRole?: string;
  authorAvatar?: string;
  readTime?: string;
  publishDate?: string;
  tags?: string[];
}

export const BLOG_CATEGORIES = [
  "Semua",
  "Estetika",
  "Tips",
  "Ortodonti",
  "Anak",
  "Restoratif",
  "Informasi",
] as const;

export async function getPublicPosts(): Promise<BlogPost[]> {
  try {
    const res = await apiClient.get<BlogPost[]>("/public/posts");
    return res || [];
  } catch {
    return [];
  }
}

export async function getPublicPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const res = await apiClient.get<BlogPost>(`/public/posts/${slug}`);
    return res;
  } catch {
    return null;
  }
}
