# Qlinica App - Architecture Documentation

## Overview

Qlinica is a production-ready React Native clinic booking application built with Expo, featuring robust state management, comprehensive error handling, and advanced analytics.

## Architecture Layers

### 1. **Presentation Layer (UI/Components)**

```
screens/
├── AuthScreens/
│   ├── LoginScreen.tsx
│   └── RegisterScreen.tsx
├── BookingScreens/
│   ├── ServiceSelectionScreen.tsx
│   ├── TherapistSelectionScreen.tsx
│   ├── CalendarSelectionScreen.tsx
│   └── BookingSummaryScreen.tsx
├── MainScreens/
│   ├── HomeScreen.tsx
│   ├── BookingsScreen.tsx
│   └── ProfileScreen.tsx
├── PaymentScreen.tsx
└── [Other screens...]

components/
├── Layout/
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Header.tsx
│   └── TabBarIcon.tsx
├── Forms/
│   ├── FormInput.tsx
│   └── MaskedPhoneInput.tsx
├── Display/
│   ├── LoadingSpinner.tsx
│   ├── EmptyState.tsx
│   ├── Badge.tsx
│   └── StatusBadge.tsx
├── Dialogs/
│   ├── ConfirmDialog.tsx
│   └── AlertModal.tsx
└── [Other components...]
```

**Key Principles:**
- ✅ One responsibility per component
- ✅ Props-based configuration
- ✅ Complete TypeScript typing
- ✅ Reusability across screens

### 2. **State Management Layer**

```
context/
├── AuthContext.tsx         # User authentication state
├── BookingContext.tsx      # Booking data state
├── BookingFlowContext.tsx  # Multi-step booking flow
├── ToastContext.tsx        # Notifications state
├── NotificationContext.tsx # Notification preferences
└── ThemeContext.tsx        # Dark/light theme
```

**Architecture Pattern:** Context API + Custom Hooks

**Data Flow:**
```
Provider (App.tsx)
    ↓
Context Definition
    ↓
Custom Hook (useAuth, useBooking, etc.)
    ↓
Component Usage
    ↓
State Updates via dispatch/setters
```

**Benefits:**
- ✅ Centralized state management
- ✅ Prop-drilling eliminated
- ✅ Easy to test and mock
- ✅ Type-safe with TypeScript

### 3. **Business Logic Layer (Services)**

```
services/
├── authService.ts           # Authentication logic
├── bookingService.ts        # Booking operations
├── paymentService.ts        # Payment processing
├── notificationService.ts   # Notifications
├── analyticsService.ts      # Basic analytics
├── advancedAnalyticsService.ts  # Advanced metrics
├── offlineSyncService.ts    # Offline queue
├── errorRecoveryService.ts  # Error handling
└── [Other services...]
```

**Service Responsibilities:**

#### authService
- User login/register
- Token management
- Session handling

#### bookingService
- CRUD operations
- Availability checking
- Booking history
- Rescheduling/cancellation

#### paymentService
- Payment intents
- Payment confirmation
- Payment method management
- History tracking

#### analyticsService
- Event tracking
- Error reporting
- Basic metrics

#### advancedAnalyticsService
- Session tracking
- Conversion funnel
- Engagement metrics
- Batch event processing

#### errorRecoveryService
- Circuit breaker pattern
- Retry strategies
- Error classification
- User-friendly messages

#### offlineSyncService
- Queue management
- Offline operations
- Sync when connected

### 4. **Data Access Layer**

```
config/
├── api.ts               # Axios instance with interceptors
└── firebase.ts          # Firebase configuration

hooks/
├── useFetch.ts         # Generic data fetching
├── useAsyncStorage.ts  # Local storage
├── useCache.ts         # Caching layer
├── usePayment.ts       # Payment operations
└── [Other hooks...]
```

**API Integration:**

```typescript
// Axios instance with:
// - JWT token interceptors (request)
// - Error handling & retry (response)
// - Exponential backoff
// - 401 token expiration handling
```

### 5. **Utilities & Helpers**

```
utils/
├── validation.ts           # Input validation
├── advancedValidation.ts   # Complex validations
├── formValidator.ts        # Form-level validation
├── masks.ts               # Input masking
├── formatters.ts          # Data formatting
├── storage.ts             # AsyncStorage helpers
├── errorHandler.ts        # Error utilities
├── testingHelpers.ts      # Testing mock data
└── [Other utilities...]
```

### 6. **Constants**

```
constants/
├── Colors.ts              # Color palette
├── Data.ts               # Mock/default data
└── Messages.ts           # User messages
```

