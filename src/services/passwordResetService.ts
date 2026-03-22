'use strict';

import { api } from '../config/api';

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface PasswordResetResponse {
  message: string;
  success: boolean;
}

class PasswordResetService {
  /**
   * Request password reset - sends email to user
   */
  async requestReset(email: string): Promise<PasswordResetResponse> {
    try {
      const response = await api.post<PasswordResetResponse>(
        '/auth/password-reset/request',
        { email }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Verify reset token validity
   */
  async verifyToken(token: string): Promise<{ valid: boolean; email?: string }> {
    try {
      const response = await api.post<{ valid: boolean; email?: string }>(
        '/auth/password-reset/verify-token',
        { token }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Confirm password reset with new password
   */
  async confirmReset(confirmData: PasswordResetConfirm): Promise<PasswordResetResponse> {
    try {
      // Validate passwords match
      if (confirmData.newPassword !== confirmData.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      // Validate password strength
      if (!this.isPasswordStrong(confirmData.newPassword)) {
        throw new Error('Password does not meet security requirements');
      }

      const response = await api.post<PasswordResetResponse>(
        '/auth/password-reset/confirm',
        {
          token: confirmData.token,
          newPassword: confirmData.newPassword,
        }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Change password for authenticated user
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<PasswordResetResponse> {
    try {
      // Validate password strength
      if (!this.isPasswordStrong(newPassword)) {
        throw new Error('New password does not meet security requirements');
      }

      const response = await api.post<PasswordResetResponse>(
        '/auth/password/change',
        {
          currentPassword,
          newPassword,
        }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Validate password strength
   * Requirements: min 8 chars, 1 uppercase, 1 number, 1 special char
   */
  private isPasswordStrong(password: string): boolean {
    const strongPasswordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;
    return strongPasswordRegex.test(password);
  }

  /**
   * Get password strength feedback
   */
  getPasswordStrengthFeedback(password: string): {
    strength: 'weak' | 'fair' | 'good' | 'strong';
    feedback: string[];
  } {
    const feedback: string[] = [];
    let score = 0;

    if (password.length >= 8) score++;
    else feedback.push('Pelo menos 8 caracteres');

    if (/[A-Z]/.test(password)) score++;
    else feedback.push('Pelo menos 1 letra maiúscula');

    if (/\d/.test(password)) score++;
    else feedback.push('Pelo menos 1 número');

    if (/[!@#$%^&*]/.test(password)) score++;
    else feedback.push('Pelo menos 1 caractere especial (!@#$%^&*)');

    const strengthMap = {
      1: 'weak' as const,
      2: 'fair' as const,
      3: 'good' as const,
      4: 'strong' as const,
    };

    return {
      strength: strengthMap[score as 1 | 2 | 3 | 4] || 'weak',
      feedback: feedback.length > 0 ? feedback : ['Excelente! Senha muito segura.'],
    };
  }

  /**
   * Handle API errors
   */
  private handleError(error: any): Error {
    if (error.response?.status === 404) {
      return new Error('Email não encontrado');
    }
    if (error.response?.status === 400) {
      return new Error(error.response?.data?.message || 'Dados inválidos');
    }
    if (error.response?.status === 401) {
      return new Error('Token expirado ou inválido');
    }
    return error;
  }
}

export const passwordResetService = new PasswordResetService();
