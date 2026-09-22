import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import api from '../lib/axios';
import { getDestinations } from '../api/destinations';
import { getTours } from '../api/tours';
import { getUnifiedBookings } from '../api/bookings';
import type { Destination } from '../api/destinations';
import type { Tour } from '../api/tours';
import {
  Plane, Building2, Bus, Car, Compass, Sparkles,
  Calendar, MapPin, ArrowRight, ShieldCheck,
  Zap, CreditCard, Headphones, Star, Clock, Users,
  Tag, Check, Copy
} from 'lucide-react';
import { LoadingState } from '../components/states/LoadingState';
import { ErrorState } from '../components/states/ErrorState';
import { ChatWidget } from '../components/chat/ChatWidget';
import { SearchBox } from '../components/SearchBox';
import { PopularDestinationsCarousel } from '../components/sections/PopularDestinationsCarousel';
import { Galaxy } from '../components/ui/Galaxy';

export const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [tours, setTours] = useState<Tour[]>([]);
  const [unifiedBookings, setUnifiedBookings] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [dataError, setDataError] = useState<unknown>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // AI Prompt sample state
  const [aiPrompt, setAiPrompt] = useState("A 5-day cultural and culinary trip with scenic hikes and historic temples...");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        const safeFetch = <T,>(promise: Promise<T>, fallback: T) =>
          promise.catch(err => {
            console.error('Dashboard data fetch error:', err);
            return fallback;
          });

        const [destinationsRes, toursRes, unifiedRes] = await Promise.all([
          safeFetch(getDestinations({ limit: 50 }), { data: [] } as any),
          safeFetch(getTours({ limit: 8 }), { data: [] } as any),
          safeFetch(getUnifiedBookings(), { bookings: [] } as any)
        ]);

        const stored = localStorage.getItem('yatra_setu_local_bookings');
        const localBookings = stored ? JSON.parse(stored) : [];
        const apiBookings = unifiedRes?.bookings || [];
        const existingIds = new Set(localBookings.map((b: any) => b.id));
        const filteredApi = apiBookings.filter((b: any) => !existingIds.has(b.id));

        setDestinations(destinationsRes.data || []);
        setTours(toursRes.data || []);
        setUnifiedBookings([...localBookings, ...filteredApi]);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
        setDataError(error);
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();

    const handleBookingUpdate = () => {
      fetchData();
    };
    window.addEventListener('bookings_updated', handleBookingUpdate);
    return () => {
      window.removeEventListener('bookings_updated', handleBookingUpdate);
    };
  }, [user]);

  // Find the most relevant upcoming trip
  const upcomingTrip = unifiedBookings.find(b =>
    b.status === 'confirmed' || b.status === 'pending'
  ) || unifiedBookings[0];

  if (authLoading || loadingData) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingState message="Preparing your travel portal..." />
      </div>
    );
  }

  if (dataError) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <ErrorState error={dataError} onRetry={() => window.location.reload()} />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="space-y-16 pb-20">

      {/* 1. OTA-STYLE HERO SECTION WITH INTERACTIVE GALAXY */}
      <section className="relative bg-[#050508] text-white pt-12 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden rounded-b-[40px] shadow-2xl">
        {/* Interactive Galaxy Background from React Bits */}
        <div className="absolute inset-0 z-0 pointer-events-auto">
          <Galaxy 
            mouseRepulsion={true}
            mouseInteraction={true}
            density={1.3}
            glowIntensity={0.6}
            saturation={0.8}
            hueShift={240}
            starSpeed={0.5}
            speed={1.0}
            twinkleIntensity={0.4}
            transparent={false}
          />
        </div>

        {/* Subtle gradient overlay to provide text readability and depth */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/50 via-black/20 to-black/70 z-[1]" />

        <div className="max-w-6xl mx-auto relative z-10 text-center pointer-events-auto">
          {/* Welcome Tag */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-semibold uppercase tracking-wider text-orange-200 mb-6">
            <Sparkles className="w-3.5 h-3.5 text-orange-400" />
            <span>Welcome back, {user.name?.split(' ')[0] || 'Explorer'}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-medium tracking-tight max-w-4xl mx-auto mb-4 leading-tight">
            Where Will Your Journey Take You Today?
          </h1>
          <p className="text-white/80 text-base sm:text-lg max-w-2xl mx-auto mb-10 font-normal">
            Search flights, handpicked stays, buses, cabs, and curated activities across India and beyond.
          </p>

          {/* Unified Dynamic Booking Engine Card */}
          <SearchBox className="max-w-5xl mx-auto" />
        </div>
      </section>

      {/* MAIN CONTENT WRAPPER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">

        {/* 2. SECTION: POPULAR DESTINATIONS (100+ Horizontal Scroll Carousel) */}
        <PopularDestinationsCarousel apiDestinations={destinations} />

        {/* 2b. SECTION: TODAY'S TRAVEL DEALS & SPECIAL OFFERS (Chunk 33) */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-[#C84B31] text-xs font-bold uppercase tracking-wider mb-1">
                <Tag className="w-3.5 h-3.5" />
                <span>Limited Time Offers</span>
              </div>
              <h2 className="text-3xl font-serif text-[#2A2A2A] tracking-tight">Today’s Travel Deals</h2>
              <p className="text-sm text-[#2A2A2A]/60 mt-1">Exclusive promo codes for flights, luxury stays, and curated adventures.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Deal 1: Flights */}
            <div className="bg-gradient-to-br from-sky-500/10 via-white to-white rounded-3xl p-6 border border-sky-100 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 space-y-4 flex flex-col justify-between group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center font-bold shadow-xs">
                    <Plane className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-sky-700 bg-sky-100 px-2.5 py-0.5 rounded-full">
                    Domestic Flights
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#2A2A2A] group-hover:text-sky-700 transition-colors">
                    Monsoon Airfare Bonanza
                  </h3>
                  <p className="text-xs text-[#2A2A2A]/70 mt-1 leading-relaxed">
                    Flat ₹1,500 off on Indigo, Air India & Vistara for travel to Goa, Manali, and Srinagar.
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-black/5 space-y-3">
                <div className="flex items-center justify-between bg-white p-2.5 rounded-2xl border border-black/5">
                  <span className="font-mono text-xs font-bold text-sky-700">FLYSETU</span>
                  <button
                    onClick={() => handleCopyCode('FLYSETU')}
                    className="text-xs font-semibold text-gray-500 hover:text-black flex items-center gap-1 cursor-pointer"
                  >
                    {copiedCode === 'FLYSETU' ? (
                      <span className="text-emerald-600 flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Copied</span>
                    ) : (
                      <span className="flex items-center gap-1"><Copy className="w-3.5 h-3.5" /> Copy Code</span>
                    )}
                  </button>
                </div>

                <Link
                  to="/dashboard/flights?discount=FLYSETU"
                  className="w-full bg-sky-600 hover:bg-sky-700 text-white py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
                >
                  <span>Explore Flights</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Deal 2: Hotels */}
            <div className="bg-gradient-to-br from-amber-500/10 via-white to-white rounded-3xl p-6 border border-amber-100 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 space-y-4 flex flex-col justify-between group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold shadow-xs">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full">
                    Resorts & Stays
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#2A2A2A] group-hover:text-amber-700 transition-colors">
                    Luxury Heritage Escapes
                  </h3>
                  <p className="text-xs text-[#2A2A2A]/70 mt-1 leading-relaxed">
                    Up to 25% discount + complimentary buffet breakfast at verified 4★ and 5★ villas.
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-black/5 space-y-3">
                <div className="flex items-center justify-between bg-white p-2.5 rounded-2xl border border-black/5">
                  <span className="font-mono text-xs font-bold text-amber-700">STAYLUXE</span>
                  <button
                    onClick={() => handleCopyCode('STAYLUXE')}
                    className="text-xs font-semibold text-gray-500 hover:text-black flex items-center gap-1 cursor-pointer"
                  >
                    {copiedCode === 'STAYLUXE' ? (
                      <span className="text-emerald-600 flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Copied</span>
                    ) : (
                      <span className="flex items-center gap-1"><Copy className="w-3.5 h-3.5" /> Copy Code</span>
                    )}
                  </button>
                </div>

                <Link
                  to="/dashboard/hotels?discount=STAYLUXE"
                  className="w-full bg-[#C84B31] hover:bg-[#A63A25] text-white py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
                >
                  <span>Explore Hotels</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Deal 3: Experiences */}
            <div className="bg-gradient-to-br from-purple-500/10 via-white to-white rounded-3xl p-6 border border-purple-100 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 space-y-4 flex flex-col justify-between group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold shadow-xs">
                    <Compass className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700 bg-purple-100 px-2.5 py-0.5 rounded-full">
                    Adventures & Tours
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#2A2A2A] group-hover:text-purple-700 transition-colors">
                    Weekend Adventure Pass
                  </h3>
                  <p className="text-xs text-[#2A2A2A]/70 mt-1 leading-relaxed">
                    Buy 1 Get 1 Free on river rafting, guided heritage trails, and sunset boat safaris.
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-black/5 space-y-3">
                <div className="flex items-center justify-between bg-white p-2.5 rounded-2xl border border-black/5">
                  <span className="font-mono text-xs font-bold text-purple-700">ADVENTURE15</span>
                  <button
                    onClick={() => handleCopyCode('ADVENTURE15')}
                    className="text-xs font-semibold text-gray-500 hover:text-black flex items-center gap-1 cursor-pointer"
                  >
                    {copiedCode === 'ADVENTURE15' ? (
                      <span className="text-emerald-600 flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Copied</span>
                    ) : (
                      <span className="flex items-center gap-1"><Copy className="w-3.5 h-3.5" /> Copy Code</span>
                    )}
                  </button>
                </div>

                <Link
                  to="/experiences?discount=ADVENTURE15"
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
                >
                  <span>Explore Experiences</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

          </div>
        </section>

        {/* 3. SECTION: AI TRIP PLANNER PROMO */}
        <section className="relative bg-gradient-to-br from-[#2A2A2A] via-[#352F2D] to-[#1F1C1B] rounded-3xl p-8 sm:p-12 text-white overflow-hidden shadow-xl border border-white/5">
          <div className="absolute -right-16 -top-16 w-80 h-80 bg-[#C84B31]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute left-10 bottom-0 w-64 h-64 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#C84B31] to-amber-600 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-md">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Next-Gen AI Travel Engine</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-serif font-medium leading-tight">
                Craft a Bespoke Itinerary in Under 30 Seconds
              </h2>
              <p className="text-white/75 text-sm sm:text-base leading-relaxed max-w-xl">
                Tell our intelligent travel assistant where you want to go, your travel dates, vibe, and budget. We'll automatically curate day-by-day activities, routes, and verified stays.
              </p>

              {/* Preset suggestion chips */}
              <div className="flex flex-wrap gap-2 pt-2">
                {[
                  '5 Days in Kerala Backwaters',
                  'Weekend Heritage in Varanasi',
                  'Adventure & Camping in Himachal',
                  '7-Day Tokyo Food & Hidden Cafes'
                ].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setAiPrompt(preset)}
                    className="bg-white/10 hover:bg-white/20 border border-white/10 px-3 py-1.5 rounded-full text-xs text-white/90 font-medium transition-colors cursor-pointer"
                  >
                    ✨ {preset}
                  </button>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="bg-white/10 backdrop-blur-xl border border-white/15 rounded-2xl p-5 shadow-2xl space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-orange-200">
                    Describe your dream trip:
                  </label>
                  <textarea
                    rows={3}
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    className="w-full bg-black/30 border border-white/20 rounded-xl p-3 text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#C84B31] resize-none"
                    placeholder="e.g. Planning a 4-day romantic getaway to Udaipur with lake views, private dinner, and cultural palaces..."
                  />
                </div>

                <Link
                  to="/itineraries/generate"
                  className="w-full bg-gradient-to-r from-[#C84B31] to-[#E06D53] hover:from-[#B03E26] hover:to-[#C84B31] text-white py-3 px-6 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#C84B31]/30 transition-all cursor-pointer no-underline text-sm"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Generate AI Itinerary</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 4. SECTION: UPCOMING TRIP SPOTLIGHT */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 text-[#C84B31] text-xs font-bold uppercase tracking-wider mb-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>Your Travel Dashboard</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif text-[#2A2A2A]">Upcoming Trip</h2>
            </div>
            <Link
              to="/dashboard/bookings"
              className="text-sm font-bold text-[#C84B31] hover:text-[#A63A25] transition-colors flex items-center gap-1"
            >
              <span>View all bookings</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {upcomingTrip ? (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-black/5 shadow-md hover:shadow-lg transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-start sm:items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-[#C84B31]/10 text-[#C84B31] flex items-center justify-center shrink-0">
                  {upcomingTrip.type === 'flight' && <Plane className="w-8 h-8" />}
                  {upcomingTrip.type === 'bus' && <Bus className="w-8 h-8" />}
                  {upcomingTrip.type === 'auto' && <Car className="w-8 h-8" />}
                  {upcomingTrip.type === 'experience' && <Compass className="w-8 h-8" />}
                  {upcomingTrip.type === 'hotel' && <Building2 className="w-8 h-8" />}
                  {!['flight', 'bus', 'auto', 'experience', 'hotel'].includes(upcomingTrip.type) && <Calendar className="w-8 h-8" />}
                </div>

                <div>
                  <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                      {upcomingTrip.status || 'Confirmed'}
                    </span>
                    <span className="bg-gray-100 text-gray-700 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                      {upcomingTrip.type || 'Booking'}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-[#2A2A2A] mb-1">
                    {upcomingTrip.title || 'Upcoming Travel Reservation'}
                  </h3>
                  <p className="text-sm text-[#2A2A2A]/60 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>{new Date(upcomingTrip.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    {upcomingTrip.subtitle && <span>• {upcomingTrip.subtitle}</span>}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0 border-black/5">
                {upcomingTrip.amount && (
                  <div className="text-right">
                    <p className="text-xs text-[#2A2A2A]/50 font-medium">Total Paid</p>
                    <p className="text-lg font-bold text-[#2A2A2A]">₹{upcomingTrip.amount}</p>
                  </div>
                )}

                <Link
                  to="/dashboard/bookings"
                  className="bg-[#2A2A2A] hover:bg-black text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm"
                >
                  <span>Manage Trip</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-8 border border-black/5 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-orange-50 text-[#C84B31] flex items-center justify-center mx-auto">
                <Compass className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#2A2A2A]">No upcoming trips scheduled</h3>
                <p className="text-sm text-[#2A2A2A]/60 max-w-md mx-auto mt-1">
                  Ready to explore? Book a stay, flight, or guided experience to see your active journey details right here.
                </p>
              </div>
              <button
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="bg-[#C84B31] text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-[#A63A25] transition-colors inline-flex items-center gap-2 cursor-pointer shadow-md"
              >
                <span>Find Your Next Escape</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </section>

        {/* 5. SECTION: EXPERIENCES NEAR YOU */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <div className="flex items-center gap-2 text-[#C84B31] text-xs font-bold uppercase tracking-wider mb-1">
                <Compass className="w-3.5 h-3.5" />
                <span>Activities & Tours</span>
              </div>
              <h2 className="text-3xl font-serif text-[#2A2A2A] tracking-tight">Experiences Near You</h2>
              <p className="text-sm text-[#2A2A2A]/60 mt-1">Immerse yourself with guided adventures, heritage walks, and workshops.</p>
            </div>
            <Link
              to="/experiences"
              className="inline-flex items-center gap-1 text-sm font-bold text-[#C84B31] hover:text-[#A63A25] transition-colors"
            >
              <span>View all experiences</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {tours.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center border border-black/5">
              <p className="text-[#2A2A2A]/60">Experiences are updating...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {tours.map((tour) => (
                <div
                  key={tour.id}
                  className="bg-white rounded-3xl overflow-hidden border border-black/5 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                    <img
                      src={tour.image_url || 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&auto=format&fit=crop'}
                      alt={tour.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[11px] font-bold text-[#2A2A2A] uppercase tracking-wider">
                      {tour.category || 'Tour'}
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-xs text-[#2A2A2A]/60 mb-2">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {tour.duration_hours || 3} Hours
                        </span>
                        <span className="flex items-center gap-1 text-amber-600 font-bold">
                          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                          4.9 (120+)
                        </span>
                      </div>

                      <h3 className="font-bold text-[#2A2A2A] text-base mb-1.5 line-clamp-1 group-hover:text-[#C84B31] transition-colors">
                        {tour.name}
                      </h3>
                      <p className="text-xs text-[#2A2A2A]/60 line-clamp-2 mb-4">
                        {tour.description || 'Enjoy a guided tour with local storytellers, certified guides, and scenic moments.'}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-black/5">
                      <div>
                        <span className="text-[10px] text-[#2A2A2A]/50 block uppercase font-semibold">From</span>
                        <span className="text-lg font-bold text-[#C84B31]">₹{tour.price}</span>
                      </div>

                      <Link
                        to={`/experiences/${tour.id}`}
                        className="bg-[#FDFBF7] hover:bg-[#C84B31] text-[#2A2A2A] hover:text-white border border-black/10 hover:border-[#C84B31] px-4 py-2 rounded-xl text-xs font-bold transition-all"
                      >
                        Book Now
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 6. SECTION: VALUE-PROP STRIP */}
        <section className="bg-white rounded-3xl p-8 sm:p-10 border border-black/5 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#C84B31]/10 text-[#C84B31] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-[#2A2A2A] text-base mb-1">Verified & Certified</h4>
                <p className="text-xs text-[#2A2A2A]/60 leading-relaxed">
                  100% vetted hotel properties, certified drivers, and authentic licensed experience partners.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-[#2A2A2A] text-base mb-1">Instant Confirmations</h4>
                <p className="text-xs text-[#2A2A2A]/60 leading-relaxed">
                  Direct digital vouchers, live seat allocation, and instant confirmation receipts.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-[#2A2A2A] text-base mb-1">Razorpay & UPI Safety</h4>
                <p className="text-xs text-[#2A2A2A]/60 leading-relaxed">
                  Universal payments backed by Razorpay encryption with transparent invoices and fast refunds.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Headphones className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-[#2A2A2A] text-base mb-1">24/7 Yatra Support</h4>
                <p className="text-xs text-[#2A2A2A]/60 leading-relaxed">
                  Real-time AI concierge assistance and dedicated human support whenever you need help on your journey.
                </p>
              </div>
            </div>

          </div>
        </section>

      </div>

      {/* Floating AI Chat Assistant */}
      <ChatWidget />
    </div>
  );
};
