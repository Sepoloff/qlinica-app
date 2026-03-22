/**
 * Format a phone number (Portuguese)
 * Input: 912345678 or +351912345678
 * Output: +351 912 345 678
 */
export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-numeric characters except +
  const cleaned = phone.replace(/[^\d+]/g, '');
  
  // If it doesn't start with +, add +351
  let formatted = cleaned.startsWith('+') ? cleaned : `+351${cleaned}`;
  
  // Format as +351 XXX XXX XXX
  if (formatted.startsWith('+351')) {
    const number = formatted.slice(4); // Remove +351
    if (number.length === 9) {
      return `+351 ${number.slice(0, 3)} ${number.slice(3, 6)} ${number.slice(6)}`;
    }
  }
  
  return formatted;
};

/**
 * Parse a formatted phone number back to just digits
 */
export const parsePhoneNumber = (phone: string): string => {
  return phone.replace(/[^\d]/g, '');
};

/**
 * Format currency value
 */
export const formatCurrency = (amount: number, currency: string = '€'): string => {
  return `${currency}${amount.toFixed(2)}`;
};

/**
 * Format date to Portuguese format
 */
export const formatDatePT = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

/**
 * Format time from date
 */
export const formatTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

/**
 * Format full datetime
 */
export const formatDateTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return `${formatDatePT(d)} ${formatTime(d)}`;
};

/**
 * Format duration in minutes to readable format
 */
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes}min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${mins}min`;
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) {
    return text;
  }
  return text.slice(0, maxLength - 3) + '...';
};

/**
 * Format booking status to user-friendly text
 */
export const formatBookingStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    confirmed: 'Confirmada',
    completed: 'Concluída',
    cancelled: 'Cancelada',
    pending: 'Pendente',
    rescheduled: 'Reagendada',
  };
  return statusMap[status] || status;
};
