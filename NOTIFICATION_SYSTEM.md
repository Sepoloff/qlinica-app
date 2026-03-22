# 🔔 Qlinica Notification System

Complete push notification and local notification system for the Qlinica app.

## Overview

The notification system provides:
- ✅ Push notifications via Expo
- ✅ Local scheduled notifications
- ✅ User preference management
- ✅ Context-aware notification types
- ✅ Notification listeners and handlers
- ✅ Persistent notification settings

## Architecture

### Services

#### `notificationService.ts`
Core notification service handling all notification operations:
- `initializeNotifications()` - Setup and request permissions
- `sendLocalNotification()` - Send immediate notification
- `scheduleNotification()` - Schedule for future time
- `getPushToken()` - Retrieve stored push token
- Specialized notification types (booking, reminder, payment, etc.)

**Key Functions:**
```typescript
// Send confirmation
await sendBookingConfirmationNotification(therapist, service, dateTime);

// Schedule reminder 60 minutes before appointment
await sendAppointmentReminderNotification(therapist, service, date, 60);

// Send cancellation notice
await sendCancellationNotification(therapist, service, originalDate);

// Reschedule notification
await sendRescheduleNotification(therapist, service, newDate, oldDate);

// Payment notification
await sendPaymentNotification(amount, bookingId);

// Review request
await sendReviewRequestNotification(therapist, service, bookingId);
```

### Context

#### `NotificationContext.tsx`
Global notification preferences management:
- Persists settings to AsyncStorage
- Provides `useNotifications()` hook
- Settings include:
  - `enabled` - Master toggle
  - `bookingConfirmation` - Booking confirmation notifications
  - `appointmentReminders` - Appointment reminders
  - `reminderTime` - Minutes before appointment (default: 60)
  - `cancellationNotices` - Cancellation notifications
  - `rescheduling` - Reschedule notifications
  - `paymentNotifications` - Payment notifications
  - `reviewRequests` - Review request notifications

**Usage:**
```typescript
const { settings, updateSettings } = useNotifications();

// Update settings
await updateSettings({ 
  appointmentReminders: false,
  reminderTime: 30 
});
```

### Hooks

#### `useNotificationManager.ts`
Convenient hook for notification operations:
```typescript
const {
  notifyBookingConfirmation,
  scheduleAppointmentReminder,
  notifyCancellation,
  notifyReschedule,
  notifyPayment,
  notifyReviewRequest,
  sendCustomNotification,
  cancel,
} = useNotificationManager({
  onBookingConfirmation: (data) => { /* handle */ },
  onReminder: (data) => { /* handle */ },
  onCancellation: (data) => { /* handle */ },
  onReschedule: (data) => { /* handle */ },
  onPayment: (data) => { /* handle */ },
  onReview: (data) => { /* handle */ },
});
```

All methods respect user notification settings automatically.

### Components

#### `NotificationPreferences.tsx`
Beautiful UI component for managing notification settings:
```typescript
import NotificationPreferences from './components/NotificationPreferences';

<NotificationPreferences 
  onSave={() => console.log('Saved!')}
  showSaveButton={true}
/>
```

Features:
- Master toggle for all notifications
- Individual toggles for each notification type
- Configurable reminder time (in minutes)
- Real-time validation
- Error handling
- Beautiful UI with badges and categories

## Integration Examples

### 1. Notify on Booking Confirmation

**In BookingSummaryScreen.tsx:**
```typescript
const { notifyBookingConfirmation } = useNotificationManager();
const { user } = useAuth();

const handleConfirmBooking = async (bookingData) => {
  // ... API call to create booking
  
  // Notify user
  await notifyBookingConfirmation(
    bookingData.therapistName,
    bookingData.serviceName,
    new Date(bookingData.dateTime)
  );
};
```

### 2. Schedule Appointment Reminder

**In HomeScreen or BookingsScreen:**
```typescript
const { scheduleAppointmentReminder } = useNotificationManager();

// When loading bookings
const loadBookings = async () => {
  const bookings = await api.getBookings();
  
  // Schedule reminders for upcoming appointments
  bookings.forEach(booking => {
    const appointmentDate = new Date(booking.dateTime);
    scheduleAppointmentReminder(
      booking.therapistName,
      booking.serviceName,
      appointmentDate
    );
  });
};
```

### 3. Handle Notification Taps

**In App.tsx or top-level screen:**
```typescript
const { notifyBookingConfirmation } = useNotificationManager({
  onBookingConfirmation: (data) => {
    console.log('User tapped booking notification:', data);
    // Navigate to booking details, etc.
  },
  onReminder: (data) => {
    // Handle reminder tap
  },
});
```

### 4. Custom Notifications

```typescript
const { sendCustomNotification } = useNotificationManager();

await sendCustomNotification(
  'Special Offer',
  'Get 20% off your next booking!',
  { offerId: '123', discount: 0.2 }
);
```

### 5. Access Push Token for Backend

```typescript
import { getPushToken } from './services/notificationService';

const token = await getPushToken();
// token.token - The actual push token
// token.device - Device model
// token.deviceName - Device name
// token.lastUpdated - When it was last updated
```

## Configuration

### Expo Setup

Add to `app.json`:
```json
{
  "expo": {
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#D4AF8F"
        }
      ]
    ]
  }
}
```

### Environment Variables

Set in `.env` or `app.json`:
```
EXPO_PUBLIC_PROJECT_ID=your-expo-project-id
```

## Notification Types

### 1. Booking Confirmation 📋
- **When:** After user confirms booking
- **Content:** Therapist name, service, date/time
- **Trigger:** `booking`
- **Controllable:** `bookingConfirmation` setting

