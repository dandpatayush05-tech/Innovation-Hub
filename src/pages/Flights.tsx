import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { getFlights, type Flight } from '../api/flights';
import { Plane, Search, Loader2, Info, ArrowRight, Clock } from 'lucide-react';

export const Flights = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);

  // Search state
  const [departure, setDeparture] = useState(searchParams.get('dep') || '');
  const [arrival, setArrival] = useState(searchParams.get('arr') || '');
  
  useEffect(() => {
    const fetchFlights = async () => {
      setLoading(true);
      try {
        const res = await getFlights({ 
          departureAirport: searchParams.get('dep') || '',
          arrivalAirport: searchParams.get('arr') || ''
        });
        setFlights(res.data);
      } catch (err) {
        console.error('Failed to fetch flights', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFlights();
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params: Record<string, string> = {};
    if (departure) params.dep = departure;
    if (arrival) params.arr = arrival;
    setSearchParams(params);
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const calculateDuration = (start: string, end: string) => {
    const ms = new Date(end).getTime() - new Date(start).getTime();
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const mins = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Demo Banner */}
      <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl flex items-start gap-3">
        <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-sm">Test Environment: Demo Flight Inventory</p>
          <p className="text-xs mt-1 opacity-80">
            The flights listed here are generated from our test database. No real airline ticket will be issued.
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-serif text-[#2A2A2A] mb-2 flex items-center gap-3">
            <Plane className="w-8 h-8 text-[#C84B31]" />
            Search Flights
          </h1>
          <p className="text-[#2A2A2A]/60">Find the best routes for your next adventure.</p>
        </div>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="bg-white p-6 rounded-3xl border border-black/5 flex flex-col md:flex-row gap-4 shadow-sm">
        <div className="flex-1 relative">
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#2A2A2A]/60 mb-1">From</label>
          <input 
            type="text" 
            placeholder="Departure City/Airport" 
            value={departure}
            onChange={(e) => setDeparture(e.target.value)}
            className="w-full bg-[#FDFBF7] border border-black/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#C84B31]"
          />
        </div>
        <div className="flex-1 relative">
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#2A2A2A]/60 mb-1">To</label>
          <input 
            type="text" 
            placeholder="Arrival City/Airport" 
            value={arrival}
            onChange={(e) => setArrival(e.target.value)}
            className="w-full bg-[#FDFBF7] border border-black/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#C84B31]"
          />
        </div>
        <div className="flex items-end">
          <button type="submit" className="w-full md:w-auto bg-[#2A2A2A] text-white px-8 py-3 rounded-xl text-sm font-medium hover:bg-black transition-colors flex items-center justify-center gap-2">
            <Search className="w-4 h-4" />
            Search
          </button>
        </div>
      </form>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-[#C84B31]" />
        </div>
      ) : flights.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-black/5 text-center flex flex-col items-center">
          <Plane className="w-12 h-12 text-[#2A2A2A]/20 mb-4" />
          <h3 className="text-xl font-medium text-[#2A2A2A] mb-2">No flights found</h3>
          <p className="text-[#2A2A2A]/60">Try adjusting your departure or arrival locations.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {flights.map(flight => (
            <div key={flight.id} className="bg-white rounded-3xl p-6 border border-black/5 hover:border-[#C84B31]/30 hover:shadow-lg transition-all duration-300 flex flex-col md:flex-row items-center gap-6">
              
              {/* Airline Info */}
              <div className="w-full md:w-1/4 flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Plane className="w-6 h-6 text-slate-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-[#2A2A2A]">{flight.airline}</h4>
                  <p className="text-xs text-[#2A2A2A]/60">{flight.flight_number}</p>
                </div>
              </div>

              {/* Flight Times & Route */}
              <div className="flex-1 flex items-center justify-between w-full">
                <div className="text-center">
                  <p className="text-xl font-bold text-[#2A2A2A]">{formatTime(flight.departure_time)}</p>
                  <p className="text-sm text-[#2A2A2A]/60">{flight.departure_airport}</p>
                </div>

                <div className="flex-1 px-8 flex flex-col items-center">
                  <p className="text-xs text-[#2A2A2A]/50 mb-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {calculateDuration(flight.departure_time, flight.arrival_time)}
                  </p>
                  <div className="w-full h-px bg-black/10 relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-[10px] uppercase tracking-wider text-[#2A2A2A]/40 font-semibold rounded-full border border-black/10">
                      Non-stop
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-xl font-bold text-[#2A2A2A]">{formatTime(flight.arrival_time)}</p>
                  <p className="text-sm text-[#2A2A2A]/60">{flight.arrival_airport}</p>
                </div>
              </div>

              {/* Price & Action */}
              <div className="w-full md:w-1/5 flex flex-row md:flex-col items-center md:items-end justify-between border-t md:border-t-0 md:border-l border-black/5 pt-4 md:pt-0 md:pl-6">
                <div className="text-left md:text-right">
                  <p className="text-2xl font-bold text-[#C84B31]">${flight.price}</p>
                  <p className="text-xs text-[#2A2A2A]/60">per passenger</p>
                </div>
                <Link 
                  to={`/dashboard/flights/${flight.id}`}
                  className="bg-[#C84B31] text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-[#A63A25] transition-colors mt-0 md:mt-4 flex items-center gap-2"
                >
                  Select <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};
