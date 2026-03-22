'use strict';

import { useState, useCallback } from 'react';
import { reviewService, Review, CreateReviewRequest, TherapistRating } from '../services/reviewService';
import { useToast } from '../context/ToastContext';

interface UseReviewState {
  review: Review | null;
  reviews: Review[];
  therapistRating: TherapistRating | null;
  isLoading: boolean;
  error: string | null;
}

export function useReview() {
  const { showToast } = useToast();
  const [state, setState] = useState<UseReviewState>({
    review: null,
    reviews: [],
    therapistRating: null,
    isLoading: false,
    error: null,
  });

  /**
   * Submit a new review
   */
  const submitReview = useCallback(
    async (reviewData: CreateReviewRequest) => {
      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        const newReview = await reviewService.submitReview(reviewData);

        setState((prev) => ({
          ...prev,
          review: newReview,
          isLoading: false,
        }));

        showToast({
          message: 'Avaliação enviada com sucesso!',
          type: 'success',
        });

        return newReview;
      } catch (err: any) {
        const errorMessage = err.message || 'Erro ao enviar avaliação';
        setState((prev) => ({
          ...prev,
          error: errorMessage,
          isLoading: false,
        }));
        showToast({
          message: errorMessage,
          type: 'error',
        });
        throw err;
      }
    },
    [showToast]
  );

  /**
   * Fetch reviews for a therapist
   */
  const fetchTherapistReviews = useCallback(
    async (therapistId: string) => {
      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        const reviews = await reviewService.getTherapistReviews(therapistId);

        setState((prev) => ({
          ...prev,
          reviews,
          isLoading: false,
        }));

        return reviews;
      } catch (err: any) {
        const errorMessage = err.message || 'Erro ao carregar avaliações';
        setState((prev) => ({
          ...prev,
          error: errorMessage,
          isLoading: false,
        }));
        showToast({
          message: errorMessage,
          type: 'error',
        });
        throw err;
      }
    },
    [showToast]
  );

  /**
   * Fetch review for a specific booking
   */
  const fetchBookingReview = useCallback(
    async (bookingId: string) => {
      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        const review = await reviewService.getBookingReview(bookingId);

        setState((prev) => ({
          ...prev,
          review,
          isLoading: false,
        }));

        return review;
      } catch (err: any) {
        const errorMessage = err.message || 'Erro ao carregar avaliação';
        setState((prev) => ({
          ...prev,
          error: errorMessage,
          isLoading: false,
        }));
        throw err;
      }
    },
    []
  );

  /**
   * Update a review
   */
  const updateReview = useCallback(
    async (reviewId: string, updates: Partial<CreateReviewRequest>) => {
      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        const updatedReview = await reviewService.updateReview(reviewId, updates);

        setState((prev) => ({
          ...prev,
          review: updatedReview,
          isLoading: false,
        }));

        showToast({
          message: 'Avaliação atualizada com sucesso!',
          type: 'success',
        });

        return updatedReview;
      } catch (err: any) {
        const errorMessage = err.message || 'Erro ao atualizar avaliação';
        setState((prev) => ({
          ...prev,
          error: errorMessage,
          isLoading: false,
        }));
        showToast({
          message: errorMessage,
          type: 'error',
        });
        throw err;
      }
    },
    [showToast]
  );

  /**
   * Delete a review
   */
  const deleteReview = useCallback(
    async (reviewId: string) => {
      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        await reviewService.deleteReview(reviewId);

        setState((prev) => ({
          ...prev,
          review: null,
          isLoading: false,
        }));

        showToast({
          message: 'Avaliação removida com sucesso!',
          type: 'success',
        });
      } catch (err: any) {
        const errorMessage = err.message || 'Erro ao remover avaliação';
        setState((prev) => ({
          ...prev,
          error: errorMessage,
          isLoading: false,
        }));
        showToast({
          message: errorMessage,
          type: 'error',
        });
        throw err;
      }
    },
    [showToast]
  );

  /**
   * Fetch therapist rating
   */
  const fetchTherapistRating = useCallback(
    async (therapistId: string) => {
      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        const rating = await reviewService.getTherapistRating(therapistId);

        setState((prev) => ({
          ...prev,
          therapistRating: rating,
          isLoading: false,
        }));

        return rating;
      } catch (err: any) {
        const errorMessage = err.message || 'Erro ao carregar avaliações';
        setState((prev) => ({
          ...prev,
          error: errorMessage,
          isLoading: false,
        }));
        throw err;
      }
    },
    []
  );

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  /**
   * Reset state
   */
  const reset = useCallback(() => {
    setState({
      review: null,
      reviews: [],
      therapistRating: null,
      isLoading: false,
      error: null,
    });
  }, []);

  return {
    // State
    review: state.review,
    reviews: state.reviews,
    therapistRating: state.therapistRating,
    isLoading: state.isLoading,
    error: state.error,

    // Actions
    submitReview,
    fetchTherapistReviews,
    fetchBookingReview,
    updateReview,
    deleteReview,
    fetchTherapistRating,
    clearError,
    reset,
  };
}
