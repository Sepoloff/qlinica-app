# Qlinica App - Backend-Frontend Integration Guide

## Overview

This guide covers the complete integration between the Qlinica React Native frontend and the backend API, including authentication, booking flow, and data management.

## Architecture

### State Management

The app uses a layered approach for state management:

1. **AuthContext** - User authentication and profile
2. **BookingFlowContext** - Multi-step booking process
3. **Custom Hooks** - API data fetching and caching
4. **AsyncStorage** - Local persistence

### API Integration

All API calls go through:
- `src/config/api.ts` - Axios instance with interceptors
- `src/services/apiService.ts` - Service layer with API endpoints

## Authentication Flow

### 1. Auto-Login on App Launch

```typescript
// In AuthContext.tsx - bootstrapAsync()
- Checks for saved JWT token in AsyncStorage
- Retrieves user profile
- Automatically logs in if valid token exists
- Sets user state for UI
```

### 2. Login/Register

```typescript
// Login example
const { login } = useAuth();

try {
  await login('user@example.com', 'Password123');
  // User is now authenticated
} catch (error) {
  console.error(error.message); // "Invalid email or password"
}
```

### 3. Token Management

- JWT tokens are automatically added to all API requests via interceptor
- 401 responses trigger automatic logout
- Tokens are stored in AsyncStorage (encrypted is recommended)
- Supports refresh token flow (optional enhancement)

## Booking Flow Integration

### Complete Booking Journey

```
HomeScreen
    ↓
ServiceSelectionScreen (Select service)
    ↓
TherapistSelectionScreen (Select therapist)
    ↓
CalendarSelectionScreen (Select date & time)
    ↓
BookingSummaryScreen (Confirm)
    ↓
Confirmation → Home (or Bookings screen)
```

### State Flow

Each screen saves its state to `BookingFlowContext`:

```typescript
// Service Selection
setBookingState({
  serviceId: '123',
  serviceName: 'Fisioterapia',
  servicePrice: 50,
});

// Therapist Selection
setBookingState({
  therapistId: '456',
  therapistName: 'João Silva',
});

// Date & Time Selection
setBookingState({
  date: '2024-03-22', // ISO format for API
  time: '14:30',
});

// Submit at Summary
const booking = await submitBooking();
// Returns: { id, status, createdAt, ... }
```

### API Integration at Each Step

#### Service Selection
```typescript
// src/screens/ServiceSelectionScreen.tsx
const { services, loading } = useServicesData();

// API call:
// GET /api/services
// Returns: Service[]
```

#### Therapist Selection
```typescript
// src/screens/TherapistSelectionScreen.tsx
const { therapists, loading } = useTherapistsData(serviceId);

// API call:
// GET /api/therapists?serviceId=123
// Returns: Therapist[]
```

#### Available Slots
```typescript
// src/screens/CalendarSelectionScreen.tsx
const { slots, loading } = useBookingAvailability(
  therapistId,
  serviceId,
  date
);

// API call:
// GET /api/availability/slots
// Query params: { therapistId, serviceId, date }
// Returns: string[] (times: ["09:00", "09:30", ...])
```

#### Create Booking
```typescript
// src/screens/BookingSummaryScreen.tsx
const booking = await submitBooking();

// API call:
// POST /api/bookings
// Body:
// {
//   serviceId: "123",
//   therapistId: "456",
//   date: "2024-03-22",
//   time: "14:30",
//   notes: "optional"
// }
// Returns: Booking
```

## Data Validation

### Booking Flow Validation

```typescript
const { validateBookingData } = useBookingFlow();

const validation = validateBookingData();
// {
//   valid: boolean,
//   errors: [
//     "Serviço é obrigatório",
//     "Data não pode estar no passado",
//     ...
//   ]
// }
```

### Input Validation

```typescript
// Email validation (RFC 5322 compliant)
import { validateEmail } from './utils/validation';
validateEmail('user@example.com'); // true

// Password validation
import { validatePassword } from './utils/validation';
const { valid, errors } = validatePassword('Weak');
// errors: ["Password must be at least 8 characters", ...]

// Phone validation (Portuguese)
import { validatePhone } from './utils/validation';
validatePhone('+351 912345678'); // true
```

## Date & Time Handling

### Date Utilities

```typescript
import {
  formatDateDDMMYYYY,     // "22/03/2024"
  formatDateISO,          // "2024-03-22"
  parseDate,              // Date object
  isDateInPast,           // boolean
  getShortDayName,        // "Seg"
  getDayName,             // "Segunda"
  getMonthName,           // "Março"
  formatDateTime,         // "Segunda, 22 de Março às 14:30"
  getRelativeTimeString,  // "Amanhã", "Em 2 dias"
  getNextBusinessDays,    // Date[] (excluding Sundays)
} from './utils/dateHelpers';

// Example usage in booking
const dateISO = formatDateISO(selectedDate); // for API
const dateDisplay = formatDateDDMMYYYY(selectedDate); // for UI
const relativeTime = getRelativeTimeString(date); // "Amanhã"
```

## Error Handling

### API Error Handling

```typescript
// Automatic retry logic in api.ts:
// - Network errors: retry with exponential backoff
// - 5xx server errors: retry up to 3 times
// - 429 rate limit: retry with exponential backoff
// - 401 unauthorized: logout immediately
// - Other 4xx: fail immediately
```

