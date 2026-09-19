import type { Tour } from '../../api/tours';

interface TourCardProps {
  tour: Tour;
  onBook: (tour: Tour) => void;
  onReviews: (tourId: string, tourName: string) => void;
}

export const TourCard = ({ tour, onBook, onReviews }: TourCardProps) => {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-black/5 hover:shadow-xl transition-shadow group flex flex-col">
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
            onClick={() => onReviews(tour.id, tour.name)}
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
            onClick={() => onBook(tour)}
            className="bg-black text-white text-xs font-semibold px-4 py-2 rounded-full hover:bg-[var(--color-vstara-prompt)] transition-colors"
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
};
