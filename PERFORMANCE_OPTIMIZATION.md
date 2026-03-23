# 🚀 Performance Optimization Guide

**Last Updated:** March 23, 2026

## Overview

This document provides comprehensive guidelines for optimizing the Qlinica app's performance across rendering, API calls, image loading, and bundle size.

---

## 📊 Current Baseline Metrics

```
Bundle Size:       ~1.5MB (uncompressed)
Target:            <1MB
Current Score:     85%
Performance Goal:  90%+
```

---

## Phase 1: Code Splitting & Lazy Loading

### 1.1 Screen-Based Code Splitting

Booking flow screens are heavy (270-570 lines each). Split them into separate chunks:

```typescript
// src/navigation/BookingNavigator.tsx
import { lazy } from 'react';
import { createLazyScreen, preloadScreen } from '../utils/lazyLoad';

// Lazy load heavy screens
const ServiceSelectionScreen = createLazyScreen(
  () => import('../screens/ServiceSelectionScreen')
);

const CalendarSelectionScreen = createLazyScreen(
  () => import('../screens/CalendarSelectionScreen')
);

// Preload on app startup or when user navigates to booking
export const preloadBookingFlow = () => {
  preloadScreens([
    () => import('../screens/ServiceSelectionScreen'),
    () => import('../screens/TherapistSelectionScreen'),
    () => import('../screens/CalendarSelectionScreen'),
    () => import('../screens/BookingSummaryScreen'),
  ]);
};
```

### 1.2 Component-Level Code Splitting

For complex components with conditional rendering:

```typescript
import { lazy } from 'react';

// Only load advanced features when needed
const PaymentFormComponent = lazy(() => import('./PaymentForm'));
const AnalyticsPanel = lazy(() => import('./AnalyticsPanel'));

const MyComponent = () => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <>
      {showAdvanced && <PaymentFormComponent />}
    </>
  );
};
```

---

## Phase 2: Image Optimization

### 2.1 Lazy Load Images

Use the `imageOptimization` utility:

```typescript
import { prefetchImage, getOptimizedImageUrl } from '../utils/imageOptimization';
import { Image } from 'react-native';

const TherapistCard = ({ imageUrl }: Props) => {
  // Optimize image URL for current screen size
  const optimizedUrl = getOptimizedImageUrl(imageUrl, 300, 400);

  return <Image source={{ uri: optimizedUrl }} style={{ width: 300, height: 400 }} />;
};

// Preload images when listing therapists
useEffect(() => {
  const imageUrls = therapists.map(t => t.profileImageUrl);
  prefetchImages(imageUrls);
}, [therapists]);
```

### 2.2 Use Responsive Images

```typescript
import { getResponsiveImageDimensions } from '../utils/imageOptimization';

const ResponsiveImage = () => {
  const dimensions = getResponsiveImageDimensions(300, 1.5); // aspectRatio

  return (
    <Image
      source={{ uri: imageUrl }}
      style={{
        width: dimensions.width,
        height: dimensions.height,
      }}
    />
  );
};
```

---

## Phase 3: API Response Caching

### 3.1 Cache API Responses

Use the caching utility to avoid duplicate requests:

```typescript
import { cachedApiCall, invalidateCache } from '../utils/caching';

// Automatic caching with 5-minute TTL
const getTherapists = async () => {
  return cachedApiCall(
    'therapists_list',
    () => api.get('/therapists'),
    { ttl: 5 * 60 * 1000, storage: 'both' }
  );
};

// Manual cache invalidation
const refreshTherapists = async () => {
  await invalidateCache('therapists_list');
  return getTherapists();
};
```

### 3.2 Cache Configuration

```typescript
// Different strategies for different data types
const CACHE_STRATEGIES = {
  // User-specific data: invalidate on logout
  userProfile: { ttl: 30 * 60 * 1000, storage: 'storage' }, // 30 min

  // Service listings: cache longer
  services: { ttl: 60 * 60 * 1000, storage: 'both' }, // 1 hour

  // Real-time availability: minimal cache
  availability: { ttl: 2 * 60 * 1000, storage: 'memory' }, // 2 min

  // Static content: cache aggressively
  clinicInfo: { ttl: 24 * 60 * 60 * 1000, storage: 'both' }, // 24 hours
};
```

---

## Phase 4: Component Memoization

### 4.1 Memoize Heavy Components

```typescript
import { createMemoComponent } from '../utils/memoization';

// Only rerender when specific props change
const TherapistCard = createMemoComponent(
  ({ therapist, onSelect }: Props) => (
    <TouchableOpacity onPress={() => onSelect(therapist)}>
      <Text>{therapist.name}</Text>
    </TouchableOpacity>
  ),
  (prevProps, nextProps) => {
    // Custom comparison
    return (
      prevProps.therapist.id === nextProps.therapist.id &&
      prevProps.onSelect === nextProps.onSelect
    );
  }
);
```

### 4.2 Memoize Callbacks

```typescript
import { useMemoizedCallback } from '../utils/memoization';

const MyComponent = ({ therapistId }: Props) => {
  // Stable reference across rerenders
  const handleSelectTherapist = useMemoizedCallback(
    (id: string) => {
      // Handle selection
    },
    [therapistId] // Only recreate when therapistId changes
  );

  return <TherapistList onSelect={handleSelectTherapist} />;
};
```

