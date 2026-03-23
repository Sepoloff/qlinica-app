/**
 * Comprehensive booking validation utilities
 * Ensures all booking data is valid before submission
 */

import { validateEmail, validatePhone } from './validation';
import { formatDateISO, isDateInPast, parseDate } from './dateHelpers';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate booking service selection
 */
export const validateService = (serviceId?: string | number, serviceName?: string): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!serviceId) {
    errors.push('Serviço é obrigatório');
  }
  if (!serviceName || serviceName.trim() === '') {
    errors.push('Nome do serviço é obrigatório');
  }

  return { valid: errors.length === 0, errors, warnings };
};

/**
 * Validate therapist selection
 */
export const validateTherapist = (therapistId?: string | number, therapistName?: string, rating?: number): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!therapistId) {
    errors.push('Terapeuta é obrigatório');
  }
  if (!therapistName || therapistName.trim() === '') {
    errors.push('Nome do terapeuta é obrigatório');
  }
  if (rating !== undefined && rating < 3) {
    warnings.push(`Rating baixo (${rating.toFixed(1)}). Considere escolher outro terapeuta.`);
  }

  return { valid: errors.length === 0, errors, warnings };
};

/**
 * Validate booking date
 */
export const validateBookingDate = (dateString: string): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!dateString || dateString.trim() === '') {
    errors.push('Data é obrigatória');
    return { valid: false, errors, warnings };
  }

  // Validate format (DD/MM/YYYY or YYYY-MM-DD)
  const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$|^(\d{4})-(\d{2})-(\d{2})$/;
  if (!dateRegex.test(dateString)) {
    errors.push('Formato de data inválido. Use DD/MM/YYYY ou YYYY-MM-DD');
    return { valid: false, errors, warnings };
  }

  // Parse and validate date
  const parsedDate = parseDate(dateString);
  if (!parsedDate) {
    errors.push('Data inválida');
    return { valid: false, errors, warnings };
  }

  // Check if date is in the past
  if (isDateInPast(parsedDate)) {
    errors.push('A data não pode estar no passado');
    return { valid: false, errors, warnings };
  }

  // Warn if booking is far in the future (more than 6 months)
  const sixMonthsFromNow = new Date();
  sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);
  if (parsedDate > sixMonthsFromNow) {
    warnings.push('Esta data está muito longe no futuro. Considere agendar mais próximo.');
  }

  // Warn if booking is within 24 hours
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (parsedDate < tomorrow) {
    warnings.push('Esta data é em menos de 24 horas. Você pode não ter tempo para se preparar.');
  }

  return { valid: errors.length === 0, errors, warnings };
};

/**
 * Validate booking time
 */
export const validateBookingTime = (timeString: string): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!timeString || timeString.trim() === '') {
    errors.push('Horário é obrigatório');
    return { valid: false, errors, warnings };
  }

  // Validate time format (HH:MM)
  const timeRegex = /^(\d{2}):(\d{2})$/;
  const timeMatch = timeString.match(timeRegex);
  if (!timeMatch) {
    errors.push('Formato de hora inválido. Use HH:MM (ex: 14:30)');
    return { valid: false, errors, warnings };
  }

  const [, hourStr, minuteStr] = timeMatch;
  const hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);

  // Validate hour range (0-23)
  if (hour < 0 || hour > 23) {
    errors.push('Hora inválida (deve ser entre 00 e 23)');
  }

  // Validate minute range (0-59)
  if (minute < 0 || minute > 59) {
    errors.push('Minutos inválidos (deve ser entre 00 e 59)');
  }

  // Warn if booking is before business hours (before 9 AM)
  if (hour < 9) {
    warnings.push('Horário muito cedo. Considere agendar após as 09:00.');
  }

  // Warn if booking is after business hours (after 6 PM)
  if (hour >= 18) {
    warnings.push('Horário muito tarde. Considere agendar antes das 18:00.');
  }

  return { valid: errors.length === 0, errors, warnings };
};

/**
 * Validate user contact information
 */
export const validateContactInfo = (email?: string, phone?: string): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (email && !validateEmail(email)) {
    errors.push('Email inválido');
  }

  if (phone && !validatePhone(phone)) {
    errors.push('Telefone inválido. Use formato português: 912345678 ou +351912345678');
  }

  return { valid: errors.length === 0, errors, warnings };
};

/**
 * Validate complete booking data
 */
export interface BookingDataToValidate {
  serviceId?: string | number;
  serviceName?: string;
  therapistId?: string | number;
  therapistName?: string;
  therapistRating?: number;
  date?: string;
  time?: string;
  email?: string;
  phone?: string;
  notes?: string;
}

export const validateCompleteBooking = (data: BookingDataToValidate): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate service
  const serviceValidation = validateService(data.serviceId, data.serviceName);
  errors.push(...serviceValidation.errors);
  warnings.push(...serviceValidation.warnings);

  // Validate therapist
  const therapistValidation = validateTherapist(
    data.therapistId,
    data.therapistName,
    data.therapistRating
  );
  errors.push(...therapistValidation.errors);
  warnings.push(...therapistValidation.warnings);

  // Validate date
  if (data.date) {
    const dateValidation = validateBookingDate(data.date);
    errors.push(...dateValidation.errors);
    warnings.push(...dateValidation.warnings);
  } else {
    errors.push('Data é obrigatória');
  }

  // Validate time
  if (data.time) {
    const timeValidation = validateBookingTime(data.time);
    errors.push(...timeValidation.errors);
    warnings.push(...timeValidation.warnings);
  } else {
    errors.push('Horário é obrigatório');
  }

  // Validate contact info if provided
  if (data.email || data.phone) {
    const contactValidation = validateContactInfo(data.email, data.phone);
    errors.push(...contactValidation.errors);
    warnings.push(...contactValidation.warnings);
  }

  // Validate notes
  if (data.notes && data.notes.length > 500) {
    errors.push('Notas não podem ter mais de 500 caracteres');
  }

  return { valid: errors.length === 0, errors, warnings };
};

/**
 * Get user-friendly error message from validation result
 */
export const getValidationMessage = (result: ValidationResult): string => {
  if (result.valid) {
    return 'Dados validados com sucesso';
  }

  if (result.errors.length > 0) {
    return result.errors[0]; // Return first error
  }

  if (result.warnings.length > 0) {
    return result.warnings[0]; // Return first warning if no errors
  }

  return 'Erro na validação';
};

/**
 * Check if date/time is valid for appointment (not in the past, not too soon, not too far)
 */
export const isValidAppointmentDateTime = (dateString: string, timeString: string): { valid: boolean; reason?: string } => {
  const dateValidation = validateBookingDate(dateString);
  const timeValidation = validateBookingTime(timeString);

  if (!dateValidation.valid) {
    return { valid: false, reason: dateValidation.errors[0] };
  }

  if (!timeValidation.valid) {
    return { valid: false, reason: timeValidation.errors[0] };
  }

  return { valid: true };
};
