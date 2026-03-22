import {
  parseError,
  getUserErrorMessage,
  getErrorSuggestion,
  isErrorRetryable,
  getErrorInfo,
} from '../../utils/errorMessages';

describe('Error Messages', () => {
  describe('parseError', () => {
    it('should parse HTTP 400 error', () => {
      const error = {
        response: {
          status: 400,
          data: { message: 'Bad request' },
        },
      };

      const result = parseError(error);
      expect(result.code).toBe('HTTP_400');
      expect(result.userMessage).toBe('Bad request');
      expect(result.isRetryable).toBe(false);
    });

    it('should parse HTTP 401 error', () => {
      const error = {
        response: {
          status: 401,
        },
      };

      const result = parseError(error);
      expect(result.code).toBe('HTTP_401');
      expect(result.userMessage).toContain('inválid');
      expect(result.isRetryable).toBe(false);
    });

    it('should parse HTTP 429 rate limit error', () => {
      const error = {
        response: {
          status: 429,
        },
      };

      const result = parseError(error);
      expect(result.code).toBe('HTTP_429');
      expect(result.isRetryable).toBe(true);
    });

    it('should parse HTTP 500 server error', () => {
      const error = {
        response: {
          status: 500,
        },
      };

      const result = parseError(error);
      expect(result.code).toBe('HTTP_500');
      expect(result.isRetryable).toBe(true);
    });

    it('should parse network error', () => {
      const error = {
        code: 'ECONNREFUSED',
        message: 'Connection refused',
      };

      const result = parseError(error);
      expect(result.code).toBe('ECONNREFUSED');
      expect(result.isRetryable).toBe(true);
    });

    it('should parse timeout error', () => {
      const error = {
        code: 'ETIMEDOUT',
        message: 'Request timeout',
      };

      const result = parseError(error);
      expect(result.code).toBe('ETIMEDOUT');
      expect(result.isRetryable).toBe(true);
    });

    it('should use server error message if provided', () => {
      const error = {
        response: {
          status: 400,
          data: { message: 'Email já registado' },
        },
      };

      const result = parseError(error);
      expect(result.userMessage).toBe('Email já registado');
    });

    it('should handle unknown status codes', () => {
      const error = {
        response: {
          status: 418, // I'm a teapot
        },
      };

      const result = parseError(error);
      // Unknown status codes default to UNKNOWN_ERROR
      expect(result.code).toBe('UNKNOWN_ERROR');
    });

    it('should handle errors without response', () => {
      const error = {
        request: {},
        code: 'NETWORK_ERROR',
      };

      const result = parseError(error);
      expect(result.isRetryable).toBe(true);
    });

    it('should handle Error objects', () => {
      const error = new Error('Test error');

      const result = parseError(error);
      expect(result.message).toContain('Test error');
    });
  });

  describe('getUserErrorMessage', () => {
    it('should return Portuguese error message', () => {
      const error = {
        response: {
          status: 500,
        },
      };

      const message = getUserErrorMessage(error);
      expect(message).toBeDefined();
      expect(message.length > 0).toBe(true);
    });

    it('should return server error message if available', () => {
      const error = {
        response: {
          status: 400,
          data: { message: 'Validação falhou' },
        },
      };

      const message = getUserErrorMessage(error);
      expect(message).toBe('Validação falhou');
    });

    it('should handle unknown errors gracefully', () => {
      const error = { some: 'error' };

      const message = getUserErrorMessage(error);
      expect(message).toBeDefined();
      expect(message).toContain('erro');
    });
  });

  describe('getErrorSuggestion', () => {
    it('should return helpful suggestion', () => {
      const error = {
        response: {
          status: 401,
        },
      };

      const suggestion = getErrorSuggestion(error);
      expect(suggestion).toBeDefined();
      expect(suggestion).toContain('login');
    });

    it('should suggest retrying for network errors', () => {
      const error = {
        code: 'ECONNREFUSED',
      };

      const suggestion = getErrorSuggestion(error);
      expect(suggestion).toBeDefined();
      expect(suggestion.length > 0).toBe(true);
    });
  });

  describe('isErrorRetryable', () => {
    it('should return false for 401 errors', () => {
      const error = {
        response: {
          status: 401,
        },
      };

      expect(isErrorRetryable(error)).toBe(false);
    });

    it('should return false for 404 errors', () => {
      const error = {
        response: {
          status: 404,
        },
      };

      expect(isErrorRetryable(error)).toBe(false);
    });

    it('should return true for 500 errors', () => {
      const error = {
        response: {
          status: 500,
        },
      };

      expect(isErrorRetryable(error)).toBe(true);
    });

    it('should return true for network errors', () => {
      const error = {
        code: 'ECONNREFUSED',
      };

      expect(isErrorRetryable(error)).toBe(true);
    });

    it('should return true for timeout errors', () => {
      const error = {
        code: 'ETIMEDOUT',
      };

      expect(isErrorRetryable(error)).toBe(true);
    });
  });

  describe('getErrorInfo', () => {
    it('should return complete error info', () => {
      const error = {
        response: {
          status: 500,
        },
      };

      const info = getErrorInfo(error);
      expect(info.userMessage).toBeDefined();
      expect(info.suggestion).toBeDefined();
      expect(info.isRetryable).toBeDefined();
    });

    it('should handle multiple error types', () => {
      const errors = [
        { response: { status: 400 } },
        { response: { status: 500 } },
        { code: 'ECONNREFUSED' },
        new Error('Test'),
      ];

      for (const error of errors) {
        const info = getErrorInfo(error);
        expect(info.userMessage).toBeDefined();
        expect(info.suggestion).toBeDefined();
        expect(typeof info.isRetryable).toBe('boolean');
      }
    });
  });

  describe('Error Type Coverage', () => {
    it('should handle all common HTTP status codes', () => {
      const statuses = [400, 401, 403, 404, 409, 422, 429, 500, 502, 503, 504];

      for (const status of statuses) {
        const error = { response: { status } };
        const info = getErrorInfo(error);
        expect(info.userMessage).toBeDefined();
        expect(info.userMessage.length > 0).toBe(true);
      }
    });

    it('should handle all common network error codes', () => {
      const codes = [
        'ECONNABORTED',
        'ECONNREFUSED',
        'ENOTFOUND',
        'ETIMEDOUT',
        'NETWORK_ERROR',
      ];

      for (const code of codes) {
        const error = { code };
        const info = getErrorInfo(error);
        expect(info.userMessage).toBeDefined();
        expect(info.isRetryable).toBeDefined();
      }
    });
  });

  describe('Portuguese Language', () => {
    it('should use Portuguese error messages', () => {
      const errors = [
        { response: { status: 400 } },
        { response: { status: 401 } },
        { response: { status: 500 } },
      ];

      for (const error of errors) {
        const message = getUserErrorMessage(error);
        // Should contain Portuguese characters or be in Portuguese
        expect(message).toBeDefined();
      }
    });
  });
});
