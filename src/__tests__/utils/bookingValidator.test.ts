import {
  validateService,
  validateTherapist,
  validateBookingDate,
  validateBookingTime,
  validateContactInfo,
  validateCompleteBooking,
  getValidationMessage,
  isValidAppointmentDateTime,
} from '../../utils/bookingValidator';

describe('bookingValidator', () => {
  describe('validateService', () => {
    it('should fail when service ID is missing', () => {
      const result = validateService(undefined, 'Massage');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Serviço é obrigatório');
    });

    it('should fail when service name is missing', () => {
      const result = validateService('1', '');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Nome do serviço é obrigatório');
    });

    it('should pass with valid service data', () => {
      const result = validateService('1', 'Massage');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('validateTherapist', () => {
    it('should fail when therapist ID is missing', () => {
      const result = validateTherapist(undefined, 'John Doe', 4.5);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Terapeuta é obrigatório');
    });

    it('should fail when therapist name is missing', () => {
      const result = validateTherapist('1', '', 4.5);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Nome do terapeuta é obrigatório');
    });

    it('should warn when rating is low', () => {
      const result = validateTherapist('1', 'John Doe', 2.5);
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it('should pass with valid therapist data', () => {
      const result = validateTherapist('1', 'John Doe', 4.5);
      expect(result.valid).toBe(true);
    });
  });

  describe('validateBookingDate', () => {
    it('should fail when date is missing', () => {
      const result = validateBookingDate('');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Data é obrigatória');
    });

    it('should fail with invalid date format', () => {
      const result = validateBookingDate('2026/03/23'); // Wrong format
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Formato de data inválido. Use DD/MM/YYYY ou YYYY-MM-DD');
    });

    it('should fail when date is in the past', () => {
      const result = validateBookingDate('01/01/2020');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('A data não pode estar no passado');
    });

    it('should pass with valid future date DD/MM/YYYY format', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);
      const dateStr = `${String(futureDate.getDate()).padStart(2, '0')}/${String(futureDate.getMonth() + 1).padStart(2, '0')}/${futureDate.getFullYear()}`;
      
      const result = validateBookingDate(dateStr);
      expect(result.valid).toBe(true);
    });

    it('should pass with valid future date YYYY-MM-DD format', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);
      const dateStr = futureDate.toISOString().split('T')[0];
      
      const result = validateBookingDate(dateStr);
      expect(result.valid).toBe(true);
    });

    it('should warn when booking is very far in the future', () => {
      const farFutureDate = new Date();
      farFutureDate.setMonth(farFutureDate.getMonth() + 7); // More than 6 months
      const dateStr = `${String(farFutureDate.getDate()).padStart(2, '0')}/${String(farFutureDate.getMonth() + 1).padStart(2, '0')}/${farFutureDate.getFullYear()}`;
      
      const result = validateBookingDate(dateStr);
      expect(result.warnings.length).toBeGreaterThan(0);
    });
  });

  describe('validateBookingTime', () => {
    it('should fail when time is missing', () => {
      const result = validateBookingTime('');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Horário é obrigatório');
    });

    it('should fail with invalid time format', () => {
      const result = validateBookingTime('14:30:00'); // Wrong format
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Formato de hora inválido. Use HH:MM (ex: 14:30)');
    });

    it('should fail with invalid hour', () => {
      const result = validateBookingTime('25:30');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Hora inválida (deve ser entre 00 e 23)');
    });

    it('should fail with invalid minute', () => {
      const result = validateBookingTime('14:75');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Minutos inválidos (deve ser entre 00 e 59)');
    });

    it('should pass with valid time', () => {
      const result = validateBookingTime('14:30');
      expect(result.valid).toBe(true);
    });

    it('should warn for early morning times', () => {
      const result = validateBookingTime('08:30');
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it('should warn for late evening times', () => {
      const result = validateBookingTime('18:30');
      expect(result.warnings.length).toBeGreaterThan(0);
    });
  });

  describe('validateContactInfo', () => {
    it('should fail with invalid email', () => {
      const result = validateContactInfo('invalid-email', undefined);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Email inválido');
    });

    it('should fail with invalid phone', () => {
      const result = validateContactInfo(undefined, '123');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Telefone inválido. Use formato português: 912345678 ou +351912345678');
    });

    it('should pass with valid email and phone', () => {
      const result = validateContactInfo('user@example.com', '912345678');
      expect(result.valid).toBe(true);
    });

    it('should pass with no contact info', () => {
      const result = validateContactInfo(undefined, undefined);
      expect(result.valid).toBe(true);
    });
  });

  describe('validateCompleteBooking', () => {
    it('should fail with incomplete data', () => {
      const result = validateCompleteBooking({
        serviceId: '1',
        // Missing therapist, date, time
      });
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should pass with complete valid data', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);
      const dateStr = `${String(futureDate.getDate()).padStart(2, '0')}/${String(futureDate.getMonth() + 1).padStart(2, '0')}/${futureDate.getFullYear()}`;

      const result = validateCompleteBooking({
        serviceId: '1',
        serviceName: 'Massage',
        therapistId: '1',
        therapistName: 'John Doe',
        therapistRating: 4.5,
        date: dateStr,
        time: '14:30',
      });
      expect(result.valid).toBe(true);
    });
  });

  describe('getValidationMessage', () => {
    it('should return success message for valid result', () => {
      const result = { valid: true, errors: [], warnings: [] };
      const message = getValidationMessage(result);
      expect(message).toContain('sucesso');
    });

    it('should return first error message', () => {
      const result = { valid: false, errors: ['Error 1', 'Error 2'], warnings: [] };
      const message = getValidationMessage(result);
      expect(message).toBe('Error 1');
    });

    it('should return first warning if no errors', () => {
      const result = { valid: false, errors: [], warnings: ['Warning 1'] };
      const message = getValidationMessage(result);
      expect(message).toBe('Warning 1');
    });
  });

  describe('isValidAppointmentDateTime', () => {
    it('should fail with invalid date', () => {
      const result = isValidAppointmentDateTime('invalid', '14:30');
      expect(result.valid).toBe(false);
      expect(result.reason).toBeDefined();
    });

    it('should fail with invalid time', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);
      const dateStr = `${String(futureDate.getDate()).padStart(2, '0')}/${String(futureDate.getMonth() + 1).padStart(2, '0')}/${futureDate.getFullYear()}`;
      
      const result = isValidAppointmentDateTime(dateStr, 'invalid');
      expect(result.valid).toBe(false);
      expect(result.reason).toBeDefined();
    });

    it('should pass with valid date and time', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);
      const dateStr = `${String(futureDate.getDate()).padStart(2, '0')}/${String(futureDate.getMonth() + 1).padStart(2, '0')}/${futureDate.getFullYear()}`;
      
      const result = isValidAppointmentDateTime(dateStr, '14:30');
      expect(result.valid).toBe(true);
    });
  });
});
