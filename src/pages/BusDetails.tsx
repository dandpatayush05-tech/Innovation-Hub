import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBus, createBusBooking, type Bus } from '../api/buses';
import { Checkout } from '../components/Checkout';
import { Loader2, Info, ArrowLeft, Check, User, AlertTriangle, Download } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { generateAndDownloadReceipt } from '../lib/receiptGenerator';

export const BusDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { error: toastError } = useToast();

  const [bus, setBus] = useState<Bus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Steps: 'seats' -> 'details' -> 'review' -> 'payment' -> 'success'
  const [step, setStep] = useState<'seats' | 'details' | 'review' | 'payment' | 'success'>('seats');

  // State for seat selection
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  // State for passenger details
  const [passengerDetails, setPassengerDetails] = useState<{ firstName: string, lastName: string, seatNumber: string }[]>([]);

  const [bookingId, setBookingId] = useState<string | null>(null);

  const fetchBus = useCallback(async () => {
    try {
      const { data } = await getBus(id!);
      setBus(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load bus details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) fetchBus();
  }, [id, fetchBus]);

  const handleSeatClick = (seatNumber: string) => {
    if (bus?.bookedSeats?.includes(seatNumber)) return;

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
    setPassengerDetails(selectedSeats.map(seat => ({ firstName: '', lastName: '', seatNumber: seat })));
    setStep('details');
  };

  const updatePassenger = (index: number, field: 'firstName' | 'lastName', value: string) => {
    const updated = [...passengerDetails];
    updated[index][field] = value;
    setPassengerDetails(updated);
  };

  const proceedToReview = () => {
    const isValid = passengerDetails.every(p => p.firstName.trim() && p.lastName.trim());
    if (!isValid) {
      toastError('Please fill out all passenger names.');
      return;
    }
    setStep('review');
  };

  const proceedToPayment = async () => {
    if (!user) {
      toastError('Please log in to book.');
      return;
    }
    try {
      setLoading(true);
      const res = await createBusBooking({
        bus_id: bus!.id,
        seats: selectedSeats.length,
        passenger_details: passengerDetails
      });
      setBookingId(res.booking.id);
      setStep('payment');
    } catch (err: any) {
      const message = err.response?.data?.error || 'Failed to create booking';
      setError(message);
      // If conflict, go back to seats and refresh
      if (message.includes('already booked')) {
        setStep('seats');
        setSelectedSeats([]);
        fetchBus();
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading && step !== 'payment') {
    return (
      <div className="min-h-screen bg-[#FDFBF7] pt-24 flex justify-center items-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#C84B31]" />
      </div>
    );
  }

  if (error && step === 'seats') {
    return (
      <div className="min-h-screen bg-[#FDFBF7] pt-24 flex justify-center">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  if (!bus) return null;

  const totalFare = bus.price * selectedSeats.length;

  // Render Seat Grid (Generic 2x2 layout for demo)
  const renderSeatGrid = () => {
    const totalDemoSeats = 40;
    const rows = Math.ceil(totalDemoSeats / 4);

    let grid = [];
    for (let r = 0; r < rows; r++) {
      let rowSeats = [];
      for (let c = 0; c < 4; c++) {
        const seatNum = `${r + 1}${['A', 'B', 'C', 'D'][c]}`;
        const isBooked = bus.bookedSeats?.includes(seatNum);
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

  return (
    <div className="min-h-screen bg-[#FDFBF7] pt-24 pb-12">
      {/* Demo Banner */}
      <div className="bg-[#C84B31]/10 border-b border-[#C84B31]/20 py-2 mb-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-[#C84B31] font-medium flex items-center justify-center gap-2">
            <Info className="w-4 h-4" />
            Demo Bus Inventory - Test Environment
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => {
            if (step === 'seats') navigate(-1);
            else if (step === 'details') setStep('seats');
            else if (step === 'review') setStep('details');
          }}
          className="flex items-center gap-2 text-gray-500 hover:text-black mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        {/* Bus Info Header */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-black/5 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-[#2A2A2A]">{bus.operator_name}</h2>
              <p className="text-gray-500">{bus.route_source} to {bus.route_destination}</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-[#C84B31]">${bus.price} <span className="text-sm font-normal text-gray-500">/ seat</span></p>
            </div>
          </div>
        </div>

        {error && step !== 'seats' && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center mb-6 flex items-center justify-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            {error}
          </div>
        )}

        {/* Step 1: Seats */}
        {step === 'seats' && (
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-black/5">
            <h3 className="text-xl font-bold text-[#2A2A2A] mb-6 text-center">Select Your Seats</h3>

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
                <span className="text-gray-400 font-bold uppercase tracking-wider text-xs">Front</span>
              </div>
              <div className="space-y-2">
                {renderSeatGrid()}
              </div>
            </div>

            <div className="mt-8 border-t pt-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Selected Seats ({selectedSeats.length})</p>
                <p className="font-bold text-lg">{selectedSeats.join(', ') || 'None'}</p>
              </div>
              <button
                onClick={proceedToDetails}
                disabled={selectedSeats.length === 0}
                className="bg-[#2A2A2A] text-white px-8 py-3 rounded-xl font-medium hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Passenger Details */}
        {step === 'details' && (
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-black/5">
            <h3 className="text-xl font-bold text-[#2A2A2A] mb-6">Passenger Details</h3>

            <div className="space-y-6">
              {passengerDetails.map((p, idx) => (
                <div key={idx} className="p-4 border border-gray-200 rounded-xl">
                  <div className="flex items-center gap-2 mb-4 text-[#C84B31] font-medium">
                    <User className="w-4 h-4" /> Passenger {idx + 1} (Seat: {p.seatNumber})
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">First Name</label>
                      <input
                        type="text"
                        value={p.firstName}
                        onChange={e => updatePassenger(idx, 'firstName', e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:border-[#C84B31]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Last Name</label>
                      <input
                        type="text"
                        value={p.lastName}
                        onChange={e => updatePassenger(idx, 'lastName', e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:border-[#C84B31]"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <button
                onClick={proceedToReview}
                className="w-full bg-[#2A2A2A] text-white px-8 py-4 rounded-xl font-medium hover:bg-black transition-colors"
              >
                Review Booking
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 'review' && (
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-black/5">
            <h3 className="text-xl font-bold text-[#2A2A2A] mb-6">Review & Pay</h3>

            <div className="bg-gray-50 p-6 rounded-xl mb-6">
              <h4 className="font-semibold mb-4 border-b pb-2">Fare Summary</h4>
              <div className="flex justify-between mb-2 text-gray-600">
                <span>Base Fare ({selectedSeats.length} seats)</span>
                <span>${totalFare.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-4 text-gray-600">
                <span>Taxes & Fees</span>
                <span>$0.00</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-4">
                <span>Total Amount</span>
                <span>${totalFare.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={proceedToPayment}
              disabled={loading}
              className="w-full bg-[#C84B31] text-white px-8 py-4 rounded-xl font-medium hover:bg-[#A63A25] transition-colors flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Proceed to Payment'}
            </button>
          </div>
        )}

        {/* Step 4: Payment via Razorpay */}
        {step === 'payment' && bookingId && (
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-black/5">
            <Checkout
              bookingId={bookingId}
              bookingType="bus_leg"
              onSuccess={() => setStep('success')}
            />
          </div>
        )}

        {/* Step 5: Success */}
        {step === 'success' && (
          <div className="bg-white p-12 rounded-2xl shadow-sm border border-black/5 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-[#2A2A2A] mb-2">Bus Booking Confirmed!</h2>
            <p className="text-gray-500 mb-6">Your demo bus tickets have been secured. Official GST tax invoice generated.</p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto mb-6">
              <button
                onClick={() => bus && generateAndDownloadReceipt({
                  receiptNumber: `YS-REC-${Date.now().toString().slice(-4)}`,
                  bookingReference: bookingId ? `YS-BUS-${bookingId.slice(-6)}` : `YS-BUS-${Date.now().toString().slice(-6)}`,
                  bookingType: 'Bus Journey',
                  title: `${bus.operator_name || 'Express Volvo'} (${bus.route_source} → ${bus.route_destination})`,
                  destination: bus.route_destination || 'India',
                  travelDate: new Date(bus.departure_time || Date.now()).toLocaleDateString('en-IN'),
                  customerName: user?.name || (passengerDetails[0]?.firstName ? `${passengerDetails[0].firstName} ${passengerDetails[0].lastName}` : 'Valued Passenger'),
                  customerEmail: user?.email || 'passenger@yatrasetu.com',
                  seats: selectedSeats,
                  totalAmount: selectedSeats.length * bus.price,
                  paymentMethod: 'Verified 3D Secure Demo Card',
                  taxAmount: Math.round((selectedSeats.length * bus.price) * 0.05)
                })}
                className="bg-stone-900 hover:bg-black text-white px-6 py-3 rounded-xl font-bold text-xs transition shadow-md flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4 text-amber-400" />
                <span>Download Bus Tax Invoice</span>
              </button>
              <button
                onClick={() => navigate('/dashboard/bookings')}
                className="bg-stone-100 hover:bg-stone-200 text-stone-800 px-6 py-3 rounded-xl font-bold text-xs transition"
              >
                View My Bookings
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
