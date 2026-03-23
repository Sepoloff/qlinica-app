# 🏥 Qlinica App - Development Guide

## Quick Start

```bash
# Install dependencies
npm install

# Start Metro bundler
npx expo start

# Options:
# Press 'i' for iOS Simulator
# Press 'a' for Android Emulator
# Press 'w' for Web
```

## Project Structure

```
src/
├── screens/               # All app screens (TabNavigator + Flow screens)
│   ├── HomeScreen.tsx     # Dashboard with upcoming bookings
│   ├── BookingsScreen.tsx # User's bookings list
│   ├── ProfileScreen.tsx  # User profile & settings
│   └── AuthScreens/       # Login, Register, Password Reset
├── components/            # Reusable UI components
│   ├── Button.tsx         # Custom styled button
│   ├── FormInput.tsx      # Form field with validation
│   └── ...
├── context/              # React Context for state management
│   ├── AuthContext.tsx    # User authentication
│   ├── BookingContext.tsx # Booking workflow state
│   └── ...
├── hooks/                # Custom React hooks
│   ├── useFormValidation.ts    # Form field validation
│   ├── useAsyncOperation.ts    # Async operations with states
│   ├── useAnalytics.ts         # Event tracking
│   └── ...
├── services/             # Business logic & API calls
│   ├── bookingService.ts # Booking CRUD operations
│   ├── authService.ts    # Authentication calls
│   └── ...
├── config/               # Configuration files
│   ├── api.ts            # Axios instance with interceptors
│   └── Colors.ts         # Design tokens
├── utils/                # Utility functions
│   ├── logger.ts         # Centralized logging
│   ├── storage.ts        # AsyncStorage helpers
│   └── ...
└── constants/            # Constants
    ├── Colors.ts         # Brand colors
    ├── Data.ts           # Mock data
    └── Screens.ts        # Screen names

```

## Key Technologies

- **React Native 0.72.10** - UI Framework
- **Expo SDK 54** - Build & deployment
- **React Navigation** - Navigation (Tab + Stack)
- **Axios** - HTTP client with retry logic
- **React Context** - State management
- **TypeScript** - Type safety

## Development Workflow

### 1. Create a New Screen

```tsx
// src/screens/MyNewScreen.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAnalytics } from '../hooks/useAnalytics';

export default function MyNewScreen() {
  const { trackScreenView } = useAnalytics();

  useFocusEffect(
    React.useCallback(() => {
      trackScreenView('my_new_screen');
    }, [trackScreenView])
  );

  return (
    <View style={styles.container}>
      <Text>My New Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
```

### 2. Add a New Hook

```typescript
// src/hooks/useMyHook.ts
import { useState, useCallback } from 'react';
import { logger } from '../utils/logger';

export const useMyHook = () => {
  const [state, setState] = useState(null);

  const doSomething = useCallback(() => {
    logger.info('Doing something...');
    // Implementation
  }, []);

  return { state, doSomething };
};
```

### 3. API Integration

```typescript
// In your component
import { useAsyncOperation } from '../hooks/useAsyncOperation';
import { api } from '../config/api';

const { data, loading, error, execute } = useAsyncOperation(
  () => api.get('/api/endpoint'),
  {
    onSuccess: (data) => console.log('Success:', data),
    onError: (error) => console.error('Error:', error),
  }
);

// Call when needed
execute();
```

## Styling Guide

### Colors
- **Primary (Navy):** `#2C3E50`
- **Secondary (Gold):** `#D4AF8F`
- **Dark:** `#1a252f`
- **Light:** `#ffffff`

### Fonts
- **Headings:** Cormorant Garamond
- **Body:** DM Sans

### Spacing Scale
```
xs: 4px
sm: 8px
md: 16px
lg: 24px
xl: 32px
```

## Common Tasks

### Show Toast Notification
```typescript
import { useToast } from '../context/ToastContext';

const { showToast } = useToast();

showToast({
  type: 'success', // 'success' | 'error' | 'info'
  title: 'Sucesso!',
  message: 'Operação completada',
});
```

### Track Analytics Event
```typescript
import { useAnalytics } from '../hooks/useAnalytics';

const { trackEvent } = useAnalytics();

trackEvent('booking_created', {
  serviceId: '123',
  therapistId: '456',
});
```

### Form Validation
```typescript
import { useFormValidation } from '../hooks/useFormValidation';

const { errors, validateField, handleChange, handleBlur } = useFormValidation({
  email: { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  password: { required: true, minLength: 8 },
});
```

### Async Operations
```typescript
import { useAsyncOperation } from '../hooks/useAsyncOperation';

const { data, loading, error, execute, retry } = useAsyncOperation(
  () => fetchData(),
  { timeout: 5000 }
);
```

## Testing Credentials

```
Email: maria@qlinica.pt
Password: demo123456
```

## Backend API

**Base URL:** `http://localhost:3000/api`

### Key Endpoints
- `POST /auth/login` - Login
- `GET /services` - List services
- `GET /therapists` - List therapists
- `POST /bookings` - Create booking
- `GET /bookings` - User's bookings
- `GET /bookings/:id` - Booking details

## Debugging

### Enable Debug Logging
```typescript
import { logger } from './utils/logger';

logger.setLevel('DEBUG');
```

### Metro Bundler
- iOS Simulator: Press `i` in Metro terminal
- Android: Press `a` in Metro terminal
- Web: Press `w` in Metro terminal
- Reload: Press `r`
- Debug: Press `j`

## Common Issues

### "Port 8081 is already in use"
```bash
# Kill the process on that port
lsof -ti:8081 | xargs kill -9

# Or use a different port
npx expo start --port 8082
```

### "Module not found" errors
```bash
# Clear cache and reinstall
rm -rf node_modules
npm install
```

### iOS build fails
```bash
# Clean derived data
rm -rf ~/Library/Developer/Xcode/DerivedData/*

# Reinstall pods
cd ios
pod install --repo-update
cd ..
```

## Performance Tips

1. **Use `React.memo` for components** that don't need frequent re-renders
2. **Memoize callbacks** with `useCallback` and computed values with `useMemo`
3. **Use FlatList** for long lists (auto-virtualization)
4. **Optimize images** - use WebP format when possible
5. **Avoid unnecessary state updates** - lift state up only when needed

## Deployment

### iOS App Store
```bash
eas build --platform ios
eas submit --platform ios
```

### Android Play Store
```bash
eas build --platform android
eas submit --platform android
```

## Additional Resources

- [React Native Docs](https://reactnative.dev)
- [Expo Docs](https://docs.expo.dev)
- [React Navigation](https://reactnavigation.org)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)

## Support

For issues or questions, check:
1. Console logs (Metro terminal)
2. Redux DevTools (if using Redux)
3. React Native Debugger
4. Network tab (API calls)

Happy coding! 🚀
