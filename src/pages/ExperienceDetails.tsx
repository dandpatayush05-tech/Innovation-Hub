import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTour, Tour } from '../api/tours';
import { createGuideBooking } from '../api/bookings';
import { Checkout } from '../components/Checkout';
import { Clock, MapPin, Star, Calendar as CalendarIcon, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const ExperienceDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [tour, setTour] = useState<Tour | null>(null);
  const [loading, setLoading] = useState(true);

  // Booking Flow State
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1); // 1: Select Date/Time, 2: Guests, 3: Checkout, 4: Success
  const [bookingDate, setBookingDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [participants, setParticipants] = useState(1);
  const [guestInfo, setGuestInfo] = useState([{ name: '', age: '' }]);
  const [notes, setNotes] = useState('');
  
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const TIME_SLOTS = ['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'];

  useEffect(() => {
    if (id) {
      fetchTour(id);
    }
  }, [id]);

  const fetchTour = async (tourId: string) => {
    try {
      const res = await getTour(tourId);
      setTour(res.data);
    } catch (err) {
      console.error('Failed to fetch tour:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGuestChange = (index: number, field: string, value: string) => {
    const newGuestInfo = [...guestInfo];
    newGuestInfo[index] = { ...newGuestInfo[index], [field]: value };
    setGuestInfo(newGuestInfo);
  };

  const addGuest = () => {
    setParticipants(p => p + 1);
    setGuestInfo([...guestInfo, { name: '', age: '' }]);
  };

  const removeGuest = (index: number) => {
    if (participants > 1) {
      setParticipants(p => p - 1);
      setGuestInfo(guestInfo.filter((_, i) => i !== index));
    }
  };

  const handleCreateBooking = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!tour || !id) return;
    
    // Validation
    const invalidGuest = guestInfo.find(g => !g.name || !g.age);
    if (invalidGuest) {
      setError('Please fill out all guest details.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      
      const totalPrice = tour.price * participants;

      const res = await createGuideBooking({
        tour_id: id,
        booking_date: new Date(bookingDate).toISOString(),
        // time_slot: timeSlot,
        participants,
        // guest_info: guestInfo,
        total_price: totalPrice
        // notes
      });

      setBookingId(res.guideBooking.id);
      setStep(3); // Proceed to checkout
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to create booking.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16 bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!tour) {
    return (
      <div className="min-h-screen pt-24 text-center bg-gray-50">
        <h2 className="text-2xl font-bold text-gray-900">Experience not found</h2>
        <button onClick={() => navigate('/experiences')} className="mt-4 text-blue-600 hover:underline">
          Back to Experiences
        </button>
      </div>
    );
  }

  const totalPrice = tour.price * participants;

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-1/2">
              <img
                src={tour.image_url}
                alt={tour.name}
                className="w-full h-80 object-cover rounded-xl shadow-md"
              />
            </div>
            <div className="md:w-1/2 flex flex-col justify-center">
              <div className="inline-block bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full mb-4 w-max">
                {tour.category}
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{tour.name}</h1>
              <div className="flex items-center text-gray-500 mb-6">
                <MapPin className="w-5 h-5 mr-1" />
                <span>Destination ID: {tour.destination_id.slice(0,8)}...</span>
              </div>
              <div className="flex items-center gap-6 text-gray-700 mb-6 border-y py-4">
                <div className="flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-500">Duration</p>
                    <p className="font-semibold">{tour.duration_hours} hours</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Star className="w-5 h-5 mr-2 text-yellow-400 fill-current" />
                  <div>
                    <p className="text-sm text-gray-500">Rating</p>
                    <p className="font-semibold">4.8 (120 reviews)</p>
                  </div>
                </div>
              </div>
              <p className="text-gray-600 text-lg leading-relaxed">
                {tour.description}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          {/* Progress Bar */}
          <div className="flex items-center justify-between mb-8">
            {['Date & Time', 'Guest Info', 'Payment', 'Confirmation'].map((label, i) => (
              <div key={label} className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= i + 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                  {i + 1}
                </div>
                <span className="text-xs mt-2 text-gray-500 hidden sm:block">{label}</span>
              </div>
            ))}
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 flex items-start">
              <Info className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Select Date & Time</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Booking Date</label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="pl-10 pr-4 py-3 w-full border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Time Slot</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {TIME_SLOTS.map(slot => (
                    <button
                      key={slot}
                      onClick={() => setTimeSlot(slot)}
                      className={`py-3 rounded-xl border font-medium transition ${
                        timeSlot === slot 
                          ? 'border-blue-600 bg-blue-50 text-blue-700' 
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={() => {
                    if (!bookingDate || !timeSlot) setError('Please select both a date and a time slot.');
                    else { setError(''); setStep(2); }
                  }}
                  className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Guest Details</h2>
                <button 
                  onClick={addGuest}
                  className="text-blue-600 font-medium hover:text-blue-800 text-sm flex items-center"
                >
                  + Add Guest
                </button>
              </div>

              {guestInfo.map((guest, index) => (
                <div key={index} className="p-4 border rounded-xl bg-gray-50 relative">
                  {index > 0 && (
                    <button 
                      onClick={() => removeGuest(index)}
                      className="absolute top-4 right-4 text-red-500 text-sm font-medium hover:underline"
                    >
                      Remove
                    </button>
                  )}
                  <h4 className="font-semibold text-gray-700 mb-4">Guest {index + 1}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Full Name</label>
                      <input
                        type="text"
                        value={guest.name}
                        onChange={(e) => handleGuestChange(index, 'name', e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Age</label>
                      <input
                        type="number"
                        min="1"
                        value={guest.age}
                        onChange={(e) => handleGuestChange(index, 'age', e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="30"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Special Requests / Notes</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Any dietary requirements or accessibility needs?"
                ></textarea>
              </div>

              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex justify-between items-center">
                <div>
                  <p className="text-sm text-blue-800">Total Price ({participants} {participants === 1 ? 'guest' : 'guests'})</p>
                  <p className="text-2xl font-bold text-blue-900">${totalPrice.toFixed(2)}</p>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-3 text-gray-600 font-semibold hover:bg-gray-100 rounded-xl transition"
                >
                  Back
                </button>
                <button
                  onClick={handleCreateBooking}
                  disabled={submitting}
                  className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {submitting ? 'Processing...' : 'Review & Pay'}
                </button>
              </div>
            </div>
          )}

          {step === 3 && bookingId && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 text-center">Complete Payment</h2>
              <p className="text-gray-600 text-center mb-8">
                You're almost there! Complete your payment of <span className="font-bold">${totalPrice.toFixed(2)}</span> to confirm your booking for {tour.name}.
              </p>
              
              <div className="max-w-md mx-auto">
                <Checkout
                  bookingId={bookingId}
                  bookingType="tour"
                  onSuccess={() => setStep(4)}
                  onCancel={() => {
                    // Optional: handle cancel
                  }}
                />
              </div>

              <div className="text-center mt-6">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="text-sm text-gray-500 hover:underline"
                >
                  Pay later from Dashboard
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="text-center py-12 space-y-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-900">Booking Confirmed!</h2>
              <p className="text-gray-600 max-w-md mx-auto">
                Your experience <strong>{tour.name}</strong> on {new Date(bookingDate).toLocaleDateString()} at {timeSlot} has been successfully booked.
              </p>
              
              <div className="bg-gray-50 border rounded-xl p-6 max-w-sm mx-auto my-8 text-left">
                <h4 className="font-bold text-gray-800 mb-4 border-b pb-2">Voucher Details</h4>
                <p className="text-sm text-gray-600 mb-1"><strong>Booking ID:</strong> {bookingId?.slice(0, 8).toUpperCase()}</p>
                <p className="text-sm text-gray-600 mb-1"><strong>Guests:</strong> {participants}</p>
                <p className="text-sm text-gray-600 mb-1"><strong>Total Paid:</strong> ${totalPrice}</p>
                <div className="mt-4 pt-4 border-t border-dashed border-gray-300">
                  <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${bookingId}`} alt="QR Code" className="mx-auto w-32 h-32" />
                </div>
              </div>

              <div className="flex justify-center gap-4">
                <button
                  onClick={() => window.print()}
                  className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition"
                >
                  Print Voucher
                </button>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition"
                >
                  Go to Dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
