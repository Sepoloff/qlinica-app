'use strict';

import { useState, useCallback } from 'react';

export interface AvailableSlot {
  time: string;
  available: boolean;
  therapistName?: string;
}

export interface DateTimeSelection {
  selectedDate: string;
  selectedTime: string;
  selectedSlot: AvailableSlot | null;
}

const TIME_SLOTS = [
  '09:00',
  '09:30',
  '10:00',
  '10:30',
  '11:00',
  '11:30',
  '14:00',
  '14:30',
  '15:00',
  '15:30',
  '16:00',
  '16:30',
  '17:00',
  '17:30',
];

const getMinDate = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow;
};

const getMaxDate = () => {
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 60); // 60 days in advance
  return maxDate;
};

const isWeekend = (date: Date): boolean => {
  const day = date.getDay();
  return day === 0 || day === 6; // 0 = Sunday, 6 = Saturday
};

const isHoliday = (date: Date): boolean => {
  // Portuguese public holidays (hardcoded for simplicity)
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  const holidays = [
    [1, 1], // New Year
    [2, 13], // Carnival
    [4, 25], // Liberty Day
    [5, 1], // Labour Day
    [6, 10], // Camões Day
    [8, 15], // Assumption
    [10, 5], // Republic Day
    [11, 1], // All Saints' Day
    [12, 1], // Independence Day
    [12, 8], // Immaculate Conception
    [12, 25], // Christmas
  ];

  return holidays.some(([m, d]) => month === m && day === d);
};

export const useDateTimeSelection = (availableSlots?: AvailableSlot[]) => {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);

  const getAvailableSlotsForDate = useCallback(
    (dateString: string): AvailableSlot[] => {
      if (availableSlots) {
        return availableSlots;
      }

      // Default: all time slots available unless weekend/holiday
      const date = new Date(dateString);
      const isWeekendOrHoliday = isWeekend(date) || isHoliday(date);

      return TIME_SLOTS.map((time) => ({
        time,
        available: !isWeekendOrHoliday,
      }));
    },
    [availableSlots]
  );

  const selectDate = useCallback((date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    setSelectedDate(dateString);
    setSelectedTime('');
    setSelectedSlot(null);
  }, []);

  const selectTime = useCallback(
    (time: string) => {
      setSelectedTime(time);
      const slot = getAvailableSlotsForDate(selectedDate).find((s) => s.time === time);
      if (slot) {
        setSelectedSlot(slot);
      }
    },
    [selectedDate, getAvailableSlotsForDate]
  );

  const isDateValid = useCallback((date: Date): boolean => {
    if (isWeekend(date) || isHoliday(date)) {
      return false;
    }
    return true;
  }, []);

  const formatDateForDisplay = (dateString: string): string => {
    const date = new Date(`${dateString}T00:00:00`);
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    return date.toLocaleDateString('pt-PT', options);
  };

  const getDateDisabledStatus = useCallback((date: Date): boolean => {
    return !isDateValid(date);
  }, [isDateValid]);

  const reset = useCallback(() => {
    setSelectedDate('');
    setSelectedTime('');
    setSelectedSlot(null);
  }, []);

  return {
    selectedDate,
    selectedTime,
    selectedSlot,
    selectDate,
    selectTime,
    reset,
    getAvailableSlotsForDate,
    isDateValid,
    formatDateForDisplay,
    getDateDisabledStatus,
    minDate: getMinDate(),
    maxDate: getMaxDate(),
    isComplete: !!selectedDate && !!selectedTime,
  };
};
