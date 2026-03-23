/**
 * Payment Service
 * Handles payment processing via Stripe
 */

import api from '../config/api';
import { analyticsService } from './analyticsService';

export interface PaymentIntent {
  clientSecret: string;
  ephemeralKey?: string;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'wallet';
  last4: string;
  brand: string;
  expiryMonth: number;
  expiryYear: number;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
  amount: number;
  currency: string;
  timestamp: number;
  bookingId?: string;
  method?: string;
  status?: string;
}

export interface StripeConfig {
  publishableKey: string;
  merchantId?: string;
}

class PaymentService {
  private stripeConfig: StripeConfig | null = null;
  private paymentMethods: PaymentMethod[] = [];

  /**
   * Initialize payment service
   */
  async initialize(config?: StripeConfig): Promise<void> {
    try {
      if (config) {
        this.stripeConfig = config;
      } else {
        // Fetch from backend
        const response = await api.get('/payment/config');
        this.stripeConfig = response.data;
      }

      console.log('💳 Payment service initialized');
      analyticsService.trackEvent('payment_service_initialized', {
        hasPublishableKey: !!this.stripeConfig?.publishableKey,
      });
    } catch (error) {
      console.error('Error initializing payment service:', error);
      analyticsService.trackError(
        error instanceof Error ? error : new Error(String(error)),
        { operation: 'payment_service_init' }
      );
      throw error;
    }
  }

  /**
   * Create payment intent for booking
   */
  async createPaymentIntent(options: {
    amount: number;
    currency: string;
    bookingId: string;
    description?: string;
  }): Promise<PaymentIntent> {
    try {
      const response = await api.post('/payment/intents', {
        amount: Math.round(options.amount * 100), // Convert to cents
        currency: options.currency.toLowerCase(),
        bookingId: options.bookingId,
        description: options.description,
      });

      analyticsService.trackEvent('payment_intent_created', {
        amount: options.amount,
        currency: options.currency,
        bookingId: options.bookingId,
      });

      return response.data;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      analyticsService.trackError(
        error instanceof Error ? error : new Error(String(error)),
        {
          operation: 'payment_intent_creation',
          amount: options.amount,
          bookingId: options.bookingId,
        }
      );
      throw error;
    }
  }

  /**
   * Confirm payment with Stripe
   * Note: In production, this would be handled by Stripe SDK
   * This is a simplified version assuming SDK integration
   */
  async confirmPayment(options: {
    clientSecret: string;
    paymentMethodId: string;
    amount: number;
    currency: string;
  }): Promise<PaymentResult> {
    try {
      const response = await api.post('/payment/confirm', {
        clientSecret: options.clientSecret,
        paymentMethodId: options.paymentMethodId,
        amount: Math.round(options.amount * 100),
        currency: options.currency.toLowerCase(),
      });

      const result: PaymentResult = {
        success: response.data.status === 'succeeded',
        transactionId: response.data.id,
        amount: options.amount,
        currency: options.currency,
        timestamp: Date.now(),
      };

      if (result.success) {
        analyticsService.trackEvent('payment_successful', {
          transactionId: result.transactionId,
          amount: options.amount,
          currency: options.currency,
        });
      } else {
        analyticsService.trackError(
          new Error(response.data.error?.message || 'Payment failed'),
          {
            operation: 'payment_confirmation',
            transactionId: response.data.id,
          }
        );
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const result: PaymentResult = {
        success: false,
        error: errorMessage,
        amount: options.amount,
        currency: options.currency,
        timestamp: Date.now(),
      };

      analyticsService.trackError(
        error instanceof Error ? error : new Error(String(error)),
        {
          operation: 'payment_confirmation',
          amount: options.amount,
        }
      );

      return result;
    }
  }

  /**
   * Save payment method
   */
  async savePaymentMethod(paymentMethodId: string): Promise<PaymentMethod> {
    try {
      const response = await api.post('/payment/methods', {
        paymentMethodId,
      });

      const method: PaymentMethod = {
        id: response.data.id,
        type: response.data.type,
        last4: response.data.last4,
        brand: response.data.brand,
        expiryMonth: response.data.exp_month,
        expiryYear: response.data.exp_year,
      };

      this.paymentMethods.push(method);

      analyticsService.trackEvent('payment_method_saved', {
        methodId: method.id,
        brand: method.brand,
      });

      return method;
    } catch (error) {
      console.error('Error saving payment method:', error);
      analyticsService.trackError(
        error instanceof Error ? error : new Error(String(error)),
        { operation: 'save_payment_method' }
      );
      throw error;
    }
  }

  /**
   * Get saved payment methods
   */
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    try {
      const response = await api.get('/payment/methods');
      this.paymentMethods = response.data.map((method: any) => ({
        id: method.id,
        type: method.type,
        last4: method.last4,
        brand: method.brand,
        expiryMonth: method.exp_month,
        expiryYear: method.exp_year,
      }));

      return this.paymentMethods;
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      analyticsService.trackError(
        error instanceof Error ? error : new Error(String(error)),
        { operation: 'get_payment_methods' }
      );
      return [];
    }
  }

  /**
   * Delete payment method
   */
  async deletePaymentMethod(paymentMethodId: string): Promise<boolean> {
    try {
      await api.delete(`/payment/methods/${paymentMethodId}`);

      this.paymentMethods = this.paymentMethods.filter((m) => m.id !== paymentMethodId);

      analyticsService.trackEvent('payment_method_deleted', {
        methodId: paymentMethodId,
      });

      return true;
    } catch (error) {
      console.error('Error deleting payment method:', error);
      analyticsService.trackError(
        error instanceof Error ? error : new Error(String(error)),
        {
          operation: 'delete_payment_method',
          methodId: paymentMethodId,
        }
      );
      return false;
    }
  }

  /**
   * Get payment history
   */
  async getPaymentHistory(options?: {
    limit?: number;
    offset?: number;
  }): Promise<Array<{
    id: string;
    amount: number;
    currency: string;
    date: string;
    status: 'succeeded' | 'pending' | 'failed';
    bookingId: string;
  }>> {
    try {
      const response = await api.get('/payment/history', {
        params: {
          limit: options?.limit || 10,
          offset: options?.offset || 0,
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching payment history:', error);
      analyticsService.trackError(
        error instanceof Error ? error : new Error(String(error)),
        { operation: 'get_payment_history' }
      );
      return [];
    }
  }

  /**
   * Calculate total for booking with tax
   */
  calculateTotal(subtotal: number, taxRate: number = 0.23): {
    subtotal: number;
    tax: number;
    total: number;
  } {
    const tax = subtotal * taxRate;
    const total = subtotal + tax;

    return {
      subtotal: Math.round(subtotal * 100) / 100,
      tax: Math.round(tax * 100) / 100,
      total: Math.round(total * 100) / 100,
    };
  }

  /**
   * Format price for display
   */
  formatPrice(amount: number, currency: string = 'EUR'): string {
    const formatter = new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency,
    });
    return formatter.format(amount);
  }

  /**
   * Get Stripe config (for SDK initialization)
   */
  getConfig(): StripeConfig | null {
    return this.stripeConfig;
  }

  /**
   * Check if payment service is ready
   */
  isReady(): boolean {
    return !!this.stripeConfig?.publishableKey;
  }
}

export const paymentService = new PaymentService();
