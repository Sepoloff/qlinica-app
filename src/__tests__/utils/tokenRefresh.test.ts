import { decodeToken, isTokenExpired, getTimeUntilExpiration } from '../../utils/tokenUtils';

describe('Token Refresh Utilities', () => {
  describe('decodeToken', () => {
    it('should decode valid JWT token', () => {
      // Create a valid JWT with exp claim
      const now = Math.floor(Date.now() / 1000);
      const payload = { sub: 'user123', exp: now + 3600 };
      const encoded = Buffer.from(JSON.stringify(payload)).toString('base64');
      const token = `header.${encoded}.signature`;

      const decoded = decodeToken(token);
      expect(decoded).toBeDefined();
      expect(decoded?.sub).toBe('user123');
      expect(decoded?.exp).toBe(now + 3600);
    });

    it('should return null for invalid token', () => {
      const decoded = decodeToken('invalid.token');
      expect(decoded).toBeNull();
    });

    it('should return null for malformed JWT', () => {
      const decoded = decodeToken('not.a.valid.jwt.structure');
      expect(decoded).toBeNull();
    });
  });

  describe('isTokenExpired', () => {
    it('should return false for valid token', () => {
      const now = Math.floor(Date.now() / 1000);
      const payload = { exp: now + 3600 }; // Expires in 1 hour
      const encoded = Buffer.from(JSON.stringify(payload)).toString('base64');
      const token = `header.${encoded}.signature`;

      const expired = isTokenExpired(token);
      expect(expired).toBe(false);
    });

    it('should return true for expired token', () => {
      const now = Math.floor(Date.now() / 1000);
      const payload = { exp: now - 3600 }; // Expired 1 hour ago
      const encoded = Buffer.from(JSON.stringify(payload)).toString('base64');
      const token = `header.${encoded}.signature`;

      const expired = isTokenExpired(token);
      expect(expired).toBe(true);
    });

    it('should return true if within buffer period', () => {
      const now = Math.floor(Date.now() / 1000);
      const payload = { exp: now + 30 }; // Expires in 30 seconds
      const encoded = Buffer.from(JSON.stringify(payload)).toString('base64');
      const token = `header.${encoded}.signature`;

      // Default buffer is 60 seconds, so token should be considered expired
      const expired = isTokenExpired(token, 60);
      expect(expired).toBe(true);
    });

    it('should respect custom buffer period', () => {
      const now = Math.floor(Date.now() / 1000);
      const payload = { exp: now + 100 }; // Expires in 100 seconds
      const encoded = Buffer.from(JSON.stringify(payload)).toString('base64');
      const token = `header.${encoded}.signature`;

      // With 30 second buffer, token should still be valid
      const expired = isTokenExpired(token, 30);
      expect(expired).toBe(false);
    });

    it('should return true for token without exp claim', () => {
      const payload = { sub: 'user123' };
      const encoded = Buffer.from(JSON.stringify(payload)).toString('base64');
      const token = `header.${encoded}.signature`;

      const expired = isTokenExpired(token);
      expect(expired).toBe(true);
    });
  });

  describe('getTimeUntilExpiration', () => {
    it('should return positive time for valid token', () => {
      const now = Math.floor(Date.now() / 1000);
      const expiresIn = 3600; // 1 hour
      const payload = { exp: now + expiresIn };
      const encoded = Buffer.from(JSON.stringify(payload)).toString('base64');
      const token = `header.${encoded}.signature`;

      const timeLeft = getTimeUntilExpiration(token);
      expect(timeLeft).toBeDefined();
      expect(timeLeft).toBeGreaterThan(0);
      expect(timeLeft).toBeLessThanOrEqual(expiresIn * 1000 + 1000); // Allow 1 second margin
    });

    it('should return null for expired token', () => {
      const now = Math.floor(Date.now() / 1000);
      const payload = { exp: now - 3600 };
      const encoded = Buffer.from(JSON.stringify(payload)).toString('base64');
      const token = `header.${encoded}.signature`;

      const timeLeft = getTimeUntilExpiration(token);
      expect(timeLeft).toBeNull();
    });

    it('should return null for token without exp claim', () => {
      const payload = { sub: 'user123' };
      const encoded = Buffer.from(JSON.stringify(payload)).toString('base64');
      const token = `header.${encoded}.signature`;

      const timeLeft = getTimeUntilExpiration(token);
      expect(timeLeft).toBeNull();
    });

    it('should return time in milliseconds', () => {
      const now = Math.floor(Date.now() / 1000);
      const payload = { exp: now + 3600 }; // 1 hour
      const encoded = Buffer.from(JSON.stringify(payload)).toString('base64');
      const token = `header.${encoded}.signature`;

      const timeLeft = getTimeUntilExpiration(token);
      expect(timeLeft).toBeDefined();
      // Should be approximately 3600 seconds = 3600000 ms
      const expectedMs = 3600 * 1000;
      expect(timeLeft).toBeGreaterThan(expectedMs - 5000); // Allow 5 second margin
      expect(timeLeft).toBeLessThanOrEqual(expectedMs + 1000);
    });
  });
});
