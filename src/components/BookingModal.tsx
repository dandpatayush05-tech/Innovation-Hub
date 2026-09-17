import React, { useState } from 'react';
import { X, Loader2, Calendar, Star, Download } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { createBooking, createGuideBooking } from '../api/bookings';
import { createReview } from '../api/reviews';
import { createRazorpayOrder, verifyRazorpayPayment } from '../api/payment';
import { useRazorpay } from 'react-razorpay';
import { OCCASION_THEMES, type OccasionType } from '../config/occasionThemes';

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
  const { Razorpay } = useRazorpay();
  
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [guests, setGuests] = useState(1);
  const [rooms, setRooms] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [occasion, setOccasion] = useState<OccasionType>('vacation');
  const [showSurprise, setShowSurprise] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [showBill, setShowBill] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  const today = new Date().toISOString().split('T')[0];

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
    ? price * getDays() * rooms
    : price * guests;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('You must be logged in to book.');
      return;
    }
    
    setError('');
    setLoading(true);

    try {
      if (type === 'hotel') {
        if (!checkInDate || !checkOutDate) throw new Error('Please select dates');
      } else {
        if (!bookingDate) throw new Error('Please select a date');
      }

      let bookingId = '';
      if (type === 'hotel') {
        const res = await createBooking({
          hotel_id: itemId,
          check_in_date: checkInDate,
          check_out_date: checkOutDate,
          guests,
          rooms,
          total_price: totalPrice,
          occasion
        }) as any;
        bookingId = res.booking.id;
      } else {
        const res = await createGuideBooking({
          tour_id: itemId,
          booking_date: bookingDate,
          participants: guests,
          total_price: totalPrice,
          occasion
        }) as any;
        bookingId = res.guideBooking.id;
      }

      // Step 1: Create Razorpay Order
      const order = await createRazorpayOrder({ booking_id: bookingId, booking_type: type });
      
      // Step 2: Initialize Razorpay Checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_placeholder_key',
        amount: order.amount,
        currency: order.currency as any,
        name: "Innovation Hub",
        description: `Booking for ${itemName}`,
        order_id: order.orderId,
        handler: async (response: any) => {
          try {
            setLoading(true);
            // Verify payment signature
            await verifyRazorpayPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            setSuccess(true);
          } catch (err: any) {
            console.error('Verification/Booking failed:', err);
            setError(err.response?.data?.error?.message || err.message || 'Payment verified but failed to save booking.');
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
        },
        theme: {
          color: "#000000",
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
          }
        }
      };

      const rzp1 = new Razorpay(options);
      
      rzp1.on("payment.failed", function (response: any) {
        setError(response.error.description || 'Payment failed');
      });

      rzp1.open();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || err.message || 'Failed to initiate payment. Please try again.');
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
    } catch (err: any) {
      console.error('Failed to submit review', err);
      // Even if review fails (e.g. duplicate), move to bill screen
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

  return (
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
          <div className="p-8 flex flex-col min-h-[460px] animate-in fade-in">
            <h3 className="text-2xl font-display mb-6 text-center">Receipt</h3>
            
            <div className="flex-1 bg-[#FDFBF7] p-6 rounded-2xl border border-black/5 space-y-4">
              <div className="flex justify-between pb-4 border-b border-black/5">
                <span className="text-[#2A2A2A]/60">Booking Item</span>
                <span className="font-medium text-right max-w-[180px] truncate">{itemName}</span>
              </div>
              <div className="flex justify-between pb-4 border-b border-black/5">
                <span className="text-[#2A2A2A]/60">{type === 'hotel' ? 'Check-in' : 'Date'}</span>
                <span className="font-medium">{type === 'hotel' ? checkInDate : bookingDate}</span>
              </div>
              <div className="flex justify-between pb-4 border-b border-black/5">
                <span className="text-[#2A2A2A]/60">Base Price</span>
                <span className="font-medium">${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pb-4 border-b border-black/5">
                <span className="text-[#2A2A2A]/60">Taxes & Fees (10%)</span>
                <span className="font-medium">${(totalPrice * 0.1).toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="font-bold text-lg text-[#2A2A2A]">Total Paid</span>
                <span className="font-bold text-lg text-[#C84B31]">${(totalPrice * 1.1).toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-8 space-y-3">
              <button 
                onClick={() => window.print()}
                className="w-full flex items-center justify-center gap-2 bg-slate-100 text-[#2A2A2A] py-3.5 rounded-full font-medium hover:bg-slate-200 transition-colors"
              >
                <Download className="w-5 h-5" /> Download Bill
              </button>
              <button 
                onClick={onClose}
                className="w-full bg-black text-white py-3.5 rounded-full font-medium hover:bg-[#333] transition-colors"
              >
                Close
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
          const theme = OCCASION_THEMES[occasion];
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
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-display mb-2">Booking Confirmed!</h3>
            <p className="text-[#2A2A2A]/60 mb-8">Your reservation for {itemName} has been successfully placed. You can view the details in your dashboard.</p>
            <button 
              onClick={() => { setSuccess(false); setShowSurprise(true); }}
              className="w-full bg-[#C84B31] text-white py-3.5 rounded-full font-medium hover:bg-[#A63A25] transition-colors mt-auto"
            >
              Continue
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6">
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
                    <label htmlFor="checkInDate" className="block text-xs font-semibold uppercase tracking-wider text-[#2A2A2A]/60 mb-1">Check-in</label>
                    <input 
                      id="checkInDate"
                      type="date" 
                      required
                      min={today}
                      value={checkInDate}
                      onChange={(e) => setCheckInDate(e.target.value)}
                      className="w-full border border-black/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#C84B31]"
                    />
                  </div>
                  <div>
                    <label htmlFor="checkOutDate" className="block text-xs font-semibold uppercase tracking-wider text-[#2A2A2A]/60 mb-1">Check-out</label>
                    <input 
                      id="checkOutDate"
                      type="date" 
                      required
                      min={checkInDate || today}
                      value={checkOutDate}
                      onChange={(e) => setCheckOutDate(e.target.value)}
                      className="w-full border border-black/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#C84B31]"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="hotelGuests" className="block text-xs font-semibold uppercase tracking-wider text-[#2A2A2A]/60 mb-1">Guests</label>
                    <input 
                      id="hotelGuests"
                      type="number" 
                      min="1"
                      required
                      value={guests}
                      onChange={(e) => setGuests(parseInt(e.target.value))}
                      className="w-full border border-black/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#C84B31]"
                    />
                  </div>
                  <div>
                    <label htmlFor="hotelRooms" className="block text-xs font-semibold uppercase tracking-wider text-[#2A2A2A]/60 mb-1">Rooms</label>
                    <input 
                      id="hotelRooms"
                      type="number" 
                      min="1"
                      required
                      value={rooms}
                      onChange={(e) => setRooms(parseInt(e.target.value))}
                      className="w-full border border-black/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#C84B31]"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4 mb-6">
                <div>
                  <label htmlFor="tourDate" className="block text-xs font-semibold uppercase tracking-wider text-[#2A2A2A]/60 mb-1">Date</label>
                  <input 
                    id="tourDate"
                    type="date" 
                    required
                    min={today}
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full border border-black/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#C84B31]"
                  />
                </div>
                <div>
                  <label htmlFor="tourGuests" className="block text-xs font-semibold uppercase tracking-wider text-[#2A2A2A]/60 mb-1">Participants</label>
                  <input 
                    id="tourGuests"
                    type="number" 
                    min="1"
                    required
                    value={guests}
                    onChange={(e) => setGuests(parseInt(e.target.value))}
                    className="w-full border border-black/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#C84B31]"
                  />
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
                    onClick={() => setOccasion(key)}
                    className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                      occasion === key 
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
                <p className="text-xs text-[#2A2A2A]/60">Includes taxes and fees</p>
              </div>
              <span className="text-2xl font-bold text-[#C84B31]">${totalPrice}</span>
            </div>

            {user ? (
              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white py-3.5 rounded-full font-medium flex justify-center items-center gap-2 hover:bg-[#333] transition-colors disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Calendar className="w-5 h-5" />}
                Proceed to Payment
              </button>
            ) : (
              <a href="/login" className="w-full bg-[#C84B31] text-white py-3.5 rounded-full font-medium flex justify-center items-center transition-colors hover:bg-[#A63A25] no-underline">
                Log in to Book
              </a>
            )}
          </form>
        )}
      </div>
    </div>
  );
};
