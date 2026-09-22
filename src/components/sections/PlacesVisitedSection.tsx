import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getTrips, Trip } from '../../api/trips';
import { useAuth } from '../../context/AuthContext';
import { MapPin, Calendar, ArrowRight, Camera, Sparkles, Navigation } from 'lucide-react';

interface TripWithPhotos extends Trip {
  photos?: string[];
}

export const PlacesVisitedSection: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [visitedTrips, setVisitedTrips] = useState<TripWithPhotos[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setVisitedTrips([]);
      setLoading(false);
      return;
    }

    const fetchVisitedHistory = async () => {
      try {
        setLoading(true);
        const res = await getTrips();
        const trips = res.data || [];
        
        // Filter for completed trips or past start dates
        const now = new Date();
        const completed = trips.filter(t => {
          if (!t.start_date) return false;
          const tripDate = new Date(t.start_date);
          return tripDate < now;
        });

        setVisitedTrips(completed);
      } catch (err) {
        console.warn('Could not load user visited trips:', err);
        setVisitedTrips([]);
      } finally {
        setLoading(false);
      }
    };

    fetchVisitedHistory();
  }, [user]);

  // Hide entirely if user is not logged in or has no completed trips
  if (loading || !user || visitedTrips.length === 0) {
    return null;
  }

  return (
    <section className="mb-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-2">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[#C84B31] text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Personal Travel Memories</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif text-[#2A2A2A] tracking-tight">
            Places You’ve Visited
          </h2>
          <p className="text-xs sm:text-sm text-[#2A2A2A]/60 mt-0.5">
            Relive your past journeys, revisit favourite spots, and check your vacation photo albums.
          </p>
        </div>

        <Link
          to="/dashboard/trips"
          className="inline-flex items-center gap-1 text-xs font-bold text-[#C84B31] hover:text-[#A63A25] transition-colors"
        >
          <span>View all travel history</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Horizontal Scrolling Trip Cards */}
      <div className="flex gap-6 overflow-x-auto pb-4 pt-1 px-1 hide-scrollbar snap-x">
        {visitedTrips.map(trip => {
          const formattedDate = trip.start_date 
            ? new Date(trip.start_date).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })
            : 'Past Journey';

          const hasCollage = (trip.experienceCount && trip.experienceCount > 1) || (trip.photos && trip.photos.length > 1);

          return (
            <div
              key={trip.id}
              onClick={() => navigate(`/dashboard/trips/${trip.id}`)}
              className="snap-start flex-shrink-0 w-72 sm:w-80 glass-card rounded-3xl overflow-hidden group cursor-pointer transform hover:-translate-y-1 flex flex-col justify-between"
            >
              <div>
                {/* Photo / Collage Area */}
                <div className="relative h-44 overflow-hidden bg-gray-100">
                  {hasCollage && trip.photos && trip.photos.length >= 2 ? (
                    <div className="grid grid-cols-2 h-full w-full gap-0.5">
                      <img
                        src={trip.photos[0] || trip.cover_photo_url}
                        alt={trip.destination}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <img
                        src={trip.photos[1] || trip.cover_photo_url}
                        alt={`${trip.destination} memory`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <img
                      src={trip.cover_photo_url || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop'}
                      alt={trip.destination}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      loading="lazy"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                  {/* Destination Overlay */}
                  <div className="absolute bottom-3 left-4 right-4 text-white">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-orange-300 block mb-0.5">
                      Visited Destination
                    </span>
                    <h3 className="font-serif text-xl font-semibold leading-tight group-hover:text-orange-200 transition-colors truncate">
                      {trip.destination}
                    </h3>
                  </div>

                  {trip.experienceCount && trip.experienceCount > 0 && (
                    <div className="absolute top-3 right-3 glass-badge-light px-2.5 py-0.5 rounded-full text-[10px] font-bold text-[#C84B31] shadow-xs">
                      {trip.experienceCount} {trip.experienceCount === 1 ? 'Activity' : 'Activities'}
                    </div>
                  )}
                </div>

                {/* Details Section */}
                <div className="p-4 space-y-2">
                  <div className="flex items-center text-xs text-[#2A2A2A]/70">
                    <Calendar className="w-3.5 h-3.5 mr-1.5 text-[#C84B31]" />
                    <span>{formattedDate}</span>
                  </div>
                  <p className="text-xs text-[#2A2A2A]/60 line-clamp-1">
                    Memories from your completed trip to {trip.destination}.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="px-4 pb-4 pt-1 flex items-center justify-between border-t border-black/5 text-xs">
                <span className="text-[#C84B31] font-bold flex items-center gap-1 group-hover:underline">
                  <Camera className="w-3.5 h-3.5" />
                  <span>See Photos & Revisit</span>
                </span>
                <Navigation className="w-3.5 h-3.5 text-[#C84B31] group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
