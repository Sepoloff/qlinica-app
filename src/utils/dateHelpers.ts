/**
 * Date and time utilities for booking system
 */

/**
 * Format date to DD/MM/YYYY
 */
export const formatDateDDMMYYYY = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

/**
 * Format date to YYYY-MM-DD
 */
export const formatDateISO = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Parse date string in format DD/MM/YYYY or YYYY-MM-DD to Date
 */
export const parseDate = (dateString: string): Date | null => {
  // Try DD/MM/YYYY format
  const ddmmyyyyRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  const ddmmyyyyMatch = dateString.match(ddmmyyyyRegex);
  if (ddmmyyyyMatch) {
    const [, day, month, year] = ddmmyyyyMatch;
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  }

  // Try YYYY-MM-DD format
  const isoRegex = /^(\d{4})-(\d{2})-(\d{2})$/;
  const isoMatch = dateString.match(isoRegex);
  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  }

  return null;
};

/**
 * Check if date is in the past
 */
export const isDateInPast = (date: Date | string): boolean => {
  const d = typeof date === 'string' ? parseDate(date) : date;
  if (!d) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dateToCheck = new Date(d);
  dateToCheck.setHours(0, 0, 0, 0);

  return dateToCheck < today;
};

/**
 * Check if date is today
 */
export const isToday = (date: Date | string): boolean => {
  const d = typeof date === 'string' ? parseDate(date) : date;
  if (!d) return false;

  const today = new Date();
  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  );
};

/**
 * Get day name (Monday, Tuesday, etc.)
 */
export const getDayName = (date: Date | string, locale: 'pt' | 'en' = 'pt'): string => {
  const d = typeof date === 'string' ? parseDate(date) : date;
  if (!d) return '';

  const days = {
    pt: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
    en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  };

  return days[locale][d.getDay()];
};

/**
 * Get abbreviated day name (Mon, Tue, etc.)
 */
export const getShortDayName = (date: Date | string, locale: 'pt' | 'en' = 'pt'): string => {
  const d = typeof date === 'string' ? parseDate(date) : date;
  if (!d) return '';

  const days = {
    pt: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'],
    en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  };

  return days[locale][d.getDay()];
};

/**
 * Get month name
 */
export const getMonthName = (date: Date | string, locale: 'pt' | 'en' = 'pt'): string => {
  const d = typeof date === 'string' ? parseDate(date) : date;
  if (!d) return '';

  const months = {
    pt: [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
    ],
    en: [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ],
  };

  return months[locale][d.getMonth()];
};

/**
 * Format time string HH:MM to readable format
 */
export const formatTime = (time: string): string => {
  const [hours, minutes] = time.split(':');
  return `${hours}:${minutes}`;
};

/**
 * Check if time string is valid (HH:MM format)
 */
export const isValidTimeFormat = (time: string): boolean => {
  const regex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return regex.test(time);
};

/**
 * Check if time is in business hours (9:00 - 18:00)
 */
export const isBusinessHours = (time: string): boolean => {
  if (!isValidTimeFormat(time)) return false;

  const [hours] = time.split(':').map(Number);
  return hours >= 9 && hours < 18;
};

/**
 * Get next N business days (excluding Sundays)
 */
export const getNextBusinessDays = (count: number = 14): Date[] => {
  const dates: Date[] = [];
  const today = new Date();
  today.setDate(today.getDate() + 1); // Start from tomorrow

  while (dates.length < count) {
    // Skip Sundays (day 0)
    if (today.getDay() !== 0) {
      dates.push(new Date(today));
    }
    today.setDate(today.getDate() + 1);
  }

  return dates;
};

/**
 * Calculate duration between two times (returns minutes)
 */
export const calculateDuration = (startTime: string, endTime: string): number => {
  if (!isValidTimeFormat(startTime) || !isValidTimeFormat(endTime)) {
    return 0;
  }

  const [startHours, startMinutes] = startTime.split(':').map(Number);
  const [endHours, endMinutes] = endTime.split(':').map(Number);

  const startTotalMinutes = startHours * 60 + startMinutes;
  const endTotalMinutes = endHours * 60 + endMinutes;

  return Math.max(0, endTotalMinutes - startTotalMinutes);
};

/**
 * Format datetime to human readable string
 */
export const formatDateTime = (date: string, time: string, locale: 'pt' | 'en' = 'pt'): string => {
  const d = parseDate(date);
  if (!d) return '';

  const dayName = getDayName(d, locale);
  const monthName = getMonthName(d, locale);
  const day = d.getDate();
  const formattedTime = formatTime(time);

  if (locale === 'pt') {
    return `${dayName}, ${day} de ${monthName} às ${formattedTime}`;
  } else {
    return `${dayName}, ${monthName} ${day} at ${formattedTime}`;
  }
};

/**
 * Get relative time string (e.g., "in 2 days", "amanhã")
 */
export const getRelativeTimeString = (date: string, locale: 'pt' | 'en' = 'pt'): string => {
  const d = parseDate(date);
  if (!d) return '';

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dateToCheck = new Date(d);
  dateToCheck.setHours(0, 0, 0, 0);

  const diffTime = dateToCheck.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (locale === 'pt') {
    if (diffDays === 0) return 'Hoje';
    if (diffDays === 1) return 'Amanhã';
    if (diffDays < 7) return `Em ${diffDays} dias`;
    if (diffDays < 14) return 'Próxima semana';
    if (diffDays < 30) return 'Próximo mês';
    return formatDateDDMMYYYY(d);
  } else {
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 7) return `In ${diffDays} days`;
    if (diffDays < 14) return 'Next week';
    if (diffDays < 30) return 'Next month';
    return formatDateISO(d);
  }
};
