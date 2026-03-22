/**
 * Date formatting and manipulation utilities
 */

export const formatDate = (date: Date | string, format: 'pt' | 'en' = 'pt'): string => {
  const d = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(d.getTime())) {
    return 'Data inválida';
  }

  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();

  if (format === 'en') {
    return `${year}-${month}-${day}`;
  }

  return `${day}/${month}/${year}`;
};

export const formatDateWithDay = (date: Date | string, format: 'pt' | 'en' = 'pt'): string => {
  const d = typeof date === 'string' ? new Date(date) : date;

  const days = format === 'pt'
    ? ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
    : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const dayName = days[d.getDay()];
  const dateStr = formatDate(d, format);

  return `${dayName}, ${dateStr}`;
};

export const formatTime = (time: string): string => {
  if (!time || time.length !== 5) return time;
  return `${time} (${getTimePeriod(time)})`;
};

export const getTimePeriod = (time: string): string => {
  const [hours] = time.split(':').map(Number);

  if (hours < 12) return 'Manhã';
  if (hours < 18) return 'Tarde';
  return 'Noite';
};

export const getRelativeDate = (date: Date | string, format: 'pt' | 'en' = 'pt'): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const isToday = d.toDateString() === today.toDateString();
  const isTomorrow = d.toDateString() === tomorrow.toDateString();

  if (isToday) return format === 'pt' ? 'Hoje' : 'Today';
  if (isTomorrow) return format === 'pt' ? 'Amanhã' : 'Tomorrow';

  return formatDate(d, format);
};

export const isDateInPast = (date: Date | string): boolean => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  return d < now;
};

export const isDateInFuture = (date: Date | string): boolean => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  return d > now;
};

export const getDateDifference = (from: Date | string, to: Date | string, unit: 'days' | 'hours' = 'days'): number => {
  const d1 = typeof from === 'string' ? new Date(from) : from;
  const d2 = typeof to === 'string' ? new Date(to) : to;

  const diffMs = d2.getTime() - d1.getTime();

  if (unit === 'hours') {
    return Math.floor(diffMs / (1000 * 60 * 60));
  }

  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
};

export const addDays = (date: Date | string, days: number): Date => {
  const d = typeof date === 'string' ? new Date(date) : new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

export const getNextBusinessDay = (date: Date | string): Date => {
  let d = typeof date === 'string' ? new Date(date) : new Date(date);

  do {
    d.setDate(d.getDate() + 1);
  } while (d.getDay() === 0 || d.getDay() === 6); // Skip Sunday and Saturday

  return d;
};

export const isBusinessDay = (date: Date | string): boolean => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const day = d.getDay();
  return day !== 0 && day !== 6; // Not Sunday or Saturday
};

export const formatDateRange = (from: Date | string, to: Date | string, format: 'pt' | 'en' = 'pt'): string => {
  const d1 = formatDate(from, format);
  const d2 = formatDate(to, format);
  const separator = format === 'pt' ? 'até' : 'to';

  return `${d1} ${separator} ${d2}`;
};

export const parseTime = (timeString: string): { hours: number; minutes: number } | null => {
  const match = timeString.match(/^(\d{1,2}):(\d{2})$/);

  if (!match) {
    return null;
  }

  return {
    hours: parseInt(match[1], 10),
    minutes: parseInt(match[2], 10),
  };
};

export const isTimeBeforeNow = (timeString: string, date: Date | string = new Date()): boolean => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const parsed = parseTime(timeString);

  if (!parsed) return false;

  const now = new Date();
  const appointmentTime = new Date(d);
  appointmentTime.setHours(parsed.hours, parsed.minutes, 0);

  return appointmentTime < now;
};
