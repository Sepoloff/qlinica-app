import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UseAsyncStorageResult<T> {
  value: T | null;
  loading: boolean;
  error: Error | null;
  setValue: (value: T | null) => Promise<void>;
  removeValue: () => Promise<void>;
}

/**
 * Hook for managing AsyncStorage values with proper error handling
 * @param key - Storage key
 * @param initialValue - Default value if storage is empty
 * @param serialize - Custom serializer (default: JSON.stringify)
 * @param deserialize - Custom deserializer (default: JSON.parse)
 */
export const useAsyncStorage = <T,>(
  key: string,
  initialValue?: T,
  serialize: (value: T) => string = (value) => JSON.stringify(value),
  deserialize: (value: string) => T = (value) => JSON.parse(value)
): UseAsyncStorageResult<T> => {
  const [value, setValue] = useState<T | null>(initialValue ?? null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Load value from storage
  useEffect(() => {
    const loadValue = async () => {
      try {
        setLoading(true);
        const storedValue = await AsyncStorage.getItem(key);
        
        if (storedValue) {
          setValue(deserialize(storedValue));
        } else if (initialValue) {
          setValue(initialValue);
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        console.error(`Error loading value from AsyncStorage (key: ${key}):`, error);
      } finally {
        setLoading(false);
      }
    };

    loadValue();
  }, [key]);

  const updateValue = async (newValue: T | null) => {
    try {
      setValue(newValue);
      
      if (newValue === null) {
        await AsyncStorage.removeItem(key);
      } else {
        const serialized = serialize(newValue);
        await AsyncStorage.setItem(key, serialized);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      console.error(`Error setting value in AsyncStorage (key: ${key}):`, error);
    }
  };

  const removeValue = async () => {
    try {
      setValue(null);
      await AsyncStorage.removeItem(key);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      console.error(`Error removing value from AsyncStorage (key: ${key}):`, error);
    }
  };

  return {
    value,
    loading,
    error,
    setValue: updateValue,
    removeValue,
  };
};
