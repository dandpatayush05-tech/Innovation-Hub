import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  Compass, Calendar, Sparkles, User, 
  Search, LogOut, Plane, ShoppingBag
} from 'lucide-react';
import { NotificationDropdown } from '../components/layout/NotificationDropdown';
import { Sidebar } from '../components/layout/Sidebar';
import { useTripCart } from '../context/TripCartContext';

import { GlobalSearchModal } from '../components/search/GlobalSearchModal';

export const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { itemCount, setIsCartOpen } = useTripCart();
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  const mobileNavLinks = [
    { name: 'Explore', icon: Compass, path: '/destinations' },
    { name: 'My Trips', icon: Calendar, path: '/dashboard/bookings' },
    { name: 'AI Planner', icon: Sparkles, path: '/itinerary-generator' },
    { name: 'Profile', icon: User, path: '/dashboard/settings' },
  ];

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col md:flex-row">
      
      {/* Desktop Grouped Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Header */}
        <header className="bg-white border-b border-black/5 sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              
              {/* Mobile Header Left */}
              <div className="flex md:hidden items-center">
                <Link to="/" className="flex items-center space-x-2 text-[#2A2A2A]">
                  <Plane className="w-6 h-6 text-[#C84B31]" />
                </Link>
              </div>

              {/* Desktop Header Left */}
              <div className="hidden md:flex items-center gap-4 flex-1">
                <span className="text-[#2A2A2A]/80 font-medium">
                  Welcome back, {user?.name?.split(' ')[0] || 'Traveler'}
                </span>
                
                {/* Search Trigger Button */}
                <button
                  type="button"
                  onClick={() => setSearchModalOpen(true)}
                  className="relative max-w-md w-full ml-4 flex items-center justify-between pl-10 pr-4 py-2 border border-black/10 rounded-full leading-5 bg-[#FDFBF7] hover:bg-white hover:border-[#C84B31]/40 text-[#2A2A2A]/50 sm:text-sm transition-all cursor-pointer text-left"
                >
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-[#2A2A2A]/40" />
                  </div>
                  <span>Search destinations, hotels, flights...</span>
                  <kbd className="hidden sm:inline-flex items-center text-[10px] font-mono text-gray-400 bg-white px-1.5 py-0.5 rounded border border-black/10 shadow-2xs">
                    ⌘K
                  </kbd>
                </button>
              </div>

              {/* Header Right */}
              <div className="flex items-center space-x-4">
                {(user?.role === 'business' || user?.role === 'admin') && (
                  <Link 
                    to="/business-dashboard"
                    className="hidden sm:block text-xs font-medium bg-[#FDFBF7] border border-[#C84B31]/20 text-[#C84B31] px-3 py-1.5 rounded-full hover:bg-[#C84B31] hover:text-white transition-colors"
                  >
                    Business Portal
                  </Link>
                )}
                <NotificationDropdown />
                
                <div className="h-8 w-8 rounded-full bg-[#C84B31]/10 flex items-center justify-center text-[#C84B31] border border-[#C84B31]/20 hidden sm:flex">
                  <User className="w-4 h-4" />
                </div>
                
                <button 
                  onClick={logout}
                  className="text-[#2A2A2A]/60 hover:text-[#C84B31] transition-colors p-2"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
              
            </div>
          </div>
        </header>

        {/* Main Outlet */}
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-black/5 z-40 pb-safe">
        <div className="flex justify-around items-center h-16">
          {mobileNavLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
                  isActive ? 'text-[#C84B31]' : 'text-[#2A2A2A]/60'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-[#C84B31]' : 'text-[#2A2A2A]/60'}`} />
                <span className="text-[10px] font-medium">{link.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Global Search Modal */}
      <GlobalSearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
      />
      
    </div>
  );
};
