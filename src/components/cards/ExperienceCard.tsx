import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tour } from '../../types/tour';
import { Clock, MapPin, Star, ShieldCheck, ShoppingCart, Check, ArrowRight } from 'lucide-react';
import { useTripCart } from '../../context/TripCartContext';
import { useToast } from '../../context/ToastContext';

export interface ExperienceCardProps {
  experience: Tour & {
    locationName?: string;
    rating?: number;
    reviewCount?: number;
    highlights?: string[];
  };
  onSelect?: (id: string) => void;
}

export const ExperienceCard: React.FC<ExperienceCardProps> = ({ experience, onSelect }) => {
  const navigate = useNavigate();
  const { addItem } = useTripCart();
  const { success } = useToast();
  const [isAdded, setIsAdded] = useState(false);

  const handleCardClick = () => {
    if (onSelect) {
      onSelect(experience.id);
    } else {
      navigate(`/experiences/${experience.id}`);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem({
      type: 'experience',
      title: experience.name,
      subtitle: `${experience.category} • ${experience.duration_hours} hrs • ${experience.locationName || 'Local Experience'}`,
      price: experience.price,
      quantity: 1,
      details: {
        experienceId: experience.id,
        location: experience.locationName,
        duration: experience.duration_hours,
        image_url: experience.image_url
      }
    });

    setIsAdded(true);
    success(`"${experience.name}" added to Trip Cart!`);
    setTimeout(() => setIsAdded(false), 2500);
  };

  const formattedPrice = typeof experience.price === 'number' 
    ? `₹${experience.price.toLocaleString('en-IN')}` 
    : `₹${experience.price}`;

  return (
    <div
      onClick={handleCardClick}
      className="group glass-card rounded-3xl overflow-hidden flex flex-col justify-between cursor-pointer transform hover:-translate-y-1.5"
    >
      <div>
        {/* Cover Photo with floating Category & Price Badges */}
        <div className="relative h-56 sm:h-60 overflow-hidden bg-gray-100">
          <img
            src={experience.image_url || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop'}
            alt={experience.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />

          {/* Top badges */}
          <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between pointer-events-none">
            <span className="glass-badge-light px-3 py-1 rounded-full text-xs font-bold text-[#C84B31] shadow-xs">
              {experience.category || 'Experience'}
            </span>
            <div className="glass-badge-dark text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-xs">
              <span>From {formattedPrice}</span>
              <span className="text-[10px] text-white/70 font-normal">/ person</span>
            </div>
          </div>

          {/* Bottom location & rating overlay */}
          <div className="absolute bottom-3 left-3.5 right-3.5 flex items-center justify-between text-white text-xs pointer-events-none">
            <div className="flex items-center gap-1 bg-black/45 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10">
              <MapPin className="w-3.5 h-3.5 text-orange-400 shrink-0" />
              <span className="truncate max-w-[150px] sm:max-w-[180px]">
                {experience.locationName || 'India'}
              </span>
            </div>

            <div className="flex items-center gap-1 bg-black/45 backdrop-blur-md px-2 py-1 rounded-lg font-bold text-yellow-300 border border-white/10">
              <Star className="w-3.5 h-3.5 fill-current shrink-0" />
              <span>{experience.rating || 4.9}</span>
              <span className="text-white/60 text-[10px] font-normal">
                ({experience.reviewCount || 88})
              </span>
            </div>
          </div>
        </div>

        {/* Content Details */}
        <div className="p-5 sm:p-6 space-y-3">
          <h3 className="font-serif text-lg sm:text-xl font-semibold text-[#2A2A2A] group-hover:text-[#C84B31] transition-colors line-clamp-1">
            {experience.name}
          </h3>

          <p className="text-xs text-[#2A2A2A]/70 line-clamp-2 leading-relaxed">
            {experience.description}
          </p>

          <div className="flex items-center justify-between text-xs text-[#2A2A2A]/60 pt-2 border-t border-black/5">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#C84B31]" />
              <span>{experience.duration_hours} {experience.duration_hours === 1 ? 'hr' : 'hrs'}</span>
            </div>
            <div className="flex items-center gap-1 text-emerald-700 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Instant Confirmation</span>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Button Actions */}
      <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-1 flex items-center gap-2.5">
        <button
          type="button"
          onClick={handleAddToCart}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs ${
            isAdded
              ? 'bg-emerald-600 text-white'
              : 'bg-white/80 hover:bg-orange-50/80 text-[#C84B31] border border-[#C84B31]/30 hover:border-[#C84B31] backdrop-blur-sm'
          }`}
          title="Add to Trip Cart"
        >
          {isAdded ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Added</span>
            </>
          ) : (
            <>
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Add to Cart</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleCardClick();
          }}
          className="bg-[#2A2A2A]/95 hover:bg-[#C84B31] text-white py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-xs"
        >
          <span>View Details</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
