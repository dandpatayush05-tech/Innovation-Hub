import React, { useState, useEffect } from 'react';
import { 
  Plane, Building2, Car, Compass, Clock, 
  AlertTriangle, CheckCircle2, RefreshCw, Sparkles, 
  ArrowRight, Radio, ShieldCheck, MapPin, ChevronRight
} from 'lucide-react';
import { supabase } from '../../config/supabase';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useNotifications } from '../../context/NotificationContext';

export interface TimelineItem {
  id: string;
  time: string;
  originalTime?: string;
  type: 'flight' | 'transfer' | 'hotel' | 'activity' | 'dining';
  title: string;
  subtitle: string;
  location: string;
  status: 'confirmed' | 'in_progress' | 'delayed' | 'rescheduled' | 'upcoming';
  confirmationCode?: string;
  note?: string;
}

interface LiveTripModeProps {
  tripId: string;
  tripDestination: string;
  rawTripData?: any;
}

export const LiveTripMode: React.FC<LiveTripModeProps> = ({ 
  tripId, 
  tripDestination,
  rawTripData 
}) => {
  const { user } = useAuth();
  const { success, info } = useToast();
  const { addNotification } = useNotifications();

  const [isDelayed, setIsDelayed] = useState(false);
  const [showAiComparison, setShowAiComparison] = useState(false);
  const [activePlanAccepted, setActivePlanAccepted] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);

  // Initial timeline for Today
  const initialTimeline: TimelineItem[] = [
    {
      id: 'item-1',
      time: '08:30 AM',
      type: 'flight',
      title: `Flight 6E-204 to ${tripDestination}`,
      subtitle: 'Terminal 2 • Seat 14A • Baggage Checked',
      location: 'Indira Gandhi Intl Airport (DEL)',
      status: 'confirmed',
      confirmationCode: '6E-IX928'
    },
    {
      id: 'item-2',
      time: '10:15 AM',
      type: 'transfer',
      title: 'Prepaid Airport Transfer (Sedan)',
      subtitle: 'Driver: Rajesh Kumar • White Honda City (DL-01-AB-4421)',
      location: `${tripDestination} Airport Exit Gate 3`,
      status: 'confirmed',
      confirmationCode: 'CAB-9921'
    },
    {
      id: 'item-3',
      time: '01:00 PM',
      type: 'hotel',
      title: `Check-in at ${rawTripData?.hotels?.[0]?.hotel?.name || 'Heritage Resort & Spa'}`,
      subtitle: 'Deluxe Heritage Villa • Booking Reference Confirmed',
      location: `Beach Road, ${tripDestination}`,
      status: 'upcoming',
      confirmationCode: 'HTL-8832'
    },
    {
      id: 'item-4',
      time: '03:30 PM',
      type: 'activity',
      title: `Curated ${tripDestination} Heritage Walking Tour`,
      subtitle: 'Guided Experience with Certified Local Historian',
      location: 'Old Town Clock Tower',
      status: 'upcoming',
      confirmationCode: 'EXP-1049'
    },
    {
      id: 'item-5',
      time: '07:30 PM',
      type: 'dining',
      title: 'Sunset Coastal Dining & Tasting Experience',
      subtitle: 'Table Reserved for 2 • Sea-facing Deck',
      location: 'The Fisherman’s Wharf',
      status: 'upcoming',
      confirmationCode: 'DIN-4402'
    }
  ];

  const [timeline, setTimeline] = useState<TimelineItem[]>(initialTimeline);

  // Supabase Realtime Subscription for Live Trip Updates
  useEffect(() => {
    const channel = supabase.channel(`trip-live:${tripId}`);

    channel
      .on('broadcast', { event: 'delay_simulated' }, (payload: any) => {
        if (payload?.payload?.delayed) {
          handleApplyDelayState(false);
        } else {
          handleResetState(false);
        }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`[Supabase Realtime] Connected to live channel trip-live:${tripId}`);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tripId]);

  const handleApplyDelayState = (broadcast = true) => {
    setIsDelayed(true);
    setShowAiComparison(true);

    if (broadcast) {
      supabase.channel(`trip-live:${tripId}`).send({
        type: 'broadcast',
        event: 'delay_simulated',
        payload: { delayed: true, timestamp: Date.now() }
      });
    }
  };

  const handleResetState = (broadcast = true) => {
    setIsDelayed(false);
    setShowAiComparison(false);
    setActivePlanAccepted(false);
    setTimeline(initialTimeline);

    if (broadcast) {
      supabase.channel(`trip-live:${tripId}`).send({
        type: 'broadcast',
        event: 'delay_simulated',
        payload: { delayed: false, timestamp: Date.now() }
      });
    }
    info('Trip timeline reset to original schedule');
  };

  const simulateDelay = async () => {
    setIsSimulating(true);
    await new Promise((r) => setTimeout(r, 600));
    handleApplyDelayState(true);
    addNotification({
      type: 'delay_alert',
      title: `⚡ Flight 6E-204 Delay Detected (+2h)`,
      message: `Flight to ${tripDestination} delayed. AI has generated a re-routed itinerary to prevent missed transfers.`,
      link: `/dashboard/trips/${tripId}`
    });
    setIsSimulating(false);
    info('Simulated +2hr Flight Delay: AI Mid-Trip Rescheduling generated!');
  };

  const applyAiReschedule = () => {
    const updatedTimeline: TimelineItem[] = [
      {
        id: 'item-1',
        time: '10:30 AM',
        originalTime: '08:30 AM',
        type: 'flight',
        title: `Flight 6E-204 to ${tripDestination} (Delayed +2h)`,
        subtitle: 'New Dep: 10:30 AM • Gate changed to 4B',
        location: 'Indira Gandhi Intl Airport (DEL)',
        status: 'delayed',
        confirmationCode: '6E-IX928',
        note: 'Air traffic congestion. Flight crew onboard.'
      },
      {
        id: 'item-2',
        time: '12:15 PM',
        originalTime: '10:15 AM',
        type: 'transfer',
        title: 'Prepaid Airport Transfer (Auto-Adjusted)',
        subtitle: 'Driver Rajesh notified via WhatsApp • Arriving Gate 3 at 12:15 PM',
        location: `${tripDestination} Airport Exit Gate 3`,
        status: 'rescheduled',
        confirmationCode: 'CAB-9921',
        note: 'No extra charge for delayed pickup buffer.'
      },
      {
        id: 'item-3',
        time: '02:30 PM',
        originalTime: '01:00 PM',
        type: 'hotel',
        title: `Check-in at ${rawTripData?.hotels?.[0]?.hotel?.name || 'Heritage Resort & Spa'}`,
        subtitle: 'Late Check-in Confirmed • Keycard ready at desk',
        location: `Beach Road, ${tripDestination}`,
        status: 'rescheduled',
        confirmationCode: 'HTL-8832',
        note: 'Front desk notified of delayed arrival.'
      },
      {
        id: 'item-4',
        time: '05:00 PM',
        originalTime: '03:30 PM',
        type: 'activity',
        title: `Sunset Edition: ${tripDestination} Heritage Walking Tour`,
        subtitle: 'Guide shifted to golden hour slot to avoid midday rush',
        location: 'Old Town Clock Tower',
        status: 'rescheduled',
        confirmationCode: 'EXP-1049',
        note: 'Guide Vijay confirmed new sunset slot.'
      },
      {
        id: 'item-5',
        time: '07:30 PM',
        type: 'dining',
        title: 'Sunset Coastal Dining & Tasting Experience',
        subtitle: 'Table Reservation preserved without change',
        location: 'The Fisherman’s Wharf',
        status: 'confirmed',
        confirmationCode: 'DIN-4402',
        note: 'Schedule buffer preserved dinner slot.'
      }
    ];

    setTimeline(updatedTimeline);
    setActivePlanAccepted(true);
    setShowAiComparison(false);
    success('AI Optimized Itinerary applied to Live Trip Mode!');
  };

  const getServiceIcon = (type: string) => {
    switch (type) {
      case 'flight': return <Plane className="w-5 h-5 text-sky-600" />;
      case 'transfer': return <Car className="w-5 h-5 text-amber-600" />;
      case 'hotel': return <Building2 className="w-5 h-5 text-blue-600" />;
      case 'activity': return <Compass className="w-5 h-5 text-purple-600" />;
      case 'dining': return <Sparkles className="w-5 h-5 text-orange-600" />;
      default: return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200"><CheckCircle2 className="w-3 h-3" /> Confirmed</span>;
      case 'delayed':
        return <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200 animate-pulse"><AlertTriangle className="w-3 h-3" /> Delayed (+2h)</span>;
      case 'rescheduled':
        return <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200"><Sparkles className="w-3 h-3 text-amber-600" /> AI Rescheduled</span>;
      case 'in_progress':
        return <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200"><Radio className="w-3 h-3 animate-ping" /> In Progress</span>;
      default:
        return <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600">Upcoming</span>;
    }
  };

  const isDevOrAdmin = user?.role === 'admin' || import.meta.env.DEV;

  return (
    <div className="space-y-6">
      
      {/* Live Status Header */}
      <div className="bg-gradient-to-r from-[#2A2A2A] via-[#1F1F1F] to-black rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-[#C84B31]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-mono">
                Live Trip Active • Today’s Schedule
              </span>
            </div>
            <h3 className="text-2xl font-serif font-bold text-white">
              Day 1 in {tripDestination}
            </h3>
            <p className="text-sm text-white/70 mt-0.5">
              Real-time monitoring active. Auto-syncing flight status and booking connections.
            </p>
          </div>

          {/* Dev / Admin Simulation Control */}
          {isDevOrAdmin && (
            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-3 flex flex-col items-end gap-2 shrink-0">
              <div className="flex items-center gap-1.5 text-[11px] font-mono text-white/60">
                <ShieldCheck className="w-3.5 h-3.5 text-[#C84B31]" />
                <span>DEMO / ADMIN CONTROLS</span>
              </div>
              
              <div className="flex items-center gap-2">
                {!isDelayed ? (
                  <button
                    onClick={simulateDelay}
                    disabled={isSimulating}
                    className="bg-[#C84B31] text-white text-xs font-semibold px-3.5 py-1.5 rounded-xl hover:bg-[#A63A25] active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    {isSimulating ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5" />
                    )}
                    <span>Simulate Flight Delay (+2h)</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleResetState(true)}
                    className="bg-white/20 text-white text-xs font-semibold px-3.5 py-1.5 rounded-xl hover:bg-white/30 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Reset Simulation</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* AI Reschedule Comparison Modal / Banner */}
      {showAiComparison && (
        <div className="bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-white border-2 border-amber-500/30 rounded-3xl p-6 shadow-xl space-y-5 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-500/20">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-[#2A2A2A]">
                  AI Mid-Trip Rescheduling Proposal
                </h4>
                <p className="text-xs text-[#2A2A2A]/70">
                  Flight 6E-204 is delayed by 120 minutes. Yatra Setu AI has automatically recalculated your timeline to preserve all reservations.
                </p>
              </div>
            </div>

            <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-3 py-1 rounded-full shrink-0">
              Disruption Detected
            </span>
          </div>

          {/* Comparison Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Old Plan */}
            <div className="bg-white/80 rounded-2xl p-4 border border-red-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-red-600 font-mono">Original Schedule (Clashing)</span>
                <span className="text-xs text-red-500 font-semibold">Overlaps Present</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-2 rounded-lg bg-red-50 text-red-800 line-through opacity-75">
                  <strong>08:30 AM</strong> — Flight Departs DEL
                </div>
                <div className="p-2 rounded-lg bg-red-50 text-red-800 line-through opacity-75">
                  <strong>10:15 AM</strong> — Airport Transfer Cab (Missed)
                </div>
                <div className="p-2 rounded-lg bg-red-50 text-red-800 line-through opacity-75">
                  <strong>01:00 PM</strong> — Hotel Check-in
                </div>
                <div className="p-2 rounded-lg bg-red-50 text-red-800 line-through opacity-75">
                  <strong>03:30 PM</strong> — Heritage Walking Tour (Rush)
                </div>
              </div>
            </div>

            {/* AI Updated Plan */}
            <div className="bg-white rounded-2xl p-4 border-2 border-emerald-500/40 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-emerald-700 font-mono flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> AI-Optimized Schedule
                </span>
                <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">0 Missed Items</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-2 rounded-lg bg-emerald-50/70 border border-emerald-100 text-emerald-900">
                  <strong className="text-emerald-700">10:30 AM (+2h)</strong> — Flight Departs DEL (Updated Gate 4B)
                </div>
                <div className="p-2 rounded-lg bg-emerald-50/70 border border-emerald-100 text-emerald-900">
                  <strong className="text-emerald-700">12:15 PM</strong> — Airport Cab driver notified (Free buffer applied)
                </div>
                <div className="p-2 rounded-lg bg-emerald-50/70 border border-emerald-100 text-emerald-900">
                  <strong className="text-emerald-700">02:30 PM</strong> — Late Hotel Check-in confirmed with front desk
                </div>
                <div className="p-2 rounded-lg bg-emerald-50/70 border border-emerald-100 text-emerald-900">
                  <strong className="text-emerald-700">05:00 PM</strong> — Heritage Tour shifted to Golden Hour Sunset slot
                </div>
              </div>
            </div>

          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div className="text-xs text-[#2A2A2A]/70 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Free auto-rebooking guarantee applied with zero penalty fees.</span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => setShowAiComparison(false)}
                className="flex-1 sm:flex-none text-xs font-semibold text-[#2A2A2A]/70 hover:text-black px-4 py-2.5 rounded-xl cursor-pointer"
              >
                Dismiss
              </button>
              <button
                onClick={applyAiReschedule}
                className="flex-1 sm:flex-none bg-emerald-600 text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-emerald-700 active:scale-95 transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Accept AI Plan</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Vertical Live Timeline */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-black/5 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-black/5 pb-4">
          <div>
            <h4 className="text-lg font-bold text-[#2A2A2A]">
              Today’s Step-by-Step Schedule
            </h4>
            <p className="text-xs text-[#2A2A2A]/60">
              Times update dynamically in sync with airline and partner dispatch systems.
            </p>
          </div>
          {activePlanAccepted && (
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> AI Reschedule Active
            </span>
          )}
        </div>

        <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-black/10">
          {timeline.map((item, idx) => (
            <div key={item.id} className="relative group">
              
              {/* Node Indicator */}
              <div className={`absolute -left-6 sm:-left-8 top-1.5 w-6 sm:w-8 h-6 sm:h-8 rounded-full border-2 bg-white flex items-center justify-center shadow-sm ${
                item.status === 'delayed'
                  ? 'border-red-500 text-red-500 ring-4 ring-red-100'
                  : item.status === 'rescheduled'
                  ? 'border-amber-500 text-amber-600 ring-4 ring-amber-100'
                  : item.status === 'in_progress'
                  ? 'border-blue-500 text-blue-600 ring-4 ring-blue-100'
                  : 'border-black/20 text-[#2A2A2A]'
              }`}>
                {getServiceIcon(item.type)}
              </div>

              {/* Item Card */}
              <div className={`rounded-2xl p-4 sm:p-5 border transition-all ${
                item.status === 'delayed'
                  ? 'bg-red-50/50 border-red-200'
                  : item.status === 'rescheduled'
                  ? 'bg-amber-50/40 border-amber-200'
                  : 'bg-[#FDFBF7] border-black/5 hover:border-black/10'
              }`}>
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-[#2A2A2A]">
                      {item.time}
                    </span>
                    {item.originalTime && (
                      <span className="text-xs text-gray-400 line-through font-mono">
                        {item.originalTime}
                      </span>
                    )}
                  </div>
                  <div>
                    {getStatusBadge(item.status)}
                  </div>
                </div>

                <h5 className="text-base font-bold text-[#2A2A2A] mb-1">
                  {item.title}
                </h5>

                <p className="text-xs text-[#2A2A2A]/70 mb-2">
                  {item.subtitle}
                </p>

                <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-[#2A2A2A]/60 pt-2 border-t border-black/5">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#C84B31]" />
                    <span>{item.location}</span>
                  </span>

                  {item.confirmationCode && (
                    <span className="font-mono font-semibold text-[#2A2A2A]/80">
                      Ref: {item.confirmationCode}
                    </span>
                  )}
                </div>

                {item.note && (
                  <div className="mt-2.5 p-2 rounded-xl bg-amber-100/60 text-amber-900 text-xs flex items-center gap-1.5 font-medium">
                    <Sparkles className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                    <span>{item.note}</span>
                  </div>
                )}

              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
