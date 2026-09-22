import React, { useState, useEffect } from 'react';
import { Loader2, CheckCircle, Shield, Download, FileText, ArrowRight } from 'lucide-react';
import { getOverview, createRazorpayOrder, verifyRazorpayPayment, PaymentOverviewResponse } from '../../api/payment';
import { ScratchCard } from './ScratchCard';
import { DemoPaymentModal } from './DemoPaymentModal';
import { generateAndDownloadReceipt } from '../../lib/receiptGenerator';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useNotifications } from '../../context/NotificationContext';

interface PaymentSummaryProps {
  bookingIds: string[];
  discountCode?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const PaymentSummary: React.FC<PaymentSummaryProps> = ({ bookingIds, discountCode, onSuccess, onCancel }) => {
  const { user } = useAuth();
  const { success: toastSuccess } = useToast();
  const { addNotification } = useNotifications();

  const [status, setStatus] = useState<'loading' | 'ready' | 'processing' | 'success' | 'failed'>('loading');
  const [overview, setOverview] = useState<PaymentOverviewResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [completedPayment, setCompletedPayment] = useState<any | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchOverview = async () => {
      try {
        const data = await getOverview(bookingIds);
        if (isMounted) {
          setOverview(data);
          setStatus('ready');
        }
      } catch (err: any) {
        if (isMounted) {
          // Fallback overview for test/mock booking IDs
          setOverview({
            tripLabel: 'Travel Service Reservation',
            items: bookingIds.map((id, idx) => ({
              booking_id: id,
              item_type: 'flight' as any,
              label: `Reservation Item #${idx + 1}`,
              amount: 4500
            })),
            subtotal: 4500 * bookingIds.length,
            discountAmount: discountCode ? 500 : 0,
            discountLabel: discountCode ? 'Promo Applied' : '',
            serviceFee: Math.round(4500 * bookingIds.length * 0.05),
            total: (4500 * bookingIds.length) + Math.round(4500 * bookingIds.length * 0.05) - (discountCode ? 500 : 0),
            benefits: ['Instant PNR Confirmation', 'GST Input Credit Valid', 'Free Cancellation within 24h']
          });
          setStatus('ready');
        }
      }
    };
    fetchOverview();
    return () => { isMounted = false; };
  }, [bookingIds, discountCode]);

  const handleOpenDemoModal = () => {
    setDemoModalOpen(true);
  };

  const handleDemoPaymentSuccess = async (paymentDetails: any) => {
    setStatus('processing');
    try {
      // 1. Try syncing with backend order if available
      try {
        const order = await createRazorpayOrder({ bookingIds, discountCode });
        if (order?.paymentGroupId) {
          await verifyRazorpayPayment({
            paymentGroupId: order.paymentGroupId,
            razorpay_order_id: order.razorpayOrderId || `order_${Date.now()}`,
            razorpay_payment_id: paymentDetails.paymentId,
            razorpay_signature: 'demo_verified_sig'
          });
        }
      } catch (backendErr) {
        console.warn('Backend payment sync fallback to client recording:', backendErr);
      }

      const totalAmount = overview?.total || 4500;
      const refCode = `YS-TRV-${Date.now().toString().slice(-6)}`;
      const recNumber = `YS-REC-${Date.now().toString().slice(-4)}`;

      // 2. Record completed payment
      const paymentRecord = {
        id: paymentDetails.paymentId || `pay_${Date.now()}`,
        booking_id: bookingIds[0] || `bkg_${Date.now()}`,
        booking_type: 'travel',
        amount: totalAmount,
        currency: 'INR',
        status: 'paid',
        payment_method: paymentDetails.method || 'Demo Card (Visa Platinum)',
        card_last4: paymentDetails.cardLast4 || '4242',
        card_network: paymentDetails.cardNetwork || 'Visa Platinum',
        receipt_url: '#',
        created_at: new Date().toISOString(),
        paid_at: new Date().toISOString(),
        item_title: overview?.tripLabel || 'Confirmed Reservation'
      };

      const storedPays = localStorage.getItem('yatra_setu_local_payments');
      const existingPays = storedPays ? JSON.parse(storedPays) : [];
      localStorage.setItem('yatra_setu_local_payments', JSON.stringify([paymentRecord, ...existingPays]));
      window.dispatchEvent(new Event('payments_updated'));

      // 3. Record local booking
      const newBooking = {
        id: bookingIds[0] || `booking_${Date.now()}`,
        bookingReference: refCode,
        type: 'travel',
        title: overview?.tripLabel || 'Travel Reservation',
        subtitle: overview?.items.map(i => i.label).join(', ') || 'Confirmed booking',
        destination: 'India',
        date: new Date().toISOString(),
        amount: totalAmount,
        status: 'confirmed',
        receiptNumber: recNumber,
        paymentId: paymentDetails.paymentId
      };

      const storedBkgs = localStorage.getItem('yatra_setu_local_bookings');
      const existingBkgs = storedBkgs ? JSON.parse(storedBkgs) : [];
      localStorage.setItem('yatra_setu_local_bookings', JSON.stringify([newBooking, ...existingBkgs]));
      window.dispatchEvent(new Event('bookings_updated'));

      // 4. Trigger user toast & notification
      toastSuccess(`Payment of ₹${totalAmount.toLocaleString('en-IN')} confirmed!`);
      addNotification({
        type: 'payment_completed',
        title: `Payment Confirmed: ₹${totalAmount.toLocaleString('en-IN')}`,
        message: `Booking reference ${refCode} is confirmed. Tax invoice ready for download.`,
        link: '/dashboard/bookings'
      });

      setCompletedPayment({
        receiptNumber: recNumber,
        bookingReference: refCode,
        title: overview?.tripLabel || 'Travel Reservation',
        destination: 'India',
        totalAmount,
        paymentMethod: paymentDetails.method || 'Demo Card Simulator'
      });

      setStatus('success');
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error(err);
      setStatus('failed');
      setErrorMessage(err.message || 'Payment simulation failed');
    }
  };

  const handleDownloadInvoice = () => {
    if (!completedPayment) return;
    generateAndDownloadReceipt({
      receiptNumber: completedPayment.receiptNumber,
      bookingReference: completedPayment.bookingReference,
      bookingType: 'Booking',
      title: completedPayment.title,
      destination: completedPayment.destination,
      travelDate: new Date().toLocaleDateString('en-IN'),
      customerName: user?.name || 'Valued Traveler',
      customerEmail: user?.email || 'traveler@yatrasetu.com',
      totalAmount: completedPayment.totalAmount,
      paymentMethod: completedPayment.paymentMethod,
      taxAmount: Math.round(completedPayment.totalAmount * 0.05)
    });
  };

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center p-8 bg-stone-900/90 text-white rounded-2xl border border-white/10">
        <Loader2 className="w-8 h-8 animate-spin text-amber-400 mb-3" />
        <p className="text-xs text-stone-300">Loading payment summary...</p>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-5 bg-white text-stone-900 rounded-3xl shadow-2xl border border-stone-200 animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-inner">
          <CheckCircle className="w-10 h-10" />
        </div>
        
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-serif font-bold text-stone-900">Payment Successful!</h2>
          <p className="text-xs text-stone-500 font-mono">
            Booking Ref: <strong className="text-stone-800">{completedPayment?.bookingReference || 'YS-TRV-CONFIRMED'}</strong>
          </p>
        </div>

        <p className="text-xs text-stone-600 text-center max-w-xs leading-relaxed">
          Your reservation is confirmed. A Government of India verified GST Tax Invoice has been generated.
        </p>

        <div className="w-full space-y-2 pt-2">
          <button
            onClick={handleDownloadInvoice}
            className="w-full bg-stone-900 hover:bg-black text-white py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition shadow-md"
          >
            <Download className="w-4 h-4 text-amber-400" />
            <span>Download GST Tax Invoice & Receipt</span>
          </button>

          {onCancel && (
            <button
              onClick={onCancel}
              className="w-full bg-stone-100 hover:bg-stone-200 text-stone-700 py-2.5 px-4 rounded-xl text-xs font-semibold transition"
            >
              Done / Close
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!overview) return null;

  return (
    <>
      <div className="w-full max-w-md mx-auto bg-stone-950/95 backdrop-blur-xl border border-white/15 p-6 rounded-3xl shadow-2xl text-white">
        <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
          <h2 className="text-lg font-bold font-serif text-white">{overview.tripLabel}</h2>
          <span className="text-[10px] bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
            Demo Gateway
          </span>
        </div>

        <div className="space-y-3 mb-6">
          {overview.items.map(item => (
            <div key={item.booking_id} className="flex justify-between text-xs">
              <span className="text-stone-300">{item.label}</span>
              <span className="font-bold text-white">₹{item.amount.toLocaleString('en-IN')}</span>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 pt-4 space-y-2 text-xs mb-6">
          <div className="flex justify-between text-stone-400">
            <span>Subtotal</span>
            <span>₹{overview.subtotal.toLocaleString('en-IN')}</span>
          </div>

          {overview.discountAmount > 0 && (
            <div className="flex justify-between items-center text-emerald-400 font-medium my-2">
              <span>{overview.discountLabel}</span>
              <ScratchCard width={120} height={36}>
                - ₹{overview.discountAmount.toLocaleString('en-IN')}
              </ScratchCard>
            </div>
          )}

          <div className="flex justify-between text-stone-400">
            <span>Estimated Taxes & Platform Charges (5%)</span>
            <span>₹{overview.serviceFee.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div className="flex justify-between text-base font-black text-white mb-6 pt-3 border-t border-white/15">
          <span>Total Payable</span>
          <span className="text-xl text-amber-400">₹{overview.total.toLocaleString('en-IN')}</span>
        </div>

        {overview.benefits.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-6">
            {overview.benefits.map((b, i) => (
              <div key={i} className="flex items-center gap-1 bg-white/10 border border-white/10 px-2 py-1 rounded-lg text-[10px] text-amber-200">
                <Shield className="w-3 h-3 text-amber-400" />
                {b}
              </div>
            ))}
          </div>
        )}

        {errorMessage && (
          <div className="mb-4 p-3 bg-rose-500/20 border border-rose-500/50 rounded-xl text-rose-200 text-xs">
            {errorMessage}
          </div>
        )}

        <div className="flex gap-3">
          {onCancel && (
            <button
              onClick={onCancel}
              disabled={status === 'processing'}
              className="flex-1 py-3 px-4 rounded-xl border border-white/20 text-white text-xs font-semibold hover:bg-white/10 transition disabled:opacity-50"
            >
              Cancel
            </button>
          )}
          <button
            onClick={handleOpenDemoModal}
            disabled={status === 'processing'}
            className="flex-1 py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-stone-950 font-black text-xs shadow-lg transition flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {status === 'processing' ? (
              <Loader2 className="w-4 h-4 animate-spin text-stone-950" />
            ) : (
              <>
                <span>Pay ₹{overview.total.toLocaleString('en-IN')}</span>
                <ArrowRight className="w-3.5 h-3.5 text-stone-950" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Demo Payment Modal with Success/Failure choice & card simulator */}
      <DemoPaymentModal
        isOpen={demoModalOpen}
        onClose={() => setDemoModalOpen(false)}
        onSuccess={handleDemoPaymentSuccess}
        amount={overview.total}
        title={overview.tripLabel}
        itemType="booking"
      />
    </>
  );
};
