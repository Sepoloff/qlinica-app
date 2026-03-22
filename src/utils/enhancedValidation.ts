'use strict';

/**
 * Enhanced validation utilities with international support
 */

// RFC 5322 compliant email validation
export const validateEmailRFC = (email: string): { valid: boolean; reason?: string } => {
  const trimmed = email.trim().toLowerCase();
  
  // Basic checks
  if (!trimmed) return { valid: false, reason: 'Email é obrigatório' };
  if (trimmed.length > 254) return { valid: false, reason: 'Email muito longo' };
  
  // RFC 5322 simplified pattern
  const rfcEmailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  if (!rfcEmailRegex.test(trimmed)) {
    return { valid: false, reason: 'Formato de email inválido' };
  }
  
  // Additional validation
  const [localPart, domain] = trimmed.split('@');
  
  if (localPart.length > 64) {
    return { valid: false, reason: 'Parte local do email muito longa' };
  }
  
  if (localPart.startsWith('.') || localPart.endsWith('.')) {
    return { valid: false, reason: 'Email não pode começar/terminar com ponto' };
  }
  
  if (localPart.includes('..')) {
    return { valid: false, reason: 'Email não pode ter pontos consecutivos' };
  }
  
  return { valid: true };
};

// Enhanced password strength validation
export const validatePasswordStrength = (password: string): {
  score: number; // 0-4
  strength: string; // 'Muito Fraca' | 'Fraca' | 'Média' | 'Forte' | 'Muito Forte'
  feedback: string[];
  isAcceptable: boolean;
} => {
  const feedback: string[] = [];
  let score = 0;
  
  if (!password) {
    return { score: 0, strength: 'Muito Fraca', feedback: ['Palavra-passe é obrigatória'], isAcceptable: false };
  }
  
  // Length checks
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (password.length >= 16) score++;
  
  // Character variety
  if (/[a-z]/.test(password)) score += 0.5;
  if (/[A-Z]/.test(password)) score += 0.5;
  if (/[0-9]/.test(password)) score += 0.5;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 0.5;
  
  // Feedback
  if (password.length < 8) feedback.push('❌ Mínimo 8 caracteres');
  if (!/[A-Z]/.test(password)) feedback.push('❌ Adicione uma letra maiúscula');
  if (!/[0-9]/.test(password)) feedback.push('❌ Adicione um número');
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) 
    feedback.push('⚠️ Adicione um caractere especial para máxima segurança');
  
  // Normalize score
  const normalizedScore = Math.min(4, Math.round(score));
  
  let strength: string;
  switch (normalizedScore) {
    case 0: strength = 'Muito Fraca'; break;
    case 1: strength = 'Fraca'; break;
    case 2: strength = 'Média'; break;
    case 3: strength = 'Forte'; break;
    case 4: strength = 'Muito Forte'; break;
    default: strength = 'Desconhecida';
  }
  
  return {
    score: normalizedScore,
    strength,
    feedback,
    isAcceptable: normalizedScore >= 2 && /[A-Z]/.test(password) && /[0-9]/.test(password),
  };
};

// International phone validation
export const validatePhoneInternational = (phone: string, countryCode?: string): { 
  valid: boolean; 
  reason?: string;
  formatted?: string;
} => {
  const trimmed = phone.replace(/\s/g, '');
  
  if (!trimmed) return { valid: false, reason: 'Telefone é obrigatório' };
  
  // PT: +351 or 9
  if (countryCode === 'PT' || !countryCode) {
    const ptRegex = /^(\+351|00351|9)\d{8,9}$|^2\d{7,8}$/;
    if (ptRegex.test(trimmed)) {
      let formatted = trimmed;
      if (formatted.startsWith('9')) formatted = '+351' + formatted;
      if (formatted.startsWith('00351')) formatted = '+' + formatted.substring(2);
      return { valid: true, formatted };
    }
  }
  
  // US: +1
  if (countryCode === 'US' || !countryCode) {
    const usRegex = /^(\+1|001)?\d{10}$/;
    if (usRegex.test(trimmed)) {
      return { valid: true, formatted: trimmed.replace(/^(001)/, '+1') };
    }
  }
  
  // UK: +44
  if (countryCode === 'UK' || !countryCode) {
    const ukRegex = /^(\+44|0044)?[0-9]{10}$/;
    if (ukRegex.test(trimmed)) {
      return { valid: true, formatted: trimmed };
    }
  }
  
  return { valid: false, reason: 'Formato de telefone inválido' };
};

// Date validation with timezone awareness
export const validateFutureDate = (dateString: string, minHoursAhead?: number): {
  valid: boolean;
  reason?: string;
  date?: Date;
} => {
  if (!dateString) return { valid: false, reason: 'Data é obrigatória' };
  
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) {
    return { valid: false, reason: 'Formato de data inválido' };
  }
  
  const now = new Date();
  const minDate = new Date(now.getTime() + (minHoursAhead || 0) * 60 * 60 * 1000);
  
  if (date < minDate) {
    return { valid: false, reason: `Data deve ser no futuro (mínimo ${minHoursAhead || 0} horas)` };
  }
  
  // Check if date is too far in future (e.g., > 2 years)
  const maxDate = new Date(now.getTime() + 730 * 24 * 60 * 60 * 1000);
  if (date > maxDate) {
    return { valid: false, reason: 'Data muito distante no futuro' };
  }
  
  return { valid: true, date };
};

// Time slot validation
export const validateTimeSlot = (time: string, date?: string): {
  valid: boolean;
  reason?: string;
} => {
  if (!time) return { valid: false, reason: 'Hora é obrigatória' };
  
  const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
  if (!timeRegex.test(time)) {
    return { valid: false, reason: 'Formato de hora inválido (use HH:MM)' };
  }
  
  const [hours, minutes] = time.split(':').map(Number);
  
  // Business hours typically 8:00 - 20:00
  if (hours < 8 || hours >= 20) {
    return { valid: false, reason: 'Horário fora do funcionamento (8h-20h)' };
  }
  
  return { valid: true };
};

// Composite form validation
export const validateBookingFormEnhanced = (data: {
  serviceId?: number | string;
  therapistId?: number | string;
  date?: string;
  time?: string;
  notes?: string;
}): {
  isValid: boolean;
  errors: Record<string, string>;
} => {
  const errors: Record<string, string> = {};
  
  if (!data.serviceId) {
    errors.service = 'Selecione um serviço';
  }
  
  if (!data.therapistId) {
    errors.therapist = 'Selecione um terapeuta';
  }
  
  if (!data.date) {
    errors.date = 'Selecione uma data';
  } else {
    const dateValidation = validateFutureDate(data.date, 1); // Mínimo 1 hora à frente
    if (!dateValidation.valid) {
      errors.date = dateValidation.reason || 'Data inválida';
    }
  }
  
  if (!data.time) {
    errors.time = 'Selecione uma hora';
  } else {
    const timeValidation = validateTimeSlot(data.time, data.date);
    if (!timeValidation.valid) {
      errors.time = timeValidation.reason || 'Hora inválida';
    }
  }
  
  if (data.notes && data.notes.length > 500) {
    errors.notes = 'Notas não podem ter mais de 500 caracteres';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export default {
  validateEmailRFC,
  validatePasswordStrength,
  validatePhoneInternational,
  validateFutureDate,
  validateTimeSlot,
  validateBookingFormEnhanced,
};
