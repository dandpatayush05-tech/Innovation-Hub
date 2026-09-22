import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { generateItinerary } from '../api/itineraries';
import type { Itinerary, ItineraryDay } from '../api/itineraries';
import { useTripCart } from '../context/TripCartContext';
import { useToast } from '../context/ToastContext';
import {
  Sparkles, MapPin, DollarSign, ChevronDown, ChevronUp,
  Clock, Lightbulb, ArrowRight, ArrowLeft, RotateCcw, Loader2,
  AlertTriangle, Calendar, Users, Compass, Building2,
  Plane, Utensils, ShoppingBag, ShieldAlert, CheckCircle2,
  TrendingDown, Star
} from 'lucide-react';

const TRAVEL_STYLES = [
  { id: 'cultural', name: '🏛️ Cultural & Heritage', desc: 'Museums, monuments, history & local customs' },
  { id: 'relaxed', name: '🏖️ Relaxed Leisure & Beach', desc: 'Slow travel, beaches, scenic views & spas' },
  { id: 'adventure', name: '🏔️ High Adventure & Trekking', desc: 'Hikes, watersports, thrill & outdoors' },
  { id: 'luxury', name: '✨ Luxury & Wellness', desc: '5-star resorts, private transfers & fine dining' },
  { id: 'budget', name: '🎒 Budget Backpacker', desc: 'Hostels, public transit, street food & free attractions' },
  { id: 'foodie', name: '🍜 Foodie & Culinary Trail', desc: 'Hidden street food gems, cooking classes & top bistros' },
  { id: 'family', name: '👨‍👩‍👧 Family Friendly', desc: 'Kid-friendly parks, safe transport & relaxed pacing' },
];

const PRESET_IDEAS = [
  { destination: 'Paris, France', style: 'luxury', days: 4, budget: '₹1,80,000', prompt: 'Romantic Parisian getaway with Eiffel Tower sunset, Louvre museum tour, Seine river dinner cruise, and boutique bakery stops.' },
  { destination: 'Tokyo & Kyoto, Japan', style: 'cultural', days: 7, budget: '₹2,20,000', prompt: 'Traditional temples, Shibuya crossing, Akihabara tech district, tea ceremony, bullet train, and authentic ramen stalls.' },
  { destination: 'Goa, India', style: 'relaxed', days: 4, budget: '₹35,000', prompt: 'Beachfront resorts in South Goa, scuba diving in Grande Island, Portuguese heritage villas in Fontainhas, and beach shacks.' },
  { destination: 'Himachal Pradesh, India', style: 'adventure', days: 5, budget: '₹40,000', prompt: 'Scenic mountain trek in Manali, Solang Valley paragliding, river rafting in Beas, and cozy cafe trails in Old Manali.' },
];

