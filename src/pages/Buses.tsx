import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { getBuses, type Bus } from '../api/buses';
import { Bus as BusIcon, Search, AlertCircle, Loader2, MapPin, Users } from 'lucide-react';

export const Buses = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [buses, setBuses] = useState<Bus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchForm, setSearchForm] = useState({
    source: searchParams.get('source') || '',
    destination: searchParams.get('destination') || '',
    date: searchParams.get('date') || ''
  });

  useEffect(() => {
    const fetchBuses = async () => {
      setLoading(true);
      try {
        const source = searchParams.get('source') || undefined;
        const destination = searchParams.get('destination') || undefined;
        const { data } = await getBuses({ source, destination });
        setBuses(data);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch buses');
      } finally {
        setLoading(false);
      }
    };

    fetchBuses();
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchForm.source) params.set('source', searchForm.source);
    if (searchForm.destination) params.set('destination', searchForm.destination);
    if (searchForm.date) params.set('date', searchForm.date);
    setSearchParams(params);
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const calculateDuration = (start: string, end: string) => {
    const diffMs = new Date(end).getTime() - new Date(start).getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${diffHrs}h ${diffMins}m`;
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] pt-24 pb-12">
      {/* Demo Banner */}
      <div className="bg-[#C84B31]/10 border-b border-[#C84B31]/20 py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-[#C84B31] font-medium flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Demo Bus Inventory - This is a test environment
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <h1 className="text-3xl font-serif text-[#2A2A2A] mb-8">Search Buses</h1>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="bg-white p-6 rounded-2xl shadow-sm border border-black/5 mb-8 flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#2A2A2A]/60 mb-1">From</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="text" 
                placeholder="Leaving from"
                value={searchForm.source}
                onChange={e => setSearchForm({ ...searchForm, source: e.target.value })}
                className="w-full bg-[#FDFBF7] border border-black/10 rounded-xl pl-10 pr-4 py-3 text-[#2A2A2A] focus:outline-none focus:border-[#C84B31]"
              />
            </div>
          </div>
          <div className="flex-1">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#2A2A2A]/60 mb-1">To</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="text" 
                placeholder="Going to"
                value={searchForm.destination}
                onChange={e => setSearchForm({ ...searchForm, destination: e.target.value })}
                className="w-full bg-[#FDFBF7] border border-black/10 rounded-xl pl-10 pr-4 py-3 text-[#2A2A2A] focus:outline-none focus:border-[#C84B31]"
              />
            </div>
          </div>
          <div className="flex-1">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#2A2A2A]/60 mb-1">Date</label>
            <input 
              type="date" 
              value={searchForm.date}
              onChange={e => setSearchForm({ ...searchForm, date: e.target.value })}
              className="w-full bg-[#FDFBF7] border border-black/10 rounded-xl px-4 py-3 text-[#2A2A2A] focus:outline-none focus:border-[#C84B31]"
            />
          </div>
          <div className="flex items-end">
            <button type="submit" className="w-full md:w-auto bg-[#C84B31] text-white px-8 py-3 rounded-xl font-medium hover:bg-[#A63A25] transition-colors flex items-center justify-center gap-2">
              <Search className="w-4 h-4" />
              Search
            </button>
          </div>
        </form>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#C84B31]" />
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center">
            {error}
          </div>
        ) : buses.length === 0 ? (
          <div className="text-center py-20">
            <BusIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-serif text-[#2A2A2A] mb-2">No buses found</h3>
            <p className="text-gray-500">Try adjusting your search criteria</p>
          </div>
        ) : (
          <div className="space-y-4">
            {buses.map(bus => (
              <div key={bus.id} className="bg-white border border-black/5 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row items-center justify-between gap-6">
                
                {/* Operator Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold text-lg text-[#2A2A2A]">{bus.operator_name}</span>
                    <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full font-medium">AC Sleeper</span>
                  </div>
                  <div className="flex items-center gap-6 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {bus.total_seats} Seats Total
                    </div>
                  </div>
                </div>

                {/* Timing */}
                <div className="flex-1 flex items-center justify-between min-w-0 px-4 md:px-8 border-y md:border-y-0 md:border-x border-gray-100 py-4 md:py-0">
                  <div className="text-center">
                    <p className="text-xl font-bold text-[#2A2A2A]">{formatTime(bus.departure_time)}</p>
                    <p className="text-sm text-gray-500">{bus.route_source}</p>
                  </div>
                  <div className="flex flex-col items-center px-4">
                    <span className="text-xs text-gray-400 mb-1">{calculateDuration(bus.departure_time, bus.arrival_time)}</span>
                    <div className="w-full flex items-center">
                      <div className="h-px bg-gray-300 flex-1"></div>
                      <BusIcon className="w-4 h-4 text-[#C84B31] mx-2" />
                      <div className="h-px bg-gray-300 flex-1"></div>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-[#2A2A2A]">{formatTime(bus.arrival_time)}</p>
                    <p className="text-sm text-gray-500">{bus.route_destination}</p>
                  </div>
                </div>

                {/* Price & Action */}
                <div className="text-right shrink-0">
                  <p className="text-2xl font-bold text-[#2A2A2A] mb-3">${bus.price}</p>
                  <Link 
                    to={`/dashboard/buses/${bus.id}`}
                    className="inline-block bg-[#2A2A2A] text-white px-6 py-2.5 rounded-xl font-medium hover:bg-black transition-colors"
                  >
                    View Seats
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