## Data Flow Architecture

### 1. **Authentication Flow**

```
LoginScreen
    ↓ (email/password)
useAuth hook
    ↓
authService.login()
    ↓
API call (axios with JWT)
    ↓
AsyncStorage (token)
    ↓
AuthContext update
    ↓
Auto-navigate to TabNavigator
```

### 2. **Booking Flow**

```
HomeScreen
    ↓ (click "Agendar")
ServiceSelectionScreen
    ↓ (select service)
TherapistSelectionScreen
    ↓ (select therapist)
CalendarSelectionScreen
    ↓ (select date/time)
BookingSummaryScreen
    ↓ (confirm)
PaymentScreen
    ↓ (payment)
Success → HomeScreen + notification
```

**State Preservation:**
- BookingFlowContext maintains selection across screens
- Reset after completion
- Data saved to AsyncStorage for recovery

### 3. **Payment Flow**

```
BookingSummaryScreen
    ↓
paymentService.createPaymentIntent()
    ↓
PaymentScreen (select/add method)
    ↓
paymentService.confirmPayment()
    ↓
Payment result tracked in advancedAnalyticsService
    ↓
offlineSyncService (if offline)
    ↓
Success notification + booking confirmation
```

### 4. **Error Handling Flow**

```
Any operation
    ↓ (error occurs)
errorRecoveryService.handleError()
    ↓ (classify error)
Choose recovery strategy:
├─ Retry (network errors)
├─ Fallback (use cache)
├─ Alert (user-friendly message)
└─ Navigate (to error screen)
    ↓
analyticsService.trackError()
    ↓
User notified via Toast
```

## State Management Pattern

### Context Structure

```typescript
// Example: AuthContext
interface AuthContextType {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Methods
  login(email: string, password: string): Promise<void>;
  register(data: RegisterData): Promise<void>;
  logout(): Promise<void>;
  updateUser(data: Partial<User>): Promise<void>;
}

// Provider component wraps app
<AuthProvider>
  <App />
</AuthProvider>

// Custom hook usage in components
const { user, isAuthenticated, login } = useAuth();
```

## API Integration Pattern

### Request Interceptor

```typescript
// Adds JWT token to all requests
api.interceptors.request.use((config) => {
  const token = await authStorage.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Response Interceptor

```typescript
// Handles:
// - 401 (token expired)
// - 5xx errors with exponential backoff
// - 429 (rate limiting)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (shouldRetry(error)) {
      await delay(exponentialBackoff(attempt));
      return api(config); // Retry
    }
    throw error;
  }
);
```

## Error Handling Architecture

### Layers

```
Try-Catch (Component level)
    ↓
Service error handling
    ↓
API interceptors (axios)
    ↓
ErrorBoundary (component crash prevention)
    ↓
Global error logger (analyticsService)
```

### Error Classification

```
Network Errors
├─ Timeout (retry with backoff)
├─ No connection (queue for offline sync)
└─ Unreachable (alert user)

API Errors
├─ 4xx (user-friendly message)
├─ 5xx (retry with backoff)
└─ 429 (rate limit - wait and retry)

Auth Errors
├─ 401 (logout + redirect to login)
├─ 403 (alert insufficient permissions)

Validation Errors
├─ Form validation (display in field)
└─ Server validation (show toast)
```

## Offline Support Architecture

### Queue System

```
User performs action (offline)
    ↓
offlineSyncService.queueOperation()
    ↓
Save to AsyncStorage
    ↓
Show "Pending" indicator
    ↓
Connection restored
    ↓
Automatic sync attempt
    ↓
Success → remove from queue
Error → retry with backoff
```

## Analytics Architecture

### Event Tracking Layers

```
advancedAnalyticsService (business metrics)
├─ Session tracking
├─ Conversion funnel
├─ Engagement metrics
└─ Event batching

analyticsService (event tracking)
├─ Custom events
├─ Error tracking
└─ Firebase integration

Third-party (future)
├─ Firebase Analytics
├─ Mixpanel
└─ Amplitude
```

### Conversion Funnel

```
Session Start
    ↓
Screen View (screen_view event)
    ↓
Booking Started (funnel_booking_started)
    ↓
Booking Completed (funnel_booking_completed, conversion_time)
    ↓
Payment Attempted (funnel_payment_attempted)
    ↓
Payment Completed (funnel_payment_completed)
    ↓
