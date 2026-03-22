# Error Handling & Backend Integration Guide

## 📋 Overview

Este documento descreve as melhores práticas de error handling e integração com backend implementadas no projeto Qlinica.

## 🔐 Authentication (AuthContext)

### Login Flow
```typescript
const { login } = useAuth();

try {
  await login(email, password);
  // User is authenticated and token is saved
} catch (error) {
  // Error is caught and shown in auth context
  const { error: authError } = useAuth();
  // Display authError.message to user
}
```

### Auto-Login on App Launch
- Token is stored in AsyncStorage
- AuthContext automatically restores user on app open
- If token expires, user is logged out (401 response)

### Error Cases Handled
- **401 Unauthorized**: Token expired → auto logout
- **409 Conflict**: Email already registered
- **422 Validation**: Invalid input data
- **429 Rate Limit**: Too many login attempts
- **5xx Server**: Server errors with retry

## 🔄 API Integration

### axios Instance (`src/config/api.ts`)

**Base Configuration:**
- Base URL: `process.env.REACT_APP_API_URL || http://localhost:3000/api`
- Timeout: 10 seconds
- Auto-retry on 5xx and network errors
- Exponential backoff with jitter

**Request Interceptor:**
- Automatically adds JWT token from AsyncStorage
- Logs API calls for debugging

**Response Interceptor:**
- Retries failed requests (max 3 times)
- Exponential backoff: 500ms → 1s → 2s → 4s → 8s (with jitter)
- 401 responses auto-logout user
- 4xx errors don't retry (except 429)
- Tracks API metrics for analytics

### Example: Using API Service

```typescript
import { api } from '../config/api';

// GET request
const { data } = await api.get('/bookings');

// POST request with error handling
try {
  const response = await api.post('/bookings', {
    serviceId: '123',
    therapistId: '456',
    date: '2026-03-22',
    time: '14:00',
  });
  
  const booking = response.data;
} catch (error: any) {
  // Error is already logged and retried by interceptor
  const message = error.response?.data?.message || 'Booking failed';
  showError(message);
}
```

## 🎣 Custom Hooks

### useBookingAPI
```typescript
const { 
  bookings, 
  isLoading, 
  error, 
  createBooking, 
  cancelBooking,
  rescheduleBooking 
} = useBookingAPI();

// Operations return promises and handle errors internally
const newBooking = await createBooking(bookingData);
```

**Error Handling:**
- All errors are caught and stored in `error` state
- Operations throw errors for caller to handle
- Loading state is managed automatically

### useServices (useDataAPI)
```typescript
const { 
  services, 
  isLoading, 
  error, 
  refresh 
} = useServices();

// Refresh manually or on screen focus
useFocusEffect(() => {
  refresh();
});
```

### useAsyncOperation
```typescript
const { 
  execute, 
  isLoading, 
  error, 
  isSuccess, 
  progress 
} = useAsyncOperation({
  onSuccess: (data) => {},
  onError: (error) => {},
  timeout: 30000,
});

const result = await execute(async () => {
  return await api.post('/some-endpoint', data);
});
```

## 🛡️ Validation

### Email Validation (RFC Compliant)
```typescript
import { validateEmail } from '../utils/validation';

if (!validateEmail(email)) {
  // Show error: invalid email format
}
```

### Password Strength
```typescript
import { validatePassword } from '../utils/validation';

const validation = validatePassword(password);
if (!validation.valid) {
  // validation.errors contains specific issues:
  // - "Password must be at least 8 characters"
  // - "Password must contain uppercase letter"
  // - "Password must contain number"
}
```

### Phone Validation
```typescript
import { validatePhone } from '../utils/validation';

if (!validatePhone(phone)) {
  // Show error: use format +351 912345678 or 912345678
}
```

### Date Validation
```typescript
import { validateDate } from '../utils/validation';

if (!validateDate(dateString)) {
  // Show error: invalid date format or past date
}
```

## 📱 UI Patterns

### Loading States
```typescript
const [isLoading, setIsLoading] = useState(false);

<TouchableOpacity 
  onPress={handleSubmit}
  disabled={isLoading}
  style={isLoading ? styles.disabled : styles.button}
>
  <Text>{isLoading ? 'Carregando...' : 'Enviar'}</Text>
</TouchableOpacity>
```

