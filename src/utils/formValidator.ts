/**
 * Enhanced form validation utility with field-level and form-level validation
 */

import {
  validateEmail,
  validatePassword,
  validatePhone,
  validateDate,
  validateName,
  getPasswordStrength,
} from './validation';

export interface FormFieldError {
  field: string;
  message: string;
  type: 'error' | 'warning';
}

export interface FormValidationResult {
  isValid: boolean;
  errors: FormFieldError[];
  errorsByField: Record<string, string>;
}

export interface FormRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean | string;
  message?: string;
}

export class FormValidator {
  /**
   * Validate a single field
   */
  static validateField(
    fieldName: string,
    value: any,
    rules: FormRule
  ): FormFieldError | null {
    // Check required
    if (rules.required && (!value || (typeof value === 'string' && !value.trim()))) {
      return {
        field: fieldName,
        message: rules.message || `${fieldName} is required`,
        type: 'error',
      };
    }

    // Skip other validations if value is empty and not required
    if (!value) {
      return null;
    }

    // Check minLength
    if (rules.minLength && value.length < rules.minLength) {
      return {
        field: fieldName,
        message: rules.message || `Minimum length is ${rules.minLength}`,
        type: 'error',
      };
    }

    // Check maxLength
    if (rules.maxLength && value.length > rules.maxLength) {
      return {
        field: fieldName,
        message: rules.message || `Maximum length is ${rules.maxLength}`,
        type: 'error',
      };
    }

    // Check pattern
    if (rules.pattern && !rules.pattern.test(value)) {
      return {
        field: fieldName,
        message: rules.message || `${fieldName} format is invalid`,
        type: 'error',
      };
    }

    // Check custom validation
    if (rules.custom) {
      const result = rules.custom(value);
      if (result !== true) {
        return {
          field: fieldName,
          message: typeof result === 'string' ? result : (rules.message || 'Validation failed'),
          type: 'error',
        };
      }
    }

    return null;
  }

  /**
   * Validate entire form
   */
  static validateForm(
    values: Record<string, any>,
    rules: Record<string, FormRule>
  ): FormValidationResult {
    const errors: FormFieldError[] = [];
    const errorsByField: Record<string, string> = {};

    Object.entries(rules).forEach(([fieldName, fieldRules]) => {
      const fieldError = this.validateField(fieldName, values[fieldName], fieldRules);
      if (fieldError) {
        errors.push(fieldError);
        errorsByField[fieldName] = fieldError.message;
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      errorsByField,
    };
  }

  /**
   * Specialized validators
   */
  static validateEmail(email: string): FormFieldError | null {
    if (!email) {
      return {
        field: 'email',
        message: 'Email is required',
        type: 'error',
      };
    }

    if (!validateEmail(email)) {
      return {
        field: 'email',
        message: 'Invalid email format',
        type: 'error',
      };
    }

    return null;
  }

  static validatePassword(password: string): FormFieldError | null {
    if (!password) {
      return {
        field: 'password',
        message: 'Password is required',
        type: 'error',
      };
    }

    const strength = getPasswordStrength(password);
    if (strength.strength === 'weak') {
      return {
        field: 'password',
        message: 'Password must be at least 8 characters with uppercase and number',
        type: 'error',
      };
    }

    return null;
  }

  static validatePasswordConfirm(password: string, confirm: string): FormFieldError | null {
    if (password !== confirm) {
      return {
        field: 'passwordConfirm',
        message: 'Passwords do not match',
        type: 'error',
      };
    }

    return null;
  }

  static validatePhone(phone: string): FormFieldError | null {
    if (!phone) {
      return {
        field: 'phone',
        message: 'Phone is required',
        type: 'error',
      };
    }

    if (!validatePhone(phone)) {
      return {
        field: 'phone',
        message: 'Invalid phone format (e.g., +351 912345678)',
        type: 'error',
      };
    }

    return null;
  }

  static validateName(name: string): FormFieldError | null {
    if (!name) {
      return {
        field: 'name',
        message: 'Name is required',
        type: 'error',
      };
    }

    if (!validateName(name)) {
      return {
        field: 'name',
        message: 'Name must be at least 2 characters (no numbers)',
        type: 'error',
      };
    }

    return null;
  }

  /**
   * Get password strength indicator
   */
  static getPasswordStrength(password: string) {
    return getPasswordStrength(password);
  }
}
