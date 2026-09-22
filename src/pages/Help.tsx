import React, { useState, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Search, MapPin, Sparkles, Plane, Shield, Building2, 
  CreditCard, RotateCcw, Gift, ChevronDown, MessageSquare, 
  Mail, PhoneCall, CheckCircle, ArrowRight, HelpCircle, X,
  ThumbsUp, ThumbsDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { FAQ_CATEGORIES, FAQ_ITEMS, type FAQCategory, type FAQItem } from '../data/faqsData';

const ICON_COMPONENTS: Record<string, React.FC<{ className?: string }>> = {
  Sparkles,
  Plane,
  Shield,
  Building2,
  CreditCard,
  RotateCcw,
  Gift
};

export const Help: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const currentCategory = searchParams.get('category') || 'getting-started';
  const initialSearch = searchParams.get('q') || '';

  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [activeCategory, setActiveCategory] = useState<string>(currentCategory);
  const [expandedId, setExpandedId] = useState<string | null>('gs-1');
  const [feedbackGiven, setFeedbackGiven] = useState<Record<string, 'yes' | 'no'>>({});

  const filteredFaqs = useMemo(() => {
    let list = FAQ_ITEMS;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return list.filter(
        item =>
          item.question.toLowerCase().includes(q) ||
          item.answer.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q)
      );
    }

    if (activeCategory !== 'all') {
      list = list.filter(item => item.category === activeCategory);
    }

    return list;
  }, [searchTerm, activeCategory]);

  const handleCategorySelect = (slug: string) => {
    setActiveCategory(slug);
    setSearchTerm('');
    setSearchParams({ category: slug });
    const firstItem = FAQ_ITEMS.find(item => item.category === slug);
    if (firstItem) {
      setExpandedId(firstItem.id);
    }
  };

  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    if (val.trim()) {
      setSearchParams({ q: val.trim() });
    } else {
      setSearchParams({ category: activeCategory });
    }
  };

  const handleFeedback = (faqId: string, response: 'yes' | 'no') => {
    setFeedbackGiven(prev => ({ ...prev, [faqId]: response }));
  };

  const activeCategoryObj = FAQ_CATEGORIES.find(c => c.slug === activeCategory) || FAQ_CATEGORIES[0];

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans text-[#2A2A2A] pb-24">
      {/* 1. TOP NAVBAR */}
      <nav className="border-b border-black/5 bg-white/90 backdrop-blur-md sticky top-0 z-50 transition-all">
        <div className="max-w-[1360px] mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2.5 text-[#2A2A2A] hover:opacity-80 transition-opacity no-underline group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#C84B31] to-[#E06D53] flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
              <MapPin className="w-5 h-5" />
            </div>
            <span className="font-display text-[26px] text-black leading-none select-none tracking-tight">
              Yatra Setu
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link 
              to="/destinations" 
              className="text-[14px] font-semibold uppercase tracking-[0.04em] text-[#2A2A2A]/70 hover:text-[#C84B31] transition-colors"
            >
              Discover
            </Link>
            <Link 
              to="/packages" 
              className="text-[14px] font-semibold uppercase tracking-[0.04em] text-[#2A2A2A]/70 hover:text-[#C84B31] transition-colors"
            >
              Bumper Packages
            </Link>
            <Link 
              to="/itineraries/generate" 
              className="text-[14px] font-semibold uppercase tracking-[0.04em] text-[#2A2A2A]/70 hover:text-[#C84B31] transition-colors"
            >
              AI Trip Planner
            </Link>
            <span className="text-[14px] font-bold uppercase tracking-[0.04em] text-[#C84B31] border-b-2 border-[#C84B31] pb-1">
              FAQs & Help
            </span>
          </div>

          {/* Right Action */}
          <div className="flex items-center gap-4">
            {user ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="text-[14px] font-semibold uppercase text-[#292929] tracking-[0.04em] hover:text-[#C84B31] transition-colors bg-white px-4 py-2 rounded-full border border-black/10 shadow-xs cursor-pointer"
              >
                Dashboard ({user.name?.split(' ')[0] || 'Traveler'})
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  state={{ isRegister: true }}
                  className="text-[14px] font-semibold uppercase text-[#C84B31] tracking-[0.04em] hover:opacity-80 transition-opacity"
                >
                  Register
                </Link>
                <Link
                  to="/login"
                  className="bg-black text-white text-[13px] font-semibold uppercase tracking-[0.04em] px-5 py-2.5 rounded-full hover:bg-[#333] transition-all active:scale-95"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* 2. HERO HEADER SECTION */}
      <section className="relative pt-16 pb-14 px-6 max-w-[1360px] mx-auto flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-black/10 text-xs font-bold uppercase tracking-wider text-[#C84B31] shadow-xs mb-5">
          <Sparkles className="w-3.5 h-3.5 text-[#C84B31]" />
          <span>Help Center & Knowledge Base</span>
        </div>

        <h1 className="text-[clamp(36px,5vw,56px)] font-serif font-medium text-[#2A2A2A] leading-[1.1] tracking-[-0.03em] max-w-[850px] mb-4">
          How can we assist your journey?
        </h1>
        
        <p className="text-lg text-[#2A2A2A]/70 max-w-[620px] mb-10 leading-relaxed">
          Find instant answers for multimodal bookings, special assistance for seniors & women, 5% GST tax invoices, and 24-hour free cancellations.
        </p>

        {/* Search Bar */}
        <div className="relative w-full max-w-[680px] h-16 bg-white border border-black/10 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.06)] overflow-hidden flex items-center px-6 transition-all focus-within:border-[#C84B31] focus-within:shadow-[0_8px_30px_rgba(200,75,49,0.12)]">
          <Search className="w-5 h-5 text-[#C84B31] flex-shrink-0" />
          <input 
            type="text" 
            placeholder="Search questions (e.g. seat selection, cancellation, GST invoice, senior care)..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full h-full bg-transparent border-none outline-none pl-3 text-base text-[#2A2A2A] placeholder:text-[#2A2A2A]/40 font-medium"
          />
          {searchTerm && (
            <button 
              onClick={() => handleSearchChange('')}
              className="p-1 rounded-full hover:bg-black/5 text-[#2A2A2A]/50 hover:text-[#2A2A2A] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </section>

      {/* 3. MAIN BODY WITH CATEGORIES & ACCORDIONS */}
      <div className="max-w-[1360px] mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Navigation Sidebar */}
          <aside className="lg:col-span-4 space-y-3">
            <div className="bg-white rounded-3xl p-4 border border-black/5 shadow-xs space-y-1.5">
              <div className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-[#2A2A2A]/50">
                Browse by Category
              </div>

              {FAQ_CATEGORIES.map((cat) => {
                const IconComponent = ICON_COMPONENTS[cat.iconName] || HelpCircle;
                const isActive = !searchTerm && activeCategory === cat.slug;
                const itemCount = FAQ_ITEMS.filter(i => i.category === cat.slug).length;

                return (
                  <button
                    key={cat.id}
                    onClick={() => handleCategorySelect(cat.slug)}
                    className={`w-full flex items-center justify-between p-3.5 rounded-2xl transition-all text-left cursor-pointer group ${
                      isActive
                        ? 'bg-[#C84B31] text-white shadow-md'
                        : 'hover:bg-[#FDFBF7] text-[#2A2A2A]/80 hover:text-[#2A2A2A]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                        isActive ? 'bg-white/20 text-white' : 'bg-[#FDFBF7] text-[#C84B31] group-hover:bg-[#C84B31]/10'
                      }`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div>
                        <p className={`text-sm font-semibold leading-tight ${isActive ? 'text-white' : 'text-[#2A2A2A]'}`}>
                          {cat.title}
                        </p>
                        <p className={`text-[11px] line-clamp-1 mt-0.5 ${isActive ? 'text-white/80' : 'text-[#2A2A2A]/50'}`}>
                          {cat.description}
                        </p>
                      </div>
                    </div>

                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      isActive ? 'bg-white/20 text-white' : 'bg-black/5 text-[#2A2A2A]/60'
                    }`}>
                      {itemCount}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Need Direct Assistance Card */}
            <div className="bg-gradient-to-br from-[#2D4263] to-[#1A2536] text-white rounded-3xl p-6 shadow-md relative overflow-hidden">
              <div className="relative z-10 space-y-4">
                <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-[#E06D53]">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold">Still have questions?</h3>
                  <p className="text-white/80 text-xs leading-relaxed mt-1">
                    Our 24/7 Travel Authorities and AI Concierge are ready to assist you right away.
                  </p>
                </div>
                <div className="pt-2 flex flex-col gap-2.5">
                  <button
                    onClick={() => navigate('/contact')}
                    className="w-full flex items-center justify-center gap-2 bg-[#C84B31] hover:bg-[#A63A25] text-white py-3 rounded-xl font-semibold text-xs transition-all shadow-sm cursor-pointer"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Contact Support Team</span>
                  </button>
                  <button
                    onClick={() => navigate('/itineraries/generate')}
                    className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white py-2.5 rounded-xl font-medium text-xs transition-all cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Chat with AI Planner</span>
                  </button>
                </div>
              </div>
            </div>
          </aside>

          {/* Right Main FAQ List */}
          <main className="lg:col-span-8 space-y-6">
            
            {/* Header / Search results status */}
            <div className="flex items-center justify-between pb-2 border-b border-black/5">
              <div>
                <h2 className="text-2xl font-serif font-bold text-[#2A2A2A]">
                  {searchTerm ? `Search Results for "${searchTerm}"` : activeCategoryObj.title}
                </h2>
                <p className="text-xs text-[#2A2A2A]/60 mt-1">
                  {searchTerm
                    ? `Found ${filteredFaqs.length} relevant questions`
                    : activeCategoryObj.description}
                </p>
              </div>

              {searchTerm && (
                <button
                  onClick={() => handleSearchChange('')}
                  className="text-xs font-semibold text-[#C84B31] hover:underline"
                >
                  Clear search
                </button>
              )}
            </div>

            {/* FAQ Accordion List */}
            {filteredFaqs.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-black/5 shadow-xs space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                  <HelpCircle className="w-7 h-7" />
                </div>
                <h3 className="font-serif text-lg font-bold text-[#2A2A2A]">No matching questions found</h3>
                <p className="text-sm text-[#2A2A2A]/60 max-w-md mx-auto">
                  We couldn't find any questions matching "{searchTerm}". Please try different keywords or contact our team directly.
                </p>
                <button
                  onClick={() => navigate('/contact')}
                  className="inline-flex items-center gap-2 bg-[#C84B31] text-white px-6 py-2.5 rounded-full text-xs font-semibold hover:bg-[#A63A25] transition-colors"
                >
                  <span>Submit an Inquiry</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredFaqs.map((faq) => {
                  const isExpanded = expandedId === faq.id;
                  const feedback = feedbackGiven[faq.id];

                  return (
                    <div 
                      key={faq.id}
                      className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${
                        isExpanded
                          ? 'border-[#C84B31]/40 shadow-md ring-1 ring-[#C84B31]/20'
                          : 'border-black/5 shadow-xs hover:border-black/15'
                      }`}
                    >
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : faq.id)}
                        className="w-full px-6 py-5 flex items-start justify-between gap-4 text-left cursor-pointer"
                        aria-expanded={isExpanded}
                      >
                        <div className="flex items-start gap-3">
                          <span className="w-6 h-6 rounded-full bg-[#C84B31]/10 text-[#C84B31] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                            Q
                          </span>
                          <span className="text-base font-semibold text-[#2A2A2A] leading-snug">
                            {faq.question}
                          </span>
                        </div>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all shrink-0 ${
                          isExpanded ? 'bg-[#C84B31] text-white rotate-180' : 'bg-black/5 text-[#2A2A2A]/60'
                        }`}>
                          <ChevronDown className="w-4 h-4" />
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="px-6 pb-6 pt-2 border-t border-black/5 text-sm text-[#2A2A2A]/80 space-y-4">
                          <div className="bg-[#FDFBF7] p-4 rounded-xl border border-black/5 leading-relaxed whitespace-pre-line text-[#2A2A2A]">
                            {faq.answer}
                          </div>

                          {/* Helpfulness feedback bar */}
                          <div className="flex items-center justify-between pt-2 text-xs text-[#2A2A2A]/60">
                            <span>Was this answer helpful?</span>
                            {feedback ? (
                              <span className="text-emerald-600 font-semibold flex items-center gap-1">
                                <CheckCircle className="w-3.5 h-3.5" />
                                Thank you for your feedback!
                              </span>
                            ) : (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleFeedback(faq.id, 'yes')}
                                  className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-black/10 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 transition-colors"
                                >
                                  <ThumbsUp className="w-3.5 h-3.5" />
                                  <span>Yes</span>
                                </button>
                                <button
                                  onClick={() => handleFeedback(faq.id, 'no')}
                                  className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-black/10 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 transition-colors"
                                >
                                  <ThumbsDown className="w-3.5 h-3.5" />
                                  <span>No</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Quick Summary Highlights Banner */}
            <div className="mt-8 bg-amber-50/70 border border-amber-200/80 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-1 text-center md:text-left">
                <h4 className="font-serif font-bold text-gray-900 text-base">Planning a holiday across India?</h4>
                <p className="text-xs text-gray-600">
                  Explore our curated all-inclusive holiday bundles with flights, hotels, and sightseeing.
                </p>
              </div>
              <button
                onClick={() => navigate('/packages')}
                className="shrink-0 bg-[#C84B31] text-white px-5 py-2.5 rounded-full text-xs font-semibold hover:bg-[#A63A25] transition-all shadow-sm"
              >
                Explore Bumper Packages →
              </button>
            </div>

          </main>

        </div>
      </div>
    </div>
  );
};

export default Help;