### Error Messages
```typescript
const { error } = useAuth();

{error && (
  <View style={styles.errorContainer}>
    <Text style={styles.errorText}>{error}</Text>
  </View>
)}
```

### Toast Notifications
```typescript
import { useQuickToast } from '../hooks/useToast';

const toast = useQuickToast();

// Success
toast.success('✅ Agendamento confirmado');

// Error
toast.error('❌ Erro ao confirmar agendamento');

// Info
toast.info('ℹ️ Verifique seu email');
```

## 🔍 Logging

### Logger Service
```typescript
import { logger } from '../utils/logger';

logger.debug('User logged in', 'AuthContext');
logger.warn('Token about to expire', warning, 'AuthContext');
logger.error('Login failed', error, 'AuthContext');
logger.logApiCall('POST', '/bookings', 200, 150); // method, url, status, duration
```

### Console Integration
- Logs are also sent to Firebase Crashlytics (if configured)
- Analytics track errors for monitoring
- Performance metrics logged for optimization

## 🔄 Network Status

### useNetworkStatus Hook
```typescript
import { useNetworkStatus } from '../hooks/useNetworkStatus';

const { isConnected } = useNetworkStatus();

if (!isConnected) {
  // Show offline UI or queue operations
}
```

### Offline Sync
- Operations are queued when offline
- Automatically synced when connection restored
- Persisted in AsyncStorage

## 📊 Analytics

### Error Tracking
```typescript
import { analyticsService } from '../services/analyticsService';

try {
  // operation
} catch (error) {
  analyticsService.trackError(error, {
    screen: 'HomeScreen',
    operation: 'loadBookings',
  });
}
```

### Event Tracking
```typescript
analyticsService.trackEvent('booking_created', {
  serviceId: '123',
  therapistId: '456',
  duration: 45, // minutes
});
```

## 🚀 Best Practices

### 1. Always Validate Input Before API Call
```typescript
// ✅ GOOD
const { validateEmail } = require('../utils/validation');
if (!validateEmail(email)) throw new Error('Invalid email');
await api.post('/auth/login', { email, password });

// ❌ BAD
await api.post('/auth/login', { email, password });
```

### 2. Use Try-Catch for Async Operations
```typescript
try {
  const result = await api.post('/endpoint', data);
} catch (error) {
  // Handle error, don't just console.log
  logger.error('Failed', error);
  showToast(error.message);
}
```

### 3. Show Loading State During Operations
```typescript
const [loading, setLoading] = useState(false);

const handleSubmit = async () => {
  setLoading(true);
  try {
    await api.post('/endpoint', data);
  } finally {
    setLoading(false); // Always reset
  }
};
```

### 4. Disable Buttons During Loading
```typescript
<Button
  disabled={isLoading}
  onPress={handleSubmit}
>
  {isLoading ? 'Enviando...' : 'Enviar'}
</Button>
```

### 5. Use Context for Global State
```typescript
const { user, logout, updateUser } = useAuth();
// User data synced across all screens
```

### 6. Handle Different Error Types
```typescript
catch (error: any) {
  if (error.response?.status === 401) {
    // Token expired
  } else if (error.response?.status === 429) {
    // Rate limited
  } else if (!error.response) {
    // Network error
  } else {
    // Other error
  }
}
```

## 🔗 Integration Checklist

- ✅ AuthContext with JWT token persistence
- ✅ API service with retry logic
- ✅ useAuth hook for auth state
- ✅ useBookingAPI hook for booking operations
- ✅ useServices hook for fetching services
- ✅ Error boundaries and error handling
- ✅ Loading states in UI
- ✅ Input validation before API calls
- ✅ Toast notifications for user feedback
- ✅ Network status detection
- ✅ Offline sync capability
- ✅ Analytics and error tracking
- ✅ Auto-logout on 401
- ✅ Exponential backoff retries
- ✅ Rate limit handling

## 📚 Related Files

- `/src/context/AuthContext.tsx` - Authentication state
- `/src/config/api.ts` - API client configuration
- `/src/hooks/useBookingAPI.ts` - Booking operations
- `/src/hooks/useDataAPI.ts` - Data fetching
- `/src/utils/validation.ts` - Input validation
- `/src/utils/storage.ts` - AsyncStorage wrapper
- `/src/utils/logger.ts` - Logging service
