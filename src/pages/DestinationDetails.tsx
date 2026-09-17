import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  MapPin, Loader2, ArrowLeft, Building, Compass, Star, 
  Heart, Plane, Bus, Car, Calendar, DollarSign, Info
} from 'lucide-react';
import { getDestination } from '../api/destinations';
import type { Destination, IntelligenceData } from '../api/destinations';
import { getHotels } from '../api/hotels';
import type { Hotel } from '../api/hotels';
import { getTours } from '../api/tours';
import type { Tour } from '../api/tours';
import { BookingModal } from '../components/BookingModal';
import type { BookingType } from '../components/BookingModal';
import { ReviewsModal } from '../components/ReviewsModal';
import { DestinationMap } from '../components/DestinationMap';

export const DestinationDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [destination, setDestination] = useState<Destination | null>(null);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  
  const [modalConfig, setModalConfig] = useState<{ isOpen: boolean; type: BookingType; itemId: string; itemName: string; price: number }>({
    isOpen: false,
    type: 'hotel',
    itemId: '',
    itemName: '',
    price: 0
  });

  const [reviewsModalOpen, setReviewsModalOpen] = useState(false);
  const [reviewContext, setReviewContext] = useState<{ hotelId?: string; tourId?: string; title: string } | null>(null);

  const openBookingModal = (type: BookingType, itemId: string, itemName: string, price: number) => {
    setModalConfig({ isOpen: true, type, itemId, itemName, price });
  };

  const closeBookingModal = () => setModalConfig(prev => ({ ...prev, isOpen: false }));

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const [destRes, hotelsRes, toursRes] = await Promise.all([
          getDestination(id),
          getHotels({ destinationId: id, limit: 12 }),
          getTours({ destinationId: id, limit: 12 })
        ]);
        setDestination(destRes.data);
        setHotels(hotelsRes.data);
        setTours(toursRes.data);
      } catch (error) {
        console.error('Failed to fetch destination details:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] font-sans pb-24 animate-pulse">
        <div className="h-[65vh] min-h-[500px] w-full bg-gray-200" />
        <div className="max-w-[1360px] mx-auto px-6 pt-16 grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-16">
            <div className="bg-gray-100 rounded-3xl h-64 w-full" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-100 rounded-2xl h-80 w-full" />
              <div className="bg-gray-100 rounded-2xl h-80 w-full" />
            </div>
          </div>
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-gray-100 rounded-3xl h-96 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!destination) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center">
        <h2 className="text-3xl font-medium mb-4">Destination not found</h2>
        <Link to="/destinations" className="text-[var(--color-vstara-prompt)] underline">Return to destinations</Link>
      </div>
    );
  }

  const intel = destination.intelligence_data || {};

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans pb-24">
      {/* Navigation */}
      <nav className="absolute top-0 inset-x-0 z-50">
        <div className="max-w-[1360px] mx-auto px-6 h-24 flex items-center justify-between">
          <Link to="/destinations" className="flex items-center space-x-2 text-white hover:opacity-80 transition-opacity no-underline bg-black/20 px-4 py-2 rounded-full backdrop-blur-md">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-semibold uppercase tracking-wider text-sm">Back</span>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative h-[65vh] min-h-[500px] w-full">
        <img 
          src={destination.image_url || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop'} 
          alt={destination.name}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        
        <div className="absolute inset-0 flex flex-col justify-end pb-16">
          <div className="max-w-[1360px] mx-auto px-6 w-full text-white">
            <div className="flex items-center space-x-2 mb-4 opacity-90">
              <MapPin className="w-6 h-6" />
              <span className="text-xl font-medium tracking-wide">{destination.country}</span>
            </div>
            <h1 className="text-[clamp(48px,6vw,80px)] font-display leading-[1.1] mb-6">
              {destination.name}
            </h1>
            <p className="text-xl max-w-[800px] leading-relaxed opacity-90 mb-8">
              {destination.description}
            </p>
            
            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-4">
              <button 
                onClick={() => navigate(`/itineraries/generate?destination=${destination.id}`)}
                className="bg-white text-black px-6 py-3 rounded-full font-bold hover:bg-gray-100 transition shadow-lg"
              >
                Create Itinerary
              </button>
              <button 
                onClick={() => setSaved(!saved)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-full font-bold border-2 transition shadow-lg backdrop-blur-sm ${
                  saved ? 'bg-red-500 border-red-500 text-white' : 'bg-transparent border-white text-white hover:bg-white/20'
                }`}
              >
                <Heart className={`w-5 h-5 ${saved ? 'fill-current' : ''}`} />
                <span>{saved ? 'Saved' : 'Save Destination'}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-[1360px] mx-auto px-6 pt-16 grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* Left Column: Intelligence Data */}
        <div className="lg:col-span-2 space-y-16">
          
          {/* Intelligence Sections */}
          <section className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-2xl font-display font-bold mb-6">Destination Intelligence</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Where to Go */}
              {intel.where_to_go && intel.where_to_go.length > 0 && (
                <div>
                  <h3 className="flex items-center font-bold text-lg mb-3">
                    <MapPin className="w-5 h-5 mr-2 text-blue-600" /> Where to Go
                  </h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1 ml-2">
                    {intel.where_to_go.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* What to Do */}
              {intel.what_to_do && intel.what_to_do.length > 0 && (
                <div>
                  <h3 className="flex items-center font-bold text-lg mb-3">
                    <Compass className="w-5 h-5 mr-2 text-green-600" /> What to Do
                  </h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1 ml-2">
                    {intel.what_to_do.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8 pt-8 border-t border-gray-100">
              {/* Best Time */}
              {intel.best_time_to_visit && (
                <div>
                  <h3 className="flex items-center font-bold text-lg mb-3">
                    <Calendar className="w-5 h-5 mr-2 text-orange-500" /> Best Time to Visit
                  </h3>
                  {intel.best_time_to_visit.months && (
                    <p className="font-semibold text-gray-800 mb-1">{intel.best_time_to_visit.months}</p>
                  )}
                  {intel.best_time_to_visit.notes && (
                    <p className="text-sm text-gray-600">{intel.best_time_to_visit.notes}</p>
                  )}
                </div>
              )}

              {/* Budget Estimates */}
              {intel.budget && (
                <div>
                  <h3 className="flex items-center font-bold text-lg mb-3">
                    <DollarSign className="w-5 h-5 mr-2 text-yellow-600" /> Budget Estimates
                  </h3>
                  <div className="space-y-2">
                    {intel.budget.hotel && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Hotel (Avg/Night)</span>
                        <span className="font-medium">${intel.budget.hotel}</span>
                      </div>
                    )}
                    {intel.budget.food && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Food (Daily)</span>
                        <span className="font-medium">${intel.budget.food}</span>
                      </div>
                    )}
                    {intel.budget.activities && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Activities (Daily)</span>
                        <span className="font-medium">${intel.budget.activities}</span>
                      </div>
                    )}
                    <p className="text-xs text-gray-400 mt-2 italic flex items-center">
                      <Info className="w-3 h-3 mr-1" />
                      Estimates based on curated static data.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Map Section */}
          {destination.latitude && destination.longitude && (
            <section className="w-full h-[400px] bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
              <DestinationMap 
                latitude={destination.latitude} 
                longitude={destination.longitude} 
                name={destination.name} 
              />
            </section>
          )}

          {/* Hotels Section */}
          <section>
            <div className="flex items-center space-x-4 mb-8">
              <div className="w-12 h-12 rounded-full bg-[var(--color-vstara-prompt)]/10 flex items-center justify-center">
                <Building className="w-6 h-6 text-[var(--color-vstara-prompt)]" />
              </div>
              <h2 className="text-3xl font-display font-bold">Featured Stays</h2>
            </div>
            
            {hotels.length === 0 ? (
              <p className="text-lg text-[var(--color-vstara-muted)] italic">No hotels listed for this destination yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {hotels.map(hotel => (
                  <div key={hotel.id} className="bg-white rounded-2xl overflow-hidden border border-black/5 hover:shadow-xl transition-shadow group flex flex-col">
                    <div className="h-48 relative overflow-hidden">
                      <img 
                        src={hotel.image_url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop'} 
                        alt={hotel.name}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center space-x-1 shadow-sm">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs font-bold text-black">{hotel.rating}</span>
                      </div>
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-lg text-black truncate">{hotel.name}</h3>
                        <button 
                          onClick={() => {
                            setReviewContext({ hotelId: hotel.id, title: hotel.name });
                            setReviewsModalOpen(true);
                          }}
                          className="text-xs text-[var(--color-vstara-muted)] hover:text-black underline shrink-0 ml-2"
                        >
                          Reviews
                        </button>
                      </div>
                      <p className="text-sm text-[var(--color-vstara-muted)] mb-4 line-clamp-2">
                        {hotel.amenities?.length ? hotel.amenities.join(' • ') : 'Beautiful stay with top amenities.'}
                      </p>
                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase tracking-wider text-[var(--color-vstara-muted)] font-semibold">From</span>
                          <span className="font-bold text-black">${hotel.price_per_night} <span className="font-normal text-sm text-[var(--color-vstara-muted)]">/night</span></span>
                        </div>
                        <button 
                          onClick={() => openBookingModal('hotel', hotel.id, hotel.name, hotel.price_per_night)}
                          className="bg-black text-white text-xs font-semibold px-4 py-2 rounded-full hover:bg-[var(--color-vstara-prompt)] transition-colors"
                        >
                          Book Now
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Tours Section */}
          <section>
            <div className="flex items-center space-x-4 mb-8">
              <div className="w-12 h-12 rounded-full bg-[var(--color-vstara-prompt)]/10 flex items-center justify-center">
                <Compass className="w-6 h-6 text-[var(--color-vstara-prompt)]" />
              </div>
              <h2 className="text-3xl font-display font-bold">Experiences & Tours</h2>
            </div>
            
            {tours.length === 0 ? (
              <p className="text-lg text-[var(--color-vstara-muted)] italic">No tours listed for this destination yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {tours.map(tour => (
                  <div key={tour.id} className="bg-white rounded-2xl overflow-hidden border border-black/5 hover:shadow-xl transition-shadow group flex flex-col">
                    <div className="h-48 relative overflow-hidden">
                      <img 
                        src={tour.image_url || 'https://images.unsplash.com/photo-1527631746610-bca00a040d60?q=80&w=1974&auto=format&fit=crop'} 
                        alt={tour.name}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm">
                        <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-vstara-prompt)]">{tour.category}</span>
                      </div>
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-lg text-black truncate">{tour.name}</h3>
                        <button 
                          onClick={() => {
                            setReviewContext({ tourId: tour.id, title: tour.name });
                            setReviewsModalOpen(true);
                          }}
                          className="text-xs text-[var(--color-vstara-muted)] hover:text-black underline shrink-0 ml-2"
                        >
                          Reviews
                        </button>
                      </div>
                      <p className="text-sm font-medium text-[var(--color-vstara-muted)] mb-3">{tour.duration_hours} Hours</p>
                      <p className="text-sm text-[var(--color-vstara-muted)] mb-4 line-clamp-2">{tour.description}</p>
                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                        <span className="font-bold text-black">${tour.price}</span>
                        <button 
                          onClick={() => navigate(`/experiences/${tour.id}`)}
                          className="bg-black text-white text-xs font-semibold px-4 py-2 rounded-full hover:bg-[var(--color-vstara-prompt)] transition-colors"
                        >
                          Book Now
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

        </div>

        {/* Right Column: Sticky Sidebar for "How to Reach" */}
        <div className="lg:col-span-1">
          <div className="sticky top-28 space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold mb-4 border-b pb-4">How to Reach</h3>
              
              {intel.how_to_reach?.flight && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">{intel.how_to_reach.flight}</p>
                  <button 
                    onClick={() => navigate(`/dashboard/flights?to=${destination.name}`)}
                    className="w-full flex items-center justify-center space-x-2 bg-blue-50 text-blue-700 py-3 rounded-xl font-semibold hover:bg-blue-100 transition"
                  >
                    <Plane className="w-5 h-5" />
                    <span>Search Flights</span>
                  </button>
                </div>
              )}

              {intel.how_to_reach?.bus && (
                <div className="mb-4 pt-4 border-t border-gray-50">
                  <p className="text-sm text-gray-600 mb-2">{intel.how_to_reach.bus}</p>
                  <button 
                    onClick={() => navigate(`/dashboard/buses?to=${destination.name}`)}
                    className="w-full flex items-center justify-center space-x-2 bg-green-50 text-green-700 py-3 rounded-xl font-semibold hover:bg-green-100 transition"
                  >
                    <Bus className="w-5 h-5" />
                    <span>Search Buses</span>
                  </button>
                </div>
              )}

              {intel.how_to_reach?.auto && (
                <div className="mb-4 pt-4 border-t border-gray-50">
                  <p className="text-sm text-gray-600 mb-2">{intel.how_to_reach.auto}</p>
                  <button 
                    onClick={() => navigate(`/dashboard/auto?to=${destination.name}`)}
                    className="w-full flex items-center justify-center space-x-2 bg-orange-50 text-orange-700 py-3 rounded-xl font-semibold hover:bg-orange-100 transition"
                  >
                    <Car className="w-5 h-5" />
                    <span>Book Local Transit</span>
                  </button>
                </div>
              )}

              {/* Fallback if no specific intelligence data is available */}
              {!intel.how_to_reach && (
                <div className="space-y-3">
                  <p className="text-sm text-gray-500 mb-4">Book transportation to this destination.</p>
                  <button onClick={() => navigate(`/dashboard/flights?to=${destination.name}`)} className="w-full flex items-center justify-center space-x-2 border border-gray-200 py-2 rounded-xl text-sm font-medium hover:bg-gray-50">
                    <Plane className="w-4 h-4" /> <span>Flights</span>
                  </button>
                  <button onClick={() => navigate(`/dashboard/buses?to=${destination.name}`)} className="w-full flex items-center justify-center space-x-2 border border-gray-200 py-2 rounded-xl text-sm font-medium hover:bg-gray-50">
                    <Bus className="w-4 h-4" /> <span>Buses</span>
                  </button>
                  <button onClick={() => navigate(`/dashboard/auto?to=${destination.name}`)} className="w-full flex items-center justify-center space-x-2 border border-gray-200 py-2 rounded-xl text-sm font-medium hover:bg-gray-50">
                    <Car className="w-4 h-4" /> <span>Local Transit</span>
                  </button>
                </div>
              )}
            </div>
            
            {/* Promo Card */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 text-white shadow-md">
              <h4 className="font-bold text-lg mb-2">Need a custom plan?</h4>
              <p className="text-blue-100 text-sm mb-4">Let our AI build a day-by-day itinerary tailored just for you.</p>
              <button 
                onClick={() => navigate(`/itineraries/generate?destination=${destination.id}`)}
                className="w-full bg-white text-blue-700 py-2 rounded-xl font-bold text-sm hover:bg-gray-100 transition"
              >
                Generate Itinerary
              </button>
            </div>
          </div>
        </div>
      </div>

      <BookingModal 
        isOpen={modalConfig.isOpen}
        onClose={closeBookingModal}
        type={modalConfig.type}
        itemId={modalConfig.itemId}
        itemName={modalConfig.itemName}
        price={modalConfig.price}
      />

      <ReviewsModal
        isOpen={reviewsModalOpen}
        onClose={() => setReviewsModalOpen(false)}
        hotelId={reviewContext?.hotelId}
        tourId={reviewContext?.tourId}
        title={reviewContext?.title || 'Reviews'}
      />
    </div>
  );
};
