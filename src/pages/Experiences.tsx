import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { getTours, Tour } from '../api/tours';
import { MOCK_EXPERIENCES, EnrichedTour } from '../data/mockExperiences';
import { 
  Search, MapPin, ArrowLeft, 
  Sparkles, Compass, ShoppingCart, X, RotateCcw
} from 'lucide-react';
import { useTripCart } from '../context/TripCartContext';
import { useAuth } from '../context/AuthContext';
import { ExperienceCard } from '../components/cards/ExperienceCard';
import { ExperienceCardSkeleton } from '../components/skeletons/ExperienceCardSkeleton';
import { PlacesVisitedSection } from '../components/sections/PlacesVisitedSection';

const CATEGORIES = [
  'All',
  'Heritage',
  'Temple',
  'Nature',
  'Adventure',
  'Beach',
  'Cultural',
  'Food Tours',
  'Local Sightseeing',
  'Photography',
  'Family'
];

const SUGGESTED_SHORTCUTS = ['Heritage', 'Adventure', 'Food Tours', 'Beach'];

export const Experiences: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { itemCount, setIsCartOpen } = useTripCart();

  // Filter state synced with URL search params if present
  const initialCategory = searchParams.get('category') || 'All';
  const initialSearch = searchParams.get('q') || '';

  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured');
  
  const [apiExperiences, setApiExperiences] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);

  // Sync state to URL params cleanly
  const updateParams = useCallback((cat: string, query: string) => {
    const next: Record<string, string> = {};
    if (cat && cat !== 'All') next.category = cat;
    if (query.trim()) next.q = query.trim();
    setSearchParams(next, { replace: true });
  }, [setSearchParams]);

  // Combined data fetching driven by both category and search query
  const fetchExperiences = useCallback(async (cat: string, query: string) => {
    try {
      setLoading(true);
      const categoryFilter = cat !== 'All' ? cat.toLowerCase() : undefined;
      const res = await getTours({ 
        limit: 50, 
        category: categoryFilter, 
        search: query.trim() || undefined 
      });
      setApiExperiences(res.data || []);
    } catch (error) {
      console.error('Failed to fetch experiences:', error);
      setApiExperiences([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExperiences(selectedCategory, searchTerm);
    updateParams(selectedCategory, searchTerm);
  }, [selectedCategory, searchTerm, fetchExperiences, updateParams]);

  // Merge database tours with enriched catalog to guarantee comprehensive coverage
  const allExperiences = useMemo(() => {
    const list: EnrichedTour[] = [...MOCK_EXPERIENCES];
    
    apiExperiences.forEach(apiTour => {
      const existingIdx = list.findIndex(m => m.id === apiTour.id);
      if (existingIdx === -1) {
        list.push({
          ...apiTour,
          rating: 4.8,
          reviewCount: 42,
          locationName: 'India',
          highlights: ['Certified guide', 'Authentic cultural insight', 'Photo stops'],
          included: ['Licensed guide', 'Entry permits']
        });
      }
    });

    return list;
  }, [apiExperiences]);

  // Single unified filter and sort pipeline
  const filteredExperiences = useMemo(() => {
    let result = allExperiences.filter(exp => {
      const matchesCategory = 
        selectedCategory === 'All' || 
        exp.category?.toLowerCase() === selectedCategory.toLowerCase();

      const q = searchTerm.trim().toLowerCase();
      const matchesSearch = 
        !q || 
        exp.name?.toLowerCase().includes(q) ||
        exp.description?.toLowerCase().includes(q) ||
        exp.category?.toLowerCase().includes(q) ||
        exp.locationName?.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });

    if (sortBy === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    return result;
  }, [allExperiences, selectedCategory, searchTerm, sortBy]);

  const handleClearFilters = () => {
    setSelectedCategory('All');
    setSearchTerm('');
    setSortBy('featured');
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen glass-base-bg font-sans flex flex-col text-[#2A2A2A] relative overflow-x-hidden">
      
      {/* Subtle Ambient Light & Glowing Orbs in Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0" aria-hidden="true">
        <div className="absolute top-[-10%] left-[-5%] w-[45vw] h-[45vw] rounded-full bg-[#C84B31]/[0.035] blur-[100px]" />
        <div className="absolute top-[30%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#F59E0B]/[0.04] blur-[120px]" />
        <div className="absolute bottom-[10%] left-[20%] w-[40vw] h-[40vw] rounded-full bg-[#C84B31]/[0.025] blur-[110px]" />
      </div>
      
      {/* 1. TOP APP BAR / NAVIGATION */}
      <header className="sticky top-0 z-40 glass-nav">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          
          {/* Back Button & Brand */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              aria-label="Go Back"
              className="group inline-flex items-center gap-2 px-3.5 py-2 rounded-full glass-pill text-[#2A2A2A] hover:bg-[#2A2A2A] hover:text-white transition-all shadow-xs font-medium text-sm cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              <span className="hidden sm:inline">Back</span>
            </button>

            <Link to="/" className="flex items-center space-x-2 text-[#2A2A2A] hover:opacity-80 transition-opacity no-underline">
              <MapPin className="w-6 h-6 text-[#C84B31]" />
              <span className="font-display text-2xl text-black leading-none select-none">Yatra Setu</span>
            </Link>
          </div>

          {/* Quick Actions (Dashboard, Trip Cart) */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                if (user) {
                  navigate('/dashboard');
                } else {
                  navigate('/login', { state: { from: { pathname: '/dashboard' } } });
                }
              }}
              className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#2A2A2A]/70 hover:text-[#C84B31] transition-colors px-3 py-2 bg-transparent border-none cursor-pointer"
            >
              Dashboard
            </button>
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 rounded-full glass-pill hover:border-[#C84B31]/40 text-[#2A2A2A] transition-all shadow-xs cursor-pointer flex items-center gap-2 text-xs font-bold"
            >
              <ShoppingCart className="w-4 h-4 text-[#C84B31]" />
              <span className="hidden md:inline">Trip Cart</span>
              {itemCount > 0 && (
                <span className="bg-[#C84B31] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center -ml-1 shadow-xs">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* 2. HERO HEADER SECTION */}
      <section className="relative z-10 pt-12 pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full text-center">
        
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-pill text-xs font-bold uppercase tracking-wider text-[#C84B31] shadow-xs mb-4">
          <Sparkles className="w-3.5 h-3.5 text-[#C84B31]" />
          <span>Curated Local Activities</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-medium tracking-tight text-[#2A2A2A] mb-4">
          Discover Authentic Experiences
        </h1>
        <p className="text-sm sm:text-base text-[#2A2A2A]/70 max-w-2xl mx-auto leading-relaxed mb-8">
          From ancient heritage walks and royal cooking classes to thrilling scuba expeditions, handcraft your perfect journey with local experts.
        </p>

        {/* 3. UNIFIED SEARCH & FILTER CONTROLS */}
        <div className="max-w-4xl mx-auto space-y-4">
          
          {/* Main Search Input & Sort */}
          <div className="relative glass-input rounded-2xl sm:rounded-full p-2 flex flex-col sm:flex-row items-center gap-2 focus-within:ring-2 focus-within:ring-[#C84B31]/20 focus-within:border-[#C84B31] transition-all">
            <div className="flex-1 flex items-center w-full px-3">
              <Search className="w-5 h-5 text-[#2A2A2A]/40 flex-shrink-0 mr-3" />
              <input
                type="text"
                placeholder="Search experiences by title, city, or activity (e.g. Varanasi, Scuba, Cooking)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-sm sm:text-base text-[#2A2A2A] placeholder:text-[#2A2A2A]/40 py-2 font-medium"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')} 
                  className="p-1 rounded-full hover:bg-black/5 text-gray-400 hover:text-gray-600 transition"
                  title="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end px-2 sm:px-0">
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="glass-pill text-xs font-semibold text-[#2A2A2A] px-3 py-2 rounded-xl outline-none cursor-pointer"
              >
                <option value="featured">Featured</option>
                <option value="rating">Top Rated</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>

              {(selectedCategory !== 'All' || searchTerm) && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="p-2 text-xs font-semibold text-[#C84B31] hover:bg-orange-50/80 rounded-xl transition flex items-center gap-1 cursor-pointer"
                  title="Reset all filters"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Reset</span>
                </button>
              )}
            </div>
          </div>

          {/* Unified Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 px-1 hide-scrollbar">
            {CATEGORIES.map(category => {
              const isSelected = selectedCategory === category;
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'bg-[#C84B31] text-white shadow-sm shadow-[#C84B31]/30 scale-105 border border-transparent'
                      : 'glass-pill text-[#2A2A2A]/75 hover:text-[#C84B31] hover:border-[#C84B31]/30'
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. MAIN CONTENT WRAPPER */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-12">
        
        {/* A. PLACES YOU'VE VISITED (Rendered if user has completed trips) */}
        <PlacesVisitedSection />

        {/* B. EXPERIENCES RESULTS SECTION */}
        <section>
          {/* Active Filter Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 pb-4 border-b border-black/5 gap-2">
            <div>
              <h2 className="text-2xl font-serif font-medium text-[#2A2A2A]">
                {selectedCategory === 'All' ? 'All Curated Experiences' : `${selectedCategory} Experiences`}
              </h2>
              <p className="text-xs text-[#2A2A2A]/60 mt-0.5">
                Showing {filteredExperiences.length} activities available for instant booking
              </p>
            </div>

            {searchTerm && (
              <div className="flex items-center gap-2 text-xs text-[#2A2A2A]/70 glass-pill px-3 py-1.5 rounded-full">
                <span>Search: <strong>"{searchTerm}"</strong></span>
                <button 
                  onClick={() => setSearchTerm('')} 
                  className="text-[#C84B31] font-bold hover:underline"
                >
                  Clear
                </button>
              </div>
            )}
          </div>

          {/* Results Grid (Responsive 3-4 cols desktop, 1-2 mobile) */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <ExperienceCardSkeleton key={i} />
              ))}
            </div>
          ) : filteredExperiences.length === 0 ? (
            /* Improved Empty State with Reset & Suggested Categories */
            <div className="glass-card rounded-3xl p-10 sm:p-14 text-center max-w-lg mx-auto my-12 space-y-5">
              <div className="w-16 h-16 rounded-full bg-orange-50/80 text-[#C84B31] flex items-center justify-center mx-auto border border-orange-100">
                <Compass className="w-8 h-8 text-[#C84B31]" />
              </div>
              <div>
                <h3 className="text-2xl font-serif font-medium text-[#2A2A2A]">No experiences found</h3>
                <p className="text-xs sm:text-sm text-[#2A2A2A]/60 leading-relaxed mt-1">
                  We couldn't find any activities matching <span className="font-semibold text-[#2A2A2A]">"{searchTerm || selectedCategory}"</span>. Try clearing your filters or exploring our top recommended categories below.
                </p>
              </div>

              {/* Shortcut Suggestions */}
              <div className="pt-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#2A2A2A]/50 mb-3">
                  Suggested Categories
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {SUGGESTED_SHORTCUTS.map(cat => (
                    <button
                      key={cat}
                      onClick={() => {
                        setSearchTerm('');
                        setSelectedCategory(cat);
                      }}
                      className="px-3.5 py-1.5 rounded-full glass-pill text-xs font-semibold text-[#2A2A2A] hover:bg-[#C84B31] hover:text-white hover:border-[#C84B31] transition cursor-pointer"
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-black/5">
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="bg-[#2A2A2A] hover:bg-[#C84B31] text-white px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredExperiences.map(exp => (
                <ExperienceCard key={exp.id} experience={exp} />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* 5. FOOTER */}
      <footer className="relative z-10 mt-16 border-t border-white/60 bg-white/60 backdrop-blur-md py-8 px-4 text-center text-xs text-[#2A2A2A]/60">
        <p className="max-w-md mx-auto">
          Need custom group experiences or private guided tours? Reach out to our concierge at <span className="font-semibold text-[#C84B31]">support@yatrasetu.com</span>.
        </p>
      </footer>

    </div>
  );
};
