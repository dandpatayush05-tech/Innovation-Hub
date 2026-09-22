import React, { useEffect, useState, useMemo } from 'react';
import { getUnifiedBookings, cancelBooking, UnifiedBooking } from '../api/bookings';
import { Loader2, Hotel, Plane, Bus, Car, Compass, FileText, Download, XCircle, Map, Sparkles, Luggage } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { generateAndDownloadReceipt } from '../lib/receiptGenerator';

export const Bookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [cancelTarget, setCancelTarget] = useState<{ id: string, type: string } | null>(null);
  const { success: toastSuccess, error: toastError } = useToast();

  const fetchBookings = async () => {
    try {
      let apiBookings: any[] = [];
      try {
        const data = await getUnifiedBookings();
        apiBookings = data.bookings || [];
      } catch (err) {
        console.warn('Backend bookings fetch notice:', err);
      }

      // Merge with locally confirmed bookings
      const stored = localStorage.getItem('yatra_setu_local_bookings');
      const localBookings = stored ? JSON.parse(stored) : [];

      // Avoid duplicates by matching id or bookingReference
      const existingIds = new Set(localBookings.map((b: any) => b.id));
      const filteredApi = apiBookings.filter((b: any) => !existingIds.has(b.id));

      const merged = [...localBookings, ...filteredApi];
      setBookings(merged);
    } catch (error) {
      console.error('Failed to fetch unified bookings', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();

    const handleUpdate = () => {
      fetchBookings();
    };

    window.addEventListener('bookings_updated', handleUpdate);
    return () => {
      window.removeEventListener('bookings_updated', handleUpdate);
    };
  }, []);

  const executeCancel = async (id: string, type: string) => {
    setActionLoading(id);
    try {
      // 1. If in local storage, update status to cancelled
      const stored = localStorage.getItem('yatra_setu_local_bookings');
      if (stored) {
        const localList = JSON.parse(stored);
        const updated = localList.map((b: any) => b.id === id ? { ...b, status: 'cancelled' } : b);
        localStorage.setItem('yatra_setu_local_bookings', JSON.stringify(updated));
      }

      // 2. Try backend cancel if API booking
      try {
        await cancelBooking(id, type as any);
      } catch (err) {
        console.warn('API cancel note:', err);
      }

      await fetchBookings();
      toastSuccess('Booking cancelled successfully');
    } catch (error) {
      console.error('Failed to cancel', error);
      toastError('Failed to cancel booking.');
    } finally {
      setActionLoading(null);
      setCancelTarget(null);
    }
  };

  const handleCancelClick = (id: string, type: string) => {
    setCancelTarget({ id, type });
  };

  const handleDownloadInvoice = (booking: any) => {
    generateAndDownloadReceipt({
      receiptNumber: booking.receiptNumber || `YS-REC-${booking.id.toString().slice(-4)}`,
      bookingReference: booking.bookingReference || `YS-REF-${booking.id.toString().slice(-6)}`,
      bookingType: booking.type || 'Travel Service',
      title: booking.title || 'Yatra Setu Booking',
      destination: booking.destination || 'India',
      travelDate: booking.date ? new Date(booking.date).toLocaleDateString('en-IN') : 'Scheduled',
      customerName: user?.name || 'Valued Traveler',
      customerEmail: user?.email || 'traveler@yatrasetu.com',
      seats: booking.seats || undefined,
      totalAmount: Number(booking.amount || booking.totalAmount || 3500),
      paymentMethod: 'Verified 3D Secure Demo Card',
      taxAmount: Math.round(Number(booking.amount || booking.totalAmount || 3500) * 0.05),
      hotelDetails: booking.hotelName ? {
        name: booking.hotelName,
        roomType: booking.hotelTier ? `${booking.hotelTier} Room` : 'Deluxe Room',
        checkIn: booking.date || new Date().toISOString().split('T')[0]
      } : undefined
    });
  };

  const getIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'hotel': return <Hotel className="w-5 h-5 text-blue-600" />;
      case 'flight': return <Plane className="w-5 h-5 text-[#C84B31]" />;
      case 'bus': return <Bus className="w-5 h-5 text-emerald-600" />;
      case 'auto':
      case 'cab': return <Car className="w-5 h-5 text-amber-600" />;
      case 'experience':
      case 'tour': return <Compass className="w-5 h-5 text-purple-600" />;
      case 'package': return <Luggage className="w-5 h-5 text-amber-500" />;
      default: return <FileText className="w-5 h-5 text-stone-700" />;
    }
  };

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      let matchesType = true;
      if (typeFilter !== 'All') {
        matchesType = (b.type || '').toLowerCase() === typeFilter.toLowerCase();
      }

      let matchesStatus = true;
      if (statusFilter !== 'All') {
        if (statusFilter === 'Upcoming') {
          matchesStatus = ['confirmed', 'requested', 'in_progress'].includes((b.status || '').toLowerCase());
        } else {
          matchesStatus = (b.status || '').toLowerCase() === statusFilter.toLowerCase();
        }
      }

      return matchesType && matchesStatus;
    });
  }, [bookings, typeFilter, statusFilter]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#C84B31]" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#2A2A2A] mb-1">My Bookings</h1>
          <p className="text-stone-500 text-sm">Manage all your trips, bumper holiday packages, and rides in one place.</p>
        </div>

        <Link
          to="/packages"
          className="bg-stone-900 hover:bg-black text-white px-5 py-2.5 rounded-full text-xs font-bold transition flex items-center gap-2 shadow-sm self-start sm:self-auto"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Explore Bumper Packages</span>
        </Link>
      </div>

      {/* Filter Row */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-2xl shadow-sm border border-black/5">
        <div className="flex-1">
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#2A2A2A]/60 mb-1">Category</label>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full bg-[#FDFBF7] border border-black/10 rounded-xl px-4 py-2 text-sm text-[#2A2A2A] focus:outline-none"
          >
            <option value="All">All Types</option>
            <option value="Package">Bumper Holiday Packages</option>
            <option value="Hotel">Hotels & Stays</option>
            <option value="Flight">Flights</option>
            <option value="Bus">Buses</option>
            <option value="Auto">Auto/Cabs</option>
            <option value="Experience">Experiences & Tours</option>
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#2A2A2A]/60 mb-1">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-[#FDFBF7] border border-black/10 rounded-xl px-4 py-2 text-sm text-[#2A2A2A] focus:outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="Upcoming">Upcoming / Confirmed</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {filteredBookings.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-black/5 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-[#FDFBF7] rounded-full flex items-center justify-center mb-4 text-[#2A2A2A]/40">
            <Map className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-medium text-[#2A2A2A] mb-2">No bookings found</h3>
          <p className="text-[#2A2A2A]/60 mb-6 text-sm">Discover sacred heritage tours or all-in-one bumper packages!</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/packages" className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-stone-950 px-6 py-2.5 rounded-full font-bold text-xs transition shadow-md">
              Browse Bumper Packages
            </Link>
            <Link to="/destinations" className="bg-stone-900 text-white px-6 py-2.5 rounded-full font-bold text-xs hover:bg-black transition">
              Explore Destinations
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => {
            const amount = booking.amount || booking.totalAmount || 0;
            const refNumber = booking.bookingReference || `YS-${(booking.id || '').substring(0, 6).toUpperCase()}`;

            return (
              <div key={booking.id} className="bg-white rounded-2xl p-6 border border-stone-200/90 flex flex-col md:flex-row gap-6 items-center shadow-sm hover:shadow-md transition">

                <div className="w-12 h-12 bg-stone-50 rounded-2xl flex items-center justify-center flex-shrink-0 border border-stone-200">
                  {getIcon(booking.type)}
                </div>

                <div className="flex-1 text-center md:text-left w-full">
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-1">
                    <span className="font-bold text-xs uppercase tracking-wider text-stone-700">{booking.type}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      booking.status === 'confirmed' || booking.status === 'completed' 
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                      booking.status === 'cancelled' 
                        ? 'bg-rose-100 text-rose-800 border border-rose-200' 
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}>
                      {booking.status}
                    </span>
                    {booking.hotelTier && (
                      <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {booking.hotelTier} Tier
                      </span>
                    )}
                  </div>
                  <h4 className="text-stone-900 font-bold text-lg">{booking.title}</h4>
                  <p className="text-xs text-stone-500 mt-0.5">{booking.subtitle || booking.destination}</p>
                  
                  {booking.seats && booking.seats.length > 0 && (
                    <p className="text-xs text-blue-600 font-semibold mt-1">
                      💺 Seats: {booking.seats.join(', ')}
                    </p>
                  )}

                  <p className="text-[11px] font-mono text-stone-400 mt-1">Ref: {refNumber}</p>
                </div>

                <div className="text-center md:text-right">
                  <p className="text-xs text-stone-400 uppercase font-medium">Travel Date</p>
                  <p className="font-semibold text-stone-800 text-sm whitespace-nowrap mb-2">
                    {booking.date ? new Date(booking.date).toLocaleDateString('en-IN', {
                      day: '2-digit', month: 'short', year: 'numeric'
                    }) : 'Scheduled'}
                  </p>
                  {amount > 0 && (
                    <>
                      <p className="text-xs text-stone-400 uppercase font-medium">Total Paid</p>
                      <p className="font-black text-amber-600 text-lg">₹{Number(amount).toLocaleString('en-IN')}</p>
                    </>
                  )}
                </div>

                <div className="w-full md:w-auto flex flex-col gap-2">
                  <button 
                    onClick={() => handleDownloadInvoice(booking)}
                    className="flex items-center justify-center gap-1.5 bg-stone-900 hover:bg-black text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5 text-amber-400" />
                    <span>Download Invoice</span>
                  </button>
                  
                  {['pending', 'confirmed', 'requested'].includes(booking.status) && (
                    <button
                      onClick={() => handleCancelClick(booking.id, booking.type)}
                      disabled={actionLoading === booking.id}
                      className="flex items-center justify-center gap-1.5 text-rose-600 hover:bg-rose-50 px-4 py-2 rounded-xl text-xs font-semibold transition border border-rose-200"
                    >
                      {actionLoading === booking.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                      <span>Cancel</span>
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        isOpen={cancelTarget !== null}
        onClose={() => setCancelTarget(null)}
        onConfirm={async () => {
          if (cancelTarget) {
            await executeCancel(cancelTarget.id, cancelTarget.type);
          }
        }}
        title="Cancel Booking"
        description="Are you sure you want to cancel this reservation? Full refund will be processed within 24 hours under our cancellation policy."
        confirmText="Confirm Cancel"
      />
    </div>
  );
};

export default Bookings;
