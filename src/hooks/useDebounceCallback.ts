/**
 * useDebounceCallback Hook - Debounce async callbacks
 */

import { useCallback, useRef, useEffect } from 'react';

export const useDebounceCallback = <T extends (...args: any[]) => Promise<void>>(
  callback: T,
  delay: number = 500
): T => {
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback(
    (...args: any[]) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  ) as T;
};
