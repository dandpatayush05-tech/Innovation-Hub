import React, { useRef, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Destination } from '../../api/destinations';
import { POPULAR_INDIAN_DESTINATIONS, EnrichedDestination } from '../../data/popularDestinationsIndia';
import { MapPin, ArrowRight, ChevronLeft, ChevronRight, Star, Sparkles } from 'lucide-react';

interface PopularDestinationsCarouselProps {
  apiDestinations?: Destination[];
}

const REGION_FILTERS = [
  'All',
  'Hill Station',
  'Beach',
  'Heritage',
  'Nature',
  'Spiritual'
];

export const PopularDestinationsCarousel: React.FC<PopularDestinationsCarouselProps> = ({ 
  apiDestinations = [] 
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Combine database destinations with the curated 100+ Indian catalog
  const destinations = useMemo(() => {
    const list: EnrichedDestination[] = [...POPULAR_INDIAN_DESTINATIONS];

    apiDestinations.forEach(apiDest => {
      const exists = list.some(d => d.name.toLowerCase() === apiDest.name.toLowerCase());
      if (!exists) {
        list.push({
          ...apiDest,
          country: apiDest.country || 'India',
          state: 'Popular',
          rating: 4.8,
          category: 'Heritage',
          popularFor: 'Iconic Sights & Stays'
        });
      }
    });

    return list;
  }, [apiDestinations]);

  // Filter destinations by category
  const filteredDestinations = useMemo(() => {
    if (selectedCategory === 'All') return destinations;
    return destinations.filter(d => d.category === selectedCategory);
  }, [destinations, selectedCategory]);

  const updateScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -360 : 360;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      setTimeout(updateScrollButtons, 350);
    }
  };

  return (
    <section className="space-y-6">
      
      {/* Header Row with Title, Controls & View All */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[#C84B31] text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5 text-[#C84B31]" />
            <span>100+ Popular Destinations in India</span>
          </div>
          <h2 className="text-3xl font-serif text-[#2A2A2A] tracking-tight">
            Popular Destinations
          </h2>
          <p className="text-sm text-[#2A2A2A]/60 mt-1">
            Explore top-rated travel destinations loved by travelers across India. Scroll right to explore more.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <Link
            to="/destinations"
            className="inline-flex items-center gap-1 text-sm font-bold text-[#C84B31] hover:text-[#A63A25] transition-colors mr-2"
          >
            <span>Explore all 100+ destinations</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          {/* Left / Right Scroll Buttons */}
          <div className="hidden sm:flex items-center gap-1.5">
            <button
              onClick={() => handleScroll('left')}
              disabled={!canScrollLeft}
              aria-label="Scroll left"
              className="w-10 h-10 rounded-full bg-white border border-black/10 hover:border-[#C84B31] flex items-center justify-center text-[#2A2A2A] hover:text-[#C84B31] transition-all shadow-xs disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleScroll('right')}
              disabled={!canScrollRight}
              aria-label="Scroll right"
              className="w-10 h-10 rounded-full bg-white border border-black/10 hover:border-[#C84B31] flex items-center justify-center text-[#2A2A2A] hover:text-[#C84B31] transition-all shadow-xs disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter Category Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 hide-scrollbar">
        {REGION_FILTERS.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer ${
              selectedCategory === cat
                ? 'bg-[#C84B31] text-white shadow-xs'
                : 'bg-white border border-black/10 text-[#2A2A2A]/70 hover:text-[#C84B31] hover:border-[#C84B31]/30'
            }`}
          >
            {cat === 'All' ? 'All Indian Regions' : cat}
          </button>
        ))}
        <span className="text-xs text-[#2A2A2A]/50 ml-auto hidden md:inline font-medium">
          Showing {filteredDestinations.length} popular places
        </span>
      </div>

      {/* Horizontal Carousel */}
      <div
        ref={scrollContainerRef}
        onScroll={updateScrollButtons}
        className="flex gap-6 overflow-x-auto pb-6 pt-2 px-1 scroll-smooth hide-scrollbar snap-x snap-mandatory"
      >
        {filteredDestinations.map((dest) => (
          <Link
            key={dest.id}
            to={`/destinations/${dest.id}`}
            className="group relative rounded-3xl overflow-hidden aspect-[4/5] w-72 sm:w-80 flex-shrink-0 snap-start bg-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1.5 block border border-black/5"
          >
            <img
              src={dest.image_url || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop'}
              alt={dest.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/10" />

            {/* Top Badges */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
              <span className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[#2A2A2A] text-xs font-bold shadow-xs">
                {dest.state ? `${dest.name}, ${dest.state}` : dest.country || 'India'}
              </span>

              {dest.rating && (
                <div className="bg-black/50 backdrop-blur-md text-yellow-300 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                  <Star className="w-3 h-3 fill-current" />
                  <span>{dest.rating}</span>
                </div>
              )}
            </div>

            {/* Bottom Card Content */}
            <div className="absolute bottom-0 left-0 right-0 p-6 space-y-1.5 text-white">
              {dest.popularFor && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-orange-300 block">
                  {dest.popularFor}
                </span>
              )}
              <h3 className="text-white font-serif text-2xl sm:text-3xl font-semibold group-hover:text-orange-200 transition-colors">
                {dest.name}
              </h3>
              <p className="text-white/80 text-xs line-clamp-2 leading-relaxed font-normal">
                {dest.description || 'Experience stunning landscapes, local heritage, and memorable stays.'}
              </p>
              
              <div className="flex items-center text-xs font-bold text-white/95 gap-1.5 pt-2 group-hover:text-orange-300 transition-colors">
                <span>Explore Stays & Tours</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        ))}
      </div>

    </section>
  );
};
