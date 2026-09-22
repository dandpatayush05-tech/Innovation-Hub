import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, X, Clock, MapPin, Building2, 
  Plane, Compass, ArrowRight, Sparkles, TrendingUp, CornerDownLeft
} from 'lucide-react';
import { getDestinations } from '../../api/destinations';

interface SearchResultItem {
  id: string;
  type: 'destination' | 'hotel' | 'flight' | 'experience';
  title: string;
  subtitle: string;
  link: string;
  tag?: string;
}

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RECENT_KEY = 'yatra_recent_searches';

const POPULAR_DESTINATIONS = [
  { name: 'Goa', state: 'India', tag: 'Beach & Nightlife', link: '/destinations?search=Goa' },
  { name: 'Manali', state: 'Himachal', tag: 'Mountains & Snow', link: '/destinations?search=Manali' },
  { name: 'Jaipur', state: 'Rajasthan', tag: 'Royal Palaces', link: '/destinations?search=Jaipur' },
  { name: 'Varanasi', state: 'Uttar Pradesh', tag: 'Spiritual Ghats', link: '/destinations?search=Varanasi' },
  { name: 'Kerala', state: 'India', tag: 'Backwaters & Ayurveda', link: '/destinations?search=Kerala' },
  { name: 'Leh-Ladakh', state: 'UT', tag: 'High Altitude Passes', link: '/destinations?search=Leh' }
];

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'destinations' | 'hotels' | 'flights' | 'experiences'>('all');
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(RECENT_KEY);
      return saved ? JSON.parse(saved) : ['Goa', 'Taj Heritage Resort', 'Flights to Manali'];
    } catch {
      return ['Goa', 'Taj Heritage Resort'];
    }
  });
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Global Keybindings (Cmd+K / Ctrl+K and Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Focus on Open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  // Debounced Search Query
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    const timeout = setTimeout(async () => {
      try {
        const q = query.toLowerCase();
        
        // Mock and local fuzzy data integration with real destination search
        const destRes = await getDestinations({ search: query }).catch(() => ({ data: [] }));
        const apiDests = (destRes?.data || []).map((d: any) => ({
          id: `dest-${d.id}`,
          type: 'destination' as const,
          title: d.name,
          subtitle: `${d.country || 'India'} • ${d.description?.substring(0, 50) || 'Popular destination'}...`,
          link: `/destinations/${d.id}`,
          tag: 'Destination'
        }));

        // Preset curated experiences, stays, and flights matching query
        const mockStays: SearchResultItem[] = [
          { id: 'stay-1', type: 'hotel', title: `${query.charAt(0).toUpperCase() + query.slice(1)} Grand Palace Resort`, subtitle: `5★ Luxury Villa • Free Breakfast & Spa`, link: `/dashboard/hotels`, tag: 'Stay' },
          { id: 'stay-2', type: 'hotel', title: `Heritage Boutique Hotel ${query.charAt(0).toUpperCase() + query.slice(1)}`, subtitle: `City Center • Rated 4.8/5`, link: `/dashboard/hotels`, tag: 'Stay' }
        ];

        const mockExperiences: SearchResultItem[] = [
          { id: 'exp-1', type: 'experience', title: `${query.charAt(0).toUpperCase() + query.slice(1)} Guided Heritage Trail`, subtitle: `3 Hours • Certified Local Guide`, link: `/experiences`, tag: 'Tour' },
          { id: 'exp-2', type: 'experience', title: `Sunset River & Tasting Cruise`, subtitle: `Live Music & Buffet Dinner`, link: `/experiences`, tag: 'Activity' }
        ];

        const mockFlights: SearchResultItem[] = [
          { id: 'fl-1', type: 'flight', title: `Flights from Delhi to ${query.charAt(0).toUpperCase() + query.slice(1)}`, subtitle: `Indigo, Air India & Vistara • From ₹3,499`, link: `/dashboard/flights?to=${encodeURIComponent(query)}`, tag: 'Flight' }
        ];

        let combined: SearchResultItem[] = [...apiDests, ...mockStays, ...mockExperiences, ...mockFlights];

        if (activeCategory !== 'all') {
          combined = combined.filter(item => {
            if (activeCategory === 'destinations') return item.type === 'destination';
            if (activeCategory === 'hotels') return item.type === 'hotel';
            if (activeCategory === 'flights') return item.type === 'flight';
            if (activeCategory === 'experiences') return item.type === 'experience';
            return true;
          });
        }

        setResults(combined);
        setSelectedIndex(0);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timeout);
  }, [query, activeCategory]);

  const saveRecentSearch = (text: string) => {
    if (!text.trim()) return;
    const filtered = [text, ...recentSearches.filter(s => s.toLowerCase() !== text.toLowerCase())].slice(0, 6);
    setRecentSearches(filtered);
    try {
      localStorage.setItem(RECENT_KEY, JSON.stringify(filtered));
    } catch {}
  };

  const handleSelect = (item: SearchResultItem) => {
    saveRecentSearch(item.title);
    navigate(item.link);
    onClose();
  };

  const handleRecentClick = (text: string) => {
    setQuery(text);
    inputRef.current?.focus();
  };

  const removeRecent = (text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = recentSearches.filter(s => s !== text);
    setRecentSearches(updated);
    try {
      localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
    } catch {}
  };

  const getCategoryIcon = (type: SearchResultItem['type']) => {
    switch (type) {
      case 'destination': return <MapPin className="w-4 h-4 text-[#C84B31]" />;
      case 'hotel': return <Building2 className="w-4 h-4 text-blue-600" />;
      case 'flight': return <Plane className="w-4 h-4 text-sky-600" />;
      case 'experience': return <Compass className="w-4 h-4 text-purple-600" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4">
      
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-black/10 overflow-hidden z-10 animate-in zoom-in-95 duration-200">
        
        {/* Search Input Bar */}
        <div className="flex items-center px-5 py-4 border-b border-black/5 bg-[#FDFBF7]">
          <Search className="w-5 h-5 text-[#C84B31] shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search destinations, hotels, flights, or activities..."
            className="w-full bg-transparent text-[#2A2A2A] placeholder-[#2A2A2A]/40 text-base font-medium focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-full text-gray-400 hover:text-black mr-2 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-[11px] font-mono text-gray-400 bg-white rounded-lg border border-black/10 shadow-sm">
            ESC
          </kbd>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 px-5 py-2.5 bg-white border-b border-black/5 overflow-x-auto text-xs">
          {[
            { id: 'all', label: 'All Results' },
            { id: 'destinations', label: 'Destinations' },
            { id: 'hotels', label: 'Hotels & Stays' },
            { id: 'flights', label: 'Flights' },
            { id: 'experiences', label: 'Experiences' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as any)}
              className={`px-3 py-1.5 rounded-full font-semibold transition-all whitespace-nowrap cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-[#2A2A2A] text-white shadow-sm'
                  : 'text-gray-500 hover:bg-black/5'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Body Content */}
        <div className="max-h-[60vh] overflow-y-auto p-5 space-y-6 divide-y divide-black/5">
          
          {/* Live Search Results */}
          {query.trim() ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-gray-400 font-mono">
                <span>Matching Results ({results.length})</span>
                {loading && <span className="text-[#C84B31] animate-pulse">Searching...</span>}
              </div>

              {results.length > 0 ? (
                <div className="space-y-1.5">
                  {results.map((item, idx) => (
                    <div
                      key={item.id}
                      onClick={() => handleSelect(item)}
                      className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer ${
                        selectedIndex === idx
                          ? 'bg-orange-50/50 border-[#C84B31]/30 text-black shadow-sm'
                          : 'bg-[#FDFBF7] border-black/5 hover:border-black/15 text-[#2A2A2A]'
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-white border border-black/5 flex items-center justify-center shrink-0 shadow-xs">
                          {getCategoryIcon(item.type)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold truncate">{item.title}</h4>
                            {item.tag && (
                              <span className="text-[10px] font-bold uppercase tracking-wider text-[#C84B31] bg-[#C84B31]/10 px-2 py-0.5 rounded-full">
                                {item.tag}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 truncate mt-0.5">{item.subtitle}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 text-gray-400">
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                !loading && (
                  <div className="py-10 text-center text-gray-400 space-y-2">
                    <Search className="w-8 h-8 mx-auto opacity-40" />
                    <p className="text-sm font-medium">No direct matches for "{query}"</p>
                    <p className="text-xs text-gray-400">Try searching for a city, hotel name, or activity.</p>
                  </div>
                )
              )}
            </div>
          ) : (
            <>
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div className="space-y-2.5 pb-2">
                  <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-gray-400 font-mono">
                    <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Recent Searches</span>
                    <button
                      onClick={() => {
                        setRecentSearches([]);
                        localStorage.removeItem(RECENT_KEY);
                      }}
                      className="text-gray-400 hover:text-red-500 font-medium cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((term) => (
                      <button
                        key={term}
                        onClick={() => handleRecentClick(term)}
                        className="group flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#FDFBF7] border border-black/5 hover:border-[#C84B31]/40 text-xs font-medium text-[#2A2A2A] transition-all cursor-pointer"
                      >
                        <span>{term}</span>
                        <X
                          onClick={(e) => removeRecent(term, e)}
                          className="w-3 h-3 text-gray-400 group-hover:text-red-500 opacity-60 group-hover:opacity-100"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Popular Trending Destinations */}
              <div className="space-y-3 pt-4">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-400 font-mono">
                  <TrendingUp className="w-3.5 h-3.5 text-[#C84B31]" />
                  <span>Trending Destinations</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {POPULAR_DESTINATIONS.map((dest) => (
                    <button
                      key={dest.name}
                      onClick={() => {
                        saveRecentSearch(dest.name);
                        navigate(dest.link);
                        onClose();
                      }}
                      className="p-3 rounded-2xl bg-[#FDFBF7] border border-black/5 hover:border-[#C84B31]/40 hover:bg-orange-50/40 text-left transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-sm text-[#2A2A2A] group-hover:text-[#C84B31] transition-colors">
                          {dest.name}
                        </span>
                        <MapPin className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#C84B31]" />
                      </div>
                      <span className="text-[11px] text-gray-500 block truncate">{dest.tag}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

        </div>

        {/* Footer info */}
        <div className="px-5 py-3 bg-[#FDFBF7] border-t border-black/5 flex items-center justify-between text-[11px] text-gray-400 font-mono">
          <span>Navigate with <kbd className="font-bold text-gray-600">↑</kbd> <kbd className="font-bold text-gray-600">↓</kbd></span>
          <span className="flex items-center gap-1"><CornerDownLeft className="w-3 h-3" /> Select</span>
        </div>

      </div>
    </div>
  );
};
