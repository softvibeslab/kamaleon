// ════════════════════════════════════════════════════════════════
//                    SPEC-DASH-F001: Auth Store (Zustand)
//                    Agent: @dashboard-fe-lead
// ════════════════════════════════════════════════════════════════

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { authService } from '../services/auth.service';
import { tokenService } from '../services/token.service';
import type {
  AuthState,
  LoginCredentials,
  User,
  AuthTokens,
} from '../types/auth.types';

interface AuthActions {
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  checkAuth: () => Promise<void>;
  setUser: (user: User | null) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState: AuthState = {
  user: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Token refresh timer reference
let refreshTimer: ReturnType<typeof setTimeout> | null = null;

const setupTokenRefresh = (tokens: AuthTokens, refreshFn: () => Promise<boolean>) => {
  // Clear existing timer
  if (refreshTimer) {
    clearTimeout(refreshTimer);
    refreshTimer = null;
  }

  // Calculate time until refresh (30 min before expiry)
  const timeUntilRefresh = tokenService.getTimeUntilExpiry(tokens) - 30 * 60 * 1000;

  if (timeUntilRefresh > 0) {
    refreshTimer = setTimeout(() => {
      refreshFn();
    }, timeUntilRefresh);
  }
};

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      login: async (credentials) => {
        set({ isLoading: true, error: null });

        try {
          const response = await authService.login(credentials);

          // Save encrypted tokens
          tokenService.saveTokens(response.tokens);

          set({
            user: response.user,
            tokens: response.tokens,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          // Setup auto-refresh
          setupTokenRefresh(response.tokens, get().refreshToken);

          return { success: true };
        } catch (error: unknown) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
                'Login failed';

          set({
            isLoading: false,
            error: errorMessage,
            isAuthenticated: false,
            user: null,
            tokens: null,
          });

          return { success: false, error: errorMessage };
        }
      },

      logout: async () => {
        // Clear refresh timer
        if (refreshTimer) {
          clearTimeout(refreshTimer);
          refreshTimer = null;
        }

        try {
          await authService.logout();
        } catch {
          // Ignore logout errors - we'll clear local state anyway
        } finally {
          tokenService.clearTokens();
          set(initialState);
        }
      },

      refreshToken: async () => {
        const { tokens } = get();
        if (!tokens?.refreshToken) return false;

        try {
          const newTokens = await authService.refreshToken(tokens.refreshToken);
          const updatedTokens: AuthTokens = {
            accessToken: newTokens.accessToken,
            refreshToken: newTokens.refreshToken,
            expiresAt: newTokens.expiresAt,
          };

          tokenService.saveTokens(updatedTokens);
          set({ tokens: updatedTokens });

          // Setup next refresh
          setupTokenRefresh(updatedTokens, get().refreshToken);

          return true;
        } catch {
          // Token refresh failed, logout
          await get().logout();
          return false;
        }
      },

      checkAuth: async () => {
        set({ isLoading: true });

        const tokens = tokenService.getTokens();

        if (!tokens) {
          set({ ...initialState, isLoading: false });
          return;
        }

        // Check if token is expired
        if (tokenService.isTokenExpired(tokens)) {
          const refreshed = await get().refreshToken();
          if (!refreshed) {
            set({ ...initialState, isLoading: false });
            return;
          }
        }

        try {
          const user = await authService.getCurrentUser();
          const currentTokens = tokenService.getTokens();

          set({
            user,
            tokens: currentTokens,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          // Setup auto-refresh if tokens exist
          if (currentTokens) {
            setupTokenRefresh(currentTokens, get().refreshToken);
          }
        } catch {
          tokenService.clearTokens();
          set({ ...initialState, isLoading: false });
        }
      },

      setUser: (user) => set({ user }),

      setError: (error) => set({ error }),

      reset: () => {
        if (refreshTimer) {
          clearTimeout(refreshTimer);
          refreshTimer = null;
        }
        tokenService.clearTokens();
        set(initialState);
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => ({
        getItem: (name) => {
          const encrypted = localStorage.getItem(name);
          if (!encrypted) return null;
          return tokenService.decrypt(encrypted);
        },
        setItem: (name, value) => {
          const encrypted = tokenService.encrypt(value);
          localStorage.setItem(name, encrypted);
        },
        removeItem: (name) => localStorage.removeItem(name),
      })),
      partialize: (state) => ({
        tokens: state.tokens,
        user: state.user,
      }),
    }
  )
);
