/**
 * Date Validation Helper
 * Comprehensive date validation and manipulation utilities
 */

/**
 * Check if date is in the past
 */
export const isDateInPast = (date: Date): boolean => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);
  return checkDate < now;
};

/**
 * Check if date is today
 */
export const isDateToday = (date: Date): boolean => {
  const now = new Date();
  const checkDate = new Date(date);
  return (
    checkDate.getFullYear() === now.getFullYear() &&
    checkDate.getMonth() === now.getMonth() &&
    checkDate.getDate() === now.getDate()
  );
};

/**
 * Check if date is in the future
 */
export const isDateInFuture = (date: Date): boolean => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);
  return checkDate > now;
};

/**
 * Get days between two dates
 */
export const daysBetween = (date1: Date, date2: Date): number => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  d1.setHours(0, 0, 0, 0);
  d2.setHours(0, 0, 0, 0);
  const timeDiff = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
};

/**
 * Check if date is within business hours (9 AM - 6 PM)
 */
export const isWithinBusinessHours = (date: Date): boolean => {
  const hours = date.getHours();
  return hours >= 9 && hours < 18;
};

/**
 * Check if date is a weekend
 */
export const isWeekend = (date: Date): boolean => {
  const day = date.getDay();
  return day === 0 || day === 6; // Sunday or Saturday
};

/**
 * Check if date is a weekday
 */
export const isWeekday = (date: Date): boolean => {
  return !isWeekend(date);
};

/**
 * Get next available business day from date
 */
export const getNextBusinessDay = (date: Date): Date => {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + 1);

  while (isWeekend(nextDate)) {
    nextDate.setDate(nextDate.getDate() + 1);
  }

  return nextDate;
};

/**
 * Get previous business day from date
 */
export const getPreviousBusinessDay = (date: Date): Date => {
  const prevDate = new Date(date);
  prevDate.setDate(prevDate.getDate() - 1);

  while (isWeekend(prevDate)) {
    prevDate.setDate(prevDate.getDate() - 1);
  }

  return prevDate;
};

/**
 * Parse time string to minutes (HH:MM format)
 */
export const timeStringToMinutes = (timeStr: string): number | null => {
  const match = timeStr.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);

  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return null;
  }

  return hours * 60 + minutes;
};

/**
 * Convert minutes to time string (HH:MM format)
 */
export const minutesToTimeString = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
};

/**
 * Check if two time slots overlap
 */
export const timeSlotOverlaps = (
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean => {
  const start1Min = timeStringToMinutes(start1);
  const end1Min = timeStringToMinutes(end1);
  const start2Min = timeStringToMinutes(start2);
  const end2Min = timeStringToMinutes(end2);

  if (!start1Min || !end1Min || !start2Min || !end2Min) {
    return false;
  }

  return start1Min < end2Min && start2Min < end1Min;
};

/**
 * Format date for display (Portuguese locale)
 */
export const formatDatePT = (date: Date): string => {
  return new Intl.DateTimeFormat('pt-PT', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
};

/**
 * Format date and time for display (Portuguese locale)
 */
export const formatDateTimePT = (date: Date): string => {
  return new Intl.DateTimeFormat('pt-PT', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

/**
 * Get relative time string (e.g., "in 2 days", "tomorrow")
 */
export const getRelativeTimeString = (date: Date): string => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);

  const days = daysBetween(now, checkDate);

  if (isDateToday(date)) return 'Hoje';
  if (days === 1) return 'Amanhã';
  if (days === 2) return 'Depois de amanhã';
  if (days <= 7) return `Em ${days} dias`;
  if (days <= 30) return `Em ${Math.floor(days / 7)} semanas`;

  return formatDatePT(date);
};

/**
 * Validate date range
 */
export const isValidDateRange = (
  startDate: Date,
  endDate: Date,
  options?: {
    allowSameDay?: boolean;
    maxDaysRange?: number;
  }
): boolean => {
  const { allowSameDay = false, maxDaysRange = 365 } = options || {};

  const start = new Date(startDate);
  const end = new Date(endDate);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  if (!allowSameDay && start >= end) return false;
  if (allowSameDay && start > end) return false;

  const days = daysBetween(start, end);
  return days <= maxDaysRange;
};

/**
 * Get booking window (e.g., can only book 30 days in advance)
 */
export const isWithinBookingWindow = (
  date: Date,
  options?: {
    minDaysInAdvance?: number;
    maxDaysInAdvance?: number;
  }
): boolean => {
  const {
    minDaysInAdvance = 1,
    maxDaysInAdvance = 90,
  } = options || {};

  const days = daysBetween(new Date(), date);

  return days >= minDaysInAdvance && days <= maxDaysInAdvance;
};

/**
 * Validate appointment time (not during lunch break, etc)
 */
export const isValidAppointmentTime = (
  date: Date,
  options?: {
    excludeLunchBreak?: boolean;
    businessHoursStart?: number;
    businessHoursEnd?: number;
  }
): boolean => {
  const {
    excludeLunchBreak = true,
    businessHoursStart = 9,
    businessHoursEnd = 18,
  } = options || {};

  const hours = date.getHours();

  // Check business hours
  if (hours < businessHoursStart || hours >= businessHoursEnd) {
    return false;
  }

  // Check lunch break (12 PM - 1 PM)
  if (excludeLunchBreak && hours === 12) {
    return false;
  }

  return true;
};

/**
 * Get available time slots for a day
 */
export const getAvailableTimeSlots = (options?: {
  slotDurationMinutes?: number;
  startHour?: number;
  endHour?: number;
  excludeLunch?: boolean;
}): string[] => {
  const {
    slotDurationMinutes = 30,
    startHour = 9,
    endHour = 18,
    excludeLunch = true,
  } = options || {};

  const slots: string[] = [];
  const lunchStart = 12;
  const lunchEnd = 13;

  for (let hour = startHour; hour < endHour; hour++) {
    // Skip lunch break
    if (excludeLunch && (hour === lunchStart || hour === lunchEnd - 1)) {
      continue;
    }

    for (let minute = 0; minute < 60; minute += slotDurationMinutes) {
      slots.push(
        `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
      );
    }
  }

  return slots;
};