### Booking Flow Error Handling

```typescript
const { 
  submitBooking, 
  error, 
  isSubmitting,
  clearError 
} = useBookingFlow();

try {
  const booking = await submitBooking();
} catch (err) {
  // Error is automatically set in context
  // Display with: <ErrorAlert error={error} onDismiss={clearError} />
}
```

### Component-Level Error Display

```typescript
import { ErrorAlert } from './components/ErrorAlert';

<ErrorAlert 
  error={error}
  type="error"
  showRetry={true}
  onRetry={async () => {
    clearError();
    await submitBooking();
  }}
  onDismiss={clearError}
/>
```

## Progress Tracking

### Visual Progress Indicator

```typescript
import { BookingProgressIndicator } from './components/BookingProgressIndicator';

const { progressPercentage } = useBookingFlowHook();

<BookingProgressIndicator
  currentStep="therapist" // service | therapist | datetime | summary
  progress={progressPercentage}
/>
```

### Progress Calculation

```typescript
// Automatic progress calculation based on completed fields
// Service: 25%
// Service + Therapist: 50%
// Service + Therapist + Date/Time: 75%
// All fields: 100%
```

## Notifications & Reminders

### Booking Confirmation

```typescript
const { notifyBookingConfirmation } = useNotificationManager();

await notifyBookingConfirmation(
  therapistName,
  serviceName,
  appointmentDate
);
// Sends push notification and SMS
```

### Appointment Reminder

```typescript
const { scheduleAppointmentReminder } = useNotificationManager();

await scheduleAppointmentReminder(
  therapistName,
  serviceName,
  appointmentDate
);
// Schedules reminder 1 hour before appointment
```

## Local Data Caching

### AsyncStorage

```typescript
// Token storage
import { authStorage } from './utils/storage';
await authStorage.setToken(jwt);
const token = await authStorage.getToken();

// User profile storage
import { userStorage } from './utils/storage';
await userStorage.setProfile(user);
const user = await userStorage.getProfile();

// Preferences
await AsyncStorage.setItem('notificationPrefs', JSON.stringify({
  sms: true,
  email: true,
  push: false,
}));
```

## Analytics & Logging

### Event Tracking

```typescript
const { trackEvent, trackError } = useAnalytics();

trackEvent('booking_started', { serviceId: '123' });
trackEvent('booking_completed', { bookingId: '456', value: 50 });
trackError(error, { screen: 'BookingSummaryScreen' });
```

### Debug Logging

```typescript
import { logger } from './utils/logger';

logger.debug('Booking created', 'BookingAPI');
logger.warn('Notification failed', error, 'NotificationManager');
logger.error('API error', error, 'APIService');
```

## Testing the Integration

### Manual Testing Checklist

- [ ] **Auth Flow**
  - [ ] Login with valid credentials
  - [ ] Login with invalid credentials (error message)
  - [ ] Register new user
  - [ ] Auto-login on app restart
  - [ ] Logout clears data

- [ ] **Booking Flow**
  - [ ] Select service (data loads from API)
  - [ ] Select therapist (filtered by service)
  - [ ] Select date/time (available slots load)
  - [ ] Validation errors shown correctly
  - [ ] Booking submission succeeds
  - [ ] Booking appears in list after creation
  - [ ] Notification sent on confirmation

- [ ] **Data Persistence**
  - [ ] Token saved after login
  - [ ] User profile persists
  - [ ] Preferences saved locally

- [ ] **Error Handling**
  - [ ] Network errors show retry option
  - [ ] API errors display user-friendly messages
  - [ ] Invalid input shows validation errors

## Environment Configuration

### API Base URL

Set in `.env` or via environment:

```bash
REACT_APP_API_URL=http://localhost:3000/api  # Development
REACT_APP_API_URL=https://api.qlinica.pt/api # Production
```

### App Configuration

```json
// app.json
{
  "expo": {
    "name": "Qlinica",
    "scheme": "qlinica",
    "plugins": [
      "@react-native-firebase/app",
      "@react-native-firebase/messaging"
    ]
  }
}
```

## Performance Optimization

### Data Fetching Best Practices

```typescript
// ✅ Do: Use custom hooks for caching
const { services, refresh } = useServicesData();

// ❌ Don't: Fetch in component render
useEffect(() => {
  // Only call once or when dependencies change
  loadServices();
}, []);
```

### Memory Management

- Hooks automatically handle cleanup
- Navigating away resets booking state
- Old booking data cleared after 24 hours (optional)

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| 401 Unauthorized | Token expired, need re-login |
| Booking fails to submit | Check internet connection, validate inputs |
| Data not updating | Pull down to refresh, check API server |
| Notifications not showing | Check permissions, notification settings |

### Debug Mode

```typescript
// Enable detailed logging
import { logger } from './utils/logger';
logger.setLevel('debug'); // debug, info, warn, error
```

## Next Steps

1. **Payment Integration** - Add Stripe/PayPal integration
2. **Real-time Updates** - Implement WebSocket for live availability
3. **Push Notifications** - Full FCM/APNs setup
4. **Analytics** - Track user behavior with Segment/Amplitude
5. **A/B Testing** - Feature flags and experimentation

---

**Last Updated:** March 2024
**API Version:** v1
**App Version:** 1.0.0
