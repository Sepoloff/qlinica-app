'use strict';

import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface BookingData {
  service?: {
    id: number;
    name: string;
    icon: string;
    desc: string;
    duration: string;
    price: string;
  };
  therapist?: {
    id: number;
    name: string;
    specialty: string;
    rating: number;
    reviews: number;
    available: boolean;
    avatar: string;
  };
  date?: string; // Format: "DD/MM/YYYY"
  time?: string; // Format: "HH:MM"
  isReschedule?: boolean;
  originalBookingId?: string;
}

interface BookingContextType {
  bookingData: BookingData;
  setService: (service: BookingData['service']) => void;
  setTherapist: (therapist: BookingData['therapist']) => void;
  setDateTime: (date: string, time: string) => void;
  setRescheduleMode: (bookingId: string) => void;
  resetBooking: () => void;
  isComplete: () => boolean;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

const initialState: BookingData = {};

export const BookingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [bookingData, setBookingData] = useState<BookingData>(initialState);

  const setService = (service: BookingData['service']) => {
    setBookingData(prev => ({ ...prev, service }));
  };

  const setTherapist = (therapist: BookingData['therapist']) => {
    setBookingData(prev => ({ ...prev, therapist }));
  };

  const setDateTime = (date: string, time: string) => {
    setBookingData(prev => ({ ...prev, date, time }));
  };

  const setRescheduleMode = (bookingId: string) => {
    setBookingData(prev => ({ 
      ...prev, 
      isReschedule: true,
      originalBookingId: bookingId
    }));
  };

  const resetBooking = () => {
    setBookingData(initialState);
  };

  const isComplete = (): boolean => {
    return !!(bookingData.service && bookingData.therapist && bookingData.date && bookingData.time);
  };

  const value: BookingContextType = {
    bookingData,
    setService,
    setTherapist,
    setDateTime,
    setRescheduleMode,
    resetBooking,
    isComplete,
  };

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = (): BookingContextType => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within BookingProvider');
  }
  return context;
};
