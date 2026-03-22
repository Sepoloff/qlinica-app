import { useState, useCallback } from 'react';

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean | string;
  message?: string;
}

export interface ValidationRules {
  [field: string]: ValidationRule;
}

export interface FormErrors {
  [field: string]: string;
}

export const useFormValidation = (rules: ValidationRules) => {
  const [errors, setErrors] = useState<FormErrors>({});

  const validateField = useCallback((field: string, value: any): string | null => {
    const rule = rules[field];
    if (!rule) return null;

    // Check required
    if (rule.required && (!value || value.toString().trim() === '')) {
      return rule.message || `${field} é obrigatório`;
    }

    if (!value) return null;

    const stringValue = value.toString();

    // Check minLength
    if (rule.minLength && stringValue.length < rule.minLength) {
      return rule.message || `${field} deve ter pelo menos ${rule.minLength} caracteres`;
    }

    // Check maxLength
    if (rule.maxLength && stringValue.length > rule.maxLength) {
      return rule.message || `${field} não pode exceder ${rule.maxLength} caracteres`;
    }

    // Check pattern
    if (rule.pattern && !rule.pattern.test(stringValue)) {
      return rule.message || `${field} é inválido`;
    }

    // Check custom validation
    if (rule.custom) {
      const result = rule.custom(value);
      if (result !== true) {
        return typeof result === 'string' ? result : (rule.message || `${field} é inválido`);
      }
    }

    return null;
  }, [rules]);

  const validate = useCallback((values: Record<string, any>): FormErrors => {
    const newErrors: FormErrors = {};

    Object.keys(rules).forEach(field => {
      const error = validateField(field, values[field]);
      if (error) {
        newErrors[field] = error;
      }
    });

    setErrors(newErrors);
    return newErrors;
  }, [rules, validateField]);

  const validateFieldValue = useCallback((field: string, value: any) => {
    const error = validateField(field, value);
    if (error) {
      setErrors(prev => ({ ...prev, [field]: error }));
    } else {
      setErrors(prev => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
    return error;
  }, [validateField]);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const isValid = Object.keys(errors).length === 0;

  return {
    errors,
    validate,
    validateFieldValue,
    clearErrors,
    isValid,
  };
};

// Pre-built validation rules
export const emailRule: ValidationRule = {
  required: true,
  pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  message: 'Email inválido',
};

export const passwordRule: ValidationRule = {
  required: true,
  minLength: 8,
  custom: (value) => {
    const hasUppercase = /[A-Z]/.test(value);
    const hasNumber = /\d/.test(value);
    if (!hasUppercase || !hasNumber) {
      return 'Palavra-passe deve conter maiúscula e número';
    }
    return true;
  },
};

export const phoneRule: ValidationRule = {
  required: true,
  pattern: /^(\+351|00351|0)?9\d{8}$/,
  message: 'Telefone inválido (ex: +351 912345678)',
};

export const nameRule: ValidationRule = {
  required: true,
  minLength: 2,
  maxLength: 50,
  pattern: /^[a-zA-Z\s]+$/,
  message: 'Nome inválido',
};
