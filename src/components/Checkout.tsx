import React, { useState, useEffect } from 'react';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { createRazorpayOrder, verifyRazorpayPayment } from '../api/payment';

interface CheckoutProps {
  bookingId: string;
  bookingType: 'hotel' | 'tour' | 'flight' | 'bus' | 'auto';
  onSuccess?: () => void;
  onCancel?: () => void;
}

// Ensure the Razorpay script is loaded dynamically
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const Checkout: React.FC<CheckoutProps> = ({ bookingId, bookingType, onSuccess, onCancel }) => {

  const [status, setStatus] = useState<'initializing' | 'ready' | 'processing' | 'success' | 'failed'>('initializing');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const initializeCheckout = async () => {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        if (isMounted) {
          setStatus('failed');
          setErrorMessage('Failed to load Razorpay SDK. Are you online?');
        }
        return;
      }
      if (isMounted) setStatus('ready');
    };
    
    initializeCheckout();
    
    return () => { isMounted = false; };
  }, []);

  const handlePayment = async () => {
    try {
      setStatus('processing');
      setErrorMessage(null);

      // 1. Create Order on Backend
      const order = await createRazorpayOrder({ booking_id: bookingId, booking_type: bookingType });

      // 2. Open Razorpay Checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_placeholder',
        amount: order.amount,
        currency: order.currency,
        name: 'Vstara',
        description: 'Secure Payment',
        order_id: order.orderId,
        handler: async (response: any) => {
          try {
            // 3. Verify Signature on Backend
            const verification = await verifyRazorpayPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              booking_id: bookingId,
              booking_type: bookingType
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
            setErrorMessage('An error occurred during payment verification.');
          }
        },
        modal: {
          ondismiss: () => {
            setStatus('ready');
            if (onCancel) onCancel();
          }
        },
        theme: {
          color: '#C84B31'
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (response: any) => {
        console.error('Payment failed:', response.error);
        setStatus('failed');
        setErrorMessage(response.error.description || 'Payment failed');
      });
      rzp.open();
    } catch (error: any) {
      console.error('Checkout error:', error);
      setStatus('failed');
      setErrorMessage(error.response?.data?.error?.message || 'Failed to initialize payment.');
    }
  };

  if (status === 'initializing') {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="w-6 h-6 animate-spin text-[#C84B31]" />
        <span className="ml-2 text-sm text-[#2A2A2A]/70">Loading checkout securely...</span>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center">
        <CheckCircle className="w-12 h-12 text-green-500 mb-3" />
        <h3 className="text-xl font-medium text-[#2A2A2A]">Payment Successful!</h3>
        <p className="text-sm text-[#2A2A2A]/70 mt-1">Your booking has been confirmed securely.</p>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center">
        <XCircle className="w-12 h-12 text-red-500 mb-3" />
        <h3 className="text-xl font-medium text-[#2A2A2A]">Payment Failed</h3>
        <p className="text-sm text-[#2A2A2A]/70 mt-1 mb-4">{errorMessage}</p>
        <button 
          onClick={() => setStatus('ready')}
          className="bg-[#2A2A2A] text-white px-6 py-2 rounded-xl text-sm font-medium hover:bg-black transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <button
        onClick={handlePayment}
        disabled={status === 'processing'}
        className="w-full bg-[#C84B31] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#A63A25] transition-colors disabled:opacity-70 flex items-center justify-center"
      >
        {status === 'processing' ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Processing...
          </>
        ) : (
          'Pay Securely with Razorpay'
        )}
      </button>
    </div>
  );
};

// Add Razorpay type to Window
declare global {
  interface Window {
    Razorpay: any;
  }
}
