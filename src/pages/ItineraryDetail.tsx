import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getItinerary, updateItinerary, deleteItinerary, duplicateItinerary } from '../api/itineraries';
import type { Itinerary, ItineraryDay, ItineraryActivity } from '../api/itineraries';
import { useAuth } from '../context/AuthContext';
import { 
  Sparkles, DollarSign, Clock, ChevronDown, ChevronUp, Loader2, Lock, ArrowLeft,
  Edit2, Save, Trash2, Plus, Copy, Share2, CheckCircle2
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

export const ItineraryDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [forbidden, setForbidden] = useState(false);
  
  const [editMode, setEditMode] = useState(false);
  const [openDay, setOpenDay] = useState<number | null>(0);

  useEffect(() => {
    if (!id) return;
    fetchItinerary();
  }, [id]);

  const fetchItinerary = async () => {
    try {
      const res = await getItinerary(id!);
      // Ensure all activities have an ID
      const itineraryData = res.itinerary;
      itineraryData.days = itineraryData.days.map(day => ({
        ...day,
        activities: day.activities.map(act => ({ ...act, id: act.id || uuidv4() }))
      }));
      setItinerary(itineraryData);
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes('403')) {
        setForbidden(true);
      } else {
        setError('Could not load this itinerary. It may not exist.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!itinerary) return;
    setSaving(true);
    try {
      await updateItinerary(itinerary.id, {
        name: itinerary.name,
        destination: itinerary.destination,
        estimated_budget: itinerary.estimated_budget,
        notes: itinerary.notes,
        is_public: itinerary.is_public,
        days: itinerary.days
      });
      setEditMode(false);
    } catch (_err) {
      console.error(_err);
      alert('Failed to save itinerary');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!itinerary || !window.confirm('Are you sure you want to delete this itinerary?')) return;
    try {
      await deleteItinerary(itinerary.id);
      navigate('/dashboard/itineraries');
    } catch (_err) {
      console.error(_err);
      alert('Failed to delete itinerary');
    }
  };

  const handleDuplicate = async () => {
    if (!itinerary) return;
    try {
      const res = await duplicateItinerary(itinerary.id);
      navigate(`/dashboard/itineraries/${res.itinerary.id}`);
    } catch (_err) {
      console.error(_err);
      alert('Failed to duplicate itinerary');
    }
  };

  const updateDay = (dayIndex: number, newDay: ItineraryDay) => {
    if (!itinerary) return;
    const newDays = [...itinerary.days];
    newDays[dayIndex] = newDay;
    setItinerary({ ...itinerary, days: newDays });
  };

  const addActivity = (dayIndex: number) => {
    if (!itinerary) return;
    const day = itinerary.days[dayIndex];
    const newActivity: ItineraryActivity = {
      id: uuidv4(),
      time: '10:00 AM',
      title: 'New Activity',
      description: '',
      type: 'note',
      booking_status: 'planned'
    };
    updateDay(dayIndex, { ...day, activities: [...day.activities, newActivity] });
  };

  const updateActivity = (dayIndex: number, actIndex: number, updates: Partial<ItineraryActivity>) => {
    if (!itinerary) return;
    const day = itinerary.days[dayIndex];
    const newActivities = [...day.activities];
    newActivities[actIndex] = { ...newActivities[actIndex], ...updates };
    updateDay(dayIndex, { ...day, activities: newActivities });
  };

  const removeActivity = (dayIndex: number, actIndex: number) => {
    if (!itinerary) return;
    const day = itinerary.days[dayIndex];
    const newActivities = day.activities.filter((_, i) => i !== actIndex);
    updateDay(dayIndex, { ...day, activities: newActivities });
  };

  const moveActivity = (dayIndex: number, actIndex: number, direction: -1 | 1) => {
    if (!itinerary) return;
    const day = itinerary.days[dayIndex];
    if (actIndex + direction < 0 || actIndex + direction >= day.activities.length) return;
    const newActivities = [...day.activities];
    const temp = newActivities[actIndex];
    newActivities[actIndex] = newActivities[actIndex + direction];
    newActivities[actIndex + direction] = temp;
    updateDay(dayIndex, { ...day, activities: newActivities });
  };

  const getBookLink = (type?: string, refId?: string, destination?: string) => {
    switch (type) {
      case 'hotel': return refId ? `/dashboard/hotels/${refId}` : `/dashboard/hotels?search=${destination}`;
      case 'flight': return `/dashboard/flights?to=${destination}`;
      case 'bus': return `/dashboard/buses?to=${destination}`;
      case 'auto': return `/dashboard/auto`;
      case 'experience': return refId ? `/dashboard/experiences/${refId}` : `/dashboard/experiences?search=${destination}`;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
      </div>
    );
  }

  if (forbidden) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center gap-6">
        <Lock className="w-16 h-16 text-slate-600" />
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="text-slate-400">This itinerary is private.</p>
        <Link to="/dashboard" className="bg-emerald-500 hover:bg-emerald-600 px-6 py-3 rounded-xl font-semibold">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  if (error || !itinerary) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center gap-4">
        <p className="text-slate-400">{error || 'Itinerary not found.'}</p>
        <Link to="/dashboard" className="text-emerald-400 hover:underline flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
      </div>
    );
  }

  const isOwner = user?.id === itinerary.user_id;

  return (
    <div className="min-h-screen bg-slate-900 text-white pt-20 pb-16">
      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-emerald-900/60 via-slate-900 to-blue-900/40 border-b border-slate-700/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <Link to="/dashboard" className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </Link>
            
            {/* Actions */}
            <div className="flex items-center gap-3">
              <button onClick={handleDuplicate} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg text-sm transition-colors">
                <Copy className="w-4 h-4" /> Duplicate
              </button>
              {isOwner && (
                <>
                  <button onClick={() => setItinerary({...itinerary, is_public: !itinerary.is_public})} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${itinerary.is_public ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-800 hover:bg-slate-700'}`}>
                    <Share2 className="w-4 h-4" /> {itinerary.is_public ? 'Shared' : 'Share'}
                  </button>
                  {editMode ? (
                    <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 px-4 py-2 rounded-lg text-sm transition-colors">
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save
                    </button>
                  ) : (
                    <button onClick={() => setEditMode(true)} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg text-sm transition-colors">
                      <Edit2 className="w-4 h-4" /> Edit
                    </button>
                  )}
                  <button onClick={handleDelete} className="flex items-center gap-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 px-4 py-2 rounded-lg text-sm transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium mb-3">
            <Sparkles className="w-4 h-4" />
            {editMode ? <input type="text" value={itinerary.name || ''} onChange={e => setItinerary({...itinerary, name: e.target.value})} placeholder="Itinerary Name" className="bg-transparent border-b border-emerald-500/50 focus:outline-none" /> : (itinerary.name || 'Saved Itinerary')}
          </div>
          
          <h1 className="text-5xl font-bold mb-4">
            {editMode ? <input type="text" value={itinerary.destination} onChange={e => setItinerary({...itinerary, destination: e.target.value})} className="bg-transparent border-b border-slate-700 focus:outline-none w-full" /> : itinerary.destination}
          </h1>

          <div className="flex flex-wrap gap-6 text-slate-300">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              <span>Est. Budget: {editMode ? <input type="text" value={itinerary.estimated_budget} onChange={e => setItinerary({...itinerary, estimated_budget: e.target.value})} className="bg-slate-800 px-2 py-1 rounded" /> : <strong className="text-white">{itinerary.estimated_budget}</strong>}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-400" />
              <span><strong className="text-white">{itinerary.days?.length || 0} days</strong> planned</span>
            </div>
          </div>
          
          {editMode && (
            <div className="mt-4">
              <textarea placeholder="Add notes..." value={itinerary.notes || ''} onChange={e => setItinerary({...itinerary, notes: e.target.value})} className="w-full bg-slate-800 rounded-lg p-3 text-sm focus:outline-none" rows={3} />
            </div>
          )}
          {!editMode && itinerary.notes && (
            <div className="mt-4 text-slate-400 text-sm italic">{itinerary.notes}</div>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 space-y-10">
        {/* Days Accordion */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Day-by-Day Itinerary</h2>
            {editMode && (
              <button onClick={() => setItinerary({...itinerary, days: [...itinerary.days, { day: itinerary.days.length + 1, title: `Day ${itinerary.days.length + 1}`, activities: [] }]})} className="text-sm flex items-center gap-1 text-emerald-400 hover:text-emerald-300">
                <Plus className="w-4 h-4" /> Add Day
              </button>
            )}
          </div>
          
          <div className="space-y-4">
            {itinerary.days?.map((day: ItineraryDay, dayIndex: number) => (
              <div key={day.day} className="bg-slate-800/40 border border-slate-700/50 rounded-2xl overflow-hidden">
                <button
                  onClick={() => setOpenDay(prev => prev === dayIndex ? null : dayIndex)}
                  aria-expanded={openDay === dayIndex}
                  aria-controls={`day-detail-${dayIndex}`}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-700/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-sm shrink-0">
                      {day.day}
                    </div>
                    <div>
                      <p className="text-xs text-emerald-400 font-medium uppercase tracking-wider">Day {day.day}</p>
                      {editMode ? (
                        <input type="text" value={day.title} onClick={e => e.stopPropagation()} onChange={e => updateDay(dayIndex, {...day, title: e.target.value})} className="bg-slate-800 text-white px-2 py-1 rounded mt-1" />
                      ) : (
                        <p className="text-lg font-semibold text-white">{day.title}</p>
                      )}
                    </div>
                  </div>
                  {openDay === dayIndex ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                </button>

                {openDay === dayIndex && (
                  <div id={`day-detail-${dayIndex}`} className="px-6 pb-6 border-t border-slate-700/50">
                    <div className="relative pl-4 mt-6 space-y-6">
                      <div className="absolute left-0 top-2 bottom-2 w-px bg-emerald-500/20" />
                      
                      {day.activities.map((act, actIndex) => {
                        const bookLink = getBookLink(act.type, act.reference_id, itinerary.destination);
                        
                        return (
                          <div key={act.id} className="relative pl-6 group">
                            <div className={`absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full ring-2 ring-slate-800 ${act.booking_status === 'booked' ? 'bg-blue-500' : 'bg-emerald-500'}`} />
                            
                            {editMode ? (
                              <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
                                <div className="flex justify-between gap-4 mb-3">
                                  <div className="flex gap-2 w-full">
                                    <input type="text" value={act.time} onChange={e => updateActivity(dayIndex, actIndex, {time: e.target.value})} className="bg-slate-900 px-2 py-1 rounded w-24 text-sm" placeholder="Time" />
                                    <input type="text" value={act.title} onChange={e => updateActivity(dayIndex, actIndex, {title: e.target.value})} className="bg-slate-900 px-2 py-1 rounded flex-1 font-semibold text-sm" placeholder="Title" />
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <button onClick={() => moveActivity(dayIndex, actIndex, -1)} className="p-1 hover:bg-slate-700 rounded"><ChevronUp className="w-4 h-4" /></button>
                                    <button onClick={() => moveActivity(dayIndex, actIndex, 1)} className="p-1 hover:bg-slate-700 rounded"><ChevronDown className="w-4 h-4" /></button>
                                    <button onClick={() => removeActivity(dayIndex, actIndex)} className="p-1 hover:bg-red-500/20 text-red-400 rounded ml-2"><Trash2 className="w-4 h-4" /></button>
                                  </div>
                                </div>
                                <textarea value={act.description} onChange={e => updateActivity(dayIndex, actIndex, {description: e.target.value})} className="w-full bg-slate-900 rounded p-2 text-sm mb-3" rows={2} placeholder="Description..." />
                                <div className="flex flex-wrap gap-4 items-center text-sm">
                                  <select value={act.type || 'note'} onChange={e => updateActivity(dayIndex, actIndex, {type: e.target.value as any})} className="bg-slate-900 px-2 py-1 rounded border border-slate-700">
                                    <option value="note">Note</option>
                                    <option value="hotel">Hotel</option>
                                    <option value="flight">Flight</option>
                                    <option value="bus">Bus</option>
                                    <option value="auto">Auto</option>
                                    <option value="experience">Experience</option>
                                    <option value="restaurant">Restaurant</option>
                                  </select>
                                  <select value={act.booking_status || 'planned'} onChange={e => updateActivity(dayIndex, actIndex, {booking_status: e.target.value as any})} className="bg-slate-900 px-2 py-1 rounded border border-slate-700">
                                    <option value="planned">Planned</option>
                                    <option value="booked">Booked</option>
                                  </select>
                                  <input type="number" placeholder="Est. Cost ($)" value={act.estimated_cost || ''} onChange={e => updateActivity(dayIndex, actIndex, {estimated_cost: Number(e.target.value)})} className="bg-slate-900 px-2 py-1 rounded w-28 border border-slate-700" />
                                </div>
                              </div>
                            ) : (
                              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <p className="text-xs font-mono text-emerald-400">{act.time}</p>
                                    {act.type && act.type !== 'note' && (
                                      <span className="text-[10px] uppercase tracking-wider bg-slate-800 px-2 py-0.5 rounded-full text-slate-400">{act.type}</span>
                                    )}
                                    {act.booking_status === 'booked' && (
                                      <span className="text-[10px] uppercase tracking-wider bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                                        <CheckCircle2 className="w-3 h-3" /> Booked
                                      </span>
                                    )}
                                  </div>
                                  <h4 className="font-semibold text-white mb-1">{act.title}</h4>
                                  <p className="text-slate-400 text-sm leading-relaxed">{act.description}</p>
                                  {act.estimated_cost && <p className="text-slate-500 text-sm mt-1">Est. Cost: ${act.estimated_cost}</p>}
                                </div>
                                
                                {act.type && act.type !== 'note' && act.type !== 'restaurant' && act.booking_status !== 'booked' && isOwner && bookLink && (
                                  <Link to={bookLink} className="shrink-0 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 px-4 py-2 rounded-lg text-sm font-medium transition-colors text-center">
                                    Book Now
                                  </Link>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                      
                      {editMode && (
                        <div className="pl-6 pt-4">
                          <button onClick={() => addActivity(dayIndex)} className="flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300">
                            <Plus className="w-4 h-4" /> Add Activity
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
