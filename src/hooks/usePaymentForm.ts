import { useState, useCallback } from 'react';
import { validateCardDetails, ValidationError } from '../utils/cardValidation';

export interface PaymentFormData {
  cardholderName: string;
  cardNumber: string;
  expiryDate: string;
  cvc: string;
}

export interface PaymentFormErrors {
  cardholderName?: string;
  cardNumber?: string;
  expiryDate?: string;
  cvc?: string;
}

export const usePaymentForm = (onSubmit?: (data: PaymentFormData) => Promise<void>) => {
  const [formData, setFormData] = useState<PaymentFormData>({
    cardholderName: '',
    cardNumber: '',
    expiryDate: '',
    cvc: '',
  });

  const [errors, setErrors] = useState<PaymentFormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = useCallback((): boolean => {
    const newErrors: PaymentFormErrors = {};

    if (!formData.cardholderName.trim()) {
      newErrors.cardholderName = 'Cardholder name is required';
    }

    const cardValidation = validateCardDetails(formData.cardNumber);
    if (!cardValidation.isValid) {
      newErrors.cardNumber = cardValidation.error;
    }

    if (!formData.expiryDate) {
      newErrors.expiryDate = 'Expiry date is required';
    } else {
      const [month, year] = formData.expiryDate.split('/');
      const currentDate = new Date();
      const expiryYear = parseInt(`20${year}`, 10);
      const expiryMonth = parseInt(month, 10);

      if (expiryYear < currentDate.getFullYear() ||
          (expiryYear === currentDate.getFullYear() && expiryMonth < currentDate.getMonth() + 1)) {
        newErrors.expiryDate = 'Card has expired';
      }
    }

    if (!formData.cvc || formData.cvc.length < 3) {
      newErrors.cvc = 'Valid CVC is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleInputChange = useCallback((field: keyof PaymentFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
    }
  }, [errors]);

  const handleSubmit = useCallback(async () => {
    if (!validateForm()) {
      return;
    }

    if (!onSubmit) {
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      setErrors({ cardNumber: 'Payment failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  }, [formData, validateForm, onSubmit]);

  const resetForm = useCallback(() => {
    setFormData({
      cardholderName: '',
      cardNumber: '',
      expiryDate: '',
      cvc: '',
    });
    setErrors({});
  }, []);

  return {
    formData,
    errors,
    isLoading,
    handleInputChange,
    handleSubmit,
    resetForm,
    validateForm,
  };
};
