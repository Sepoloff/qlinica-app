import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  Timestamp,
  QueryConstraint,
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface Booking {
  id?: string;
  userId: string;
  serviceId: string;
  serviceName: string;
  therapistId: string;
  therapistName: string;
  date: Date | Timestamp;
  time: string;
  location: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  createdAt?: Date | Timestamp;
}

/**
 * Criar novo agendamento
 */
export async function createBooking(
  userId: string,
  booking: Omit<Booking, 'userId' | 'createdAt'>
): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, 'bookings'), {
      ...booking,
      userId,
      createdAt: Timestamp.now(),
      date: booking.date instanceof Date 
        ? Timestamp.fromDate(booking.date)
        : booking.date,
    });
    return docRef.id;
  } catch (error) {
    console.error('Erro ao criar agendamento:', error);
    throw error;
  }
}

/**
 * Obter agendamentos do utilizador
 */
export async function getUserBookings(userId: string): Promise<Booking[]> {
  try {
    const q = query(
      collection(db, 'bookings'),
      where('userId', '==', userId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Booking[];
  } catch (error) {
    console.error('Erro ao obter agendamentos:', error);
    throw error;
  }
}

/**
 * Obter agendamentos próximos (status: upcoming)
 */
export async function getUpcomingBookings(userId: string): Promise<Booking[]> {
  try {
    const q = query(
      collection(db, 'bookings'),
      where('userId', '==', userId),
      where('status', '==', 'upcoming')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Booking[];
  } catch (error) {
    console.error('Erro ao obter próximos agendamentos:', error);
    throw error;
  }
}

/**
 * Atualizar status de agendamento
 */
export async function updateBookingStatus(
  bookingId: string,
  status: 'upcoming' | 'completed' | 'cancelled'
): Promise<void> {
  try {
    await updateDoc(doc(db, 'bookings', bookingId), { status });
  } catch (error) {
    console.error('Erro ao atualizar agendamento:', error);
    throw error;
  }
}

/**
 * Cancelar agendamento
 */
export async function cancelBooking(bookingId: string): Promise<void> {
  return updateBookingStatus(bookingId, 'cancelled');
}

/**
 * Remarcar agendamento (atualizar data/hora)
 */
export async function rescheduleBooking(
  bookingId: string,
  newDate: Date,
  newTime: string
): Promise<void> {
  try {
    await updateDoc(doc(db, 'bookings', bookingId), {
      date: Timestamp.fromDate(newDate),
      time: newTime,
    });
  } catch (error) {
    console.error('Erro ao remarcar agendamento:', error);
    throw error;
  }
}
