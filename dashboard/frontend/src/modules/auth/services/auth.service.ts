// ════════════════════════════════════════════════════════════════
//                    SPEC-DASH-F001: Auth Service
//                    Agent: @dashboard-fe-lead
// ════════════════════════════════════════════════════════════════

import api from '../../../lib/axios/api';
import type {
  LoginCredentials,
  LoginResponse,
  RefreshTokenResponse,
  User,
} from '../types/auth.types';

const AUTH_ENDPOINTS = {
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  REFRESH: '/auth/refresh',
  ME: '/auth/me',
} as const;

export const authService = {
  /**
   * Login with email and password
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>(
      AUTH_ENDPOINTS.LOGIN,
      credentials
    );
    return response.data;
  },

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    try {
      await api.post(AUTH_ENDPOINTS.LOGOUT);
    } catch {
      // Ignore logout errors - we'll clear local state anyway
    }
  },

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    const response = await api.post<RefreshTokenResponse>(
      AUTH_ENDPOINTS.REFRESH,
      { refreshToken }
    );
    return response.data;
  },

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>(AUTH_ENDPOINTS.ME);
    return response.data;
  },
};
