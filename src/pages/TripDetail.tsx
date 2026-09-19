import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Upload, Receipt, Plane, Building2, Map, Bus, Car } from 'lucide-react';
import { getTrip, getRevisit, uploadTripPhoto } from '../api/trips';

const TripDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [trip, setTrip] = useState<any>(null);
  const [revisit, setRevisit] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tripRes, revisitRes] = await Promise.all([
        getTrip(id!),
        getRevisit(id!)
      ]);
      setTrip(tripRes.data);
      setRevisit(revisitRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !id) return;

    try {
      setUploading(true);
      await uploadTripPhoto(id, file);
      await fetchData(); // Refresh to see the new photo
    } catch (err) {
      console.error('Failed to upload photo', err);
    } finally {
      setUploading(false);
    }
  };

  const downloadReceipt = (paymentId: string) => {
    window.open(`http://localhost:5000/api/payments/${paymentId}/receipt`, '_blank');
  };

  if (loading) {
    return (
        <div className="flex justify-center py-20 text-gray-500">Loading trip details...</div>
    );
  }

  if (!trip) {
    return (
        <div className="flex justify-center py-20 text-red-500">Trip not found</div>
    );
  }

  return (
      <div className="max-w-5xl mx-auto space-y-8 pb-10">
        <button 
          onClick={() => navigate('/dashboard/trips')}
          className="flex items-center text-sm font-medium text-gray-500 hover:text-black transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Experiences
        </button>

        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{trip.destination} Trip</h1>
            <p className="text-gray-500 text-lg">
              {trip.start_date ? new Date(trip.start_date).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) : 'Unknown Date'}
            </p>
          </div>
          <button 
            onClick={() => navigate('/destinations')} 
            className="bg-[#2A2A2A] text-white px-6 py-2.5 rounded-xl font-medium hover:bg-black transition-colors shadow-sm"
          >
            Visit Again
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Photos */}
            <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Memories</h2>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center text-sm font-medium text-[#C84B31] bg-orange-50 px-3 py-1.5 rounded-lg hover:bg-orange-100"
                >
                  <Upload className="w-4 h-4 mr-1.5" />
                  {uploading ? 'Uploading...' : 'Add Photo'}
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>

              {trip.photos.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {trip.photos.map((photo: any) => (
                    <div key={photo.id} className="aspect-square rounded-2xl overflow-hidden bg-gray-100">
                      <img src={photo.url} alt="Trip memory" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400">
                  <Map className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p>No photos yet. Add some memories!</p>
                </div>
              )}
            </section>

            {/* Bookings */}
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">Itinerary Items</h2>
              
              {trip.hotels.map((h: any) => (
                <div key={h.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                  <div className="bg-blue-50 p-3 rounded-xl"><Building2 className="w-6 h-6 text-blue-600" /></div>
                  <div>
                    <h4 className="font-bold text-gray-900">{h.hotel?.name || 'Hotel'}</h4>
                    <p className="text-sm text-gray-500">Stay • {new Date(h.check_in).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}

              {trip.flights.map((f: any) => (
                <div key={f.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                  <div className="bg-sky-50 p-3 rounded-xl"><Plane className="w-6 h-6 text-sky-600" /></div>
                  <div>
                    <h4 className="font-bold text-gray-900">{f.flight?.departure_airport} to {f.flight?.arrival_airport}</h4>
                    <p className="text-sm text-gray-500">Flight • {new Date(f.departure_date).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}

              {trip.tours.map((t: any) => (
                <div key={t.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                  <div className="bg-purple-50 p-3 rounded-xl"><Map className="w-6 h-6 text-purple-600" /></div>
                  <div>
                    <h4 className="font-bold text-gray-900">{t.tour?.name || 'Experience'}</h4>
                    <p className="text-sm text-gray-500">Tour • {new Date(t.date).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
              
              {trip.buses.map((b: any) => (
                <div key={b.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                  <div className="bg-emerald-50 p-3 rounded-xl"><Bus className="w-6 h-6 text-emerald-600" /></div>
                  <div>
                    <h4 className="font-bold text-gray-900">{b.bus?.origin} to {b.bus?.destination}</h4>
                    <p className="text-sm text-gray-500">Bus • {new Date(b.departure_date).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}

              {trip.autos.map((a: any) => (
                <div key={a.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                  <div className="bg-yellow-50 p-3 rounded-xl"><Car className="w-6 h-6 text-yellow-600" /></div>
                  <div>
                    <h4 className="font-bold text-gray-900">Local Transport</h4>
                    <p className="text-sm text-gray-500">Auto/Cab • {new Date(a.start_date).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}

              {(trip.hotels.length + trip.flights.length + trip.tours.length + trip.buses.length + trip.autos.length === 0) && (
                <div className="text-gray-500 italic">No bookings found for this trip.</div>
              )}
            </section>
          </div>

          <div className="space-y-6">
            {/* Revisit Heuristic */}
            {revisit && (
              <section className="bg-gradient-to-br from-[#2A2A2A] to-black rounded-3xl p-6 shadow-xl text-white">
                <h3 className="text-lg font-bold mb-4 flex items-center"><Clock className="w-5 h-5 mr-2" /> Want to visit again?</h3>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-white/60 text-xs uppercase tracking-wider font-semibold mb-1">Best available time</p>
                    <p className="font-medium text-lg">{revisit.suggestedDay}</p>
                    <p className="text-emerald-400 font-medium">{revisit.suggestedWindow}</p>
                  </div>
                  
                  <div className="h-px w-full bg-white/10"></div>
                  
                  <div>
                    <p className="text-white/60 text-xs uppercase tracking-wider font-semibold mb-1">Current opening hours</p>
                    <p className="font-medium">{revisit.currentOpeningHours}</p>
                  </div>
                  
                  <div className="h-px w-full bg-white/10"></div>
                  
                  <div>
                    <p className="text-white/60 text-xs uppercase tracking-wider font-semibold mb-1">Travel time</p>
                    <p className="font-medium">{revisit.travelTimeMin} minutes</p>
                  </div>
                </div>
              </section>
            )}

            {/* Payments */}
            <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Payments</h3>
              {trip.payments.length > 0 ? (
                <div className="space-y-3">
                  {trip.payments.map((payment: any) => (
                    <div key={payment.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                      <div>
                        <p className="font-medium text-gray-900">₹{payment.amount}</p>
                        <p className="text-xs text-gray-500 capitalize">{payment.booking_type}</p>
                      </div>
                      <button 
                        onClick={() => downloadReceipt(payment.id)}
                        className="text-[#C84B31] bg-white p-2 rounded-lg shadow-sm hover:shadow transition-shadow"
                        title="Download Receipt"
                      >
                        <Receipt className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No payments found.</p>
              )}
            </section>
          </div>
        </div>
      </div>
  );
};

export default TripDetail;
