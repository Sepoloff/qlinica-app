# 🔧 Qlinica App - Troubleshooting Guide

**Last Updated:** March 23, 2026  
**Status:** Complete Development Guide

---

## 🚨 Critical Issues

### App Crashes on Startup
**Symptoms:** App opens then immediately closes

**Solutions:**
```bash
# 1. Clear cache
rm -rf ~/.expo
rm -rf node_modules
npm install

# 2. Prebuild clean
npx expo prebuild --clean

# 3. Check for TypeScript errors
npm run type-check

# 4. Review logcat (Android) or Console (iOS)
adb logcat | grep qlinica  # Android
# Or use Xcode Console (iOS)
```

### API Connection Failed
**Symptoms:** "Network error", API calls timeout

**Check:**
```bash
# 1. Verify API URL in src/config/api.ts
API_BASE_URL should be: http://localhost:3000/api (dev)
                        https://api.qlinica.com (prod)

# 2. Test API connectivity
curl https://api.qlinica.com/health

# 3. Check network interceptor
src/config/api.ts → look for request/response interceptors

# 4. Review AuthContext token injection
src/context/AuthContext.tsx → check JWT token storage
```

### Authentication Loop
**Symptoms:** Can't log in, stuck on login screen

**Causes & Solutions:**
```typescript
// Issue 1: Invalid JWT token
Solution: Clear AsyncStorage
  src/utils/storage.ts → authStorage.removeToken()

// Issue 2: API endpoint wrong
Solution: Check src/config/api.ts
  Verify baseURL matches backend

// Issue 3: CORS issue
Solution: Check backend CORS headers
  Backend should have: Access-Control-Allow-Origin

// Issue 4: Token expired
Solution: Check token refresh logic
  src/config/api.ts → 401 response handler
```

### Booking Creation Fails
**Symptoms:** "Error creating booking", stays on summary screen

**Diagnosis:**
```bash
# 1. Check API response
Look at network tab in DevTools
  POST /api/bookings should return 200

# 2. Validate booking data
src/screens/BookingSummaryScreen.tsx
  → Check validation in BookingFlowContext

# 3. Review server logs
Check backend logs for booking creation errors

# 4. Test with mock data
src/constants/Data.ts has sample bookings
  Verify data structure matches API
```

---

## ⚠️ Common Issues

### "Module not found" Errors

**Issue:** `Cannot find module '@/hooks/useAuth'`

**Solution:**
```bash
# 1. Check import paths
TypeScript paths configured in tsconfig.json
  "@": "./src"

# 2. Verify file exists
ls src/hooks/useAuth.ts

# 3. Rebuild project
npm install
npx expo prebuild --clean
```

### Form Validation Not Working

**Issue:** Form accepts invalid input

**Debug:**
```typescript
// src/hooks/useFormValidation.ts
console.log('Validation errors:', errors);

// Each form field has validators:
const validators = [
  { rule: 'required', message: 'Campo obrigatório' },
  { rule: 'email', message: 'Email inválido' },
  { rule: 'minLength:8', message: 'Mínimo 8 caracteres' }
];

// Check src/utils/validation.ts for rules
```

### Loading Spinner Stuck

**Issue:** LoadingSpinner doesn't disappear

**Causes:**
```typescript
// 1. Async function never completes
const loadData = async () => {
  // Missing await or try-catch?
  setLoading(false);  // Ensure this is called
};

// 2. Multiple setState calls
// Don't do: setLoading(true); setLoading(false);
// Do: await promise; then setLoading(false);

// 3. Component unmounted
// Use: isMounted flag or cleanup in useEffect
```

**Fix:**
```typescript
useEffect(() => {
  let isMounted = true;
  
  const loadData = async () => {
    try {
      const data = await fetchData();
      if (isMounted) setData(data);
    } finally {
      if (isMounted) setLoading(false);
    }
  };
  
  loadData();
  
  return () => {
    isMounted = false;  // Cleanup
  };
}, []);
```

### Toast Notifications Not Showing

**Issue:** showToast() called but message doesn't appear

**Solutions:**
```typescript
// 1. Check ToastContext is provided
App.tsx should have: <ToastProvider>

// 2. Use useToast hook correctly
import { useToast } from '../context/ToastContext';
const { showToast } = useToast();

// 3. Verify toast options
showToast('Message', 'success', 3000);  // duration in ms
showToast('Error', 'error');

// 4. Check theme colors
COLORS.success, COLORS.danger should be defined
src/constants/Colors.ts
```

### Offline Queue Not Syncing

**Issue:** Operations stay "offline" even with connection

**Debug:**
```bash
# 1. Check network status
useNetworkStatus hook should show isOnline: true

# 2. Verify queue service
src/services/offlineQueue.ts

# 3. Check AsyncStorage
Look for stored operations:
  AsyncStorage.getItem('offline_queue')

# 4. Trigger sync manually
Navigation → Settings → "Sync Offline Data"
  or: offlineQueue.sync()
```

### Performance Issues (Slow App)

**Issue:** App feels slow, janky navigation

**Solutions:**
```bash
# 1. Check bundle size
npm run build:web -- --analyze

# 2. Profile with React DevTools
React Native → Profiler tab

# 3. Optimize:
  - Remove unused dependencies
  - Lazy load screens
  - Memoize expensive components
  - Optimize images (use expo-image)

# 4. Check FlatList
Use optimization props:
  - removeClippedSubviews={true}
  - maxToRenderPerBatch={10}
  - updateCellsBatchingPeriod={50}
```

---

## 🧪 Testing Issues

### Tests Failing

