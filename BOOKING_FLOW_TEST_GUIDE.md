# Booking Flow Manual Testing Guide

**Date:** 2026-03-23  
**Version:** 1.0.0  
**Status:** Complete

## Overview

This guide provides step-by-step instructions for manually testing the complete booking flow in the Qlinica app, including all error scenarios and edge cases.

## Prerequisites

- iOS Simulator running (or physical iPhone)
- App built and running: `npm start` or `expo start`
- Test account created or able to create one
- Network connectivity available

## Test Environment

- **App Version:** 1.0.0
- **Platform:** iOS (tested)
- **Framework:** React Native + Expo
- **Navigation:** React Navigation with Stack Navigator

---

## Part 1: Authentication Flow

### Test 1.1: Login with Valid Credentials

**Steps:**
1. Launch app - should see LoginScreen
2. Enter valid email (e.g., test@qlinica.com)
3. Enter valid password (e.g., Password123)
4. Tap "Entrar" button
5. Should navigate to Home screen after ~2 seconds

**Expected Results:**
- ✓ Form validates in real-time
- ✓ Email field shows valid indicator when correct format
- ✓ Password field shows strength meter
- ✓ Login button enables only when all fields valid
- ✓ Loading state shows during API call
- ✓ Toast notification: "✅ Login bem-sucedido!"
- ✓ Navigates to MainTabs (Home/Bookings/Profile)

### Test 1.2: Login with Invalid Email

**Steps:**
1. Enter invalid email (e.g., "notanemail")
2. Tab out of field
3. Observe validation feedback

**Expected Results:**
- ✓ Real-time error message appears
- ✓ Email field shows error indicator (❌)
- ✓ Login button remains disabled
- ✓ Error clears when valid email entered

### Test 1.3: Login with Weak Password

**Steps:**
1. Enter email: test@qlinica.com
2. Enter weak password (e.g., "123")
3. Observe password feedback

**Expected Results:**
- ✓ Password strength indicator shows weakness
- ✓ Helpful message: "Mínimo 6 caracteres"
- ✓ Login button disabled until stronger password

### Test 1.4: Rate Limiting

**Steps:**
1. Enter wrong password 3 times
2. Try to login again immediately

**Expected Results:**
- ✓ After 3 failed attempts, button disabled
- ✓ Toast: "🔒 Demasiadas tentativas..."
- ✓ Cooldown for 60 seconds
- ✓ Button re-enables after cooldown

---

## Part 2: Navigation & Back Button

### Test 2.1: Login to Home

**Steps:**
1. Complete login successfully
2. Should land on Home tab

**Expected Results:**
- ✓ Bottom tab bar shows (Home, Bookings, Profile)
- ✓ Home tab is active (gold color)

### Test 2.2: Navigate to New Booking

**Steps:**
1. From Home screen
2. Tap "Nova Marcação" button (or similar)
3. Should navigate to ServiceSelection

**Expected Results:**
- ✓ ServiceSelection screen appears
- ✓ Back button (← Voltar) visible
- ✓ Progress indicator shows "Step 1 of 4"

---

## Part 3: Service Selection

### Test 3.1: Load Services

**Steps:**
1. Navigate to ServiceSelection
2. Observe loading state

**Expected Results:**
- ✓ Skeleton loaders appear briefly (3 loaders)
- ✓ Services load within 2-3 seconds
- ✓ Smooth transition to service cards
- ✓ All 5+ service cards visible
- ✓ Each card shows: icon, name, duration, price

### Test 3.2: Select Service

**Steps:**
1. Tap on "Massagem Terapêutica" service
2. Observe selection effect

**Expected Results:**
- ✓ Card shows selected state (highlighted)
- ✓ Toast: "Massagem Terapêutica selecionado com sucesso"
- ✓ Loading state appears briefly
- ✓ Navigates to TherapistSelection after ~300ms
- ✓ Previous service remains selected if back button used

### Test 3.3: Error Handling - Network Error

**Steps:**
1. Turn off network (airplane mode)
2. Navigate to ServiceSelection
3. Observe fallback behavior

**Expected Results:**
- ✓ Services load from mock data (fallback)
- ✓ No error message displayed (graceful fallback)
- ✓ User can continue booking with mock data

### Test 3.4: Back Button

**Steps:**
1. From ServiceSelection
2. Tap "← Voltar"
3. Should return to Home

