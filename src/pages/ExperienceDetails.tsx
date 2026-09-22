import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getTour, Tour } from '../api/tours';
import { MOCK_EXPERIENCES, EnrichedTour } from '../data/mockExperiences';
import { createGuideBooking } from '../api/bookings';
import { Checkout } from '../components/Checkout';
import {
  Clock, MapPin, Star, Calendar as CalendarIcon, Info, ArrowLeft,
  Sparkles, CheckCircle2, ShieldCheck, ShoppingCart, Users, Check, Share2, Download
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTripCart } from '../context/TripCartContext';
import { useToast } from '../context/ToastContext';
import { generateAndDownloadReceipt } from '../lib/receiptGenerator';

export const ExperienceDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addItem, setIsCartOpen } = useTripCart();
  const { success } = useToast();

  const [tour, setTour] = useState<EnrichedTour | null>(null);
  const [loading, setLoading] = useState(true);

  // Booking Flow State
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1); // 1: Select Date/Time, 2: Guests, 3: Checkout, 4: Success
  const [bookingDate, setBookingDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('09:00 AM');
  const [participants, setParticipants] = useState(1);
  const [guestInfo, setGuestInfo] = useState([{ name: '', age: '' }]);
  const [notes, setNotes] = useState('');

  const [bookingId, setBookingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  const TIME_SLOTS = ['08:00 AM', '10:30 AM', '02:00 PM', '04:30 PM'];

  useEffect(() => {
    if (id) {
      fetchTourDetails(id);
    }
  }, [id]);

  const fetchTourDetails = async (tourId: string) => {
    setLoading(true);
    try {
      // First check local enriched experiences
      const localMatch = MOCK_EXPERIENCES.find(m => m.id === tourId);
      if (localMatch) {
        setTour(localMatch);
        setLoading(false);
        return;
      }

      // Otherwise fetch from API
      const res = await getTour(tourId);
      if (res.data) {
        setTour({
          ...res.data,
          rating: 4.9,
          reviewCount: 68,
          locationName: 'India',
          highlights: ['Professional certified local guide', 'Authentic heritage immersion', 'Curated photo stops'],
          included: ['Licensed guide', 'Entry permits', 'Light refreshments']
        });
      } else {
        setTour(MOCK_EXPERIENCES[0]);
      }
    } catch (err) {
      console.error('Failed to fetch tour:', err);
      // Fallback to first mock experience if not found
      const fallback = MOCK_EXPERIENCES.find(m => m.id === tourId) || MOCK_EXPERIENCES[0];
      setTour(fallback);
    } finally {
      setLoading(false);
    }
  };

  const handleGuestChange = (index: number, field: string, value: string) => {
    const newGuestInfo = [...guestInfo];
    newGuestInfo[index] = { ...newGuestInfo[index], [field]: value };
    setGuestInfo(newGuestInfo);
  };

  const addGuest = () => {
    setParticipants(p => p + 1);
    setGuestInfo([...guestInfo, { name: '', age: '' }]);
  };

  const removeGuest = (index: number) => {
    if (participants > 1) {
      setParticipants(p => p - 1);
      setGuestInfo(guestInfo.filter((_, i) => i !== index));
    }
  };

  const handleAddToCart = () => {
    if (!tour) return;
    addItem({
      type: 'experience',
      title: tour.name,
      subtitle: `${tour.category} • ${tour.duration_hours} hrs • ${bookingDate ? new Date(bookingDate).toLocaleDateString() : 'Date TBD'}`,
      price: tour.price * participants,
      quantity: participants,
      details: {
        experienceId: tour.id,
        bookingDate,
        timeSlot,
        participants,
        location: tour.locationName,
        duration: tour.duration_hours,
        image_url: tour.image_url
      }
    });

    success(`"${tour.name}" added to Trip Cart!`);
    setIsCartOpen(true);
  };

  const handleCreateBooking = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!tour || !id) return;

    const invalidGuest = guestInfo.find(g => !g.name || !g.age);
    if (invalidGuest) {
      setError('Please provide full name and age for all guests.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const totalPrice = tour.price * participants;

      try {
        const res = await createGuideBooking({
          tour_id: id,
          booking_date: new Date(bookingDate || Date.now()).toISOString(),
          participants,
          total_price: totalPrice
        });
        setBookingId(res.guideBooking.id);
      } catch (apiErr) {
        // If demo/mock ID, generate simulated booking ID
        const demoBookingId = `exp_book_${Date.now().toString(36)}`;
        setBookingId(demoBookingId);
      }

      setStep(3); // Proceed to checkout
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to create booking.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setIsCopied(true);
    success('Experience link copied to clipboard!');
    setTimeout(() => setIsCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFBF7] text-[#2A2A2A]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C84B31] mb-4" />
        <p className="text-sm font-serif text-[#2A2A2A]/70">Loading extraordinary experience...</p>
      </div>
    );
  }

  if (!tour) {
    return (
      <div className="min-h-screen pt-24 text-center bg-[#FDFBF7] px-4">
        <h2 className="text-2xl font-serif font-bold text-[#2A2A2A]">Experience Not Found</h2>
        <p className="text-sm text-[#2A2A2A]/60 mt-2 mb-6">The requested activity could not be loaded.</p>
        <button
          onClick={() => navigate('/experiences')}
          className="bg-[#C84B31] text-white px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-[#A63A25] transition"
        >
          Back to Experiences
        </button>
      </div>
    );
  }

  const totalPrice = tour.price * participants;

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans flex flex-col text-[#2A2A2A] pb-24">

      {/* 1. TOP APP BAR */}
      <header className="sticky top-0 z-40 bg-[#FDFBF7]/90 backdrop-blur-md border-b border-black/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/experiences')}
              aria-label="Back to Experiences"
              className="group inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-white border border-black/10 text-[#2A2A2A] hover:bg-[#2A2A2A] hover:text-white transition-all shadow-xs font-medium text-sm cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              <span>Back to Experiences</span>
            </button>

            <Link to="/" className="hidden sm:flex items-center space-x-2 text-[#2A2A2A] hover:opacity-80 transition-opacity no-underline">
              <MapPin className="w-6 h-6 text-[#C84B31]" />
              <span className="font-display text-2xl text-black leading-none select-none">Yatra Setu</span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleShare}
              className="p-2.5 rounded-full bg-white border border-black/10 text-[#2A2A2A] hover:border-[#C84B31] transition-all shadow-xs cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
              title="Share Experience"
            >
              <Share2 className="w-4 h-4 text-[#C84B31]" />
              <span className="hidden md:inline">{isCopied ? 'Copied' : 'Share'}</span>
            </button>

            <button
              onClick={() => {
                if (user) {
                  navigate('/dashboard');
                } else {
                  navigate('/login', { state: { from: { pathname: '/dashboard' } } });
                }
              }}
              className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#2A2A2A]/70 hover:text-[#C84B31] transition-colors px-2 bg-transparent border-none cursor-pointer"
            >
              Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* 2. HERO SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Main Photo Gallery Banner */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative rounded-3xl overflow-hidden shadow-xl aspect-[16/10] bg-gray-100 border border-black/5">
              <img
                src={tour.image_url || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&auto=format&fit=crop'}
                alt={tour.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-bold text-[#C84B31] shadow-sm">
                {tour.category}
              </div>
              <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md text-white px-4 py-2 rounded-2xl text-sm font-bold flex items-center gap-1.5 shadow-sm">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span>{tour.rating || 4.9}</span>
                <span className="text-white/70 text-xs font-normal">({tour.reviewCount || 95} reviews)</span>
              </div>
            </div>

            {/* In-depth Experience Description */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-black/5 space-y-6">
              <div>
                <h3 className="font-serif text-2xl font-semibold text-[#2A2A2A] mb-3">About This Experience</h3>
                <p className="text-[#2A2A2A]/80 leading-relaxed text-sm sm:text-base">
                  {tour.description}
                </p>
              </div>

              {/* Highlights */}
              {tour.highlights && tour.highlights.length > 0 && (
                <div className="pt-4 border-t border-black/5">
                  <h4 className="font-serif text-lg font-semibold text-[#2A2A2A] mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#C84B31]" />
                    <span>Experience Highlights</span>
                  </h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {tour.highlights.map((h, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-[#2A2A2A]/80">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* What's Included & Meeting Point */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-black/5">
                {tour.included && (
                  <div>
                    <h5 className="font-semibold text-xs uppercase tracking-wider text-[#2A2A2A]/60 mb-2">
                      What's Included
                    </h5>
                    <ul className="space-y-1.5 text-xs text-[#2A2A2A]/80">
                      {tour.included.map((inc, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-[#C84B31]" />
                          <span>{inc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {tour.meetingPoint && (
                  <div>
                    <h5 className="font-semibold text-xs uppercase tracking-wider text-[#2A2A2A]/60 mb-2">
                      Meeting Point
                    </h5>
                    <p className="text-xs text-[#2A2A2A]/80 flex items-start gap-1.5">
                      <MapPin className="w-4 h-4 text-[#C84B31] flex-shrink-0 mt-0.5" />
                      <span>{tour.meetingPoint}</span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Booking & Cart Configuration Sidebar */}
          <div className="lg:col-span-5 space-y-6">

            {/* Title & Metadata Header */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-black/5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#C84B31] uppercase tracking-wider">
                  Verified Local Host
                </span>
                <span className="text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Free Cancellation (24h)
                </span>
              </div>

              <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-[#2A2A2A] leading-tight">
                {tour.name}
              </h1>

              <div className="flex items-center gap-2 text-xs text-[#2A2A2A]/70">
                <MapPin className="w-4 h-4 text-[#C84B31]" />
                <span>{tour.locationName || 'India'}</span>
              </div>

              {/* Key badges */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-2xl bg-[#FDFBF7] border border-black/5">
                  <span className="text-[11px] text-[#2A2A2A]/50 block uppercase font-bold">Duration</span>
                  <span className="text-sm font-semibold text-[#2A2A2A] flex items-center gap-1.5 mt-0.5">
                    <Clock className="w-4 h-4 text-[#C84B31]" />
                    {tour.duration_hours} {tour.duration_hours === 1 ? 'Hour' : 'Hours'}
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-[#FDFBF7] border border-black/5">
                  <span className="text-[11px] text-[#2A2A2A]/50 block uppercase font-bold">Price</span>
                  <span className="text-base font-bold text-[#C84B31] mt-0.5 block">
                    ₹{tour.price.toLocaleString('en-IN')} <span className="text-xs font-normal text-[#2A2A2A]/60">/ person</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Interactive Booking / Checkout Steps Container */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-black/5 shadow-sm space-y-6">

              {/* Stepper Header */}
              <div className="flex items-center justify-between border-b border-black/5 pb-4">
                {['Date & Time', 'Guest Info', 'Payment', 'Confirmed'].map((label, i) => (
                  <div key={label} className="flex flex-col items-center">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${step >= i + 1
                        ? 'bg-[#C84B31] text-white shadow-xs'
                        : 'bg-gray-100 text-gray-400'
                      }`}>
                      {i + 1}
                    </div>
                    <span className="text-[10px] mt-1 text-[#2A2A2A]/60 hidden sm:block font-medium">{label}</span>
                  </div>
                ))}
              </div>

              {error && (
                <div className="p-3 bg-red-50 text-red-700 rounded-xl border border-red-200 text-xs flex items-start gap-2">
                  <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* STEP 1: Select Date & Time & Guests */}
              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#2A2A2A]/70 mb-2">
                      Select Date
                    </label>
                    <div className="relative">
                      <CalendarIcon className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="date"
                        min={new Date().toISOString().split('T')[0]}
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        className="pl-10 pr-4 py-2.5 w-full border border-black/10 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#C84B31]/20 focus:border-[#C84B31] outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#2A2A2A]/70 mb-2">
                      Select Time Slot
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {TIME_SLOTS.map(slot => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setTimeSlot(slot)}
                          className={`py-2 px-3 rounded-xl border text-xs font-semibold transition cursor-pointer ${timeSlot === slot
                              ? 'border-[#C84B31] bg-orange-50 text-[#C84B31]'
                              : 'border-black/10 text-[#2A2A2A]/70 hover:border-black/30'
                            }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Summary & Buttons */}
                  <div className="pt-4 border-t border-black/5 space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-[#2A2A2A]/70 font-medium">Estimated Total</span>
                      <span className="font-serif text-xl font-bold text-[#C84B31]">
                        ₹{(tour.price * participants).toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={handleAddToCart}
                        className="py-3 px-4 rounded-xl border border-[#C84B31]/40 text-[#C84B31] hover:bg-orange-50 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        <span>Add to Cart</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (!bookingDate) {
                            setError('Please choose a preferred booking date.');
                          } else {
                            setError('');
                            setStep(2);
                          }
                        }}
                        className="bg-[#C84B31] hover:bg-[#A63A25] text-white py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-sm cursor-pointer"
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Guest Details */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-serif text-lg font-semibold text-[#2A2A2A]">Guest Information</h3>
                    <button
                      type="button"
                      onClick={addGuest}
                      className="text-xs font-bold text-[#C84B31] hover:underline cursor-pointer"
                    >
                      + Add Another Guest
                    </button>
                  </div>

                  {guestInfo.map((guest, index) => (
                    <div key={index} className="p-3.5 border border-black/5 rounded-2xl bg-[#FDFBF7] space-y-2 relative">
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => removeGuest(index)}
                          className="absolute top-3 right-3 text-red-500 text-xs font-bold hover:underline"
                        >
                          Remove
                        </button>
                      )}
                      <span className="text-[11px] font-bold uppercase text-[#2A2A2A]/50 block">
                        Guest #{index + 1}
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={guest.name}
                          onChange={(e) => handleGuestChange(index, 'name', e.target.value)}
                          className="w-full px-3 py-2 border border-black/10 rounded-xl text-xs outline-none focus:border-[#C84B31]"
                          placeholder="Full Name"
                        />
                        <input
                          type="number"
                          min="1"
                          max="120"
                          value={guest.age}
                          onChange={(e) => handleGuestChange(index, 'age', e.target.value)}
                          className="w-full px-3 py-2 border border-black/10 rounded-xl text-xs outline-none focus:border-[#C84B31]"
                          placeholder="Age"
                        />
                      </div>
                    </div>
                  ))}

                  <div>
                    <label className="block text-xs font-bold text-[#2A2A2A]/70 mb-1">
                      Special Dietary / Accessibility Notes (Optional)
                    </label>
                    <textarea
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full px-3 py-2 border border-black/10 rounded-xl text-xs outline-none focus:border-[#C84B31]"
                      placeholder="Any preferences or dietary requirements?"
                    />
                  </div>

                  <div className="p-3 bg-orange-50 rounded-2xl border border-orange-100 flex justify-between items-center text-xs">
                    <span className="text-[#2A2A2A]/70">Total for {participants} {participants === 1 ? 'Guest' : 'Guests'}</span>
                    <span className="font-serif text-base font-bold text-[#C84B31]">₹{totalPrice.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="flex justify-between gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="px-4 py-2.5 border border-black/10 text-xs font-bold rounded-xl hover:bg-gray-50 transition cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleCreateBooking}
                      disabled={submitting}
                      className="flex-1 bg-[#C84B31] hover:bg-[#A63A25] text-white py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-sm disabled:opacity-50 cursor-pointer"
                    >
                      {submitting ? 'Confirming...' : 'Proceed to Payment'}
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: Payment Checkout */}
              {step === 3 && bookingId && (
                <div className="space-y-4">
                  <div className="text-center space-y-1">
                    <h3 className="font-serif text-xl font-semibold text-[#2A2A2A]">Complete Payment</h3>
                    <p className="text-xs text-[#2A2A2A]/70">
                      Amount due: <strong className="text-[#C84B31]">₹{totalPrice.toLocaleString('en-IN')}</strong> for {tour.name}.
                    </p>
                  </div>

                  <Checkout
                    bookingId={bookingId}
                    bookingType="tour"
                    onSuccess={() => setStep(4)}
                    onCancel={() => { }}
                  />

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(4)}
                      className="text-xs text-[#C84B31] font-semibold hover:underline"
                    >
                      (Demo Mode: Click here to simulate instant confirmation)
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: Confirmed Voucher */}
              {step === 4 && (
                <div className="text-center space-y-4 py-4">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h3 className="font-serif text-2xl font-semibold text-[#2A2A2A]">Booking Confirmed!</h3>
                  <p className="text-xs text-[#2A2A2A]/70 max-w-xs mx-auto">
                    Your experience with <strong>{tour.name}</strong> on {bookingDate || 'Scheduled Date'} at {timeSlot} has been reserved.
                  </p>

                  <div className="p-4 bg-[#FDFBF7] rounded-2xl border border-black/5 text-left text-xs space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Booking Reference:</span>
                      <span className="font-mono font-bold">{(bookingId || 'SETU-EXP-99').slice(0, 10).toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Guests:</span>
                      <span className="font-bold">{participants}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Total Paid:</span>
                      <span className="font-bold text-emerald-700">₹{totalPrice.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => generateAndDownloadReceipt({
                        receiptNumber: `YS-REC-${Date.now().toString().slice(-4)}`,
                        bookingReference: bookingId ? `YS-EXP-${bookingId.slice(-6)}` : `YS-EXP-${Date.now().toString().slice(-6)}`,
                        bookingType: 'Tour Experience',
                        title: tour.name,
                        destination: (tour as any).location || 'India',
                        travelDate: bookingDate || new Date().toISOString().split('T')[0],
                        customerName: user?.name || 'Valued Explorer',
                        customerEmail: user?.email || 'explorer@yatrasetu.com',
                        seats: [`${participants} Participant(s)`],
                        totalAmount: totalPrice,
                        paymentMethod: 'Verified 3D Secure Demo Card',
                        taxAmount: Math.round(totalPrice * 0.05)
                      })}
                      className="w-full bg-stone-900 hover:bg-black text-white py-2.5 px-4 rounded-xl text-xs font-bold transition shadow-md flex items-center justify-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5 text-amber-400" />
                      <span>Download Experience Tax Invoice</span>
                    </button>
                    <div className="flex justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => navigate('/experiences')}
                        className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-[#2A2A2A] rounded-xl text-xs font-bold transition"
                      >
                        Explore More
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate('/dashboard/bookings')}
                        className="flex-1 py-2 bg-[#C84B31] hover:bg-[#A63A25] text-white rounded-xl text-xs font-bold transition"
                      >
                        View Bookings
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>

          </div>

        </div>
      </section>

    </div>
  );
};
