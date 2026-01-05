// ════════════════════════════════════════════════════════════════
//                    SPEC-DASH-F001: Axios API Instance
//                    Agent: @dashboard-fe-lead
// ════════════════════════════════════════════════════════════════

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { tokenService } from '../../modules/auth/services/token.service';
import { useAuthStore } from '../../modules/auth/store/auth.store';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Track if we're currently refreshing to prevent multiple refresh calls
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

// Request interceptor - add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const tokens = tokenService.getTokens();

    if (tokens?.accessToken) {
      config.headers.Authorization = `Bearer ${tokens.accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle 401 and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // If error is not 401 or request already retried, reject
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // If already refreshing, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then(() => api(originalRequest))
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshed = await useAuthStore.getState().refreshToken();

      if (refreshed) {
        const tokens = tokenService.getTokens();
        if (tokens) {
          originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`;
        }
        processQueue(null);
        return api(originalRequest);
      } else {
        // Refresh failed, logout and redirect
        processQueue(new Error('Token refresh failed'));
        useAuthStore.getState().logout();

        // Redirect to login with session expired message
        if (typeof window !== 'undefined') {
          window.location.href = '/login?session=expired';
        }

        return Promise.reject(error);
      }
    } catch (refreshError) {
      processQueue(refreshError as Error);
      useAuthStore.getState().logout();

      if (typeof window !== 'undefined') {
        window.location.href = '/login?session=expired';
      }

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
