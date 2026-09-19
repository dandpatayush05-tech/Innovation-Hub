import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { generateItinerary } from '../api/itineraries';
import type { Itinerary, ItineraryDay } from '../api/itineraries';
import {
  Sparkles, MapPin, DollarSign, ChevronDown, ChevronUp,
  Clock, Lightbulb, ArrowRight, RotateCcw, Loader2, AlertTriangle
} from 'lucide-react';

const SUGGESTIONS = [
  { label: '🗼 Weekend in Paris', prompt: 'I want a 3-day romantic trip to Paris, France with art galleries, fine dining, and iconic landmarks. Budget around $2000.' },
  { label: '🍜 Backpacking Japan', prompt: 'Plan a 7-day backpacking itinerary through Japan covering Tokyo, Kyoto and Osaka. Mix of culture, street food and temples. Budget $1500.' },
  { label: '🏖️ Bali Getaway', prompt: 'A 5-day relaxing beach holiday in Bali, Indonesia with yoga, spa sessions, temple visits and great local food. Budget $1000.' },
  { label: '🏔️ Swiss Alps Adventure', prompt: 'I want a 4-day adventure trip to the Swiss Alps with hiking, skiing, and mountain views. Budget $3000.' },
  { label: '🌆 New York City', prompt: 'Plan a 4-day trip to New York City covering Times Square, Central Park, museums and the best food spots. Budget $2500.' },
  { label: '🏛️ Ancient Rome', prompt: 'A 3-day cultural trip to Rome, Italy covering the Colosseum, Vatican, and authentic Italian cuisine. Budget $1500.' },
];

