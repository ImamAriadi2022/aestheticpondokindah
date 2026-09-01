import { apiClient } from './apiClient';
import { cacheStorage } from '@/storage/cacheStorage';
import { ENDPOINTS } from '@/constants/api';
import type { Post, GalleryItem, Popup, Promo } from '@/types/booking';

export const contentService = {
  async getPosts(forceRefresh = false): Promise<{ posts: Post[] }> {
    const KEY = 'posts';
    if (!forceRefresh) {
      const cached = await cacheStorage.get<{ posts: Post[] }>(KEY);
      if (cached && Array.isArray(cached.posts) && cached.posts.length > 0) {
        return cached;
      }
    }
    try {
      const res: any = await apiClient.get(ENDPOINTS.POSTS);
      const postsList: Post[] = Array.isArray(res)
        ? res
        : (Array.isArray(res?.data) ? res.data : (Array.isArray(res?.posts) ? res.posts : []));

      const normalized = { posts: postsList || [] };
      if (postsList && postsList.length > 0) {
        await cacheStorage.set(KEY, normalized, 10 * 60 * 1000);
      }
      return normalized;
    } catch (e) {
      console.warn('Failed to fetch posts from API:', e);
      return { posts: [] };
    }
  },

  async getPost(slug: string): Promise<{ post: Post }> {
    const KEY = `post_${slug}`;
    const cached = await cacheStorage.get<{ post: Post }>(KEY);
    if (cached) return cached;
    const res = await apiClient.get<any>(ENDPOINTS.POST_DETAIL(slug), { skipAuth: true });
    const postItem: Post = res?.post || res?.data || res;
    const normalized = { post: postItem };
    await cacheStorage.set(KEY, normalized, 15 * 60 * 1000);
    return normalized;
  },

  async getGallery(): Promise<{ gallery: GalleryItem[] }> {
    const KEY = 'gallery';
    const cached = await cacheStorage.get<{ gallery: GalleryItem[] }>(KEY);
    if (cached) return cached;
    const res = await apiClient.get<any>(ENDPOINTS.GALLERY, { skipAuth: true });
    const list: GalleryItem[] = Array.isArray(res)
      ? res
      : (Array.isArray(res?.data) ? res.data : (Array.isArray(res?.gallery) ? res.gallery : []));
    const normalized = { gallery: list };
    await cacheStorage.set(KEY, normalized, 15 * 60 * 1000);
    return normalized;
  },

  async getPromos(forceRefresh = false): Promise<{ promos: Promo[] }> {
    const KEY = 'promos';
    if (!forceRefresh) {
      const cached = await cacheStorage.get<{ promos: Promo[] }>(KEY);
      if (cached) return cached;
    }
    const res = await apiClient.get<any>(ENDPOINTS.PROMOS, { skipAuth: true });
    const promoList: Promo[] = Array.isArray(res)
      ? res
      : (Array.isArray(res?.data) ? res.data : (Array.isArray(res?.promos) ? res.promos : []));
    const normalized = { promos: promoList };
    await cacheStorage.set(KEY, normalized, 10 * 60 * 1000);
    return normalized;
  },

  async getPromo(slug: string): Promise<{ promo: Promo }> {
    return await apiClient.get(ENDPOINTS.PROMO_DETAIL(slug), { skipAuth: true });
  },

  async getActivePopup(): Promise<Popup | null> {
    const KEY = 'active_popup';
    const cached = await cacheStorage.get<Popup | null>(KEY);
    if (cached) return cached;
    const popup = await apiClient.get<Popup | null>(ENDPOINTS.POPUPS, { skipAuth: true });
    await cacheStorage.set(KEY, popup, 10 * 60 * 1000);
    return popup;
  },
};
