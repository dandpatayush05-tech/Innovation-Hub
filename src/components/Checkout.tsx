import React from 'react';
import { PaymentSummary } from './payments/PaymentSummary';

interface CheckoutProps {
  bookingId?: string;
  bookingType?: 'hotel' | 'tour' | 'flight' | 'bus_leg' | 'auto';
  bookingIds?: string[];
  discountCode?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const Checkout: React.FC<CheckoutProps> = ({
  bookingId,
  bookingType: _bookingType,
  bookingIds,
  discountCode,
  onSuccess,
  onCancel
}) => {
  // Use the new payment summary flow
  const ids = bookingIds || (bookingId ? [bookingId] : []);

  if (ids.length === 0) {
    return <div className="text-red-500 p-4">No bookings provided for checkout.</div>;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative z-10 w-full max-w-md">
        <PaymentSummary
          bookingIds={ids}
          discountCode={discountCode}
          onSuccess={onSuccess}
          onCancel={onCancel}
        />
      </div>
    </div>
  );
};
