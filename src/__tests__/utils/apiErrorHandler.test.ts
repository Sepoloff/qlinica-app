import { parseAPIError, isRetryableError, isAuthError, getUserErrorMessage } from '../../utils/apiErrorHandler';
import { MESSAGES } from '../../constants/Messages';

describe('API Error Handler', () => {
  describe('parseAPIError', () => {
    it('should handle network timeout', () => {
      const error = { code: 'ECONNABORTED' };
      const result = parseAPIError(error);
      expect(result.code).toBe('TIMEOUT');
      expect(result.message).toBe(MESSAGES.NETWORK.TIMEOUT);
      expect(result.statusCode).toBe(408);
    });

    it('should handle no internet error', () => {
      const error = { response: null, message: 'Network Error' };
      const result = parseAPIError(error);
      expect(result.code).toBe('NO_NETWORK');
      expect(result.message).toBe(MESSAGES.NETWORK.NO_CONNECTION);
    });

    it('should handle 401 unauthorized', () => {
      const error = {
        response: {
          status: 401,
          data: { message: 'Token expired' },
        },
      };
      const result = parseAPIError(error);
      expect(result.code).toBe('UNAUTHORIZED');
      expect(result.message).toBe(MESSAGES.AUTH.SESSION_EXPIRED);
    });

    it('should handle 429 rate limit', () => {
      const error = {
        response: {
          status: 429,
          data: {},
        },
      };
      const result = parseAPIError(error);
      expect(result.code).toBe('RATE_LIMIT');
      expect(result.message).toContain('aguarde');
    });

    it('should handle 500 server error', () => {
      const error = {
        response: {
          status: 500,
          data: {},
        },
      };
      const result = parseAPIError(error);
      expect(result.code).toBe('SERVER_ERROR');
      expect(result.message).toBe(MESSAGES.NETWORK.SERVER_ERROR);
    });

    it('should handle custom API error message', () => {
      const error = {
        response: {
          status: 400,
          data: { message: 'Custom error message' },
        },
      };
      const result = parseAPIError(error);
      expect(result.message).toBe('Custom error message');
    });
  });

  describe('isRetryableError', () => {
    it('should return true for timeout', () => {
      const error = parseAPIError({ code: 'ECONNABORTED' });
      expect(isRetryableError(error)).toBe(true);
    });

    it('should return true for network errors', () => {
      const error = parseAPIError({ response: null, message: 'Network Error' });
      expect(isRetryableError(error)).toBe(true);
    });

    it('should return true for 5xx errors', () => {
      const error = {
        code: 'SERVER_ERROR',
        message: 'Server error',
        statusCode: 500,
      };
      expect(isRetryableError(error)).toBe(true);
    });

    it('should return false for 401 unauthorized', () => {
      const error = parseAPIError({
        response: { status: 401, data: {} },
      });
      expect(isRetryableError(error)).toBe(false);
    });
  });

  describe('isAuthError', () => {
    it('should return true for unauthorized error', () => {
      const error = parseAPIError({
        response: { status: 401, data: {} },
      });
      expect(isAuthError(error)).toBe(true);
    });

    it('should return true for forbidden error (403)', () => {
      const error = parseAPIError({
        response: { status: 403, data: {} },
      });
      expect(isAuthError(error)).toBe(true); // 403 is treated as authorization error
    });

    it('should return false for other errors', () => {
      const error = parseAPIError({
        response: { status: 400, data: {} },
      });
      expect(isAuthError(error)).toBe(false);
    });
  });

  describe('getUserErrorMessage', () => {
    it('should return user-friendly message for network error', () => {
      const error = { response: null, message: 'Network Error' };
      const message = getUserErrorMessage(error);
      expect(message).toBe(MESSAGES.NETWORK.NO_CONNECTION);
    });

    it('should return user-friendly message for auth error', () => {
      const error = {
        response: { status: 401, data: {} },
      };
      const message = getUserErrorMessage(error);
      expect(message).toBe(MESSAGES.AUTH.SESSION_EXPIRED);
    });
  });
});
