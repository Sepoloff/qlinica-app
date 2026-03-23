# 🧪 Qlinica App - Testing Plan

## Test Coverage Requirements

### Unit Tests (80%+ coverage)
- ✅ Utility functions
- ✅ Custom hooks
- ✅ Validation logic
- ✅ Data transformations

### Integration Tests
- ✅ API service + context
- ✅ Authentication flow
- ✅ Booking workflow
- ✅ Navigation flows

### E2E Tests (Critical paths)
- ✅ User login
- ✅ Browse services
- ✅ Create booking
- ✅ View bookings
- ✅ Cancel booking

## Manual Testing Checklist

### Authentication
- [ ] Login with valid credentials
- [ ] Login with invalid email format
- [ ] Login with wrong password
- [ ] Password reset flow
- [ ] Register new account
- [ ] Auto-logout after token expiry
- [ ] Token refresh on app resume

### Home Screen
- [ ] Load upcoming bookings
- [ ] Verify color indicator (GREEN)
- [ ] Pull-to-refresh
- [ ] Loading skeleton shows
- [ ] Error state displays
- [ ] Tap "Agendar Consulta" navigates to services

### Bookings Screen
- [ ] Load all bookings
- [ ] Verify color indicator (RED)
- [ ] Tab switching: Próximas ↔ Passadas
- [ ] Pull-to-refresh
- [ ] Cancel booking (with confirmation)
- [ ] Reschedule booking
- [ ] Booking details modal

### Profile Screen
- [ ] Display user information
- [ ] Verify color indicator (BLUE)
- [ ] Edit phone number
- [ ] Toggle notifications
- [ ] Logout

### Booking Flow
1. [ ] Tap "Agendar Consulta"
2. [ ] Select service
3. [ ] Select therapist
4. [ ] Choose date/time
5. [ ] Review summary
6. [ ] Confirm booking
7. [ ] Success notification
8. [ ] Booking appears in list

### Error Scenarios
- [ ] Network disconnected
- [ ] Server 500 error
- [ ] API timeout
- [ ] Invalid data response
- [ ] Authentication token expired
- [ ] Form validation errors

### Performance Testing
- [ ] App launch time: < 3 seconds
- [ ] Screen transitions: < 300ms
- [ ] API response: < 2 seconds
- [ ] Scroll smoothness: 60fps
- [ ] Memory usage: < 100MB

### Device Testing

#### iOS Simulator
- [ ] iPhone 14 (6.1")
- [ ] iPhone 15 Pro (6.1")
- [ ] iPhone 15 Plus (6.7")
- [ ] iPad Pro (12.9")

#### Real Devices (if available)
- [ ] iPhone 13
- [ ] iPhone 14
- [ ] iPhone 15
- [ ] iPad Air

### Network Conditions
- [ ] 4G/LTE
- [ ] WiFi
- [ ] Slow network (throttled)
- [ ] Offline (airplane mode)

### Accessibility Testing

#### Screen Reader (VoiceOver)
- [ ] Enable VoiceOver
- [ ] Navigate through screens
- [ ] Verify all elements labeled
- [ ] Test gestures
- [ ] Read error messages

#### Visual
- [ ] Color contrast (4.5:1)
- [ ] Text readability (14pt+)
- [ ] Touch targets (44x44pt)
- [ ] Dynamic type scaling
- [ ] Dark mode (if applicable)

### Internationalization
- [ ] Portuguese text correct
- [ ] Date format (DD/MM/YYYY)
- [ ] Time format (HH:mm)
- [ ] Currency format (€)
- [ ] Special characters supported

## Regression Testing

### Before Each Release
- [ ] Login flow works
- [ ] Booking creation works
- [ ] Booking cancellation works
- [ ] Profile editing works
- [ ] Notifications display
- [ ] No crashes/errors
- [ ] Performance acceptable

### Post-Release Monitoring
- [ ] Crash rate < 0.1%
- [ ] Error rate < 1%
- [ ] API success rate > 99.5%
- [ ] User retention > 85%
- [ ] Average session > 5 min

## Browser Testing (Web version)

### Desktop Browsers
- [ ] Chrome (latest)
- [ ] Safari (latest)
- [ ] Firefox (latest)
- [ ] Edge (latest)

### Mobile Browsers
- [ ] Safari iOS
- [ ] Chrome Android
- [ ] Samsung Internet

## Load Testing

### Scenarios
1. **Concurrent Users**: 100, 500, 1000
2. **API Rate**: 10, 50, 100 req/sec
3. **Database Load**: Peak booking time
4. **Image Upload**: Large files

### Acceptance Criteria
- ✅ Response time < 2s under load
- ✅ Error rate < 5%
- ✅ No data loss
- ✅ Database connection pooling works

## Security Testing

### OWASP Top 10
- [ ] SQL Injection prevention
- [ ] XSS prevention
- [ ] CSRF protection
- [ ] Authentication bypass
- [ ] Sensitive data exposure
- [ ] Access control

### API Security
- [ ] JWT validation
- [ ] Rate limiting
- [ ] Request signing
- [ ] HTTPS enforcement
- [ ] Secrets not exposed

### Data Protection
- [ ] PII encrypted
- [ ] Password hashing
- [ ] Token storage secure
- [ ] Cache cleared on logout
- [ ] No sensitive logs

## User Acceptance Testing (UAT)

### Scenario 1: New User Flow
1. Install app
2. Create account
3. Browse services
4. Make first booking
5. Receive confirmation

### Scenario 2: Existing User
1. Open app (autologin)
2. View upcoming bookings
3. Reschedule appointment
4. Update profile
5. View booking history

### Scenario 3: Error Recovery
1. Start booking
2. Lose network
3. Network restored
4. Complete booking
5. No duplicate bookings

### User Feedback Collection
- [ ] Feature requests logged
- [ ] Pain points identified
- [ ] Bugs reported
- [ ] Usability issues noted
- [ ] Performance concerns tracked

## Defect Tracking

### Severity Levels
- **P0 (Critical)**: App crash, data loss, security
- **P1 (High)**: Feature broken, data incorrect
- **P2 (Medium)**: UI issue, performance degraded
- **P3 (Low)**: Polish, nice-to-have improvement

### Bug Report Template
```
Title: [COMPONENT] Brief description
Severity: P0|P1|P2|P3
Device: iPhone model, iOS version
Steps to Reproduce:
1. Step 1
2. Step 2
Expected: What should happen
Actual: What actually happened
Logs: (if available)
```

## Sign-Off Criteria

### Ready for Alpha
- [ ] All unit tests passing
- [ ] Manual testing complete
- [ ] No P0/P1 bugs
- [ ] Performance acceptable
- [ ] Security audit passed

### Ready for Beta
- [ ] Alpha feedback incorporated
- [ ] Integration tests passing
- [ ] E2E tests passing
- [ ] Accessibility audit passed
- [ ] UAT positive feedback

### Ready for Release
- [ ] Beta testing complete
- [ ] All known bugs fixed/deferred
- [ ] Performance metrics met
- [ ] Security review passed
- [ ] Final sign-off from Product

---

**Test Coverage Target:** 85%+
**Last Updated:** 2026-03-23
**Maintained By:** QA Team
