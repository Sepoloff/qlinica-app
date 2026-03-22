/**
 * String masking utilities for form inputs
 */

/**
 * Apply a mask pattern to a string
 * Pattern: # = digit, X = letter, * = any character
 */
export const applyMask = (value: string, pattern: string): string => {
  const cleaned = value.replace(/\D/g, '');
  let result = '';
  let cleanIndex = 0;

  for (let i = 0; i < pattern.length && cleanIndex < cleaned.length; i++) {
    const maskChar = pattern[i];
    if (maskChar === '#' && /\d/.test(cleaned[cleanIndex])) {
      result += cleaned[cleanIndex];
      cleanIndex++;
    } else if (maskChar !== '#') {
      result += maskChar;
    }
  }

  return result;
};

/**
 * Format credit card number
 * Pattern: XXXX XXXX XXXX XXXX
 */
export const formatCreditCard = (value: string): string => {
  const cleaned = value.replace(/\D/g, '').slice(0, 16);
  return cleaned.replace(/(\d{4})/g, '$1 ').trim();
};

/**
 * Format NIF/ID number (Portuguese)
 * Pattern: XXX XXX XXX XX
 */
export const formatNIF = (value: string): string => {
  const cleaned = value.replace(/\D/g, '').slice(0, 9);
  if (cleaned.length <= 3) return cleaned;
  if (cleaned.length <= 6) return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
  return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)}`;
};

/**
 * Format IBAN
 * Pattern: XX XXXX XXXX XXXX XXXX XXXX X
 */
export const formatIBAN = (value: string): string => {
  const cleaned = value.replace(/\s/g, '').toUpperCase().slice(0, 24);
  const formatted = cleaned.replace(/(.{4})/g, '$1 ').trim();
  return formatted;
};

/**
 * Remove all mask characters from a string
 */
export const removeMask = (value: string): string => {
  return value.replace(/\D/g, '');
};

/**
 * Validate if a string matches a mask
 */
export const validateMask = (value: string, expectedLength: number): boolean => {
  return value.replace(/\D/g, '').length === expectedLength;
};
