// ════════════════════════════════════════════════════════════════
//                    API Service
//                    Kamaleon Mobile App
// ════════════════════════════════════════════════════════════════

import * as SecureStore from 'expo-secure-store';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: Record<string, any>;
}

class ApiService {
  private deviceId: string | null = null;

  async getDeviceId(): Promise<string> {
    if (this.deviceId) return this.deviceId;

    let storedId = await SecureStore.getItemAsync('deviceId');
    if (!storedId) {
      storedId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await SecureStore.setItemAsync('deviceId', storedId);
    }
    this.deviceId = storedId;
    return storedId;
  }

  async getAccessToken(): Promise<string | null> {
    return SecureStore.getItemAsync('accessToken');
  }

  async setAccessToken(token: string): Promise<void> {
    await SecureStore.setItemAsync('accessToken', token);
  }

  async clearTokens(): Promise<void> {
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('refreshToken');
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const deviceId = await this.getDeviceId();
    const accessToken = await this.getAccessToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Device-Id': deviceId,
      ...(options.headers as Record<string, string>),
    };

    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Request failed',
        };
      }

      return data;
    } catch (error) {
      return {
        success: false,
        error: 'Network error',
      };
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, body: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }
}

export const apiService = new ApiService();
