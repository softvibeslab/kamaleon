// ════════════════════════════════════════════════════════════════
//                    SPEC-DASH-F001: Token Service
//                    Agent: @dashboard-fe-lead
// ════════════════════════════════════════════════════════════════

import CryptoJS from 'crypto-js';
import type { AuthTokens } from '../types/auth.types';

const STORAGE_KEY = 'kamaleon_auth';
const ENCRYPTION_PREFIX = 'encrypted:';

// Get encryption key from environment
const getSecret = (): string => {
  const secret = import.meta.env.VITE_ENCRYPTION_KEY;
  if (!secret) {
    console.warn('VITE_ENCRYPTION_KEY not set, using fallback');
    return 'kamaleon-dev-key-change-in-production';
  }
  return secret;
};

export const tokenService = {
  /**
   * Encrypt data using AES encryption
   */
  encrypt(data: string): string {
    const encrypted = CryptoJS.AES.encrypt(data, getSecret()).toString();
    return `${ENCRYPTION_PREFIX}${encrypted}`;
  },

  /**
   * Decrypt AES encrypted data
   */
  decrypt(encryptedData: string): string | null {
    try {
      if (!encryptedData.startsWith(ENCRYPTION_PREFIX)) {
        return null;
      }
      const data = encryptedData.replace(ENCRYPTION_PREFIX, '');
      const bytes = CryptoJS.AES.decrypt(data, getSecret());
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      return decrypted || null;
    } catch {
      return null;
    }
  },

  /**
   * Save tokens to localStorage with encryption
   */
  saveTokens(tokens: AuthTokens): void {
    try {
      const encrypted = this.encrypt(JSON.stringify(tokens));
      localStorage.setItem(STORAGE_KEY, encrypted);
    } catch (error) {
      console.error('Failed to save tokens:', error);
    }
  },

  /**
   * Get tokens from localStorage and decrypt
   */
  getTokens(): AuthTokens | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return null;

      const decrypted = this.decrypt(stored);
      if (!decrypted) return null;

      return JSON.parse(decrypted) as AuthTokens;
    } catch {
      return null;
    }
  },

  /**
   * Clear all auth tokens from storage
   */
  clearTokens(): void {
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.clear();
  },

  /**
   * Check if token is expired
   */
  isTokenExpired(tokens: AuthTokens): boolean {
    return Date.now() >= tokens.expiresAt;
  },

  /**
   * Check if token should be refreshed (30 min before expiry)
   */
  shouldRefresh(tokens: AuthTokens): boolean {
    const REFRESH_BUFFER = 30 * 60 * 1000; // 30 minutes
    return Date.now() >= tokens.expiresAt - REFRESH_BUFFER;
  },

  /**
   * Get remaining time until token expires (in ms)
   */
  getTimeUntilExpiry(tokens: AuthTokens): number {
    return Math.max(0, tokens.expiresAt - Date.now());
  },

  /**
   * Check if stored data contains raw JWT (security check)
   */
  isEncrypted(data: string): boolean {
    return data.startsWith(ENCRYPTION_PREFIX) && !data.includes('eyJ');
  },
};
