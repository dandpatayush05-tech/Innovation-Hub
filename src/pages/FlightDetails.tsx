import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getFlight, createFlightBooking, type Flight } from '../api/flights';
import { Checkout } from '../components/Checkout';
import { Plane, Loader2, Info, ArrowLeft, Check, User, Download } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { generateAndDownloadReceipt } from '../lib/receiptGenerator';

export const FlightDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { error: toastError } = useToast();

  const [flight, setFlight] = useState<Flight | null>(null);
  const [loading, setLoading] = useState(true);

  // Booking Form State
  const [passengers, setPassengers] = useState(1);
  const [passengerDetails, setPassengerDetails] = useState([{ firstName: '', lastName: '' }]);

  // Checkout Flow State
  const [step, setStep] = useState<'seats' | 'details' | 'review' | 'payment' | 'success'>('seats');
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSeatClick = (seatNumber: string) => {
    if (flight?.bookedSeats?.includes(seatNumber)) return;

    setSelectedSeats(prev => {
      if (prev.includes(seatNumber)) {
        return prev.filter(s => s !== seatNumber);
      } else {
        if (prev.length >= 6) {
          toastError('You can select a maximum of 6 seats at once.');
          return prev;
        }
        return [...prev, seatNumber];
      }
    });
  };

  const proceedToDetails = () => {
    if (selectedSeats.length === 0) return;
    setPassengers(selectedSeats.length);
    setPassengerDetails(selectedSeats.map(seat => ({ firstName: '', lastName: '', seatNumber: seat })));
    setStep('details');
  };

  useEffect(() => {
    if (!id) return;
    const fetchFlight = async () => {
      try {
        const res = await getFlight(id);
        setFlight(res.data);
      } catch (err) {
        console.error('Failed to fetch flight details', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFlight();
  }, [id]);

  const updatePassenger = (index: number, field: 'firstName' | 'lastName', value: string) => {
    const updated = [...passengerDetails];
    updated[index] = { ...updated[index], [field]: value };
    setPassengerDetails(updated);
  };

  const renderSeatGrid = () => {
    const totalDemoSeats = 60; // Just some demo seats for flights
    const rows = Math.ceil(totalDemoSeats / 4);

    let grid = [];
    for (let r = 0; r < rows; r++) {
      let rowSeats = [];
      for (let c = 0; c < 4; c++) {
        const seatNum = `${r + 1}${['A', 'B', 'C', 'D'][c]}`;
        const isBooked = flight?.bookedSeats?.includes(seatNum);
        const isSelected = selectedSeats.includes(seatNum);

        rowSeats.push(
          <button
            key={seatNum}
            disabled={isBooked}
            onClick={() => handleSeatClick(seatNum)}
            className={`w-12 h-12 rounded-t-xl rounded-b-md m-1 flex flex-col items-center justify-center text-xs font-bold transition-colors
              ${isBooked
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : isSelected
                  ? 'bg-[#C84B31] text-white'
                  : 'bg-white border-2 border-gray-300 text-gray-600 hover:border-[#C84B31]'
              }
            `}
          >
            {seatNum}
          </button>
        );
        if (c === 1) { // Aisle
          rowSeats.push(<div key={`aisle-${r}`} className="w-8"></div>);
        }
      }
      grid.push(<div key={`row-${r}`} className="flex justify-center">{rowSeats}</div>);
    }
    return grid;
  };

  const totalPrice = flight ? flight.price * passengers : 0;

  const handleProceedToReview = (e: React.FormEvent) => {
    e.preventDefault();
    // Basic validation
    const missingNames = passengerDetails.some(p => !p.firstName.trim() || !p.lastName.trim());
    if (missingNames) {
      setError('Please provide first and last names for all passengers.');
      return;
    }
    setError('');
    setStep('review');
  };

  const handleCreateBooking = async () => {
    if (!flight || !user) return;
    setIsSubmitting(true);
    setError('');
    try {
      const res = await createFlightBooking({
        flight_id: flight.id,
        passengers,
        passenger_details: passengerDetails
      });

      setBookingId(res.booking.id);
      setStep('payment');
    } catch (err: any) {
      console.error(err);
      const message = err.response?.data?.error || 'Failed to create booking.';
      setError(message);
      if (message.includes('already booked')) {
        setStep('seats');
        setSelectedSeats([]);
        // Re-fetch flight to get updated seats
        const { data } = await getFlight(flight.id);
        setFlight(data);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentSuccess = () => {
    setStep('success');
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#C84B31]" />
      </div>
    );
  }

  if (!flight) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-serif">Flight not found</h2>
        <button onClick={() => navigate('/dashboard/flights')} className="mt-4 text-[#C84B31] hover:underline">Return to search</button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Demo Banner */}
      <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl flex items-start gap-3">
        <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-sm">Test Environment: Demo Inventory</p>
          <p className="text-xs mt-1 opacity-80">
            This checkout flow uses a test payment gateway. No real airline ticket or PNR will be issued.
          </p>
        </div>
      </div>

      <button onClick={() => navigate('/dashboard/flights')} className="flex items-center text-sm font-medium text-[#2A2A2A]/60 hover:text-[#2A2A2A] transition-colors">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Flights
      </button>

      <div className="bg-white rounded-3xl p-6 md:p-8 border border-black/5 shadow-sm space-y-6">

        {/* Flight Summary Header */}
        <div className="flex flex-col md:flex-row justify-between md:items-center border-b border-black/5 pb-6 gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center">
              <Plane className="w-7 h-7 text-slate-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#2A2A2A]">{flight.airline}</h2>
              <p className="text-[#2A2A2A]/60">Flight {flight.flight_number}</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-xl font-bold text-[#2A2A2A]">{formatTime(flight.departure_time)}</p>
              <p className="text-sm text-[#2A2A2A]/60">{flight.departure_airport}</p>
              <p className="text-xs text-[#2A2A2A]/40">{formatDate(flight.departure_time)}</p>
            </div>
            <div className="flex flex-col items-center px-4">
              <Plane className="w-5 h-5 text-[#C84B31] mb-1" />
              <div className="w-16 h-px bg-black/10"></div>
            </div>
            <div className="text-left">
              <p className="text-xl font-bold text-[#2A2A2A]">{formatTime(flight.arrival_time)}</p>
              <p className="text-sm text-[#2A2A2A]/60">{flight.arrival_airport}</p>
              <p className="text-xs text-[#2A2A2A]/40">{formatDate(flight.arrival_time)}</p>
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="pt-2">
          {step === 'seats' && (
            <div className="space-y-6 animate-in fade-in">
              <h3 className="text-xl font-bold text-[#2A2A2A] text-center">Select Your Seats</h3>

              <div className="flex justify-center gap-6 mb-8">
                <div className="flex items-center gap-2"><div className="w-4 h-4 bg-white border-2 border-gray-300 rounded-sm"></div> <span className="text-sm text-gray-600">Available</span></div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 bg-[#C84B31] rounded-sm"></div> <span className="text-sm text-gray-600">Selected</span></div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 bg-gray-200 rounded-sm"></div> <span className="text-sm text-gray-600">Booked</span></div>
              </div>

              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 w-max mx-auto relative pb-12">
                <div className="flex justify-between items-center mb-6 px-4 border-b-2 border-gray-300 pb-4">
                  <div className="w-8 h-8 rounded-full border-2 border-gray-400 flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-gray-400 rounded-full"></div>
                  </div>
                  <span className="text-gray-400 font-bold uppercase tracking-wider text-xs">Cockpit</span>
                </div>
                <div className="space-y-2">
                  {renderSeatGrid()}
                </div>
              </div>

              {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl">{error}</div>}

              <div className="mt-8 border-t pt-6 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Selected Seats ({selectedSeats.length})</p>
                  <p className="font-bold text-lg">{selectedSeats.join(', ') || 'None'}</p>
                </div>
                <button
                  onClick={proceedToDetails}
                  disabled={selectedSeats.length === 0}
                  className="bg-[#C84B31] text-white px-8 py-3 rounded-xl font-medium hover:bg-[#A63A25] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {step === 'details' && (
            <form onSubmit={handleProceedToReview} className="space-y-6 animate-in fade-in">
              <div className="flex justify-between items-end">
                <h3 className="text-xl font-medium text-[#2A2A2A]">Passenger Details</h3>
                <button type="button" onClick={() => setStep('seats')} className="text-sm text-blue-600 hover:underline">Change Seats</button>
              </div>

              {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl">{error}</div>}

              <div className="space-y-4">
                {passengerDetails.map((p, index) => (
                  <div key={index} className="bg-[#FDFBF7] p-4 rounded-2xl border border-black/5 flex flex-col md:flex-row gap-4">
                    <div className="flex items-center gap-2 mb-2 md:mb-0 w-full md:w-auto md:min-w-[120px]">
                      <User className="w-5 h-5 text-[#2A2A2A]/40" />
                      <span className="font-medium text-sm">Passenger {index + 1} (Seat: {(p as any).seatNumber})</span>
                    </div>
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="First Name"
                        required
                        value={p.firstName}
                        onChange={(e) => updatePassenger(index, 'firstName', e.target.value)}
                        className="w-full border border-black/10 rounded-xl px-4 py-2.5 text-sm focus:border-[#C84B31] outline-none"
                      />
                    </div>
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="Last Name"
                        required
                        value={p.lastName}
                        onChange={(e) => updatePassenger(index, 'lastName', e.target.value)}
                        className="w-full border border-black/10 rounded-xl px-4 py-2.5 text-sm focus:border-[#C84B31] outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-4 border-t border-black/5">
                <button
                  type="submit"
                  className="bg-[#C84B31] text-white px-8 py-3 rounded-xl font-medium hover:bg-[#A63A25] transition-colors"
                >
                  Continue to Review
                </button>
              </div>
            </form>
          )}

          {step === 'review' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-medium text-[#2A2A2A]">Review Booking</h3>
                <button onClick={() => setStep('details')} className="text-sm font-medium text-[#2A2A2A]/60 hover:text-[#2A2A2A]">
                  Edit Passengers
                </button>
              </div>

              <div className="bg-[#FDFBF7] p-5 rounded-2xl border border-black/5">
                <h4 className="font-semibold mb-3 text-sm uppercase tracking-wider text-[#2A2A2A]/60">Passengers</h4>
                <div className="space-y-2">
                  {passengerDetails.map((p, i) => (
                    <div key={i} className="flex gap-2 items-center text-sm">
                      <User className="w-4 h-4 text-[#2A2A2A]/40" />
                      {p.firstName} {p.lastName}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3 bg-white p-5 rounded-2xl border border-black/5">
                <h4 className="font-semibold mb-3 text-sm uppercase tracking-wider text-[#2A2A2A]/60">Fare Breakdown</h4>
                <div className="flex justify-between text-sm">
                  <span className="text-[#2A2A2A]/60">Base Fare (${flight.price} × {passengers})</span>
                  <span>${totalPrice}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#2A2A2A]/60">Taxes & Fees (Demo)</span>
                  <span>$0.00</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-3 border-t border-black/5 mt-2">
                  <span>Total (USD)</span>
                  <span className="text-[#C84B31]">${totalPrice}</span>
                </div>
              </div>

              {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl">{error}</div>}

              <button
                onClick={handleCreateBooking}
                disabled={isSubmitting}
                className="w-full bg-black text-white py-4 rounded-xl font-medium hover:bg-[#333] transition-colors disabled:opacity-50 flex justify-center items-center"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm & Proceed to Payment'}
              </button>
            </div>
          )}

          {step === 'payment' && bookingId && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 max-w-lg mx-auto py-4">
              <div className="text-center mb-6">
                <h3 className="text-xl font-medium text-[#2A2A2A]">Secure Payment</h3>
                <p className="text-sm text-[#2A2A2A]/60 mt-1">Complete your transaction to issue tickets.</p>
              </div>

              <Checkout
                bookingId={bookingId}
                bookingType="flight"
                onSuccess={handlePaymentSuccess}
                onCancel={() => setStep('review')}
              />
            </div>
          )}

          {step === 'success' && (
            <div className="space-y-6 text-center animate-in zoom-in-95 duration-500 py-12">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-3xl font-serif text-[#2A2A2A]">Flight Booked!</h3>
              <p className="text-[#2A2A2A]/60 max-w-md mx-auto">
                Your demo flight on {flight.airline} has been successfully reserved. Since this is a test environment, a PNR is not generated.
              </p>

              <div className="pt-6 flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
                <button
                  onClick={() => generateAndDownloadReceipt({
                    receiptNumber: `YS-REC-${Date.now().toString().slice(-4)}`,
                    bookingReference: bookingId ? `YS-FLT-${bookingId.slice(-6)}` : `YS-FLT-${Date.now().toString().slice(-6)}`,
                    bookingType: 'Flight',
                    title: `${flight.airline} (${flight.flight_number})`,
                    destination: flight.arrival_airport || 'India',
                    travelDate: new Date(flight.departure_time || Date.now()).toLocaleDateString('en-IN'),
                    customerName: user?.name || (passengerDetails[0]?.firstName ? `${passengerDetails[0].firstName} ${passengerDetails[0].lastName}` : 'Valued Passenger'),
                    customerEmail: user?.email || 'passenger@yatrasetu.com',
                    seats: selectedSeats.length > 0 ? selectedSeats : ['Economy'],
                    totalAmount: totalPrice,
                    paymentMethod: 'Verified 3D Secure Demo Card',
                    taxAmount: Math.round(totalPrice * 0.05)
                  })}
                  className="bg-stone-900 hover:bg-black text-white px-6 py-3 rounded-full font-bold text-xs transition shadow-md flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4 text-amber-400" />
                  <span>Download Flight Invoice</span>
                </button>
                <button
                  onClick={() => navigate('/dashboard/bookings')}
                  className="bg-stone-100 hover:bg-stone-200 text-stone-800 px-6 py-3 rounded-full font-bold text-xs transition"
                >
                  View My Bookings
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
