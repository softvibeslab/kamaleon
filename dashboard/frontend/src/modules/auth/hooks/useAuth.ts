// ════════════════════════════════════════════════════════════════
//                    SPEC-DASH-F001: useAuth Hook
//                    Agent: @dashboard-fe-lead
// ════════════════════════════════════════════════════════════════

import { useAuthStore } from '../store/auth.store';
import { useShallow } from 'zustand/react/shallow';

/**
 * Custom hook for authentication state and actions
 *
 * Usage:
 * const { user, isAuthenticated, login, logout } = useAuth();
 */
export const useAuth = () => {
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    checkAuth,
  } = useAuthStore(
    useShallow((state) => ({
      user: state.user,
      isAuthenticated: state.isAuthenticated,
      isLoading: state.isLoading,
      error: state.error,
      login: state.login,
      logout: state.logout,
      checkAuth: state.checkAuth,
    }))
  );

  return {
    // State
    user,
    isAuthenticated,
    isLoading,
    error,

    // Actions
    login,
    logout,
    checkAuth,

    // Role helpers
    isAdmin: user?.role === 'Admin',
    isDeveloper: user?.role === 'Developer',
    isViewer: user?.role === 'Viewer',

    // User info helpers
    userName: user?.name ?? '',
    userEmail: user?.email ?? '',
    userRole: user?.role ?? null,
    tenantId: user?.tenantId ?? null,
  };
};