**Expected Results:**
- ✓ Smooth transition back
- ✓ Previous navigation state maintained

---

## Part 4: Therapist Selection

### Test 4.1: Load Therapists

**Steps:**
1. From ServiceSelection, select any service
2. Navigate to TherapistSelection
3. Observe loading

**Expected Results:**
- ✓ Skeleton loaders appear (3 loaders)
- ✓ Therapists load within 2-3 seconds
- ✓ Each card shows: name, specialty, rating, availability badge
- ✓ "Available" therapists highlighted in green
- ✓ "Unavailable" therapists shown with disabled state

### Test 4.2: Select Therapist

**Steps:**
1. Tap on available therapist (green badge)
2. Observe selection

**Expected Results:**
- ✓ Card shows selected state
- ✓ Toast: "[Name] selecionado com sucesso"
- ✓ "Continuar" button becomes enabled
- ✓ Tap "Continuar" → navigates to CalendarSelection

### Test 4.3: Unavailable Therapist

**Steps:**
1. Tap on unavailable therapist (red badge)
2. Observe behavior

**Expected Results:**
- ✓ No selection allowed
- ✓ Toast: "warning" type with "[Name] não está disponível..."
- ✓ Card remains unselected

### Test 4.4: Missing Selection

**Steps:**
1. Tap "Continuar" without selecting therapist

**Expected Results:**
- ✓ Toast: "warning" type
- ✓ Message: "Selecione um terapeuta para continuar"
- ✓ Stay on TherapistSelection screen

---

## Part 5: Calendar & Time Selection

### Test 5.1: Load Calendar

**Steps:**
1. From TherapistSelection, select therapist and continue
2. Navigate to CalendarSelection
3. Observe calendar

**Expected Results:**
- ✓ Calendar shows next 14 business days
- ✓ Each day shows: weekday name, date
- ✓ Days in past are disabled (grayed out)
- ✓ Progress bar shows "Step 3 of 4"

### Test 5.2: Select Date & Load Slots

**Steps:**
1. Tap on future date (e.g., tomorrow)
2. Observe available slots loading

**Expected Results:**
- ✓ Selected date highlights in gold
- ✓ Loading indicator appears for slots
- ✓ Time slots appear within 1-2 seconds
- ✓ Slots in 30-minute intervals (09:00, 09:30, etc.)
- ✓ All slots shown as available initially

### Test 5.3: Select Time

**Steps:**
1. Tap on time slot (e.g., 10:00)
2. Observe selection

**Expected Results:**
- ✓ Time slot highlights
- ✓ Toast: "[Date] - [Time] selected"
- ✓ "Confirmar" button becomes enabled

### Test 5.4: Validation

**Steps:**
1. Tap "Confirmar" without selecting date
2. Observe validation

**Expected Results:**
- ✓ Toast: "Por favor, selecione uma data"
- ✓ Stay on CalendarSelection

### Test 5.5: Past Date Validation

**Steps:**
1. Select today's date
2. Select time (e.g., 08:00 - before current time)
3. Tap "Confirmar"

**Expected Results:**
- ✓ Toast: "A data não pode estar no passado"
- ✓ Stay on screen

---

## Part 6: Booking Summary

### Test 6.1: Display Summary

**Steps:**
1. Complete date/time selection
2. Tap "Confirmar" on CalendarSelection
3. Navigate to BookingSummaryScreen

**Expected Results:**
- ✓ Shows all booking details:
  - Service name, duration, price
  - Therapist name, specialty, rating
  - Date and time
  - Total price
- ✓ Progress bar shows "Step 4 of 4"
- ✓ Edit buttons visible for each section

### Test 6.2: Edit Service

**Steps:**
1. On BookingSummaryScreen, tap edit button for service
2. Return to ServiceSelection

**Expected Results:**
- ✓ Navigates back to ServiceSelection
- ✓ Previous selection maintained
- ✓ Can change selection
- ✓ Summary updates when returning

### Test 6.3: Edit Therapist

**Steps:**
1. On BookingSummaryScreen, tap edit button for therapist
2. Return to TherapistSelection

**Expected Results:**
- ✓ Navigates back to TherapistSelection
- ✓ Previous selection maintained
- ✓ Can change selection
- ✓ Summary updates when returning

### Test 6.4: Edit Date/Time

