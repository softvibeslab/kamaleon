// ════════════════════════════════════════════════════════════════
//                    SPEC-DASH-F001: Role Guard
//                    Agent: @dashboard-fe-lead
// ════════════════════════════════════════════════════════════════

import { ReactNode } from 'react';
import { useAuthStore } from '../store/auth.store';
import type { UserRole, Permission } from '../types/auth.types';

interface RoleGuardProps {
  children: ReactNode;
  /** Roles that can access the content */
  allowedRoles?: UserRole[];
  /** Permissions required to access the content */
  requiredPermissions?: Permission[];
  /** Whether all permissions are required (AND) or any (OR) */
  requireAll?: boolean;
  /** Content to show when access is denied */
  fallback?: ReactNode;
}

/**
 * RoleGuard - Conditionally renders content based on user role/permissions
 *
 * Usage:
 * <RoleGuard allowedRoles={['Admin', 'Developer']}>
 *   <FeatureBuilder />
 * </RoleGuard>
 *
 * <RoleGuard requiredPermissions={['manifests:write']} fallback={<ViewOnly />}>
 *   <EditForm />
 * </RoleGuard>
 */
export const RoleGuard = ({
  children,
  allowedRoles,
  requiredPermissions,
  requireAll = true,
  fallback = null,
}: RoleGuardProps) => {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return <>{fallback}</>;
  }

  // Check role if specified
  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(user.role)) {
      return <>{fallback}</>;
    }
  }

  // Check permissions if specified
  if (requiredPermissions && requiredPermissions.length > 0) {
    const hasPermission = requireAll
      ? requiredPermissions.every((p) => user.permissions.includes(p))
      : requiredPermissions.some((p) => user.permissions.includes(p));

    if (!hasPermission) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
};
