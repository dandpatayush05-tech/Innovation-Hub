import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import api from '../lib/axios';
import { getUserBookings, getUserGuideBookings } from '../api/bookings';
import { getDestinations } from '../api/destinations';
import type { Booking, GuideBooking } from '../api/bookings';
import type { Destination } from '../api/destinations';
import { Plane, Calendar, Map, Building2, Compass, ArrowRight, Bus, Car, Ticket, CreditCard } from 'lucide-react';
import { LoadingState } from '../components/states/LoadingState';
import { ErrorState } from '../components/states/ErrorState';
import { EmptyState } from '../components/states/EmptyState';
import { ChatWidget } from '../components/chat/ChatWidget';

export const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [itineraries, setItineraries] = useState<any[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [guideBookings, setGuideBookings] = useState<GuideBooking[]>([]);
  const [autoBookings, setAutoBookings] = useState<any[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [unifiedBookings, setUnifiedBookings] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [dataError, setDataError] = useState<unknown>(null);

  const [activeTab, setActiveTab] = useState('Hotels');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        const safeFetch = <T,>(promise: Promise<T>, fallback: T) => promise.catch(err => { console.error('Dashboard fetch error:', err); return fallback; });

        const [itinerariesRes, bookingsRes, guideBookingsRes, destinationsRes, autoBookingsRes, unifiedRes] = await Promise.all([
          safeFetch(api.get(`/itineraries/user/${user.id}`), { data: { itineraries: [] } } as any),
          safeFetch(getUserBookings(user.id), { bookings: [] } as any),
          safeFetch(getUserGuideBookings(user.id), { guideBookings: [] } as any),
          safeFetch(getDestinations({ limit: 4 }), { data: [] } as any),
          safeFetch(import('../api/auto').then(m => m.getUserAutoBookings(user.id)), { bookings: [] } as any),
          safeFetch(import('../api/bookings').then(m => m.getUnifiedBookings()), { bookings: [] } as any)
        ]);
        setItineraries(itinerariesRes.data?.itineraries || []);
        setBookings(bookingsRes.bookings || []);
        setGuideBookings(guideBookingsRes.guideBookings || []);
        setDestinations(destinationsRes.data || []);
        setAutoBookings(autoBookingsRes.bookings || []);
        setUnifiedBookings(unifiedRes.bookings || []);
      } catch (error) {
        console.error('Failed to fetch data', error);
        setDataError(error);
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [user]);

  if (authLoading || loadingData) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingState message="Loading your dashboard..." />
      </div>
    );
  }

  if (dataError) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <ErrorState error={dataError} onRetry={() => window.location.reload()} />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="p-6 md:p-8 space-y-12">
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#2A2A2A] to-black rounded-3xl p-8 md:p-12 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2074&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay"></div>
        <div className="relative z-10 max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-serif mb-4">Where will your next journey take you?</h1>
          <p className="text-white/70 text-lg mb-8">Plan, book, and manage your entire trip in one place.</p>
          
          <div className="bg-white rounded-2xl p-4 shadow-xl">
            <div className="flex space-x-6 border-b border-black/10 pb-4 mb-4 overflow-x-auto no-scrollbar">
              {['Hotels', 'Flights', 'Buses', 'Auto', 'Experiences'].map((tab) => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex items-center space-x-2 text-sm font-medium whitespace-nowrap transition-colors ${
                    activeTab === tab ? 'text-[#C84B31]' : 'text-[#2A2A2A]/60 hover:text-[#2A2A2A]'
                  }`}
                >
                  {tab === 'Hotels' && <Building2 className="w-4 h-4" />}
                  {tab === 'Flights' && <Plane className="w-4 h-4" />}
                  {tab === 'Buses' && <Bus className="w-4 h-4" />}
                  {tab === 'Auto' && <Car className="w-4 h-4" />}
                  {tab === 'Experiences' && <Compass className="w-4 h-4" />}
                  <span>{tab}</span>
                </button>
              ))}
            </div>
            
            <div className="flex flex-col md:flex-row gap-4">
              {activeTab === 'Flights' ? (
                <>
                  <div className="flex-1">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#2A2A2A]/60 mb-1">From</label>
                    <input 
                      type="text" 
                      placeholder="Departure City" 
                      id="flight-dep-input"
                      className="w-full bg-[#FDFBF7] border border-black/10 rounded-xl px-4 py-3 text-[#2A2A2A] focus:outline-none focus:border-[#C84B31]" 
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#2A2A2A]/60 mb-1">To</label>
                    <input 
                      type="text" 
                      placeholder="Arrival City" 
                      id="flight-arr-input"
                      className="w-full bg-[#FDFBF7] border border-black/10 rounded-xl px-4 py-3 text-[#2A2A2A] focus:outline-none focus:border-[#C84B31]" 
                    />
                  </div>
                </>
              ) : activeTab === 'Buses' ? (
                <>
                  <div className="flex-1">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#2A2A2A]/60 mb-1">From</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Paris" 
                      id="bus-src-input"
                      className="w-full bg-[#FDFBF7] border border-black/10 rounded-xl px-4 py-3 text-[#2A2A2A] focus:outline-none focus:border-[#C84B31]" 
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#2A2A2A]/60 mb-1">To</label>
                    <input 
                      type="text" 
                      placeholder="e.g. London" 
                      id="bus-dst-input"
                      className="w-full bg-[#FDFBF7] border border-black/10 rounded-xl px-4 py-3 text-[#2A2A2A] focus:outline-none focus:border-[#C84B31]" 
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="flex-1">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#2A2A2A]/60 mb-1">Destination</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Paris, France" 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-[#FDFBF7] border border-black/10 rounded-xl px-4 py-3 text-[#2A2A2A] focus:outline-none focus:border-[#C84B31]" 
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#2A2A2A]/60 mb-1">Dates</label>
                    <input type="text" placeholder="Add dates" className="w-full bg-[#FDFBF7] border border-black/10 rounded-xl px-4 py-3 text-[#2A2A2A] focus:outline-none focus:border-[#C84B31]" />
                  </div>
                </>
              )}
              
              <div className="flex-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#2A2A2A]/60 mb-1">
                  {activeTab === 'Flights' || activeTab === 'Buses' ? 'Passengers' : 'Travelers'}
                </label>
                <input type="text" placeholder={activeTab === 'Flights' ? "1 Passenger" : "2 adults"} className="w-full bg-[#FDFBF7] border border-black/10 rounded-xl px-4 py-3 text-[#2A2A2A] focus:outline-none focus:border-[#C84B31]" />
              </div>
              <div className="flex items-end">
                <button 
                  onClick={() => {
                    if (activeTab === 'Hotels') {
                      navigate(`/dashboard/hotels?q=${encodeURIComponent(searchQuery)}`);
                    } else if (activeTab === 'Flights') {
                      const dep = (document.getElementById('flight-dep-input') as HTMLInputElement)?.value || '';
                      const arr = (document.getElementById('flight-arr-input') as HTMLInputElement)?.value || '';
                      navigate(`/dashboard/flights?dep=${encodeURIComponent(dep)}&arr=${encodeURIComponent(arr)}`);
                    } else if (activeTab === 'Buses') {
                      const src = (document.getElementById('bus-src-input') as HTMLInputElement)?.value || '';
                      const dst = (document.getElementById('bus-dst-input') as HTMLInputElement)?.value || '';
                      navigate(`/dashboard/buses?source=${encodeURIComponent(src)}&destination=${encodeURIComponent(dst)}`);
                    } else if (activeTab === 'Auto') {
                      navigate(`/dashboard/auto`);
                    } else if (activeTab === 'Experiences') {
                      navigate(`/experiences?q=${encodeURIComponent(searchQuery)}`);
                    }
                  }}
                  className="w-full md:w-auto bg-[#C84B31] text-white px-8 py-3 rounded-xl font-medium hover:bg-[#A63A25] transition-colors"
                >
                  Search
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Bookings */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-serif text-[#2A2A2A]">Upcoming Bookings</h2>
          {bookings.length > 0 && <Link to="/destinations" className="text-sm font-medium text-[#C84B31]">Book another</Link>}
        </div>
        
        {bookings.length === 0 ? (
          <EmptyState 
            icon={<Calendar className="w-12 h-12 text-[#2A2A2A]/40 mb-4" />}
            title="No upcoming stays"
            message="Your next adventure starts here."
            action={<Link to="/destinations" className="bg-black text-white px-6 py-2.5 rounded-full font-medium hover:bg-[#333] transition-colors inline-block mt-2">Find a Hotel</Link>}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-3xl p-5 border border-black/5 flex gap-4 hover:shadow-lg transition-shadow">
                {booking.hotel?.image_url && (
                  <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0">
                    <img src={booking.hotel.image_url} alt={booking.hotel.name} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1 flex flex-col justify-center">
                  <span className={`self-start px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mb-1 ${
                    booking.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {booking.status}
                  </span>
                  <h3 className="font-medium text-[#2A2A2A] leading-tight mb-1">{booking.hotel?.name}</h3>
                  <p className="text-xs text-[#2A2A2A]/60">
                    {new Date(booking.check_in_date || (booking as any).check_in).toLocaleDateString()} &mdash; {new Date(booking.check_out_date || (booking as any).check_out).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Upcoming Experiences */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-serif text-[#2A2A2A]">Upcoming Experiences</h2>
        </div>
        
        {guideBookings.length === 0 ? (
          <EmptyState 
            icon={<Ticket className="w-12 h-12 text-[#2A2A2A]/40 mb-4" />}
            title="No upcoming experiences"
            message="Discover tours and activities for your trip."
            action={<Link to="/destinations" className="bg-[#C84B31] text-white px-6 py-2.5 rounded-full font-medium hover:bg-[#A63A25] transition-colors inline-block mt-2">Explore Experiences</Link>}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {guideBookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-3xl p-5 border border-black/5 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    booking.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {booking.status}
                  </span>
                  <span className="font-medium text-[#C84B31]">${booking.total_price}</span>
                </div>
                <h3 className="font-medium text-[#2A2A2A] mb-1">{booking.tour?.name || 'Tour Booking'}</h3>
                <p className="text-sm text-[#2A2A2A]/60 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {new Date(booking.booking_date).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Upcoming Local Transport */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-serif text-[#2A2A2A]">Upcoming Local Transport</h2>
        </div>
        
        {autoBookings.length === 0 ? (
          <EmptyState 
            icon={<Car className="w-12 h-12 text-[#2A2A2A]/40 mb-4" />}
            title="No upcoming rides"
            message="Book an auto or cab for your local commute."
            action={<button onClick={() => { setActiveTab('Auto'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="bg-[#C84B31] text-white px-6 py-2.5 rounded-full font-medium hover:bg-[#A63A25] transition-colors mt-2">Book Transport</button>}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {autoBookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-3xl p-5 border border-black/5 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    ['confirmed', 'completed'].includes(booking.status) ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {booking.status}
                  </span>
                  <span className="font-medium text-[#2A2A2A] capitalize text-sm">{booking.vehicle_type.replace('_', ' ')}</span>
                </div>
                <div className="space-y-2 mb-3">
                  <p className="text-sm text-[#2A2A2A]"><span className="text-[#2A2A2A]/60 text-xs uppercase mr-2">From</span> {booking.pickup_location}</p>
                  <p className="text-sm text-[#2A2A2A]"><span className="text-[#2A2A2A]/60 text-xs uppercase mr-2">To</span> {booking.dropoff_location}</p>
                </div>
                <p className="text-sm text-[#2A2A2A]/60 flex items-center gap-2 border-t border-black/5 pt-3">
                  <Calendar className="w-4 h-4" />
                  {new Date(booking.start_date).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Saved Itineraries */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-serif text-[#2A2A2A]">Saved Itineraries</h2>
          {itineraries.length > 0 && <Link to="/itineraries/generate" className="text-sm font-medium text-[#C84B31]">+ New</Link>}
        </div>

        {itineraries.length === 0 ? (
          <EmptyState 
            icon={<Map className="w-12 h-12 text-[#2A2A2A]/40 mb-4" />}
            title="No itineraries yet"
            message="Let AI plan the perfect trip for you."
            action={<Link to="/itineraries/generate" className="bg-[#C84B31] text-white px-6 py-2.5 rounded-full font-medium hover:bg-[#A63A25] transition-colors inline-block mt-2">Plan with AI</Link>}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {itineraries.map((itinerary) => (
              <div key={itinerary.id} className="bg-white rounded-3xl p-6 border border-black/5 hover:shadow-lg transition-shadow group flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-medium text-[#2A2A2A] mb-1">{itinerary.destination}</h3>
                  {itinerary.estimated_budget && (
                    <p className="text-sm text-emerald-600 font-medium mb-2">Est. {itinerary.estimated_budget}</p>
                  )}
                  <p className="text-sm text-[#2A2A2A]/60 mb-4 line-clamp-2">{itinerary.prompt}</p>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="bg-[#FDFBF7] px-3 py-1 rounded-full text-[#2A2A2A]/80 border border-black/5">
                    {itinerary.days?.length || 0} Days
                  </span>
                  <Link
                    to={`/itineraries/${itinerary.id}`}
                    className="text-[#C84B31] font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1"
                  >
                    View Details <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Explore Destinations */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-serif text-[#2A2A2A]">Explore Destinations</h2>
          <Link to="/destinations" className="text-sm font-medium text-[#C84B31]">View all</Link>
        </div>
        
        {destinations.length === 0 ? (
          <EmptyState 
            title="No destinations found"
            message="Check back later for featured destinations."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {destinations.map(dest => (
              <Link key={dest.id} to={`/destinations/${dest.id}`} className="group relative rounded-3xl overflow-hidden aspect-[3/4] block">
                <img src={dest.image_url} alt={dest.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-white font-serif text-xl mb-1">{dest.name}</h3>
                  <p className="text-white/80 text-sm">{dest.country}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Recent Transactions */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-serif text-[#2A2A2A]">Recent Transactions</h2>
        </div>
        
        {unifiedBookings.filter(b => b.amount != null).length === 0 ? (
          <EmptyState 
            icon={<CreditCard className="w-12 h-12 text-[#2A2A2A]/40 mb-4" />}
            title="No recent transactions"
            message="Your payment history will appear here once you make a booking."
          />
        ) : (
          <div className="bg-white rounded-3xl border border-black/5 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FDFBF7] border-b border-black/5">
                  <th className="py-4 px-6 font-medium text-[#2A2A2A]/60 text-sm">Date</th>
                  <th className="py-4 px-6 font-medium text-[#2A2A2A]/60 text-sm">Booking</th>
                  <th className="py-4 px-6 font-medium text-[#2A2A2A]/60 text-sm">Type</th>
                  <th className="py-4 px-6 font-medium text-[#2A2A2A]/60 text-sm text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {unifiedBookings.filter(b => b.amount != null).slice(0, 5).map((booking) => (
                  <tr key={booking.id} className="border-b border-black/5 hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6 text-sm text-[#2A2A2A]">
                      {new Date(booking.date).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-medium text-[#2A2A2A]">{booking.title}</p>
                      <p className="text-xs text-[#2A2A2A]/60">{booking.subtitle}</p>
                    </td>
                    <td className="py-4 px-6">
                      <span className="capitalize px-2 py-1 bg-gray-100 rounded text-xs text-[#2A2A2A]">{booking.type}</span>
                    </td>
                    <td className="py-4 px-6 text-right font-medium text-[#2A2A2A]">
                      ₹{booking.amount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* AI Assistant Chatbot */}
      <ChatWidget />
    </div>
  );
};
