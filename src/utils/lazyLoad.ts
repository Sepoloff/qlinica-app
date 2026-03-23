/**
 * Lazy Loading Utilities for Code Splitting
 * Optimizes app performance by splitting large screens into separate chunks
 */

import { lazy, Suspense } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { COLORS } from '../constants/Colors';

/**
 * Create a lazy-loaded screen component with loading fallback
 * @param importFunc - Async function that imports the component
 * @returns Component with loading state during code split
 */
export const createLazyScreen = (
  importFunc: () => Promise<{ default: React.ComponentType<any> }>
) => {
  const LazyComponent = lazy(importFunc);

  return (props: any) => (
    <Suspense fallback={<LazyLoadingFallback />}>
      <LazyComponent {...props} />
    </Suspense>
  );
};

/**
 * Preload a component before navigation
 * @param importFunc - Async function that imports the component
 */
export const preloadScreen = (
  importFunc: () => Promise<{ default: React.ComponentType<any> }>
) => {
  // Trigger the import without rendering
  importFunc().catch(err => {
    console.warn('Failed to preload screen:', err);
  });
};

/**
 * Loading fallback component shown while code splitting
 */
const LazyLoadingFallback = () => (
  <View
    style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: COLORS.background,
    }}
  >
    <ActivityIndicator size="large" color={COLORS.primary} />
  </View>
);

/**
 * Batch preload multiple screens
 * Call this on app startup or before high-traffic routes
 * @param importFuncs - Array of import functions
 */
export const preloadScreens = (
  importFuncs: Array<() => Promise<{ default: React.ComponentType<any> }>>
) => {
  importFuncs.forEach(importFunc => {
    preloadScreen(importFunc);
  });
};

export default {
  createLazyScreen,
  preloadScreen,
  preloadScreens,
};
