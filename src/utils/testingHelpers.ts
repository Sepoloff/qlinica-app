/**
 * Testing Helpers & Mock Data
 * Utilities for testing and development
 */

import { Booking } from '../services/bookingService';

/**
 * Mock user data for testing
 */
export const mockUsers = {
  valid: {
    id: '1',
    email: 'test@example.com',
    password: 'TestPassword123',
    name: 'Test User',
    phone: '+351912345678',
  },
  invalid: {
    invalidEmail: {
      email: 'invalid-email',
      password: 'ValidPassword123',
      name: 'Invalid Email',
    },
    weakPassword: {
      email: 'test@example.com',
      password: 'weak',
      name: 'Weak Password User',
    },
    noName: {
      email: 'test@example.com',
      password: 'ValidPassword123',
      name: '',
    },
  },
};

/**
 * Mock services data
 */
export const mockServices = [
  {
    id: 1,
    name: 'Massagem Terapêutica',
    icon: '💆',
    description: 'Sessão de massagem relaxante',
    price: '60.00',
    duration: '60 min',
    category: 'Massage',
  },
  {
    id: 2,
    name: 'Fisioterapia',
    icon: '🏥',
    description: 'Sessão de fisioterapia',
    price: '75.00',
    duration: '45 min',
    category: 'Therapy',
  },
  {
    id: 3,
    name: 'Acupuntura',
    icon: '🧬',
    description: 'Tratamento com acupuntura',
    price: '50.00',
    duration: '30 min',
    category: 'Alternative',
  },
];

/**
 * Mock therapists data
 */
export const mockTherapists = [
  {
    id: 1,
    name: 'Dr. João Silva',
    specialty: 'Massagem Terapêutica',
    rating: 4.8,
    avatar: '👨‍⚕️',
    yearsExperience: 10,
    bio: 'Especialista em massagem terapêutica com 10 anos de experiência',
  },
  {
    id: 2,
    name: 'Dr. Maria Santos',
    specialty: 'Fisioterapia',
    rating: 4.9,
    avatar: '👩‍⚕️',
    yearsExperience: 8,
    bio: 'Fisioterapeuta certificada com especialização em reabilitação',
  },
  {
    id: 3,
    name: 'Dr. Pedro Costa',
    specialty: 'Acupuntura',
    rating: 4.7,
    avatar: '👨‍⚕️',
    yearsExperience: 12,
    bio: 'Acupuntor tradicional com certificação internacional',
  },
];

/**
 * Mock bookings data
 */
export const mockBookings = {
  upcoming: {
    id: 'book_1',
    serviceId: '1',
    serviceName: 'Massagem Terapêutica',
    therapistId: '1',
    therapistName: 'Dr. João Silva',
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    time: '10:00',
    duration: 60,
    price: 60.0,
    status: 'confirmed' as const,
    notes: 'Sessão de relaxamento completo',
    createdAt: new Date().toISOString(),
  } as Booking,
  past: {
    id: 'book_2',
    serviceId: '2',
    serviceName: 'Fisioterapia',
    therapistId: '2',
    therapistName: 'Dr. Maria Santos',
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    time: '14:00',
    duration: 45,
    price: 75.0,
    status: 'completed' as const,
    notes: 'Fisioterapia de recuperação',
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
  } as Booking,
};

/**
 * Delay utility for simulating network requests
 */
export const delay = (ms: number = 1000): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Random error for testing error scenarios
 */
export const randomError = (probability: number = 0.1): Error | null => {
  if (Math.random() < probability) {
    const errors = [
      new Error('Network error'),
      new Error('Server error'),
      new Error('Invalid credentials'),
      new Error('Session expired'),
    ];
    return errors[Math.floor(Math.random() * errors.length)];
  }
  return null;
};

/**
 * Validate test data
 */
