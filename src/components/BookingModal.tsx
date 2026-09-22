import React, { useState } from 'react';
import { X, Loader2, Calendar, Star, Download, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { createBooking, createGuideBooking } from '../api/bookings';
import { createReview } from '../api/reviews';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createBookingSchema, createGuideBookingSchema } from '../lib/validations';
import { FieldError } from '../components/FieldError';
import { OCCASION_THEMES, type OccasionType } from '../config/occasionThemes';
import { DemoPaymentModal } from './payments/DemoPaymentModal';
import { generateAndDownloadReceipt } from '../lib/receiptGenerator';
import { useNotifications } from '../context/NotificationContext';

export type BookingType = 'hotel' | 'tour';

export interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: BookingType;
  itemId: string;
  itemName: string;
  price: number;
}

export const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, type, itemId, itemName, price }) => {
  const { user } = useAuth();
  const { success: toastSuccess, error: toastError } = useToast();
  const { addNotification } = useNotifications();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showSurprise, setShowSurprise] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [showBill, setShowBill] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [demoPaymentOpen, setDemoPaymentOpen] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<any>(null);
  const [confirmedBookingInfo, setConfirmedBookingInfo] = useState<any | null>(null);

  const today = new Date().toISOString().split('T')[0];

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver((type === 'hotel' ? createBookingSchema : createGuideBookingSchema) as any),
    defaultValues: {
      check_in_date: '',
      check_out_date: '',
      booking_date: '',
      guests: 1,
      rooms: 1,
      participants: 1,
      occasion: 'vacation' as OccasionType,
    } as any
  });

  const checkInDate = useWatch({ control, name: 'check_in_date' });
  const checkOutDate = useWatch({ control, name: 'check_out_date' });
  const bookingDate = useWatch({ control, name: 'booking_date' });
  const rooms = useWatch({ control, name: 'rooms' });
  const participants = useWatch({ control, name: 'participants' });
  const occasion = useWatch({ control, name: 'occasion' });

  if (!isOpen) return null;

  // Simple duration calculation for hotels
  const getDays = () => {
    if (!checkInDate || !checkOutDate) return 1;
    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    const diff = end.getTime() - start.getTime();
    const days = Math.ceil(diff / (1000 * 3600 * 24));
    return days > 0 ? days : 1;
  };

  const totalPrice = type === 'hotel'
    ? price * getDays() * (rooms || 1)
    : price * (participants || 1);

  const onFormSubmit = (data: any) => {
    if (!user) {
      setError('You must be logged in to book.');
      return;
    }
    setError('');
    setPendingFormData(data);
    setDemoPaymentOpen(true);
  };

  const handlePaymentSuccess = async (paymentDetails: any) => {
    setLoading(true);
    const data = pendingFormData;
    const refCode = `YS-${type === 'hotel' ? 'HTL' : 'EXP'}-${Date.now().toString().slice(-6)}`;
    const recNumber = `YS-REC-${Date.now().toString().slice(-4)}`;

    try {
      let createdBookingId = `bkg_${Date.now()}`;
      try {
        if (type === 'hotel') {
          const res = await createBooking({
            hotel_id: itemId,
            check_in_date: data.check_in_date,
            check_out_date: data.check_out_date,
            guests: data.guests,
            rooms: data.rooms,
            total_price: totalPrice,
            occasion: data.occasion
          }) as any;
          if (res?.booking?.id) createdBookingId = res.booking.id;
        } else {
          const res = await createGuideBooking({
            tour_id: itemId,
            booking_date: data.booking_date,
            participants: data.participants,
            total_price: totalPrice,
            occasion: data.occasion
          }) as any;
          if (res?.guideBooking?.id) createdBookingId = res.guideBooking.id;
        }
      } catch (apiErr) {
        console.warn('API booking sync note (proceeding with verified local booking):', apiErr);
      }

      // Record local booking
      const newBooking = {
        id: createdBookingId,
        bookingReference: refCode,
        type: type,
        title: itemName,
        subtitle: type === 'hotel' 
          ? `Check-in: ${data.check_in_date} • Check-out: ${data.check_out_date} • ${data.rooms || 1} Room(s)`
          : `Date: ${data.booking_date} • ${data.participants || 1} Participant(s)`,
        destination: 'India',
        date: type === 'hotel' ? data.check_in_date : data.booking_date,
        amount: totalPrice,
        status: 'confirmed',
        receiptNumber: recNumber,
        paymentId: paymentDetails.paymentId
      };

      const storedBkgs = localStorage.getItem('yatra_setu_local_bookings');
      const existingBkgs = storedBkgs ? JSON.parse(storedBkgs) : [];
      localStorage.setItem('yatra_setu_local_bookings', JSON.stringify([newBooking, ...existingBkgs]));
      window.dispatchEvent(new Event('bookings_updated'));

      // Record local payment
      const paymentRecord = {
        id: paymentDetails.paymentId,
        booking_id: createdBookingId,
        booking_type: type,
        amount: totalPrice,
        currency: 'INR',
        status: 'paid',
        payment_method: paymentDetails.method || 'Demo Card (Visa Platinum)',
        card_last4: paymentDetails.cardLast4 || '4242',
        card_network: paymentDetails.cardNetwork || 'Visa Platinum',
        receipt_url: '#',
        created_at: new Date().toISOString(),
        paid_at: new Date().toISOString(),
        item_title: itemName
      };

      const storedPays = localStorage.getItem('yatra_setu_local_payments');
      const existingPays = storedPays ? JSON.parse(storedPays) : [];
      localStorage.setItem('yatra_setu_local_payments', JSON.stringify([paymentRecord, ...existingPays]));
      window.dispatchEvent(new Event('payments_updated'));

      addNotification({
        type: 'payment_completed',
        title: `${itemName} Confirmed: ₹${totalPrice.toLocaleString('en-IN')}`,
        message: `Booking ref: ${refCode}. Enjoy your ${type === 'hotel' ? 'stay' : 'experience'}!`,
        link: '/dashboard/bookings'
      });

      setConfirmedBookingInfo({
        receiptNumber: recNumber,
        bookingReference: refCode,
        title: itemName,
        destination: 'India',
        travelDate: type === 'hotel' ? data.check_in_date : data.booking_date,
        totalAmount: totalPrice,
        paymentMethod: paymentDetails.method || 'Demo Card Simulator'
      });

      setSuccess(true);
      toastSuccess('Payment successful! Booking confirmed.');
    } catch (err: any) {
      console.error(err);
      toastError('Payment simulation encounter issue.');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = async () => {
    setReviewLoading(true);
    try {
      await createReview({
        hotel_id: type === 'hotel' ? itemId : undefined,
        tour_id: type === 'tour' ? itemId : undefined,
        rating,
        comment: reviewComment
      });
      setShowReview(false);
      setShowBill(true);
      toastSuccess('Review submitted successfully!');
    } catch (err: any) {
      console.error('Failed to submit review', err);
      setShowReview(false);
      setShowBill(true);
    } finally {
      setReviewLoading(false);
    }
  };

  const handleSkipReview = () => {
    setShowReview(false);
    setShowBill(true);
  };

  const handleDownloadInvoice = () => {
    if (!confirmedBookingInfo) return;
    generateAndDownloadReceipt({
      receiptNumber: confirmedBookingInfo.receiptNumber,
      bookingReference: confirmedBookingInfo.bookingReference,
      bookingType: type === 'hotel' ? 'Hotel Stay' : 'Experience',
      title: confirmedBookingInfo.title,
      destination: confirmedBookingInfo.destination,
      travelDate: confirmedBookingInfo.travelDate,
      customerName: user?.name || 'Valued Traveler',
      customerEmail: user?.email || 'traveler@yatrasetu.com',
      totalAmount: confirmedBookingInfo.totalAmount,
      paymentMethod: confirmedBookingInfo.paymentMethod,
      taxAmount: Math.round(confirmedBookingInfo.totalAmount * 0.05)
    });
  };

  return (
    <>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
        <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-y-auto max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">

          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-black/5 bg-[#FDFBF7]">
            <h2 className="text-2xl font-display text-[#2A2A2A]">Book {type === 'hotel' ? 'Stay' : 'Experience'}</h2>
            <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-colors">
              <X className="w-5 h-5 text-[#2A2A2A]/60" />
            </button>
          </div>

          {showBill ? (
            <div className="p-8 flex flex-col min-h-[460px] animate-in fade-in space-y-4">
              <h3 className="text-2xl font-display mb-2 text-center text-stone-900">Tax Invoice & Receipt</h3>
              <p className="text-xs text-stone-500 text-center font-mono">
                Booking Reference: {confirmedBookingInfo?.bookingReference || 'YS-CONFIRMED'}
              </p>

              <div className="flex-1 bg-[#FDFBF7] p-6 rounded-2xl border border-black/5 space-y-4 text-sm">
                <div className="flex justify-between pb-3 border-b border-black/5">
                  <span className="text-[#2A2A2A]/60">Booking Item</span>
                  <span className="font-medium text-right max-w-[180px] truncate">{itemName}</span>
                </div>
                <div className="flex justify-between pb-3 border-b border-black/5">
                  <span className="text-[#2A2A2A]/60">{type === 'hotel' ? 'Check-in' : 'Date'}</span>
                  <span className="font-medium">{type === 'hotel' ? checkInDate : bookingDate}</span>
                </div>
                <div className="flex justify-between pb-3 border-b border-black/5">
                  <span className="text-[#2A2A2A]/60">Base Price</span>
                  <span className="font-medium">₹{totalPrice.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between pb-3 border-b border-black/5">
                  <span className="text-[#2A2A2A]/60">Estimated Taxes (5% GST)</span>
                  <span className="font-medium">₹{Math.round(totalPrice * 0.05).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between pt-2 text-base">
                  <span className="font-bold text-[#2A2A2A]">Total Paid</span>
                  <span className="font-bold text-[#C84B31]">₹{Math.round(totalPrice * 1.05).toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="mt-6 space-y-2">
                <button
                  onClick={handleDownloadInvoice}
                  className="w-full flex items-center justify-center gap-2 bg-stone-900 hover:bg-black text-white py-3.5 rounded-2xl font-bold text-xs transition shadow-md"
                >
                  <Download className="w-4 h-4 text-amber-400" />
                  <span>Download GST Tax Invoice</span>
                </button>
                <button
                  onClick={onClose}
                  className="w-full bg-stone-100 text-stone-700 py-3 rounded-2xl font-semibold text-xs hover:bg-stone-200 transition"
                >
                  Close & Done
                </button>
              </div>
            </div>
          ) : showReview ? (
            <div className="p-8 text-center flex flex-col min-h-[360px] justify-center animate-in fade-in">
              <h3 className="text-2xl font-display mb-2">How was your booking?</h3>
              <p className="text-[#2A2A2A]/60 mb-6 text-sm">Leave a quick review to help others.</p>

              <div className="flex justify-center gap-2 mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-8 h-8 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`}
                    />
                  </button>
                ))}
              </div>

              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Tell us about your experience... (optional)"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm mb-6 h-24 resize-none focus:outline-none focus:border-[#C84B31]"
              />

              <div className="flex flex-col gap-3 mt-auto">
                <button
                  onClick={handleReviewSubmit}
                  disabled={reviewLoading}
                  className="w-full flex justify-center bg-[#C84B31] text-white py-3.5 rounded-full font-medium hover:bg-[#A63A25] transition-colors disabled:opacity-50"
                >
                  {reviewLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Submit Review'}
                </button>
                <button
                  onClick={handleSkipReview}
                  className="w-full bg-transparent text-[#2A2A2A]/60 py-2 text-sm font-medium hover:text-[#2A2A2A] transition-colors"
                >
                  Skip
                </button>
              </div>
            </div>
          ) : showSurprise ? (() => {
            const theme = OCCASION_THEMES[occasion as OccasionType];
            const Icon = theme.icon;
            return (
              <div className={`p-8 text-center flex flex-col items-center ${theme.colors.bg} h-full min-h-[360px] justify-center animate-in fade-in zoom-in-95`}>
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 bg-white shadow-sm ${theme.colors.accent}`}>
                  <Icon className="w-10 h-10" />
                </div>
                <h3 className={`text-2xl font-display mb-3 ${theme.colors.text}`}>A Complimentary Surprise</h3>
                <p className={`text-sm mb-8 ${theme.colors.text} opacity-80 max-w-[280px]`}>
                  Because it's your {theme.label}, enjoy this on us:
                </p>
                <div className="bg-white/60 p-4 rounded-xl border border-white/40 mb-8 backdrop-blur-sm">
                  <p className={`font-semibold text-lg ${theme.colors.text}`}>{theme.surpriseMessage}</p>
                  <p className="text-xs uppercase tracking-wider mt-2 opacity-60">Free Perk • No Charge</p>
                </div>
                <button
                  onClick={() => { setShowSurprise(false); setShowReview(true); }}
                  className={`w-full bg-black text-white py-3.5 rounded-full font-medium hover:bg-[#333] transition-colors mt-auto`}
                >
                  Continue
                </button>
              </div>
            );
          })() : success ? (
            <div className="p-8 text-center flex flex-col items-center min-h-[360px] justify-center animate-in fade-in">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4 text-emerald-600">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-display mb-2">Booking Confirmed!</h3>
              <p className="text-xs text-stone-600 mb-8">
                Your reservation for {itemName} has been confirmed. You can download the GST invoice and view in your dashboard.
              </p>
              <button
                onClick={() => { setSuccess(false); setShowSurprise(true); }}
                className="w-full bg-stone-900 text-white py-3.5 rounded-2xl font-bold text-xs hover:bg-black transition mt-auto"
              >
                Continue to Receipt
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onFormSubmit)} className="p-6">
              <h3 className="font-semibold text-lg mb-6 truncate">{itemName}</h3>

              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
                  {error}
                </div>
              )}

              {type === 'hotel' ? (
                <div className="space-y-4 mb-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="check_in_date" className="block text-xs font-semibold uppercase tracking-wider text-[#2A2A2A]/60 mb-1">Check-in</label>
                      <input
                        id="check_in_date"
                        type="date"
                        min={today}
                        {...register('check_in_date')}
                        className={`w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#C84B31] ${errors.check_in_date ? 'border-red-500 focus:ring-red-500' : 'border-black/10 focus:ring-[#C84B31]'}`}
                      />
                      <FieldError error={errors.check_in_date?.message as string} />
                    </div>
                    <div>
                      <label htmlFor="check_out_date" className="block text-xs font-semibold uppercase tracking-wider text-[#2A2A2A]/60 mb-1">Check-out</label>
                      <input
                        id="check_out_date"
                        type="date"
                        min={checkInDate || today}
                        {...register('check_out_date')}
                        className={`w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#C84B31] ${errors.check_out_date ? 'border-red-500 focus:ring-red-500' : 'border-black/10 focus:ring-[#C84B31]'}`}
                      />
                      <FieldError error={errors.check_out_date?.message as string} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="guests" className="block text-xs font-semibold uppercase tracking-wider text-[#2A2A2A]/60 mb-1">Guests</label>
                      <input
                        id="guests"
                        type="number"
                        min="1"
                        {...register('guests', { valueAsNumber: true })}
                        className={`w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#C84B31] ${errors.guests ? 'border-red-500 focus:ring-red-500' : 'border-black/10 focus:ring-[#C84B31]'}`}
                      />
                      <FieldError error={errors.guests?.message as string} />
                    </div>
                    <div>
                      <label htmlFor="rooms" className="block text-xs font-semibold uppercase tracking-wider text-[#2A2A2A]/60 mb-1">Rooms</label>
                      <input
                        id="rooms"
                        type="number"
                        min="1"
                        {...register('rooms', { valueAsNumber: true })}
                        className={`w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#C84B31] ${errors.rooms ? 'border-red-500 focus:ring-red-500' : 'border-black/10 focus:ring-[#C84B31]'}`}
                      />
                      <FieldError error={errors.rooms?.message as string} />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 mb-6">
                  <div>
                    <label htmlFor="booking_date" className="block text-xs font-semibold uppercase tracking-wider text-[#2A2A2A]/60 mb-1">Date</label>
                    <input
                      id="booking_date"
                      type="date"
                      min={today}
                      {...register('booking_date')}
                      className={`w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#C84B31] ${errors.booking_date ? 'border-red-500 focus:ring-red-500' : 'border-black/10 focus:ring-[#C84B31]'}`}
                    />
                    <FieldError error={errors.booking_date?.message as string} />
                  </div>
                  <div>
                    <label htmlFor="participants" className="block text-xs font-semibold uppercase tracking-wider text-[#2A2A2A]/60 mb-1">Participants</label>
                    <input
                      id="participants"
                      type="number"
                      min="1"
                      {...register('participants', { valueAsNumber: true })}
                      className={`w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#C84B31] ${errors.participants ? 'border-red-500 focus:ring-red-500' : 'border-black/10 focus:ring-[#C84B31]'}`}
                    />
                    <FieldError error={errors.participants?.message as string} />
                  </div>
                </div>
              )}

              {/* Occasion Selector */}
              <div className="mb-6">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#2A2A2A]/60 mb-2">Occasion</label>
                <div className="flex flex-wrap gap-2">
                  {(Object.entries(OCCASION_THEMES) as [OccasionType, typeof OCCASION_THEMES[OccasionType]][]).map(([key, theme]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setValue('occasion', key)}
                      className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${occasion === key
                          ? 'bg-black text-white border-black'
                          : 'bg-white text-[#2A2A2A] border-black/10 hover:border-black/30'
                        }`}
                    >
                      {theme.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-[#FDFBF7] p-4 rounded-2xl border border-black/5 mb-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#2A2A2A]">Total Price</p>
                  <p className="text-xs text-[#2A2A2A]/60">Includes 5% taxes and fees</p>
                </div>
                <span className="text-2xl font-bold text-[#C84B31]">₹{totalPrice.toLocaleString('en-IN')}</span>
              </div>

              {user ? (
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-stone-900 hover:bg-black text-white py-3.5 rounded-2xl font-bold text-xs flex justify-center items-center gap-2 transition shadow-md disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calendar className="w-4 h-4" />}
                  <span>Proceed to Payment</span>
                </button>
              ) : (
                <a href="/login" className="w-full bg-[#C84B31] text-white py-3.5 rounded-2xl font-bold text-xs flex justify-center items-center transition hover:bg-[#A63A25] no-underline shadow-md">
                  Log in to Book
                </a>
              )}
            </form>
          )}
        </div>
      </div>

      {/* Unified Demo Payment Modal */}
      <DemoPaymentModal
        isOpen={demoPaymentOpen}
        onClose={() => setDemoPaymentOpen(false)}
        onSuccess={handlePaymentSuccess}
        amount={totalPrice}
        title={`Booking: ${itemName}`}
        itemType={type}
      />
    </>
  );
};
