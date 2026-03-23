export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

// Luhn algorithm for credit card validation
export const validateCardNumber = (cardNumber: string): ValidationResult => {
  const cleaned = cardNumber.replace(/\s/g, '');
  
  if (!/^\d{13,19}$/.test(cleaned)) {
    return { isValid: false, error: 'Invalid card number format' };
  }

  let sum = 0;
  let isEven = false;

  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i], 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  if (sum % 10 !== 0) {
    return { isValid: false, error: 'Invalid card number' };
  }

  return { isValid: true };
};

export const validateCardDetails = (cardNumber: string): ValidationResult => {
  if (!cardNumber || cardNumber.trim() === '') {
    return { isValid: false, error: 'Card number is required' };
  }

  return validateCardNumber(cardNumber);
};

export const validateCVC = (cvc: string): ValidationResult => {
  if (!cvc || cvc.trim() === '') {
    return { isValid: false, error: 'CVC is required' };
  }

  if (!/^\d{3,4}$/.test(cvc)) {
    return { isValid: false, error: 'CVC must be 3 or 4 digits' };
  }

  return { isValid: true };
};

export const validateExpiryDate = (expiryDate: string): ValidationResult => {
  if (!expiryDate || expiryDate.trim() === '') {
    return { isValid: false, error: 'Expiry date is required' };
  }

  const [month, year] = expiryDate.split('/');

  if (!month || !year) {
    return { isValid: false, error: 'Invalid expiry date format (MM/YY)' };
  }

  const monthNum = parseInt(month, 10);
  const yearNum = parseInt(year, 10);

  if (monthNum < 1 || monthNum > 12) {
    return { isValid: false, error: 'Invalid month' };
  }

  const currentDate = new Date();
  const expiryYear = 2000 + yearNum;

  if (expiryYear < currentDate.getFullYear() ||
      (expiryYear === currentDate.getFullYear() && monthNum < currentDate.getMonth() + 1)) {
    return { isValid: false, error: 'Card has expired' };
  }

  return { isValid: true };
};

export const validateCardholder = (name: string): ValidationResult => {
  if (!name || name.trim() === '') {
    return { isValid: false, error: 'Cardholder name is required' };
  }

  if (name.length < 2) {
    return { isValid: false, error: 'Name is too short' };
  }

  if (!/^[a-zA-Z\s]+$/.test(name)) {
    return { isValid: false, error: 'Name can only contain letters and spaces' };
  }

  return { isValid: true };
};
