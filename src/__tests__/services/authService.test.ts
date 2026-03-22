/**
 * Testes para AuthService
 * Testa: login, register com mocks
 */

import { authService } from '../../services/authService';
import { api } from '../../config/api';

// Mock do api
jest.mock('../../config/api');
jest.mock('../../utils/storage');

describe('AuthService - Login & Register', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============== LOGIN TESTS ==============
  describe('login', () => {
    const mockLoginResponse = {
      token: 'mock-jwt-token-123',
      refreshToken: 'mock-refresh-token',
      user: {
        id: 'user-123',
        email: 'user@example.com',
        name: 'Test User',
        phone: '+351912345678',
        avatar: 'https://example.com/avatar.jpg',
      },
    };

    it('✅ deve fazer login com credenciais válidas', async () => {
      (api.post as jest.Mock).mockResolvedValue({
        data: mockLoginResponse,
      });

      const result = await authService.login({
        email: 'user@example.com',
        password: 'ValidPass123',
      });

      expect(result).toEqual(mockLoginResponse);
      expect(api.post).toHaveBeenCalledWith('/auth/login', {
        email: 'user@example.com',
        password: 'ValidPass123',
      });
    });

    it('✅ deve armazenar token após login bem-sucedido', async () => {
      const mockAuthStorage = require('../../utils/storage').authStorage;
      mockAuthStorage.setToken = jest.fn();

      (api.post as jest.Mock).mockResolvedValue({
        data: mockLoginResponse,
      });

      await authService.login({
        email: 'user@example.com',
        password: 'ValidPass123',
      });

      expect(mockAuthStorage.setToken).toHaveBeenCalledWith('mock-jwt-token-123');
    });

    it('✅ deve armazenar refresh token após login', async () => {
      const mockAuthStorage = require('../../utils/storage').authStorage;
      mockAuthStorage.setRefreshToken = jest.fn();

      (api.post as jest.Mock).mockResolvedValue({
        data: mockLoginResponse,
      });

      await authService.login({
        email: 'user@example.com',
        password: 'ValidPass123',
      });

      expect(mockAuthStorage.setRefreshToken).toHaveBeenCalledWith(
        'mock-refresh-token'
      );
    });



    it('✅ deve fazer uma chamada POST para /auth/login', async () => {
      (api.post as jest.Mock).mockResolvedValue({
        data: mockLoginResponse,
      });

      await authService.login({
        email: 'user@example.com',
        password: 'ValidPass123',
      });

      expect(api.post).toHaveBeenCalledTimes(1);
      expect(api.post).toHaveBeenCalledWith(expect.stringContaining('/auth/login'), expect.any(Object));
    });
  });

  // ============== REGISTER TESTS ==============
  describe('register', () => {
    const mockRegisterResponse = {
      token: 'mock-jwt-token-new-user',
      refreshToken: 'mock-refresh-token-new',
      user: {
        id: 'user-new-456',
        email: 'newuser@example.com',
        name: 'New User',
        phone: '+351987654321',
        avatar: undefined,
      },
    };

    it('✅ deve criar nova conta com dados válidos', async () => {
      (api.post as jest.Mock).mockResolvedValue({
        data: mockRegisterResponse,
      });

      const result = await authService.register({
        email: 'newuser@example.com',
        password: 'NewPass123',
        name: 'New User',
        phone: '+351987654321',
      });

      expect(result).toEqual(mockRegisterResponse);
      expect(api.post).toHaveBeenCalledWith('/auth/register', expect.objectContaining({
        email: 'newuser@example.com',
        name: 'New User',
      }));
    });

    it('✅ deve armazenar token de novo usuário', async () => {
      const mockAuthStorage = require('../../utils/storage').authStorage;
      mockAuthStorage.setToken = jest.fn();

      (api.post as jest.Mock).mockResolvedValue({
        data: mockRegisterResponse,
      });

      await authService.register({
        email: 'newuser@example.com',
        password: 'NewPass123',
        name: 'New User',
      });

      expect(mockAuthStorage.setToken).toHaveBeenCalledWith('mock-jwt-token-new-user');
    });


  });

  // ============== LOGOUT TESTS ==============
  describe('logout', () => {
    it('✅ deve fazer logout e limpar autenticação', async () => {
      (api.post as jest.Mock).mockResolvedValue({ status: 200 });

      await authService.logout();

      expect(api.post).toHaveBeenCalledWith('/auth/logout');
    });
  });

  // ============== CHANGE PASSWORD ==============
  describe('changePassword', () => {
    it('✅ deve alterar a senha do usuário', async () => {
      (api.post as jest.Mock).mockResolvedValue({ status: 200 });

      await authService.changePassword('OldPass123', 'NewPass456');

      expect(api.post).toHaveBeenCalledWith('/auth/password-change', {
        currentPassword: 'OldPass123',
        newPassword: 'NewPass456',
      });
    });
  });
});
