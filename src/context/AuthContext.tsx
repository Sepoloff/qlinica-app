'use strict';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../config/api';
import { authStorage, userStorage } from '../utils/storage';

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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        setUser(userProfile as User);
      }
    } catch (error) {
      console.error('Failed to restore token:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user: userData } = response.data;

      if (!token) {
        throw new Error('No token received from server');
      }

      // Save token and user data
      await authStorage.setToken(token);
      await userStorage.setProfile(userData);

      setUser(userData);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Login failed';
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
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Invalid email format');
      }

      // Validate password strength (min 8 chars, 1 uppercase, 1 number)
      const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
      if (!passwordRegex.test(password)) {
        throw new Error('Password must be at least 8 characters with uppercase letter and number');
      }

      const response = await api.post('/auth/register', { email, password, name });
      const { token, user: userData } = response.data;

      if (!token) {
        throw new Error('No token received from server');
      }

      // Save token and user data
      await authStorage.setToken(token);
      await userStorage.setProfile(userData);

      setUser(userData);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Registration failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);

    try {
      // Call logout endpoint if available
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout API error:', err);
    } finally {
      // Always clear local data
      await authStorage.removeToken();
      await userStorage.removeProfile();
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
