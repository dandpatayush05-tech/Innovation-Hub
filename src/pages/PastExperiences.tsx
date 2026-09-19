import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Map, Calendar, Navigation } from 'lucide-react';
import { getTrips, Trip } from '../api/trips';

const PastExperiences = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const res = await getTrips();
      setTrips(res.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch trips');
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Past Experiences</h1>
          <p className="text-gray-500">Your personal travel history and memories.</p>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-500">Loading your memories...</div>
        ) : error ? (
          <div className="text-center py-20 text-red-500">{error}</div>
        ) : trips.length === 0 ? (
          <div className="text-center py-20 text-gray-500 bg-white rounded-3xl border border-gray-100 shadow-sm">
            You haven't added any trips yet. Book a hotel or flight to start your journey!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map(trip => (
              <div 
                key={trip.id} 
                onClick={() => navigate(`/dashboard/trips/${trip.id}`)}
                className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow group relative"
              >
                <div className="h-48 w-full bg-gray-200 relative overflow-hidden">
                  {trip.cover_photo_url ? (
                    <img src={trip.cover_photo_url} alt={trip.destination} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-100">
                      <Map className="w-12 h-12 text-slate-300" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  <h3 className="absolute bottom-4 left-4 text-2xl font-bold text-white">
                    {trip.destination}
                  </h3>
                </div>
                
                <div className="p-5 space-y-4">
                  <div className="flex items-center text-gray-500 text-sm">
                    <Calendar className="w-4 h-4 mr-2 text-[#C84B31]" />
                    {trip.start_date ? new Date(trip.start_date).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : 'Unknown Date'}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
                      {trip.experienceCount} {trip.experienceCount === 1 ? 'Experience' : 'Experiences'}
                    </div>
                    <button className="flex items-center text-[#C84B31] text-sm font-medium group-hover:underline">
                      View Trip <Navigation className="w-4 h-4 ml-1" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
  );
};

export default PastExperiences;
