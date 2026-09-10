import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Plane, LogOut, Map, Calendar, Loader2, User as UserIcon } from 'lucide-react';

export const Dashboard = () => {
  const { user, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [itineraries, setItineraries] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        const [itinerariesRes, bookingsRes] = await Promise.all([
          api.get(`/itineraries/user/${user.id}`),
          api.get(`/bookings/user/${user.id}`)
        ]);
        setItineraries(itinerariesRes.data.itineraries || []);
        setBookings(bookingsRes.data.bookings || []);
      } catch (error) {
        console.error('Failed to fetch data', error);
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [user]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#C84B31]" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      {/* Navigation */}
      <nav className="border-b border-black/5 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <Link to="/" className="flex items-center space-x-2 text-[#2A2A2A] hover:opacity-80 transition-opacity">
              <Plane className="w-8 h-8" />
              <span className="text-2xl font-serif tracking-tight">Vstara</span>
            </Link>
            
            <div className="flex items-center space-x-6">
              <span className="text-[#2A2A2A]/80 font-medium hidden sm:block">Hello, {user.name}</span>
              <button 
                onClick={logout}
                className="flex items-center space-x-2 text-[#2A2A2A]/60 hover:text-[#C84B31] transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-serif text-[#2A2A2A] mb-4">Your Journey Awaits</h1>
          <p className="text-lg text-[#2A2A2A]/60 font-light max-w-2xl">
            Access your AI-generated itineraries and manage your upcoming bookings.
          </p>
        </div>

        {/* Dashboard Content */}
        <div className="space-y-12">

          {/* Account Section */}
          <section>
            <div className="flex items-center mb-6">
              <h2 className="text-2xl font-serif text-[#2A2A2A] flex items-center gap-3">
                <UserIcon className="w-6 h-6 text-[#C84B31]" />
                My Account
              </h2>
            </div>
            <div className="bg-white rounded-3xl p-8 border border-black/5 flex flex-col sm:flex-row items-center justify-between gap-6 hover:shadow-lg transition-shadow">
              <div>
                <h3 className="text-xl font-medium text-[#2A2A2A] mb-1">{user.name}</h3>
                <p className="text-[#2A2A2A]/60">{user.email}</p>
                <div className="mt-3">
                  <span className="bg-[#FDFBF7] px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider text-[#C84B31] border border-[#C84B31]/20">
                    {user.role} Account
                  </span>
                </div>
              </div>
              <button className="text-sm font-medium bg-[#FDFBF7] border border-black/10 px-6 py-2.5 rounded-full hover:bg-black/5 transition-colors">
                Edit Profile
              </button>
            </div>
          </section>
          
          {/* Itineraries Section */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-serif text-[#2A2A2A] flex items-center gap-3">
                <Map className="w-6 h-6 text-[#C84B31]" />
                Saved Itineraries
              </h2>
              <Link to="/" className="text-sm font-medium text-[#C84B31] hover:text-[#A63A25] transition-colors">
                + Create New
              </Link>
            </div>

            {loadingData ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-[#C84B31]" />
              </div>
            ) : itineraries.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 border border-black/5 text-center">
                <p className="text-[#2A2A2A]/60 mb-4">You haven't generated any itineraries yet.</p>
                <Link to="/" className="inline-block bg-[#C84B31] text-white px-6 py-2.5 rounded-full font-medium hover:bg-[#A63A25] transition-colors">
                  Plan a trip
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {itineraries.map((itinerary) => (
                  <div key={itinerary._id} className="bg-white rounded-3xl p-6 border border-black/5 hover:shadow-lg transition-shadow group">
                    <h3 className="text-xl font-medium text-[#2A2A2A] mb-2">{itinerary.destination}</h3>
                    <p className="text-sm text-[#2A2A2A]/60 mb-4 line-clamp-2">{itinerary.prompt}</p>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="bg-[#FDFBF7] px-3 py-1 rounded-full text-[#2A2A2A]/80 border border-black/5">
                        {itinerary.days?.length || 0} Days
                      </span>
                      <button className="text-[#C84B31] font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                        View Details <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Bookings Section */}
          <section>
            <div className="flex items-center mb-6">
              <h2 className="text-2xl font-serif text-[#2A2A2A] flex items-center gap-3">
                <Calendar className="w-6 h-6 text-[#C84B31]" />
                Upcoming Bookings
              </h2>
            </div>
            
            {loadingData ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-[#C84B31]" />
              </div>
            ) : bookings.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 border border-black/5 flex flex-col items-center justify-center text-center">
                <p className="text-[#2A2A2A]/60 mb-2">No upcoming bookings found.</p>
                <p className="text-sm text-[#2A2A2A]/40">Explore our destinations and find your perfect stay.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {bookings.map((booking) => (
                  <div key={booking._id} className="bg-white rounded-3xl p-6 border border-black/5 flex flex-col sm:flex-row gap-6 hover:shadow-lg transition-shadow">
                    {/* If hotel is populated, show image */}
                    {booking.hotelId?.imageUrl && (
                      <div className="w-full sm:w-32 h-32 rounded-2xl overflow-hidden flex-shrink-0">
                        <img 
                          src={booking.hotelId.imageUrl} 
                          alt={booking.hotelId.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-medium text-[#2A2A2A]">
                            {booking.hotelId?.name || 'Hotel Booking'}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider ${
                            booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                            booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {booking.status}
                          </span>
                        </div>
                        
                        <p className="text-sm text-[#2A2A2A]/60 mb-1">
                          {new Date(booking.checkInDate).toLocaleDateString()} &mdash; {new Date(booking.checkOutDate).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-[#2A2A2A]/60">
                          {booking.guests} {booking.guests === 1 ? 'Guest' : 'Guests'} • {booking.rooms} {booking.rooms === 1 ? 'Room' : 'Rooms'}
                        </p>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-black/5 flex items-center justify-between">
                        <span className="text-lg font-medium text-[#2A2A2A]">
                          ${booking.totalPrice}
                        </span>
                        <button className="text-sm font-medium text-[#C84B31] hover:text-[#A63A25] transition-colors">
                          Manage
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

        </div>
      </main>
    </div>
  );
};

const ArrowRight = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
);
