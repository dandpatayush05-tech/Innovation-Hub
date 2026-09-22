import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  MapPin, ArrowLeft, Heart, Share2, Compass, Calendar, DollarSign,
  CloudRain, Sun, Wind, Thermometer, Plane, Train, Bus, Car, 
  Utensils, Landmark, Sparkles, ShieldCheck, Clock, Ticket, 
  ChevronLeft, ChevronRight, ExternalLink, Award, CheckCircle2, 
  Navigation, Info, Luggage, ArrowRight
} from 'lucide-react';
import { getDestination, getDestinationDetail, getDestinationWeather } from '../api/destinations';
import { DestinationMap } from '../components/DestinationMap';
import { ErrorState } from '../components/states/ErrorState';
import { getComprehensiveDestination, ComprehensiveDestinationDetail } from '../data/destinationDetailsData';
import { getBumperPackagesByDestination, BumperPackage, BUMPER_PACKAGES } from '../data/bumperPackagesData';

export const DestinationDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [destination, setDestination] = useState<any>(null);
  const [comprehensiveData, setComprehensiveData] = useState<ComprehensiveDestinationDetail | null>(null);
  const [bumperPackages, setBumperPackages] = useState<BumperPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [selectedTransitMode, setSelectedTransitMode] = useState<'all' | 'flight' | 'train' | 'bus' | 'cab'>('all');

  // Horizontal Carousel scroll references
  const photoCarouselRef = useRef<HTMLDivElement>(null);
  const foodCarouselRef = useRef<HTMLDivElement>(null);

  const scrollCarousel = (ref: React.RefObject<HTMLDivElement | null>, direction: 'left' | 'right') => {
    if (ref.current) {
      const scrollAmount = direction === 'left' ? -380 : 380;
      ref.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const loadDestinationData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        // 1. Try fetching from backend API
        let apiDest: any = null;
        try {
          const res = await getDestination(id);
          apiDest = res?.data || res;
        } catch (apiErr) {
          console.warn('API destination lookup fallback to static data:', apiErr);
        }

        // 2. Load comprehensive enriched details
        const enriched = getComprehensiveDestination(id) || (apiDest?.name ? getComprehensiveDestination(apiDest.name) : undefined);
        
        if (enriched) {
          setComprehensiveData(enriched);
          const pkgs = getBumperPackagesByDestination(enriched.name);
          setBumperPackages(pkgs.length > 0 ? pkgs : BUMPER_PACKAGES.slice(0, 2));
        }

        setDestination(apiDest || {
          id: enriched?.id || id,
          name: enriched?.name || 'Incredible Destination',
          country: enriched?.country || 'India',
          description: enriched?.overviewDescription || 'Discover iconic heritage, spiritual roots, authentic cuisines and seamless travel routes.',
          image_url: enriched?.heroImage || 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=1200&auto=format&fit=crop',
          latitude: enriched?.latitude || 25.3176,
          longitude: enriched?.longitude || 82.9739
        });
      } catch (err) {
        console.error('Failed to load destination details:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDestinationData();
  }, [id]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${destination?.name || 'Destination'} – Yatra Setu`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] font-sans pb-24">
        <div className="h-[60vh] min-h-[480px] w-full bg-stone-200 animate-pulse" />
        <div className="max-w-[1360px] mx-auto px-6 pt-12 space-y-8">
          <div className="h-10 w-1/3 bg-stone-200 animate-pulse rounded-2xl" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 h-96 bg-stone-200 animate-pulse rounded-3xl" />
            <div className="h-96 bg-stone-200 animate-pulse rounded-3xl" />
          </div>
        </div>
      </div>
    );
  }

  const data = comprehensiveData;
  const destLat = destination?.latitude || data?.latitude || 25.3176;
  const destLng = destination?.longitude || data?.longitude || 82.9739;
  const filteredTransit = data?.transitGuide.options.filter(
    opt => selectedTransitMode === 'all' || opt.mode === selectedTransitMode
  ) || [];

  return (
    <div className="min-h-screen bg-[#FAF8F5] font-sans text-stone-900 pb-28">
      {/* Top Floating Glass Navigation */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-stone-900/40 backdrop-blur-md border-b border-white/10 transition-all">
        <div className="max-w-[1380px] mx-auto px-6 h-20 flex items-center justify-between">
          <Link 
            to="/destinations" 
            className="flex items-center space-x-2 text-white/90 hover:text-white bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2 rounded-full text-sm font-semibold transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>All Destinations</span>
          </Link>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleShare}
              className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 px-4 py-2 rounded-full text-sm font-medium transition"
            >
              <Share2 className="w-4 h-4" />
              <span>{copiedLink ? 'Link Copied!' : 'Share'}</span>
            </button>
            <button
              onClick={() => setSaved(!saved)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-semibold transition shadow-md ${
                saved ? 'bg-rose-600 text-white' : 'bg-white/15 hover:bg-white/25 text-white border border-white/20'
              }`}
            >
              <Heart className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
              <span>{saved ? 'Saved' : 'Save'}</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-[70vh] min-h-[520px] w-full overflow-hidden bg-stone-950">
        <img 
          src={data?.heroImage || destination?.image_url || 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=1600&auto=format&fit=crop'} 
          alt={destination?.name || 'Destination Hero'}
          className="absolute inset-0 w-full h-full object-cover opacity-90 scale-105 animate-fade-in"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/45 to-stone-950/20" />

        <div className="absolute inset-0 flex flex-col justify-end pb-14">
          <div className="max-w-[1380px] mx-auto px-6 w-full text-white">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="inline-flex items-center gap-1.5 bg-amber-500/90 text-stone-950 text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
                <Sparkles className="w-3.5 h-3.5" /> Featured Destination
              </span>
              {data?.historyAndArtifacts?.unescoStatus && (
                <span className="inline-flex items-center gap-1.5 bg-blue-500/80 text-white text-xs font-semibold px-3 py-1 rounded-full backdrop-blur-sm">
                  <Award className="w-3.5 h-3.5" /> {data.historyAndArtifacts.unescoStatus}
                </span>
              )}
            </div>

            <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif font-black tracking-tight mb-3">
              {destination?.name || data?.name}
            </h1>
            
            <p className="text-xl sm:text-2xl text-amber-200/90 font-medium mb-4 max-w-3xl">
              {data?.tagline || 'Sacred Heritage, Timeless Culture & Vibrant Landscapes'}
            </p>

            <p className="text-base sm:text-lg text-white/80 max-w-3xl leading-relaxed mb-8">
              {data?.overviewDescription || destination?.description}
            </p>

            {/* Quick Action Badges & CTAs */}
            <div className="flex flex-wrap items-center gap-4">
              {bumperPackages.length > 0 && (
                <Link
                  to={`/packages/${bumperPackages[0].slug}`}
                  className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-stone-950 font-black px-7 py-3.5 rounded-full text-sm shadow-xl flex items-center space-x-2 transition transform hover:-translate-y-0.5"
                >
                  <Luggage className="w-4 h-4 text-stone-950" />
                  <span>Book Bumper Holiday Package</span>
                  <ArrowRight className="w-4 h-4 text-stone-950" />
                </Link>
              )}

              <button
                onClick={() => navigate(`/itineraries/generate?destination=${encodeURIComponent(destination?.name || 'Destination')}`)}
                className="bg-white/15 hover:bg-white/25 text-white border border-white/30 backdrop-blur-md font-bold px-6 py-3.5 rounded-full text-sm transition flex items-center space-x-2"
              >
                <Compass className="w-4 h-4 text-amber-300" />
                <span>Plan AI Smart Itinerary</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-[1380px] mx-auto px-6 pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* LEFT CONTENT COLUMN (8 cols) */}
          <div className="lg:col-span-8 space-y-14">
            
            {/* 1. HISTORY & HERITAGE ARTIFACTS SECTION */}
            {data?.historyAndArtifacts && (
              <section className="bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-stone-200/80">
                <div className="flex items-center justify-between pb-6 mb-6 border-b border-stone-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-800 shadow-inner">
                      <Landmark className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-700">Historical Chronicles</span>
                      <h2 className="text-2xl font-serif font-bold text-stone-900">{data.historyAndArtifacts.title}</h2>
                    </div>
                  </div>
                  <span className="hidden sm:inline-block bg-stone-100 text-stone-700 text-xs font-bold px-3 py-1.5 rounded-full">
                    {data.historyAndArtifacts.period}
                  </span>
                </div>

                <p className="text-stone-700 leading-relaxed text-base sm:text-lg mb-8">
                  {data.historyAndArtifacts.narrative}
                </p>

                {/* Key Artifacts & Relics Badges */}
                {data.historyAndArtifacts.keyArtifacts?.length > 0 && (
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-wider text-stone-500 mb-3 flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-amber-600" /> Key Historical Artifacts & Monuments
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {data.historyAndArtifacts.keyArtifacts.map((artifact, i) => (
                        <span 
                          key={i} 
                          className="bg-amber-50/80 border border-amber-200/80 text-amber-950 font-medium text-xs sm:text-sm px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-amber-700 flex-shrink-0" />
                          {artifact}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* 2. SCENIC PHOTO GALLERY (Scroll Left & Right Carousel) */}
            {data?.galleryImages && data.galleryImages.length > 0 && (
              <section className="bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-stone-200/80">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-teal-700">Visual Journey</span>
                    <h2 className="text-2xl font-serif font-bold text-stone-900">Scenic Photo Gallery</h2>
                  </div>
                  {/* Left & Right Scroll Buttons */}
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => scrollCarousel(photoCarouselRef, 'left')}
                      className="w-10 h-10 rounded-full border border-stone-300 hover:border-stone-900 bg-white hover:bg-stone-50 text-stone-700 flex items-center justify-center transition shadow-sm"
                      title="Scroll Left"
                      aria-label="Scroll photo gallery left"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => scrollCarousel(photoCarouselRef, 'right')}
                      className="w-10 h-10 rounded-full border border-stone-300 hover:border-stone-900 bg-white hover:bg-stone-50 text-stone-700 flex items-center justify-center transition shadow-sm"
                      title="Scroll Right"
                      aria-label="Scroll photo gallery right"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Horizontal Scrollable Row */}
                <div 
                  ref={photoCarouselRef}
                  className="flex gap-5 overflow-x-auto hide-scrollbar scroll-smooth pb-4"
                  style={{ scrollSnapType: 'x mandatory' }}
                >
                  {data.galleryImages.map((img, idx) => (
                    <div 
                      key={idx}
                      className="flex-none w-[320px] sm:w-[380px] rounded-2xl overflow-hidden bg-stone-900 shadow-md group border border-stone-200 relative"
                      style={{ scrollSnapAlign: 'start' }}
                    >
                      <div className="h-64 sm:h-72 overflow-hidden relative">
                        <img 
                          src={img.url} 
                          alt={img.caption} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                        <span className="absolute top-3 left-3 bg-stone-900/80 backdrop-blur-md text-amber-300 text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-white/20">
                          {img.tag}
                        </span>
                        <p className="absolute bottom-3 inset-x-3 text-white text-sm font-semibold drop-shadow-md">
                          {img.caption}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 3. AUTHENTIC REGIONAL FOODS & FLAVORS (Scroll Left & Right Carousel) */}
            {data?.famousFoods && data.famousFoods.length > 0 && (
              <section className="bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-stone-200/80">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-rose-700 flex items-center gap-1.5">
                      <Utensils className="w-4 h-4 text-rose-600" /> Culinary Delights
                    </span>
                    <h2 className="text-2xl font-serif font-bold text-stone-900">Famous Regional Foods & Must-Try Dishes</h2>
                  </div>
                  {/* Left & Right Scroll Buttons */}
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => scrollCarousel(foodCarouselRef, 'left')}
                      className="w-10 h-10 rounded-full border border-stone-300 hover:border-stone-900 bg-white hover:bg-stone-50 text-stone-700 flex items-center justify-center transition shadow-sm"
                      title="Scroll Foods Left"
                      aria-label="Scroll food carousel left"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => scrollCarousel(foodCarouselRef, 'right')}
                      className="w-10 h-10 rounded-full border border-stone-300 hover:border-stone-900 bg-white hover:bg-stone-50 text-stone-700 flex items-center justify-center transition shadow-sm"
                      title="Scroll Foods Right"
                      aria-label="Scroll food carousel right"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Horizontal Scrollable Foods Row */}
                <div 
                  ref={foodCarouselRef}
                  className="flex gap-6 overflow-x-auto hide-scrollbar scroll-smooth pb-4"
                  style={{ scrollSnapType: 'x mandatory' }}
                >
                  {data.famousFoods.map(food => (
                    <div 
                      key={food.id}
                      className="flex-none w-[300px] sm:w-[340px] rounded-2xl overflow-hidden bg-stone-50 border border-stone-200/90 shadow-sm hover:shadow-md transition flex flex-col"
                      style={{ scrollSnapAlign: 'start' }}
                    >
                      <div className="h-48 overflow-hidden relative">
                        <img 
                          src={food.imageUrl} 
                          alt={food.name} 
                          className="w-full h-full object-cover hover:scale-105 transition duration-500"
                        />
                        <span className={`absolute top-3 left-3 text-[11px] font-black uppercase px-2.5 py-1 rounded-md shadow-md flex items-center gap-1 ${
                          food.vegNonVeg === 'veg' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
                        }`}>
                          <span className={`w-2 h-2 rounded-full ${food.vegNonVeg === 'veg' ? 'bg-emerald-200' : 'bg-red-200'}`} />
                          {food.vegNonVeg === 'veg' ? 'Pure Veg' : 'Non-Veg'}
                        </span>
                        <span className="absolute bottom-3 right-3 bg-stone-950/80 backdrop-blur-md text-amber-300 text-xs font-bold px-2.5 py-1 rounded-lg">
                          {food.priceRange}
                        </span>
                      </div>

                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded">
                            {food.category}
                          </span>
                          <h3 className="text-lg font-bold text-stone-900 mt-2 mb-1.5">{food.name}</h3>
                          <p className="text-stone-600 text-xs sm:text-sm leading-relaxed mb-4">
                            {food.description}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-stone-200 flex items-start space-x-2 text-xs text-stone-700">
                          <MapPin className="w-3.5 h-3.5 text-rose-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="font-semibold text-stone-900">Iconic Eatery:</span>{' '}
                            <span className="text-stone-600">{food.famousSpot}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 4. TOP ATTRACTIONS & BEST PLACES TO VISIT */}
            {data?.topAttractions && data.topAttractions.length > 0 && (
              <section className="bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-stone-200/80">
                <div className="flex items-center space-x-3 mb-8">
                  <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-800 shadow-inner">
                    <Compass className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-700">Must-See Landmarks</span>
                    <h2 className="text-2xl font-serif font-bold text-stone-900">Best Places to Visit</h2>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {data.topAttractions.map(attr => (
                    <div 
                      key={attr.id}
                      className="rounded-2xl border border-stone-200 overflow-hidden bg-stone-50/50 hover:bg-white hover:shadow-md transition group flex flex-col"
                    >
                      <div className="h-52 overflow-hidden relative">
                        <img 
                          src={attr.imageUrl} 
                          alt={attr.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
                        <span className="absolute top-3 left-3 bg-stone-900/80 backdrop-blur-md text-amber-300 text-xs font-bold px-3 py-1 rounded-full">
                          {attr.entryFee}
                        </span>
                        <div className="absolute bottom-3 inset-x-3 text-white">
                          <h3 className="text-lg font-bold drop-shadow-md">{attr.name}</h3>
                          <p className="text-xs text-amber-200/90 font-medium">{attr.tagline}</p>
                        </div>
                      </div>

                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
                          {attr.description}
                        </p>

                        <div className="space-y-2 pt-3 border-t border-stone-200 text-xs text-stone-600">
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1.5 font-medium text-stone-700">
                              <Clock className="w-3.5 h-3.5 text-blue-600" /> Timings:
                            </span>
                            <span className="font-semibold text-stone-900">{attr.timings}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1.5 font-medium text-stone-700">
                              <Sun className="w-3.5 h-3.5 text-amber-600" /> Best Time:
                            </span>
                            <span className="font-semibold text-stone-900">{attr.bestTimeToVisit}</span>
                          </div>
                          <div className="bg-amber-50 p-2.5 rounded-xl text-amber-900 text-[11px] font-medium flex items-center gap-1.5 border border-amber-200/60">
                            <Sparkles className="w-3.5 h-3.5 text-amber-700 flex-shrink-0" />
                            <span>{attr.highlight}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 5. MULTIMODAL TRANSIT GUIDE & DIRECT BOOKING ROUTES */}
            {data?.transitGuide && (
              <section className="bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-stone-200/80">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-800 shadow-inner">
                      <Navigation className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">How to Reach</span>
                      <h2 className="text-2xl font-serif font-bold text-stone-900">Transit Routes & Direct Bookings</h2>
                    </div>
                  </div>

                  {/* Mode Filter Pills */}
                  <div className="flex flex-wrap gap-1.5 bg-stone-100 p-1 rounded-2xl">
                    {(['all', 'flight', 'train', 'bus', 'cab'] as const).map(mode => (
                      <button
                        key={mode}
                        onClick={() => setSelectedTransitMode(mode)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition ${
                          selectedTransitMode === mode 
                            ? 'bg-stone-900 text-white shadow-sm' 
                            : 'text-stone-600 hover:text-stone-900'
                        }`}
                      >
                        {mode === 'all' ? 'All Modes' : mode}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Transit Hub Overview Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                  <div className="bg-stone-50 border border-stone-200 p-4 rounded-2xl">
                    <div className="flex items-center space-x-2 text-blue-700 font-bold text-xs uppercase mb-1">
                      <Plane className="w-4 h-4" /> Nearest Airport
                    </div>
                    <p className="text-stone-900 font-semibold text-sm">{data.transitGuide.nearestAirport}</p>
                  </div>
                  <div className="bg-stone-50 border border-stone-200 p-4 rounded-2xl">
                    <div className="flex items-center space-x-2 text-emerald-700 font-bold text-xs uppercase mb-1">
                      <Train className="w-4 h-4" /> Main Railway Station
                    </div>
                    <p className="text-stone-900 font-semibold text-sm">{data.transitGuide.nearestRailwayStation}</p>
                  </div>
                  <div className="bg-stone-50 border border-stone-200 p-4 rounded-2xl">
                    <div className="flex items-center space-x-2 text-amber-700 font-bold text-xs uppercase mb-1">
                      <Car className="w-4 h-4" /> Major Highways
                    </div>
                    <p className="text-stone-900 font-semibold text-sm">{data.transitGuide.majorHighways}</p>
                  </div>
                </div>

                {/* Transit Options Detailed Cards */}
                <div className="space-y-5">
                  {filteredTransit.map((opt, idx) => (
                    <div 
                      key={idx}
                      className="border border-stone-200 rounded-2xl p-6 bg-white hover:border-stone-400 transition shadow-sm space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            opt.mode === 'flight' ? 'bg-blue-100 text-blue-700' :
                            opt.mode === 'train' ? 'bg-emerald-100 text-emerald-700' :
                            opt.mode === 'bus' ? 'bg-orange-100 text-orange-700' : 'bg-purple-100 text-purple-700'
                          }`}>
                            {opt.mode === 'flight' && <Plane className="w-5 h-5" />}
                            {opt.mode === 'train' && <Train className="w-5 h-5" />}
                            {opt.mode === 'bus' && <Bus className="w-5 h-5" />}
                            {opt.mode === 'cab' && <Car className="w-5 h-5" />}
                          </div>
                          <div>
                            <h3 className="font-bold text-base sm:text-lg text-stone-900">{opt.title}</h3>
                            <p className="text-xs text-stone-500 font-medium">{opt.subTitle}</p>
                          </div>
                        </div>

                        <div className="text-right flex sm:flex-col items-center sm:items-end justify-between sm:justify-center">
                          <span className="text-xs text-stone-500">Approx. Fare</span>
                          <span className="text-lg font-black text-stone-900">{opt.approxFare}</span>
                        </div>
                      </div>

                      <p className="text-stone-600 text-sm leading-relaxed">{opt.description}</p>

                      {/* Routes Tags */}
                      <div className="space-y-1.5">
                        <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Popular Express Routes:</span>
                        <div className="flex flex-wrap gap-2">
                          {opt.routes.map((r, ri) => (
                            <span key={ri} className="bg-stone-100 text-stone-800 text-xs px-2.5 py-1 rounded-lg font-medium">
                              {r}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-stone-500">
                        <div className="flex items-center space-x-4">
                          <span><strong>Duration:</strong> {opt.duration}</span>
                          <span><strong>Frequency:</strong> {opt.frequency}</span>
                        </div>

                        <Link
                          to={opt.bookingLink}
                          className="inline-flex items-center justify-center space-x-1.5 bg-stone-900 hover:bg-black text-white font-bold px-4 py-2 rounded-xl transition text-xs shadow-sm"
                        >
                          <span>Book / Search {opt.mode.toUpperCase()}</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 6. LINKED BUMPER PACKAGES PROMOTION SECTION */}
            {bumperPackages.length > 0 && (
              <section className="bg-gradient-to-br from-stone-900 via-stone-950 to-stone-900 rounded-3xl p-8 sm:p-10 text-white shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                  <div>
                    <span className="text-amber-400 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-400" /> All-in-One Inclusive Combos
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white mt-1">
                      Bumper Holiday Packages for {destination?.name || data?.name}
                    </h2>
                    <p className="text-stone-300 text-xs sm:text-sm mt-1">
                      Flight/Train/Bus + Luxury Hotels + Senior Special Care + Interactive Seat Picker
                    </p>
                  </div>

                  <Link 
                    to="/packages"
                    className="text-amber-400 hover:text-amber-300 text-xs font-bold flex items-center gap-1 self-start sm:self-auto"
                  >
                    <span>View All Packages</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {bumperPackages.map(pkg => (
                    <div 
                      key={pkg.id}
                      className="bg-white/10 hover:bg-white/15 border border-white/15 rounded-2xl p-6 transition flex flex-col justify-between space-y-6 backdrop-blur-sm"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="bg-amber-400 text-stone-950 text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full">
                            {pkg.badge}
                          </span>
                          <span className="text-stone-300 text-xs font-medium">{pkg.duration}</span>
                        </div>

                        <h3 className="text-lg font-bold text-white leading-snug">{pkg.title}</h3>
                        <p className="text-stone-300 text-xs line-clamp-2">{pkg.description}</p>

                        {/* Included Highlights */}
                        <div className="flex flex-wrap gap-1.5 pt-2">
                          {pkg.includedHighlights.slice(0, 3).map((h, hi) => (
                            <span key={hi} className="bg-white/10 text-white text-[11px] px-2 py-0.5 rounded-md">
                              ✓ {h}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="pt-4 border-t border-white/15 flex items-center justify-between">
                        <div>
                          <span className="text-stone-400 line-through text-xs mr-2">₹{pkg.originalPrice.toLocaleString()}</span>
                          <span className="text-2xl font-black text-amber-400">₹{pkg.discountedPrice.toLocaleString()}</span>
                          <p className="text-[10px] text-stone-400">per person all-inclusive</p>
                        </div>

                        <Link
                          to={`/packages/${pkg.slug}`}
                          className="bg-amber-400 hover:bg-amber-500 text-stone-950 font-bold px-4 py-2.5 rounded-xl text-xs transition flex items-center space-x-1.5 shadow-md"
                        >
                          <span>Customize & Book</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

          </div>

          {/* RIGHT SIDEBAR STICKY COLUMN (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* 1. INTERACTIVE DESTINATION MAP CARD */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-200/80 sticky top-24 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-rose-600" />
                  <h3 className="font-serif font-bold text-lg text-stone-900">Destination Map</h3>
                </div>
                <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                  {destLat.toFixed(2)}° N, {destLng.toFixed(2)}° E
                </span>
              </div>

              {/* Map Container */}
              <div className="w-full h-72 rounded-2xl overflow-hidden shadow-inner border border-stone-200">
                <DestinationMap 
                  latitude={destLat} 
                  longitude={destLng} 
                  name={destination?.name || data?.name || 'Destination'} 
                />
              </div>

              <div className="pt-2 flex items-center justify-between text-xs text-stone-600">
                <span>Interactive map view</span>
                <a 
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((destination?.name || data?.name) + ' India')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline font-bold flex items-center gap-1"
                >
                  <span>Open in Google Maps</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* 2. TRAVEL ESSENTIALS & BEST TIME WIDGET */}
              <div className="border-t border-stone-100 pt-6 space-y-4">
                <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-amber-600" /> Best Time to Travel
                </h4>

                <div className="bg-stone-50 p-4 rounded-2xl space-y-2 border border-stone-200/80">
                  <div className="flex justify-between text-xs">
                    <span className="text-stone-500 font-medium">Peak Season:</span>
                    <span className="font-bold text-stone-900 text-right">{data?.bestTime.peakSeason || 'October to March'}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-stone-500 font-medium">Recommended Stay:</span>
                    <span className="font-bold text-stone-900">{data?.bestTime.idealDays || '3 to 5 Days'}</span>
                  </div>
                  <p className="text-[11px] text-stone-600 italic pt-1 border-t border-stone-200">
                    "{data?.bestTime.weatherNotes || 'Pack comfortable cottons for sunny days and light layers for pleasant evenings.'}"
                  </p>
                </div>
              </div>

              {/* 3. DAILY BUDGET ESTIMATOR */}
              {data?.budgetEstimates && (
                <div className="border-t border-stone-100 pt-6 space-y-4">
                  <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-emerald-600" /> Estimated Daily Budget
                  </h4>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center p-2.5 rounded-xl bg-emerald-50 text-emerald-950 font-medium border border-emerald-200">
                      <span>🎒 Backpacker Budget:</span>
                      <span className="font-bold">₹{data.budgetEstimates.budgetPerDay.toLocaleString()} / day</span>
                    </div>
                    <div className="flex justify-between items-center p-2.5 rounded-xl bg-blue-50 text-blue-950 font-medium border border-blue-200">
                      <span>🏨 Comfort Traveler:</span>
                      <span className="font-bold">₹{data.budgetEstimates.comfortPerDay.toLocaleString()} / day</span>
                    </div>
                    <div className="flex justify-between items-center p-2.5 rounded-xl bg-amber-50 text-amber-950 font-medium border border-amber-200">
                      <span>👑 Royal Luxury:</span>
                      <span className="font-bold">₹{data.budgetEstimates.luxuryPerDay.toLocaleString()} / day</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 4. AI ITINERARY GENERATOR QUICK CTA */}
              <div className="border-t border-stone-100 pt-6">
                <button
                  onClick={() => navigate(`/itineraries/generate?destination=${encodeURIComponent(destination?.name || 'Destination')}`)}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold py-3.5 px-4 rounded-2xl text-xs flex items-center justify-center space-x-2 shadow-md transition"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Custom AI Itinerary</span>
                </button>
              </div>

              {/* 5. TOURIST HELPLINES */}
              <div className="border-t border-stone-100 pt-4 text-[11px] text-stone-500 space-y-1">
                <div className="flex justify-between">
                  <span>National Tourist Helpline:</span>
                  <span className="font-bold text-stone-800">1363 / 1800-111-363</span>
                </div>
                <div className="flex justify-between">
                  <span>Emergency Response:</span>
                  <span className="font-bold text-stone-800">112</span>
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
