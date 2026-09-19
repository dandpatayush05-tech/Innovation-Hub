import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Map, Building2, Plane, Bus, Car, Compass, 
  Calendar, Ticket, CreditCard, Settings, HelpCircle, 
  Search, LogOut, User
} from 'lucide-react';
import { NotificationDropdown } from '../components/layout/NotificationDropdown';

export const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const sidebarLinks = [
    { name: 'Overview', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Explore Destinations', icon: Map, path: '/destinations' },
    { name: 'Hotels', icon: Building2, path: '/dashboard/hotels' },
    { name: 'Flights', icon: Plane, path: '/dashboard/flights' },
    { name: 'Buses', icon: Bus, path: '/dashboard/buses' },
    { name: 'Auto/Local Transport', icon: Car, path: '/dashboard/transport' },
    { name: 'Experiences', icon: Compass, path: '/dashboard/experiences' },
    { name: 'My Itineraries', icon: Map, path: '/dashboard/itineraries' },
    { name: 'Upcoming Bookings', icon: Calendar, path: '/dashboard/bookings' },
    { name: 'Upcoming Experiences', icon: Ticket, path: '/dashboard/upcoming-experiences' },
    { name: 'Payments & Transactions', icon: CreditCard, path: '/dashboard/payments' },
    { name: 'Profile & Settings', icon: Settings, path: '/dashboard/settings' },
    { name: 'Help & Support', icon: HelpCircle, path: '/dashboard/support' },
  ];

  const mobileNavLinks = [
    { name: 'Home', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Explore', icon: Compass, path: '/destinations' },
    { name: 'Bookings', icon: Calendar, path: '/dashboard/bookings' },
    { name: 'Itineraries', icon: Map, path: '/dashboard/itineraries' },
    { name: 'Profile', icon: User, path: '/dashboard/settings' },
  ];

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col md:flex-row">
      
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-black/5 h-screen sticky top-0 overflow-y-auto">
        <div className="p-6">
          <Link to="/" className="flex items-center space-x-2 text-[#2A2A2A] hover:opacity-80 transition-opacity">
            <Plane className="w-8 h-8 text-[#C84B31]" />
            <span className="text-2xl font-serif tracking-tight">Vstara</span>
          </Link>
        </div>
        
        <nav className="flex-1 px-4 pb-6 space-y-1">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-colors ${
                  isActive 
                    ? 'bg-[#C84B31]/10 text-[#C84B31] font-medium' 
                    : 'text-[#2A2A2A]/70 hover:bg-black/5 hover:text-[#2A2A2A]'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-[#C84B31]' : 'text-[#2A2A2A]/50'}`} />
                <span className="text-sm">{link.name}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

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
                
                {/* Search Bar */}
                <form onSubmit={handleSearch} className="relative max-w-md w-full ml-4">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-[#2A2A2A]/40" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search destinations..."
                    className="block w-full pl-10 pr-3 py-2 border border-black/10 rounded-full leading-5 bg-[#FDFBF7] placeholder-[#2A2A2A]/40 focus:outline-none focus:bg-white focus:border-[#C84B31] focus:ring-1 focus:ring-[#C84B31] sm:text-sm transition-colors"
                  />
                </form>
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
      
    </div>
  );
};
