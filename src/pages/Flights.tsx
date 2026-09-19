import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { searchTransport, type TransportOption, type TransportSearchResponse } from '../api/transport';
import { geocode } from '../utils/geocode';
import { Plane, Bus, Car, Search, Loader2, Info, ArrowRight, Clock, Star } from 'lucide-react';
import { FieldError } from '../components/FieldError';

const transportSearchSchema = z.object({
  origin: z.string().min(3, "Origin is required"),
  destination: z.string().min(3, "Destination is required"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Required date format YYYY-MM-DD"),
  passengers: z.number().int().min(1, "Must be at least 1"),
  sortBy: z.enum(['price', 'comfort'])
});

type TransportSearchFormValues = z.infer<typeof transportSearchSchema>;

export const Flights = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [results, setResults] = useState<TransportSearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const today = new Date();
  
  const formatDateString = (date: Date) => date.toISOString().split('T')[0];

  const { register, handleSubmit, formState: { errors } } = useForm<TransportSearchFormValues>({
    resolver: zodResolver(transportSearchSchema),
    defaultValues: {
      origin: searchParams.get('origin') || 'Bhubaneswar',
      destination: searchParams.get('destination') || 'Delhi',
      date: searchParams.get('date') || formatDateString(today),
      passengers: Number(searchParams.get('passengers')) || 1,
      sortBy: (searchParams.get('sortBy') as 'price' | 'comfort') || 'price'
    } as TransportSearchFormValues
  });
  
  useEffect(() => {
    const origin = searchParams.get('origin');
    const destination = searchParams.get('destination');
    const date = searchParams.get('date');
    const passengers = searchParams.get('passengers');
    const sortBy = (searchParams.get('sortBy') as 'price' | 'comfort') || 'price';

    if (origin && destination && date && passengers) {
      const fetchTransport = async () => {
        setLoading(true);
        setErrorMsg('');
        try {
          const fromCoord = await geocode(origin);
          const toCoord = await geocode(destination);
          
          const res = await searchTransport({ 
            from: fromCoord,
            to: toCoord,
            date,
            passengers: Number(passengers),
            sortBy
          });
          setResults(res);
        } catch (err: any) {
          console.error('Failed to search transport', err);
          setErrorMsg(err.message || 'Failed to search transport');
        } finally {
          setLoading(false);
        }
      };
      fetchTransport();
    }
  }, [searchParams]);

  const onSubmit = (data: any) => {
    setSearchParams({
      origin: data.origin,
      destination: data.destination,
      date: data.date,
      passengers: data.passengers.toString(),
      sortBy: data.sortBy
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const calculateDuration = (mins: number) => {
    const hours = Math.floor(mins / 60);
    const m = Math.floor(mins % 60);
    return `${hours}h ${m}m`;
  };

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'flight': return <Plane className="w-6 h-6 text-slate-400" />;
      case 'bus': return <Bus className="w-6 h-6 text-slate-400" />;
      case 'auto': return <Car className="w-6 h-6 text-slate-400" />;
      default: return <Plane className="w-6 h-6 text-slate-400" />;
    }
  };

  const renderOptionList = () => {
    if (!results) return null;
    
    if (results.options.length === 0) {
      return (
        <div className="bg-white rounded-3xl p-8 border border-black/5 text-center flex flex-col items-center">
          <Plane className="w-10 h-10 text-[#2A2A2A]/20 mb-3" />
          <h3 className="text-lg font-medium text-[#2A2A2A] mb-1">No transport options found</h3>
          <p className="text-sm text-[#2A2A2A]/60">Try adjusting your dates or locations.</p>
        </div>
      );
    }

    return (
      <div className="space-y-4 mb-8">
        <h3 className="text-xl font-bold text-[#2A2A2A] mb-4">Available Options</h3>
        {results.options.map((opt) => (
          <div key={opt.id} className="bg-white rounded-3xl p-6 border border-black/5 hover:border-[#C84B31]/30 hover:shadow-lg transition-all duration-300 flex flex-col md:flex-row items-center gap-6">
            
            {/* Mode Info */}
            <div className="w-full md:w-1/4 flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0">
                {getModeIcon(opt.mode)}
              </div>
              <div>
                <h4 className="font-semibold text-[#2A2A2A]">{opt.providerDetails.name}</h4>
                <p className="text-xs text-[#2A2A2A]/60 uppercase tracking-wider">{opt.mode} &bull; {opt.providerDetails.identifier}</p>
                <div className="flex items-center gap-1 mt-1 text-yellow-500">
                  <Star className="w-3 h-3 fill-current" />
                  <span className="text-xs font-medium text-[#2A2A2A]">{opt.comfortScore}/5 Comfort</span>
                </div>
              </div>
            </div>

            {/* Times & Route */}
            <div className="flex-1 flex items-center justify-between w-full">
              <div className="text-center">
                <p className="text-xl font-bold text-[#2A2A2A]">{formatTime(opt.providerDetails.departureTime)}</p>
                <p className="text-sm text-[#2A2A2A]/60 capitalize">{searchParams.get('origin')}</p>
              </div>

              <div className="flex-1 px-8 flex flex-col items-center">
                <p className="text-xs text-[#2A2A2A]/50 mb-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {calculateDuration(opt.etaMin)}
                </p>
                <div className="w-full h-px bg-black/10 relative">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-[10px] uppercase tracking-wider text-[#2A2A2A]/40 font-semibold rounded-full border border-black/10">
                    Direct
                  </div>
                </div>
              </div>

              <div className="text-center">
                <p className="text-xl font-bold text-[#2A2A2A]">{formatTime(opt.providerDetails.arrivalTime)}</p>
                <p className="text-sm text-[#2A2A2A]/60 capitalize">{searchParams.get('destination')}</p>
              </div>
            </div>

            {/* Price & Action */}
            <div className="w-full md:w-1/5 flex flex-row md:flex-col items-center md:items-end justify-between border-t md:border-t-0 md:border-l border-black/5 pt-4 md:pt-0 md:pl-6">
              <div className="text-left md:text-right">
                <p className="text-2xl font-bold text-[#C84B31]">${opt.fare.toFixed(2)}</p>
                <p className="text-xs text-[#2A2A2A]/60">total for {searchParams.get('passengers')} pax</p>
              </div>
              <Link 
                to={`/dashboard/book?type=${opt.mode}&id=${opt.id}&fare=${opt.fare}`}
                className="bg-[#C84B31] text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-[#A63A25] transition-colors mt-0 md:mt-4 flex items-center gap-2"
              >
                Select <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Demo Banner */}
      <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl flex items-start gap-3">
        <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-sm">Unified Multimodal Search</p>
          <p className="text-xs mt-1 opacity-80">
            Fares are dynamically calculated based on actual distance (OSRM/Haversine) from Origin to Destination.
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-serif text-[#2A2A2A] mb-2 flex items-center gap-3">
            <Plane className="w-8 h-8 text-[#C84B31]" />
            Transport Search
          </h1>
          <p className="text-[#2A2A2A]/60">Compare flights, buses, and cabs across distances.</p>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl">
          {errorMsg}
        </div>
      )}

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
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#2A2A2A]/60 mb-1">Date</label>
          <input 
            type="date" 
            min={formatDateString(today)}
            {...register('date')}
            className={`w-full bg-[#FDFBF7] border ${errors.date ? 'border-red-500' : 'border-black/10'} rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#C84B31]`}
          />
          {errors.date && <FieldError error={errors.date.message} />}
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
        
        <div className="flex-1 w-full relative">
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#2A2A2A]/60 mb-1">Sort By</label>
          <select 
            {...register('sortBy')}
            className={`w-full bg-[#FDFBF7] border ${errors.sortBy ? 'border-red-500' : 'border-black/10'} rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#C84B31]`}
          >
            <option value="price">Cheapest</option>
            <option value="comfort">Best Comfort</option>
          </select>
          {errors.sortBy && <FieldError error={errors.sortBy.message} />}
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
      ) : results ? (
        renderOptionList()
      ) : (
         <div className="bg-white rounded-3xl p-12 border border-black/5 text-center flex flex-col items-center">
          <Plane className="w-12 h-12 text-[#2A2A2A]/20 mb-4" />
          <h3 className="text-xl font-medium text-[#2A2A2A] mb-2">Ready to travel?</h3>
          <p className="text-[#2A2A2A]/60">Enter your search details above to find the best options.</p>
        </div>
      )}
    </div>
  );
};
