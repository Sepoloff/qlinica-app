import axios, { AxiosError, AxiosResponse, AxiosRequestConfig } from 'axios';
import { authStorage } from '../utils/storage';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // ms

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Track retry counts per request
const retryCount = new Map<string, number>();

// Request interceptor - Add JWT token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await authStorage.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error retrieving token:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle errors and retry logic
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Reset retry count on success
    const key = `${response.config.method}:${response.config.url}`;
    retryCount.delete(key);
    return response;
  },
  async (error: AxiosError) => {
    const config = error.config as AxiosRequestConfig & { retryCount?: number };

    if (!config) {
      return Promise.reject(error);
    }

    const key = `${config.method}:${config.url}`;
    const currentRetry = retryCount.get(key) || 0;

    // Handle 401 - Unauthorized (don't retry)
    if (error.response?.status === 401) {
      try {
        await authStorage.removeToken();
        console.log('Token expired - user logged out');
      } catch (storageError) {
        console.error('Error clearing storage:', storageError);
      }
      return Promise.reject(error);
    }

    // Retry on network errors or 5xx errors
    const shouldRetry =
      (!error.response || error.response.status >= 500) &&
      currentRetry < MAX_RETRIES &&
      config.method !== 'post'; // Don't retry POST by default

    if (shouldRetry) {
      retryCount.set(key, currentRetry + 1);
      console.log(`Retrying ${key} (${currentRetry + 1}/${MAX_RETRIES})`);

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY * (currentRetry + 1)));

      return api(config);
    }

    retryCount.delete(key);
    return Promise.reject(error);
  }
);

export default api;
