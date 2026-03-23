# Production Backend Integration Guide

**Status**: Ready for Production Integration  
**Updated**: March 23, 2026  
**Qlinica Version**: v1.0.0 Production Ready  

---

## 🎯 Overview

This guide provides step-by-step instructions for integrating the Qlinica React Native app with a real production backend. The app is fully prepared with:

- ✅ Complete authentication layer with JWT tokens
- ✅ API service with retry logic and error handling
- ✅ Offline sync queue for reliability
- ✅ Performance monitoring and analytics
- ✅ Security best practices implemented

---

## 📋 Pre-Integration Checklist

### Backend Requirements
- [ ] Backend API server running (Express, Node.js recommended)
- [ ] Database configured (PostgreSQL/MongoDB)
- [ ] JWT secret configured for token generation
- [ ] CORS enabled for mobile client
- [ ] HTTPS/SSL certificates in place
- [ ] Rate limiting configured
- [ ] Error logging system in place

### Backend Endpoints Required

```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh
GET /api/auth/profile

GET /api/services
POST /api/bookings
GET /api/bookings/:id
PUT /api/bookings/:id
PATCH /api/bookings/:id/cancel
GET /api/bookings/user/:userId

GET /api/therapists
GET /api/therapists/:id
GET /api/therapists/:id/availability

POST /api/payments
GET /api/payments/:id

GET /api/notifications
POST /api/notifications/:id/read
```

---

## 🔧 Step 1: Configure API Endpoint

### 1.1 Update API Configuration

**File**: `src/config/api.ts`

```typescript
// For production, update base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://api.qlinica.com';

// Environment-specific config
const axiosConfig = {
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': 'QlinicaApp/1.0.0',
  },
};
```

### 1.2 Environment Variables

**File**: `.env.production`

```bash
REACT_APP_API_URL=https://api.qlinica.com
REACT_APP_API_TIMEOUT=30000
REACT_APP_ENV=production
REACT_APP_LOG_LEVEL=error
```

### 1.3 Test Connection

```bash
# Test API connectivity
curl -X GET https://api.qlinica.com/api/health
# Expected response: { "status": "ok", "timestamp": "..." }
```

---

## 🔐 Step 2: Implement Authentication

### 2.1 Backend Login Endpoint

**Expected Request**:
```typescript
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "SecurePassword123"
}
```

**Expected Response**:
```typescript
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "User Name",
      "phone": "+351XXXXXXXXX",
      "avatar": "https://...",
      "createdAt": "2026-03-23T12:00:00Z"
    },
    "tokens": {
      "accessToken": "eyJhbGc...",
      "refreshToken": "eyJhbGc...",
      "expiresIn": 3600,
      "refreshExpiresIn": 604800
    }
  }
}
```

### 2.2 Token Refresh Mechanism

**Backend Refresh Endpoint**:
```typescript
POST /api/auth/refresh
Headers: {
  "Authorization": "Bearer {refreshToken}"
}

Response:
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGc...",
    "expiresIn": 3600
  }
}
```

### 2.3 Verify Integration

In the app, test authentication:

```typescript
// src/__tests__/integration/auth.test.ts
import { useAuth } from '../../context/AuthContext';

test('Login flow with real backend', async () => {
  const { login } = useAuth();
  
  const result = await login('test@example.com', 'Password123');
  
  expect(result).toBeDefined();
  expect(result.user).toBeDefined();
  expect(result.tokens.accessToken).toBeDefined();
});
```

---

## 📅 Step 3: Implement Booking Endpoints

### 3.1 Service List Endpoint

**Backend**:
```typescript
GET /api/services
Response:
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Consulta Geral",
      "description": "Consulta médica geral",
      "price": 50.00,
      "duration": 30,
      "icon": "stethoscope",
      "category": "consultation"
    }
  ]
}
```

### 3.2 Create Booking Endpoint

**Backend**:
```typescript
POST /api/bookings
Headers: {
  "Authorization": "Bearer {accessToken}"
}
Body: {
  "serviceId": "uuid",
  "therapistId": "uuid",
  "startTime": "2026-03-25T14:00:00Z",
  "notes": "Optional notes"
}

Response:
{
  "success": true,
  "data": {
    "id": "uuid",
    "bookingNumber": "BK-2026-001",
    "status": "confirmed",
    "createdAt": "2026-03-23T12:00:00Z",
    "confirmationEmail": "sent"
  }
}
```

### 3.3 Get User Bookings

**Backend**:
```typescript
GET /api/bookings
Headers: {
  "Authorization": "Bearer {accessToken}"
}

Response:
{
  "success": true,
  "data": {
    "bookings": [...],
    "pagination": {
      "total": 10,
      "page": 1,
      "pageSize": 20
    }
  }
}
```

---

## 💳 Step 4: Payment Integration

### 4.1 Payment Processor Setup

```typescript
// src/services/paymentService.ts

// Supported providers: Stripe, Paddle, Razorpay
const PAYMENT_PROVIDER = 'stripe';
const STRIPE_PUBLIC_KEY = process.env.REACT_APP_STRIPE_KEY;

// Initialize payment processor
const initializePayment = async () => {
  // Load payment keys from secure storage
  const key = await secureStorage.getItem('payment_key');
  // Initialize provider SDK
};
```

