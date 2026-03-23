import axios, { AxiosError, AxiosResponse, AxiosRequestConfig } from 'axios';
import { authStorage } from '../utils/storage';
import { analyticsService } from '../services/analyticsService';
import { logger } from '../utils/logger';
import { parseAPIError, isAuthError } from '../utils/apiErrorHandler';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 500; // ms - starts with 500ms
const MAX_RETRY_DELAY = 8000; // ms - max 8s

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Track retry counts per request
const retryCount = new Map<string, number>();

/**
 * Calculate exponential backoff delay with jitter
 * Formula: min(INITIAL * (2 ^ attempt) + jitter, MAX_RETRY_DELAY)
 */
const getExponentialBackoffDelay = (attempt: number): number => {
  const exponentialDelay = INITIAL_RETRY_DELAY * Math.pow(2, attempt);
  const jitter = Math.random() * INITIAL_RETRY_DELAY;
  const delay = Math.min(exponentialDelay + jitter, MAX_RETRY_DELAY);
  return Math.round(delay);
};

// Request interceptor - Add JWT token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await authStorage.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      // Log API request
      const startTime = Date.now();
      (config as any).metadata = { startTime };
      logger.debug(`${config.method?.toUpperCase()} ${config.url}`);
    } catch (error) {
      logger.error('Error retrieving token', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle errors and retry logic with exponential backoff
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Reset retry count on success
    const key = `${response.config.method}:${response.config.url}`;
    retryCount.delete(key);
    
    // Log successful response with timing
    const metadata = (response.config as any).metadata;
    if (metadata?.startTime) {
      const duration = Date.now() - metadata.startTime;
      logger.trackAPI(
        response.config.method?.toUpperCase() || 'UNKNOWN',
        response.config.url || 'unknown',
        response.status
      );
    }
    
    return response;
  },
  async (error: AxiosError) => {
    const config = error.config as AxiosRequestConfig & { retryCount?: number };

    if (!config) {
      return Promise.reject(error);
    }

    const key = `${config.method}:${config.url}`;
    const currentRetry = retryCount.get(key) || 0;

    // Handle 401/403 - Unauthorized (don't retry)
    const parsedError = parseAPIError(error);
    if (error.response?.status === 401 || error.response?.status === 403 || isAuthError(parsedError)) {
      try {
        await authStorage.removeToken();
        logger.warn('🔐 Token expired or access denied - user logged out');
        analyticsService.trackError(error, {
          type: 'auth_error',
          code: parsedError.code,
          endpoint: config.url,
        });
      } catch (storageError) {
        logger.error('Error clearing storage', storageError);
      }
      return Promise.reject(parsedError);
    }

    // Don't retry 4xx errors (except 429 - rate limit)
    const isClientError = error.response && error.response.status >= 400 && error.response.status < 500;
    const isRateLimited = error.response?.status === 429;

    if (isClientError && !isRateLimited) {
      return Promise.reject(error);
    }

    // Retry on:
    // 1. Network errors (no response)
    // 2. 5xx server errors
    // 3. 429 rate limit errors
    const isNetworkError = !error.response;
    const isServerError = error.response && error.response.status >= 500;
    const shouldRetry = (isNetworkError || isServerError || isRateLimited) && currentRetry < MAX_RETRIES;

    if (shouldRetry) {
      retryCount.set(key, currentRetry + 1);
      const delayMs = getExponentialBackoffDelay(currentRetry);

      console.log(`🔄 Retrying ${config.method?.toUpperCase()} ${config.url} (${currentRetry + 1}/${MAX_RETRIES}) after ${delayMs}ms`);

      // Track retry in analytics
      analyticsService.trackEvent('api_retry', {
        method: config.method,
        url: config.url,
        attempt: currentRetry + 1,
        status: error.response?.status,
        delayMs,
      });

      // Wait with exponential backoff
      await new Promise((resolve) => setTimeout(resolve, delayMs));

      return api(config);
    }

    // Log final error
    retryCount.delete(key);
    const metadata = (config as any).metadata;
    const duration = metadata?.startTime ? Date.now() - metadata.startTime : undefined;
    
    logger.error(
      `API Error after ${currentRetry} retries`,
      {
        method: config.method,
        url: config.url,
        status: error.response?.status,
        durationMs: duration,
        retries: currentRetry,
      }
    );

    // Track final error
    analyticsService.trackError(error, {
      type: 'api_error',
      method: config.method,
      url: config.url,
      status: error.response?.status,
      retries: currentRetry,
    });

    return Promise.reject(error);
  }
);

export default api;
