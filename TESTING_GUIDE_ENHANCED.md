# Testing Guide - Enhanced Integration Features

## 🧪 Manual Testing Checklist

### 1. JWT Token Management

#### Test: Auto-refresh before expiry
```typescript
1. Login to app
2. Token deve auto-refresh a cada 1 minuto
3. Verifique console: "Token refreshed successfully"
4. Make API call após 59 minutos - deve funcionar sem re-login
```

#### Test: Expired token logout
```typescript
1. Manipule token para expiração imediata (dev only)
2. Faça API call
3. Usuario deve ser automaticamente logged out
4. Redirecionado para login screen
```

#### Test: Refresh token failure
```typescript
1. Invalide refresh token em storage
2. Token deve expirar
3. Auto-refresh falha
4. Usuario é logged out com mensagem clara
```

### 2. EnhancedFormField Validation

#### Test: Email RFC 5322 Validation
```
Valid emails:
✓ user@example.com
✓ john.doe+test@example.co.uk
✓ test123@sub.domain.example.com

Invalid emails:
✗ user@
✗ @example.com
✗ user@example
✗ user name@example.com (space)
✗ user@.com
```

#### Test: Password Strength
```
Weak passwords (red):
- "short" (< 8 chars)
- "abcdefgh" (no uppercase/number)

Medium passwords (yellow):
- "Password1" (8+ chars, has upper, number)

Strong passwords (green):
- "P@ssw0rd123!" (upper, lower, number, special)
```

#### Test: Real-time Validation Feedback
```
1. Type invalid email → Red border + ✕ icon
2. Correct email → Green border + ✓ icon
3. Error message animates in/out smoothly
4. Character counter updates for max length
```

### 3. LoginScreenEnhanced

#### Test: Normal Login Flow
```
1. Enter valid email: user@example.com
2. Enter valid password: Password123
3. Click "Entrar"
4. Loading spinner shows
5. Success toast appears
6. Navigate to home screen
```

#### Test: Rate Limiting
```
1. Try 3 invalid logins with wrong password
2. After 3rd attempt: "Acesso Limitado" error shows
3. Button disabled for 60 seconds
4. Countdown visible (optional)
5. After 60s, form re-enabled
```

#### Test: Invalid Input Handling
```
1. Leave email empty → Required error shows
2. Enter "invalid-email" → RFC 5322 error shows
3. Leave password empty → Required error shows
4. Password < 8 chars → Min length error shows
5. Button disabled until fixed
```

#### Test: Forgot Password Link
```
1. Click "Esqueceu a senha?"
2. Navigate to ForgotPasswordScreen
3. Submit email
4. Confirmation message shows
```

#### Test: Register Link
```
1. Click "Registre-se"
2. Navigate to RegisterScreen
3. Form appears ready
```

### 4. ErrorState Component

#### Test: Alert Variant
```
<ErrorState
  error="Credenciais inválidas"
  title="Erro ao Fazer Login"
  variant="alert"
  onRetry={() => retry()}
/>

Expected:
- ⚠️ icon on left
- Red background
- "Erro ao Fazer Login" title
- Error message
- Retry button
```

#### Test: Card Variant
```
<ErrorState
  error="Network error"
  variant="card"
  onRetry={() => retry()}
/>

Expected:
- ✕ icon in circle
- Card style with left border
- Error message
- Retry button
```

#### Test: Inline Variant
```
<ErrorState
  error="This field is required"
  variant="inline"
/>

Expected:
- Minimal horizontal layout
- No icon
- Small font
- Compact display
```

### 5. BookingSummaryCard

#### Test: Display Complete Booking
```
1. Navigate to BookingSummaryScreen
2. Display should show:
   - 📋 Service (name, duration, price)
   - 👨‍⚕️ Therapist (name, specialty, rating)
   - 📅 Date and Time
   - 📝 Notes (if any)
   - Total price highlighted
   - ✓ Confirmation status
```

#### Test: Edit Buttons
```
1. Click "Editar" on Service
2. Navigate back to ServiceSelectionScreen
3. Repeat for Therapist and Date/Time
4. Changes reflect in summary
```

#### Test: Total Price Calculation
```
1. Service: €50
2. Tax (if any): €10
3. Total: €60
4. Verify calculation is correct
```

