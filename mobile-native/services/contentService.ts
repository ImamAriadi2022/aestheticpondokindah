import { apiClient } from './apiClient';
import { cacheStorage } from '@/storage/cacheStorage';
import { ENDPOINTS } from '@/constants/api';
import type { Post, GalleryItem, Popup, Promo } from '@/types/booking';

export const contentService = {
  async getPosts(forceRefresh = false): Promise<{ posts: Post[] }> {
    const KEY = 'posts';
    if (!forceRefresh) {
      const cached = await cacheStorage.get<{ posts: Post[] }>(KEY);
      if (cached) return cached;
    }
    const res = await apiClient.get<{ posts: Post[] }>(ENDPOINTS.POSTS, { skipAuth: true });
    await cacheStorage.set(KEY, res, 10 * 60 * 1000);
    return res;
  },

  async getPost(slug: string): Promise<{ post: Post }> {
    const KEY = `post_${slug}`;
    const cached = await cacheStorage.get<{ post: Post }>(KEY);
    if (cached) return cached;
    const res = await apiClient.get<{ post: Post }>(ENDPOINTS.POST_DETAIL(slug), { skipAuth: true });
    await cacheStorage.set(KEY, res, 15 * 60 * 1000);
    return res;
  },

  async getGallery(): Promise<{ gallery: GalleryItem[] }> {
    const KEY = 'gallery';
    const cached = await cacheStorage.get<{ gallery: GalleryItem[] }>(KEY);
    if (cached) return cached;
    const res = await apiClient.get<{ gallery: GalleryItem[] }>(ENDPOINTS.GALLERY, { skipAuth: true });
    await cacheStorage.set(KEY, res, 15 * 60 * 1000);
    return res;
  },

  async getPromos(forceRefresh = false): Promise<{ promos: Promo[] }> {
    const KEY = 'promos';
    if (!forceRefresh) {
      const cached = await cacheStorage.get<{ promos: Promo[] }>(KEY);
      if (cached) return cached;
    }
    const res = await apiClient.get<{ promos: Promo[] }>(ENDPOINTS.PROMOS, { skipAuth: true });
    await cacheStorage.set(KEY, res, 10 * 60 * 1000);
    return res;
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
