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
  date?: Date;
  time?: string;
}

interface BookingContextType {
  bookingData: BookingData;
  setService: (service: BookingData['service']) => void;
  setTherapist: (therapist: BookingData['therapist']) => void;
  setDateTime: (date: Date, time: string) => void;
  resetBooking: () => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [bookingData, setBookingData] = useState<BookingData>({});

  const setService = (service: BookingData['service']) => {
    setBookingData(prev => ({ ...prev, service }));
  };

  const setTherapist = (therapist: BookingData['therapist']) => {
    setBookingData(prev => ({ ...prev, therapist }));
  };

  const setDateTime = (date: Date, time: string) => {
    setBookingData(prev => ({ ...prev, date, time }));
  };

  const resetBooking = () => {
    setBookingData({});
  };

  return (
    <BookingContext.Provider value={{ bookingData, setService, setTherapist, setDateTime, resetBooking }}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within BookingProvider');
  }
  return context;
};
