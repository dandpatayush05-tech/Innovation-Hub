import React, { useState } from 'react';
import { useTripCart, TripCartItem } from '../../context/TripCartContext';
import {
  Plane, Building2, Bus, Car, Compass,
  Trash2, ArrowRight, ShieldCheck,
  Sparkles, CheckCircle, Download, FileText
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { DemoPaymentModal } from '../payments/DemoPaymentModal';
import { generateAndDownloadReceipt } from '../../lib/receiptGenerator';

interface TripSummaryProps {
  onCheckoutComplete?: () => void;
  onClose?: () => void;
}

export const TripSummary: React.FC<TripSummaryProps> = ({ onCheckoutComplete, onClose }) => {
  const { items, removeItem, clearCart, totalAmount, tripId } = useTripCart();
  const { success } = useToast();
  const { addNotification } = useNotifications();
  const { user } = useAuth();
  
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [confirmedBookingData, setConfirmedBookingData] = useState<any | null>(null);

  // Group items by service type
  const groupedItems = items.reduce<Record<string, TripCartItem[]>>((acc, item) => {
    const key = item.type;
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  const getServiceIcon = (type: string) => {
    switch (type) {
      case 'flight': return <Plane className="w-5 h-5 text-[#C84B31]" />;
      case 'hotel': return <Building2 className="w-5 h-5 text-blue-600" />;
      case 'bus': return <Bus className="w-5 h-5 text-emerald-600" />;
      case 'cab': return <Car className="w-5 h-5 text-amber-600" />;
      case 'experience': return <Compass className="w-5 h-5 text-purple-600" />;
      default: return <Sparkles className="w-5 h-5 text-orange-500" />;
    }
  };

  const getServiceLabel = (type: string) => {
    switch (type) {
      case 'flight': return 'Flights';
      case 'hotel': return 'Stays & Hotels';
      case 'bus': return 'Bus Journeys';
      case 'cab': return 'Cab & Local Transport';
      case 'experience': return 'Experiences & Tours';
      default: return 'Curated Activities';
    }
  };

  const taxesAndFees = Math.round(totalAmount * 0.05); // 5% GST & service fees
  const grandTotal = totalAmount + taxesAndFees;

  const handleCheckoutClick = () => {
    if (items.length === 0) return;
    setDemoModalOpen(true);
  };

  const handlePaymentSuccess = (paymentDetails: any) => {
    const refCode = `YS-TRIP-${Date.now().toString().slice(-6)}`;
    const recNumber = `YS-REC-${Date.now().toString().slice(-4)}`;

    // 1. Record individual bookings for each item in cart
    const newBookings = items.map((item, idx) => ({
      id: item.rawBookingId || `bkg_${Date.now()}_${idx}`,
      bookingReference: refCode,
      type: item.type,
      title: item.title,
      subtitle: item.subtitle || (item.date ? `Travel Date: ${item.date}` : 'All-in-One Trip Item'),
      destination: 'India',
      date: item.date || new Date().toISOString(),
      amount: item.price,
      status: 'confirmed',
      receiptNumber: recNumber,
      paymentId: paymentDetails.paymentId
    }));

    const storedBkgs = localStorage.getItem('yatra_setu_local_bookings');
    const existingBkgs = storedBkgs ? JSON.parse(storedBkgs) : [];
    localStorage.setItem('yatra_setu_local_bookings', JSON.stringify([...newBookings, ...existingBkgs]));
    window.dispatchEvent(new Event('bookings_updated'));

    // 2. Record payment in local payments
    const paymentRecord = {
      id: paymentDetails.paymentId || `pay_${Date.now()}`,
      booking_id: `trip_${tripId}`,
      booking_type: 'trip_package',
      amount: grandTotal,
      currency: 'INR',
      status: 'paid',
      payment_method: paymentDetails.method || 'Visa Platinum (Demo Card)',
      card_last4: paymentDetails.cardLast4 || '4242',
      card_network: paymentDetails.cardNetwork || 'Visa Platinum',
      receipt_url: '#',
      created_at: new Date().toISOString(),
      paid_at: new Date().toISOString(),
      item_title: `All-in-One Trip Package (${items.length} items)`
    };

    const storedPays = localStorage.getItem('yatra_setu_local_payments');
    const existingPays = storedPays ? JSON.parse(storedPays) : [];
    localStorage.setItem('yatra_setu_local_payments', JSON.stringify([paymentRecord, ...existingPays]));
    window.dispatchEvent(new Event('payments_updated'));

    // 3. User notification
    addNotification({
      type: 'payment_completed',
      title: `All-in-One Trip Booked: ₹${grandTotal.toLocaleString('en-IN')}`,
      message: `Complete trip with ${items.length} items confirmed under Booking Ref: ${refCode}.`,
      link: `/dashboard/bookings`
    });

    success('Your All-in-One Trip has been booked successfully!');

    setConfirmedBookingData({
      receiptNumber: recNumber,
      bookingReference: refCode,
      title: `All-in-One Trip Package (${items.length} services)`,
      destination: 'India',
      totalAmount: grandTotal,
      paymentMethod: paymentDetails.method || 'Demo Card Simulator'
    });

    clearCart();
    setPaymentSuccess(true);

    if (onCheckoutComplete) {
      onCheckoutComplete();
    }
  };

  const handleDownloadInvoice = () => {
    if (!confirmedBookingData) return;
    generateAndDownloadReceipt({
      receiptNumber: confirmedBookingData.receiptNumber,
      bookingReference: confirmedBookingData.bookingReference,
      bookingType: 'Trip Package',
      title: confirmedBookingData.title,
      destination: confirmedBookingData.destination,
      travelDate: new Date().toLocaleDateString('en-IN'),
      customerName: user?.name || 'Valued Traveler',
      customerEmail: user?.email || 'traveler@yatrasetu.com',
      totalAmount: confirmedBookingData.totalAmount,
      paymentMethod: confirmedBookingData.paymentMethod,
      taxAmount: Math.round(confirmedBookingData.totalAmount * 0.05)
    });
  };

  if (paymentSuccess) {
    return (
      <div className="bg-white rounded-3xl p-8 text-center space-y-5 max-w-lg mx-auto border border-stone-200 shadow-2xl animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle className="w-10 h-10" />
        </div>
        <div className="space-y-1">
          <h3 className="text-2xl font-serif font-bold text-stone-900">Trip Confirmed!</h3>
          <p className="text-xs font-mono text-stone-500">
            Booking Reference: <strong className="text-stone-800">{confirmedBookingData?.bookingReference || tripId}</strong>
          </p>
        </div>
        <p className="text-xs text-stone-600 leading-relaxed max-w-xs mx-auto">
          All your travel services have been scheduled and synchronized. An official GST Tax Invoice is available below.
        </p>

        <div className="space-y-2 pt-2">
          <button
            onClick={handleDownloadInvoice}
            className="w-full bg-stone-900 hover:bg-black text-white py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition shadow-md"
          >
            <Download className="w-4 h-4 text-amber-400" />
            <span>Download All-in-One Tax Invoice</span>
          </button>

          <button
            onClick={() => {
              setPaymentSuccess(false);
              if (onClose) onClose();
            }}
            className="w-full bg-stone-100 hover:bg-stone-200 text-stone-800 py-2.5 px-4 rounded-xl text-xs font-semibold transition"
          >
            View My Bookings
          </button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-8 sm:p-12 text-center space-y-4 max-w-lg mx-auto border border-stone-200 shadow-md">
        <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
          <Sparkles className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-stone-900">Your Trip Cart is Empty</h3>
        <p className="text-xs text-stone-600 leading-relaxed">
          Explore destinations, search flights, select luxury stays, or generate an AI itinerary to build your complete journey in one checkout.
        </p>
        {onClose && (
          <button
            onClick={onClose}
            className="bg-stone-900 text-white px-6 py-2.5 rounded-full text-xs font-bold hover:bg-black transition"
          >
            Start Exploring
          </button>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-2xl space-y-6 max-w-4xl mx-auto text-stone-900">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
                Trip Package
              </span>
              <span className="text-xs text-stone-400 font-mono">ID: {tripId}</span>
            </div>
            <h2 className="text-2xl font-serif font-bold text-stone-900 mt-1">
              All-in-One Trip Summary ({items.length} Item{items.length > 1 ? 's' : ''})
            </h2>
          </div>

          <button
            onClick={clearCart}
            className="text-xs text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear All</span>
          </button>
        </div>

        {/* Grouped Line Items */}
        <div className="space-y-6 max-h-[50vh] overflow-y-auto pr-2">
          {Object.entries(groupedItems).map(([type, groupItems]) => (
            <div key={type} className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-500">
                {getServiceIcon(type)}
                <span>{getServiceLabel(type)}</span>
              </div>

              <div className="space-y-2.5">
                {groupItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-stone-50 border border-stone-200/80 rounded-2xl p-4 flex items-center justify-between gap-4 hover:border-stone-300 transition-colors"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-white border border-stone-200 flex items-center justify-center shrink-0 shadow-sm">
                        {getServiceIcon(item.type)}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-stone-900 truncate">
                          {item.title}
                        </h4>
                        <p className="text-xs text-stone-500 truncate">
                          {item.dayNumber ? `Day ${item.dayNumber} • ` : ''}
                          {item.date ? `${item.date} • ` : ''}
                          {item.subtitle || 'Included in trip'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <span className="text-sm font-bold text-stone-900">
                        ₹{item.price.toLocaleString('en-IN')}
                      </span>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-stone-100 transition"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Pricing Breakdown & Checkout */}
        <div className="border-t border-stone-100 pt-5 space-y-3">
          <div className="flex justify-between text-xs text-stone-600">
            <span>Subtotal</span>
            <span className="font-semibold text-stone-900">₹{totalAmount.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between text-xs text-stone-600">
            <span>Estimated Taxes & Platform Charges (5% GST)</span>
            <span className="font-semibold text-stone-900">₹{taxesAndFees.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between text-base font-bold text-stone-900 border-t border-stone-100 pt-3">
            <span>Grand Total</span>
            <span className="text-xl font-black text-stone-900">₹{grandTotal.toLocaleString('en-IN')}</span>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-stone-500 flex-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Verified 256-Bit Encrypted Demo Checkout</span>
            </div>

            <button
              onClick={handleCheckoutClick}
              className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-stone-950 px-8 py-3.5 rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20"
            >
              <span>Continue to Payment</span>
              <ArrowRight className="w-4 h-4 text-stone-950" />
            </button>
          </div>
        </div>

      </div>

      {/* Demo Payment Modal */}
      <DemoPaymentModal
        isOpen={demoModalOpen}
        onClose={() => setDemoModalOpen(false)}
        onSuccess={handlePaymentSuccess}
        amount={grandTotal}
        title={`All-in-One Trip Package (${items.length} items)`}
        itemType="trip"
      />
    </>
  );
};
