import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  MapPin, ArrowLeft, Heart, Info,
  Compass, Calendar, DollarSign,
  CloudRain, Sun, Wind, Thermometer, Cloud
} from 'lucide-react';
import { 
  getDestination, 
  getDestinationDetail,
  getNearbyDestinations,
  getDestinationWeather,
  getDestinationTransport
} from '../api/destinations';
import type { Destination } from '../api/destinations';
import { DestinationMap } from '../components/DestinationMap';
import { ErrorState } from '../components/states/ErrorState';
import { HotelCard } from '../components/cards/HotelCard';
import { TourCard } from '../components/cards/TourCard';
import { PlaceCard } from '../components/cards/PlaceCard';
import { NearbyCard } from '../components/cards/NearbyCard';
import { BookingModal } from '../components/BookingModal';
import type { BookingType } from '../components/BookingModal';
import { ReviewsModal } from '../components/ReviewsModal';
import type { Hotel } from '../api/hotels';
import type { Tour } from '../api/tours';
import type { Place } from '../api/places';

const TABS = [
  'Overview', 
  'Attractions', 
  'Hotels', 
  'Tours', 
  'Restaurants', 
  'Shops', 
  'Nearby', 
  'Transport', 
  'Weather', 
  'Best Time'
];

export const DestinationDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [destination, setDestination] = useState<Destination | null>(null);
  const [detail, setDetail] = useState<any>(null);
  const [nearby, setNearby] = useState<any[]>([]);
  
  const [weather, setWeather] = useState<any>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState<unknown>(null);
  
  const [transport, setTransport] = useState<any>(null);
  const [transportLoading, setTransportLoading] = useState(false);
  const [transportError, setTransportError] = useState<unknown>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [saved, setSaved] = useState(false);
  
  const [activeTab, setActiveTab] = useState('Overview');

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
        const [destRes, detailRes, nearbyRes] = await Promise.all([
          getDestination(id),
          getDestinationDetail(id).catch(err => {
            console.error('Failed to fetch detail:', err);
            return { data: null };
          }),
          getNearbyDestinations(id, 200).catch(err => {
            console.error('Failed to fetch nearby destinations:', err);
            return { data: [] };
          })
        ]);
        
        setDestination(destRes.data);
        setDetail(detailRes?.data || null);
        setNearby(nearbyRes?.data || nearbyRes || []);
      } catch (err) {
        console.error('Failed to fetch destination details:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

  useEffect(() => {
    if (activeTab === 'Weather' && !weather && id) {
      const fetchWeather = async () => {
        setWeatherLoading(true);
        setWeatherError(null);
        try {
          const res = await getDestinationWeather(id);
          setWeather(res?.data || res);
        } catch (err) {
          console.error('Failed to fetch weather:', err);
          setWeatherError(err);
        } finally {
          setWeatherLoading(false);
        }
      };
      fetchWeather();
    }
  }, [activeTab, id, weather]);

  useEffect(() => {
    if (activeTab === 'Transport' && !transport && id) {
      const fetchTransport = async () => {
        setTransportLoading(true);
        setTransportError(null);
        try {
          const res = await getDestinationTransport(id);
          setTransport(res?.data || res);
        } catch (err) {
          console.error('Failed to fetch transport:', err);
          setTransportError(err);
        } finally {
          setTransportLoading(false);
        }
      };
      fetchTransport();
    }
  }, [activeTab, id, transport]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] font-sans pb-24">
        <div className="h-[65vh] min-h-[500px] w-full bg-gray-200 animate-pulse" />
        <div className="max-w-[1360px] mx-auto px-6 pt-16">
          <div className="h-12 w-full bg-gray-200 animate-pulse rounded-full mb-8" />
          <div className="bg-gray-100 rounded-3xl h-96 w-full animate-pulse" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] font-sans pb-24 flex items-center justify-center">
        <ErrorState error={error} onRetry={() => window.location.reload()} />
      </div>
    );
  }

  if (!destination) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center">
        <h2 className="text-3xl font-medium mb-4">Destination not found</h2>
        <Link to="/destinations" className="text-blue-600 underline">Return to destinations</Link>
      </div>
    );
  }

  const overview = detail?.overview || destination.intelligence_data || {};

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
            
            {/* Quick Actions (Create Itinerary & Save) */}
            <div className="flex flex-wrap items-center gap-4">
              <button 
                onClick={() => navigate(`/itineraries/generate?destination=${encodeURIComponent(destination.name)}`)}
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

      <div className="max-w-[1360px] mx-auto px-6 pt-12">
        {/* Tab Navigation */}
        <div className="flex overflow-x-auto hide-scrollbar gap-2 mb-8 pb-4 border-b border-gray-200">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 rounded-full font-medium whitespace-nowrap transition-colors ${
                activeTab === tab 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content Area */}
        <div className="min-h-[400px]">
          {activeTab === 'Overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2 space-y-12">
                <section className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                  <h2 className="text-2xl font-display font-bold mb-6">Destination Overview</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Where to Go */}
                    {overview.where_to_go && overview.where_to_go.length > 0 && (
                      <div>
                        <h3 className="flex items-center font-bold text-lg mb-3">
                          <MapPin className="w-5 h-5 mr-2 text-blue-600" /> Where to Go
                        </h3>
                        <ul className="list-disc list-inside text-gray-700 space-y-1 ml-2">
                          {overview.where_to_go.map((item: string, idx: number) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* What to Do */}
                    {overview.what_to_do && overview.what_to_do.length > 0 && (
                      <div>
                        <h3 className="flex items-center font-bold text-lg mb-3">
                          <Compass className="w-5 h-5 mr-2 text-green-600" /> What to Do
                        </h3>
                        <ul className="list-disc list-inside text-gray-700 space-y-1 ml-2">
                          {overview.what_to_do.map((item: string, idx: number) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8 pt-8 border-t border-gray-100">
                    {/* Best Time */}
                    {overview.best_time_to_visit && (
                      <div>
                        <h3 className="flex items-center font-bold text-lg mb-3">
                          <Calendar className="w-5 h-5 mr-2 text-orange-500" /> Best Time to Visit
                        </h3>
                        {overview.best_time_to_visit.months && (
                          <p className="font-semibold text-gray-800 mb-1">{overview.best_time_to_visit.months}</p>
                        )}
                        {overview.best_time_to_visit.notes && (
                          <p className="text-sm text-gray-600">{overview.best_time_to_visit.notes}</p>
                        )}
                      </div>
                    )}

                    {/* Budget Estimates */}
                    {overview.budget && (
                      <div>
                        <h3 className="flex items-center font-bold text-lg mb-3">
                          <DollarSign className="w-5 h-5 mr-2 text-yellow-600" /> Budget Estimates
                        </h3>
                        <div className="space-y-2">
                          {overview.budget.hotel && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Hotel (Avg/Night)</span>
                              <span className="font-medium">${overview.budget.hotel}</span>
                            </div>
                          )}
                          {overview.budget.food && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Food (Daily)</span>
                              <span className="font-medium">${overview.budget.food}</span>
                            </div>
                          )}
                          {overview.budget.activities && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Activities (Daily)</span>
                              <span className="font-medium">${overview.budget.activities}</span>
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
              </div>

              <div className="lg:col-span-1 space-y-6">
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
              </div>
            </div>
          )}

          {activeTab === 'Attractions' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {detail?.attractions?.length ? (
                detail.attractions.map((place: Place) => <PlaceCard key={place.id} place={place} />)
              ) : (
                <p className="col-span-full text-center text-gray-500 py-12">No attractions found for this destination.</p>
              )}
            </div>
          )}

          {activeTab === 'Hotels' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {detail?.hotels?.length ? (
                detail.hotels.map((hotel: Hotel) => (
                  <HotelCard 
                    key={hotel.id} 
                    hotel={hotel} 
                    onBook={(h) => openBookingModal('hotel', h.id, h.name, h.price_per_night)}
                    onReviews={(id, name) => { setReviewContext({ hotelId: id, title: name }); setReviewsModalOpen(true); }}
                  />
                ))
              ) : (
                <p className="col-span-full text-center text-gray-500 py-12">No hotels found for this destination.</p>
              )}
            </div>
          )}

          {activeTab === 'Tours' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {detail?.tours?.length ? (
                detail.tours.map((tour: Tour) => (
                  <TourCard 
                    key={tour.id} 
                    tour={tour} 
                    onBook={(t) => openBookingModal('tour', t.id, t.name, t.price)}
                    onReviews={(id, name) => { setReviewContext({ tourId: id, title: name }); setReviewsModalOpen(true); }}
                  />
                ))
              ) : (
                <p className="col-span-full text-center text-gray-500 py-12">No tours found for this destination.</p>
              )}
            </div>
          )}

          {activeTab === 'Restaurants' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {detail?.restaurants?.length ? (
                detail.restaurants.map((place: Place) => <PlaceCard key={place.id} place={place} />)
              ) : (
                <p className="col-span-full text-center text-gray-500 py-12">No restaurants found for this destination.</p>
              )}
            </div>
          )}

          {activeTab === 'Shops' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {detail?.shops?.length ? (
                detail.shops.map((place: Place) => <PlaceCard key={place.id} place={place} />)
              ) : (
                <p className="col-span-full text-center text-gray-500 py-12">No shops found for this destination.</p>
              )}
            </div>
          )}

          {activeTab === 'Nearby' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {nearby?.length ? (
                nearby.map((dest: any) => <NearbyCard key={dest.id} destination={dest} />)
              ) : (
                <p className="col-span-full text-center text-gray-500 py-12">No nearby destinations found.</p>
              )}
            </div>
          )}

          {activeTab === 'Weather' && (
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <h2 className="text-2xl font-display font-bold mb-6">Current Weather & Forecast</h2>
              
              {weatherLoading && (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mb-4" />
                  <p className="text-gray-500">Checking local weather stations...</p>
                </div>
              )}
              
              {weatherError && !weatherLoading && (
                <ErrorState 
                  error={new Error("We couldn't reach the weather service right now. Please try again later.")}
                  onRetry={() => {
                    setWeatherError(null);
                    setWeatherLoading(true);
                    getDestinationWeather(id!).then(res => setWeather(res?.data || res)).catch(err => setWeatherError(err)).finally(() => setWeatherLoading(false));
                  }}
                />
              )}
              
              {weather && !weatherLoading && (
                <div>
                  <div className="flex flex-col md:flex-row items-center md:items-start justify-between bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl mb-8">
                    <div className="flex items-center space-x-6 mb-4 md:mb-0">
                      <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm">
                        {weather.current?.condition?.toLowerCase().includes('rain') ? (
                          <CloudRain className="w-10 h-10 text-blue-500" />
                        ) : weather.current?.condition?.toLowerCase().includes('cloud') ? (
                          <Cloud className="w-10 h-10 text-gray-400" />
                        ) : (
                          <Sun className="w-10 h-10 text-yellow-500" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-4xl font-bold text-gray-800">{weather.current?.temperature}°C</h3>
                        <p className="text-lg text-gray-600">{weather.current?.condition || 'Clear'}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 bg-white p-4 rounded-xl shadow-sm">
                      <div className="flex items-center">
                        <Thermometer className="w-4 h-4 mr-2 text-red-400" />
                        <span>Feels like: {weather.current?.feels_like || weather.current?.temperature}°C</span>
                      </div>
                      <div className="flex items-center">
                        <Wind className="w-4 h-4 mr-2 text-blue-400" />
                        <span>Wind: {weather.current?.wind_speed || '5'} km/h</span>
                      </div>
                      <div className="flex items-center">
                        <CloudRain className="w-4 h-4 mr-2 text-blue-500" />
                        <span>Humidity: {weather.current?.humidity || '45'}%</span>
                      </div>
                    </div>
                  </div>
                  
                  {weather.forecast && weather.forecast.length > 0 && (
                    <div>
                      <h3 className="font-bold text-lg mb-4">5-Day Forecast</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                        {weather.forecast.map((day: any, idx: number) => (
                          <div key={idx} className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100 hover:shadow-md transition-shadow">
                            <p className="font-medium text-gray-800 mb-2">{day.date || day.day}</p>
                            <div className="flex justify-center mb-2">
                              {day.condition?.toLowerCase().includes('rain') ? (
                                <CloudRain className="w-6 h-6 text-blue-500" />
                              ) : day.condition?.toLowerCase().includes('cloud') ? (
                                <Cloud className="w-6 h-6 text-gray-400" />
                              ) : (
                                <Sun className="w-6 h-6 text-yellow-500" />
                              )}
                            </div>
                            <p className="font-bold text-gray-800">{day.high}° <span className="text-gray-400 font-normal">{day.low}°</span></p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'Best Time' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 h-full flex flex-col justify-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-6">
                  <Calendar className="w-8 h-8 text-orange-500" />
                </div>
                <h2 className="text-3xl font-display font-bold mb-4">Best Time to Visit</h2>
                <p className="text-2xl font-medium text-gray-800 mb-4">{detail?.overview?.best_time_to_visit?.months || 'Year-round'}</p>
                <p className="text-gray-600 text-lg leading-relaxed">
                  {detail?.overview?.best_time_to_visit?.notes || 'This destination offers different experiences depending on when you choose to visit.'}
                </p>
              </div>
              
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 h-full flex flex-col justify-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                  <Sun className="w-8 h-8 text-blue-500" />
                </div>
                <h2 className="text-2xl font-display font-bold mb-4">Climate Notes</h2>
                <p className="text-gray-600 text-lg leading-relaxed">
                  {detail?.overview?.climate_notes || 'Pleasant weather most of the year. Pack layers to be prepared for varying temperatures.'}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'Transport' && (
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <h2 className="text-2xl font-display font-bold mb-6">Transport Options</h2>
              
              {transportLoading && (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mb-4" />
                  <p className="text-gray-500">Finding best routes...</p>
                </div>
              )}
              
              {transportError && !transportLoading && (
                <ErrorState 
                  error={transportError}
                  onRetry={() => {
                    setTransportError(null);
                    setTransportLoading(true);
                    getDestinationTransport(id!).then(res => setTransport(res?.data || res)).catch(err => setTransportError(err)).finally(() => setTransportLoading(false));
                  }}
                />
              )}
              
              {transport && !transportLoading && (
                <div className="space-y-8">
                  {/* Flights */}
                  <div>
                    <h3 className="text-xl font-bold mb-4 border-b border-gray-100 pb-2">Flights</h3>
                    {transport.flights && transport.flights.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {transport.flights.map((flight: any) => (
                          <div key={flight.id} className="border border-gray-100 rounded-2xl p-4 hover:shadow-md transition bg-gray-50/50">
                            <div className="flex justify-between items-start mb-2">
                              <span className="font-bold text-lg">{flight.airline}</span>
                              <span className="font-bold text-blue-600">${flight.price}</span>
                            </div>
                            <div className="text-sm text-gray-600 space-y-1">
                              <p>From: {flight.departure_airport} To: {flight.arrival_airport}</p>
                              <p>Duration: {flight.duration}</p>
                            </div>
                            <button 
                              onClick={() => navigate('/flights')}
                              className="mt-4 w-full bg-white border border-gray-200 text-sm font-bold py-2 rounded-xl hover:bg-gray-50"
                            >
                              Search Flights
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No flight information available.</p>
                    )}
                  </div>

                  {/* Buses */}
                  <div>
                    <h3 className="text-xl font-bold mb-4 border-b border-gray-100 pb-2">Buses</h3>
                    {transport.buses && transport.buses.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {transport.buses.map((bus: any) => (
                          <div key={bus.id} className="border border-gray-100 rounded-2xl p-4 hover:shadow-md transition bg-gray-50/50">
                            <div className="flex justify-between items-start mb-2">
                              <span className="font-bold text-lg">{bus.operator}</span>
                              <span className="font-bold text-green-600">${bus.price}</span>
                            </div>
                            <div className="text-sm text-gray-600 space-y-1">
                              <p>Type: {bus.bus_type}</p>
                              <p>Duration: {bus.duration}</p>
                            </div>
                            <button 
                              onClick={() => navigate('/buses')}
                              className="mt-4 w-full bg-white border border-gray-200 text-sm font-bold py-2 rounded-xl hover:bg-gray-50"
                            >
                              Search Buses
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No bus information available.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
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
