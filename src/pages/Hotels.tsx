import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { getHotels, type Hotel } from '../api/hotels';
import { MapPin, Search, Star, Building2, Loader2, Info } from 'lucide-react';

export const Hotels = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);

  // Search state
  const [query, setQuery] = useState(searchParams.get('q') || '');
  
  useEffect(() => {
    const fetchHotels = async () => {
      setLoading(true);
      try {
        const res = await getHotels({ search: searchParams.get('q') || '' });
        setHotels(res.data);
      } catch (err) {
        console.error('Failed to fetch hotels', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHotels();
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query) {
      setSearchParams({ q: query });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Demo Banner */}
      <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl flex items-start gap-3">
        <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-sm">Test Environment: Demo Inventory</p>
          <p className="text-xs mt-1 opacity-80">
            The hotels listed here are for demonstration purposes only. Bookings made will be processed via test payment gateways and do not represent real-world reservations.
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-serif text-[#2A2A2A] mb-2 flex items-center gap-3">
            <Building2 className="w-8 h-8 text-[#C84B31]" />
            Find a Stay
          </h1>
          <p className="text-[#2A2A2A]/60">Search for comfortable accommodations anywhere.</p>
        </div>

        <form onSubmit={handleSearch} className="flex w-full md:w-auto gap-2">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#2A2A2A]/40" />
            <input 
              type="text" 
              placeholder="Search destination or hotel..." 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-white border border-black/10 rounded-full pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-[#C84B31]"
            />
          </div>
          <button type="submit" className="bg-[#2A2A2A] text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-black transition-colors">
            Search
          </button>
        </form>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-[#C84B31]" />
        </div>
      ) : hotels.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-black/5 text-center flex flex-col items-center">
          <Building2 className="w-12 h-12 text-[#2A2A2A]/20 mb-4" />
          <h3 className="text-xl font-medium text-[#2A2A2A] mb-2">No hotels found</h3>
          <p className="text-[#2A2A2A]/60">Try adjusting your search terms.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hotels.map(hotel => (
            <Link key={hotel.id} to={`/dashboard/hotels/${hotel.id}`} className="group bg-white rounded-3xl overflow-hidden border border-black/5 hover:shadow-xl transition-all duration-300 flex flex-col">
              <div className="aspect-[4/3] overflow-hidden relative">
                {hotel.image_url ? (
                  <img src={hotel.image_url} alt={hotel.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                ) : (
                  <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                    <Building2 className="w-12 h-12 text-slate-300" />
                  </div>
                )}
                {hotel.rating && (
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span className="text-sm font-semibold text-[#2A2A2A]">{hotel.rating}</span>
                  </div>
                )}
              </div>
              <div className="p-6 flex flex-col flex-1">
                <h3 className="text-xl font-semibold text-[#2A2A2A] mb-1 line-clamp-1">{hotel.name}</h3>
                
                {/* We don't have location directly on hotel schema, but we can assume it's part of the destination. If we had it, we'd show it here. For now, a generic pin */}
                <div className="flex items-center text-[#2A2A2A]/60 text-sm mb-4">
                  <MapPin className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
                  <span className="truncate">Prime Location</span>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  {hotel.amenities?.slice(0, 3).map((amenity, i) => (
                    <span key={i} className="bg-slate-50 text-[#2A2A2A]/70 text-xs px-2.5 py-1 rounded-md border border-slate-100">
                      {amenity}
                    </span>
                  ))}
                  {(hotel.amenities?.length || 0) > 3 && (
                    <span className="bg-slate-50 text-[#2A2A2A]/70 text-xs px-2.5 py-1 rounded-md border border-slate-100">
                      +{hotel.amenities!.length - 3}
                    </span>
                  )}
                </div>

                <div className="mt-auto flex items-center justify-between pt-4 border-t border-black/5">
                  <div>
                    <span className="text-2xl font-bold text-[#C84B31]">${hotel.price_per_night}</span>
                    <span className="text-[#2A2A2A]/60 text-sm"> / night</span>
                  </div>
                  <span className="text-sm font-medium text-[#C84B31] group-hover:underline">View Details</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
