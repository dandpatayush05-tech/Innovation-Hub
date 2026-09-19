import { useEffect, useState, useCallback } from 'react';
import { useDebounce } from '../hooks/useDebounce';
import { Link } from 'react-router-dom';
import { Search, MapPin, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { getDestinations } from '../api/destinations';
import type { Destination } from '../api/destinations';
import { LoadingState } from '../components/states/LoadingState';
import { EmptyState } from '../components/states/EmptyState';
import { ErrorState } from '../components/states/ErrorState';
import { DestinationCardSkeleton } from '../components/skeletons/DestinationCardSkeleton';

export const Destinations = () => {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 9;

  // Reset page when debounced search changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const fetchDestinations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getDestinations({ page, limit, search: debouncedSearch });
      setDestinations(res.data);
      setTotalPages(res.pagination.totalPages);
    } catch (err) {
      console.error('Failed to fetch destinations:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch]);

  useEffect(() => {
    fetchDestinations();
  }, [fetchDestinations]);

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans pb-24">
      {/* Navigation (Simple version for internal pages) */}
      <nav className="border-b border-black/5 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-[1360px] mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 text-[#2A2A2A] hover:opacity-80 transition-opacity no-underline">
            <MapPin className="w-8 h-8 text-[#C84B31]" />
            <span className="font-display text-[28px] text-black leading-none select-none mt-1">Vstara</span>
          </Link>
          <div className="flex gap-6">
            <Link to="/dashboard" className="text-[15px] font-semibold uppercase text-[#292929] tracking-[0.04em] hover:opacity-55 transition-opacity">
              Dashboard
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-6 max-w-[1360px] mx-auto flex flex-col items-center text-center">
        <h1 className="text-[clamp(40px,5vw,60px)] font-medium text-[var(--color-vstara-text)] leading-[1.05] tracking-[-0.04em] mb-6">
          Discover Extraordinary Places
        </h1>
        <p className="text-xl text-[var(--color-vstara-muted)] max-w-[600px] mb-12">
          From hidden gems to world-renowned landmarks, find the perfect destination for your next adventure.
        </p>
        
        {/* Search Bar (Glassmorphism) */}
        <div className="relative w-full max-w-[700px] h-16 bg-white border border-black/5 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden flex items-center px-6 transition-shadow focus-within:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
          <Search className="w-6 h-6 text-[#2A2A2A]/40 flex-shrink-0" />
          <input 
            type="text" 
            placeholder="Search by name, country, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-full bg-transparent border-none outline-none pl-4 text-lg text-[var(--color-vstara-text)] placeholder:text-[#2A2A2A]/40 font-medium"
          />
        </div>
      </section>

      {/* Grid Section */}
      <section className="px-6 max-w-[1360px] mx-auto min-h-[500px]">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => <DestinationCardSkeleton key={i} />)}
          </div>
        ) : error ? (
          <ErrorState error={error} onRetry={fetchDestinations} className="my-12" />
        ) : destinations.length === 0 ? (
          <EmptyState 
            title="No destinations found" 
            message="We couldn't find any destinations matching your search. Try adjusting your keywords." 
            className="my-12"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {destinations.map((dest) => (
              <Link 
                to={`/destinations/${dest.id}`} 
                key={dest.id}
                className="group flex flex-col bg-white rounded-[32px] overflow-hidden border border-black/5 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-300 no-underline hover:-translate-y-1"
              >
                <div className="relative h-[300px] w-full overflow-hidden bg-gray-100">
                  <img 
                    src={dest.image_url || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop'} 
                    alt={dest.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent opacity-60" />
                  <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
                    <div>
                      <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-white text-xs font-semibold uppercase tracking-wider mb-2">
                        {dest.country}
                      </span>
                      <h3 className="text-2xl font-medium text-white leading-tight">
                        {dest.name}
                      </h3>
                    </div>
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <p className="text-[var(--color-vstara-muted)] line-clamp-3 leading-relaxed mb-6">
                    {dest.description}
                  </p>
                  <div className="flex items-center text-[var(--color-vstara-prompt)] font-semibold text-[15px] uppercase tracking-wider group-hover:gap-2 transition-all">
                    Explore <ArrowRight className="w-4 h-4 ml-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-16">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-12 h-12 rounded-full border border-black/10 flex items-center justify-center text-[var(--color-vstara-text)] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-black/5 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="font-medium text-[var(--color-vstara-text)]">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="w-12 h-12 rounded-full border border-black/10 flex items-center justify-center text-[var(--color-vstara-text)] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-black/5 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </section>
    </div>
  );
};
