# 🚀 Qlinica App - Deployment Guide

**Status:** 🟢 Ready for Distribution  
**Version:** 0.3.0  
**Last Updated:** March 23, 2026

---

## 📋 Pre-Deployment Checklist

Before deploying to app stores, ensure:

### Code Quality
- [x] All tests passing (178/178)
- [x] TypeScript compilation clean (~95% coverage)
- [x] No console errors in production build
- [x] All screens tested manually
- [x] Authentication flow verified
- [x] Booking flow end-to-end tested

### Configuration
- [ ] API endpoint configured correctly (src/config/api.ts)
- [ ] Firebase config updated (src/config/firebase.ts)
- [ ] App version updated (app.json)
- [ ] Permissions configured (app.json)
- [ ] Icons and splash screens updated

### Documentation
- [ ] README.md up to date
- [ ] Changelog created
- [ ] Release notes written
- [ ] Known issues documented

---

## 🔧 Environment Setup

### Step 1: Install Dependencies
```bash
cd /Users/marcelolopes/qlinica-app
npm install
npx expo install
```

### Step 2: Configure Environment Variables
Create `.env.production`:
```
REACT_APP_API_URL=https://api.qlinica.com
REACT_APP_FIREBASE_PROJECT_ID=qlinica-prod
REACT_APP_FIREBASE_API_KEY=your_firebase_key
```

### Step 3: Verify Build
```bash
npm run build:web
npm test  # Ensure all 178 tests pass
```

---

## 📱 iOS Distribution (App Store)

### 1. Prerequisites
- [ ] Mac with Xcode installed
- [ ] Apple Developer account ($99/year)
- [ ] App identifier registered
- [ ] Certificates and provisioning profiles setup

### 2. Build Process

#### Option A: Using EAS (Recommended)
```bash
# Initialize EAS (one-time)
npx eas init

# Configure for iOS
npx eas build --platform ios --auto-submit

# Or build locally for testing
npx eas build --platform ios --local
```

#### Option B: Manual Build
```bash
# Generate native project
npx expo prebuild --clean

# Open in Xcode
open ios/qlinica.xcworkspace

# Build & Archive in Xcode
# Product > Archive > Distribute App

# Upload to App Store Connect
```

### 3. App Store Connect Setup
1. Go to https://appstoreconnect.apple.com
2. Create new app
3. Fill in:
   - Name: "Qlinica"
   - Primary Language: Portuguese (PT)
   - Bundle ID: `com.sepoloff.qlinica`
   - SKU: `QLINICA-001`
4. Add screenshots (minimum 2 per device type)
5. Write app description
6. Set privacy policy URL
7. Configure pricing & availability

### 4. Submission
1. Submit for review (24-48 hours typically)
2. Monitor status in App Store Connect
3. Address any review issues
4. Approved → Published 🎉

---

## 🤖 Android Distribution (Google Play Store)

### 1. Prerequisites
- [ ] Google Play Developer account ($25 one-time)
- [ ] Keystore file created
- [ ] App signing configured

### 2. Generate Signing Key
```bash
# Create keystore (one-time)
keytool -genkey -v -keystore qlinica.keystore \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias qlinica-key \
  -storetype JKS
```

### 3. Build Process

#### Option A: Using EAS
```bash
# Build APK/AAB for Play Store
npx eas build --platform android --auto-submit

# Or build locally
npx eas build --platform android --local
```

#### Option B: Manual Build
```bash
# Generate native project
npx expo prebuild --clean

# Build AAB (recommended for Play Store)
cd android
./gradlew bundleRelease

# Or build APK
./gradlew assembleRelease
```

### 4. Google Play Console Setup
1. Go to https://play.google.com/console
2. Create new app
3. Fill in:
   - App name: "Qlinica"
   - Primary category: Medical
   - Content rating questionnaire
4. Add app icon & screenshots (minimum 4)
5. Write app description
6. Set privacy policy URL
7. Configure pricing & availability

### 5. Release Track Setup
1. **Internal Testing**: Deploy first for internal QA
   - Add testers (Google accounts)
   - Get feedback
2. **Closed Testing**: Limited users
   - ~100 users for final testing
3. **Production**: Full release
   - Staged rollout (5% → 25% → 100%)

### 6. Submission
1. Complete content rating form
2. Verify compliance
3. Create release
4. Upload AAB file
5. Review & submit
6. Wait for automatic review (~1-2 hours)
7. Published 🎉

