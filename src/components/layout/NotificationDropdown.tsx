import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, Clock, ShieldAlert, CreditCard, X, CalendarCheck } from 'lucide-react';
import { type AppNotification, getNotifications, markAsRead, markAllAsRead } from '../../api/notifications';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { info: toastInfo } = useToast();

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const data = await getNotifications();
      setNotifications(data.notifications || []);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const token = localStorage.getItem('accessToken');
      if (token) {
        const sse = new EventSource(`http://localhost:5000/api/notifications/stream?token=${token}`);
        
        sse.onmessage = (event) => {
          try {
            const newNotification = JSON.parse(event.data);
            setNotifications(prev => [newNotification, ...prev]);
            toastInfo(`${newNotification.title}: ${newNotification.message}`);
          } catch (e) {
            console.error('Error parsing SSE data', e);
          }
        };

        return () => sse.close();
      }
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await markAsRead(id);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'booking_confirmation': return <CalendarCheck className="w-4 h-4 text-emerald-500" />;
      case 'payment_success': return <CreditCard className="w-4 h-4 text-emerald-500" />;
      case 'payment_failed': return <X className="w-4 h-4 text-red-500" />;
      case 'booking_cancelled': return <X className="w-4 h-4 text-gray-500" />;
      case 'reminder': return <Clock className="w-4 h-4 text-amber-500" />;
      case 'system_alert': return <ShieldAlert className="w-4 h-4 text-blue-500" />;
      default: return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(diff / 3600000);
    if (hours < 24) return `${hours}h ago`;
    
    const days = Math.floor(diff / 86400000);
    if (days < 7) return `${days}d ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="text-[#2A2A2A]/60 hover:text-[#C84B31] transition-colors relative p-2"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-[#C84B31] ring-2 ring-white" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-black/5 overflow-hidden z-50">
          <div className="p-4 border-b border-black/5 flex items-center justify-between bg-[#FDFBF7]">
            <h3 className="font-medium text-[#2A2A2A]">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllAsRead}
                className="text-xs text-[#C84B31] hover:underline font-medium"
              >
                Mark all as read
              </button>
            )}
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-[#2A2A2A]/50">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">You have no notifications.</p>
              </div>
            ) : (
              <div className="divide-y divide-black/5">
                {notifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className={`p-4 flex gap-3 hover:bg-black/[0.02] transition-colors ${!notification.read ? 'bg-blue-50/30' : ''}`}
                  >
                    <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${!notification.read ? 'bg-white shadow-sm' : 'bg-black/5'}`}>
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2 mb-1">
                        <p className={`text-sm font-medium text-[#2A2A2A] ${!notification.read ? '' : 'opacity-80'}`}>
                          {notification.title}
                        </p>
                        <span className="text-[10px] text-[#2A2A2A]/40 whitespace-nowrap shrink-0">
                          {formatTime(notification.created_at)}
                        </span>
                      </div>
                      <p className={`text-xs leading-relaxed ${!notification.read ? 'text-[#2A2A2A]/70' : 'text-[#2A2A2A]/50'}`}>
                        {notification.message}
                      </p>
                    </div>
                    {!notification.read && (
                      <button 
                        onClick={(e) => handleMarkAsRead(notification.id, e)}
                        className="shrink-0 text-emerald-500 hover:text-emerald-600 p-1 self-start"
                        title="Mark as read"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
