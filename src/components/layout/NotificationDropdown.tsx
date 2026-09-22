import React, { useState, useRef, useEffect } from 'react';
import { 
  Bell, Check, Trash2, Plane, Building2, 
  Sparkles, CreditCard, AlertTriangle, ChevronRight, X
} from 'lucide-react';
import { useNotifications, AppNotificationItem } from '../../context/NotificationContext';
import { useNavigate } from 'react-router-dom';

export const NotificationDropdown: React.FC = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<'all' | 'flights' | 'stays' | 'payments'>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredNotifications = notifications.filter((item) => {
    if (activeCategory === 'all') return true;
    if (activeCategory === 'flights') return item.type === 'flight_update' || item.type === 'delay_alert';
    if (activeCategory === 'stays') return item.type === 'hotel_confirmed' || item.type === 'ai_itinerary';
    if (activeCategory === 'payments') return item.type === 'payment_completed';
    return true;
  });

  const getCategoryDot = (type: AppNotificationItem['type']) => {
    switch (type) {
      case 'flight_update':
        return 'bg-sky-500';
      case 'delay_alert':
        return 'bg-red-500';
      case 'hotel_confirmed':
        return 'bg-blue-500';
      case 'ai_itinerary':
        return 'bg-purple-500';
      case 'payment_completed':
        return 'bg-emerald-500';
      default:
        return 'bg-amber-500';
    }
  };

  const getCategoryIcon = (type: AppNotificationItem['type']) => {
    switch (type) {
      case 'flight_update':
        return <Plane className="w-4 h-4 text-sky-600" />;
      case 'delay_alert':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'hotel_confirmed':
        return <Building2 className="w-4 h-4 text-blue-600" />;
      case 'ai_itinerary':
        return <Sparkles className="w-4 h-4 text-purple-600" />;
      case 'payment_completed':
        return <CreditCard className="w-4 h-4 text-emerald-600" />;
      default:
        return <Bell className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatTimestamp = (iso: string) => {
    try {
      const date = new Date(iso);
      const diffMs = Date.now() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      return `${Math.floor(diffHours / 24)}d ago`;
    } catch {
      return 'Recent';
    }
  };

  const handleNotificationClick = (notif: AppNotificationItem) => {
    markAsRead(notif.id);
    if (notif.link) {
      navigate(notif.link);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-full hover:bg-black/5 text-[#2A2A2A]/70 hover:text-black transition-all cursor-pointer focus:outline-none"
        title="Notifications"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#C84B31] text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-3xl bg-white border border-black/10 shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          
          {/* Header */}
          <div className="p-4 border-b border-black/5 bg-[#FDFBF7] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-base text-[#2A2A2A]">Notifications</span>
              {unreadCount > 0 && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#C84B31]/10 text-[#C84B31]">
                  {unreadCount} unread
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {notifications.length > 0 && (
                <>
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-[#2A2A2A]/60 hover:text-black font-medium flex items-center gap-1 cursor-pointer"
                    title="Mark all as read"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Read all</span>
                  </button>
                  <button
                    onClick={clearAll}
                    className="text-xs text-red-500 hover:text-red-700 font-medium flex items-center gap-1 cursor-pointer pl-1"
                    title="Clear all notifications"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1 px-3 py-2 border-b border-black/5 bg-white overflow-x-auto text-xs">
            {(['all', 'flights', 'stays', 'payments'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1 rounded-full font-semibold transition-all capitalize whitespace-nowrap cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-[#C84B31] text-white'
                    : 'text-gray-500 hover:bg-black/5'
                }`}
              >
                {cat === 'all' ? 'All Alerts' : cat}
              </button>
            ))}
          </div>

          {/* Notifications List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-black/5">
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-4 flex items-start gap-3 transition-colors cursor-pointer hover:bg-black/[0.02] ${
                    !notif.read ? 'bg-orange-500/[0.03]' : ''
                  }`}
                >
                  {/* Status Dot & Icon */}
                  <div className="relative shrink-0 mt-0.5">
                    <div className="w-9 h-9 rounded-xl bg-[#FDFBF7] border border-black/5 flex items-center justify-center">
                      {getCategoryIcon(notif.type)}
                    </div>
                    {!notif.read && (
                      <span className={`absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-white ${getCategoryDot(notif.type)}`} />
                    )}
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <h5 className={`text-xs font-bold truncate ${!notif.read ? 'text-[#2A2A2A]' : 'text-gray-600'}`}>
                        {notif.title}
                      </h5>
                      <span className="text-[10px] text-gray-400 shrink-0 font-mono">
                        {formatTimestamp(notif.timestamp)}
                      </span>
                    </div>
                    <p className="text-xs text-[#2A2A2A]/70 line-clamp-2 leading-relaxed">
                      {notif.message}
                    </p>
                  </div>

                  {/* Arrow Indicator */}
                  {notif.link && (
                    <ChevronRight className="w-4 h-4 text-gray-300 shrink-0 self-center" />
                  )}
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-400 space-y-2">
                <Bell className="w-8 h-8 mx-auto text-gray-300 opacity-60" />
                <p className="text-xs font-medium text-gray-500">No alerts in this category</p>
                <p className="text-[11px] text-gray-400">You're all caught up with your travel schedule.</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 bg-[#FDFBF7] border-t border-black/5 text-center">
            <span className="text-[11px] text-[#2A2A2A]/50 font-mono">
              Live updates via Supabase Realtime & WebSockets
            </span>
          </div>

        </div>
      )}
    </div>
  );
};
