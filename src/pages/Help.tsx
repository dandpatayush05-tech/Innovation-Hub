import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../lib/axios';
import { Loader2, Search, HelpCircle, BookOpen, XCircle, Banknote, CreditCard, FileText, Shield, Mail } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { FaqAccordion } from '../components/help/FaqAccordion';
import { PolicyPage } from '../components/help/PolicyPage';

const ICON_MAP: Record<string, any> = {
  HelpCircle,
  BookOpen,
  XCircle,
  Banknote,
  CreditCard,
  FileText,
  Shield
};

interface Category {
  id: string;
  slug: string;
  title: string;
  icon?: string;
}

interface Article {
  id: string;
  type: string;
  question?: string;
  title?: string;
  content: string;
}

export const Help = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const activeSlug = searchParams.get('category') || 'faq';
  const searchQuery = searchParams.get('q') || '';

  const [categories, setCategories] = useState<Category[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchQuery);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      performSearch(searchQuery);
    } else if (categories.length > 0) {
      fetchArticles(activeSlug);
    }
  }, [activeSlug, searchQuery, categories]);

  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/api/help/categories');
      setCategories(data);
      if (!searchParams.get('category') && !searchParams.get('q')) {
        navigate(`?category=${data[0]?.slug}`, { replace: true });
      }
    } catch (error) {
      console.error('Failed to fetch categories', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchArticles = async (slug: string) => {
    try {
      setLoading(true);
      const { data } = await api.get(`/api/help/categories/${slug}/articles`);
      setArticles(data);
    } catch (error) {
      console.error('Failed to fetch articles', error);
    } finally {
      setLoading(false);
    }
  };

  const performSearch = async (query: string) => {
    try {
      setLoading(true);
      const { data } = await api.get(`/api/help/search?q=${encodeURIComponent(query)}`);
      setSearchResults(data);
    } catch (error) {
      console.error('Search failed', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`?q=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate(`?category=${categories[0]?.slug}`);
    }
  };

  if (loading && categories.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600 w-8 h-8" />
      </div>
    );
  }

  const activeCategory = categories.find(c => c.slug === activeSlug);
  const isFaq = articles.some(a => a.type === 'faq_item');

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Header */}
      <div className="bg-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-6">How can we help?</h1>
          <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto relative">
            <input
              type="text"
              placeholder="Search for articles, questions, or policies..."
              className="w-full pl-12 pr-4 py-4 rounded-full text-gray-900 shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Sidebar */}
          <div className="w-full md:w-64 shrink-0 space-y-2">
            {!searchQuery && categories.map((cat) => {
              const Icon = cat.icon && ICON_MAP[cat.icon] ? ICON_MAP[cat.icon] : FileText;
              const isActive = activeSlug === cat.slug;
              return (
                <button
                  key={cat.id}
                  onClick={() => navigate(`?category=${cat.slug}`)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-left ${
                    isActive ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                  {cat.title}
                </button>
              );
            })}
            
            <hr className="my-4 border-gray-200" />
            
            <button
              onClick={() => navigate('/contact')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-left text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            >
              <Mail className="w-5 h-5 text-gray-400" />
              Contact Support
            </button>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600 w-8 h-8" /></div>
            ) : searchQuery ? (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Search Results for "{searchQuery}"</h2>
                {searchResults.length === 0 ? (
                  <p className="text-gray-600 bg-white p-8 rounded-xl border border-gray-200">No results found. Try adjusting your search.</p>
                ) : (
                  searchResults.map((res: any) => (
                    <div key={res.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                      <div className="text-sm font-medium text-blue-600 mb-2 uppercase tracking-wide">{res.category?.slug.replace('-', ' ')}</div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{res.question || res.title}</h3>
                      <p className="text-gray-600 line-clamp-2">{res.content.replace(/[#*`]/g, '')}</p>
                      <button 
                        onClick={() => navigate(`?category=${res.category.slug}`)}
                        className="mt-4 text-blue-600 font-medium hover:underline text-sm"
                      >
                        Read more in {res.category.slug} →
                      </button>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-8">{activeCategory?.title}</h2>
                {isFaq ? (
                  <FaqAccordion items={articles as any} />
                ) : (
                  <PolicyPage articles={articles as any} />
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Help;
