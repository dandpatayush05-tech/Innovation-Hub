import React, { useState, useEffect } from 'react';
import { Loader2, CheckCircle, Shield } from 'lucide-react';
import { getOverview, createRazorpayOrder, verifyRazorpayPayment, PaymentOverviewResponse } from '../../api/payment';
import { ScratchCard } from './ScratchCard';

interface PaymentSummaryProps {
  bookingIds: string[];
  discountCode?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const PaymentSummary: React.FC<PaymentSummaryProps> = ({ bookingIds, discountCode, onSuccess, onCancel }) => {
  const [status, setStatus] = useState<'loading' | 'ready' | 'processing' | 'success' | 'failed'>('loading');
  const [overview, setOverview] = useState<PaymentOverviewResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
          setStatus('failed');
          setErrorMessage(err.response?.data?.message || 'Failed to load payment overview');
        }
      }
    };
    fetchOverview();
    return () => { isMounted = false; };
  }, [bookingIds]);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) return resolve(true);
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePay = async () => {
    try {
      setStatus('processing');
      setErrorMessage(null);

      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) throw new Error('Razorpay SDK failed to load');

      const order = await createRazorpayOrder({ bookingIds, discountCode });

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_placeholder',
        amount: order.amount,
        currency: order.currency,
        name: 'Yatra Setu',
        description: 'Secure Payment',
        order_id: order.razorpayOrderId,
        handler: async (response: any) => {
          try {
            const verification = await verifyRazorpayPayment({
              paymentGroupId: order.paymentGroupId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verification.success) {
              setStatus('success');
              if (onSuccess) onSuccess();
            } else {
              setStatus('failed');
              setErrorMessage('Payment verification failed.');
            }
          } catch (err: any) {
            console.error('Verification error:', err);
            setStatus('failed');
            setErrorMessage('Payment verification failed. Please contact support.');
          }
        },
        theme: { color: '#000000' }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        setStatus('failed');
        setErrorMessage(response.error.description);
      });
      rzp.open();
    } catch (err: any) {
      console.error(err);
      setStatus('failed');
      setErrorMessage(err.message || 'Payment initialization failed');
    }
  };

  if (status === 'loading') {
    return <div className="flex flex-col items-center p-8"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }
  if (status === 'success') {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <CheckCircle className="w-16 h-16 text-green-500" />
        <h2 className="text-xl font-bold">Payment Successful!</h2>
      </div>
    );
  }

  if (!overview) return null;

  return (
    <div className="w-full max-w-md mx-auto bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-xl">
      <h2 className="text-xl font-bold mb-4">{overview.tripLabel}</h2>
      
      <div className="space-y-3 mb-6">
        {overview.items.map(item => (
          <div key={item.booking_id} className="flex justify-between text-sm">
            <span className="text-gray-300">{item.label}</span>
            <span className="font-medium text-white">₹{item.amount.toLocaleString('en-IN')}</span>
          </div>
        ))}
      </div>

      <div className="border-t border-white/10 pt-4 space-y-2 text-sm mb-6">
        <div className="flex justify-between text-gray-400">
          <span>Subtotal</span>
          <span>₹{overview.subtotal.toLocaleString('en-IN')}</span>
        </div>
        
        {overview.discountAmount > 0 && (
          <div className="flex justify-between items-center text-green-400 font-medium my-4">
            <span>{overview.discountLabel}</span>
            <ScratchCard width={120} height={40}>
              - ₹{overview.discountAmount.toLocaleString('en-IN')}
            </ScratchCard>
          </div>
        )}

        <div className="flex justify-between text-gray-400">
          <span>Service Fee</span>
          <span>₹{overview.serviceFee.toLocaleString('en-IN')}</span>
        </div>
      </div>

      <div className="flex justify-between text-lg font-bold text-white mb-6">
        <span>Total</span>
        <span>₹{overview.total.toLocaleString('en-IN')}</span>
      </div>

      {overview.benefits.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {overview.benefits.map((b, i) => (
            <div key={i} className="flex items-center gap-1 bg-white/5 border border-white/10 px-2 py-1 rounded text-xs text-blue-300">
              <Shield className="w-3 h-3" />
              {b}
            </div>
          ))}
        </div>
      )}

      {errorMessage && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
          {errorMessage}
        </div>
      )}

      <div className="flex gap-4">
        {onCancel && (
          <button 
            onClick={onCancel}
            disabled={status === 'processing'}
            className="flex-1 py-3 px-4 rounded-xl border border-white/20 text-white font-medium hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        )}
        <button 
          onClick={handlePay}
          disabled={status === 'processing'}
          className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold hover:shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {status === 'processing' ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Pay ₹' + overview.total.toLocaleString('en-IN')}
        </button>
      </div>
    </div>
  );
};
