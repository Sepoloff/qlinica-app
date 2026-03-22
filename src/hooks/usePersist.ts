'use strict';

import { useState, useCallback, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UsePersistOptions {
  serialize?: (data: any) => string;
  deserialize?: (data: string) => any;
  onError?: (error: Error) => void;
}

interface UsePersistResult<T> {
  data: T | null;
  loading: boolean;
  save: (data: T) => Promise<void>;
  remove: () => Promise<void>;
  reset: () => void;
}

/**
 * Hook for persisting data to AsyncStorage
 * 
 * @example
 * const { data, save, remove } = usePersist(
 *   'bookingData',
 *   defaultBookingData
 * );
 */
export const usePersist = <T = any,>(
  key: string,
  initialValue?: T,
  options: UsePersistOptions = {}
): UsePersistResult<T> => {
  const {
    serialize = JSON.stringify,
    deserialize = JSON.parse,
    onError,
  } = options;

  const [data, setData] = useState<T | null>(initialValue || null);
  const [loading, setLoading] = useState(true);
  const isMountedRef = useRef(true);

  // Load data on mount
  useEffect(() => {
    isMountedRef.current = true;

    const loadData = async () => {
      try {
        const stored = await AsyncStorage.getItem(key);

        if (stored && isMountedRef.current) {
          const parsedData = deserialize(stored);
          setData(parsedData);
        }
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        onError?.(err);
        console.error(`Error loading data from ${key}:`, err);
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMountedRef.current = false;
    };
  }, [key, deserialize, onError]);

  const save = useCallback(
    async (newData: T) => {
      try {
        const serialized = serialize(newData);
        await AsyncStorage.setItem(key, serialized);

        if (isMountedRef.current) {
          setData(newData);
        }
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        onError?.(err);
        console.error(`Error saving data to ${key}:`, err);
        throw err;
      }
    },
    [key, serialize, onError]
  );

  const remove = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(key);

      if (isMountedRef.current) {
        setData(null);
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      onError?.(err);
      console.error(`Error removing data from ${key}:`, err);
      throw err;
    }
  }, [key, onError]);

  const reset = useCallback(() => {
    setData(initialValue || null);
  }, [initialValue]);

  return {
    data,
    loading,
    save,
    remove,
    reset,
  };
};
