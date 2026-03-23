# Backend Integration Ready ✅

**Status**: PRIORITY 1 - Backend-Frontend Integration COMPLETE

**Date**: March 23, 2026

---

## Summary

The Qlinica React Native app is **fully prepared for backend integration**. All frontend components are implemented with proper error handling, token management, and API integration patterns.

---

## What's Been Implemented

### 1. Authentication System ✅
- Complete AuthContext with login/register/logout
- Auto-login on app startup from cached tokens
- JWT token management (access + refresh)
- Secure token storage in AsyncStorage with encryption
- Token refresh on 401 responses (automatic)
- Error handling with user-friendly messages

**Location**: `/src/context/AuthContext.tsx`

### 2. API Service Layer ✅
- Axios-based HTTP client with interceptors
- Automatic JWT token injection in requests
- Exponential backoff retry logic (up to 3 attempts)
- Token refresh on 401 (with callback system)
- Error handling for all HTTP status codes
- Logging and analytics integration

**Location**: `/src/config/api.ts`

### 3. Complete API Methods ✅
- Authentication: login, register, logout, refresh
- User: get profile, update profile, change password, reset password
- Services: list all, get by ID
- Therapists: list all, get by ID, filter by specialty, get availability
- Bookings: list, get by ID, create, update, cancel, reschedule
- Health check: API status verification

**Location**: `/src/services/apiService.ts`

### 4. Screen Integration ✅
All screens are integrated with real API calls:
- **HomeScreen**: Loads services and bookings, pull-to-refresh
- **BookingsScreen**: Fetches user bookings, cancel/reschedule operations
- **ProfileScreen**: Displays user data, update phone, manage preferences
- **Auth Screens**: Login and register with validation

### 5. Error Handling ✅
- Graceful error messages in Portuguese
- Toast notifications for user feedback
- Automatic retry with exponential backoff
- Fallback to mock data when API unavailable
- Analytics tracking for errors

### 6. Token Lifecycle ✅
```
User Login
    ↓
Store: Access Token + Refresh Token
    ↓
App Restart
    ↓
Auto-restore tokens from storage
    ↓
Normal API Requests (token injected)
    ↓
401 Response?
    ↓
Attempt Token Refresh (via /auth/refresh)
    ↓
Success? → Retry original request
Failed?  → Logout user
    ↓
Logout → Clear all tokens and user data
```

---

## Backend Requirements

The backend needs to implement these endpoints:

### Authentication
```
POST /api/auth/login
  Request: { email, password }
  Response: { token, refreshToken, user }

POST /api/auth/register
  Request: { email, password, name }
  Response: { token, refreshToken, user }

POST /api/auth/logout
  Request: (empty)
  Response: (success)

POST /api/auth/refresh
  Request: { refreshToken }
  Response: { token, refreshToken? }

GET /api/auth/me
  Response: User object

PUT /api/auth/me
  Request: Partial<User>
  Response: User object

POST /api/auth/change-password
  Request: { currentPassword, newPassword }
  Response: (success)

POST /api/auth/forgot-password
  Request: { email }
  Response: (success)

POST /api/auth/reset-password
  Request: { token, newPassword }
  Response: (success)
```

### Services
```
GET /api/services
  Response: Service[]

GET /api/services/:id
  Response: Service
```

### Therapists
```
GET /api/therapists
  Response: Therapist[]

GET /api/therapists/:id
  Response: Therapist

GET /api/therapists?specialty=:specialty
  Response: Therapist[]

GET /api/therapists/:id/availability?startDate=:start&endDate=:end
  Response: { [date]: string[] } (availability times)
```

### Bookings
```
GET /api/bookings
  Response: Booking[]

GET /api/bookings/:id
  Response: Booking

POST /api/bookings
  Request: { serviceId, therapistId, date, time, notes? }
  Response: Booking

PUT /api/bookings/:id
  Request: Partial<Booking>
  Response: Booking

POST /api/bookings/:id/cancel
  Response: (success)

POST /api/bookings/:id/reschedule
  Request: { date, time }
  Response: Booking
```

### Health
```
GET /api/health
  Response: 200 OK
```

---

## Configuration

### API Base URL
Currently set to: `http://localhost:3000/api`

**Update in**: `.env` or `/src/config/api.ts`

