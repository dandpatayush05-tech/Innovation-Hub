import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, ArrowRight } from 'lucide-react';
import { getDestinations, Destination } from '../api/destinations';
import { getPlaces, Place } from '../api/places';
import { LoadingState } from '../components/states/LoadingState';
import { EmptyState } from '../components/states/EmptyState';
import { ErrorState } from '../components/states/ErrorState';
import { DestinationCardSkeleton } from '../components/skeletons/DestinationCardSkeleton';

export const ExploreCountry = () => {
  const { country } = useParams<{ country: string }>();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [attractions, setAttractions] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!country) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const [destRes, attrRes] = await Promise.all([
          getDestinations({ country, popular: true }),
          getPlaces({ country, category: 'attraction' })
        ]);
        
        setDestinations(destRes.data || []);
        setAttractions(attrRes.data || []);
      } catch (err) {
        console.error('Failed to fetch country data:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [country]);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-16 bg-[#F9F9F9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <LoadingState message="Discovering country details..." />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
            {[1, 2, 3].map(n => <DestinationCardSkeleton key={n} />)}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-24 pb-16 bg-[#F9F9F9]">
        <ErrorState 
          error={error}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  const countryName = country ? country.charAt(0).toUpperCase() + country.slice(1) : 'Unknown';

  return (
    <div className="min-h-screen bg-[#F9F9F9]">
      {/* Hero Section */}
      <div className="relative h-[400px] w-full bg-slate-900">
        <div className="absolute inset-0 bg-black/40 z-10" />
        <img
          src={`https://source.unsplash.com/1600x900/?${country},landscape`}
          alt={countryName}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 tracking-tight drop-shadow-md capitalize">
            Explore {countryName}
          </h1>
          <p className="text-xl text-white/90 max-w-2xl font-light drop-shadow">
            Discover popular destinations and attractions in {countryName}.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Popular Destinations Chips */}
        <section className="mb-16">
          <h2 className="text-3xl font-semibold text-[#2A2A2A] mb-8">Popular Destinations</h2>
          
          {destinations.length === 0 ? (
            <EmptyState 
              title="No destinations found"
              message={`We couldn't find any popular destinations in ${countryName} yet.`}
            />
          ) : (
            <div className="flex flex-wrap gap-4">
              {destinations.map(dest => (
                <Link
                  key={dest.id}
                  to={`/destinations/${dest.id}`}
                  className="group relative overflow-hidden rounded-full bg-white px-6 py-3 shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-500/30 transition-all duration-300 flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 shrink-0">
                    <img 
                      src={dest.image_url || `https://source.unsplash.com/100x100/?${dest.name}`} 
                      alt={dest.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="font-medium text-[#2A2A2A] group-hover:text-blue-600 transition-colors">
                    {dest.name}
                  </span>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Popular Attractions */}
        <section>
          <h2 className="text-3xl font-semibold text-[#2A2A2A] mb-8">Popular Attractions</h2>
          
          {attractions.length === 0 ? (
            <EmptyState 
              title="No attractions found"
              message={`We couldn't find any attractions in ${countryName} yet.`}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {attractions.map(attraction => (
                <div key={attraction.id} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-black/5">
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={attraction.image_url || `https://source.unsplash.com/600x400/?${attraction.name},attraction`}
                      alt={attraction.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-white/90 backdrop-blur-md text-sm font-medium rounded-full text-[#2A2A2A] shadow-sm">
                        {attraction.city}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-[#2A2A2A] mb-2 group-hover:text-blue-600 transition-colors">
                      {attraction.name}
                    </h3>
                    <div className="flex items-center text-[#2A2A2A]/60 text-sm mb-4">
                      <MapPin className="w-4 h-4 mr-1.5 shrink-0" />
                      <span className="truncate">{attraction.address}</span>
                    </div>
                    <p className="text-[#2A2A2A]/70 text-sm line-clamp-3 leading-relaxed">
                      {attraction.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
