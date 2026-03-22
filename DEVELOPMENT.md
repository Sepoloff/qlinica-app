# Qlinica Development Guide

## 📚 Project Structure

```
qlinica-app/
├── src/
│   ├── screens/
│   │   ├── AuthScreens/
│   │   │   ├── LoginScreen.tsx       # Login with email/password
│   │   │   └── RegisterScreen.tsx    # Registration with validation
│   │   ├── HomeScreen.tsx            # Dashboard with upcoming bookings
│   │   ├── BookingsScreen.tsx        # Booking history & management
│   │   ├── ProfileScreen.tsx         # User profile & preferences
│   │   ├── ServiceSelectionScreen.tsx    # Step 1: Choose service
│   │   ├── TherapistSelectionScreen.tsx  # Step 2: Choose therapist
│   │   ├── CalendarSelectionScreen.tsx   # Step 3: Choose date/time
│   │   └── BookingSummaryScreen.tsx      # Step 4: Confirm booking
│   ├── components/
│   │   ├── Button.tsx                # Reusable button (primary/secondary/danger)
│   │   ├── Card.tsx                  # Card container
│   │   ├── ErrorBoundary.tsx         # Error boundary wrapper
│   │   ├── Header.tsx                # Reusable header with back button
│   │   ├── LoadingSpinner.tsx        # Loading indicator
│   │   ├── TabBarIcon.tsx            # Bottom tab icons
│   │   ├── ToastDisplay.tsx          # Toast notifications
│   │   └── EmptyState.tsx            # Empty state UI
│   ├── context/
│   │   ├── AuthContext.tsx           # Authentication state (login/register/logout)
│   │   ├── BookingContext.tsx        # Booking form state
│   │   └── ToastContext.tsx          # Toast notifications state
│   ├── services/
│   │   └── bookingService.ts         # API calls for bookings
│   ├── config/
│   │   ├── api.ts                    # Axios setup with JWT interceptors
│   │   └── firebase.ts               # Firebase config (optional)
│   ├── constants/
│   │   ├── Colors.ts                 # Color palette
│   │   └── Data.ts                   # Mock data for development
│   ├── utils/
│   │   ├── validation.ts             # Form validation utilities
│   │   └── storage.ts                # AsyncStorage helpers
│   ├── hooks/
│   │   └── useBooking.ts             # Custom hook for booking
│   └── App.tsx                       # Root component with navigation
└── package.json
```

## 🔐 Authentication Flow

### Login/Register
1. User opens app → checks AuthContext for token
2. If no token → shows LoginScreen
3. User can login or navigate to RegisterScreen
4. On successful auth → token saved to AsyncStorage
5. Navigation automatically shows MainTabs

### Protected Routes
- BookingsScreen: Shows user's bookings (requires auth)
- ProfileScreen: Shows user profile (requires auth)
- Booking flow: Requires authentication before confirmation

## 📋 Booking Flow

1. **HomeScreen**: User clicks "Agendar Consulta"
2. **ServiceSelectionScreen**: Choose service (e.g., Fisioterapia)
3. **TherapistSelectionScreen**: Choose therapist from available list
4. **CalendarSelectionScreen**: Choose date and time slot
5. **BookingSummaryScreen**: Review and confirm booking
6. **Success**: Alert + navigate to BookingsScreen

### Data Flow
```
HomeScreen
  ↓
ServiceSelectionScreen (setService in BookingContext)
  ↓
TherapistSelectionScreen (setTherapist in BookingContext)
  ↓
CalendarSelectionScreen (setDateTime in BookingContext)
  ↓
API call: createBooking() with bookingData
  ↓
Success → BookingsScreen
```

## 🎯 Key Features

### Authentication
- ✅ Email/password login
- ✅ Email/password registration
- ✅ Password strength indicator
- ✅ Form validation
- ✅ Auto-login on app start
- ✅ Secure token storage

### Booking Management
- ✅ Step-by-step booking wizard
- ✅ Service selection with descriptions
- ✅ Therapist selection with ratings
- ✅ Date/time slot selection
- ✅ Booking confirmation
- ✅ Booking cancellation
- ✅ Booking rescheduling

### Notifications
- ✅ Toast notifications (success/error/info/warning)
- ✅ Auto-dismiss after 3 seconds
- ✅ Stackable notifications

### UI/UX
- ✅ Dark theme with gold accents
- ✅ Responsive design
- ✅ Loading states
- ✅ Error handling & boundaries
- ✅ Empty states
- ✅ Smooth animations

## 📝 Validation Rules

### Email
- Standard email format
- Must contain @ and domain

### Password
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 number

### Phone (optional)
- Portuguese format: +351 9XXXXXXXX or 9XXXXXXXX

### Name
- Minimum 2 characters
- No numbers

