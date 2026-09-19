import { Star } from 'lucide-react';
import type { Hotel } from '../../api/hotels';

interface HotelCardProps {
  hotel: Hotel;
  onBook: (hotel: Hotel) => void;
  onReviews: (hotelId: string, hotelName: string) => void;
}

export const HotelCard = ({ hotel, onBook, onReviews }: HotelCardProps) => {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-black/5 hover:shadow-xl transition-shadow group flex flex-col">
      <div className="h-48 relative overflow-hidden">
        <img 
          src={hotel.image_url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop'} 
          alt={hotel.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {hotel.rating && (
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center space-x-1 shadow-sm">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span className="text-xs font-bold text-black">{hotel.rating}</span>
          </div>
        )}
        {hotel.distance_km !== undefined && (
          <div className="absolute top-4 left-4 bg-blue-600/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center shadow-sm">
            <span className="text-xs font-bold text-white">{hotel.distance_km.toFixed(1)} km away</span>
          </div>
        )}
      </div>
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-semibold text-lg text-black truncate">{hotel.name}</h3>
          <button 
            onClick={() => onReviews(hotel.id, hotel.name)}
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
            onClick={() => onBook(hotel)}
            className="bg-black text-white text-xs font-semibold px-4 py-2 rounded-full hover:bg-[var(--color-vstara-prompt)] transition-colors"
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
};
