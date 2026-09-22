import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { useAuth } from './AuthContext';

export interface AppNotificationItem {
  id: string;
  type: 'flight_update' | 'hotel_confirmed' | 'ai_itinerary' | 'payment_completed' | 'delay_alert' | 'general';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  link?: string;
  data?: any;
}

interface NotificationContextType {
  notifications: AppNotificationItem[];
  unreadCount: number;
  addNotification: (notification: Omit<AppNotificationItem, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const STORAGE_KEY = 'yatra_setu_notifications';

const DEFAULT_NOTIFICATIONS: AppNotificationItem[] = [
  {
    id: 'notif-1',
    type: 'flight_update',
    title: 'Flight 6E-204 Live Gate Assigned',
    message: 'Gate 4B assigned at Terminal 2. Boarding begins at 07:45 AM.',
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    read: false,
    link: '/dashboard/trips'
  },
  {
    id: 'notif-2',
    type: 'hotel_confirmed',
    title: 'Heritage Resort & Spa Check-in Confirmed',
    message: 'Your Deluxe Villa is reserved with early check-in requested.',
    timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    read: false,
    link: '/dashboard/bookings'
  },
  {
    id: 'notif-3',
    type: 'ai_itinerary',
    title: 'AI Smart Itinerary Synced',
    message: 'Goa 5-Day Explorer has been saved and optimized with weather buffers.',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    read: true,
    link: '/itinerary-generator'
  },
  {
    id: 'notif-4',
    type: 'payment_completed',
    title: 'Payment Confirmed (₹14,999)',
    message: 'Razorpay UPI payment verified. Booking package confirmed.',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    read: true,
    link: '/dashboard/payments'
  }
];

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotificationItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to parse notifications from localStorage:', e);
    }
    return DEFAULT_NOTIFICATIONS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    } catch (e) {
      console.warn('Failed to save notifications to localStorage:', e);
    }
  }, [notifications]);

  // Supabase Realtime Global Notification Listener
  useEffect(() => {
    if (!user) return;

    const channel = supabase.channel(`user-notifications:${user.id}`);
    channel
      .on('broadcast', { event: 'new_notification' }, (payload: any) => {
        if (payload?.payload) {
          addNotification(payload.payload);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const addNotification = (notif: Omit<AppNotificationItem, 'id' | 'timestamp' | 'read'>) => {
    const newItem: AppNotificationItem = {
      ...notif,
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      read: false
    };
    setNotifications((prev) => [newItem, ...prev]);
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearAll
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
