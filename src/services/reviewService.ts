'use strict';

import { api } from '../config/api';

export interface Review {
  id: string;
  bookingId: string;
  therapistId: string;
  rating: number; // 1-5
  comment: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReviewRequest {
  bookingId: string;
  therapistId: string;
  rating: number;
  comment: string;
}

export interface TherapistRating {
  therapistId: string;
  averageRating: number;
  totalReviews: number;
  ratings: {
    [key: number]: number; // rating: count
  };
}

class ReviewService {
  /**
   * Submit a review for a completed booking
   */
  async submitReview(reviewData: CreateReviewRequest): Promise<Review> {
    try {
      // Validate rating
      if (reviewData.rating < 1 || reviewData.rating > 5) {
        throw new Error('Avaliação deve estar entre 1 e 5');
      }

      // Validate comment
      if (reviewData.comment.trim().length < 10) {
        throw new Error('Comentário deve ter pelo menos 10 caracteres');
      }

      const response = await api.post<Review>(
        '/reviews',
        reviewData
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get reviews for a therapist
   */
  async getTherapistReviews(therapistId: string): Promise<Review[]> {
    try {
      const response = await api.get<Review[]>(
        `/therapists/${therapistId}/reviews`
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get review for a specific booking
   */
  async getBookingReview(bookingId: string): Promise<Review | null> {
    try {
      const response = await api.get<Review>(
        `/bookings/${bookingId}/review`
      );
      return response.data;
    } catch (error) {
      // 404 means no review exists yet
      if ((error as any).response?.status === 404) {
        return null;
      }
      throw this.handleError(error);
    }
  }

  /**
   * Update a review
   */
  async updateReview(reviewId: string, updates: Partial<CreateReviewRequest>): Promise<Review> {
    try {
      // Validate rating if provided
      if (updates.rating && (updates.rating < 1 || updates.rating > 5)) {
        throw new Error('Avaliação deve estar entre 1 e 5');
      }

      // Validate comment if provided
      if (updates.comment && updates.comment.trim().length < 10) {
        throw new Error('Comentário deve ter pelo menos 10 caracteres');
      }

      const response = await api.patch<Review>(
        `/reviews/${reviewId}`,
        updates
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete a review
   */
  async deleteReview(reviewId: string): Promise<void> {
    try {
      await api.delete(`/reviews/${reviewId}`);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get therapist rating summary
   */
  async getTherapistRating(therapistId: string): Promise<TherapistRating> {
    try {
      const response = await api.get<TherapistRating>(
        `/therapists/${therapistId}/rating`
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get user's submitted reviews
   */
  async getUserReviews(): Promise<Review[]> {
    try {
      const response = await api.get<Review[]>('/reviews/user/my-reviews');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Check if user can review a booking
   */
  async canReviewBooking(bookingId: string): Promise<boolean> {
    try {
      const response = await api.get<{ canReview: boolean }>(
        `/bookings/${bookingId}/can-review`
      );
      return response.data.canReview;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get rating statistics
   */
  async getRatingStats(therapistId: string): Promise<{
    averageRating: number;
    totalReviews: number;
    distribution: { [key: number]: number };
    percentages: { [key: number]: number };
  }> {
    try {
      const response = await api.get(
        `/therapists/${therapistId}/rating-stats`
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Format rating for display
   */
  formatRating(rating: number): string {
    return rating.toFixed(1);
  }

  /**
   * Get rating label
   */
  getRatingLabel(rating: number): string {
    const labels: { [key: number]: string } = {
      5: 'Excelente',
      4: 'Muito Bom',
      3: 'Bom',
      2: 'Insatisfeito',
      1: 'Muito Insatisfeito',
    };
    return labels[Math.round(rating)] || 'Não avaliado';
  }

  /**
   * Get rating color
   */
  getRatingColor(rating: number): string {
    if (rating >= 4.5) return '#4CAF50'; // Green
    if (rating >= 3.5) return '#8BC34A'; // Light Green
    if (rating >= 2.5) return '#FFC107'; // Amber
    if (rating >= 1.5) return '#FF9800'; // Orange
    return '#F44336'; // Red
  }

  /**
   * Handle API errors
   */
  private handleError(error: any): Error {
    if (error.response?.status === 404) {
      return new Error('Não encontrado');
    }
    if (error.response?.status === 400) {
      return new Error(error.response?.data?.message || 'Dados inválidos');
    }
    if (error.response?.status === 403) {
      return new Error('Sem permissão para esta ação');
    }
    return error;
  }
}

export const reviewService = new ReviewService();
