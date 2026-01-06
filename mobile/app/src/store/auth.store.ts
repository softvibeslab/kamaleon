// ════════════════════════════════════════════════════════════════
//                    Auth Store
//                    Kamaleon Mobile App
// ════════════════════════════════════════════════════════════════

import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { apiService } from '../services/api';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  tenantId: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });

    try {
      const response = await apiService.post<{
        user: User;
        tokens: { accessToken: string; refreshToken: string };
      }>('/dashboard/auth/login', { email, password });

      if (response.success && response.data) {
        await SecureStore.setItemAsync('accessToken', response.data.tokens.accessToken);
        await SecureStore.setItemAsync('refreshToken', response.data.tokens.refreshToken);

        set({
          user: response.data.user,
          isAuthenticated: true,
          isLoading: false,
        });
        return true;
      }

      set({
        error: response.error || 'Login failed',
        isLoading: false,
      });
      return false;
    } catch (error) {
      set({
        error: 'Network error',
        isLoading: false,
      });
      return false;
    }
  },

  logout: async () => {
    try {
      await apiService.post('/dashboard/auth/logout', {});
    } catch {
      // Ignore logout errors
    }

    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('refreshToken');

    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  },

  checkAuth: async () => {
    set({ isLoading: true });

    try {
      const accessToken = await SecureStore.getItemAsync('accessToken');

      if (!accessToken) {
        set({ isAuthenticated: false, isLoading: false });
        return;
      }

      const response = await apiService.get<{ user: User }>('/dashboard/auth/me');

      if (response.success && response.data) {
        set({
          user: response.data.user,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        // Token invalid, try refresh
        const refreshToken = await SecureStore.getItemAsync('refreshToken');
        if (refreshToken) {
          const refreshResponse = await apiService.post<{
            tokens: { accessToken: string; refreshToken: string };
          }>('/dashboard/auth/refresh', { refreshToken });

          if (refreshResponse.success && refreshResponse.data) {
            await SecureStore.setItemAsync('accessToken', refreshResponse.data.tokens.accessToken);
            await SecureStore.setItemAsync('refreshToken', refreshResponse.data.tokens.refreshToken);

            // Retry get user
            const retryResponse = await apiService.get<{ user: User }>('/dashboard/auth/me');
            if (retryResponse.success && retryResponse.data) {
              set({
                user: retryResponse.data.user,
                isAuthenticated: true,
                isLoading: false,
              });
              return;
            }
          }
        }

        // Clear invalid tokens
        await SecureStore.deleteItemAsync('accessToken');
        await SecureStore.deleteItemAsync('refreshToken');
        set({ isAuthenticated: false, isLoading: false });
      }
    } catch {
      set({ isAuthenticated: false, isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
