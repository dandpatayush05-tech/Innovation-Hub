import { Star, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Place } from '../../api/places';

interface PlaceCardProps {
  place: Place;
}

export const PlaceCard = ({ place }: PlaceCardProps) => {
  return (
    <Link to={`/places/${place.id}`} className="bg-white rounded-2xl overflow-hidden border border-black/5 hover:shadow-xl transition-shadow group flex flex-col">
      <div className="h-48 relative overflow-hidden">
        <img 
          src={place.image_url || 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?q=80&w=1952&auto=format&fit=crop'} 
          alt={place.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {place.rating && (
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center space-x-1 shadow-sm">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span className="text-xs font-bold text-black">{place.rating}</span>
          </div>
        )}
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-vstara-prompt)]">{place.category}</span>
        </div>
      </div>
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-semibold text-lg text-black truncate mb-2">{place.name}</h3>
        <p className="text-sm text-[var(--color-vstara-muted)] mb-4 line-clamp-2">{place.description}</p>
        
        <div className="mt-auto pt-4 border-t border-gray-50 flex items-center text-sm text-[var(--color-vstara-muted)]">
          <MapPin className="w-4 h-4 mr-1 shrink-0" />
          <span className="truncate">{place.address}</span>
        </div>
      </div>
    </Link>
  );
};