### 2. Appointment Reminder 🕐
- **When:** Before appointment (configurable minutes)
- **Content:** Therapist name, time remaining
- **Trigger:** `reminder`
- **Controllable:** `appointmentReminders` + `reminderTime` settings

### 3. Cancellation Notice ❌
- **When:** After booking cancellation
- **Content:** Therapist, service, original date
- **Trigger:** `cancellation`
- **Controllable:** `cancellationNotices` setting

### 4. Reschedule Notification 📅
- **When:** After booking rescheduled
- **Content:** Therapist, old date, new date
- **Trigger:** `reschedule`
- **Controllable:** `rescheduling` setting

### 5. Payment Notification 💳
- **When:** After payment successful
- **Content:** Amount, booking ID
- **Trigger:** `payment`
- **Controllable:** `paymentNotifications` setting

### 6. Review Request ⭐
- **When:** After appointment completed
- **Content:** Therapist name, service
- **Trigger:** `review`
- **Controllable:** `reviewRequests` setting

## Data Structure

### Notification Payload

```typescript
interface NotificationPayload {
  title: string;           // Display title
  body: string;            // Notification body/message
  data?: {                 // Custom data
    type: string;          // Notification type (trigger)
    [key: string]: any;    // Additional data
  };
  trigger: string;         // Type identifier for handlers
}
```

### Push Token Data

```typescript
interface PushTokenData {
  token: string;           // Expo push token
  device: string;          // Device model name
  deviceName?: string;     // Device friendly name
  lastUpdated: number;     // Timestamp in ms
}
```

## Best Practices

### 1. Respect User Preferences
Always use `useNotificationManager` which automatically respects settings:
```typescript
// ✅ Good - automatically checks settings
const { notifyBookingConfirmation } = useNotificationManager();
await notifyBookingConfirmation(...);

// ❌ Avoid - bypasses user settings
import { sendBookingConfirmationNotification } from './services';
await sendBookingConfirmationNotification(...);
```

### 2. Schedule in Background
Schedule notifications as soon as booking is created:
```typescript
const handleBooking = async () => {
  const booking = await api.createBooking(data);
  
  // Schedule reminder immediately
  scheduleAppointmentReminder(...);
};
```

### 3. Handle All Notification Types
Setup handlers for all notification types in App.tsx:
```typescript
useNotificationManager({
  onBookingConfirmation: handleBookingTap,
  onReminder: handleReminderTap,
  onCancellation: handleCancellationTap,
  onReschedule: handleRescheduleTap,
  onPayment: handlePaymentTap,
  onReview: handleReviewTap,
});
```

### 4. Validate Dates
Never schedule notifications for past dates:
```typescript
const reminderDate = new Date(appointmentDate);
reminderDate.setMinutes(reminderDate.getMinutes() - 60);

if (reminderDate > new Date()) {
  await scheduleAppointmentReminder(...);
}
```

### 5. Handle Errors Gracefully
Notifications should fail silently:
```typescript
try {
  await notifyBookingConfirmation(...);
} catch (error) {
  console.warn('Notification failed (non-critical):', error);
  // Continue without throwing
}
```

## Testing

### Local Testing

```typescript
import { sendLocalNotification } from './services/notificationService';

// Test immediate notification
await sendLocalNotification({
  title: 'Test',
  body: 'This is a test notification'
});

// Test scheduled notification
await sendLocalNotification(
  { title: 'Test', body: 'In 5 seconds' },
  5 // seconds
);
```

### Mock Notifications

```typescript
const { sendCustomNotification } = useNotificationManager();

// Send test notifications
await sendCustomNotification('Test Booking', 'Test booking confirmation');
await sendCustomNotification('Test Reminder', 'Test appointment reminder');
```

## Troubleshooting

### Notifications Not Appearing

1. **Check settings:**
   ```typescript
   const { settings } = useNotifications();
   console.log(settings);
   ```

2. **Verify permissions granted:**
   ```typescript
   const { status } = await Notifications.getPermissionsAsync();
   console.log(status); // Should be 'granted'
   ```

3. **Check if on physical device:**
   - Notifications only work on physical devices
   - Not supported in simulator/emulator for push notifications

4. **Verify app is initialized:**
   ```typescript
   const token = await initializeNotifications();
   console.log('Token:', token);
   ```

### Notifications Not Respecting Settings

Always use `useNotificationManager` hook - it respects settings automatically.

### Scheduled Notifications Not Firing

- Check notification ID is valid
- Verify date is in the future
- Check device isn't in Do Not Disturb mode
- Ensure app permissions are granted

## API Integration

### Send Push Token to Backend

After getting the token, send to your backend:

```typescript
const token = await getPushToken();

await api.post('/api/users/push-token', {
  pushToken: token.token,
  device: token.device,
  deviceName: token.deviceName,
});
```

### Receiving Backend Notifications

```typescript
const { notifyBookingConfirmation } = useNotificationManager({
  onBookingConfirmation: (data) => {
    // User tapped a notification from your backend
    // data contains whatever your backend sent
  },
});
```

## Statistics & Metrics

Track notification engagement:

```typescript
const { notifyBookingConfirmation } = useNotificationManager();

const trackNotification = async (type: string) => {
  await api.post('/api/analytics/notification', {
    type,
    timestamp: new Date(),
    userId: user.id,
  });
};

// After sending notification
await notifyBookingConfirmation(...);
await trackNotification('booking_confirmation');
```

## Future Enhancements

- [ ] Badge counter (app icon)
- [ ] Sound customization
- [ ] Vibration patterns
- [ ] Silent notifications
- [ ] Notification grouping
- [ ] In-app notification center
- [ ] Notification history
- [ ] Smart delivery optimization
- [ ] A/B testing notifications
- [ ] Machine learning optimization

---

**Last Updated:** 22 March 2026  
**Version:** 1.0.0  
**Status:** Production Ready ✅
