// ════════════════════════════════════════════════════════════════
//                    SPEC-DASH-F001: usePermissions Hook
//                    Agent: @dashboard-fe-lead
// ════════════════════════════════════════════════════════════════

import { useCallback, useMemo } from 'react';
import { useAuthStore } from '../store/auth.store';
import type { Permission, UserRole } from '../types/auth.types';

/**
 * Custom hook for checking user permissions
 *
 * Usage:
 * const { hasPermission, canWrite, canPublish } = usePermissions();
 *
 * if (hasPermission('manifests:write')) {
 *   // Show edit button
 * }
 */
export const usePermissions = () => {
  const user = useAuthStore((state) => state.user);
  const permissions = useMemo(() => user?.permissions ?? [], [user]);

  /**
   * Check if user has a specific permission
   */
  const hasPermission = useCallback(
    (permission: Permission): boolean => {
      return permissions.includes(permission);
    },
    [permissions]
  );

  /**
   * Check if user has any of the specified permissions
   */
  const hasAnyPermission = useCallback(
    (perms: Permission[]): boolean => {
      return perms.some((p) => permissions.includes(p));
    },
    [permissions]
  );

  /**
   * Check if user has all of the specified permissions
   */
  const hasAllPermissions = useCallback(
    (perms: Permission[]): boolean => {
      return perms.every((p) => permissions.includes(p));
    },
    [permissions]
  );

  /**
   * Check if user has a specific role
   */
  const hasRole = useCallback(
    (role: UserRole): boolean => {
      return user?.role === role;
    },
    [user]
  );

  /**
   * Check if user has any of the specified roles
   */
  const hasAnyRole = useCallback(
    (roles: UserRole[]): boolean => {
      return user ? roles.includes(user.role) : false;
    },
    [user]
  );

  return {
    // Raw permissions
    permissions,

    // Permission checks
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,

    // Role checks
    hasRole,
    hasAnyRole,

    // Common permission shortcuts
    canReadManifests: hasPermission('manifests:read'),
    canWriteManifests: hasPermission('manifests:write'),
    canPublishManifests: hasPermission('manifests:publish'),
    canReadTenants: hasPermission('tenants:read'),
    canWriteTenants: hasPermission('tenants:write'),
    canReadUsers: hasPermission('users:read'),
    canWriteUsers: hasPermission('users:write'),
    canReadReports: hasPermission('reports:read'),
    canExportReports: hasPermission('reports:export'),
  };
};