export const ItineraryGenerator: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addItems, setIsCartOpen } = useTripCart();
  const { success } = useToast();

  // Form State
  const initialDestination = searchParams.get('destination') || '';
  const [destination, setDestination] = useState(initialDestination);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0]);
  const [budget, setBudget] = useState('50000');
  const [travellers, setTravellers] = useState(2);
  const [travelStyle, setTravelStyle] = useState('cultural');
  const [customPreferences, setCustomPreferences] = useState('');

  // Execution State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [openDay, setOpenDay] = useState<number | null>(0);

  const calculateDays = () => {
    try {
      const diff = new Date(endDate).getTime() - new Date(startDate).getTime();
      const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
      return days > 0 ? days : 3;
    } catch {
      return 3;
    }
  };

  const handleGenerate = async () => {
    if (!destination.trim()) {
      setError('Please specify a destination.');
      return;
    }

    setLoading(true);
    setError('');

    const daysCount = calculateDays();
    const styleObj = TRAVEL_STYLES.find(s => s.id === travelStyle);

    const structuredPrompt = `Plan a ${daysCount}-day ${styleObj?.name || 'custom'} trip to ${destination.trim()} starting from ${startDate} for ${travellers} travellers with an estimated total budget of ₹${budget}. Travel style: ${styleObj?.desc || ''}. Specific preferences: ${customPreferences.trim() || 'Include top attractions, local dining, and recommended accommodation.'}`;

    try {
      const result = await generateItinerary(structuredPrompt);
      setItinerary(result.itinerary);
      setOpenDay(0);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to generate itinerary. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyPreset = (preset: typeof PRESET_IDEAS[0]) => {
    setDestination(preset.destination);
    setTravelStyle(preset.style);
    setBudget(preset.budget.replace(/[^0-9]/g, ''));
    setCustomPreferences(preset.prompt);
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/dashboard');
    }
  };

  const handleReset = () => {
    setItinerary(null);
    setError('');
    setOpenDay(0);
  };

  const toggleDay = (index: number) => {
    setOpenDay(prev => (prev === index ? null : index));
  };

  // Push all itinerary items to Trip Cart
  const handleBookEntireTrip = () => {
    if (!itinerary || !itinerary.days) return;

    const cartItems: any[] = [];
    const avgPerItemPrice = Math.max(1200, Math.round(Number(budget) / (itinerary.days.length * 3)));

    // Add Base Accommodation
    cartItems.push({
      type: 'hotel',
      title: `Stay in ${itinerary.destination} (${itinerary.days.length} Nights)`,
      subtitle: `Curated partner stay matching ${travelStyle} style`,
      price: Math.max(3500, Math.round(Number(budget) * 0.35)),
      date: startDate,
      quantity: 1,
      details: { destination: itinerary.destination, nights: itinerary.days.length }
    });

    // Add Activities per Day
    itinerary.days.forEach((day: ItineraryDay) => {
      day.activities.forEach((act) => {
        cartItems.push({
          type: 'experience',
          title: act.title,
          subtitle: `Day ${day.day} • ${act.time || 'Activity'}`,
          price: avgPerItemPrice,
          dayNumber: day.day,
          quantity: travellers,
          details: { description: act.description }
        });
      });
    });

    addItems(cartItems);
    success(`Added all ${cartItems.length} trip items to your All-in-One Cart!`);
    setIsCartOpen(true);
  };

  // Activity Icon Resolver
  const getActivityIcon = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes('flight') || t.includes('airport') || t.includes('fly')) return <Plane className="w-4 h-4 text-[#C84B31]" />;
    if (t.includes('hotel') || t.includes('check-in') || t.includes('resort') || t.includes('stay')) return <Building2 className="w-4 h-4 text-blue-500" />;
    if (t.includes('dinner') || t.includes('lunch') || t.includes('breakfast') || t.includes('cafe') || t.includes('food')) return <Utensils className="w-4 h-4 text-amber-500" />;
    if (t.includes('trek') || t.includes('hike') || t.includes('safari') || t.includes('scuba')) return <Compass className="w-4 h-4 text-emerald-500" />;
    return <Sparkles className="w-4 h-4 text-purple-500" />;
  };

  // ── STATE 2: RENDER GENERATED ITINERARY ──────────────────────────────────
  if (itinerary) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] text-[#2A2A2A] pb-24">

        {/* Destination Header Banner */}
        <section className="bg-gradient-to-br from-[#1F1F1F] via-[#2A2A2A] to-[#191919] text-white pt-8 pb-16 px-4 sm:px-6 lg:px-8 shadow-xl">
          <div className="max-w-6xl mx-auto space-y-6">

            {/* Top Navigation Bar with Back Button */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-2">
              <button
                onClick={handleBack}
                aria-label="Go Back"
                className="group inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white transition-all backdrop-blur-md text-xs sm:text-sm font-semibold cursor-pointer shadow-sm"
              >
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                <span>Back</span>
              </button>

              <Link to="/" className="flex items-center space-x-2 text-white/90 hover:text-white transition-opacity no-underline">
                <MapPin className="w-5 h-5 text-[#C84B31]" />
                <span className="font-display text-xl text-white select-none">Yatra Setu</span>
              </Link>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-orange-300 bg-white/10 px-3.5 py-1 rounded-full border border-white/10">
                <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                <span>AI-Crafted Itinerary</span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleReset}
                  className="bg-white/10 hover:bg-white/20 border border-white/10 text-white text-xs font-bold px-4 py-2 rounded-full transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Plan Another</span>
                </button>
                <button
                  onClick={handleBookEntireTrip}
                  className="bg-[#C84B31] hover:bg-[#A63A25] text-white text-xs font-bold px-5 py-2 rounded-full transition-all shadow-lg shadow-[#C84B31]/30 flex items-center gap-1.5 cursor-pointer"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Book Entire Trip</span>
                </button>
              </div>
            </div>

            <div>
              <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white mb-3">
                {itinerary.destination}
              </h1>
              <div className="flex flex-wrap items-center gap-6 text-white/80 text-sm">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-[#C84B31]" />
                  <span>{itinerary.days?.length || calculateDays()} Days Planned</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  <span>Target Budget: <strong>{itinerary.estimated_budget || `₹${budget}`}</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-blue-400" />
                  <span>{travellers} Traveller{travellers > 1 ? 's' : ''}</span>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Content Body */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-10">

          {/* AI Travel Recommendations & Smart Budget Insights */}
          {itinerary.ai_recommendations && itinerary.ai_recommendations.length > 0 && (
            <section className="bg-amber-50 border border-amber-200/80 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center gap-2 text-amber-800 font-bold text-sm mb-3">
                <Lightbulb className="w-4 h-4 text-amber-600" />
                <span>AI Travel Insights & Expert Recommendations</span>
              </div>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs sm:text-sm text-amber-950">
                {itinerary.ai_recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-white/70 p-3 rounded-2xl border border-amber-200/50">
                    <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{rec}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Day-by-Day Cards with Budget Guardrails */}
          <section className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-black/5">
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#2A2A2A] flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#C84B31]" />
                <span>Day-by-Day Journey Breakdown</span>
              </h2>
              <span className="text-xs text-[#2A2A2A]/60 font-semibold">
                Click a day to view hourly stops
              </span>
            </div>

            <div className="space-y-4">
              {itinerary.days?.map((day: ItineraryDay, index: number) => {
                const isThreatDay = day.activities && day.activities.length >= 4;

                return (
                  <div
                    key={day.day}
                    className="bg-white border border-black/5 rounded-3xl overflow-hidden shadow-sm transition-all hover:border-black/15"
                  >
                    {/* Accordion Header */}
                    <button
                      onClick={() => toggleDay(index)}
                      className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50/80 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-[#C84B31]/10 text-[#C84B31] font-bold flex items-center justify-center text-sm">
                          D{day.day}
                        </div>
                        <div>
                          <h3 className="font-serif font-bold text-base sm:text-lg text-[#2A2A2A]">
                            {day.title || `Day ${day.day} Exploration`}
                          </h3>
                          <p className="text-xs text-[#2A2A2A]/60 mt-0.5">
                            {day.activities?.length || 0} scheduled activities • {day.activities?.[0]?.time ? `Starts around ${day.activities[0].time}` : 'Full Day'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {isThreatDay && (
                          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-orange-700 bg-orange-100/70 px-2.5 py-1 rounded-full">
                            <ShieldAlert className="w-3 h-3" />
                            <span>Action-Packed Day</span>
                          </span>
                        )}
                        {openDay === index ? (
                          <ChevronUp className="w-5 h-5 text-[#2A2A2A]/40" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-[#2A2A2A]/40" />
                        )}
                      </div>
                    </button>

                    {/* Accordion Content */}
                    {openDay === index && (
                      <div className="px-6 pb-6 pt-2 border-t border-black/5 space-y-6 bg-[#FDFBF7]/30">

                        {/* Tourism-Specific Budget Warning & Alternative Flag */}
                        {isThreatDay && (
                          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex items-start gap-3">
                            <ShieldAlert className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                            <div className="space-y-1">
                              <p className="text-xs font-bold text-orange-900">
                                Smart Budget Guardrail Active
                              </p>
                              <p className="text-xs text-orange-800 leading-relaxed">
                                Projected activities on Day {day.day} account for a high portion of your daily allocation. We recommend booking local certified group excursions to save up to <strong>₹2,400</strong> while keeping resort reserve funds intact.
                              </p>
                              <div className="flex items-center gap-2 pt-1 text-[11px] text-emerald-700 font-semibold">
                                <TrendingDown className="w-3.5 h-3.5" />
                                <span>Alternative: Guided Heritage Shuttle Tour (Save ₹1,800)</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Activities List */}
                        <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-black/10">
                          {day.activities.map((act, actIdx) => (
                            <div key={actIdx} className="relative group">
                              {/* Dot */}
                              <div className="absolute -left-[27px] top-1 w-3.5 h-3.5 rounded-full bg-white border-2 border-[#C84B31] shadow-sm" />

                              <div className="bg-white border border-black/5 rounded-2xl p-4 shadow-sm group-hover:border-black/15 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="space-y-1 flex-1">
                                  <div className="flex items-center gap-2">
                                    {getActivityIcon(act.title)}
                                    <span className="text-xs font-mono font-semibold text-[#2A2A2A]/50">
                                      {act.time || `Stop ${actIdx + 1}`}
                                    </span>
                                  </div>
                                  <h4 className="font-bold text-sm text-[#2A2A2A]">{act.title}</h4>
                                  <p className="text-xs text-[#2A2A2A]/70 leading-relaxed">{act.description}</p>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                  <button
                                    onClick={() => {
                                      addItems([{
                                        type: 'experience',
                                        title: act.title,
                                        subtitle: `Day ${day.day} • ${act.time || 'Activity'}`,
                                        price: Math.max(1200, Math.round(Number(budget) / 15)),
                                        dayNumber: day.day,
                                        quantity: travellers
                                      }]);
                                      success(`Added "${act.title}" to Trip Cart!`);
                                    }}
                                    className="bg-black/5 hover:bg-[#C84B31] text-[#2A2A2A] hover:text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1"
                                  >
                                    <ShoppingBag className="w-3.5 h-3.5" />
                                    <span>Add to Cart</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Final Call-to-Action Bar */}
          <div className="bg-gradient-to-r from-[#2A2A2A] to-[#1F1F1F] rounded-3xl p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
            <div>
              <h3 className="text-2xl font-serif font-bold">Ready to make this trip a reality?</h3>
              <p className="text-sm text-white/70 mt-1">
                Book all flights, accommodations, rides, and activities in a single seamless checkout.
              </p>
            </div>

            <button
              onClick={handleBookEntireTrip}
              className="bg-[#C84B31] hover:bg-[#A63A25] text-white px-8 py-3.5 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-[#C84B31]/30 transition-all cursor-pointer text-sm shrink-0"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Book Entire Trip ({itinerary.days?.length || 3} Days)</span>
            </button>
          </div>

        </div>
      </div>
    );
  }

  // ── STATE 1: SIGNATURE INPUT FORM ─────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2A2A2A] pb-24">

      {/* Header & Hero */}
      <section className="bg-gradient-to-br from-[#1C1C1E] via-[#2A2A2A] to-[#191919] text-white pt-8 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden rounded-b-[40px] shadow-2xl">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#C84B31]/20 rounded-full blur-3xl pointer-events-none" />

        {/* Top App Bar with Back Button & Brand */}
        <div className="max-w-4xl mx-auto flex items-center justify-between mb-8 relative z-20">
          <button
            onClick={handleBack}
            aria-label="Go Back"
            className="group inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white transition-all backdrop-blur-md text-xs sm:text-sm font-semibold cursor-pointer shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>Back</span>
          </button>

          <Link to="/" className="flex items-center space-x-2 text-white/90 hover:text-white transition-opacity no-underline">
            <MapPin className="w-5 h-5 text-[#C84B31]" />
            <span className="font-display text-xl text-white select-none">Yatra Setu</span>
          </Link>
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#C84B31] to-amber-600 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-md">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Travel Intelligence</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-serif font-bold tracking-tight leading-tight">
            Design Your Signature Journey
          </h1>
          <p className="text-white/70 text-base sm:text-lg max-w-2xl mx-auto font-normal">
            Custom day-by-day itineraries with smart budget optimization, certified stays, and seamless all-in-one booking.
          </p>
        </div>
      </section>

      {/* Structured Generator Form Container */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">

        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-2xl border border-black/5 space-y-8">

          {error && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form Grid */}
          <div className="space-y-6">

            {/* 1. Destination */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#2A2A2A]/70 mb-2 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#C84B31]" /> Where do you want to go?
              </label>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g. Paris, Tokyo, Goa, Rajasthan, Swiss Alps..."
                className="w-full bg-[#FDFBF7] border border-black/10 rounded-2xl px-5 py-3.5 text-base text-[#2A2A2A] font-semibold placeholder-[#2A2A2A]/40 focus:outline-none focus:border-[#C84B31] focus:ring-1 focus:ring-[#C84B31]"
              />
            </div>

            {/* 2. Dates, Budget & Travellers Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#2A2A2A]/70 mb-2 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#C84B31]" /> Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-[#FDFBF7] border border-black/10 rounded-2xl px-3 py-3 text-sm font-medium text-[#2A2A2A] focus:outline-none focus:border-[#C84B31]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#2A2A2A]/70 mb-2 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#C84B31]" /> End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-[#FDFBF7] border border-black/10 rounded-2xl px-3 py-3 text-sm font-medium text-[#2A2A2A] focus:outline-none focus:border-[#C84B31]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#2A2A2A]/70 mb-2 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-[#C84B31]" /> Budget (INR)
                </label>
                <input
                  type="number"
                  step="5000"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="50000"
                  className="w-full bg-[#FDFBF7] border border-black/10 rounded-2xl px-3 py-3 text-sm font-medium text-[#2A2A2A] focus:outline-none focus:border-[#C84B31]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#2A2A2A]/70 mb-2 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-[#C84B31]" /> Travellers
                </label>
                <select
                  value={travellers}
                  onChange={(e) => setTravellers(Number(e.target.value))}
                  className="w-full bg-[#FDFBF7] border border-black/10 rounded-2xl px-3 py-3 text-sm font-medium text-[#2A2A2A] focus:outline-none focus:border-[#C84B31]"
                >
                  {[1, 2, 3, 4, 5, 6, 8, 10].map(n => (
                    <option key={n} value={n}>{n} Traveller{n > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>

            </div>

            {/* 3. Travel Style Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#2A2A2A]/70 mb-3 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-[#C84B31]" /> Preferred Travel Vibe & Style
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {TRAVEL_STYLES.map((style) => {
                  const isSelected = travelStyle === style.id;
                  return (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => setTravelStyle(style.id)}
                      className={`text-left p-4 rounded-2xl border transition-all cursor-pointer ${isSelected
                          ? 'border-[#C84B31] bg-[#C84B31]/5 ring-1 ring-[#C84B31]'
                          : 'border-black/10 hover:border-black/20 bg-[#FDFBF7]'
                        }`}
                    >
                      <p className="font-bold text-sm text-[#2A2A2A] mb-1">{style.name}</p>
                      <p className="text-[11px] text-[#2A2A2A]/60 leading-relaxed">{style.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Custom Interests / Notes */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#2A2A2A]/70 mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#C84B31]" /> Special Requests or Must-Visit Spots (Optional)
              </label>
              <textarea
                rows={3}
                value={customPreferences}
                onChange={(e) => setCustomPreferences(e.target.value)}
                placeholder="e.g. Love vegetarian cafes, interested in temple architecture, prefer mornings for hiking..."
                className="w-full bg-[#FDFBF7] border border-black/10 rounded-2xl p-4 text-sm text-[#2A2A2A] focus:outline-none focus:border-[#C84B31] resize-none"
              />
            </div>

            {/* Quick Inspiration Presets */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#2A2A2A]/50 mb-2">Or try a popular trip blueprint:</p>
              <div className="flex flex-wrap gap-2">
                {PRESET_IDEAS.map((preset) => (
                  <button
                    key={preset.destination}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className="bg-black/5 hover:bg-black/10 text-xs font-semibold px-3 py-1.5 rounded-full text-[#2A2A2A] transition-colors cursor-pointer"
                  >
                    ✨ {preset.destination} ({preset.days}D)
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t border-black/5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-[#2A2A2A]/50 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                <span>AI models powered with real-time route optimization</span>
              </p>

              <button
                onClick={handleGenerate}
                disabled={loading || !destination.trim()}
                className="w-full sm:w-auto bg-[#C84B31] hover:bg-[#A63A25] disabled:opacity-50 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-xl shadow-[#C84B31]/25 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed text-base"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Generating Custom Itinerary...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Generate AI Itinerary</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
