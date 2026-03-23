'use strict';

import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { api } from '../config/api';
import { authStorage, userStorage } from '../utils/storage';
import { logger } from '../utils/logger';

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  preferences?: {
    notifications: boolean;
    language: 'pt' | 'en';
    theme: 'light' | 'dark';
  };
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  clearError: () => void;
  refreshToken: () => Promise<boolean>;
  isRefreshingToken: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshingToken, setIsRefreshingToken] = useState(false);
  const tokenRefreshPromiseRef = useRef<Promise<boolean> | null>(null);

  // Auto-login on app launch
  useEffect(() => {
    bootstrapAsync();
  }, []);

  const bootstrapAsync = async () => {
    try {
      setIsLoading(true);
      const token = await authStorage.getToken();
      const userProfile = await userStorage.getProfile();

      if (token && userProfile) {
        logger.debug('✅ Auto-login successful - restored session from storage');
        setUser(userProfile as User);
      } else {
        logger.debug('No stored session found - user starts as logged out');
      }
    } catch (error) {
      logger.error('Failed to restore token on app launch:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshToken = async (): Promise<boolean> => {
    // If already refreshing, wait for that promise
    if (tokenRefreshPromiseRef.current) {
      return tokenRefreshPromiseRef.current;
    }

    // Create new refresh promise
    const refreshPromise = (async () => {
      try {
        setIsRefreshingToken(true);
        const refreshToken = await authStorage.getRefreshToken();

        if (!refreshToken) {
          logger.warn('No refresh token available - logging out');
          await logout();
          return false;
        }

        const response = await api.post<{ token: string; refreshToken: string }>(
          '/auth/refresh',
          { refreshToken }
        );

        const { token: newToken, refreshToken: newRefreshToken } = response.data;

        if (!newToken) {
          logger.warn('No token in refresh response - logging out');
          await logout();
          return false;
        }

        // Update tokens
        await authStorage.setToken(newToken);
        if (newRefreshToken) {
          await authStorage.setRefreshToken(newRefreshToken);
        }

        logger.debug('✅ Token refreshed successfully');
        return true;
      } catch (error: any) {
        logger.error('Token refresh failed:', error);
        // If refresh fails, log out user
        await logout();
        return false;
      } finally {
        setIsRefreshingToken(false);
        tokenRefreshPromiseRef.current = null;
      }
    })();

    tokenRefreshPromiseRef.current = refreshPromise;
    return refreshPromise;
  };

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      // Validate email and password before sending request
      if (!email?.trim() || !password?.trim()) {
        throw new Error('Email e password são obrigatórios');
      }

      // Basic validation
      const { validateEmail } = require('../utils/validation');
      if (!validateEmail(email)) {
        throw new Error('Email inválido. Verifique o formato');
      }

      if (password.length < 6) {
        throw new Error('Password inválido');
      }

      logger.debug(`Attempting login for ${email}`);

      const response = await api.post('/auth/login', { email, password });
      const { token, refreshToken, user: userData } = response.data;

      if (!token) {
        throw new Error('No token received from server');
      }

      if (!userData) {
        throw new Error('No user data received from server');
      }

      // Save tokens and user data securely
      await authStorage.setToken(token);
      if (refreshToken) {
        await authStorage.setRefreshToken(refreshToken);
      }
      await userStorage.setProfile(userData);

      logger.debug(`✅ Login successful for ${email}`);
      setUser(userData);
    } catch (err: any) {
      let errorMessage = 'Login failed';
      
      // Handle different error types
      if (err.response?.status === 401) {
        errorMessage = 'Invalid email or password';
      } else if (err.response?.status === 429) {
        errorMessage = 'Too many login attempts. Please try again later';
      } else if (err.response?.status >= 500) {
        errorMessage = 'Server error. Please try again later';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      logger.error(`Login failed for ${email}:`, errorMessage);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      // Import validation from utils
      const { validateEmail, validatePassword, validateName } = require('../utils/validation');

      logger.debug(`Attempting registration for ${email}`);

      // Validate inputs before API call
      if (!email?.trim() || !password?.trim() || !name?.trim()) {
        const missingFields = [];
        if (!email?.trim()) missingFields.push('email');
        if (!password?.trim()) missingFields.push('password');
        if (!name?.trim()) missingFields.push('name');
        throw new Error(`Os seguintes campos são obrigatórios: ${missingFields.join(', ')}`);
      }

      if (!validateEmail(email)) {
        throw new Error('Email inválido. Verifique o formato (ex: user@example.com)');
      }

      if (!validateName(name)) {
        throw new Error('Nome deve ter pelo menos 2 caracteres e não pode conter números');
      }

      const passwordValidation = validatePassword(password);
      if (!passwordValidation.valid) {
        // Return first error as user-friendly message
        const firstError = passwordValidation.errors[0];
        const friendlyError = firstError
          .replace('Password must', 'A senha deve')
          .replace('at least', 'no mínimo')
          .replace('uppercase letter', 'uma letra maiúscula')
          .replace('number', 'um número');
        throw new Error(friendlyError);
      }

      const response = await api.post('/auth/register', { email, password, name });
      const { token, refreshToken, user: userData } = response.data;

      if (!token) {
        throw new Error('No token received from server');
      }

      if (!userData) {
        throw new Error('No user data received from server');
      }

      // Save tokens and user data securely
      await authStorage.setToken(token);
      if (refreshToken) {
        await authStorage.setRefreshToken(refreshToken);
      }
      await userStorage.setProfile(userData);

      logger.debug(`✅ Registration successful for ${email}`);
      setUser(userData);
    } catch (err: any) {
      let errorMessage = 'Registration failed';

      // Handle different error types
      if (err.response?.status === 409) {
        errorMessage = 'Email already registered. Please login instead';
      } else if (err.response?.status === 422) {
        errorMessage = 'Invalid registration data. Please check your inputs';
      } else if (err.response?.status >= 500) {
        errorMessage = 'Server error. Please try again later';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      logger.error(`Registration failed for ${email}:`, errorMessage);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);

    try {
      logger.debug('Logging out user...');
      // Call logout endpoint if available
      try {
        await api.post('/auth/logout');
        logger.debug('Logout API call successful');
      } catch (err) {
        logger.error('Logout API error:', err);
        // Continue with local logout even if API fails
      }
    } finally {
      // Always clear local data
      try {
        await authStorage.removeToken();
        await authStorage.removeRefreshToken();
        await userStorage.removeProfile();
        logger.debug('✅ Local auth data cleared');
      } catch (err) {
        logger.error('Error clearing local storage:', err);
      }
      
      setUser(null);
      setIsLoading(false);
    }
  };

  const updateUser = async (userData: Partial<User>): Promise<void> => {
    if (!user) throw new Error('No user logged in');

    try {
      const updatedUser = { ...user, ...userData };
      await api.put('/auth/user', updatedUser);
      await userStorage.setProfile(updatedUser);
      setUser(updatedUser);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update user';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const clearError = () => setError(null);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    register,
    logout,
    updateUser,
    clearError,
    refreshToken,
    isRefreshingToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
