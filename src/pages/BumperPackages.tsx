import React, { useState, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Sparkles, Gift, MapPin, Plane, Train, Bus, Car, 
  CheckCircle, ArrowRight, Shield, Heart, Star, Clock,
  Filter, Tag
} from 'lucide-react';
import { BUMPER_PACKAGES, type BumperPackage } from '../data/bumperPackagesData';
import { useAuth } from '../context/AuthContext';

export const BumperPackages: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const destinationFilter = searchParams.get('destination') || 'All';

  const [selectedDestination, setSelectedDestination] = useState(destinationFilter);

  const destinationsList = useMemo(() => {
    return ['All', ...new Set(BUMPER_PACKAGES.map(p => p.destination))];
  }, []);

  const filteredPackages = useMemo(() => {
    if (selectedDestination === 'All') return BUMPER_PACKAGES;
    return BUMPER_PACKAGES.filter(
      p => p.destination.toLowerCase() === selectedDestination.toLowerCase()
    );
  }, [selectedDestination]);

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans text-[#2A2A2A] pb-24">
      {/* 1. TOP NAVBAR */}
      <nav className="border-b border-black/5 bg-white/90 backdrop-blur-md sticky top-0 z-50 transition-all">
        <div className="max-w-[1360px] mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 text-[#2A2A2A] hover:opacity-80 transition-opacity no-underline">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#C84B31] to-[#E06D53] flex items-center justify-center text-white shadow-sm">
              <Gift className="w-5 h-5" />
            </div>
            <span className="font-display text-[26px] text-black leading-none select-none tracking-tight">
              Yatra Setu
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link 
              to="/destinations" 
              className="text-[14px] font-semibold uppercase tracking-[0.04em] text-[#2A2A2A]/70 hover:text-[#C84B31] transition-colors"
            >
              Discover
            </Link>
            <span className="text-[14px] font-bold uppercase tracking-[0.04em] text-[#C84B31] border-b-2 border-[#C84B31] pb-1">
              Bumper Packages
            </span>
            <Link 
              to="/itineraries/generate" 
              className="text-[14px] font-semibold uppercase tracking-[0.04em] text-[#2A2A2A]/70 hover:text-[#C84B31] transition-colors"
            >
              AI Trip Planner
            </Link>
            <Link 
              to="/help" 
              className="text-[14px] font-semibold uppercase tracking-[0.04em] text-[#2A2A2A]/70 hover:text-[#C84B31] transition-colors"
            >
              FAQs & Help
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="text-xs sm:text-sm font-semibold uppercase text-[#292929] tracking-wider hover:text-[#C84B31] transition-colors bg-white px-3.5 py-1.5 rounded-full border border-black/10 shadow-xs cursor-pointer"
              >
                Dashboard
              </button>
            ) : (
              <Link
                to="/login"
                state={{ isRegister: true }}
                className="text-xs sm:text-sm font-semibold uppercase text-[#C84B31] tracking-wider hover:opacity-80 transition-opacity"
              >
                Register
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* 2. HERO SHOWCASE */}
      <section className="relative pt-16 pb-12 px-6 max-w-[1360px] mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-black/10 text-xs font-bold uppercase tracking-wider text-[#C84B31] shadow-xs mb-4">
          <Sparkles className="w-3.5 h-3.5 text-[#C84B31]" />
          <span>All-in-One Curated Travel Packages across India</span>
        </div>

        <h1 className="text-[clamp(36px,5vw,56px)] font-serif font-medium text-[#2A2A2A] leading-[1.1] max-w-[850px] mx-auto mb-4">
          Bumper Packages for Extraordinary Journeys
        </h1>

        <p className="text-base sm:text-lg text-[#2A2A2A]/70 max-w-[640px] mx-auto leading-relaxed">
          Flights, scenic trains, luxury AC sleeper buses, verified 4-star/5-star hotels, and guided local tours—bundled seamlessly with real-time discounts.
        </p>

        {/* Destination Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 mt-8">
          {destinationsList.map((dest) => (
            <button
              key={dest}
              onClick={() => setSelectedDestination(dest)}
              className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                selectedDestination === dest
                  ? 'bg-[#C84B31] text-white shadow-md'
                  : 'bg-white text-[#2A2A2A]/70 border border-black/10 hover:border-black/20 hover:text-[#2A2A2A]'
              }`}
            >
              {dest === 'All' ? '🌟 All Destinations' : dest}
            </button>
          ))}
        </div>
      </section>

      {/* 3. PACKAGES GRID */}
      <section className="max-w-[1360px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPackages.map((pkg) => (
            <div 
              key={pkg.id}
              className="group bg-white rounded-3xl overflow-hidden border border-black/5 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
            >
              {/* Image Banner */}
              <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
                <img 
                  src={pkg.heroImage} 
                  alt={pkg.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-[#C84B31] shadow-xs">
                  {pkg.badge}
                </div>
                <div className="absolute top-4 right-4 bg-emerald-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-xs">
                  {pkg.discountPercent}% OFF
                </div>
                <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md text-white px-3.5 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{pkg.duration}</span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                    <span className="flex items-center gap-1 font-semibold text-[#C84B31]">
                      <MapPin className="w-3.5 h-3.5" />
                      {pkg.destination}
                    </span>
                    <span className="flex items-center gap-1 text-gray-700 font-bold">
                      <Star className="w-3.5 h-3.5 text-yellow-400 fill-current" />
                      {pkg.rating} ({pkg.reviewsCount})
                    </span>
                  </div>

                  <h3 className="font-serif text-xl font-bold text-[#2A2A2A] leading-snug group-hover:text-[#C84B31] transition-colors">
                    {pkg.title}
                  </h3>

                  <p className="text-xs text-[#2A2A2A]/70 line-clamp-2 mt-2 leading-relaxed">
                    {pkg.description}
                  </p>

                  {/* Included Transport Badges */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-4">
                    {pkg.includedModes.map((mode) => (
                      <span 
                        key={mode}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FDFBF7] border border-black/5 text-[11px] font-semibold text-gray-700 capitalize"
                      >
                        {mode === 'flight' && <Plane className="w-3 h-3 text-[#C84B31]" />}
                        {mode === 'train' && <Train className="w-3 h-3 text-[#C84B31]" />}
                        {mode === 'bus' && <Bus className="w-3 h-3 text-[#C84B31]" />}
                        {mode === 'cab' && <Car className="w-3 h-3 text-[#C84B31]" />}
                        <span>{mode} included</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Price & Action */}
                <div className="pt-4 border-t border-black/5 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-gray-400 line-through">₹{pkg.originalPrice.toLocaleString()}</span>
                    <div className="text-xl font-bold text-[#2A2A2A]">
                      ₹{pkg.discountedPrice.toLocaleString()}
                      <span className="text-[11px] font-normal text-gray-500"> / person</span>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate(`/packages/${pkg.slug}`)}
                    className="inline-flex items-center gap-1.5 bg-[#C84B31] hover:bg-[#A63A25] text-white px-5 py-2.5 rounded-full text-xs font-bold transition-all shadow-sm group-hover:shadow-md cursor-pointer"
                  >
                    <span>View Package</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default BumperPackages;
