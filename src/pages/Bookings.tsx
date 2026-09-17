import React, { useEffect, useState, useMemo } from 'react';
import { getUnifiedBookings, cancelBooking, UnifiedBooking } from '../api/bookings';
import { Loader2, Hotel, Plane, Bus, Car, Compass, FileText, Download, XCircle, Map } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Bookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<UnifiedBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchBookings = async () => {
    try {
      const data = await getUnifiedBookings();
      setBookings(data.bookings || []);
    } catch (error) {
      console.error('Failed to fetch unified bookings', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = async (id: string, type: UnifiedBooking['type']) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    setActionLoading(id);
    try {
      await cancelBooking(id, type);
      await fetchBookings();
    } catch (error) {
      console.error('Failed to cancel', error);
      alert('Failed to cancel booking. Check console for details.');
    } finally {
      setActionLoading(null);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'hotel': return <Hotel className="w-5 h-5" />;
      case 'flight': return <Plane className="w-5 h-5" />;
      case 'bus': return <Bus className="w-5 h-5" />;
      case 'auto': return <Car className="w-5 h-5" />;
      case 'experience': return <Compass className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      let matchesType = true;
      if (typeFilter !== 'All') {
        matchesType = b.type.toLowerCase() === typeFilter.toLowerCase();
      }
      
      let matchesStatus = true;
      if (statusFilter !== 'All') {
        if (statusFilter === 'Upcoming') {
          matchesStatus = ['confirmed', 'requested', 'in_progress'].includes(b.status);
        } else {
          matchesStatus = b.status === statusFilter.toLowerCase();
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
      <div>
        <h1 className="text-3xl font-serif text-[#2A2A2A] mb-2">My Bookings</h1>
        <p className="text-[#2A2A2A]/60">Manage all your trips, experiences, and rides in one place.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-2xl shadow-sm border border-black/5">
        <div className="flex-1">
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#2A2A2A]/60 mb-1">Type</label>
          <select 
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full bg-[#FDFBF7] border border-black/10 rounded-xl px-4 py-2 text-[#2A2A2A] focus:outline-none"
          >
            <option value="All">All Types</option>
            <option value="Hotel">Hotels</option>
            <option value="Flight">Flights</option>
            <option value="Bus">Buses</option>
            <option value="Auto">Auto/Cabs</option>
            <option value="Experience">Experiences</option>
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#2A2A2A]/60 mb-1">Status</label>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-[#FDFBF7] border border-black/10 rounded-xl px-4 py-2 text-[#2A2A2A] focus:outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="Upcoming">Upcoming</option>
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
          <h3 className="text-xl font-medium text-[#2A2A2A] mb-2">You have no trips planned yet</h3>
          <p className="text-[#2A2A2A]/60 mb-6">Let's find your next adventure!</p>
          <div className="flex gap-4">
            <Link to="/destinations" className="bg-[#C84B31] text-white px-6 py-2.5 rounded-full font-medium hover:bg-[#A63A25] transition-colors">
              Explore Destinations
            </Link>
            <Link to="/dashboard" className="bg-slate-100 text-[#2A2A2A] px-6 py-2.5 rounded-full font-medium hover:bg-slate-200 transition-colors">
              Go to Dashboard
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <div key={booking.id} className="bg-white rounded-2xl p-6 border border-black/5 flex flex-col md:flex-row gap-6 items-center shadow-sm hover:shadow-md transition-shadow">
              
              <div className="w-12 h-12 bg-[#FDFBF7] rounded-full flex items-center justify-center text-[#C84B31] flex-shrink-0">
                {getIcon(booking.type)}
              </div>

              <div className="flex-1 text-center md:text-left w-full">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-1">
                  <h3 className="font-semibold text-lg text-[#2A2A2A] capitalize">{booking.type}</h3>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    booking.status === 'confirmed' || booking.status === 'completed' ? 'bg-green-100 text-green-700' : 
                    booking.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {booking.status}
                  </span>
                </div>
                <h4 className="text-[#2A2A2A] font-medium text-lg">{booking.title}</h4>
                <p className="text-sm text-[#2A2A2A]/60">{booking.subtitle}</p>
                <p className="text-xs font-mono text-[#2A2A2A]/40 mt-1">ID: {booking.id.substring(0, 8)}</p>
              </div>

              <div className="text-center md:text-right">
                <p className="text-sm text-[#2A2A2A]/60">Date</p>
                <p className="font-medium text-[#2A2A2A] whitespace-nowrap mb-2">
                  {new Date(booking.date).toLocaleDateString()}
                </p>
                {booking.amount !== null && (
                  <>
                    <p className="text-sm text-[#2A2A2A]/60">Amount</p>
                    <p className="font-bold text-[#C84B31]">${booking.amount}</p>
                  </>
                )}
              </div>

              <div className="w-full md:w-auto flex flex-col gap-2">
                <button className="flex items-center justify-center gap-2 bg-[#FDFBF7] hover:bg-[#F5F2EA] text-[#2A2A2A] px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-black/10">
                  <Download className="w-4 h-4" /> Invoice
                </button>
                {['pending', 'confirmed', 'requested'].includes(booking.status) && (
                  <button 
                    onClick={() => handleCancel(booking.id, booking.type)}
                    disabled={actionLoading === booking.id}
                    className="flex items-center justify-center gap-2 text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-transparent hover:border-red-100"
                  >
                    {actionLoading === booking.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                    Cancel
                  </button>
                )}
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};
