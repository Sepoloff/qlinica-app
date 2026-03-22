# API Integration Guide - Qlinica App

This guide explains how to use the new API service layer and custom hooks for seamless backend integration.

---

## 📚 Architecture Overview

The API integration is built in three layers:

```
┌─────────────────────────────────────────┐
│      React Components / Screens         │
├─────────────────────────────────────────┤
│      Custom Hooks (useBookingAPI, etc)  │
├─────────────────────────────────────────┤
│      API Service Layer (apiService.ts)  │
├─────────────────────────────────────────┤
│      Axios + Interceptors (config/api)  │
├─────────────────────────────────────────┤
│      Backend REST API                   │
└─────────────────────────────────────────┘
```

---

## 🔌 API Service Overview

### Location
`/src/services/apiService.ts`

### Features
- ✅ Full TypeScript support
- ✅ Error handling and logging
- ✅ Exponential backoff retry logic (handled in config/api.ts)
- ✅ JWT token management (via interceptors)
- ✅ Mock data fallbacks
- ✅ Comprehensive logging

### Main API Objects

#### `authAPI`
```typescript
await authAPI.login(email, password)           // → { token, user }
await authAPI.register(email, password, name)  // → { token, user }
await authAPI.logout()
await authAPI.getProfile()                     // → User
await authAPI.updateProfile(data)              // → User
await authAPI.changePassword(current, new)
await authAPI.requestPasswordReset(email)
await authAPI.resetPassword(token, newPassword)
```

#### `servicesAPI`
```typescript
await servicesAPI.getAll()                     // → Service[]
await servicesAPI.getById(id)                  // → Service | null
```

#### `therapistsAPI`
```typescript
await therapistsAPI.getAll()                   // → Therapist[]
await therapistsAPI.getById(id)                // → Therapist | null
await therapistsAPI.getBySpecialty(specialty)  // → Therapist[]
await therapistsAPI.getAvailability(therapistId, startDate, endDate)
                                               // → Record<date, times[]>
```

#### `bookingsAPI`
```typescript
await bookingsAPI.getAll()                     // → Booking[]
await bookingsAPI.getById(id)                  // → Booking | null
await bookingsAPI.create(data)                 // → Booking
await bookingsAPI.update(id, data)             // → Booking
await bookingsAPI.cancel(id)
await bookingsAPI.reschedule(id, date, time)   // → Booking
```

---

## 🎣 Custom Hooks

### 1. useServices Hook

**Purpose:** Fetch and manage services list

**Usage:**
```typescript
import { useServices } from '../hooks/useDataAPI';

export function ServiceListScreen() {
  const { services, isLoading, error, refresh, getService } = useServices();

  // Hook automatically fetches on mount
  // services → Service[]
  // isLoading → boolean
  // error → string | null
  // refresh() → manually refresh services
  // getService(id) → Service | undefined
}
```

**Example with UI:**
```typescript
function ServiceListScreen() {
  const { services, isLoading, error } = useServices();

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorBanner message={error} />;

  return (
    <FlatList
      data={services}
      renderItem={({ item }) => <ServiceCard service={item} />}
    />
  );
}
```

---

### 2. useTherapists Hook

**Purpose:** Fetch and manage therapists with filtering

**Usage:**
```typescript
import { useTherapists } from '../hooks/useDataAPI';

export function TherapistSelectionScreen() {
  const { 
    therapists, 
    isLoading, 
    error, 
    refresh, 
    getTherapist,
    filterByRating,
    searchByName 
  } = useTherapists();

  // Advanced usage
  const topRated = filterByRating(4.5);
  const searchResults = searchByName('João');
}
```

---

### 3. useTherapistAvailability Hook

**Purpose:** Fetch and check therapist availability

**Usage:**
```typescript
import { useTherapistAvailability } from '../hooks/useDataAPI';

export function CalendarSelectionScreen({ therapistId }: Props) {
  const { 
    availability, 
    isLoading, 
    error, 
    fetchAvailability,
    getAvailableSlots,
    isSlotAvailable 
  } = useTherapistAvailability(therapistId);

  useEffect(() => {
    // Fetch availability for date range
    fetchAvailability('2026-03-22', '2026-04-22');
  }, [therapistId]);

  const slots = getAvailableSlots('2026-03-25'); // → ['09:00', '10:00', ...]
  const canBook = isSlotAvailable('2026-03-25', '14:00'); // → boolean
}
```

---

### 4. useBookingAPI Hook

**Purpose:** Complete booking lifecycle management

