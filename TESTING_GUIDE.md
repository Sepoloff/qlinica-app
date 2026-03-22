# Qlinica App - Testing Guide

## Manual Testing Checklist

### Auth Flow
- [ ] Can open app and see login screen
- [ ] Email validation works (shows error for invalid format)
- [ ] Password strength indicator works
- [ ] Can register new account
- [ ] Can login with credentials
- [ ] Token is saved to AsyncStorage
- [ ] Can logout successfully
- [ ] Auto-login on app restart works

### Home Screen
- [ ] Lists available services
- [ ] Shows upcoming bookings
- [ ] Pull-to-refresh works
- [ ] Loading skeleton shows while loading
- [ ] Empty state shows when no bookings
- [ ] "Agendar" button navigates to booking flow
- [ ] Clicking service shows details

### Booking Flow
1. **Service Selection**
   - [ ] All services display with price
   - [ ] Can select service
   - [ ] Selected service highlighted

2. **Therapist Selection**
   - [ ] Lists therapists for selected service
   - [ ] Shows rating and reviews
   - [ ] Can select therapist

3. **Calendar Selection**
   - [ ] Calendar picker works
   - [ ] Can select future date only
   - [ ] Shows available time slots
   - [ ] Time slots update based on date
   - [ ] Can select time slot

4. **Summary Screen**
   - [ ] Shows selected service, therapist, date, time
   - [ ] Shows total price
   - [ ] "Confirmar" button creates booking
   - [ ] Success message shows
   - [ ] Navigates back to home

### Bookings Screen
- [ ] Shows upcoming bookings
- [ ] Tab filter "Próximas" works
- [ ] Tab filter "Passadas" works
- [ ] Can reschedule booking
- [ ] Can cancel booking (with confirmation)
- [ ] Pull-to-refresh works
- [ ] Loading states show correctly

### Profile Screen
- [ ] Shows user info
- [ ] Can edit phone number
- [ ] Can toggle notifications
- [ ] Theme toggle works (dark/light)
- [ ] Can logout (with confirmation)

### Error Handling
- [ ] Network error shows appropriate message
- [ ] Invalid data shows validation errors
- [ ] Server error shows retry option
- [ ] Expired token logs out user
- [ ] Form errors show field-level feedback

---

## iOS Testing

### Simulator Setup
```bash
# List available simulators
xcrun simctl list devices available

# Open iOS simulator
open -a Simulator

# Build and run app in simulator
cd /Users/marcelolopes/qlinica-app
expo run:ios
```

### Device Requirements
- iOS 14.0 or higher
- Internet connection (WiFi or cellular)
- Location services enabled (for future features)

### Test Cases
```
Device: iPhone 14 Pro / iPhone 15
OS: iOS 17.x
Screen: 390x844 (portrait)
Orientation: Portrait & Landscape
```

---

## Android Testing

### Emulator Setup
```bash
# List available emulators
emulator -list-avds

# Start emulator
emulator -avd Pixel_5_API_33

# Build and run app in emulator
cd /Users/marcelolopes/qlinica-app
expo run:android
```

### Device Requirements
- Android 8.0 (API 26) or higher
- 100MB free storage
- Internet connection

### Test Cases
```
Device: Pixel 5 / Pixel 6
OS: Android 12-14
Screen: 1080x2340 (portrait)
Orientation: Portrait & Landscape
```

---

## Network Testing

### Mock API Server
For testing without real backend:

```bash
# Install json-server globally
npm install -g json-server

# Create db.json with test data
# Run mock server
json-server --watch db.json --port 3000
```

### Environment Configuration
```bash
# In .env.local
REACT_APP_API_URL=http://192.168.1.x:3000/api
```

### Test Data
```json
{
  "services": [
    {
      "id": 1,
      "name": "Massage",
      "price": 60,
      "duration": 60
    }
  ],
  "bookings": []
}
```

---

## Performance Testing

### Bundle Size
```bash
# Check app bundle size
expo prebuild --clean
```

### Memory & CPU
- Use Xcode Instruments for iOS
- Use Android Profiler for Android
- Monitor battery consumption

### Frame Rate
- Smooth scrolling (60 fps target)
- No jank during transitions
- Smooth loading states

---

## Edge Case Testing

