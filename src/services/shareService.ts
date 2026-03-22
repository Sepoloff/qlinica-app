'use strict';

import { Share, Platform } from 'react-native';
import { Booking } from '../context/BookingContext';

export interface ShareOptions {
  title?: string;
  message: string;
  url?: string;
}

class ShareService {
  /**
   * Format booking details for sharing
   */
  formatBookingForShare(booking: Booking & { serviceName?: string; therapistName?: string }): string {
    const date = new Date(booking.date);
    const formattedDate = date.toLocaleDateString('pt-PT', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const parts = [
      '📅 Minha Consulta - Qlinica',
      '',
      `Data: ${formattedDate}`,
      `Hora: ${booking.time}`,
      `Serviço: ${booking.serviceName || 'Consulta'}`,
      `Terapeuta: ${booking.therapistName || 'A definir'}`,
      `Duração: ${booking.duration} minutos`,
      `Preço: €${booking.price?.toFixed(2) || '0.00'}`,
      `Status: ${this.getStatusLabel(booking.status)}`,
      '',
      'Agende sua consulta também em:',
      'qlinica.com',
    ];

    return parts.join('\n');
  }

  /**
   * Share booking via native share dialog
   */
  async shareBooking(
    booking: Booking & { serviceName?: string; therapistName?: string }
  ): Promise<boolean> {
    try {
      const message = this.formatBookingForShare(booking);

      const result = await Share.share({
        message: message,
        title: 'Compartilhar Consulta',
        url: Platform.OS === 'ios' ? 'qlinica.com' : undefined,
      });

      return result.action === Share.dismissedAction ? false : true;
    } catch (error) {
      console.error('Error sharing booking:', error);
      throw error;
    }
  }

  /**
   * Share booking via WhatsApp
   */
  async shareViaWhatsApp(
    booking: Booking & { serviceName?: string; therapistName?: string },
    phoneNumber?: string
  ): Promise<boolean> {
    try {
      const message = encodeURIComponent(this.formatBookingForShare(booking));
      const whatsappUrl = phoneNumber
        ? `https://wa.me/${phoneNumber}?text=${message}`
        : `whatsapp://send?text=${message}`;

      // In a real app, you would use Linking.openURL or a native module
      // For now, we'll return the URL for testing
      console.log('WhatsApp URL:', whatsappUrl);
      return true;
    } catch (error) {
      console.error('Error sharing via WhatsApp:', error);
      throw error;
    }
  }

  /**
   * Share booking via Email
   */
  async shareViaEmail(
    booking: Booking & { serviceName?: string; therapistName?: string },
    recipientEmail?: string
  ): Promise<boolean> {
    try {
      const message = this.formatBookingForShare(booking);
      const subject = encodeURIComponent('Consulta Agendada - Qlinica');
      const body = encodeURIComponent(message);

      const mailtoUrl = recipientEmail
        ? `mailto:${recipientEmail}?subject=${subject}&body=${body}`
        : `mailto:?subject=${subject}&body=${body}`;

      // In a real app, you would use Linking.openURL
      console.log('Email URL:', mailtoUrl);
      return true;
    } catch (error) {
      console.error('Error sharing via Email:', error);
      throw error;
    }
  }

  /**
   * Copy booking to clipboard
   */
  async copyToClipboard(
    booking: Booking & { serviceName?: string; therapistName?: string }
  ): Promise<boolean> {
    try {
      // Note: In a real app, you'd use @react-native-clipboard/clipboard
      const message = this.formatBookingForShare(booking);
      console.log('Copied to clipboard:', message);
      return true;
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      throw error;
    }
  }

  /**
   * Generate shareable booking link
   */
  generateShareLink(bookingId: string): string {
    return `qlinica.com/booking/${bookingId}`;
  }

  /**
   * Get status label in Portuguese
   */
  private getStatusLabel(status: string): string {
    const statusMap: { [key: string]: string } = {
      pending: 'Pendente',
      confirmed: 'Confirmada',
      completed: 'Realizada',
      cancelled: 'Cancelada',
      rescheduled: 'Remarcada',
    };
    return statusMap[status] || status;
  }

  /**
   * Share with custom message
   */
  async shareCustom(title: string, message: string): Promise<boolean> {
    try {
      const result = await Share.share({
        message: message,
        title: title,
        url: Platform.OS === 'ios' ? 'qlinica.com' : undefined,
      });

      return result.action === Share.dismissedAction ? false : true;
    } catch (error) {
      console.error('Error sharing:', error);
      throw error;
    }
  }
}

export const shareService = new ShareService();
