import api from './api';

export interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  related_id: number | null;
  created_at: string;
}

export const notificationService = {
  getNotifications: async (): Promise<{ notifications: Notification[]; unread_count: number }> => {
    const response = await api.get('/notifications');
    return response.data;
  },
  markAsRead: async (id: number) => {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data;
  },
  markAllAsRead: async () => {
    const response = await api.put('/notifications/read-all');
    return response.data;
  },
};
