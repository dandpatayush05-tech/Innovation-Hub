import api from './axios';

export interface AppNotification {
  id: string;
  user_id: string;
  type: 'booking_confirmation' | 'payment_success' | 'reminder' | 'system_alert' | 'booking_cancelled' | 'payment_failed';
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  updated_at: string;
}

export interface NotificationsResponse {
  notifications: AppNotification[];
}

export const getNotifications = async (): Promise<NotificationsResponse> => {
  const response = await api.get('/notifications');
  return response.data;
};

export const markAsRead = async (id: string): Promise<{ notification: AppNotification }> => {
  const response = await api.patch(`/notifications/${id}/read`);
  return response.data;
};

export const markAllAsRead = async (): Promise<{ message: string }> => {
  const response = await api.post('/notifications/mark-all-read');
  return response.data;
};
