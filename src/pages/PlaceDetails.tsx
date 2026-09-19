import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPlace, Place } from '../api/places';
import { getNearbyHotels, Hotel } from '../api/hotels';
import { MapPin, ArrowLeft, Star, Filter } from 'lucide-react';
import { HotelCard } from '../components/cards/HotelCard';
import { BookingModal, BookingType } from '../components/BookingModal';
import { ReviewsModal } from '../components/ReviewsModal';
import debounce from 'lodash.debounce';

export const PlaceDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [place, setPlace] = useState<Place | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Hotels state
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [hotelsLoading, setHotelsLoading] = useState(false);
  const [minPrice, setMinPrice] = useState<number | ''>('');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');
  const [minRating, setMinRating] = useState<number | ''>('');

  const [modalConfig, setModalConfig] = useState<{ isOpen: boolean; type: BookingType; itemId: string; itemName: string; price: number }>({
    isOpen: false,
    type: 'hotel',
    itemId: '',
    itemName: '',
    price: 0
  });

  const [reviewsModalOpen, setReviewsModalOpen] = useState(false);
  const [reviewContext, setReviewContext] = useState<{ hotelId?: string; title: string } | null>(null);

  useEffect(() => {
    if (id) {
      fetchPlace(id);
    }
  }, [id]);

  const fetchPlace = async (placeId: string) => {
    try {
      setLoading(true);
      const res = await getPlace(placeId);
      setPlace(res.data);
      if (res.data.latitude && res.data.longitude) {
        fetchNearbyHotels(res.data.latitude, res.data.longitude, minPrice, maxPrice, minRating);
      }
    } catch (err) {
      console.error('Failed to fetch place:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchNearbyHotels = async (lat: number, lng: number, minP: number | '', maxP: number | '', minR: number | '') => {
    try {
      setHotelsLoading(true);
      const params: any = { latitude: lat, longitude: lng, radius: 10 };
      if (minP !== '') params.minPrice = minP;
      if (maxP !== '') params.maxPrice = maxP;
      if (minR !== '') params.rating = minR;
      
      const res = await getNearbyHotels(params);
      setHotels(res.data || []);
    } catch (err) {
      console.error('Failed to fetch nearby hotels:', err);
    } finally {
      setHotelsLoading(false);
    }
  };

  const debouncedFetchHotels = useCallback(
    debounce((lat: number, lng: number, minP: number | '', maxP: number | '', minR: number | '') => {
      fetchNearbyHotels(lat, lng, minP, maxP, minR);
    }, 500),
    []
  );

  useEffect(() => {
    if (place?.latitude && place?.longitude) {
      debouncedFetchHotels(place.latitude, place.longitude, minPrice, maxPrice, minRating);
    }
  }, [minPrice, maxPrice, minRating]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] font-sans pb-24 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!place) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center">
        <h2 className="text-3xl font-medium mb-4">Attraction not found</h2>
        <button onClick={() => navigate(-1)} className="text-blue-600 underline">Go Back</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans pb-24 pt-24">
      <div className="max-w-[1360px] mx-auto px-6">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-black mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          <span className="font-semibold tracking-wider text-sm">Back</span>
        </button>

        <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 mb-12">
          <div className="h-64 md:h-96 w-full relative">
            <img 
              src={place.image_url || 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?q=80&w=1952&auto=format&fit=crop'} 
              alt={place.name}
              className="w-full h-full object-cover"
            />
            {place.rating && (
              <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-full flex items-center space-x-2 shadow-sm">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span className="font-bold text-black">{place.rating}</span>
              </div>
            )}
            <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
              <span className="font-bold uppercase tracking-wider text-[var(--color-vstara-prompt)]">{place.category}</span>
            </div>
          </div>
          
          <div className="p-8 md:p-12">
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4 text-black">{place.name}</h1>
            <div className="flex items-center text-gray-600 mb-8 pb-8 border-b border-gray-100">
              <MapPin className="w-5 h-5 mr-2" />
              <span className="text-lg">{place.address}</span>
            </div>
            <div className="prose max-w-none text-gray-700 text-lg leading-relaxed">
              {place.description || 'No description available for this attraction.'}
            </div>
          </div>
        </div>

        {/* Hotels Nearby Section */}
        {place.latitude && place.longitude && (
          <section className="mb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
              <h2 className="text-3xl font-display font-bold">Hotels Nearby</h2>
              
              {/* Filters */}
              <div className="flex flex-wrap items-center gap-3 bg-white p-3 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center text-gray-500 mr-2">
                  <Filter className="w-4 h-4 mr-2" />
                  <span className="text-sm font-semibold">Filters</span>
                </div>
                <input 
                  type="number" 
                  placeholder="Min $" 
                  className="w-20 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500"
                  value={minPrice}
                  onChange={e => setMinPrice(e.target.value ? Number(e.target.value) : '')}
                />
                <input 
                  type="number" 
                  placeholder="Max $" 
                  className="w-20 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500"
                  value={maxPrice}
                  onChange={e => setMaxPrice(e.target.value ? Number(e.target.value) : '')}
                />
                <select 
                  className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500"
                  value={minRating}
                  onChange={e => setMinRating(e.target.value ? Number(e.target.value) : '')}
                >
                  <option value="">Any Rating</option>
                  <option value="3">3+ Stars</option>
                  <option value="4">4+ Stars</option>
                  <option value="4.5">4.5+ Stars</option>
                </select>
              </div>
            </div>

            {hotelsLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
              </div>
            ) : hotels.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {hotels.map(hotel => (
                  <HotelCard 
                    key={hotel.id} 
                    hotel={hotel} 
                    onBook={(h) => setModalConfig({ isOpen: true, type: 'hotel', itemId: h.id, itemName: h.name, price: h.price_per_night })}
                    onReviews={(hid, name) => { setReviewContext({ hotelId: hid, title: name }); setReviewsModalOpen(true); }}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-3xl border border-gray-100">
                <p className="text-gray-500 text-lg">No hotels found nearby matching your criteria.</p>
              </div>
            )}
          </section>
        )}
      </div>

      <BookingModal 
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
        type={modalConfig.type}
        itemId={modalConfig.itemId}
        itemName={modalConfig.itemName}
        price={modalConfig.price}
      />

      <ReviewsModal
        isOpen={reviewsModalOpen}
        onClose={() => setReviewsModalOpen(false)}
        hotelId={reviewContext?.hotelId}
        title={reviewContext?.title || 'Reviews'}
      />
    </div>
  );
};
