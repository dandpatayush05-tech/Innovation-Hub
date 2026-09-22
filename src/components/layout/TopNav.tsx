import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Plane, Building2, Bus, Car, Compass, Sparkles, 
  User, LogOut, Calendar, CreditCard, HelpCircle, 
  Menu, X, ChevronDown, ShieldAlert, ShoppingBag, Search
} from 'lucide-react';
import { NotificationDropdown } from './NotificationDropdown';
import { useTripCart } from '../../context/TripCartContext';
import { GlobalSearchModal } from '../search/GlobalSearchModal';

export const TopNav: React.FC = () => {
  const { user, logout } = useAuth();
  const { itemCount, setIsCartOpen } = useTripCart();
  const location = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { name: 'Flights', href: '/dashboard/flights', icon: Plane },
    { name: 'Hotels', href: '/dashboard/hotels', icon: Building2 },
    { name: 'Buses', href: '/dashboard/buses', icon: Bus },
    { name: 'Cabs', href: '/dashboard/auto', icon: Car },
    { name: 'Experiences', href: '/experiences', icon: Compass },
    { name: 'Trip Planner', href: '/itineraries/generate', icon: Sparkles, badge: 'AI' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-black/5 transition-all shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link to="/dashboard" className="flex items-center space-x-2.5 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#C84B31] to-[#E06D53] flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
                <Plane className="w-5 h-5 -rotate-45" />
              </div>
              <span className="font-serif text-2xl font-bold tracking-tight text-[#2A2A2A] group-hover:text-[#C84B31] transition-colors">
                Yatra Setu
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Category Pills */}
          <nav className="hidden lg:flex items-center gap-1 bg-[#FDFBF7] p-1.5 rounded-full border border-black/5">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.href;
              return (
                <Link
                  key={link.name}
                  to={link.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-white text-[#C84B31] shadow-sm font-semibold'
                      : 'text-[#2A2A2A]/70 hover:text-[#2A2A2A] hover:bg-black/5'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#C84B31]' : 'text-[#2A2A2A]/50'}`} />
                  <span>{link.name}</span>
                  {link.badge && (
                    <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3">
            {/* Business / Admin Dashboard link */}
            {(user?.role === 'business' || user?.role === 'admin') && (
              <Link
                to={user?.role === 'admin' ? '/admin-dashboard' : '/business-dashboard'}
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-full hover:bg-emerald-100 transition-colors"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>{user?.role === 'admin' ? 'Admin Portal' : 'Business Portal'}</span>
              </Link>
            )}

            {/* Quick Search Button */}
            <button
              onClick={() => setSearchModalOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FDFBF7] border border-black/10 hover:border-black/20 text-[#2A2A2A]/70 hover:text-black transition-all cursor-pointer text-xs font-medium"
              title="Global Search (Ctrl+K / Cmd+K)"
            >
              <Search className="w-4 h-4 text-[#C84B31]" />
              <span className="hidden md:inline">Search destinations...</span>
              <kbd className="hidden md:inline-flex items-center text-[10px] font-mono text-gray-400 bg-white px-1.5 py-0.5 rounded border border-black/5">
                ⌘K
              </kbd>
            </button>

            {/* Notification Bell */}
            <NotificationDropdown />

            {/* Trip Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-[#2A2A2A]/70 hover:text-[#C84B31] transition-colors rounded-full hover:bg-black/5 cursor-pointer"
              title="Trip Cart / All-in-One Package"
            >
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-[#C84B31] text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center ring-2 ring-white animate-pulse">
                  {itemCount}
                </span>
              )}
            </button>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full border border-black/10 hover:border-black/20 bg-white hover:bg-gray-50 transition-all focus:outline-none cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-[#C84B31]/10 text-[#C84B31] flex items-center justify-center font-bold text-sm">
                  {user?.name ? user.name[0].toUpperCase() : <User className="w-4 h-4" />}
                </div>
                <span className="hidden sm:block text-sm font-medium text-[#2A2A2A] max-w-[100px] truncate">
                  {user?.name?.split(' ')[0] || 'Traveler'}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-gray-500 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-black/5 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="p-4 bg-[#FDFBF7] border-b border-black/5">
                    <p className="text-sm font-semibold text-[#2A2A2A] truncate">{user?.name || 'Traveler'}</p>
                    <p className="text-xs text-[#2A2A2A]/60 truncate">{user?.email}</p>
                    <span className="inline-block mt-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#C84B31]/10 text-[#C84B31]">
                      {user?.role || 'Traveler'}
                    </span>
                  </div>

                  <div className="py-2">
                    <Link
                      to="/dashboard/bookings"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#2A2A2A]/80 hover:bg-black/5 hover:text-[#2A2A2A] transition-colors"
                    >
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>My Bookings & Trips</span>
                    </Link>

                    <Link
                      to="/dashboard/payments"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#2A2A2A]/80 hover:bg-black/5 hover:text-[#2A2A2A] transition-colors"
                    >
                      <CreditCard className="w-4 h-4 text-gray-400" />
                      <span>Payments & Wallet</span>
                    </Link>

                    <Link
                      to="/help"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#2A2A2A]/80 hover:bg-black/5 hover:text-[#2A2A2A] transition-colors"
                    >
                      <HelpCircle className="w-4 h-4 text-gray-400" />
                      <span>Help & Support</span>
                    </Link>
                  </div>

                  <div className="p-2 border-t border-black/5">
                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 rounded-xl hover:bg-red-50 font-medium transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-black/5 px-4 pt-2 pb-6 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.href;
              return (
                <Link
                  key={link.name}
                  to={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 p-3 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-[#C84B31]/10 text-[#C84B31] font-semibold'
                      : 'bg-[#FDFBF7] text-[#2A2A2A]/80 hover:bg-black/5'
                  }`}
                >
                  <Icon className="w-4 h-4 text-[#C84B31]" />
                  <span>{link.name}</span>
                  {link.badge && (
                    <span className="ml-auto bg-amber-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          <div className="pt-2 border-t border-black/5 space-y-1">
            <Link
              to="/dashboard/bookings"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between p-2.5 text-sm text-gray-700 rounded-lg hover:bg-gray-50"
            >
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                My Bookings & Trips
              </span>
            </Link>
            <Link
              to="/dashboard/payments"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between p-2.5 text-sm text-gray-700 rounded-lg hover:bg-gray-50"
            >
              <span className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-gray-400" />
                Payments
              </span>
            </Link>
            <Link
              to="/help"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between p-2.5 text-sm text-gray-700 rounded-lg hover:bg-gray-50"
            >
              <span className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-gray-400" />
                Help & Support
              </span>
            </Link>
          </div>
        </div>
      )}

      {/* Global Search Modal */}
      <GlobalSearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
      />
    </header>
  );
};
