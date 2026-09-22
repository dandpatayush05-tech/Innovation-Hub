import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  MapPin, Building2, Plane, Bus, Car, Compass,
  Calendar, Sparkles, CreditCard, User, Settings as SettingsIcon,
  HelpCircle, Briefcase, ShieldAlert, ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();

  const exploreLinks = [
    { name: 'Destinations', icon: MapPin, path: '/destinations' },
    { name: 'Hotels & Stays', icon: Building2, path: '/dashboard/hotels' },
    { name: 'Flights', icon: Plane, path: '/dashboard/flights' },
    { name: 'Buses', icon: Bus, path: '/dashboard/buses' },
    { name: 'Cabs & Auto', icon: Car, path: '/dashboard/auto' },
    { name: 'Experiences', icon: Compass, path: '/experiences' },
  ];

  const travelLinks = [
    { name: 'My Trips', icon: Calendar, path: '/dashboard/bookings' },
    { name: 'AI Trip Planner', icon: Sparkles, path: '/itinerary-generator' },
    { name: 'Payments', icon: CreditCard, path: '/dashboard/payments' },
  ];

  const accountLinks = [
    { name: 'Profile', icon: User, path: '/dashboard/settings' },
    { name: 'Settings', icon: SettingsIcon, path: '/dashboard/settings' },
    { name: 'Help & FAQs', icon: HelpCircle, path: '/help' },
  ];

  const renderNavGroup = (title: string, links: typeof exploreLinks) => (
    <div className="space-y-1.5">
      <h4 className="px-3 text-[11px] font-bold uppercase tracking-wider text-[#2A2A2A]/40 font-mono">
        {title}
      </h4>
      <div className="space-y-0.5">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = 
            location.pathname === link.path || 
            (link.path === '/itinerary-generator' && (location.pathname === '/itinerary-generator' || location.pathname === '/itineraries/generate')) ||
            (link.path !== '/dashboard/settings' && location.pathname.startsWith(link.path + '/'));
          return (
            <Link
              key={link.name}
              to={link.path}
              className={`flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all ${isActive
                  ? 'bg-[#C84B31]/10 text-[#C84B31] font-semibold'
                  : 'text-[#2A2A2A]/70 hover:bg-black/5 hover:text-[#2A2A2A]'
                }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#C84B31]' : 'text-[#2A2A2A]/50'}`} />
                <span>{link.name}</span>
              </div>
              {isActive && <ChevronRight className="w-3.5 h-3.5 text-[#C84B31]" />}
            </Link>
          );
        })}
      </div>
    </div>
  );

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-black/5 h-screen sticky top-0 overflow-y-auto">

      {/* Brand Header */}
      <div className="p-5 border-b border-black/5">
        <Link to="/dashboard" className="flex items-center space-x-2 text-[#2A2A2A] hover:opacity-85 transition-opacity">
          <Plane className="w-7 h-7 text-[#C84B31]" />
          <span className="text-2xl font-serif font-bold tracking-tight">Yatra Setu</span>
        </Link>
      </div>

      {/* Grouped Nav Items */}
      <nav className="flex-1 p-4 space-y-6">

        {/* 1. Explore */}
        {renderNavGroup('Explore', exploreLinks)}

        {/* 2. My Travel */}
        {renderNavGroup('My Travel', travelLinks)}

        {/* 3. Account */}
        {renderNavGroup('Account', accountLinks)}

        {/* Role-Based Portals */}
        {(user?.role === 'business' || user?.role === 'admin') && (
          <div className="space-y-1.5 pt-2 border-t border-black/5">
            <h4 className="px-3 text-[11px] font-bold uppercase tracking-wider text-[#2A2A2A]/40 font-mono">
              Management Portals
            </h4>

            <Link
              to="/business-dashboard"
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${location.pathname === '/business-dashboard'
                  ? 'bg-[#C84B31]/10 text-[#C84B31] font-semibold'
                  : 'text-[#2A2A2A]/70 hover:bg-black/5 hover:text-[#2A2A2A]'
                }`}
            >
              <Briefcase className="w-4 h-4 text-[#2A2A2A]/50" />
              <span>Business Dashboard</span>
            </Link>

            {user?.role === 'admin' && (
              <Link
                to="/admin-dashboard"
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${location.pathname === '/admin-dashboard'
                    ? 'bg-[#C84B31]/10 text-[#C84B31] font-semibold'
                    : 'text-[#2A2A2A]/70 hover:bg-black/5 hover:text-[#2A2A2A]'
                  }`}
              >
                <ShieldAlert className="w-4 h-4 text-[#2A2A2A]/50" />
                <span>Admin Console</span>
              </Link>
            )}
          </div>
        )}

      </nav>

      {/* User Footer Card */}
      <div className="p-4 border-t border-black/5 bg-[#FDFBF7]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#C84B31]/10 text-[#C84B31] flex items-center justify-center font-bold text-sm">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-[#2A2A2A] truncate">{user?.name || 'Traveler'}</p>
            <p className="text-[10px] text-[#2A2A2A]/50 font-mono uppercase truncate">{user?.role || 'Traveler'} Account</p>
          </div>
        </div>
      </div>

    </aside>
  );
};
