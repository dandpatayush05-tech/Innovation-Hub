import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { searchFlights, type Flight } from '../api/flights';
import { Plane, Search, Loader2, Info, ArrowRight, Clock } from 'lucide-react';
import { FieldError } from '../components/FieldError';

const flightSearchSchema = z.object({
  origin: z.string().min(3, "Origin is required"),
  destination: z.string().min(3, "Destination is required"),
  departureDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Required date format YYYY-MM-DD"),
  returnDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Required date format YYYY-MM-DD").optional().or(z.literal('')),
  passengers: z.number().int().min(1, "Must be at least 1")
});

type FlightSearchFormValues = z.infer<typeof flightSearchSchema>;

export const Flights = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [outboundFlights, setOutboundFlights] = useState<Flight[]>([]);
  const [returnFlights, setReturnFlights] = useState<Flight[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FlightSearchFormValues>({
    resolver: zodResolver(flightSearchSchema),
    defaultValues: {
      origin: searchParams.get('origin') || '',
      destination: searchParams.get('destination') || '',
      departureDate: searchParams.get('departureDate') || '',
      returnDate: searchParams.get('returnDate') || '',
      passengers: Number(searchParams.get('passengers')) || 1
    }
  });
  
  useEffect(() => {
    const origin = searchParams.get('origin');
    const destination = searchParams.get('destination');
    const departureDate = searchParams.get('departureDate');
    const passengers = searchParams.get('passengers');

    if (origin && destination && departureDate && passengers) {
      const fetchFlights = async () => {
        setLoading(true);
        setHasSearched(true);
        try {
          const res = await searchFlights({ 
            origin,
            destination,
            departureDate,
            returnDate: searchParams.get('returnDate') || undefined,
            passengers: Number(passengers)
          });
          setOutboundFlights(res.outbound);
          setReturnFlights(res.return);
        } catch (err) {
          console.error('Failed to search flights', err);
        } finally {
          setLoading(false);
        }
      };
      fetchFlights();
    }
  }, [searchParams]);

  const onSubmit = (data: FlightSearchFormValues) => {
    const params: Record<string, string> = {
      origin: data.origin,
      destination: data.destination,
      departureDate: data.departureDate,
      passengers: data.passengers.toString()
    };
    if (data.returnDate) {
      params.returnDate = data.returnDate;
    }
    setSearchParams(params);
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const calculateDuration = (durationMins: number | undefined, start: string, end: string) => {
    if (durationMins) {
      const hours = Math.floor(durationMins / 60);
      const mins = durationMins % 60;
      return `${hours}h ${mins}m`;
    }
    const ms = new Date(end).getTime() - new Date(start).getTime();
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const mins = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${mins}m`;
  };

  const renderFlightList = (flights: Flight[], title: string) => (
    <div className="space-y-4 mb-8">
      <h3 className="text-xl font-bold text-[#2A2A2A] mb-4">{title}</h3>
      {flights.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 border border-black/5 text-center flex flex-col items-center">
          <Plane className="w-10 h-10 text-[#2A2A2A]/20 mb-3" />
          <h3 className="text-lg font-medium text-[#2A2A2A] mb-1">No flights found</h3>
          <p className="text-sm text-[#2A2A2A]/60">Try adjusting your dates or locations.</p>
        </div>
      ) : (
        flights.map((flight: any) => (
          <div key={flight.id} className="bg-white rounded-3xl p-6 border border-black/5 hover:border-[#C84B31]/30 hover:shadow-lg transition-all duration-300 flex flex-col md:flex-row items-center gap-6">
            
            {/* Airline Info */}
            <div className="w-full md:w-1/4 flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Plane className="w-6 h-6 text-slate-400" />
              </div>
              <div>
                <h4 className="font-semibold text-[#2A2A2A]">{flight.airline}</h4>
                <p className="text-xs text-[#2A2A2A]/60">{flight.flightNumber || flight.flight_number}</p>
              </div>
            </div>

            {/* Flight Times & Route */}
            <div className="flex-1 flex items-center justify-between w-full">
              <div className="text-center">
                <p className="text-xl font-bold text-[#2A2A2A]">{formatTime(flight.departureTime || flight.departure_time)}</p>
                <p className="text-sm text-[#2A2A2A]/60">{flight.origin || flight.departure_airport}</p>
              </div>

              <div className="flex-1 px-8 flex flex-col items-center">
                <p className="text-xs text-[#2A2A2A]/50 mb-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {calculateDuration(flight.duration, flight.departureTime || flight.departure_time, flight.arrivalTime || flight.arrival_time)}
                </p>
                <div className="w-full h-px bg-black/10 relative">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-[10px] uppercase tracking-wider text-[#2A2A2A]/40 font-semibold rounded-full border border-black/10">
                    Non-stop
                  </div>
                </div>
              </div>

              <div className="text-center">
                <p className="text-xl font-bold text-[#2A2A2A]">{formatTime(flight.arrivalTime || flight.arrival_time)}</p>
                <p className="text-sm text-[#2A2A2A]/60">{flight.destination || flight.arrival_airport}</p>
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
        ))
      )}
    </div>
  );

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
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-3xl border border-black/5 flex flex-col md:flex-row gap-4 shadow-sm items-start">
        <div className="flex-1 w-full relative">
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#2A2A2A]/60 mb-1">From</label>
          <input 
            type="text" 
            placeholder="e.g. Bhubaneswar" 
            {...register('origin')}
            className={`w-full bg-[#FDFBF7] border ${errors.origin ? 'border-red-500' : 'border-black/10'} rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#C84B31]`}
          />
          {errors.origin && <FieldError error={errors.origin.message} />}
        </div>
        
        <div className="flex-1 w-full relative">
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#2A2A2A]/60 mb-1">To</label>
          <input 
            type="text" 
            placeholder="e.g. Delhi" 
            {...register('destination')}
            className={`w-full bg-[#FDFBF7] border ${errors.destination ? 'border-red-500' : 'border-black/10'} rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#C84B31]`}
          />
          {errors.destination && <FieldError error={errors.destination.message} />}
        </div>
        
        <div className="flex-1 w-full relative">
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#2A2A2A]/60 mb-1">Departure</label>
          <input 
            type="date" 
            {...register('departureDate')}
            className={`w-full bg-[#FDFBF7] border ${errors.departureDate ? 'border-red-500' : 'border-black/10'} rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#C84B31]`}
          />
          {errors.departureDate && <FieldError error={errors.departureDate.message} />}
        </div>
        
        <div className="flex-1 w-full relative">
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#2A2A2A]/60 mb-1">Return (Optional)</label>
          <input 
            type="date" 
            {...register('returnDate')}
            className={`w-full bg-[#FDFBF7] border ${errors.returnDate ? 'border-red-500' : 'border-black/10'} rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#C84B31]`}
          />
          {errors.returnDate && <FieldError error={errors.returnDate.message} />}
        </div>
        
        <div className="flex-1 w-full relative">
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#2A2A2A]/60 mb-1">Passengers</label>
          <input 
            type="number" 
            min="1"
            {...register('passengers', { valueAsNumber: true })}
            className={`w-full bg-[#FDFBF7] border ${errors.passengers ? 'border-red-500' : 'border-black/10'} rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#C84B31]`}
          />
          {errors.passengers && <FieldError error={errors.passengers.message} />}
        </div>

        <div className="flex items-end h-full self-start pt-[22px]">
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
      ) : hasSearched ? (
        <div>
          {renderFlightList(outboundFlights, "Outbound Flights")}
          {returnFlights && renderFlightList(returnFlights, "Return Flights")}
        </div>
      ) : (
         <div className="bg-white rounded-3xl p-12 border border-black/5 text-center flex flex-col items-center">
          <Plane className="w-12 h-12 text-[#2A2A2A]/20 mb-4" />
          <h3 className="text-xl font-medium text-[#2A2A2A] mb-2">Ready to fly?</h3>
          <p className="text-[#2A2A2A]/60">Enter your search details above to find flights.</p>
        </div>
      )}
    </div>
  );
};