export const validateTestData = {
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  isValidPassword: (password: string): boolean => {
    return password.length >= 8 && /[A-Z]/.test(password) && /\d/.test(password);
  },

  isValidPhone: (phone: string): boolean => {
    const phoneRegex = /^(?:\+351\s?)?9\d{8}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  },

  isValidDate: (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today;
  },
};

/**
 * Generate random test data
 */
export const generateTestData = {
  email: (): string => {
    return `test_${Date.now()}@example.com`;
  },

  phone: (): string => {
    const number = Math.floor(900000000 + Math.random() * 99999999);
    return `+351${number}`;
  },

  bookingId: (): string => {
    return `book_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },

  date: (daysFromNow: number = 1): Date => {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    return date;
  },

  time: (): string => {
    const hours = String(Math.floor(Math.random() * 8 + 9)).padStart(2, '0');
    const minutes = String(Math.floor(Math.random() * 60)).padStart(2, '0');
    return `${hours}:${minutes}`;
  },

  name: (): string => {
    const firstNames = ['João', 'Maria', 'Pedro', 'Ana', 'Carlos', 'Sofia'];
    const lastNames = ['Silva', 'Santos', 'Costa', 'Oliveira', 'Ferreira', 'Sousa'];
    return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${
      lastNames[Math.floor(Math.random() * lastNames.length)]
    }`;
  },
};

/**
 * Mock API responses
 */
export const mockApiResponses = {
  loginSuccess: {
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    user: mockUsers.valid,
  },

  servicesSuccess: {
    data: mockServices,
  },

  therapistsSuccess: {
    data: mockTherapists,
  },

  bookingSuccess: {
    ...mockBookings.upcoming,
  },

  bookingsSuccess: {
    data: [mockBookings.upcoming, mockBookings.past],
  },

  errorResponse: {
    error: {
      message: 'An error occurred',
      code: 'UNKNOWN_ERROR',
    },
  },

  unauthorizedResponse: {
    error: {
      message: 'Unauthorized',
      code: 'UNAUTHORIZED',
    },
  },

  validationErrorResponse: {
    error: {
      message: 'Validation failed',
      code: 'VALIDATION_ERROR',
      fields: {
        email: 'Invalid email format',
      },
    },
  },
};

/**
 * Test data builders
 */
export const buildTestData = {
  user: (overrides?: Partial<typeof mockUsers.valid>) => ({
    ...mockUsers.valid,
    ...overrides,
  }),

  service: (overrides?: Record<string, any>) => ({
    ...mockServices[0],
    ...overrides,
  }),

  therapist: (overrides?: Record<string, any>) => ({
    ...mockTherapists[0],
    ...overrides,
  }),

  booking: (overrides?: Record<string, any>) => ({
    ...mockBookings.upcoming,
    ...overrides,
  }),
};

/**
 * Performance measurement utility
 */
export const performanceMetrics = {
  startTimer: (): (() => number) => {
    const start = Date.now();
    return () => Date.now() - start;
  },

  measureFunction: async <T>(fn: () => Promise<T>): Promise<{ result: T; duration: number }> => {
    const start = Date.now();
    const result = await fn();
    const duration = Date.now() - start;
    return { result, duration };
  },
};

/**
 * Assertion helpers
 */
export const assertions = {
  isValidBooking: (booking: any): boolean => {
    return (
      booking.id &&
      booking.serviceId &&
      booking.therapistId &&
      booking.date &&
      booking.time &&
      booking.price >= 0 &&
      ['pending', 'confirmed', 'completed', 'cancelled'].includes(booking.status)
    );
  },

  isValidUser: (user: any): boolean => {
    return (
      user.id &&
      user.email &&
      user.name &&
      validateTestData.isValidEmail(user.email)
    );
  },

  isValidService: (service: any): boolean => {
    return (
      service.id &&
      service.name &&
      service.price >= 0 &&
      service.duration
    );
  },

  isValidTherapist: (therapist: any): boolean => {
    return (
      therapist.id &&
      therapist.name &&
      therapist.specialty &&
      therapist.rating >= 0 &&
      therapist.rating <= 5
    );
  },
};
