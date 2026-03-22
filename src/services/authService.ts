'use strict';

import { api } from '../config/api';
import { authStorage, userStorage } from '../utils/storage';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

export interface LoginResponse {
  token: string;
  refreshToken?: string;
  user: {
    id: string;
    email: string;
    name: string;
    phone?: string;
    avatar?: string;
  };
}

class AuthService {
  /**
   * Login with email and password
   */
  async login(payload: LoginPayload): Promise<LoginResponse> {
    try {
      const response = await api.post('/auth/login', payload);
      const { token, refreshToken, user } = response.data;

      // Store token and user data
      await authStorage.setToken(token);
      if (refreshToken) {
        await authStorage.setRefreshToken(refreshToken);
      }
      await userStorage.setProfile(user);

      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Register new user
   */
  async register(payload: RegisterPayload): Promise<LoginResponse> {
    try {
      const response = await api.post('/auth/register', payload);
      const { token, refreshToken, user } = response.data;

      // Store token and user data
      await authStorage.setToken(token);
      if (refreshToken) {
        await authStorage.setRefreshToken(refreshToken);
      }
      await userStorage.setProfile(user);

      return response.data;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  }

  /**
   * Verify token is still valid
   */
  async verifyToken(): Promise<boolean> {
    try {
      const token = await authStorage.getToken();
      if (!token) return false;

      // Try to make a simple API call to verify token
      await api.get('/auth/verify');
      return true;
    } catch (error) {
      console.error('Token verification failed:', error);
      await authStorage.removeToken();
      return false;
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(): Promise<string | null> {
    try {
      const refreshToken = await authStorage.getRefreshToken();
      if (!refreshToken) throw new Error('No refresh token');

      const response = await api.post('/auth/refresh', { refreshToken });
      const { token } = response.data;

      await authStorage.setToken(token);
      return token;
    } catch (error) {
      console.error('Token refresh error:', error);
      await authStorage.removeToken();
      await authStorage.removeRefreshToken();
      return null;
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      // Try to notify backend
      await api.post('/auth/logout').catch(() => {
        // Fail gracefully if network is down
        console.warn('Could not notify backend of logout');
      });
    } finally {
      // Always clear local storage
      await authStorage.removeToken();
      await authStorage.removeRefreshToken();
      await userStorage.removeProfile();
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<void> {
    try {
      await api.post('/auth/password-reset/request', { email });
    } catch (error) {
      console.error('Password reset request error:', error);
      throw error;
    }
  }

  /**
   * Confirm password reset with token and new password
   */
  async confirmPasswordReset(token: string, newPassword: string): Promise<void> {
    try {
      await api.post('/auth/password-reset/confirm', { token, newPassword });
    } catch (error) {
      console.error('Password reset confirm error:', error);
      throw error;
    }
  }

  /**
   * Change password (requires current password)
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      await api.post('/auth/password-change', { currentPassword, newPassword });
    } catch (error) {
      console.error('Password change error:', error);
      throw error;
    }
  }

  /**
   * Get current user profile
   */
  async getCurrentUser() {
    try {
      const response = await api.get('/auth/profile');
      await userStorage.setProfile(response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(updates: Partial<any>): Promise<any> {
    try {
      const response = await api.put('/auth/profile', updates);
      await userStorage.setProfile(response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  /**
   * Delete account
   */
  async deleteAccount(password: string): Promise<void> {
    try {
      await api.post('/auth/delete-account', { password });
      await this.logout();
    } catch (error) {
      console.error('Error deleting account:', error);
      throw error;
    }
  }
}

export const authService = new AuthService();
