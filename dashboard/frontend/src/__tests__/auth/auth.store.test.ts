// ════════════════════════════════════════════════════════════════
//                    SPEC-DASH-F001: Auth Store Tests
//                    Agent: @dashboard-fe-lead
// ════════════════════════════════════════════════════════════════

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useAuthStore } from '../../modules/auth/store/auth.store';
import { tokenService } from '../../modules/auth/services/token.service';
import { authService } from '../../modules/auth/services/auth.service';
import type { User, AuthTokens, LoginResponse } from '../../modules/auth/types/auth.types';

// Mock the services
vi.mock('../../modules/auth/services/auth.service');
vi.mock('../../modules/auth/services/token.service');

const mockUser: User = {
  id: '1',
  email: 'admin@kamaleon.com',
  name: 'Admin User',
  role: 'Admin',
  tenantId: 'tenant-1',
  permissions: ['manifests:read', 'manifests:write', 'tenants:read'],
};

const mockTokens: AuthTokens = {
  accessToken: 'mock-access-token',
  refreshToken: 'mock-refresh-token',
  expiresAt: Date.now() + 8 * 60 * 60 * 1000, // 8 hours from now
};

const mockLoginResponse: LoginResponse = {
  user: mockUser,
  tokens: mockTokens,
};

describe('AuthStore', () => {
  beforeEach(() => {
    // Reset store to initial state
    useAuthStore.getState().reset();
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('login', () => {
    it('should store user and tokens on successful login', async () => {
      vi.mocked(authService.login).mockResolvedValue(mockLoginResponse);
      vi.mocked(tokenService.saveTokens).mockImplementation(() => {});
      vi.mocked(tokenService.getTimeUntilExpiry).mockReturnValue(8 * 60 * 60 * 1000);

      const credentials = { email: 'admin@kamaleon.com', password: 'password123' };
      const result = await useAuthStore.getState().login(credentials);

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(true);
      expect(state.user).toEqual(mockUser);
      expect(state.user?.role).toBe('Admin');
      expect(state.tokens?.accessToken).toBeDefined();
    });

    it('should call tokenService.saveTokens with encrypted tokens', async () => {
      vi.mocked(authService.login).mockResolvedValue(mockLoginResponse);
      vi.mocked(tokenService.saveTokens).mockImplementation(() => {});
      vi.mocked(tokenService.getTimeUntilExpiry).mockReturnValue(8 * 60 * 60 * 1000);

      const credentials = { email: 'admin@kamaleon.com', password: 'password123' };
      await useAuthStore.getState().login(credentials);

      expect(tokenService.saveTokens).toHaveBeenCalledWith(mockTokens);
    });

    it('should set error state on failed login', async () => {
      const errorMessage = 'Invalid credentials';
      vi.mocked(authService.login).mockRejectedValue({
        response: { data: { message: errorMessage } },
      });

      const credentials = { email: 'admin@kamaleon.com', password: 'wrong' };
      const result = await useAuthStore.getState().login(credentials);

      expect(result.success).toBe(false);
      expect(result.error).toBe(errorMessage);

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
      expect(state.error).toBe(errorMessage);
    });

    it('should set loading state during login', async () => {
      let resolveLogin: (value: LoginResponse) => void;
      const loginPromise = new Promise<LoginResponse>((resolve) => {
        resolveLogin = resolve;
      });

      vi.mocked(authService.login).mockReturnValue(loginPromise);
      vi.mocked(tokenService.saveTokens).mockImplementation(() => {});
      vi.mocked(tokenService.getTimeUntilExpiry).mockReturnValue(8 * 60 * 60 * 1000);

      const loginResultPromise = useAuthStore.getState().login({
        email: 'admin@kamaleon.com',
        password: 'password123',
      });

      // Check loading state is true during request
      expect(useAuthStore.getState().isLoading).toBe(true);

      // Resolve the login
      resolveLogin!(mockLoginResponse);
      await loginResultPromise;

      // Check loading state is false after request
      expect(useAuthStore.getState().isLoading).toBe(false);
    });
  });

  describe('logout', () => {
    it('should clear all auth data on logout', async () => {
      // First, set up authenticated state
      vi.mocked(authService.login).mockResolvedValue(mockLoginResponse);
      vi.mocked(tokenService.saveTokens).mockImplementation(() => {});
      vi.mocked(tokenService.getTimeUntilExpiry).mockReturnValue(8 * 60 * 60 * 1000);

      await useAuthStore.getState().login({
        email: 'admin@kamaleon.com',
        password: 'password123',
      });

      // Verify authenticated
      expect(useAuthStore.getState().isAuthenticated).toBe(true);

      // Mock logout
      vi.mocked(authService.logout).mockResolvedValue();
      vi.mocked(tokenService.clearTokens).mockImplementation(() => {});

      // Logout
      await useAuthStore.getState().logout();

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
      expect(state.tokens).toBeNull();
      expect(tokenService.clearTokens).toHaveBeenCalled();
    });

    it('should clear tokens even if API logout fails', async () => {
      // Set up some initial state
      useAuthStore.setState({
        user: mockUser,
        tokens: mockTokens,
        isAuthenticated: true,
      });

      vi.mocked(authService.logout).mockRejectedValue(new Error('Network error'));
      vi.mocked(tokenService.clearTokens).mockImplementation(() => {});

      // logout() has try/finally that always clears tokens
      await useAuthStore.getState().logout();

      expect(tokenService.clearTokens).toHaveBeenCalled();
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
      expect(useAuthStore.getState().user).toBeNull();
    });
  });

  describe('refreshToken', () => {
    it('should update tokens on successful refresh', async () => {
      // Set up initial state with tokens
      useAuthStore.setState({
        tokens: mockTokens,
        isAuthenticated: true,
      });

      const newTokens = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        expiresAt: Date.now() + 8 * 60 * 60 * 1000,
      };

      vi.mocked(authService.refreshToken).mockResolvedValue(newTokens);
      vi.mocked(tokenService.saveTokens).mockImplementation(() => {});
      vi.mocked(tokenService.getTimeUntilExpiry).mockReturnValue(8 * 60 * 60 * 1000);

      const result = await useAuthStore.getState().refreshToken();

      expect(result).toBe(true);
      expect(tokenService.saveTokens).toHaveBeenCalled();
      expect(useAuthStore.getState().tokens?.accessToken).toBe('new-access-token');
    });

    it('should logout on failed refresh', async () => {
      useAuthStore.setState({
        tokens: mockTokens,
        isAuthenticated: true,
      });

      vi.mocked(authService.refreshToken).mockRejectedValue(new Error('Refresh failed'));
      vi.mocked(authService.logout).mockResolvedValue();
      vi.mocked(tokenService.clearTokens).mockImplementation(() => {});

      const result = await useAuthStore.getState().refreshToken();

      expect(result).toBe(false);
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });

    it('should return false if no refresh token exists', async () => {
      useAuthStore.setState({
        tokens: null,
        isAuthenticated: false,
      });

      const result = await useAuthStore.getState().refreshToken();

      expect(result).toBe(false);
      expect(authService.refreshToken).not.toHaveBeenCalled();
    });
  });

  describe('checkAuth', () => {
    it('should restore auth state from stored tokens', async () => {
      vi.mocked(tokenService.getTokens).mockReturnValue(mockTokens);
      vi.mocked(tokenService.isTokenExpired).mockReturnValue(false);
      vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser);
      vi.mocked(tokenService.getTimeUntilExpiry).mockReturnValue(8 * 60 * 60 * 1000);

      await useAuthStore.getState().checkAuth();

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(true);
      expect(state.user).toEqual(mockUser);
    });

    it('should clear state if no tokens found', async () => {
      vi.mocked(tokenService.getTokens).mockReturnValue(null);

      await useAuthStore.getState().checkAuth();

      expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });

    it('should attempt refresh if token is expired', async () => {
      // Set tokens in store state so refreshToken() can access them via get().tokens
      useAuthStore.setState({
        tokens: mockTokens,
        isAuthenticated: false,
      });

      vi.mocked(tokenService.getTokens).mockReturnValue(mockTokens);
      vi.mocked(tokenService.isTokenExpired).mockReturnValue(true);

      const newTokens = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        expiresAt: Date.now() + 8 * 60 * 60 * 1000,
      };

      vi.mocked(authService.refreshToken).mockResolvedValue(newTokens);
      vi.mocked(tokenService.saveTokens).mockImplementation(() => {});
      vi.mocked(tokenService.getTimeUntilExpiry).mockReturnValue(8 * 60 * 60 * 1000);
      vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser);

      await useAuthStore.getState().checkAuth();

      expect(authService.refreshToken).toHaveBeenCalledWith(mockTokens.refreshToken);
    });
  });

  describe('reset', () => {
    it('should reset store to initial state', async () => {
      // Set up some state
      useAuthStore.setState({
        user: mockUser,
        tokens: mockTokens,
        isAuthenticated: true,
        error: 'some error',
      });

      vi.mocked(tokenService.clearTokens).mockImplementation(() => {});

      useAuthStore.getState().reset();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.tokens).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.error).toBeNull();
      expect(state.isLoading).toBe(false);
    });
  });
});
