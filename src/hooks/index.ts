/**
 * Custom Hooks Index
 */

export { useAuth } from '../context/AuthContext';
export { useBooking } from '../context/BookingContext';
export { useBookingFlow } from '../context/BookingFlowContext';
export { useToast } from '../context/ToastContext';
export { useAnimatedValue } from './useAnimatedValue';
export { useDebounce } from './useDebounce';
export { useDebounceCallback } from './useDebounceCallback';
export { usePrevious } from './usePrevious';
export { useMount } from './useMount';
export { useUnmount } from './useUnmount';
export { useApiCache, useMultiApiCache } from './useApiCache';
export { usePrefetchData, usePrefetch } from './usePrefetchData';
export { useSmartRefresh, useDataChangeDetection } from './useSmartRefresh';
export { 
  useDeduplicatedRequest, 
  useMultiDeduplicatedRequests,
  clearAllPendingRequests,
  getPendingRequestsInfo
} from './useDeduplicatedRequest';
export { useRequestWithRetry, useMultiRequestWithRetry } from './useRequestWithRetry';
export { useFormValidation } from './useFormValidation';
export { useCustomToast } from './useCustomToast';
export { useAsyncOperationState } from './useAsyncOperationState';
