import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  USER_PROFILE: 'userProfile',
  NOTIFICATION_PREFS: 'notificationPrefs',
  BOOKINGS_CACHE: 'bookingsCache',
  THEME: 'theme',
  LANGUAGE: 'language',
};

/**
 * Generic storage get with type safety
 */
export const getStorageItem = async <T>(key: string, defaultValue?: T): Promise<T | null> => {
  try {
    const item = await AsyncStorage.getItem(key);
    if (!item) return defaultValue || null;
    return JSON.parse(item) as T;
  } catch (error) {
    console.error(`Error getting item from storage (${key}):`, error);
    return defaultValue || null;
  }
};

/**
 * Generic storage set
 */
export const setStorageItem = async <T>(key: string, value: T): Promise<void> => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error setting item in storage (${key}):`, error);
  }
};

/**
 * Generic storage remove
 */
export const removeStorageItem = async (key: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing item from storage (${key}):`, error);
  }
};

/**
 * Clear all storage
 */
export const clearStorage = async (): Promise<void> => {
  try {
    await AsyncStorage.clear();
  } catch (error) {
    console.error('Error clearing storage:', error);
  }
};

/**
 * Auth token management
 */
export const authStorage = {
  getToken: () => getStorageItem<string>(STORAGE_KEYS.AUTH_TOKEN),
  setToken: (token: string) => setStorageItem(STORAGE_KEYS.AUTH_TOKEN, token),
  removeToken: () => removeStorageItem(STORAGE_KEYS.AUTH_TOKEN),
};

/**
 * User profile management
 */
export const userStorage = {
  getProfile: () => getStorageItem(STORAGE_KEYS.USER_PROFILE),
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
