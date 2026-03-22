/**
 * Enhanced API Client Service
 * Wraps axios with additional features for better error handling,
 * logging, and request management
 */

import { api } from '../config/api';
import { parseError, logError, AppError } from '../utils/errorHandler';

interface RequestConfig {
  method?: 'get' | 'post' | 'put' | 'delete' | 'patch';
  url: string;
  data?: any;
  params?: any;
  retryable?: boolean;
  showErrorToast?: boolean;
  context?: string; // For logging
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: AppError;
}

/**
 * Perform a GET request
 */
export async function apiGet<T = any>(
  url: string,
  params?: any,
  context?: string
): Promise<ApiResponse<T>> {
  try {
    const response = await api.get(url, { params });
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    const appError = parseError(error);
    logError(appError, { context, method: 'GET', url });
    return {
      success: false,
      error: appError,
    };
  }
}

/**
 * Perform a POST request
 */
export async function apiPost<T = any>(
  url: string,
  data?: any,
  context?: string
): Promise<ApiResponse<T>> {
  try {
    const response = await api.post(url, data);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    const appError = parseError(error);
    logError(appError, { context, method: 'POST', url, data });
    return {
      success: false,
      error: appError,
    };
  }
}

/**
 * Perform a PUT request
 */
export async function apiPut<T = any>(
  url: string,
  data?: any,
  context?: string
): Promise<ApiResponse<T>> {
  try {
    const response = await api.put(url, data);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    const appError = parseError(error);
    logError(appError, { context, method: 'PUT', url, data });
    return {
      success: false,
      error: appError,
    };
  }
}

/**
 * Perform a DELETE request
 */
export async function apiDelete<T = any>(
  url: string,
  context?: string
): Promise<ApiResponse<T>> {
  try {
    const response = await api.delete(url);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    const appError = parseError(error);
    logError(appError, { context, method: 'DELETE', url });
    return {
      success: false,
      error: appError,
    };
  }
}

/**
 * Perform a PATCH request
 */
export async function apiPatch<T = any>(
  url: string,
  data?: any,
  context?: string
): Promise<ApiResponse<T>> {
  try {
    const response = await api.patch(url, data);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    const appError = parseError(error);
    logError(appError, { context, method: 'PATCH', url, data });
    return {
      success: false,
      error: appError,
    };
  }
}

/**
 * Generic API request with custom config
 */
export async function apiRequest<T = any>(config: RequestConfig): Promise<ApiResponse<T>> {
  try {
    const { method = 'get', url, data, params, context } = config;

    let response;
    switch (method) {
      case 'get':
        response = await api.get(url, { params });
        break;
      case 'post':
        response = await api.post(url, data);
        break;
      case 'put':
        response = await api.put(url, data);
        break;
      case 'delete':
        response = await api.delete(url);
        break;
      case 'patch':
        response = await api.patch(url, data);
        break;
      default:
        throw new Error(`Unsupported method: ${method}`);
    }

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    const appError = parseError(error);
    logError(appError, {
      context: config.context,
      method: config.method,
      url: config.url,
    });
    return {
      success: false,
      error: appError,
    };
  }
}

/**
 * API call with error callback
 * Useful for forms and screens that need custom error handling
 */
export async function apiWithErrorCallback<T = any>(
  request: () => Promise<any>,
  onError?: (error: AppError) => void,
  context?: string
): Promise<ApiResponse<T>> {
  try {
    const response = await request();
    return {
      success: true,
      data: response,
    };
  } catch (error) {
    const appError = parseError(error);
    logError(appError, { context });

    if (onError) {
      onError(appError);
    }

    return {
      success: false,
      error: appError,
    };
  }
}
