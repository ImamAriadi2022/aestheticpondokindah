import { apiClient } from './apiClient';
import { ENDPOINTS } from '@/constants/api';
import type { Notification } from '@/types/booking';

export const notificationService = {
  async getNotifications(): Promise<{ notifications: Notification[]; unread_count: number }> {
    return await apiClient.get(ENDPOINTS.NOTIFICATIONS);
  },

  async getUnreadCount(): Promise<{ count: number }> {
    return await apiClient.get(ENDPOINTS.NOTIFICATIONS_UNREAD);
  },

  async markAsRead(id: number): Promise<any> {
    return await apiClient.post(ENDPOINTS.NOTIFICATIONS_READ(String(id)));
  },

  async markAllAsRead(): Promise<any> {
    return await apiClient.post(ENDPOINTS.NOTIFICATIONS_READ_ALL);
  },

  async deleteNotification(id: number): Promise<any> {
    return await apiClient.delete(ENDPOINTS.NOTIFICATIONS_DELETE(String(id)));
  },

  async clearAll(): Promise<any> {
    return await apiClient.delete(ENDPOINTS.NOTIFICATIONS_CLEAR);
  },

  async storeDeviceToken(token: string, platform: 'android' | 'ios' = 'android'): Promise<any> {
    return await apiClient.post(ENDPOINTS.DEVICE_TOKENS, { token, platform });
  },

  async deleteDeviceToken(token: string): Promise<any> {
    return await apiClient.delete(ENDPOINTS.DEVICE_TOKENS_DELETE(token));
  },
};