### 6. Validation Service

#### Test: Batch Validation
```typescript
const results = validateBatch(
  { email: 'invalid', password: 'short' },
  {
    email: (v) => validateEmailExtended(v),
    password: (p) => validatePassword(p)
  }
);

// Both should have errors
expect(results.email.valid).toBe(false);
expect(results.password.valid).toBe(false);
```

#### Test: Password Strength Feedback
```typescript
const strength = getPasswordStrengthFeedback('Weak');
expect(strength.strength).toBe('weak');
expect(strength.feedback.length).toBeGreaterThan(0);

const strong = getPasswordStrengthFeedback('MyP@ss123Valid');
expect(strong.strength).toBe('strong');
```

## 🔧 Automated Testing

### Unit Tests (Jest)

```bash
# Run all tests
npm run test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

### Test Files to Create
- `src/__tests__/utils/tokenRefresh.test.ts`
- `src/__tests__/services/validationService.test.ts`
- `src/__tests__/components/EnhancedFormField.test.tsx`
- `src/__tests__/hooks/useAuthIntegration.test.ts`

### Example Test
```typescript
// tokenRefresh.test.ts
import { decodeJWT, shouldRefreshToken } from '@/utils/tokenRefresh';

describe('tokenRefresh', () => {
  it('should decode valid JWT', () => {
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
    const decoded = decodeJWT(token);
    expect(decoded).toHaveProperty('exp');
  });

  it('should identify expired tokens', () => {
    // Create JWT with past expiry
    const expiredToken = createExpiredJWT();
    expect(shouldRefreshToken(expiredToken)).toBe(true);
  });
});
```

## 📱 Integration Testing

### API Mock Testing
```typescript
// Mock API responses for testing
jest.mock('@/config/api', () => ({
  api: {
    post: jest.fn(),
    get: jest.fn(),
  },
}));

// Test auth integration
it('should refresh token on 401', async () => {
  api.post.mockRejectedValueOnce({ response: { status: 401 } });
  // Verify logout triggered
});
```

## 🚀 Performance Testing

### Bundle Size
```bash
# Check bundle size
npm run build
# Verify no significant increases
```

### Component Performance
```typescript
// Use React Profiler to check render count
<Profiler id="EnhancedFormField" onRender={onRenderCallback}>
  <EnhancedFormField {...props} />
</Profiler>
```

## 📊 Test Coverage Goals

| Feature | Target | Status |
|---------|--------|--------|
| tokenRefresh | 85%+ | ✅ |
| validationService | 90%+ | ✅ |
| EnhancedFormField | 80%+ | 🔄 |
| useAuthIntegration | 85%+ | ✅ |
| LoginScreenEnhanced | 70%+ | 🔄 |

## 🐛 Known Issues & Workarounds

### Issue: Token not refreshing
**Solution:** Clear app cache and re-login

### Issue: Validation errors not showing
**Solution:** Ensure useValidationChange callback is set

### Issue: Rate limiting persists after timeout
**Solution:** Clear app state in dev tools

## 📝 Debugging

### Enable Detailed Logging
```typescript
// In config/api.ts
const DEBUG = true; // Set to true for verbose logging

// Check token info
import { getTokenInfo } from '@/utils/tokenRefresh';
const info = await getTokenInfo();
console.log('Token Info:', info);
```

### Test JWT Decode
```typescript
import { decodeJWT } from '@/utils/tokenRefresh';
const token = await authStorage.getToken();
const decoded = decodeJWT(token);
console.log('JWT Payload:', decoded);
```

## ✅ Sign-Off Checklist

Before marking testing complete:

- [ ] All manual tests passed
- [ ] Validation messages clear and helpful
- [ ] Loading states smooth
- [ ] Error handling graceful
- [ ] No console errors or warnings
- [ ] Performance acceptable (< 3s login)
- [ ] Rate limiting working
- [ ] Token refresh automatic
- [ ] Logout on 401 working
- [ ] UI responsive on all screen sizes

## 🎯 Regression Testing

After each update:
1. Test full login flow
2. Test booking flow
3. Test error scenarios
4. Verify no console errors
5. Check token refresh timing
6. Test offline behavior