**Steps:**
1. On BookingSummaryScreen, tap edit button for date/time
2. Return to CalendarSelection

**Expected Results:**
- ✓ Navigates back to CalendarSelection
- ✓ Previous selection maintained
- ✓ Can change selection
- ✓ Summary updates when returning

### Test 6.5: Confirm Booking

**Steps:**
1. Review all details on BookingSummaryScreen
2. Tap "Confirmar Agendamento" button

**Expected Results:**
- ✓ Loading state appears (spinner + disabled button)
- ✓ API call sent to backend
- ✓ After 2-3 seconds, success toast: "✅ Agendamento confirmado!"
- ✓ Notification scheduled (if notifications enabled)
- ✓ Navigate to BookingsScreen or Home
- ✓ Booking appears in list

### Test 6.6: Booking Confirmation Error

**Steps:**
1. Ensure network is disconnected
2. Try to confirm booking
3. Observe error handling

**Expected Results:**
- ✓ Error toast appears after 3-5 seconds
- ✓ Message shows error reason
- ✓ "Tentar Novamente" option available
- ✓ Can retry the booking

---

## Part 7: Error Scenarios

### Test 7.1: Network Error - Mid-Flow

**Steps:**
1. Start booking flow (at ServiceSelection)
2. Turn off network (airplane mode)
3. Try to load services

**Expected Results:**
- ✓ Brief loading, then fallback to mock data
- ✓ No error displayed
- ✓ Booking continues seamlessly

### Test 7.2: Network Recovery

**Steps:**
1. Service failed to load with network off
2. Turn on network (airplane mode off)
3. Tap "Tentar Novamente" (or retry button)

**Expected Results:**
- ✓ Re-attempts API call
- ✓ Services load from API
- ✓ User can continue

### Test 7.3: Invalid Data

**Steps:**
1. At BookingSummaryScreen
2. Somehow trigger invalid data (manual state manipulation for testing)
3. Try to confirm

**Expected Results:**
- ✓ Validation catches error
- ✓ User-friendly error message displayed
- ✓ Option to edit booking

### Test 7.4: Server Error (500)

**Steps:**
1. At BookingSummaryScreen
2. Mock server returning 500 error (if using mock server)
3. Tap "Confirmar Agendamento"

**Expected Results:**
- ✓ Loading state shows
- ✓ Error toast after timeout
- ✓ Retry button available
- ✓ Booking data preserved

---

## Part 8: Data Persistence

### Test 8.1: Persistence Across Screens

**Steps:**
1. Select service → go to therapist selection
2. Select therapist → go to calendar selection  
3. Select date/time → go to summary
4. Go back to service, then forward

**Expected Results:**
- ✓ All selections preserved
- ✓ No data loss on navigation

### Test 8.2: App Close & Resume

**Steps:**
1. Start booking flow, get to CalendarSelection
2. Close app (app switcher)
3. Wait 5 seconds
4. Reopen app

**Expected Results:**
- ✓ App reopens
- ✓ Returns to last screen or Home
- ✓ Previous booking data may be reset (depends on implementation)

### Test 8.3: Deep Linking

**Steps:**
1. From outside app, send deep link to ServiceSelection
2. App opens with deep link

**Expected Results:**
- ✓ Screen loads correctly
- ✓ Navigation stack properly configured

---

## Part 9: UI/UX Quality

### Test 9.1: Loading States

**Steps:**
1. Throughout booking flow, observe loading states
2. Verify consistency

**Expected Results:**
- ✓ Same loading spinner style throughout
- ✓ SkeletonLoaders for content lists
- ✓ All loading states have messages
- ✓ No janky transitions

### Test 9.2: Animations

**Steps:**
1. Watch screen transitions
2. Observe error message animations
3. Check button interactions

**Expected Results:**
- ✓ Smooth card presentation animations
- ✓ Fade-in for loaded content
- ✓ Error messages animate in/out
- ✓ Button ripple effects on tap
- ✓ 60 FPS smooth performance

### Test 9.3: Typography & Colors

**Steps:**
1. Review all text throughout flow
2. Verify color consistency

