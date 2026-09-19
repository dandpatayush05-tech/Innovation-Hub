import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTours, Tour } from '../api/tours';
import { Search, MapPin, Clock } from 'lucide-react';

const CATEGORIES = [
  'All',
  'Heritage',
  'Temple',
  'Nature',
  'Adventure',
  'Beach',
  'Cultural',
  'Food Tours',
  'Local Sightseeing',
  'Photography',
  'Family'
];

export const Experiences = () => {
  const navigate = useNavigate();
  const [experiences, setExperiences] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    fetchExperiences();
  }, [selectedCategory]);

  const fetchExperiences = async () => {
    try {
      setLoading(true);
      const categoryFilter = selectedCategory !== 'All' ? selectedCategory.toLowerCase() : undefined;
      const res = await getTours({ limit: 50, category: categoryFilter });
      setExperiences(res.data);
    } catch (error) {
      console.error('Failed to fetch experiences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const categoryFilter = selectedCategory !== 'All' ? selectedCategory.toLowerCase() : undefined;
      const res = await getTours({ search: searchTerm, limit: 50, category: categoryFilter });
      setExperiences(res.data);
    } catch (error) {
      console.error('Failed to search experiences:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="bg-white border-b sticky top-16 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search experiences..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Search
            </button>
          </form>

          {/* Categories */}
          <div className="flex overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 hide-scrollbar gap-2">
            {CATEGORIES.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          {selectedCategory === 'All' ? 'Discover Experiences' : `${selectedCategory} Experiences`}
        </h1>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : experiences.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {experiences.map(exp => (
              <div 
                key={exp.id} 
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer group"
                onClick={() => navigate(`/experiences/${exp.id}`)}
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={exp.image_url}
                    alt={exp.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-sm font-bold shadow-sm">
                    ${exp.price}
                  </div>
                </div>
                
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                      {exp.name}
                    </h3>
                  </div>
                  
                  <div className="flex items-center text-gray-500 text-sm mb-3">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span>Destination ID: {exp.destination_id.slice(0,8)}...</span>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {exp.description}
                  </p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center text-gray-700 text-sm">
                      <Clock className="w-4 h-4 mr-1 text-gray-400" />
                      {exp.duration_hours} {exp.duration_hours === 1 ? 'hour' : 'hours'}
                    </div>
                    
                    <button 
                      className="text-blue-600 font-semibold hover:text-blue-800 text-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/experiences/${exp.id}`);
                      }}
                    >
                      Book Now →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No experiences found</h3>
            <p className="text-gray-500">Try adjusting your search or category filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
