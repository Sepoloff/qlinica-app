import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Hook para gerenciar dados em AsyncStorage com estado sincronizado
 */
export const useLocalStorage = <T,>(
  key: string,
  initialValue?: T
): [T | null, (value: T | ((val: T | null) => T)) => Promise<void>, () => Promise<void>] => {
  const [value, setValue] = useState<T | null>(initialValue || null);
  const [isLoading, setIsLoading] = useState(true);

  // Load value from storage on mount
  useEffect(() => {
    const loadValue = async () => {
      try {
        const item = await AsyncStorage.getItem(key);
        if (item) {
          setValue(JSON.parse(item) as T);
        }
        setIsLoading(false);
      } catch (error) {
        console.error(`Error loading ${key} from storage:`, error);
        setIsLoading(false);
      }
    };

    loadValue();
  }, [key]);

  // Function to update both state and storage
  const setStorageValue = useCallback(
    async (newValue: T | ((val: T | null) => T)) => {
      try {
        const valueToStore = newValue instanceof Function ? newValue(value) : newValue;
        setValue(valueToStore);
        await AsyncStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.error(`Error saving ${key} to storage:`, error);
      }
    },
    [key, value]
  );

  // Function to remove value from storage
  const removeValue = useCallback(async () => {
    try {
      setValue(null);
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing ${key} from storage:`, error);
    }
  }, [key]);

  return [value, setStorageValue, removeValue];
};

/**
 * Hook para gerenciar múltiplos valores em AsyncStorage
 */
export const useLocalStorageMultiple = <T extends Record<string, any>>(
  prefix: string,
  initialValues: T
): [T, (key: keyof T, value: any) => Promise<void>, () => Promise<void>] => {
  const [values, setValues] = useState<T>(initialValues);

  // Load all values on mount
  useEffect(() => {
    const loadValues = async () => {
      try {
        const loadedValues: Partial<T> = {};
        for (const key of Object.keys(initialValues)) {
          const item = await AsyncStorage.getItem(`${prefix}_${key}`);
          if (item) {
            loadedValues[key as keyof T] = JSON.parse(item);
          }
        }
        setValues(prev => ({ ...prev, ...loadedValues }));
      } catch (error) {
        console.error(`Error loading ${prefix} from storage:`, error);
      }
    };

    loadValues();
  }, [prefix, initialValues]);

  const setValue = useCallback(
    async (key: keyof T, value: any) => {
      try {
        setValues(prev => ({ ...prev, [key]: value }));
        await AsyncStorage.setItem(`${prefix}_${key as string}`, JSON.stringify(value));
      } catch (error) {
        console.error(`Error saving ${prefix}_${key as string} to storage:`, error);
      }
    },
    [prefix]
  );

  const clearAll = useCallback(async () => {
    try {
      setValues(initialValues);
      for (const key of Object.keys(initialValues)) {
        await AsyncStorage.removeItem(`${prefix}_${key}`);
      }
    } catch (error) {
      console.error(`Error clearing ${prefix} from storage:`, error);
    }
  }, [prefix, initialValues]);

  return [values, setValue, clearAll];
};
