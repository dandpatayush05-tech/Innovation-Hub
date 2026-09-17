import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUserGuideBookings, GuideBooking } from '../api/bookings';
import { Loader2, Ticket, MapPin, Calendar, Clock, Users, ArrowRight, Download, MessageCircle, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const UpcomingExperiences = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<GuideBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user) return;
      try {
        const res = await getUserGuideBookings(user.id);
        setBookings(res.guideBookings || []);
      } catch (error) {
        console.error('Failed to fetch guide bookings', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#C84B31]" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-serif text-[#2A2A2A] mb-2">Upcoming Experiences</h1>
        <p className="text-[#2A2A2A]/60">Manage your booked tours, activities, and local experiences.</p>
      </div>

      {bookings.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-black/5 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-[#FDFBF7] rounded-full flex items-center justify-center mb-4 text-[#2A2A2A]/40">
            <Ticket className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-medium text-[#2A2A2A] mb-2">No upcoming experiences</h3>
          <p className="text-[#2A2A2A]/60 mb-6">Discover tours and activities for your trip.</p>
          <Link to="/experiences" className="bg-[#C84B31] text-white px-6 py-2.5 rounded-full font-medium hover:bg-[#A63A25] transition-colors">
            Explore Experiences
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {bookings.map((booking) => (
            <div key={booking.id} className="bg-white rounded-3xl border border-black/5 overflow-hidden flex flex-col">
              
              {/* Header / Image Area */}
              <div className="relative h-48 bg-slate-100">
                {/* Fallback image logic if tour doesn't join image_url properly from api. We assume tour has name at least. */}
                <img 
                  src="https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&q=80&w=800" 
                  alt="Experience Cover" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-[#C84B31]">
                  {booking.status}
                </div>
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h3 className="text-2xl font-serif mb-1">{booking.tour?.name || 'Guided Experience'}</h3>
                  <div className="flex items-center gap-4 text-sm opacity-90">
                    <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> Destination</span>
                  </div>
                </div>
              </div>

              {/* Details Body */}
              <div className="p-6 flex-1 flex flex-col">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-[#FDFBF7] p-3 rounded-xl border border-black/5">
                    <div className="flex items-center gap-2 text-[#2A2A2A]/60 text-xs uppercase tracking-wider mb-1">
                      <Calendar className="w-4 h-4" /> Date
                    </div>
                    <div className="font-medium text-[#2A2A2A]">{new Date(booking.booking_date).toLocaleDateString()}</div>
                  </div>
                  <div className="bg-[#FDFBF7] p-3 rounded-xl border border-black/5">
                    <div className="flex items-center gap-2 text-[#2A2A2A]/60 text-xs uppercase tracking-wider mb-1">
                      <Clock className="w-4 h-4" /> Time Slot
                    </div>
                    {/* time_slot isn't in GuideBooking interface by default, falling back */}
                    <div className="font-medium text-[#2A2A2A]">{(booking as any).time_slot || '09:00 AM'}</div>
                  </div>
                  <div className="bg-[#FDFBF7] p-3 rounded-xl border border-black/5">
                    <div className="flex items-center gap-2 text-[#2A2A2A]/60 text-xs uppercase tracking-wider mb-1">
                      <Users className="w-4 h-4" /> Guests
                    </div>
                    <div className="font-medium text-[#2A2A2A]">{booking.participants}</div>
                  </div>
                  <div className="bg-[#FDFBF7] p-3 rounded-xl border border-black/5">
                    <div className="flex items-center gap-2 text-[#2A2A2A]/60 text-xs uppercase tracking-wider mb-1">
                      <Ticket className="w-4 h-4" /> Booking ID
                    </div>
                    <div className="font-medium text-[#2A2A2A] text-xs font-mono truncate" title={booking.id}>{booking.id.split('-')[0]}</div>
                  </div>
                </div>

                <div className="space-y-4 mb-6 text-sm text-[#2A2A2A]/80">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-[#C84B31] flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-[#2A2A2A]">Meeting Point & Directions</strong>
                      Main Entrance, Central Plaza. Please arrive 15 minutes before the start time. Look for the guide holding a red umbrella.
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-[#C84B31] flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-[#2A2A2A]">Cancellation Policy</strong>
                      Free cancellation up to 24 hours before the experience starts.
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-auto grid grid-cols-2 gap-3">
                  <button className="flex items-center justify-center gap-2 bg-[#FDFBF7] border border-black/10 hover:bg-[#F5F2EA] text-[#2A2A2A] py-2.5 rounded-xl font-medium transition-colors">
                    <Download className="w-4 h-4" /> Voucher
                  </button>
                  <button className="flex items-center justify-center gap-2 bg-[#FDFBF7] border border-black/10 hover:bg-[#F5F2EA] text-[#2A2A2A] py-2.5 rounded-xl font-medium transition-colors">
                    <MessageCircle className="w-4 h-4" /> Contact
                  </button>
                  <button className="col-span-2 flex items-center justify-center gap-2 bg-black text-white hover:bg-[#333] py-2.5 rounded-xl font-medium transition-colors">
                    Add to Itinerary <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