---

## 🌐 Web Distribution

### Build for Web
```bash
npm run build:web

# Output: web-build/
# Deploy to: Netlify, Vercel, AWS S3, etc.
```

### Deploy to Vercel (Recommended)
```bash
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

### Deploy to Netlify
```bash
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod --dir=web-build
```

---

## 📊 Post-Deployment Monitoring

### Analytics Setup
```typescript
// Already integrated in useAnalytics hook
// Events tracked:
// - screenView: User navigates to screen
// - bookingCreated: User books appointment
// - bookingCancelled: User cancels booking
// - error: App errors with context
```

### Error Tracking (Sentry)
```bash
# Install Sentry
npm install @sentry/react-native

# Initialize in app.tsx
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'https://your-sentry-dsn',
  environment: 'production',
});
```

### Performance Monitoring
- Monitor: API response times, screen load time, bundle size
- Use: React DevTools Profiler, Sentry Performance
- Target: <2s app load, <500ms screen navigation

---

## 🔄 Update Management

### Version Bumping
```bash
# Update version in app.json
{
  "expo": {
    "version": "0.3.1",
    "plugins": [...]
  }
}

# Commit
git tag v0.3.1
git push origin v0.3.1
```

### Over-the-Air Updates (OTA)
```bash
# Using Expo Updates
npm install expo-updates

# Publish update
eas update --branch production

# Users get update on app open
```

### Rollback
```bash
# If critical issue found:
eas rollback --branch production --version <version-id>
```

---

## 🐛 Common Issues & Solutions

### Build Fails on iOS
```bash
# Issue: Pod dependency issues
Solution: 
  rm -rf ~/Library/Developer/Xcode/DerivedData/*
  cd ios && rm -rf Pods && cd ..
  npx expo prebuild --clean
```

### Build Fails on Android
```bash
# Issue: Gradle issues
Solution:
  rm -rf android/.gradle
  npx expo prebuild --clean
```

### App Store Rejection
```
Common reasons:
1. Privacy Policy missing/invalid
2. Permissions not justified (iOS)
3. Payment method issues (Apple Pay)
4. App crashes on startup

Solution: Check rejection email, fix, resubmit
```

### Slow App Startup
```bash
# Analyze bundle
npm run build:web -- --analyze

# Optimize:
- Remove unused dependencies
- Code splitting
- Lazy load screens
- Optimize images
```

---

## 📞 Support & Resources

### Documentation
- **Expo Docs**: https://docs.expo.dev
- **React Native Docs**: https://reactnative.dev
- **EAS Build Docs**: https://docs.expo.dev/build/introduction/

### Tools
- **EAS CLI**: `npx eas@latest login`
- **Expo CLI**: `npx expo login`
- **App Store Connect**: https://appstoreconnect.apple.com
- **Google Play Console**: https://play.google.com/console

### Getting Help
1. Check logs: `npx eas logs --build-id <id>`
2. Review error details in console
3. Check Github issues: https://github.com/Sepoloff/qlinica-app/issues
4. Contact: support@qlinica.com

---

## ✅ Deployment Checklist (Final)

### Before Submission
- [ ] Version updated (0.3.0 → 0.3.1, etc.)
- [ ] CHANGELOG.md updated
- [ ] Screenshots captured (app store requirements)
- [ ] Privacy policy accessible
- [ ] All tests passing
- [ ] Build succeeds locally
- [ ] No console warnings/errors

### iOS App Store
- [ ] App icon (1024x1024)
- [ ] Screenshots (4 minimum, per device type)
- [ ] App description updated
- [ ] Keywords configured
- [ ] Support URL set
- [ ] Privacy policy linked

### Google Play Store
- [ ] App icon (512x512)
- [ ] Feature graphic (1024x500)
- [ ] Screenshots (4-8, minimum 320x480)
- [ ] Short description (80 chars)
- [ ] Full description (4000 chars)
- [ ] Content rating completed

### Post-Launch
- [ ] Monitor crash reports (Sentry)
- [ ] Check user feedback (reviews)
- [ ] Monitor analytics (Mixpanel/GA)
- [ ] Plan next update

---

**Last Review:** March 23, 2026  
**Status:** ✅ Ready for Submission

Next: Prepare for v1.0 release with payment integration & advanced features
