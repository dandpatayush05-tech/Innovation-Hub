import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/axios';
import { Loader2, Mail, CheckCircle, Clock, MapPin, CalendarDays, Save } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { getBusinesses, updateBusiness, Business } from '../api/businesses';
import { getHotels, updateHotel, Hotel } from '../api/hotels';
import { getTours, updateTour, Tour } from '../api/tours';

interface ContactRequest {
  id: string;
  name: string;
  email: string;
  organization_type: string;
  message: string;
  status: 'pending' | 'in-progress' | 'resolved';
  created_at: string;
}

export const AdminDashboard = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<'tickets' | 'locations' | 'availability'>('tickets');
  
  const [requests, setRequests] = useState<ContactRequest[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [tours, setTours] = useState<Tour[]>([]);
  
  const [fetching, setFetching] = useState(true);
  const { success: toastSuccess, error: toastError } = useToast();

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchData();
    } else {
      setFetching(false);
    }
  }, [user, activeTab]);

  const fetchData = async () => {
    setFetching(true);
    try {
      if (activeTab === 'tickets') {
        const res = await api.get('/contact');
        setRequests(res.data.contacts);
      } else if (activeTab === 'locations') {
        const res = await getBusinesses({ limit: 100 });
        setBusinesses(res.data);
      } else if (activeTab === 'availability') {
        const [hRes, tRes] = await Promise.all([
          getHotels({ limit: 100 }),
          getTours({ limit: 100 })
        ]);
        setHotels(hRes.data);
        setTours(tRes.data);
      }
    } catch (e) {
      console.error(e);
      toastError('Failed to fetch data');
    } finally {
      setFetching(false);
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin w-8 h-8" /></div>;
  
  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" />;
  }

  // Support Tickets
  const updateStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/contact/${id}/status`, { status });
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status: status as any } : r));
      toastSuccess('Status updated');
    } catch (e) {
      console.error(e);
      toastError('Failed to update status');
    }
  };

  // Locations
  const handleUpdateLocation = async (id: string, latitude: string, longitude: string) => {
    try {
      await updateBusiness(id, { latitude: parseFloat(latitude), longitude: parseFloat(longitude) });
      toastSuccess('Location updated');
    } catch (e) {
      console.error(e);
      toastError('Failed to update location');
    }
  };

  // Availability
  const handleUpdateHotelAvailability = async (id: string, availability: string) => {
    try {
      await updateHotel(id, { availability: parseInt(availability, 10) });
      toastSuccess('Hotel availability updated');
    } catch (e) {
      console.error(e);
      toastError('Failed to update availability');
    }
  };

  const handleUpdateTourAvailability = async (id: string, availability: string) => {
    try {
      await updateTour(id, { availability: parseInt(availability, 10) });
      toastSuccess('Tour availability updated');
    } catch (e) {
      console.error(e);
      toastError('Failed to update availability');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-serif text-[#2A2A2A] mb-8">Admin Dashboard</h1>
      
      {/* Tabs */}
      <div className="flex gap-4 mb-8 border-b border-black/10">
        <button 
          onClick={() => setActiveTab('tickets')}
          className={`pb-3 px-2 font-medium border-b-2 transition-colors ${activeTab === 'tickets' ? 'border-[#C84B31] text-[#C84B31]' : 'border-transparent text-[#2A2A2A]/60 hover:text-[#2A2A2A]'}`}
        >
          <div className="flex items-center gap-2"><Mail className="w-4 h-4" /> Support Tickets</div>
        </button>
        <button 
          onClick={() => setActiveTab('locations')}
          className={`pb-3 px-2 font-medium border-b-2 transition-colors ${activeTab === 'locations' ? 'border-[#C84B31] text-[#C84B31]' : 'border-transparent text-[#2A2A2A]/60 hover:text-[#2A2A2A]'}`}
        >
          <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> Manage Locations</div>
        </button>
        <button 
          onClick={() => setActiveTab('availability')}
          className={`pb-3 px-2 font-medium border-b-2 transition-colors ${activeTab === 'availability' ? 'border-[#C84B31] text-[#C84B31]' : 'border-transparent text-[#2A2A2A]/60 hover:text-[#2A2A2A]'}`}
        >
          <div className="flex items-center gap-2"><CalendarDays className="w-4 h-4" /> Manage Availability</div>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-6 min-h-[400px]">
        {fetching ? (
           <div className="flex justify-center items-center h-40"><Loader2 className="animate-spin w-8 h-8 text-[#C84B31]" /></div>
        ) : (
          <>
            {/* Tickets Tab */}
            {activeTab === 'tickets' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-black/5 text-sm text-[#2A2A2A]/60">
                      <th className="pb-3 px-4 font-medium">Date</th>
                      <th className="pb-3 px-4 font-medium">Name / Email</th>
                      <th className="pb-3 px-4 font-medium">Message</th>
                      <th className="pb-3 px-4 font-medium">Status</th>
                      <th className="pb-3 px-4 font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {requests.map(req => (
                      <tr key={req.id} className="border-b border-black/5 last:border-0 hover:bg-black/[0.02]">
                        <td className="py-4 px-4 whitespace-nowrap text-[#2A2A2A]/70">
                          {new Date(req.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-4">
                          <div className="font-medium text-[#2A2A2A]">{req.name}</div>
                          <div className="text-[#2A2A2A]/60 text-xs">{req.email}</div>
                        </td>
                        <td className="py-4 px-4 text-[#2A2A2A]/80 max-w-xs truncate" title={req.message}>
                          {req.message}
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                            req.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' :
                            req.status === 'in-progress' ? 'bg-amber-100 text-amber-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {req.status === 'resolved' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                            {req.status || 'pending'}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <select 
                            className="text-xs border border-black/10 rounded-lg px-2 py-1 outline-none"
                            value={req.status || 'pending'}
                            onChange={(e) => updateStatus(req.id, e.target.value)}
                          >
                            <option value="pending">Pending</option>
                            <option value="in-progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                    {requests.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-[#2A2A2A]/50">No contact requests found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Locations Tab */}
            {activeTab === 'locations' && (
               <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-black/5 text-sm text-[#2A2A2A]/60">
                      <th className="pb-3 px-4 font-medium">Business Name</th>
                      <th className="pb-3 px-4 font-medium">Type</th>
                      <th className="pb-3 px-4 font-medium">Latitude</th>
                      <th className="pb-3 px-4 font-medium">Longitude</th>
                      <th className="pb-3 px-4 font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {businesses.map(bus => (
                      <tr key={bus.id} className="border-b border-black/5 last:border-0 hover:bg-black/[0.02]">
                        <td className="py-4 px-4 font-medium">{bus.business_name}</td>
                        <td className="py-4 px-4 capitalize">{bus.business_type}</td>
                        <td className="py-4 px-4">
                           <input type="number" step="0.000001" defaultValue={bus.latitude || 0} id={`lat-${bus.id}`} className="border border-slate-300 rounded px-2 py-1 w-24 text-sm" />
                        </td>
                        <td className="py-4 px-4">
                           <input type="number" step="0.000001" defaultValue={bus.longitude || 0} id={`lng-${bus.id}`} className="border border-slate-300 rounded px-2 py-1 w-24 text-sm" />
                        </td>
                        <td className="py-4 px-4">
                           <button onClick={() => {
                             const lat = (document.getElementById(`lat-${bus.id}`) as HTMLInputElement).value;
                             const lng = (document.getElementById(`lng-${bus.id}`) as HTMLInputElement).value;
                             handleUpdateLocation(bus.id, lat, lng);
                           }} className="bg-emerald-500 hover:bg-emerald-600 text-white p-1.5 rounded-lg flex items-center justify-center transition-colors">
                             <Save className="w-4 h-4" />
                           </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
               </div>
            )}

            {/* Availability Tab */}
            {activeTab === 'availability' && (
               <div className="overflow-x-auto">
                <h3 className="text-lg font-semibold mb-4 text-[#2A2A2A]">Hotels Availability</h3>
                <table className="w-full text-left border-collapse mb-8">
                  <thead>
                    <tr className="border-b border-black/5 text-sm text-[#2A2A2A]/60">
                      <th className="pb-3 px-4 font-medium">Hotel Name</th>
                      <th className="pb-3 px-4 font-medium">Available Rooms</th>
                      <th className="pb-3 px-4 font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {hotels.map(h => (
                      <tr key={h.id} className="border-b border-black/5 last:border-0 hover:bg-black/[0.02]">
                        <td className="py-4 px-4 font-medium">{h.name}</td>
                        <td className="py-4 px-4">
                           <input type="number" min="0" defaultValue={h.availability || 0} id={`avail-h-${h.id}`} className="border border-slate-300 rounded px-2 py-1 w-24 text-sm" />
                        </td>
                        <td className="py-4 px-4">
                           <button onClick={() => {
                             const avail = (document.getElementById(`avail-h-${h.id}`) as HTMLInputElement).value;
                             handleUpdateHotelAvailability(h.id, avail);
                           }} className="bg-[#C84B31] hover:bg-[#A53A23] text-white p-1.5 rounded-lg flex items-center justify-center transition-colors">
                             <Save className="w-4 h-4" />
                           </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <h3 className="text-lg font-semibold mb-4 text-[#2A2A2A]">Experiences / Tours Availability</h3>
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-black/5 text-sm text-[#2A2A2A]/60">
                      <th className="pb-3 px-4 font-medium">Experience Name</th>
                      <th className="pb-3 px-4 font-medium">Available Slots</th>
                      <th className="pb-3 px-4 font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {tours.map(t => (
                      <tr key={t.id} className="border-b border-black/5 last:border-0 hover:bg-black/[0.02]">
                        <td className="py-4 px-4 font-medium">{t.name}</td>
                        <td className="py-4 px-4">
                           <input type="number" min="0" defaultValue={t.availability || 0} id={`avail-t-${t.id}`} className="border border-slate-300 rounded px-2 py-1 w-24 text-sm" />
                        </td>
                        <td className="py-4 px-4">
                           <button onClick={() => {
                             const avail = (document.getElementById(`avail-t-${t.id}`) as HTMLInputElement).value;
                             handleUpdateTourAvailability(t.id, avail);
                           }} className="bg-[#C84B31] hover:bg-[#A53A23] text-white p-1.5 rounded-lg flex items-center justify-center transition-colors">
                             <Save className="w-4 h-4" />
                           </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
               </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