**Expected Results:**
- ✓ Headings use primary color (#D4AF8F gold)
- ✓ Subheadings readable (secondary text)
- ✓ Consistent font family (DMSans)
- ✓ All text has sufficient contrast

### Test 9.4: Responsive Layout

**Steps:**
1. Test on different screen sizes if simulator available
2. Rotate device (landscape/portrait)
3. Verify layout adapts

**Expected Results:**
- ✓ All content visible without horizontal scroll
- ✓ Proper spacing on all screen sizes
- ✓ Keyboard doesn't obscure inputs
- ✓ Safe area respected (notch, etc.)

---

## Part 10: Performance

### Test 10.1: Load Time

**Steps:**
1. Measure time from screen open to content visible
2. Time each screen:
   - ServiceSelection: < 2 seconds
   - TherapistSelection: < 2 seconds
   - CalendarSelection: < 1 second (once date selected)
   - BookingSummaryScreen: < 1 second

**Expected Results:**
- ✓ ServiceSelection: ~0.5-1.5s with network, <0.5s fallback
- ✓ TherapistSelection: ~0.5-1.5s with network, <0.5s fallback
- ✓ CalendarSelection: <1s content display
- ✓ BookingSummaryScreen: <0.5s

### Test 10.2: Memory Usage

**Steps:**
1. Using React Native Debugger or Xcode
2. Monitor memory as user navigates booking flow
3. Complete booking and check memory after

**Expected Results:**
- ✓ No memory leaks on screen unmount
- ✓ Memory returns to baseline after navigation
- ✓ No significant growth after multiple bookings

### Test 10.3: API Response Time

**Steps:**
1. Monitor network tab in debugger
2. Note API response times:
   - getServices: ~500-1000ms
   - getTherapists: ~500-1000ms
   - getAvailableSlots: ~200-500ms
   - createBooking: ~1000-2000ms

**Expected Results:**
- ✓ All API calls complete within reasonable time
- ✓ Network errors are handled gracefully
- ✓ Timeouts don't crash app

---

## Part 11: Accessibility

### Test 11.1: Screen Reader (VoiceOver/TalkBack)

**Steps:**
1. Enable VoiceOver (iOS) or TalkBack (Android)
2. Navigate through booking flow

**Expected Results:**
- ✓ All interactive elements are accessible
- ✓ Labels are descriptive
- ✓ Form fields announced with validation status
- ✓ Buttons announced with current state

### Test 11.2: Text Size Scaling

**Steps:**
1. In Settings, increase text size to maximum
2. Navigate booking flow

**Expected Results:**
- ✓ All text scales properly
- ✓ Layout doesn't break
- ✓ No text overflow or truncation

### Test 11.3: Color Contrast

**Steps:**
1. Review all text against backgrounds
2. Check WCAG AA compliance (4.5:1 for text)

**Expected Results:**
- ✓ All text has sufficient contrast
- ✓ Links are clearly distinguishable
- ✓ Error messages are readable

---

## Checklist Summary

### Must Pass Tests
- [ ] Login with valid credentials
- [ ] Complete booking flow end-to-end
- [ ] All screens load within acceptable time
- [ ] Error handling for network failures
- [ ] Data persists across navigation
- [ ] Validation prevents invalid bookings
- [ ] TypeScript compiles without errors
- [ ] All tests pass (npm test)

### Should Pass Tests
- [ ] Loading states show smoothly
- [ ] Animations are 60 FPS
- [ ] Error messages are clear
- [ ] UI is responsive
- [ ] Performance is good
- [ ] Accessibility basics work

### Nice to Have
- [ ] Offline mode works
- [ ] Deep linking works
- [ ] Notifications trigger
- [ ] Analytics events log

---

## Issues Encountered & Resolution

Document any issues found during testing:

### Issue Template:
```
**Issue #[N]:** [Title]
**Screen:** [Which screen]
**Severity:** [Critical/High/Medium/Low]
**Steps to Reproduce:**
1. [Step 1]
2. [Step 2]

**Expected:** [What should happen]
**Actual:** [What actually happened]

**Resolution:** [How it was fixed]
**Tested:** [Date tested, confirmed working]
```

---

## Sign-Off

- [ ] All Critical tests passed
- [ ] All High priority tests passed
- [ ] App is ready for staging deployment
- [ ] Documentation updated

**Tested By:** [Your Name]  
**Date:** [Date]  
**Build Version:** 1.0.0  

---

## Additional Resources

- COMPONENTS_GUIDE.md - Component API documentation
- INTEGRATION_SUMMARY.md - Technical overview
- API_SPECIFICATION.md - Backend API details
