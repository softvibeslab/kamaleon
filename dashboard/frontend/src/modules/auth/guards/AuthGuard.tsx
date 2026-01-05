// ════════════════════════════════════════════════════════════════
//                    SPEC-DASH-F001: Auth Guard
//                    Agent: @dashboard-fe-lead
// ════════════════════════════════════════════════════════════════

import { ReactNode, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';

interface AuthGuardProps {
  children: ReactNode;
}

/**
 * AuthGuard - Protects routes that require authentication
 *
 * Usage:
 * <AuthGuard>
 *   <ProtectedComponent />
 * </AuthGuard>
 */
export const AuthGuard = ({ children }: AuthGuardProps) => {
  const location = useLocation();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isLoading) {
    return <LoadingSpinner fullScreen data-testid="auth-loading" />;
  }

  if (!isAuthenticated) {
    // Redirect to login, preserving the intended destination
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
