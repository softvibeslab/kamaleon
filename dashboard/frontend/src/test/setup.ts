// ════════════════════════════════════════════════════════════════
//                    Test Setup Configuration
//                    Agent: @dashboard-fe-lead
// ════════════════════════════════════════════════════════════════

import '@testing-library/jest-dom';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Cleanup after each test
afterEach(() => {
  cleanup();
  localStorage.clear();
  sessionStorage.clear();
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

// Mock import.meta.env
Object.defineProperty(import.meta, 'env', {
  value: {
    VITE_API_URL: 'http://localhost:3001/api',
    VITE_ENCRYPTION_KEY: 'test-encryption-key-32-chars-long',
    MODE: 'test',
    DEV: false,
    PROD: false,
  },
});
