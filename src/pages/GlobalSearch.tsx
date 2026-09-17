import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { globalSearch, type SearchResult } from '@/api/search';

export const GlobalSearch = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const navigate = useNavigate();

  const performSearch = async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setHasSearched(true);
    try {
      const response = await globalSearch(q);
      setResults(response.data);
    } catch (err: any) {
      console.error('Search failed:', err);
      setError('Failed to fetch search results. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery);
    }
  }, [initialQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchParams({ q: query });
    }
  };

  const handleResultClick = (result: SearchResult) => {
    switch (result.type) {
      case 'destination':
        navigate(`/destinations/${result.id}`);
        break;
      case 'hotel':
      case 'tour':
        // For hotels and tours, navigate to the destination detail if possible
        // But since we don't have destination_id in the normalized search result,
        // we might navigate to a specific page if they existed, but currently they only live on DestinationDetails.
        // For this MVP, we will try to navigate to /destinations
        // Alternatively, if there was a /hotel/:id route we'd use it.
        // Since hotels and tours are shown inside destination details, we can alert for now, or just redirect to destinations.
        navigate('/destinations');
        break;
      case 'business':
        navigate('/destinations'); // Similar fallback
        break;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'destination': return 'bg-blue-100 text-blue-800';
      case 'hotel': return 'bg-amber-100 text-amber-800';
      case 'tour': return 'bg-green-100 text-green-800';
      case 'business': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Search Header */}
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Explore Everything
          </h1>
          <p className="mt-4 text-lg text-gray-500">
            Search across destinations, luxury stays, exciting experiences, and partners.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="relative mt-8">
          <label htmlFor="global-search" className="sr-only">Search query</label>
          <input
            id="global-search"
            type="text"
            className="block w-full rounded-2xl border-0 py-4 pl-6 pr-24 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-amber-600 sm:text-lg sm:leading-6"
            placeholder="Where do you want to go?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search across destinations, hotels, and experiences"
          />
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="absolute inset-y-2 right-2 flex items-center justify-center rounded-xl bg-amber-600 px-4 sm:px-6 font-semibold text-white shadow-sm hover:bg-amber-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Submit search"
          >
            {isLoading ? '...' : 'Search'}
          </button>
        </form>

        {/* Results */}
        {error && (
          <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-center">
            <p>{error}</p>
            <button onClick={() => performSearch(query)} className="mt-2 text-sm font-semibold underline">Try Again</button>
          </div>
        )}

        {hasSearched && !error && (
          <div className="mt-8 space-y-4">
            <h2 className="text-lg font-medium text-gray-900">
              {isLoading ? 'Searching...' : `Found ${results.length} results`}
            </h2>
            
            {!isLoading && results.length === 0 && (
               <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 shadow-sm">
                 <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                 <h3 className="text-lg font-medium text-gray-900">No results found</h3>
                 <p className="text-gray-500 mt-1">We couldn't find anything matching "{initialQuery}". Try adjusting your search.</p>
               </div>
            )}

            {!isLoading && results.length > 0 && (
              <div className="grid gap-4 sm:grid-cols-1">
                {results.map((result) => (
                  <button
                    key={`${result.type}-${result.id}`}
                    onClick={() => handleResultClick(result)}
                    className="w-full text-left relative flex flex-col sm:flex-row sm:items-center gap-4 rounded-xl border border-gray-300 bg-white p-4 shadow-sm hover:border-amber-400 hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    aria-label={`View details for ${result.title} (${result.type})`}
                  >
                    {result.image ? (
                      <img
                        src={result.image}
                        alt={result.title}
                        loading="lazy"
                        className="h-48 w-full sm:h-16 sm:w-16 rounded-lg object-cover shrink-0"
                      />
                    ) : (
                      <div className="hidden sm:flex h-16 w-16 rounded-lg bg-gray-100 items-center justify-center shrink-0">
                        <Search className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-3">
                        <p className="text-lg font-medium text-gray-900 truncate">{result.title}</p>
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] sm:text-xs font-medium capitalize ${getTypeColor(result.type)} shrink-0`}>
                          {result.type}
                        </span>
                      </div>
                      <p className="line-clamp-2 text-sm text-gray-500 mt-1">{result.summary}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