**Usage:**
```typescript
import { useBookingAPI } from '../hooks/useBookingAPI';

export function BookingsScreen() {
  const {
    bookings,           // Booking[]
    isLoading,
    error,
    fetchBookings,
    fetchBooking,
    createBooking,
    updateBooking,
    cancelBooking,
    rescheduleBooking,
    clearError
  } = useBookingAPI();

  // Fetch on mount
  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Create booking
  const handleBooking = async () => {
    try {
      const booking = await createBooking({
        serviceId: 'service-1',
        therapistId: 'therapist-1',
        date: '2026-03-25',
        time: '14:00',
        notes: 'Optional notes'
      });
      // Automatically shows success toast
      // Bookings state updates automatically
    } catch (err) {
      // Error is handled automatically with toast
    }
  };

  // Cancel booking
  const handleCancel = async () => {
    try {
      await cancelBooking(bookingId);
      // Success toast shown automatically
    } catch (err) {
      // Error handled with toast
    }
  };

  // Reschedule booking
  const handleReschedule = async () => {
    try {
      const updated = await rescheduleBooking(bookingId, '2026-03-26', '15:00');
      // Success toast shown automatically
    } catch (err) {
      // Error handled with toast
    }
  };
}
```

---

## 📋 Quick Implementation Checklist

### For Any New Screen Needing Data

1. **Identify what data you need:**
   - Services → use `useServices`
   - Therapists → use `useTherapists`
   - Availability → use `useTherapistAvailability`
   - Bookings → use `useBookingAPI`

2. **Import the hook:**
   ```typescript
   import { useBookingAPI } from '../hooks/useBookingAPI';
   ```

3. **Use in component:**
   ```typescript
   const { bookings, isLoading, error, fetchBookings } = useBookingAPI();
   ```

4. **Handle states:**
   ```typescript
   if (isLoading) return <LoadingSpinner />;
   if (error) return <ErrorMessage error={error} />;
   // Render data
   ```

5. **Perform actions:**
   ```typescript
   await createBooking(data);  // Toast shown automatically
   ```

---

## 🛡️ Error Handling

All hooks include automatic error handling:

```typescript
const { error, clearError } = useBookingAPI();

// Errors trigger toast notifications automatically
// You can manually clear errors:
clearError();

// Or handle errors manually:
try {
  await createBooking(data);
} catch (err) {
  // Custom error handling
  console.error('Custom handling:', err);
}
```

---

## 🔐 Authentication

JWT tokens are automatically managed:

1. **Login:** Token saved to AsyncStorage
2. **Requests:** Token added to Authorization header
3. **Token Expired:** Automatic logout on 401 response
4. **Logout:** Token removed from storage

No manual token handling needed in components!

---

## 📡 API Response Types

All types are defined in `/src/services/apiService.ts`:

```typescript
interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  preferences?: {...};
}

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  category: string;
}

interface Therapist {
  id: string;
  name: string;
  email: string;
  specialty: string;
  rating: number;
  reviewCount: number;
  avatar?: string;
  availability: {[date: string]: string[]};
}

interface Booking {
  id: string;
  userId: string;
  serviceId: string;
  therapistId: string;
  date: string;      // "YYYY-MM-DD"
  time: string;      // "HH:MM"
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
```

---

## 🔧 Configuration

### Base URL
Set in environment or defaults to:
```
http://localhost:3000/api
```

Override with:
```bash
REACT_APP_API_URL=https://api.qlinica.com
```

### Retry Logic
- Max retries: 3
- Initial delay: 500ms
- Max delay: 8000ms
- Exponential backoff with jitter

### Timeout
- 10 seconds per request

---

## 📝 Best Practices

1. **Always handle loading states:**
   ```typescript
   if (isLoading) return <LoadingSpinner />;
   ```

2. **Display errors to users:**
   ```typescript
   if (error) return <ErrorBanner message={error} />;
   ```

3. **Use try-catch for custom handling:**
   ```typescript
   try {
     await createBooking(data);
   } catch (err) {
     // Custom logic
   }
   ```

4. **Refresh data on focus:**
   ```typescript
   useFocusEffect(
     useCallback(() => {
       refresh();
     }, [refresh])
   );
   ```

5. **Combine hooks for complex flows:**
   ```typescript
   const services = useServices();
   const therapists = useTherapists();
   const availability = useTherapistAvailability(selectedTherapistId);
   const bookings = useBookingAPI();
   ```

---

## 🐛 Debugging

All API calls are logged:

```
[API:Request] GET /api/bookings
[API:Response] GET /api/bookings - 200 (245ms)
[API:Error] Failed to fetch services (500ms, retries: 2)
```

Monitor logs in DevTools console for debugging.

---

## 📚 Related Files

- **API Service:** `/src/services/apiService.ts`
- **Hooks:** `/src/hooks/useBookingAPI.ts`, `/src/hooks/useDataAPI.ts`
- **Config:** `/src/config/api.ts`
- **Types:** `/src/services/apiService.ts` (exports all types)
- **Examples:** `HomeScreen.tsx`, `BookingsScreen.tsx`, `ProfileScreen.tsx`

---

## ✅ Summary

The new API integration provides:

- **Type-safe** data fetching
- **Automatic error handling** with user feedback
- **Loading states** for better UX
- **Token management** (no manual setup)
- **Retry logic** for reliability
- **Fallback to mock data** during development
- **Consistent logging** for debugging

**Start using:** Import a hook → Call methods → Handle loading/error states ✨

