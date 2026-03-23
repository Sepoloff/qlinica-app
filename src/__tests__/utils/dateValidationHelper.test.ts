import {
  isDateInPast,
  isDateToday,
  isDateInFuture,
  daysBetween,
  isWeekend,
  isWeekday,
  getNextBusinessDay,
  getPreviousBusinessDay,
  timeStringToMinutes,
  minutesToTimeString,
  timeSlotOverlaps,
  formatDatePT,
  isWithinBookingWindow,
  getAvailableTimeSlots,
  isValidDateRange,
} from '../../utils/dateValidationHelper';

describe('dateValidationHelper', () => {
  describe('Date comparison functions', () => {
    it('should detect dates in the past', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      expect(isDateInPast(yesterday)).toBe(true);
    });

    it('should detect today correctly', () => {
      const today = new Date();
      expect(isDateToday(today)).toBe(true);
    });

    it('should detect future dates', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      expect(isDateInFuture(tomorrow)).toBe(true);
    });

    it('should not consider today as past or future', () => {
      const today = new Date();
      expect(isDateInPast(today)).toBe(false);
      expect(isDateInFuture(today)).toBe(false);
    });
  });

  describe('daysBetween', () => {
    it('should calculate days between two dates', () => {
      const date1 = new Date('2026-03-23');
      const date2 = new Date('2026-03-30');

      const days = daysBetween(date1, date2);
      expect(days).toBe(7);
    });

    it('should return 0 for same day', () => {
      const date = new Date('2026-03-23');
      expect(daysBetween(date, date)).toBe(0);
    });

    it('should handle order-independent comparison', () => {
      const date1 = new Date('2026-03-23');
      const date2 = new Date('2026-03-30');

      const days1 = daysBetween(date1, date2);
      const days2 = daysBetween(date2, date1);

      expect(days1).toBe(days2);
    });
  });

  describe('Weekend functions', () => {
    it('should identify weekend dates', () => {
      // Saturday, March 28, 2026
      const saturday = new Date('2026-03-28');
      expect(isWeekend(saturday)).toBe(true);

      // Sunday, March 29, 2026
      const sunday = new Date('2026-03-29');
      expect(isWeekend(sunday)).toBe(true);
    });

    it('should identify weekday dates', () => {
      // Monday, March 23, 2026
      const monday = new Date('2026-03-23');
      expect(isWeekday(monday)).toBe(true);

      // Wednesday, March 25, 2026
      const wednesday = new Date('2026-03-25');
      expect(isWeekday(wednesday)).toBe(true);
    });
  });

  describe('Business day functions', () => {
    it('should get next business day from weekday', () => {
      // Monday, March 23, 2026
      const monday = new Date('2026-03-23');
      const nextDay = getNextBusinessDay(monday);

      expect(isWeekday(nextDay)).toBe(true);
      expect(daysBetween(monday, nextDay)).toBe(1);
    });

    it('should skip weekends when getting next business day', () => {
      // Friday, March 27, 2026
      const friday = new Date('2026-03-27');
      const nextDay = getNextBusinessDay(friday);

      // Should be Monday, March 30
      expect(nextDay.getDay()).toBe(1); // Monday
    });

    it('should get previous business day', () => {
      // Wednesday, March 25, 2026
      const wednesday = new Date('2026-03-25');
      const prevDay = getPreviousBusinessDay(wednesday);

      expect(isWeekday(prevDay)).toBe(true);
      expect(daysBetween(prevDay, wednesday)).toBe(1);
    });
  });

  describe('Time utilities', () => {
    it('should convert time string to minutes', () => {
      expect(timeStringToMinutes('09:00')).toBe(540); // 9 * 60
      expect(timeStringToMinutes('14:30')).toBe(870); // 14 * 60 + 30
      expect(timeStringToMinutes('23:59')).toBe(1439);
    });

    it('should return null for invalid time strings', () => {
      expect(timeStringToMinutes('25:00')).toBeNull();
      expect(timeStringToMinutes('12:60')).toBeNull();
      expect(timeStringToMinutes('invalid')).toBeNull();
    });

    it('should convert minutes to time string', () => {
      expect(minutesToTimeString(540)).toBe('09:00'); // 9 * 60
      expect(minutesToTimeString(870)).toBe('14:30'); // 14 * 60 + 30
      expect(minutesToTimeString(0)).toBe('00:00');
    });

    it('should detect overlapping time slots', () => {
      // 09:00-10:00 overlaps with 09:30-10:30
      expect(timeSlotOverlaps('09:00', '10:00', '09:30', '10:30')).toBe(true);

      // 09:00-10:00 does not overlap with 10:00-11:00
      expect(timeSlotOverlaps('09:00', '10:00', '10:00', '11:00')).toBe(false);

      // 09:00-10:00 does not overlap with 10:30-11:30
      expect(timeSlotOverlaps('09:00', '10:00', '10:30', '11:30')).toBe(false);
    });
  });

  describe('Booking window validation', () => {
    it('should validate booking within window', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Most dates should be within default window (1-90 days)
      const valid = isWithinBookingWindow(tomorrow, {
        minDaysInAdvance: 1,
        maxDaysInAdvance: 90,
      });

      expect(valid).toBe(true);
    });

    it('should reject bookings too soon', () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const valid = isWithinBookingWindow(today, {
        minDaysInAdvance: 1,
        maxDaysInAdvance: 90,
      });

      expect(valid).toBe(false);
    });

    it('should reject bookings too far in the future', () => {
      const farFuture = new Date();
      farFuture.setDate(farFuture.getDate() + 100);

      const valid = isWithinBookingWindow(farFuture, {
        maxDaysInAdvance: 90,
      });

      expect(valid).toBe(false);
    });
  });

  describe('formatDatePT', () => {
    it('should format date in Portuguese locale', () => {
      const date = new Date('2026-03-23');
      const formatted = formatDatePT(date);

      expect(formatted).toContain('23');
      expect(formatted.toLowerCase()).toContain('março'); // March in Portuguese
      expect(formatted).toContain('2026');
    });
  });

  describe('Date range validation', () => {
    it('should validate correct date ranges', () => {
      const startDate = new Date('2026-03-23');
      const endDate = new Date('2026-03-30');

      const valid = isValidDateRange(startDate, endDate);
      expect(valid).toBe(true);
    });

    it('should reject reversed date ranges', () => {
      const startDate = new Date('2026-03-30');
      const endDate = new Date('2026-03-23');

      const valid = isValidDateRange(startDate, endDate);
      expect(valid).toBe(false);
    });

    it('should respect maxDaysRange option', () => {
      const startDate = new Date('2026-03-23');
      const endDate = new Date('2026-06-23');

      // 92 days range
      const valid = isValidDateRange(startDate, endDate, {
        maxDaysRange: 90,
      });

      expect(valid).toBe(false);
    });
  });

  describe('Available time slots', () => {
    it('should generate available time slots', () => {
      const slots = getAvailableTimeSlots({
        slotDurationMinutes: 30,
        startHour: 9,
        endHour: 11,
        excludeLunch: false,
      });

      expect(slots).toContain('09:00');
      expect(slots).toContain('09:30');
      expect(slots).toContain('10:00');
      expect(slots).toContain('10:30');
      expect(slots.length).toBe(4);
    });

    it('should exclude lunch break when specified', () => {
      const slots = getAvailableTimeSlots({
        slotDurationMinutes: 60,
        startHour: 11,
        endHour: 14,
        excludeLunch: true,
      });

      // Should skip 12:00 (lunch)
      expect(slots).not.toContain('12:00');
      expect(slots).toContain('11:00');
      expect(slots).toContain('13:00');
    });
  });
});
