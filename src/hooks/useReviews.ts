import { useState, useCallback } from 'react';
import { reviewService, Review, CreateReviewRequest } from '../services/reviewService';
import { analyticsService } from '../services/analyticsService';

interface UseReviewsReturn {
  loading: boolean;
  error: string | null;
  reviews: Review[];
  canReview: boolean;
  submitReview: (data: CreateReviewRequest) => Promise<Review>;
  getTherapistReviews: (therapistId: string) => Promise<Review[]>;
  getBookingReview: (bookingId: string) => Promise<Review | null>;
  updateReview: (reviewId: string, updates: Partial<CreateReviewRequest>) => Promise<Review>;
  deleteReview: (reviewId: string) => Promise<void>;
  checkCanReview: (bookingId: string) => Promise<boolean>;
  getRatingLabel: (rating: number) => string;
  getRatingColor: (rating: number) => string;
}

export const useReviews = (): UseReviewsReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [canReview, setCanReview] = useState(false);

  const handleError = useCallback((err: any) => {
    const message = err?.message || 'Erro ao processar avaliação';
    setError(message);
    analyticsService.trackError('review_error', { error: message });
  }, []);

  const submit = useCallback(async (data: CreateReviewRequest): Promise<Review> => {
    setLoading(true);
    setError(null);

    try {
      const review = await reviewService.submitReview(data);
      analyticsService.trackEvent('review_submitted', {
        therapistId: data.therapistId,
        rating: data.rating,
        hasComment: !!data.comment,
      });
      return review;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const getTherapist = useCallback(async (therapistId: string): Promise<Review[]> => {
    setLoading(true);
    setError(null);

    try {
      const data = await reviewService.getTherapistReviews(therapistId);
      setReviews(data);
      return data;
    } catch (err) {
      handleError(err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const getBooking = useCallback(async (bookingId: string): Promise<Review | null> => {
    setLoading(true);
    setError(null);

    try {
      const review = await reviewService.getBookingReview(bookingId);
      return review;
    } catch (err) {
      handleError(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const update = useCallback(async (
    reviewId: string,
    updates: Partial<CreateReviewRequest>
  ): Promise<Review> => {
    setLoading(true);
    setError(null);

    try {
      const review = await reviewService.updateReview(reviewId, updates);
      analyticsService.trackEvent('review_updated', {
        hasRating: !!updates.rating,
        hasComment: !!updates.comment,
      });
      return review;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const remove = useCallback(async (reviewId: string): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      await reviewService.deleteReview(reviewId);
      analyticsService.trackEvent('review_deleted', {});
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const check = useCallback(async (bookingId: string): Promise<boolean> => {
    try {
      const result = await reviewService.canReviewBooking(bookingId);
      setCanReview(result);
      return result;
    } catch (err) {
      handleError(err);
      return false;
    }
  }, [handleError]);

  return {
    loading,
    error,
    reviews,
    canReview,
    submitReview: submit,
    getTherapistReviews: getTherapist,
    getBookingReview: getBooking,
    updateReview: update,
    deleteReview: remove,
    checkCanReview: check,
    getRatingLabel: reviewService.getRatingLabel,
    getRatingColor: reviewService.getRatingColor,
  };
};
