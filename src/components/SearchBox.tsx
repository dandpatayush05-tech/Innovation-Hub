import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plane, Building2, Bus, Car, Compass,
  MapPin, Calendar, Users, ArrowRight, Clock,
  ArrowRightLeft
} from 'lucide-react';
import { FieldError } from './FieldError';

export type ServiceType = 'flights' | 'hotels' | 'buses' | 'cabs' | 'experiences';

// Validation Schemas per service
const flightSchema = z.object({
  tripType: z.enum(['one-way', 'round-trip', 'multi-city']),
  origin: z.string().min(2, 'Origin city or airport is required'),
  destination: z.string().min(2, 'Destination city or airport is required'),
  departureDate: z.string().min(1, 'Departure date is required'),
  returnDate: z.string().optional(),
  passengers: z.number().int().min(1, 'At least 1 passenger').max(9, 'Max 9 passengers'),
  travelClass: z.enum(['economy', 'premium_economy', 'business', 'first'])
});

const hotelSchema = z.object({
  destination: z.string().min(2, 'City, location, or hotel name is required'),
  checkIn: z.string().min(1, 'Check-in date is required'),
  checkOut: z.string().min(1, 'Check-out date is required'),
  guests: z.number().int().min(1, 'At least 1 guest'),
  rooms: z.number().int().min(1, 'At least 1 room')
});

const busSchema = z.object({
  from: z.string().min(2, 'Departure city is required'),
  to: z.string().min(2, 'Destination city is required'),
  departureDate: z.string().min(1, 'Date of journey is required'),
  passengers: z.number().int().min(1, 'At least 1 passenger')
});

const cabSchema = z.object({
  pickup: z.string().min(2, 'Pickup location is required'),
  drop: z.string().min(2, 'Drop location is required'),
  date: z.string().min(1, 'Pickup date is required'),
  time: z.string().min(1, 'Pickup time is required'),
  vehicleType: z.enum(['auto', 'sedan', 'suv', 'bike'])
});

const experienceSchema = z.object({
  where: z.string().min(2, 'Destination or activity name is required'),
  date: z.string().optional(),
  category: z.string()
});

type FlightFormValues = z.infer<typeof flightSchema>;
type HotelFormValues = z.infer<typeof hotelSchema>;
type BusFormValues = z.infer<typeof busSchema>;
type CabFormValues = z.infer<typeof cabSchema>;
type ExperienceFormValues = z.infer<typeof experienceSchema>;

interface SearchBoxProps {
  initialService?: ServiceType;
  onServiceChange?: (service: ServiceType) => void;
  className?: string;
}

