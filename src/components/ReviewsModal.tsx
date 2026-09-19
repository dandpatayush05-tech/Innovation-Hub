import React, { useState, useEffect, useCallback } from 'react';
import { getReviews, createReview, deleteReview } from '../api/reviews';
import type { Review } from '../api/reviews';
import { useAuth } from '../context/AuthContext';
import { Star, X, Trash2, BadgeCheck } from 'lucide-react';
import { isAxiosError } from 'axios';
import { ConfirmDialog } from './ConfirmDialog';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createReviewSchema } from '../lib/validations';
import { FieldError } from './FieldError';

interface ReviewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  hotelId?: string;
  tourId?: string;
  title: string;
}

export function ReviewsModal({ isOpen, onClose, hotelId, tourId, title }: ReviewsModalProps) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Form State
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(createReviewSchema),
    defaultValues: {
      rating: 5,
      comment: '',
      hotel_id: hotelId,
      tour_id: tourId
    }
  });

  const rating = useWatch({ control, name: 'rating' });
  
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getReviews({ hotel_id: hotelId, tour_id: tourId });
      setReviews(data.reviews);
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setLoading(false);
    }
  }, [hotelId, tourId]);

  useEffect(() => {
    if (isOpen) {
      fetchReviews();
      // Reset form
      reset({
        rating: 5,
        comment: '',
        hotel_id: hotelId,
        tour_id: tourId
      });
      setError('');
    }
  }, [isOpen, fetchReviews]);

  const onSubmit = async (data: any) => {
    setSubmitting(true);
    setError('');

    try {
      await createReview({
        hotel_id: hotelId,
        tour_id: tourId,
        rating: data.rating,
        comment: data.comment,
      });
      await fetchReviews(); // Refresh list
      reset({ rating: 5, comment: '', hotel_id: hotelId, tour_id: tourId }); // Clear input
    } catch (err: any) {
      if (isAxiosError(err) && err.response?.data?.error?.message) {
        setError(err.response.data.error.message);
      } else {
        setError('Failed to submit review.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const executeDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteReview(deleteTarget);
      setReviews((prev) => prev.filter((r) => r.id !== deleteTarget));
    } catch (err) {
      console.error('Failed to delete review', err);
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeleteTarget(id);
  };

  if (!isOpen) return null;

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)
    : 'New';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 rounded-3xl w-full max-w-2xl border border-slate-800 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-800">
          <div>
            <h2 className="text-2xl font-bold text-white">{title}</h2>
            <div className="flex items-center gap-2 mt-1">
              <Star className="w-5 h-5 text-yellow-400 fill-current" />
              <span className="text-slate-300">{averageRating}</span>
              <span className="text-slate-500">({reviews.length} reviews)</span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white transition-colors rounded-full hover:bg-slate-800">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Submit Form (If authenticated) */}
          {user ? (
            <form onSubmit={handleSubmit(onSubmit)} className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50">
              <h3 className="text-lg font-semibold text-white mb-4">Leave a Review</h3>
              {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
              
              <div className="flex items-center gap-2 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setValue('rating', star)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`w-8 h-8 ${rating >= star ? 'text-yellow-400 fill-current' : 'text-slate-600'}`}
                    />
                  </button>
                ))}
              </div>

              <textarea
                {...register('comment')}
                placeholder="Share your experience (min 10 characters)..."
                className={`w-full bg-slate-900 border rounded-xl p-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 mb-1 h-24 resize-none ${errors.comment ? 'border-red-500' : 'border-slate-700'}`}
              />
              <FieldError error={errors.comment?.message as string} />
              <div className="mb-4"></div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          ) : (
            <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 text-center">
              <p className="text-slate-400">Please sign in to leave a review.</p>
            </div>
          )}

          {/* Reviews List */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white mb-2">Recent Reviews</h3>
            
            {loading ? (
              <p className="text-slate-400 text-center py-4">Loading reviews...</p>
            ) : reviews.length === 0 ? (
              <p className="text-slate-400 text-center py-8 bg-slate-900/50 rounded-2xl">No reviews yet. Be the first!</p>
            ) : (
              reviews.map((review) => (
                <div key={review.id} className="bg-slate-800/30 p-5 rounded-2xl border border-slate-700/50">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">{review.user?.name || 'Anonymous'}</span>
                        {review.user_id === user?.id && (
                          <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">You</span>
                        )}
                        {review.verified && (
                          <span className="flex items-center gap-1 text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">
                            <BadgeCheck className="w-3 h-3" />
                            Verified
                          </span>
                        )}
                      </div>
                      <div className="flex items-center mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-slate-700'}`}
                          />
                        ))}
                      </div>
                    </div>
                    
                    {/* Delete button if user owns it or is admin */}
                    {(user?.id === review.user_id || user?.role === 'admin') && (
                      <button 
                        onClick={() => handleDeleteClick(review.id)}
                        className="text-slate-500 hover:text-red-400 transition-colors"
                        title="Delete Review"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                  
                  <p className="text-slate-300 leading-relaxed">{review.comment}</p>
                  <p className="text-slate-500 text-xs mt-3">
                    {new Date(review.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={executeDelete}
        title="Delete Review"
        description="Are you sure you want to delete this review? This action cannot be undone."
        confirmText="Delete Review"
      />
    </div>
  );
}
