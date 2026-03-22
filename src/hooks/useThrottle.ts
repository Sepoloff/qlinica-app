'use strict';

import { useState, useCallback, useRef } from 'react';

/**
 * Hook for throttling function calls
 * 
 * Limits how often a function can be called
 * 
 * @example
 * const throttledSearch = useThrottle((term: string) => {
 *   searchApi(term);
 * }, 1000);
 * 
 * <TextInput
 *   onChangeText={throttledSearch}
 * />
 */
export const useThrottle = <T extends (...args: any[]) => any,>(
  callback: T,
  delay: number = 1000
): T => {
  const lastRanRef = useRef<number>(Date.now());
  const timeoutRef = useRef<NodeJS.Timeout>();

  return useCallback(
    (...args: any[]) => {
      const now = Date.now();
      const remaining = delay - (now - lastRanRef.current);

      if (remaining <= 0) {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        callback(...args);
        lastRanRef.current = now;
      } else {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
          callback(...args);
          lastRanRef.current = Date.now();
        }, remaining);
      }
    },
    [callback, delay]
  ) as T;
};