export const ItineraryGenerator = () => {
  const [searchParams] = useSearchParams();
  const initialDestination = searchParams.get('destination');
  const [prompt, setPrompt] = useState(initialDestination ? `Plan a trip to ${initialDestination}` : '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [openDay, setOpenDay] = useState<number | null>(0);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError('');
    try {
      const result = await generateItinerary(prompt.trim());
      setItinerary(result.itinerary);
      setOpenDay(0);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to generate itinerary. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setItinerary(null);
    setPrompt('');
    setError('');
    setOpenDay(null);
  };

  const toggleDay = (index: number) => {
    setOpenDay(prev => (prev === index ? null : index));
  };

  // ── STATE 2: RESULT VIEW ──────────────────────────────────────────────────
  if (itinerary) {
    return (
      <div className="min-h-screen bg-slate-900 text-white pt-20 pb-16">
        {/* Hero Banner */}
        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-900/60 via-slate-900 to-blue-900/40 border-b border-slate-700/50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              AI-Generated Itinerary
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-4">{itinerary.destination}</h1>
            <div className="flex flex-wrap items-center gap-6 text-slate-300">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-400" />
                <span>Est. Budget: <strong className="text-white">{itinerary.estimated_budget}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-400" />
                <span><strong className="text-white">{itinerary.days?.length || 0} days</strong> planned</span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 space-y-10">
          {/* AI Recommendations */}
          {itinerary.ai_recommendations?.length > 0 && (
            <section>
              <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                <Lightbulb className="w-5 h-5 text-yellow-400" />
                AI Tips & Recommendations
              </h2>
              <div className="flex flex-wrap gap-3">
                {itinerary.ai_recommendations.map((tip, i) => (
                  <span
                    key={i}
                    className="bg-yellow-400/10 border border-yellow-400/20 text-yellow-300 px-4 py-2 rounded-full text-sm leading-relaxed"
                  >
                    {tip}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Day-by-Day Accordion */}
          <section>
            <h2 className="text-xl font-bold mb-6">Your Day-by-Day Itinerary</h2>
            <div className="space-y-4">
              {itinerary.days?.map((day: ItineraryDay, index: number) => (
                <div
                  key={day.day}
                  className="bg-slate-800/40 border border-slate-700/50 rounded-2xl overflow-hidden transition-all duration-300"
                >
                  {/* Accordion Header */}
                  <button
                    onClick={() => toggleDay(index)}
                    aria-expanded={openDay === index}
                    aria-controls={`day-content-${index}`}
                    className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-700/30 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-sm shrink-0">
                        {day.day}
                      </div>
                      <div>
                        <p className="text-xs text-emerald-400 font-medium uppercase tracking-wider">Day {day.day}</p>
                        <p className="text-lg font-semibold text-white">{day.title}</p>
                      </div>
                    </div>
                    {openDay === index
                      ? <ChevronUp className="w-5 h-5 text-slate-400" />
                      : <ChevronDown className="w-5 h-5 text-slate-400" />
                    }
                  </button>

                  {/* Accordion Body */}
                  {openDay === index && (
                    <div id={`day-content-${index}`} className="px-6 pb-6 border-t border-slate-700/50">
                      <div className="relative pl-4 mt-6 space-y-6">
                        {/* Vertical timeline line */}
                        <div className="absolute left-0 top-2 bottom-2 w-px bg-emerald-500/20" />
                        {day.activities.map((act, ai) => (
                          <div key={ai} className="relative pl-6">
                            {/* Timeline dot */}
                            <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-slate-800" />
                            <p className="text-xs font-mono text-emerald-400 mb-1">{act.time}</p>
                            <h4 className="font-semibold text-white mb-1">{act.title}</h4>
                            <p className="text-slate-400 text-sm leading-relaxed">{act.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Actions */}
          <div className="flex flex-wrap gap-4 pt-4">
            <Link
              to="/dashboard"
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
            >
              View in Dashboard <ArrowRight className="w-4 h-4" />
            </Link>
            <button
              onClick={handleReset}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white px-6 py-3 rounded-xl font-semibold transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Generate Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── STATE 1: PROMPT INPUT ─────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      {/* Hero */}
      <div className="relative overflow-hidden flex-1 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-24">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-emerald-500/10 blur-3xl" />
        </div>

        <div className="relative max-w-3xl w-full text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Powered by AI
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-4 leading-tight">
            Plan Your Perfect<br />
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Trip with AI
            </span>
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Describe your dream holiday in plain language. Our AI travel expert will craft a detailed day-by-day itinerary in seconds.
          </p>
        </div>

        {/* Input Card */}
        <div className="relative w-full max-w-3xl">
          <div className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 shadow-2xl">
            {error && (
              <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <label className="block text-sm font-medium text-slate-300 mb-3">
              Describe your ideal trip
            </label>
            <textarea
              id="itinerary-prompt"
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              rows={5}
              placeholder="E.g. I want a 5-day romantic trip to Bali with beach, culture and great food, budget around $2000…"
              className="w-full bg-slate-900/80 border border-slate-600/50 rounded-xl px-4 py-3 text-white placeholder-slate-500 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all mb-6"
              disabled={loading}
            />

            {/* Suggestion chips */}
            <div className="mb-6">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">Quick ideas</p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTIONS.map(s => (
                  <button
                    key={s.label}
                    onClick={() => setPrompt(s.prompt)}
                    disabled={loading}
                    className="px-3 py-1.5 bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 hover:border-slate-500 rounded-full text-sm text-slate-300 hover:text-white transition-all disabled:opacity-50"
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Up to 5 free AI trips per hour
              </p>
              <button
                id="generate-itinerary-btn"
                onClick={handleGenerate}
                disabled={loading || !prompt.trim()}
                className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-emerald-500/20"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Planning your trip…
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate Itinerary
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Feature hints */}
        <div className="relative mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl w-full text-center">
          {[
            { icon: <MapPin className="w-5 h-5 text-emerald-400" />, title: 'Any Destination', desc: 'From bustling cities to remote islands' },
            { icon: <Clock className="w-5 h-5 text-blue-400" />, title: 'Any Duration', desc: 'Weekend getaways to month-long adventures' },
            { icon: <DollarSign className="w-5 h-5 text-yellow-400" />, title: 'Any Budget', desc: 'Budget backpacking or luxury travel' },
          ].map(f => (
            <div key={f.title} className="bg-slate-800/30 border border-slate-700/30 rounded-2xl p-5">
              <div className="flex justify-center mb-3">{f.icon}</div>
              <h3 className="font-semibold mb-1">{f.title}</h3>
              <p className="text-slate-500 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