### 4.2 Payment Endpoint

**Backend**:
```typescript
POST /api/payments
Headers: {
  "Authorization": "Bearer {accessToken}"
}
Body: {
  "bookingId": "uuid",
  "amount": 50.00,
  "currency": "EUR",
  "provider": "stripe",
  "paymentMethod": {...}
}

Response:
{
  "success": true,
  "data": {
    "paymentId": "uuid",
    "status": "completed",
    "receipt": "https://...",
    "transactionId": "..."
  }
}
```

---

## 🔔 Step 5: Push Notifications

### 5.1 Firebase Cloud Messaging Setup

```bash
# Install Firebase admin SDK on backend
npm install firebase-admin

# Initialize Firebase
firebase init
```

### 5.2 Notification Endpoint

**Backend**:
```typescript
POST /api/notifications/send
Body: {
  "userId": "uuid",
  "title": "Consulta Confirmada",
  "body": "Sua consulta foi agendada",
  "data": {
    "bookingId": "uuid",
    "deeplink": "qlinica://booking/uuid"
  }
}
```

---

## 🧪 Step 6: Testing Integration

### 6.1 Test Suite

```bash
# Run integration tests
npm run test:integration

# Test coverage
npm run test:coverage
```

### 6.2 Manual Testing Steps

1. **Authentication Flow**
   - [ ] Register new account
   - [ ] Login with credentials
   - [ ] Verify token stored securely
   - [ ] Test token refresh
   - [ ] Logout cleanly

2. **Booking Flow**
   - [ ] Load services
   - [ ] Select service
   - [ ] Choose therapist
   - [ ] Pick date/time
   - [ ] Create booking
   - [ ] Verify confirmation

3. **Error Scenarios**
   - [ ] Login with wrong password
   - [ ] Create booking with unavailable slot
   - [ ] Test offline mode
   - [ ] Test network timeout
   - [ ] Test retry logic

4. **Performance**
   - [ ] Monitor API response times
   - [ ] Check bundle size
   - [ ] Verify memory usage
   - [ ] Test on slow network (3G)

---

## 📊 Step 7: Monitoring & Analytics

### 7.1 Enable Performance Tracking

```typescript
// src/utils/performanceMonitor.ts
const monitor = {
  trackApiCall: (endpoint, duration, statusCode) => {
    analyticsService.track('api_call', {
      endpoint,
      duration,
      statusCode,
      timestamp: Date.now(),
    });
  },
};
```

### 7.2 Error Logging

```typescript
// Backend errors should be logged
Sentry.captureException(error, {
  tags: {
    component: 'booking_flow',
    step: 'create_booking',
  },
});
```

---

## 🚀 Step 8: Deployment

### 8.1 Build for Production

```bash
# iOS Build
eas build --platform ios --auto-submit

# Android Build
eas build --platform android --auto-submit

# Web Build (if needed)
npm run build:web
```

### 8.2 Release Checklist

- [ ] All tests passing
- [ ] No console errors/warnings
- [ ] Performance acceptable (>60 FPS)
- [ ] Offline mode works
- [ ] All analytics tracking working
- [ ] Error logging configured
- [ ] API endpoints verified
- [ ] Security review completed
- [ ] Privacy policy updated
- [ ] Rate limiting tested

---

## 🔒 Security Considerations

### 8.1 API Security

```typescript
// Always validate tokens
const validateToken = (token: string): boolean => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded.exp > Date.now() / 1000;
  } catch (error) {
    return false;
  }
};
```

### 8.2 Data Protection

- [ ] Encrypt sensitive data in storage
- [ ] Use HTTPS for all API calls
- [ ] Implement certificate pinning
- [ ] Validate SSL certificates
- [ ] Sanitize user input
- [ ] Never log sensitive data

### 8.3 Token Management

- [ ] Store tokens securely (Keychain/Keystore)
- [ ] Implement token expiration
- [ ] Use refresh tokens for extending sessions
- [ ] Invalidate tokens on logout
- [ ] Rotate secrets regularly

---

## 📞 Support & Troubleshooting

### Common Issues

**Issue**: Token refresh loop  
**Solution**: Check refresh endpoint - ensure it's not calling itself

**Issue**: CORS errors  
**Solution**: Verify backend CORS headers:
```bash
curl -X OPTIONS https://api.qlinica.com/api/auth/login -H "Origin: https://qlinica.app"
```

**Issue**: Offline sync not working  
**Solution**: Check AsyncStorage permissions and network status

---

## 📚 Related Documentation

- [API Integration Checklist](./API_INTEGRATION_CHECKLIST.md)
- [Architecture Guide](./ARCHITECTURE.md)
- [Security Best Practices](./SECURITY.md)
- [Performance Optimization](./PERFORMANCE_OPTIMIZATION.md)

---

**Last Updated**: March 23, 2026  
**Next Review**: April 23, 2026  
**Status**: ✅ Production Ready