export const SearchBox: React.FC<SearchBoxProps> = ({
  initialService = 'hotels',
  onServiceChange,
  className = ''
}) => {
  const navigate = useNavigate();
  const [activeService, setActiveService] = useState<ServiceType>(initialService);

  const handleTabChange = (service: ServiceType) => {
    setActiveService(service);
    if (onServiceChange) {
      onServiceChange(service);
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  // Forms with explicit typed resolvers
  const flightForm = useForm<FlightFormValues>({
    resolver: zodResolver(flightSchema) as Resolver<FlightFormValues>,
    defaultValues: {
      tripType: 'one-way',
      origin: 'Bhubaneswar',
      destination: 'New Delhi',
      departureDate: today,
      passengers: 1,
      travelClass: 'economy'
    }
  });

  const hotelForm = useForm<HotelFormValues>({
    resolver: zodResolver(hotelSchema) as Resolver<HotelFormValues>,
    defaultValues: {
      destination: '',
      checkIn: today,
      checkOut: tomorrow,
      guests: 2,
      rooms: 1
    }
  });

  const busForm = useForm<BusFormValues>({
    resolver: zodResolver(busSchema) as Resolver<BusFormValues>,
    defaultValues: {
      from: '',
      to: '',
      departureDate: today,
      passengers: 1
    }
  });

  const cabForm = useForm<CabFormValues>({
    resolver: zodResolver(cabSchema) as Resolver<CabFormValues>,
    defaultValues: {
      pickup: '',
      drop: '',
      date: today,
      time: '10:00',
      vehicleType: 'auto'
    }
  });

  const experienceForm = useForm<ExperienceFormValues>({
    resolver: zodResolver(experienceSchema) as Resolver<ExperienceFormValues>,
    defaultValues: {
      where: '',
      date: today,
      category: 'All'
    }
  });

  // Submission Handlers
  const onFlightSubmit = (data: FlightFormValues) => {
    const params = new URLSearchParams({
      origin: data.origin,
      destination: data.destination,
      date: data.departureDate,
      passengers: String(data.passengers),
      tripType: data.tripType,
      class: data.travelClass
    });
    if (data.returnDate) params.append('returnDate', data.returnDate);
    navigate(`/dashboard/flights?${params.toString()}`);
  };

  const onHotelSubmit = (data: HotelFormValues) => {
    const params = new URLSearchParams({
      q: data.destination,
      checkIn: data.checkIn,
      checkOut: data.checkOut,
      guests: String(data.guests),
      rooms: String(data.rooms)
    });
    navigate(`/dashboard/hotels?${params.toString()}`);
  };

  const onBusSubmit = (data: BusFormValues) => {
    const params = new URLSearchParams({
      source: data.from,
      destination: data.to,
      date: data.departureDate,
      passengers: String(data.passengers)
    });
    navigate(`/dashboard/buses?${params.toString()}`);
  };

  const onCabSubmit = (_data: CabFormValues) => {
    navigate('/dashboard/auto');
  };

  const onExperienceSubmit = (data: ExperienceFormValues) => {
    const params = new URLSearchParams({
      q: data.where
    });
    if (data.category && data.category !== 'All') {
      params.append('category', data.category.toLowerCase());
    }
    navigate(`/experiences?${params.toString()}`);
  };

  const services = [
    { id: 'hotels' as ServiceType, label: 'Hotels & Stays', icon: Building2 },
    { id: 'flights' as ServiceType, label: 'Flights', icon: Plane },
    { id: 'buses' as ServiceType, label: 'Buses', icon: Bus },
    { id: 'cabs' as ServiceType, label: 'Cabs & Auto', icon: Car },
    { id: 'experiences' as ServiceType, label: 'Experiences', icon: Compass },
  ];

  return (
    <div className={`bg-white rounded-3xl p-5 sm:p-7 shadow-2xl border border-black/5 text-[#2A2A2A] ${className}`}>

      {/* Service Tabs */}
      <div className="flex items-center gap-2 sm:gap-3 border-b border-black/10 pb-4 mb-6 overflow-x-auto no-scrollbar">
        {services.map((item) => {
          const Icon = item.icon;
          const isSelected = activeService === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleTabChange(item.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${isSelected
                  ? 'bg-[#C84B31] text-white shadow-md'
                  : 'text-[#2A2A2A]/70 hover:text-[#2A2A2A] hover:bg-black/5'
                }`}
            >
              <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-[#2A2A2A]/60'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Dynamic Forms */}
      <AnimatePresence mode="wait">

        {/* FLIGHTS FORM */}
        {activeService === 'flights' && (
          <motion.form
            key="flights"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            onSubmit={flightForm.handleSubmit(onFlightSubmit)}
            className="space-y-4"
          >
            {/* Trip Type Pills */}
            <div className="flex items-center gap-4 text-xs font-semibold text-[#2A2A2A]/70 pb-1">
              {(['one-way', 'round-trip', 'multi-city'] as const).map((type) => (
                <label key={type} className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    value={type}
                    {...flightForm.register('tripType')}
                    className="accent-[#C84B31]"
                  />
                  <span className="capitalize">{type.replace('-', ' ')}</span>
                </label>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end">
              <div className="lg:col-span-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#2A2A2A]/60 mb-1 flex items-center gap-1.5">
                  <Plane className="w-3.5 h-3.5 text-[#C84B31]" /> From
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bhubaneswar (BBI)"
                  {...flightForm.register('origin')}
                  className="w-full bg-[#FDFBF7] border border-black/10 rounded-2xl px-4 py-3 text-sm text-[#2A2A2A] font-medium focus:outline-none focus:border-[#C84B31]"
                />
                <FieldError error={flightForm.formState.errors.origin?.message} />
              </div>

              <div className="lg:col-span-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#2A2A2A]/60 mb-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#C84B31]" /> To
                </label>
                <input
                  type="text"
                  placeholder="e.g. New Delhi (DEL)"
                  {...flightForm.register('destination')}
                  className="w-full bg-[#FDFBF7] border border-black/10 rounded-2xl px-4 py-3 text-sm text-[#2A2A2A] font-medium focus:outline-none focus:border-[#C84B31]"
                />
                <FieldError error={flightForm.formState.errors.destination?.message} />
              </div>

              <div className="lg:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#2A2A2A]/60 mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#C84B31]" /> Departure
                </label>
                <input
                  type="date"
                  {...flightForm.register('departureDate')}
                  className="w-full bg-[#FDFBF7] border border-black/10 rounded-2xl px-3 py-3 text-sm text-[#2A2A2A] font-medium focus:outline-none focus:border-[#C84B31]"
                />
                <FieldError error={flightForm.formState.errors.departureDate?.message} />
              </div>

              {flightForm.watch('tripType') === 'round-trip' && (
                <div className="lg:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#2A2A2A]/60 mb-1 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#C84B31]" /> Return
                  </label>
                  <input
                    type="date"
                    {...flightForm.register('returnDate')}
                    className="w-full bg-[#FDFBF7] border border-black/10 rounded-2xl px-3 py-3 text-sm text-[#2A2A2A] font-medium focus:outline-none focus:border-[#C84B31]"
                  />
                </div>
              )}

              <div className="lg:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#2A2A2A]/60 mb-1 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-[#C84B31]" /> Travellers
                </label>
                <select
                  {...flightForm.register('passengers', { valueAsNumber: true })}
                  className="w-full bg-[#FDFBF7] border border-black/10 rounded-2xl px-3 py-3 text-sm text-[#2A2A2A] font-medium focus:outline-none focus:border-[#C84B31]"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                    <option key={n} value={n}>{n} Traveller{n > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>

              <div className="lg:col-span-2">
                <button
                  type="submit"
                  className="w-full bg-[#C84B31] text-white py-3.5 px-6 rounded-2xl font-bold hover:bg-[#A63A25] active:scale-98 transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#C84B31]/20 cursor-pointer"
                >
                  <span>Search</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.form>
        )}

        {/* HOTELS FORM */}
        {activeService === 'hotels' && (
          <motion.form
            key="hotels"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            onSubmit={hotelForm.handleSubmit(onHotelSubmit)}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end"
          >
            <div className="lg:col-span-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#2A2A2A]/60 mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#C84B31]" /> City or Destination
              </label>
              <input
                type="text"
                placeholder="e.g. Goa, Manali, Jaipur, Tokyo"
                {...hotelForm.register('destination')}
                className="w-full bg-[#FDFBF7] border border-black/10 rounded-2xl px-4 py-3 text-sm text-[#2A2A2A] font-medium focus:outline-none focus:border-[#C84B31]"
              />
              <FieldError error={hotelForm.formState.errors.destination?.message} />
            </div>

            <div className="lg:col-span-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#2A2A2A]/60 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#C84B31]" /> Check-in Date
              </label>
              <input
                type="date"
                {...hotelForm.register('checkIn')}
                className="w-full bg-[#FDFBF7] border border-black/10 rounded-2xl px-3 py-3 text-sm text-[#2A2A2A] font-medium focus:outline-none focus:border-[#C84B31]"
              />
              <FieldError error={hotelForm.formState.errors.checkIn?.message} />
            </div>

            <div className="lg:col-span-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#2A2A2A]/60 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#C84B31]" /> Check-out Date
              </label>
              <input
                type="date"
                {...hotelForm.register('checkOut')}
                className="w-full bg-[#FDFBF7] border border-black/10 rounded-2xl px-3 py-3 text-sm text-[#2A2A2A] font-medium focus:outline-none focus:border-[#C84B31]"
              />
              <FieldError error={hotelForm.formState.errors.checkOut?.message} />
            </div>

            <div className="lg:col-span-2">
              <button
                type="submit"
                className="w-full bg-[#C84B31] text-white py-3.5 px-6 rounded-2xl font-bold hover:bg-[#A63A25] active:scale-98 transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#C84B31]/20 cursor-pointer"
              >
                <span>Search Stays</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.form>
        )}

        {/* BUSES FORM */}
        {activeService === 'buses' && (
          <motion.form
            key="buses"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            onSubmit={busForm.handleSubmit(onBusSubmit)}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end"
          >
            <div className="lg:col-span-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#2A2A2A]/60 mb-1 flex items-center gap-1.5">
                <Bus className="w-3.5 h-3.5 text-[#C84B31]" /> Leaving From
              </label>
              <input
                type="text"
                placeholder="e.g. Bangalore, Mumbai, Pune"
                {...busForm.register('from')}
                className="w-full bg-[#FDFBF7] border border-black/10 rounded-2xl px-4 py-3 text-sm text-[#2A2A2A] font-medium focus:outline-none focus:border-[#C84B31]"
              />
              <FieldError error={busForm.formState.errors.from?.message} />
            </div>

            <div className="lg:col-span-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#2A2A2A]/60 mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#C84B31]" /> Going To
              </label>
              <input
                type="text"
                placeholder="e.g. Hyderabad, Goa, Chennai"
                {...busForm.register('to')}
                className="w-full bg-[#FDFBF7] border border-black/10 rounded-2xl px-4 py-3 text-sm text-[#2A2A2A] font-medium focus:outline-none focus:border-[#C84B31]"
              />
              <FieldError error={busForm.formState.errors.to?.message} />
            </div>

            <div className="lg:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#2A2A2A]/60 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#C84B31]" /> Journey Date
              </label>
              <input
                type="date"
                {...busForm.register('departureDate')}
                className="w-full bg-[#FDFBF7] border border-black/10 rounded-2xl px-3 py-3 text-sm text-[#2A2A2A] font-medium focus:outline-none focus:border-[#C84B31]"
              />
              <FieldError error={busForm.formState.errors.departureDate?.message} />
            </div>

            <div className="lg:col-span-2">
              <button
                type="submit"
                className="w-full bg-[#C84B31] text-white py-3.5 px-6 rounded-2xl font-bold hover:bg-[#A63A25] active:scale-98 transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#C84B31]/20 cursor-pointer"
              >
                <span>Search Buses</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.form>
        )}

        {/* CABS & AUTO FORM */}
        {activeService === 'cabs' && (
          <motion.form
            key="cabs"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            onSubmit={cabForm.handleSubmit(onCabSubmit)}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end"
          >
            <div className="lg:col-span-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#2A2A2A]/60 mb-1 flex items-center gap-1.5">
                <Car className="w-3.5 h-3.5 text-[#C84B31]" /> Pickup Location
              </label>
              <input
                type="text"
                placeholder="e.g. Airport, Hotel, or Current Location"
                {...cabForm.register('pickup')}
                className="w-full bg-[#FDFBF7] border border-black/10 rounded-2xl px-4 py-3 text-sm text-[#2A2A2A] font-medium focus:outline-none focus:border-[#C84B31]"
              />
              <FieldError error={cabForm.formState.errors.pickup?.message} />
            </div>

            <div className="lg:col-span-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#2A2A2A]/60 mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#C84B31]" /> Dropoff Destination
              </label>
              <input
                type="text"
                placeholder="e.g. City Center, Resort, Railway Station"
                {...cabForm.register('drop')}
                className="w-full bg-[#FDFBF7] border border-black/10 rounded-2xl px-4 py-3 text-sm text-[#2A2A2A] font-medium focus:outline-none focus:border-[#C84B31]"
              />
              <FieldError error={cabForm.formState.errors.drop?.message} />
            </div>

            <div className="lg:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#2A2A2A]/60 mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#C84B31]" /> Pickup Time
              </label>
              <input
                type="time"
                {...cabForm.register('time')}
                className="w-full bg-[#FDFBF7] border border-black/10 rounded-2xl px-3 py-3 text-sm text-[#2A2A2A] font-medium focus:outline-none focus:border-[#C84B31]"
              />
            </div>

            <div className="lg:col-span-2">
              <button
                type="submit"
                className="w-full bg-[#C84B31] text-white py-3.5 px-6 rounded-2xl font-bold hover:bg-[#A63A25] active:scale-98 transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#C84B31]/20 cursor-pointer"
              >
                <span>Book Cab / Auto</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.form>
        )}

        {/* EXPERIENCES FORM */}
        {activeService === 'experiences' && (
          <motion.form
            key="experiences"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            onSubmit={experienceForm.handleSubmit(onExperienceSubmit)}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end"
          >
            <div className="lg:col-span-6">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#2A2A2A]/60 mb-1 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-[#C84B31]" /> Destination or Activity
              </label>
              <input
                type="text"
                placeholder="e.g. Scuba diving, Heritage Walk, Desert Safari, Cooking Class"
                {...experienceForm.register('where')}
                className="w-full bg-[#FDFBF7] border border-black/10 rounded-2xl px-4 py-3 text-sm text-[#2A2A2A] font-medium focus:outline-none focus:border-[#C84B31]"
              />
              <FieldError error={experienceForm.formState.errors.where?.message} />
            </div>

            <div className="lg:col-span-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#2A2A2A]/60 mb-1 flex items-center gap-1.5">
                <ArrowRightLeft className="w-3.5 h-3.5 text-[#C84B31]" /> Category
              </label>
              <select
                {...experienceForm.register('category')}
                className="w-full bg-[#FDFBF7] border border-black/10 rounded-2xl px-4 py-3 text-sm text-[#2A2A2A] font-medium focus:outline-none focus:border-[#C84B31]"
              >
                <option value="All">All Categories</option>
                <option value="Heritage">Heritage & Culture</option>
                <option value="Adventure">Adventure & Outdoors</option>
                <option value="Nature">Nature & Wildlife</option>
                <option value="Beach">Beach & Water Sports</option>
                <option value="Food Tours">Food Tours & Culinary</option>
                <option value="Temple">Temple & Spiritual</option>
              </select>
            </div>

            <div className="lg:col-span-2">
              <button
                type="submit"
                className="w-full bg-[#C84B31] text-white py-3.5 px-6 rounded-2xl font-bold hover:bg-[#A63A25] active:scale-98 transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#C84B31]/20 cursor-pointer"
              >
                <span>Find Activities</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.form>
        )}

      </AnimatePresence>

    </div>
  );
};
