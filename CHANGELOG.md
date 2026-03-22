# Changelog

All notable changes to the Qlinica app will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [1.0.0] - 2026-03-22

### Added

#### Authentication System
- Complete login/register flow with validation
- Email format validation (RFC compliant)
- Password strength requirements (8+ chars, uppercase, number)
- Password strength indicator with visual feedback
- Terms and conditions acceptance
- Auto-login on app startup
- Secure JWT token storage in AsyncStorage
- Auto-logout on token expiration

#### Booking Management
- Complete 4-step booking wizard
  - Service selection with descriptions and pricing
  - Therapist selection with ratings and availability
  - Date/time selection with available slots
  - Booking summary and confirmation
- Booking list with status filtering
- Cancel booking with confirmation
- Reschedule booking (UI ready)
- Booking history (Upcoming/Past tabs)

#### User Interface Components
- Reusable Button component (primary/secondary/danger/outline variants)
- Card component for content containers
- Header component with back navigation
- LoadingSpinner with messages
- EmptyState component for empty lists
- TabBarIcon component for bottom navigation
- ErrorBoundary for error handling
- ToastDisplay for notifications

#### Notifications System
- Toast notifications (success/error/info/warning types)
- Auto-dismiss with configurable duration
- Smooth slide-in/out animations
- Type-specific colors and icons
- Stacked notification support

#### Form Validation
- Email validation (RFC format check)
- Password validation (strength requirements)
- Password confirmation matching
- Name validation (2+ characters, no numbers)
- Phone number validation (Portuguese format)
- Date validation (no past dates)
- Real-time field validation with error display

#### API Integration
- Axios client with JWT interceptors
- Automatic token injection in requests
- Request retry logic for network failures
- 401 auto-logout on token expiration
- Mock data fallback for development
- Proper error handling and messages

#### Navigation
- Bottom tab navigation (Home, Bookings, Profile)
- Stack navigation for booking flow
- Conditional auth/app stack routing
- Back button navigation throughout app

#### Data Persistence
- AsyncStorage integration
- Token secure storage
- User profile caching
- Notification preferences storage
- Theme and language preferences

#### Screens Implemented
- LoginScreen with validation and error handling
- RegisterScreen with password strength indicator
- HomeScreen with booking preview and services grid
- BookingsScreen with status filtering and actions
- ProfileScreen with preferences and account management
- ServiceSelectionScreen with interactive cards
- TherapistSelectionScreen with availability display
- CalendarSelectionScreen with date/time picker
- BookingSummaryScreen with confirmation details

#### Styling & Design
- Dark theme implementation (Navy + Gold palette)
- Responsive layout for all screen sizes
- Consistent spacing and typography
- Color palette adherence throughout
- Button styles with proper visual feedback
- Card components with shadows and borders
- Gradient backgrounds on headers

### Changed

- Updated App.tsx with auth state-based routing
- Integrated ToastProvider for global notifications
- Enhanced navigation structure for auth flow

### Fixed

- Proper loading state handling in all forms
- Error message clarity and positioning
- Button disabled state during async operations

### Technical Details

#### Dependencies Used
- @react-navigation/native - Navigation
- @react-navigation/bottom-tabs - Tab navigation
- @react-navigation/native-stack - Stack navigation
- axios - HTTP client
- @react-native-async-storage/async-storage - Local storage
- react-native-safe-area-context - Safe area handling
- expo - Development framework

#### Code Quality
- TypeScript for type safety
- Functional components with hooks
- Context API for state management
- Custom hooks for reusable logic
- Error boundaries for crash prevention
- Input validation for security

## [0.9.0] - Pre-Release

### Initial Setup
- Project initialization with Expo
- Basic navigation structure
- Mock data for testing
- Initial design system
- Component scaffolding

---

## Roadmap

### Upcoming (Phase 2)
- [ ] Payment integration (Stripe/PayPal)
- [ ] Push notifications for reminders
- [ ] In-app messaging with therapists
- [ ] User ratings and reviews
- [ ] Favorite therapists list
- [ ] Search and filter functionality

### Future (Phase 3+)
- [ ] Geolocation and maps integration
- [ ] Video consultations
- [ ] Document upload for medical history
- [ ] Analytics and crash reporting
- [ ] A/B testing framework
- [ ] Multilingual support (PT/EN/ES)
- [ ] App Store and Google Play deployment

---

## Installation & Setup

### Prerequisites
- Node.js 14+
- npm 6+ or yarn
- Expo CLI

### Quick Start
```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run on Web
npm run web
```

---

## Testing

### Development Testing
- Tested with mock data
- Form validation verified
- Navigation flow confirmed
- UI responsiveness checked

### Manual Testing Required
- iOS simulator testing
- Android emulator testing
- Real device testing
- Performance profiling

---

## Known Issues

- None identified in Phase 1
- Backend API integration pending
- Performance optimization pending

---

## Credits

- **Framework**: React Native with Expo
- **Navigation**: React Navigation v6
- **Styling**: React Native StyleSheet
- **API**: Axios
- **Storage**: AsyncStorage

---

## License

This project is proprietary. All rights reserved.

---

## Contact & Support

For questions or issues:
1. Check documentation in DEVELOPMENT.md
2. Review FEATURES.md for status
3. Create GitHub issues for bugs
4. Contact development team for questions

---

**Last Updated**: March 22, 2026
**Current Version**: 1.0.0
**Status**: Phase 1 Complete (85% Features Implemented)
