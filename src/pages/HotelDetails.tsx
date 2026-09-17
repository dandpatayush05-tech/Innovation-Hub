import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getHotel, type Hotel } from '../api/hotels';
import { createBooking } from '../api/bookings';
import { Checkout } from '../components/Checkout';
import { MapPin, Star, Building2, Loader2, Info, ArrowLeft, Check, Calendar, Users, Briefcase } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const HotelDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Booking Form State
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const [rooms, setRooms] = useState(1);
  
  // Checkout Flow State
  const [step, setStep] = useState<'details' | 'review' | 'payment' | 'success'>('details');
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    const fetchHotel = async () => {
      try {
        const res = await getHotel(id);
        setHotel(res.data);
      } catch (err) {
        console.error('Failed to fetch hotel details', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHotel();
  }, [id]);

  const calculateDays = () => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn).getTime();
    const end = new Date(checkOut).getTime();
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const days = calculateDays();
  const totalPrice = hotel ? hotel.price_per_night * days * rooms : 0;

  const handleProceedToReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (days <= 0) {
      setError('Check-out date must be after check-in date.');
      return;
    }
    setError('');
    setStep('review');
  };

  const handleCreateBooking = async () => {
    if (!hotel || !user) return;
    setIsSubmitting(true);
    setError('');
    try {
      // 1. Create the pending booking via the backend
      const res = await createBooking({
        hotel_id: hotel.id,
        check_in_date: new Date(checkIn).toISOString(),
        check_out_date: new Date(checkOut).toISOString(),
        guests,
        rooms,
        total_price: totalPrice,
        occasion: 'vacation' // default
      }) as any; // Type workaround for return structure
      
      const newBookingId = res.booking?.id;
      if (!newBookingId) throw new Error("Failed to retrieve booking ID");
      
      setBookingId(newBookingId);
      setStep('payment');
    } catch (err: any) {
      console.error(err);
      if (err.response?.data?.error?.details) {
        const details = err.response.data.error.details;
        if (Array.isArray(details)) {
          setError(`Validation failed: ${details.map((d: any) => `${d.path}: ${d.message}`).join(', ')}`);
        } else {
          setError(`Error: ${err.response.data.error.message} - ${details}`);
        }
      } else {
        setError(err.response?.data?.error?.message || 'Failed to create booking.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentSuccess = () => {
    setStep('success');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#C84B31]" />
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-serif">Hotel not found</h2>
        <button onClick={() => navigate('/dashboard/hotels')} className="mt-4 text-[#C84B31] hover:underline">Return to search</button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Demo Banner */}
      <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl flex items-start gap-3">
        <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-sm">Test Environment: Demo Inventory</p>
          <p className="text-xs mt-1 opacity-80">
            This hotel listing and the ensuing booking process use a test payment gateway. No real reservation is made.
          </p>
        </div>
      </div>

      <button onClick={() => navigate('/dashboard/hotels')} className="flex items-center text-sm font-medium text-[#2A2A2A]/60 hover:text-[#2A2A2A] transition-colors">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Hotels
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Hotel Info */}
        <div className="lg:col-span-2 space-y-8">
          
          <div className="rounded-3xl overflow-hidden aspect-video relative bg-slate-100">
            {hotel.image_url ? (
              <img src={hotel.image_url} alt={hotel.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Building2 className="w-20 h-20 text-slate-300" />
              </div>
            )}
            {hotel.rating && (
              <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="font-semibold text-[#2A2A2A]">{hotel.rating}</span>
              </div>
            )}
          </div>

          <div>
            <h1 className="text-3xl md:text-4xl font-serif text-[#2A2A2A] mb-3">{hotel.name}</h1>
            <div className="flex items-center text-[#2A2A2A]/60 mb-6">
              <MapPin className="w-4 h-4 mr-1.5" />
              <span>Great Location</span>
            </div>
            
            <h3 className="text-xl font-medium mb-3">About this hotel</h3>
            <p className="text-[#2A2A2A]/80 leading-relaxed whitespace-pre-line mb-8">
              {hotel.description}
            </p>

            {hotel.amenities && hotel.amenities.length > 0 && (
              <>
                <h3 className="text-xl font-medium mb-4">Amenities</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {hotel.amenities.map((amenity, i) => (
                    <div key={i} className="flex items-center gap-2 text-[#2A2A2A]/80">
                      <Check className="w-5 h-5 text-emerald-500" />
                      <span className="text-sm">{amenity}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Column: Booking Widget */}
        <div className="relative">
          <div className="sticky top-6 bg-white rounded-3xl p-6 border border-black/5 shadow-xl shadow-black/[0.03]">
            
            {step === 'details' && (
              <form onSubmit={handleProceedToReview} className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-[#2A2A2A] mb-1">
                    ${hotel.price_per_night} <span className="text-sm font-normal text-[#2A2A2A]/60">/ night</span>
                  </h3>
                  <p className="text-xs text-emerald-600 font-medium">Free Cancellation (Demo)</p>
                </div>

                {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl">{error}</div>}

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#2A2A2A]/60 mb-1">Check-in</label>
                      <input 
                        type="date" 
                        required
                        value={checkIn}
                        onChange={(e) => setCheckIn(e.target.value)}
                        className="w-full border border-black/10 rounded-xl px-3 py-2 text-sm focus:border-[#C84B31] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#2A2A2A]/60 mb-1">Check-out</label>
                      <input 
                        type="date" 
                        required
                        value={checkOut}
                        onChange={(e) => setCheckOut(e.target.value)}
                        className="w-full border border-black/10 rounded-xl px-3 py-2 text-sm focus:border-[#C84B31] outline-none"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#2A2A2A]/60 mb-1">Guests</label>
                      <input 
                        type="number" min="1" required
                        value={guests}
                        onChange={(e) => setGuests(parseInt(e.target.value))}
                        className="w-full border border-black/10 rounded-xl px-3 py-2 text-sm focus:border-[#C84B31] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#2A2A2A]/60 mb-1">Rooms</label>
                      <input 
                        type="number" min="1" required
                        value={rooms}
                        onChange={(e) => setRooms(parseInt(e.target.value))}
                        className="w-full border border-black/10 rounded-xl px-3 py-2 text-sm focus:border-[#C84B31] outline-none"
                      />
                    </div>
                  </div>

                  <div>
                     <label className="block text-xs font-semibold uppercase tracking-wider text-[#2A2A2A]/60 mb-1">Room Type</label>
                     <div className="w-full border border-black/10 bg-slate-50 rounded-xl px-3 py-2 text-sm text-[#2A2A2A]/70 cursor-not-allowed">
                       Standard Room
                     </div>
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-[#C84B31] text-white py-3.5 rounded-xl font-medium hover:bg-[#A63A25] transition-colors"
                >
                  Review Booking
                </button>
              </form>
            )}

            {step === 'review' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <button onClick={() => setStep('details')} className="text-sm font-medium text-[#2A2A2A]/60 hover:text-[#2A2A2A] flex items-center">
                  <ArrowLeft className="w-4 h-4 mr-1" /> Modify details
                </button>
                
                <h3 className="text-xl font-medium text-[#2A2A2A]">Review & Confirm</h3>
                
                <div className="bg-[#FDFBF7] p-4 rounded-2xl border border-black/5 space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#2A2A2A]/60 flex items-center gap-1.5"><Calendar className="w-4 h-4"/> Dates</span>
                    <span className="font-medium">{days} night(s)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#2A2A2A]/60 flex items-center gap-1.5"><Users className="w-4 h-4"/> Guests</span>
                    <span className="font-medium">{guests} Guest(s)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#2A2A2A]/60 flex items-center gap-1.5"><Briefcase className="w-4 h-4"/> Rooms</span>
                    <span className="font-medium">{rooms} Standard Room(s)</span>
                  </div>
                </div>

                <div className="space-y-2 border-t border-black/5 pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#2A2A2A]/60">${hotel.price_per_night} x {days} nights x {rooms} rooms</span>
                    <span>${totalPrice}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#2A2A2A]/60">Taxes & Fees (Demo)</span>
                    <span>$0.00</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2">
                    <span>Total (USD)</span>
                    <span className="text-[#C84B31]">${totalPrice}</span>
                  </div>
                </div>

                {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl">{error}</div>}

                <button 
                  onClick={handleCreateBooking}
                  disabled={isSubmitting}
                  className="w-full bg-black text-white py-3.5 rounded-xl font-medium hover:bg-[#333] transition-colors disabled:opacity-50 flex justify-center items-center"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm Details & Pay'}
                </button>
              </div>
            )}

            {step === 'payment' && bookingId && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="text-xl font-medium text-[#2A2A2A]">Complete Payment</h3>
                <p className="text-sm text-[#2A2A2A]/60">Your booking is reserved pending payment.</p>
                
                <Checkout 
                  bookingId={bookingId}
                  bookingType="hotel"
                  onSuccess={handlePaymentSuccess}
                  onCancel={() => setStep('review')}
                />
              </div>
            )}

            {step === 'success' && (
              <div className="space-y-6 text-center animate-in zoom-in-95 duration-500 py-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-serif text-[#2A2A2A]">Booking Confirmed!</h3>
                <p className="text-sm text-[#2A2A2A]/60">
                  Your demo reservation at {hotel.name} was successful. An invoice has been generated.
                </p>
                
                <button 
                  onClick={() => navigate('/dashboard')}
                  className="w-full bg-slate-100 text-[#2A2A2A] py-3 rounded-xl font-medium hover:bg-slate-200 transition-colors mt-4"
                >
                  Go to Dashboard
                </button>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};