**Solution:**
```bash
# 1. Clear cache
npm test -- --clearCache

# 2. Run specific test
npm test -- src/__tests__/utils/validation.test.ts

# 3. Watch mode
npm test -- --watch

# 4. Update snapshots (if needed)
npm test -- --updateSnapshot
```

### TypeScript Errors

**Build won't complete:**
```bash
# 1. Check errors
npm run type-check

# 2. Fix import paths
import { Button } from '../components/Button';
# Check file exists at that path

# 3. Fix type annotations
// Bad:
const items: any[] = [];

// Good:
const items: Item[] = [];
interface Item {
  id: string;
  name: string;
}

# 4. Install missing types
npm install --save-dev @types/react-native
```

---

## 🌐 Network Issues

### API Timeout

**Symptoms:** "Network request timeout"

**Solutions:**
```typescript
// 1. Check timeout setting (src/config/api.ts)
timeout: 10000,  // 10 seconds

// 2. Increase timeout for slow networks
// In api.ts or per request:
api.get('/bookings', { timeout: 20000 });

// 3. Check network speed
// Use Network tab in DevTools
// Simulate slow 3G/4G
```

### CORS Errors

**Symptoms:** "Access-Control-Allow-Origin" error

**Backend needs to allow:**
```bash
# Your frontend origin must be whitelisted
# Backend CORS headers should include:
Access-Control-Allow-Origin: http://localhost:8081
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Content-Type, Authorization
```

### SSL/TLS Errors

**Issue:** Certificate error on production

**Solutions:**
```bash
# 1. Check certificate validity
openssl s_client -connect api.qlinica.com:443

# 2. Update certificates
# Backend admin should update SSL cert

# 3. Disable SSL check (DEV ONLY!)
// NEVER use in production!
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
```

---

## 💾 Storage Issues

### Data Not Persisting

**Issue:** User logs out after app restart

**Debug:**
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Check what's stored
const token = await AsyncStorage.getItem('auth_token');
console.log('Stored token:', token);

// Clear storage for testing
await AsyncStorage.clear();
```

### Storage Quota Exceeded

**Issue:** AsyncStorage full, can't save more data

**Solutions:**
```typescript
// 1. Cleanup old data
await AsyncStorage.removeItem('old_bookings');
await AsyncStorage.removeItem('cache_data');

// 2. Implement cache expiry
const isExpired = (timestamp) => 
  Date.now() - timestamp > 7 * 24 * 60 * 60 * 1000; // 7 days

// 3. Monitor storage usage
const stats = await AsyncStorage.multiSet([]);
// iOS: ~5-6MB limit
// Android: ~10MB+ limit
```

---

## 📱 Platform-Specific Issues

### iOS Issues

#### Build Fails: "Pod issues"
```bash
rm -rf ~/Library/Developer/Xcode/DerivedData/*
rm -rf ios/Pods ios/Podfile.lock
npx expo prebuild --clean
```

#### App Won't Start on Device
```bash
# 1. Check provisioning profile
Xcode → Signing & Capabilities

# 2. Clear device cache
Settings → General → iPhone Storage → App → Offload App
Then reinstall

# 3. Check logs
Xcode → Console (Device connected)
```

#### Push Notifications Not Working
```bash
# 1. Verify APNs certificate
Apple Developer Portal → Certificates

# 2. Check Firebase Cloud Messaging
Google Cloud Console → FCM setup

# 3. Test with TestFlight
Xcode → Product → Scheme → TestFlight
```

### Android Issues

#### Build Fails: "Gradle issues"
```bash
rm -rf android/.gradle
rm -rf android/build
npx expo prebuild --clean
./gradlew clean
```

#### App Won't Install
```bash
# 1. Wrong Android version
minSdkVersion should be 21+ in app.json

# 2. Storage full on device
adb shell pm uninstall com.qlinica  # Remove old version
adb install app.apk

# 3. Signature mismatch
./gradlew clean
./gradlew assembleRelease
```

#### Debugger Won't Connect
```bash
adb reverse tcp:8081 tcp:8081
npx expo start --localhost
```

---

## 🔍 Debugging Techniques

### Enable Debug Logging
```typescript
// In App.tsx or entry point
import { logger } from './src/utils/logger';

// Set debug level
logger.setLevel('debug');

// View logs
logger.debug('Message', { data: value });
logger.error('Error message', error);
```

### Network Inspector
```typescript
// In config/api.ts
// Add logging interceptor
api.interceptors.request.use((config) => {
  console.log('📤 Request:', config.method, config.url);
  return config;
});

api.interceptors.response.use((response) => {
  console.log('📥 Response:', response.status);
  return response;
});
```

### React DevTools
```bash
# Install React DevTools
npm install --save-dev @react-devtools/core

# Use in emulator/simulator
Settings → Developer Options → React DevTools
```

---

## 📞 Getting Help

### Before Asking
1. Check this guide
2. Check console logs
3. Clear cache: `npm install && npx expo prebuild --clean`
4. Check GitHub issues: https://github.com/Sepoloff/qlinica-app/issues

### How to Report Issues
Include:
- iOS or Android (or both)
- Qlinica version (src/app.json)
- Steps to reproduce
- Error message or screenshot
- Device/simulator model
- Network conditions

### Useful Commands
```bash
# View full logs
adb logcat -s qlinica  # Android
# Xcode Console (iOS)

# Restart metro bundler
npx expo start --reset-cache

# Test specific file
npm test -- src/__tests__/utils/validation.test.ts

# Type check
npm run type-check

# Build preview
npm run build:web
```

---

**Last Updated:** March 23, 2026  
**Maintained By:** Qlinica Development Team  
**Status:** ✅ Complete & Current