---

## Phase 5: Performance Monitoring

### 5.1 Monitor Render Performance

```typescript
import { performanceMonitor } from '../utils/performanceMonitoring';

useEffect(() => {
  const timer = performanceMonitor.start('therapist_list_render');

  // Component renders...

  const duration = timer.end({ count: therapists.length });
  console.log(`Rendered ${therapists.length} items in ${duration}ms`);
}, [therapists]);
```

### 5.2 Monitor API Performance

```typescript
import { measureAsync } from '../utils/performanceMonitoring';

const getServices = async () => {
  return measureAsync(
    'api:get_services',
    () => api.get('/services'),
    { cached: false }
  );
};
```

### 5.3 Performance Summary

```typescript
// Get performance metrics
const summary = performanceMonitor.getSummary();
console.log('Performance Summary:', summary);

// Example output:
// {
//   'render:therapist_list': { avg: 45.2, count: 3, max: 52.1, min: 38.5 },
//   'api:get_services': { avg: 234.5, count: 2, max: 456.1, min: 102.3 }
// }
```

---

## Phase 6: Bundle Size Analysis

### 6.1 Check Bundle Size

```typescript
import { generateBundleReport } from '../utils/bundleAnalysis';

// After build, analyze the bundle
const report = generateBundleReport(moduleSizes);
console.log(report);
```

### 6.2 Identify Large Dependencies

```bash
# Check for duplicate dependencies
npm list --depth=0

# Analyze bundle (if using Metro bundler)
npx metro build-haste-map
```

### 6.3 Suggestions

- ✅ Code-split payment screen (PaymentScreen: 523 lines)
- ✅ Code-split booking flow screens
- ✅ Lazy load analytics components
- ✅ Tree-shake unused utilities
- ✅ Use lightweight alternatives (e.g., date-fns instead of moment)

---

## Checklist: Performance Optimization

### Code Splitting
- [ ] Implement lazy loading for booking flow screens
- [ ] Split payment processing into separate chunk
- [ ] Setup preloading for critical paths
- [ ] Test code splitting in production build

### Image Optimization
- [ ] Add image URL optimization utility
- [ ] Implement responsive images
- [ ] Add image prefetching to main screens
- [ ] Reduce image quality for thumbnails

### API Caching
- [ ] Setup cache layer for API responses
- [ ] Define TTL for each endpoint
- [ ] Implement cache invalidation strategy
- [ ] Test offline mode with cache

### Component Memoization
- [ ] Memoize expensive list components
- [ ] Optimize callback references
- [ ] Use React.memo for pure components
- [ ] Profile with React DevTools

### Monitoring
- [ ] Add performance monitoring to critical paths
- [ ] Setup performance budgets
- [ ] Create performance dashboard
- [ ] Monitor bundle size over time

### Testing
- [ ] Test lazy loading functionality
- [ ] Verify cache behavior
- [ ] Performance testing on slow devices
- [ ] Lighthouse audit
- [ ] Load testing with many items

---

## Performance Targets

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Bundle Size | <1MB | ~1.5MB | 🟡 |
| First Load | <3s | ~3.5s | 🟡 |
| TTI (Time to Interactive) | <5s | ~5.5s | 🟡 |
| Render FPS | 60fps | ~55fps | 🟡 |
| API Response Cache Hit | >60% | 0% | 🔴 |
| Image Load Time | <500ms | ~800ms | 🟡 |

---

## Tools & Commands

```bash
# Run performance monitoring
npm test -- --coverage

# Analyze bundle
npx metro build-haste-map

# Check for duplicate packages
npm dedupe

# Clear cache and rebuild
npm run build

# Test on device
npm run android
npm run ios

# Check TypeScript
npx tsc --noEmit

# Lint code
npx eslint src/
```

---

## Best Practices Summary

1. **Always Lazy Load** - Heavy screens should use code splitting
2. **Cache Aggressively** - API responses should be cached with appropriate TTL
3. **Optimize Images** - Always use responsive and optimized image URLs
4. **Memoize Wisely** - Only memoize expensive components/callbacks
5. **Monitor Continuously** - Track performance metrics in development
6. **Test Performance** - Include performance tests in CI/CD

---

## Resources

- [React Native Performance Guide](https://reactnative.dev/docs/performance)
- [Image Optimization Best Practices](https://expo.dev/docs/guides/preloading-and-caching-assets)
- [Bundle Size Analysis](https://webpack.js.org/guides/code-splitting/)
- [React DevTools Profiler](https://react.dev/blog/2021/03/05/introducing-the-new-jsx-transform)

---

**Next Steps:**
1. ✅ Implement code splitting utilities (DONE)
2. ✅ Add image optimization (DONE)
3. ✅ Setup API caching (DONE)
4. ✅ Add component memoization (DONE)
5. ✅ Create performance monitoring (DONE)
6. → Test implementation in actual app
7. → Measure improvements
8. → Deploy and monitor in production

---

*Last Updated: 2026-03-23*  
*Phase: 1 - Code Splitting & Lazy Loading*  
*Status: In Progress*