### Booking Dates
- Cannot select dates in the past
- Excludes Sundays by default

## 🔌 API Integration

### Base URL
```
http://localhost:3000/api (development)
```

Set via `REACT_APP_API_URL` environment variable.

### Authentication
- All requests include JWT token in Authorization header
- Expired tokens trigger logout
- Requests auto-retry on network failure

### Endpoints Used

```
POST   /auth/login              # Login
POST   /auth/register           # Register
POST   /auth/logout             # Logout
PUT    /auth/user               # Update user profile
GET    /services                # Get all services
GET    /services/:id            # Get service details
GET    /therapists              # Get all therapists
GET    /therapists/:id          # Get therapist details
GET    /therapists?serviceId=X  # Get therapists by service
GET    /availability/slots      # Get available time slots
POST   /availability/check-dates # Check multiple dates
POST   /bookings                # Create booking
GET    /bookings                # Get user bookings
GET    /bookings/:id            # Get booking details
PUT    /bookings/:id            # Update booking
POST   /bookings/:id/cancel     # Cancel booking
POST   /bookings/:id/reschedule # Reschedule booking
```

## 🧪 Testing

### Test Login
```
Email: test@qlinica.com
Password: Test123
```

### Test Registration
Create account with any valid email/password combo.

### Mock Data
In development, if API calls fail, app falls back to mock data from `constants/Data.ts`.

## 📦 Build & Deploy

### Android
```bash
npm run build-android
# Or with EAS
eas build --platform android
```

### iOS
```bash
npm run build-ios
# Or with EAS
eas build --platform ios
```

### Web
```bash
npm run web
```

## 🛠️ Development Commands

```bash
# Start development server
npm start

# Start with Android emulator
npm run android

# Start with iOS simulator
npm run ios

# Start with web
npm run web

# Build for platforms
npm run build-android
npm run build-ios

# Submit to app stores (after building with EAS)
npm run submit
```

## 🎨 Color Palette

```typescript
primary: '#2C3E50'           // Dark navy
primaryLight: '#34495E'      // Slightly lighter navy
primaryDark: '#1a252f'       // Darker navy
gold: '#D4AF8F'              // Main accent color
goldLight: '#e0c4a8'         // Lighter gold
goldDark: '#b8956f'          // Darker gold
white: '#FFFFFF'             // White
grey: '#8895a0'              // Text color
success: '#4CAF50'           // Green
danger: '#E74C3C'            // Red
```

## 📐 Responsive Design

- **Mobile**: 360px - 480px width (focus)
- **Tablet**: 481px - 1024px width
- **Desktop**: 1025px+ width (via web)

### Safe Area
- Top: Navigation + status bar
- Bottom: Tab bar (mobile)

## 🐛 Error Handling

### Global Error Boundary
Wraps entire app to catch unexpected errors.

### API Error Handling
- Network errors: Show toast + retry logic
- 401 Unauthorized: Auto-logout
- Validation errors: Show field-level errors
- Server errors: Show error toast

### Form Validation
- Real-time validation on change
- Clear error messages
- Disabled submit until valid

## 🚦 Performance Tips

1. **Lazy Loading**: Images load as needed
2. **Memoization**: Components use React.memo
3. **Caching**: User data cached in AsyncStorage
4. **Pagination**: Bookings list pagination (optional)
5. **Image Optimization**: Use expo-image

## 📱 Native Features (Future)

- 📍 Geolocation (show clinic location)
- 📸 Camera (profile picture upload)
- 🔔 Push Notifications (booking reminders)
- 📞 Call/SMS integration
- 🗓️ Calendar integration (iOS/Android)
- 👆 Haptic feedback

## 🔒 Security

- JWT tokens for authentication
- Tokens stored securely in AsyncStorage
- API base URL configurable
- CORS headers configured
- Input validation on all forms
- Password strength requirements

## 📖 Additional Resources

- [React Native Docs](https://reactnative.dev)
- [Expo Docs](https://docs.expo.dev)
- [React Navigation](https://reactnavigation.org)
- [Axios Docs](https://axios-http.com)

## 📝 Contributing

1. Create feature branch: `git checkout -b feature/feature-name`
2. Make changes and commit: `git commit -m "✨ feat: description"`
3. Push: `git push origin feature/feature-name`
4. Create Pull Request

## 📄 Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style
- `refactor`: Refactoring
- `perf`: Performance
- `test`: Tests
- `chore`: Build/dependencies

### Examples
```
✨ feat(auth): Add login validation
🐛 fix(booking): Fix date selection bug
📝 docs: Update README
🎨 style: Format code
♻️ refactor: Simplify booking flow
```

---

**Last Updated**: March 2026
**Status**: Development Phase 1 Complete
