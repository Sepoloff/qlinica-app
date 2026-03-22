import AsyncStorage from '@react-native-async-storage/async-storage';
import { encryptionService } from './encryption';
import { logger } from './logger';

const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  REFRESH_TOKEN: 'refreshToken',
  USER_PROFILE: 'userProfile',
  NOTIFICATION_PREFS: 'notificationPrefs',
  BOOKINGS_CACHE: 'bookingsCache',
  THEME: 'theme',
  LANGUAGE: 'language',
};

// Keys that should be encrypted
const SENSITIVE_KEYS = [STORAGE_KEYS.AUTH_TOKEN, STORAGE_KEYS.REFRESH_TOKEN];

/**
 * Generic storage get with type safety
 * Automatically decrypts sensitive keys
 */
export const getStorageItem = async <T>(key: string, defaultValue?: T): Promise<T | null> => {
  try {
    let item = await AsyncStorage.getItem(key);
    if (!item) return defaultValue || null;

    // Decrypt sensitive data
    if (SENSITIVE_KEYS.includes(key)) {
      try {
        item = encryptionService.decrypt(item);
      } catch (decryptError) {
        logger.warn(`Failed to decrypt ${key}, using as-is`, 'storage');
      }
    }

    return JSON.parse(item) as T;
  } catch (error) {
    logger.error(`Error getting item from storage (${key}):`, error as Error, 'storage');
    return defaultValue || null;
  }
};

/**
 * Generic storage set
 * Automatically encrypts sensitive keys
 */
export const setStorageItem = async <T>(key: string, value: T): Promise<void> => {
  try {
    let itemToStore = JSON.stringify(value);

    // Encrypt sensitive data
    if (SENSITIVE_KEYS.includes(key)) {
      itemToStore = encryptionService.encrypt(itemToStore);
    }

    await AsyncStorage.setItem(key, itemToStore);
  } catch (error) {
    logger.error(`Error setting item in storage (${key}):`, error as Error, 'storage');
  }
};

/**
 * Generic storage remove
 */
export const removeStorageItem = async (key: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    logger.error(`Error removing item from storage (${key}):`, error as Error, 'storage');
  }
};

/**
 * Clear all storage
 */
export const clearStorage = async (): Promise<void> => {
  try {
    await AsyncStorage.clear();
    logger.debug('Storage cleared successfully', 'storage');
  } catch (error) {
    logger.error('Error clearing storage:', error as Error, 'storage');
  }
};

/**
 * Auth token management
 */
export const authStorage = {
  getToken: () => getStorageItem<string>(STORAGE_KEYS.AUTH_TOKEN),
  setToken: (token: string) => setStorageItem(STORAGE_KEYS.AUTH_TOKEN, token),
  removeToken: () => removeStorageItem(STORAGE_KEYS.AUTH_TOKEN),
  getRefreshToken: () => getStorageItem<string>(STORAGE_KEYS.REFRESH_TOKEN),
  setRefreshToken: (token: string) => setStorageItem(STORAGE_KEYS.REFRESH_TOKEN, token),
  removeRefreshToken: () => removeStorageItem(STORAGE_KEYS.REFRESH_TOKEN),
};

/**
 * User profile management
 */
export const userStorage = {
  getProfile: () => getStorageItem<any>(STORAGE_KEYS.USER_PROFILE),
  setProfile: (profile: any) => setStorageItem(STORAGE_KEYS.USER_PROFILE, profile),
  removeProfile: () => removeStorageItem(STORAGE_KEYS.USER_PROFILE),
};

/**
 * Notification preferences management
 */
export const preferencesStorage = {
  getPreferences: () => getStorageItem(STORAGE_KEYS.NOTIFICATION_PREFS, {
    sms: true,
    email: true,
    push: false,
  }),
  setPreferences: (prefs: any) => setStorageItem(STORAGE_KEYS.NOTIFICATION_PREFS, prefs),
};

/**
 * Theme management
 */
export const themeStorage = {
  getTheme: () => getStorageItem<'light' | 'dark'>(STORAGE_KEYS.THEME, 'dark'),
  setTheme: (theme: 'light' | 'dark') => setStorageItem(STORAGE_KEYS.THEME, theme),
};

/**
 * Language management
 */
export const languageStorage = {
  getLanguage: () => getStorageItem<'pt' | 'en'>(STORAGE_KEYS.LANGUAGE, 'pt'),
  setLanguage: (language: 'pt' | 'en') => setStorageItem(STORAGE_KEYS.LANGUAGE, language),
};

/**
 * Bookings cache management
 */
export const bookingsStorage = {
  getBookings: () => getStorageItem(STORAGE_KEYS.BOOKINGS_CACHE, []),
  setBookings: (bookings: any) => setStorageItem(STORAGE_KEYS.BOOKINGS_CACHE, bookings),
  clearBookings: () => removeStorageItem(STORAGE_KEYS.BOOKINGS_CACHE),
};
