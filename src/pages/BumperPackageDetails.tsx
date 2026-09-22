import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, MapPin, Star, Calendar, Users, Shield, CheckCircle2, 
  Plane, Train, Bus, Car, CreditCard, Sparkles, Building2, 
  FileText, Download, Clock, Check, Info
} from 'lucide-react';
import { BUMPER_PACKAGES, type BumperPackage } from '../data/bumperPackagesData';
import { SeatSelectorGrid } from '../components/transport/SeatSelectorGrid';
import { DemoPaymentModal } from '../components/payments/DemoPaymentModal';
import { generateAndDownloadReceipt } from '../lib/receiptGenerator';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useNotifications } from '../context/NotificationContext';

export const BumperPackageDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { success, error } = useToast();
  const { addNotification } = useNotifications();

  const pkg: BumperPackage | undefined = BUMPER_PACKAGES.find(
    p => p.slug === id || p.id === id || p.destination.toLowerCase() === id?.toLowerCase()
  ) || BUMPER_PACKAGES[0];

  const [selectedTier, setSelectedTier] = useState<'Budget' | 'Comfort' | 'Luxury'>('Comfort');
  const [travelersCount, setTravelersCount] = useState<number>(2);
  const [travelDate, setTravelDate] = useState<string>(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [selectedSeats, setSelectedSeats] = useState<string[]>(['1A', '1B']);
  const [selectedCareIds, setSelectedCareIds] = useState<string[]>(['sc-1']);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState<any | null>(null);

  const activeTierObj = pkg.hotelTiers.find(t => t.tier === selectedTier) || pkg.hotelTiers[1];

  const basePricePerPerson = pkg.discountedPrice;
  const hotelUpgrade = selectedTier === 'Luxury' ? 6000 : selectedTier === 'Comfort' ? 2500 : 0;
  const totalPrice = (basePricePerPerson + hotelUpgrade) * travelersCount;

  const handleSeatToggle = (seatId: string) => {
    setSelectedSeats(prev => {
      if (prev.includes(seatId)) {
        return prev.filter(s => s !== seatId);
      }
      if (prev.length >= travelersCount) {
        return [...prev.slice(1), seatId];
      }
      return [...prev, seatId];
    });
  };

  const handleCareToggle = (careId: string) => {
    setSelectedCareIds(prev => 
      prev.includes(careId) ? prev.filter(c => c !== careId) : [...prev, careId]
    );
  };

  const handleInitiatePayment = () => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: `/packages/${pkg.slug}` } } });
      return;
    }
    setPaymentModalOpen(true);
  };

  const handlePaymentSuccess = (paymentDetails: any) => {
    const bookingRef = `YS-PKG-${Date.now().toString().slice(-6)}`;
    const newBooking = {
      id: `booking_${Date.now()}`,
      bookingReference: bookingRef,
      type: 'package',
      title: pkg.title,
      destination: pkg.destination,
      date: travelDate,
      guests: travelersCount,
      totalAmount: totalPrice,
      status: 'confirmed',
      hotelTier: selectedTier,
      hotelName: activeTierObj.name,
      seats: selectedSeats,
      paymentId: paymentDetails.paymentId,
      receiptNumber: `YS-REC-${Date.now().toString().slice(-4)}`
    };

    // Store booking
    const stored = localStorage.getItem('yatra_setu_local_bookings');
    const existing = stored ? JSON.parse(stored) : [];
    localStorage.setItem('yatra_setu_local_bookings', JSON.stringify([newBooking, ...existing]));
    window.dispatchEvent(new Event('bookings_updated'));

    // Store payment
    const paymentRecord = {
      id: `pay_${Date.now()}`,
      booking_id: newBooking.id,
      amount: totalPrice,
      currency: 'INR',
      status: 'completed',
      payment_method: paymentDetails.method || 'card',
      card_last4: paymentDetails.cardLast4 || '4242',
      card_network: paymentDetails.cardNetwork || 'Visa Platinum',
      receipt_url: '#',
      created_at: new Date().toISOString(),
      item_title: pkg.title
    };
    const storedPays = localStorage.getItem('yatra_setu_local_payments');
    const existingPays = storedPays ? JSON.parse(storedPays) : [];
    localStorage.setItem('yatra_setu_local_payments', JSON.stringify([paymentRecord, ...existingPays]));
    window.dispatchEvent(new Event('payments_updated'));

    // Notify user
    addNotification({
      type: 'payment_completed',
      title: `Bumper Package Confirmed: ${pkg.title}`,
      message: `Booking ${bookingRef} confirmed for ${travelersCount} travelers. Enjoy your holiday in ${pkg.destination}!`,
      link: '/dashboard/bookings'
    });

    setBookingConfirmed(newBooking);
    success(`Payment successful! Bumper Package ${bookingRef} confirmed.`);
  };

  const handleDownloadInvoice = () => {
    if (!bookingConfirmed) return;
    generateAndDownloadReceipt({
      receiptNumber: bookingConfirmed.receiptNumber,
      bookingReference: bookingConfirmed.bookingReference,
      bookingType: 'package',
      title: pkg.title,
      destination: pkg.destination,
      travelDate: travelDate,
      customerName: user?.name || 'Valued Traveler',
      customerEmail: user?.email || 'traveler@yatrasetu.com',
      seats: selectedSeats,
      totalAmount: totalPrice,
      paymentMethod: 'Demo Card Simulator (Verified 3D Secure)',
      taxAmount: Math.round(totalPrice * 0.05),
      hotelDetails: {
        name: activeTierObj.name,
        roomType: `${selectedTier} Suite`,
        checkIn: travelDate
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans text-[#2A2A2A] pb-24">
      {/* 1. TOP NAVBAR */}
      <nav className="border-b border-black/5 bg-white/90 backdrop-blur-md sticky top-0 z-50 transition-all">
        <div className="max-w-[1360px] mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/packages')}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-white border border-black/10 text-[#2A2A2A] hover:bg-[#2A2A2A] hover:text-white transition-all shadow-xs font-medium text-sm cursor-pointer group"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              <span>All Packages</span>
            </button>
            <Link to="/" className="flex items-center space-x-2 text-[#2A2A2A] no-underline">
              <span className="font-display text-2xl font-bold tracking-tight">Yatra Setu</span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="text-xs sm:text-sm font-semibold uppercase text-[#292929] tracking-wider hover:text-[#C84B31] transition-colors bg-white px-3.5 py-1.5 rounded-full border border-black/10 shadow-xs cursor-pointer"
              >
                Dashboard
              </button>
            ) : (
              <Link
                to="/login"
                state={{ isRegister: true }}
                className="text-xs sm:text-sm font-semibold uppercase text-[#C84B31] tracking-wider hover:opacity-80 transition-opacity"
              >
                Register
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* 2. CONFIRMATION SCREEN IF BOOKED */}
      {bookingConfirmed ? (
        <section className="max-w-3xl mx-auto px-6 pt-16">
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-black/5 shadow-lg text-center space-y-6">
            <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="font-serif text-3xl font-bold text-[#2A2A2A]">
                Holiday Package Confirmed!
              </h2>
              <p className="text-sm text-[#2A2A2A]/70 max-w-md mx-auto">
                Your all-in-one trip to {pkg.destination} has been confirmed with booking reference <span className="font-mono font-bold text-[#C84B31]">{bookingConfirmed.bookingReference}</span>.
              </p>
            </div>

            <div className="bg-[#FDFBF7] p-6 rounded-2xl border border-black/5 text-left text-xs space-y-2.5 max-w-lg mx-auto">
              <div className="flex justify-between">
                <span className="text-gray-500">Package:</span>
                <span className="font-semibold text-gray-900">{pkg.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Travel Date:</span>
                <span className="font-semibold text-gray-900">{travelDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Selected Hotel:</span>
                <span className="font-semibold text-gray-900">{activeTierObj.name} ({selectedTier})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Allocated Seats:</span>
                <span className="font-semibold text-gray-900">{selectedSeats.join(', ')}</span>
              </div>
              <div className="flex justify-between border-t border-black/5 pt-2 text-sm font-bold">
                <span>Total Paid (incl. 5% GST):</span>
                <span className="text-[#C84B31]">₹{totalPrice.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <button
                onClick={handleDownloadInvoice}
                className="inline-flex items-center gap-2 bg-[#C84B31] hover:bg-[#A63A25] text-white px-6 py-3 rounded-full font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Official Tax Invoice & Voucher</span>
              </button>
              <button
                onClick={() => navigate('/dashboard/bookings')}
                className="bg-white border border-black/10 hover:bg-gray-50 text-[#2A2A2A] px-6 py-3 rounded-full font-semibold text-xs transition-all cursor-pointer"
              >
                View in Upcoming Trips
              </button>
            </div>
          </div>
        </section>
      ) : (
        /* 3. MAIN PACKAGE CUSTOMIZATION WORKFLOW */
        <div className="max-w-[1360px] mx-auto px-6 pt-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column (8 cols): Showcase, Hotels, Seats, Care, Itinerary */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* Main Photo Banner */}
              <div className="relative aspect-[16/9] rounded-3xl overflow-hidden shadow-md bg-gray-100 border border-black/5">
                <img 
                  src={pkg.heroImage} 
                  alt={pkg.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-bold text-[#C84B31]">
                  {pkg.badge}
                </div>
                <div className="absolute top-4 right-4 bg-emerald-600 text-white px-3.5 py-1.5 rounded-full text-xs font-bold">
                  {pkg.discountPercent}% FESTIVE DISCOUNT
                </div>
              </div>

              {/* Title & Overview */}
              <div className="bg-white rounded-3xl p-8 border border-black/5 shadow-xs space-y-4">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="flex items-center gap-1 text-[#C84B31] font-bold uppercase tracking-wider">
                    <MapPin className="w-3.5 h-3.5" />
                    {pkg.destination}, India
                  </span>
                  <span className="flex items-center gap-1 font-bold text-gray-800">
                    <Star className="w-3.5 h-3.5 text-yellow-400 fill-current" />
                    {pkg.rating} ({pkg.reviewsCount} verified traveler reviews)
                  </span>
                </div>

                <h1 className="font-serif text-3xl font-bold text-[#2A2A2A]">
                  {pkg.title}
                </h1>

                <p className="text-sm text-[#2A2A2A]/80 leading-relaxed">
                  {pkg.description}
                </p>

                {/* Highlights */}
                <div className="pt-4 border-t border-black/5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                    Package Highlights
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {pkg.includedHighlights.map((h, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-gray-700">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Hotel Tier Customization */}
              <div className="bg-white rounded-3xl p-8 border border-black/5 shadow-xs space-y-6">
                <div>
                  <h3 className="font-serif text-2xl font-bold text-[#2A2A2A]">
                    1. Choose Hotel & Stay Tier
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Select your preferred accommodation style. All tiers include complimentary breakfast and certified hygiene standards.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {pkg.hotelTiers.map((tier) => {
                    const isSelected = selectedTier === tier.tier;
                    return (
                      <button
                        key={tier.tier}
                        type="button"
                        onClick={() => setSelectedTier(tier.tier)}
                        className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#C84B31] bg-[#FDFBF7] shadow-md ring-2 ring-[#C84B31]/20'
                            : 'border-black/10 bg-white hover:border-black/20'
                        }`}
                      >
                        <div className="space-y-3">
                          <img 
                            src={tier.image} 
                            alt={tier.name} 
                            className="w-full h-28 object-cover rounded-xl"
                          />
                          <div>
                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                              isSelected ? 'bg-[#C84B31] text-white' : 'bg-black/5 text-gray-600'
                            }`}>
                              {tier.tier} Tier
                            </span>
                            <h4 className="font-serif font-bold text-sm text-[#2A2A2A] mt-1.5">
                              {tier.name}
                            </h4>
                            <p className="text-[11px] text-gray-500 mt-1 line-clamp-2">
                              {tier.description}
                            </p>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-black/5 mt-3 flex items-center justify-between">
                          <span className="text-xs font-bold text-[#C84B31]">
                            ₹{tier.pricePerNight.toLocaleString()}/nt
                          </span>
                          {isSelected && <Check className="w-4 h-4 text-[#C84B31]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Visual Seat Selection Grid */}
              <div className="bg-white rounded-3xl p-8 border border-black/5 shadow-xs space-y-6">
                <div>
                  <h3 className="font-serif text-2xl font-bold text-[#2A2A2A]">
                    2. Select Seats for Flights / Trains / Buses
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Pick your preferred seats in real-time. Priority lower berths and front seats are automatically prioritized for seniors.
                  </p>
                </div>

                <SeatSelectorGrid 
                  mode={pkg.includedModes[0] === 'flight' ? 'flight' : 'train'}
                  selectedSeats={selectedSeats}
                  onSeatToggle={handleSeatToggle}
                  maxSeats={travelersCount}
                />
              </div>

              {/* Special Care & Accessibility Options */}
              <div className="bg-white rounded-3xl p-8 border border-black/5 shadow-xs space-y-4">
                <div>
                  <h3 className="font-serif text-2xl font-bold text-[#2A2A2A]">
                    3. Special Assistance & Care Preferences
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Complimentary assistance for senior citizens, solo women travelers, and guests with mobility needs.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {pkg.specialCareOptions.map((opt) => {
                    const isChecked = selectedCareIds.includes(opt.id);
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleCareToggle(opt.id)}
                        className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                          isChecked
                            ? 'border-emerald-500 bg-emerald-50/50 shadow-xs'
                            : 'border-black/10 bg-white hover:border-black/20'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <Shield className={`w-4 h-4 ${isChecked ? 'text-emerald-600' : 'text-gray-400'}`} />
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                            Free
                          </span>
                        </div>
                        <h5 className="font-bold text-xs text-[#2A2A2A] mt-2">{opt.title}</h5>
                        <p className="text-[11px] text-gray-500 mt-1">{opt.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Right Sticky Booking Summary Card (4 cols) */}
            <aside className="lg:col-span-4 sticky top-28 space-y-6">
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-black/5 shadow-md space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-black/5">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#C84B31]">
                      Package Summary
                    </span>
                    <h3 className="font-serif text-xl font-bold text-[#2A2A2A] mt-0.5">
                      {pkg.destination} Getaway
                    </h3>
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full">
                    {pkg.discountPercent}% Off
                  </span>
                </div>

                {/* Form Inputs */}
                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Departure Date
                    </label>
                    <input 
                      type="date"
                      value={travelDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={e => setTravelDate(e.target.value)}
                      className="w-full bg-[#FDFBF7] border border-black/10 rounded-xl px-3.5 py-2.5 text-sm font-medium outline-none focus:border-[#C84B31]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Number of Travelers
                    </label>
                    <div className="flex items-center gap-3">
                      {[1, 2, 3, 4].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setTravelersCount(num)}
                          className={`flex-1 py-2 rounded-xl font-bold transition-all cursor-pointer ${
                            travelersCount === num
                              ? 'bg-[#C84B31] text-white shadow-sm'
                              : 'bg-[#FDFBF7] text-gray-700 border border-black/10 hover:border-black/20'
                          }`}
                        >
                          {num} {num === 1 ? 'Guest' : 'Guests'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="bg-[#FDFBF7] p-4 rounded-2xl border border-black/5 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Base Fare ({travelersCount}x):</span>
                    <span className="font-semibold">₹{(basePricePerPerson * travelersCount).toLocaleString()}</span>
                  </div>
                  {hotelUpgrade > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">{selectedTier} Hotel Upgrade:</span>
                      <span className="font-semibold">+₹{(hotelUpgrade * travelersCount).toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-500">Selected Seats:</span>
                    <span className="font-semibold text-[#C84B31]">{selectedSeats.join(', ') || 'Auto-allocated'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">5% GST & Taxes:</span>
                    <span className="font-semibold text-emerald-700">Included</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-black/5 text-sm font-bold">
                    <span>Total Amount:</span>
                    <span className="text-lg text-[#C84B31]">₹{totalPrice.toLocaleString()}</span>
                  </div>
                </div>

                {/* Checkout CTA */}
                <button
                  type="button"
                  onClick={handleInitiatePayment}
                  className="w-full bg-[#C84B31] hover:bg-[#A63A25] text-white font-bold py-3.5 rounded-full shadow-lg shadow-[#C84B31]/20 transition-all transform hover:scale-[1.02] active:scale-[0.98] text-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Proceed to Demo Payment</span>
                </button>

                <p className="text-[11px] text-center text-gray-400">
                  ⚡ 100% Free Cancellation up to 24 hours prior to departure.
                </p>
              </div>
            </aside>

          </div>
        </div>
      )}

      {/* Demo Payment Modal */}
      <DemoPaymentModal 
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        onSuccess={handlePaymentSuccess}
        amount={totalPrice}
        title={pkg.title}
        itemType="package"
      />
    </div>
  );
};

export default BumperPackageDetails;