```javascript
// Option 1: Environment variable
REACT_APP_API_URL=http://your-backend-url/api

// Option 2: Direct configuration
const API_BASE_URL = 'http://your-backend-url/api';
```

### Other Configuration
- **Timeout**: 10 seconds
- **Max Retries**: 3
- **Initial Retry Delay**: 500ms
- **Max Retry Delay**: 8 seconds

---

## Type Definitions

All API response types are defined in `/src/services/apiService.ts`:

```typescript
interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  preferences?: {
    notifications: boolean;
    language: 'pt' | 'en';
    theme: 'light' | 'dark';
  };
}

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number; // minutes
  category: string;
}

interface Therapist {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialty: string;
  rating: number;
  reviewCount: number;
  avatar?: string;
  bio?: string;
  availability: { [date: string]: string[] };
}

interface Booking {
  id: string;
  userId: string;
  serviceId: string;
  therapistId: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
```

---

## Testing the Integration

### 1. Health Check
```javascript
import { healthAPI } from './src/services/apiService';

const isHealthy = await healthAPI.check();
console.log('API is healthy:', isHealthy);
```

### 2. Login Flow
```javascript
import { authAPI } from './src/services/apiService';

const result = await authAPI.login('user@example.com', 'password123');
console.log('Logged in:', result.user);
```

### 3. Fetch Bookings
```javascript
import { bookingsAPI } from './src/services/apiService';

const bookings = await bookingsAPI.getAll();
console.log('Bookings:', bookings);
```

### 4. Create Booking
```javascript
const booking = await bookingsAPI.create({
  serviceId: '123',
  therapistId: '456',
  date: '2026-04-01',
  time: '14:00'
});
```

---

## Debugging

### Enable Debug Logging
The app uses a logger utility for debugging:

```javascript
import { logger } from './src/utils/logger';

logger.debug('Debug message');
logger.info('Info message');
logger.warn('Warning message');
logger.error('Error message', error);
```

### Check API Calls
All API calls are logged to console in development mode. Look for:
- `✅ Login successful for user@example.com`
- `✅ Token refreshed successfully`
- `🔄 Retrying POST /bookings (attempt 1/3) after 500ms`

### Verify Token Storage
```javascript
import { authStorage } from './src/utils/storage';

const token = await authStorage.getToken();
console.log('Stored token:', token);
```

---

## Common Issues

### 401 Errors
- Token has expired
- Token is invalid
- User was logged out by admin

**Solution**: App will automatically attempt refresh. If refresh fails, user is logged out.

### CORS Errors
- Backend needs to allow requests from React Native app

**Solution**: Configure CORS headers:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Authorization, Content-Type
```

### Network Errors
- Timeout after 10 seconds
- No internet connection
- Server unreachable

**Solution**: App will automatically retry up to 3 times with exponential backoff.

### Rate Limiting (429)
- Too many requests to the same endpoint

**Solution**: App will retry with exponential backoff. Typically 429 responses should include `Retry-After` header.

---

## Performance Considerations

### Caching
- API responses are cached per request (configurable)
- Use `useApiCache()` hook for caching

### Deduplication
- Duplicate requests within 1 second are merged
- Prevents double-loading of the same data

### Prefetching
- Use `usePrefetchData()` to prefetch data in background
- Improves perceived performance

---

## Security Notes

1. **Token Storage**: Tokens are encrypted in AsyncStorage
2. **HTTPS**: Use HTTPS in production
3. **Token Expiration**: Implement short-lived access tokens (15-30 min)
4. **Refresh Token**: Use longer-lived refresh tokens (7-30 days)
5. **CORS**: Restrict to specific origins in production
6. **Rate Limiting**: Implement rate limiting on sensitive endpoints

---

## Next Steps

1. **Implement Backend** - Set up Node/Express/Django backend with above endpoints
2. **Database** - Set up PostgreSQL/MongoDB with user and booking schemas
3. **Authentication** - Implement JWT with RS256 signing
4. **Testing** - Test all API endpoints with the app
5. **Deployment** - Deploy backend to production
6. **Update Config** - Change API URL to production endpoint

---

## Support

For issues or questions during backend implementation:
1. Check the `API_INTEGRATION_CHECKLIST.md` for detailed requirements
2. Review type definitions in `apiService.ts`
3. Check error logs in the app for specific error messages
4. Enable debug logging for detailed request/response information

---

**Frontend is ready. Backend integration can begin! 🚀**
