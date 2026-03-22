// Auth hooks
export { useAuth } from './useAuth';

// Booking hooks
export { useBooking } from './useBooking';

// Toast/notification hooks
export { useToast, useQuickToast } from './useToast';

// Form management
export { useForm } from './useForm';
export { useFormValidation, emailRule, passwordRule, phoneRule, nameRule } from './useFormValidation';
export type { FormErrors, UseFormOptions } from './useForm';
export type { ValidationRule, ValidationRules } from './useFormValidation';

// Local storage
export { useLocalStorage, useLocalStorageMultiple } from './useLocalStorage';

// API management
export { useAPI, useSequentialAPI } from './useAPI';
export { useSafeAPI, useFetchData, usePostData } from './useSafeAPI';
export { useFetch } from './useFetch';
export type { UseAPIState, UseAPIOptions } from './useAPI';

// State management
export { useAsyncState } from './useAsyncState';
export { useAsyncStorage } from './useAsyncStorage';
export { useCache } from './useCache';
export { useDebounce } from './useDebounce';
export { usePermissions } from './usePermissions';
export { useAnalytics } from './useAnalytics';
