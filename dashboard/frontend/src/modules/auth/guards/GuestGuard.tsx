// ════════════════════════════════════════════════════════════════
//                    SPEC-DASH-F001: Guest Guard
//                    Agent: @dashboard-fe-lead
// ════════════════════════════════════════════════════════════════

import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';

interface GuestGuardProps {
  children: ReactNode;
}

/**
 * GuestGuard - Protects routes that should only be accessible to unauthenticated users
 * (e.g., login page, registration page)
 *
 * Usage:
 * <GuestGuard>
 *   <LoginPage />
 * </GuestGuard>
 */
export const GuestGuard = ({ children }: GuestGuardProps) => {
  const location = useLocation();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (isAuthenticated) {
    // Redirect to the page they came from, or dashboard
    const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
};
