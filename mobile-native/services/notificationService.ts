import { apiClient } from './apiClient';
import { ENDPOINTS } from '@/constants/api';
import type { Notification } from '@/types/booking';

export interface NotificationResponse {
  notifications: Notification[];
  unread_count: number;
  current_page?: number;
  last_page?: number;
  total?: number;
}

export const notificationService = {
  async getNotifications(page = 1, perPage = 30): Promise<NotificationResponse> {
    return await apiClient.get(`${ENDPOINTS.NOTIFICATIONS}?page=${page}&per_page=${perPage}`);
  },

  async getUnreadCount(): Promise<{ unread_count: number }> {
    return await apiClient.get(ENDPOINTS.NOTIFICATIONS_UNREAD);
  },

  async markAsRead(id: number | string): Promise<{ message: string; notification: Notification }> {
    return await apiClient.post(ENDPOINTS.NOTIFICATIONS_READ(String(id)));
  },

  async markAllAsRead(): Promise<{ message: string }> {
    return await apiClient.post(ENDPOINTS.NOTIFICATIONS_READ_ALL);
  },

  async deleteNotification(id: number | string): Promise<{ message: string }> {
    return await apiClient.delete(ENDPOINTS.NOTIFICATIONS_DELETE(String(id)));
  },

  async clearAll(): Promise<{ message: string }> {
    return await apiClient.delete(ENDPOINTS.NOTIFICATIONS_CLEAR);
  },

  async storeDeviceToken(token: string, platform: 'android' | 'ios' = 'android'): Promise<any> {
    return await apiClient.post(ENDPOINTS.DEVICE_TOKENS, {
      device_token: token,
      platform,
    });
  },

  async deleteDeviceToken(token?: string): Promise<any> {
    return await apiClient.delete(ENDPOINTS.DEVICE_TOKENS_DELETE, {
      device_token: token,
    });
  },
};