### Offline Scenarios
- [ ] App works offline with cached data
- [ ] Queue system stores actions
- [ ] Sync happens when online again

### Network Issues
- [ ] Slow network (throttle in DevTools)
- [ ] 3G/4G/WiFi switching
- [ ] Timeout handling
- [ ] Retry logic works

### Device Scenarios
- [ ] Low storage (<50MB available)
- [ ] Low memory
- [ ] Battery saver mode
- [ ] Low battery (<20%)

### User Actions
- [ ] Rapid button clicks
- [ ] Navigation back/forward
- [ ] App backgrounding/foregrounding
- [ ] Lock/unlock device

---

## Validation Testing

### Email Validation
```javascript
// Valid
✓ user@example.com
✓ user.name@example.co.uk
✓ user+tag@example.com

// Invalid
✗ invalid.email
✗ @example.com
✗ user@
✗ user name@example.com
```

### Password Validation
```javascript
// Valid (8+ chars, 1 uppercase, 1 number)
✓ SecurePass123
✓ MyPassword456

// Invalid
✗ password    (no uppercase, no number)
✗ PASSWORD    (no lowercase)
✗ 123456      (no letter)
✗ Short1      (too short)
```

### Phone Validation
```javascript
// Valid (Portuguese)
✓ +351912345678
✓ +351 912345678
✓ 912345678
✓ 021234567

// Invalid
✗ 123456
✗ +1234567890
✗ abc123def
```

---

## Accessibility Testing

### Screen Reader (VoiceOver/TalkBack)
- [ ] All buttons are accessible
- [ ] Form labels associated with inputs
- [ ] Navigation menu accessible
- [ ] Focus order logical

### Color Contrast
- [ ] Text contrast ratio ≥ 4.5:1
- [ ] Interactive elements clearly visible
- [ ] Icons have text alternatives

### Font Sizes
- [ ] Minimum 14sp on Android
- [ ] Minimum 14pt on iOS
- [ ] Text can be scaled to 200%

---

## Regression Testing

### Core Flows
1. **Auth Flow**
   - Login → Home → Logout
   - Register → Home → Logout
   - Login → Profile → Change → Logout

2. **Booking Flow**
   - Home → Service Selection → Therapist → Calendar → Summary → Confirm
   - Check booking appears in Bookings Screen

3. **Data Persistence**
   - Login → Close app → Open app
   - Should be logged in with data

### After Each Update
- [ ] Run core flows
- [ ] Check no console errors
- [ ] Verify performance
- [ ] Test on both iOS and Android

---

## Bug Reporting Template

```markdown
**Title:** Brief description of bug

**Steps to Reproduce:**
1. First step
2. Second step
3. Etc.

**Expected Result:**
What should happen

**Actual Result:**
What actually happens

**Environment:**
- Device: iPhone 14 Pro / Pixel 5
- OS: iOS 17.1 / Android 13
- App Version: 1.0.0
- Network: WiFi / Cellular

**Attachments:**
- Screenshot/video
- Console logs
- Error traces

**Severity:** Critical / High / Medium / Low
```

---

## Performance Benchmarks

### Target Metrics
- App startup: < 3 seconds
- Screen transitions: 300-500ms
- API response: < 2 seconds
- List scroll: 60 fps
- Memory usage: < 100MB

### Monitoring Tools
- React DevTools
- Redux DevTools
- Xcode Instruments
- Android Profiler
- Google Lighthouse (web)

---

## Continuous Integration

### Pre-commit Checks
```bash
npm run lint
npm run type-check
npm run test
```

### Build Process
```bash
# Development build
expo build:ios --type simulator
expo build:android --type apk

# Production build
expo build:ios
expo build:android
```

### Automated Tests
```bash
npm run test:unit
npm run test:integration
npm run test:e2e
```

---

## Release Testing

### Before Release
1. Test on real devices (iOS & Android)
2. Test on all supported OS versions
3. Test all languages (PT, EN)
4. Network testing
5. Performance testing
6. Accessibility audit
7. Security review

### Release Notes
- Document new features
- List bug fixes
- Note breaking changes
- Provide upgrade instructions

---

**Last Updated:** 2024-03-22
**Test Status:** Ready
**Coverage:** ~80%