Conversion! Track revenue, duration, etc.
```

## Component Hierarchy

```
App.tsx
├─ ThemeProvider
├─ AuthProvider
├─ BookingProvider
├─ BookingFlowProvider
├─ ToastProvider
├─ NotificationProvider
└─ NavigationContainer
    ├─ RootNavigator
    │   ├─ AuthStack (if not authenticated)
    │   │   ├─ LoginScreen
    │   │   └─ RegisterScreen
    │   │
    │   └─ TabNavigator (if authenticated)
    │       ├─ HomeScreen
    │       ├─ BookingsScreen
    │       └─ ProfileScreen
    │
    ├─ BookingStack (nested)
    │   ├─ ServiceSelectionScreen
    │   ├─ TherapistSelectionScreen
    │   ├─ CalendarSelectionScreen
    │   └─ BookingSummaryScreen
    │
    ├─ PaymentScreen
    │
    └─ Modal Overlays
        ├─ ToastDisplay
        ├─ ConfirmDialog
        └─ ErrorBoundary
```

## Type Safety Architecture

### TypeScript Patterns

```typescript
// 1. Interface-driven development
interface Booking {
  id: string;
  serviceId: string;
  therapistId: string;
  date: string;
  time: string;
  // ... more fields
}

// 2. Custom hook types
interface UseBookingReturn {
  bookings: Booking[];
  loading: boolean;
  error: Error | null;
  createBooking(data: BookingData): Promise<Booking>;
}

// 3. Context types
type AuthContextType = {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
};

// 4. Service return types
function getBookings(): Promise<Booking[]> {
  // ...
}

// 5. Strict props typing
interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
}
```

## Performance Considerations

### Optimization Strategies

1. **Memoization**
   - React.memo for components
   - useMemo for expensive calculations
   - useCallback for function stability

2. **Lazy Loading**
   - Code splitting
   - Image lazy loading
   - On-demand service initialization

3. **Caching**
   - useCache hook
   - AsyncStorage persistence
   - API response caching

4. **Batching**
   - Event batch flushing
   - Analytics batch requests
   - Offline sync batching

### Bundle Optimization

```
Current: ~850KB (uncompressed)
- React Native: ~400KB
- Navigation: ~150KB
- Dependencies: ~300KB

Targets:
- Minify: ~300KB
- Gzip: ~80KB
```

## Security Architecture

### Token Management

```
Login → JWT Token
    ↓
AsyncStorage (encrypted)
    ↓
Axios interceptor (attach to requests)
    ↓
401 response → Logout + redirect
    ↓
AsyncStorage (remove token)
```

### Data Protection

- ✅ Tokens in AsyncStorage (encrypted on device)
- ✅ HTTPS enforced for all API calls
- ✅ No passwords stored locally
- ✅ Input validation before API calls
- ✅ PCI compliance ready (payment)

## Testing Strategy

### Test Pyramid

```
E2E Tests (booking flow)
    ↑
Integration Tests (service combinations)
    ↑
Unit Tests (individual functions)
    ↑
Testing Infrastructure (mock data, helpers)
```

### Testing Utilities

```typescript
import { 
  mockUsers, 
  mockBookings, 
  generateTestData,
  assertions 
} from './utils/testingHelpers';

// Use in tests:
const testBooking = buildTestData.booking({ status: 'confirmed' });
expect(assertions.isValidBooking(testBooking)).toBe(true);
```

## Scalability Considerations

### Ready for Growth

✅ Modular architecture (easy to add features)
✅ Service-oriented design (easy to extend)
✅ Context API (scalable state)
✅ TypeScript (maintainability)
✅ Error boundaries (reliability)
✅ Analytics tracking (insights)
✅ Offline support (resilience)
✅ Caching layer (performance)

### Future Enhancements

- State management upgrade (Redux/Zustand) if needed
- GraphQL for complex queries
- PWA for web platform
- Native modules for advanced features
- ML for recommendations

## Development Workflow

```
Feature Branch
    ↓
Development
    ↓
Type Checking (TypeScript)
    ↓
Linting (ESLint)
    ↓
Testing (Jest)
    ↓
Manual Testing
    ↓
Code Review
    ↓
Merge to main
    ↓
Build (EAS)
    ↓
Deploy (TestFlight/Google Play)
```

## Documentation Map

- **README.md** - Quick start guide
- **ARCHITECTURE.md** (this file) - System design
- **DEVELOPMENT.md** - Development setup
- **CONTRIBUTING.md** - Contribution guidelines
- **PAYMENT_INTEGRATION.md** - Payment feature guide
- **API_SPECIFICATION.md** - API endpoints
- **CHANGELOG.md** - Version history

---

**Last Updated:** March 22, 2026  
**Version:** 1.0.0  
**Status:** Production Ready
