import { BOOKINGS, SERVICES, THERAPISTS } from '../constants/Data';
import { Booking, Service, Therapist } from '../services/bookingService';

/**
 * Convert mock booking data to proper Booking type
 */
export const convertMockBooking = (mockBooking: typeof BOOKINGS[0], userId?: string): Booking => {
  const date = mockBooking.date;
  const [day, month, year] = date.split(' ');
  const monthMap: Record<string, string> = {
    'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
    'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
    'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
  };
  const formattedDate = `2026-${monthMap[month] || '03'}-${day.padStart(2, '0')}`;

  return {
    id: String(mockBooking.id),
    userId: userId || 'guest',
    serviceId: String(mockBooking.id),
    therapistId: String(mockBooking.id),
    date: formattedDate,
    time: mockBooking.time,
    status: mockBooking.status === 'upcoming' ? 'confirmed' : 
            mockBooking.status === 'past' ? 'completed' :
            mockBooking.status === 'cancelled' ? 'cancelled' : 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

/**
 * Convert mock service data to proper Service type
 */
export const convertMockService = (mockService: typeof SERVICES[0]): Service => {
  const durationMin = parseInt(mockService.duration);
  const priceNum = parseFloat(mockService.price);
  
  return {
    id: String(mockService.id),
    name: mockService.name,
    description: mockService.desc,
    duration: durationMin,
    price: priceNum,
    icon: mockService.icon,
  };
};

/**
 * Convert mock therapist data to proper Therapist type
 */
export const convertMockTherapist = (mockTherapist: typeof THERAPISTS[0]): Therapist => {
  return {
    id: String(mockTherapist.id),
    name: mockTherapist.name,
    specialty: mockTherapist.specialty,
    rating: mockTherapist.rating,
    reviews: mockTherapist.reviews,
    available: mockTherapist.available,
    avatar: mockTherapist.avatar,
    phone: '+351 912 345 678',
    email: 'therapist@qlinica.pt',
  };
};

/**
 * Convert all mock bookings
 */
export const convertMockBookings = (userId?: string): Booking[] => {
  return BOOKINGS.map(b => convertMockBooking(b, userId));
};

/**
 * Convert all mock services
 */
export const convertMockServices = (): Service[] => {
  return SERVICES.map(convertMockService);
};

/**
 * Convert all mock therapists
 */
export const convertMockTherapists = (): Therapist[] => {
  return THERAPISTS.map(convertMockTherapist);
};
