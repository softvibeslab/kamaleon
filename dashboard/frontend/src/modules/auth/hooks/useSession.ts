// ════════════════════════════════════════════════════════════════
//                    SPEC-DASH-F001: useSession Hook
//                    Agent: @dashboard-fe-lead
// ════════════════════════════════════════════════════════════════

import { useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '../store/auth.store';
import { tokenService } from '../services/token.service';

interface SessionState {
  isSessionValid: boolean;
  timeUntilExpiry: number;
  shouldShowWarning: boolean;
}

const WARNING_THRESHOLD = 5 * 60 * 1000; // 5 minutes before expiry

/**
 * Custom hook for session management
 *
 * Usage:
 * const { isSessionValid, timeUntilExpiry, shouldShowWarning, extendSession } = useSession();
 */
export const useSession = () => {
  const tokens = useAuthStore((state) => state.tokens);
  const refreshToken = useAuthStore((state) => state.refreshToken);
  const logout = useAuthStore((state) => state.logout);

  const [sessionState, setSessionState] = useState<SessionState>({
    isSessionValid: false,
    timeUntilExpiry: 0,
    shouldShowWarning: false,
  });

  const updateSessionState = useCallback(() => {
    if (!tokens) {
      setSessionState({
        isSessionValid: false,
        timeUntilExpiry: 0,
        shouldShowWarning: false,
      });
      return;
    }

    const timeUntilExpiry = tokenService.getTimeUntilExpiry(tokens);
    const isExpired = tokenService.isTokenExpired(tokens);

    setSessionState({
      isSessionValid: !isExpired,
      timeUntilExpiry,
      shouldShowWarning: timeUntilExpiry > 0 && timeUntilExpiry <= WARNING_THRESHOLD,
    });
  }, [tokens]);

  // Update session state every minute
  useEffect(() => {
    updateSessionState();
    const interval = setInterval(updateSessionState, 60000);
    return () => clearInterval(interval);
  }, [updateSessionState]);

  /**
   * Extend the session by refreshing the token
   */
  const extendSession = useCallback(async () => {
    const success = await refreshToken();
    if (success) {
      updateSessionState();
    }
    return success;
  }, [refreshToken, updateSessionState]);

  /**
   * End the session (logout)
   */
  const endSession = useCallback(async () => {
    await logout();
  }, [logout]);

  /**
   * Format time until expiry for display
   */
  const formatTimeRemaining = useCallback((): string => {
    const minutes = Math.floor(sessionState.timeUntilExpiry / 60000);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  }, [sessionState.timeUntilExpiry]);

  return {
    ...sessionState,
    extendSession,
    endSession,
    formatTimeRemaining,
  };
};
