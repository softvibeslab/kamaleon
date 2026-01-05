// ════════════════════════════════════════════════════════════════
//                    SPEC-DASH-F001: RoleGuard Tests
//                    Agent: @dashboard-fe-lead
// ════════════════════════════════════════════════════════════════

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RoleGuard } from '../../modules/auth/guards/RoleGuard';
import { useAuthStore } from '../../modules/auth/store/auth.store';
import type { User } from '../../modules/auth/types/auth.types';

const createMockUser = (role: 'Admin' | 'Developer' | 'Viewer'): User => ({
  id: '1',
  email: 'user@kamaleon.com',
  name: 'Test User',
  role,
  tenantId: 'tenant-1',
  permissions:
    role === 'Admin'
      ? ['manifests:read', 'manifests:write', 'manifests:publish', 'tenants:read', 'tenants:write']
      : role === 'Developer'
      ? ['manifests:read', 'manifests:write', 'manifests:publish']
      : ['manifests:read'],
});

const TenantConfig = () => <div data-testid="tenant-config">Tenant Config</div>;
const EditForm = () => <div data-testid="edit-form">Edit Form</div>;
const ViewOnly = () => <div data-testid="view-only">View Only</div>;
const AdminPanel = () => <div data-testid="admin-panel">Admin Panel</div>;

describe('RoleGuard', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  });

  describe('Role-based access', () => {
    it('should show content for Admin role when Admin is allowed', () => {
      useAuthStore.setState({ user: createMockUser('Admin') });

      render(
        <RoleGuard allowedRoles={['Admin']}>
          <TenantConfig />
        </RoleGuard>
      );

      expect(screen.getByTestId('tenant-config')).toBeInTheDocument();
    });

    it('should hide tenant config for Developer role when only Admin allowed', () => {
      useAuthStore.setState({ user: createMockUser('Developer') });

      render(
        <RoleGuard allowedRoles={['Admin']}>
          <TenantConfig />
        </RoleGuard>
      );

      expect(screen.queryByTestId('tenant-config')).not.toBeInTheDocument();
    });

    it('should show content for Developer when Developer is in allowed roles', () => {
      useAuthStore.setState({ user: createMockUser('Developer') });

      render(
        <RoleGuard allowedRoles={['Admin', 'Developer']}>
          <EditForm />
        </RoleGuard>
      );

      expect(screen.getByTestId('edit-form')).toBeInTheDocument();
    });

    it('should show fallback for Viewer role when not in allowed roles', () => {
      useAuthStore.setState({ user: createMockUser('Viewer') });

      render(
        <RoleGuard allowedRoles={['Admin', 'Developer']} fallback={<ViewOnly />}>
          <EditForm />
        </RoleGuard>
      );

      expect(screen.queryByTestId('edit-form')).not.toBeInTheDocument();
      expect(screen.getByTestId('view-only')).toBeInTheDocument();
    });

    it('should return null fallback by default when access denied', () => {
      useAuthStore.setState({ user: createMockUser('Viewer') });

      const { container } = render(
        <RoleGuard allowedRoles={['Admin']}>
          <AdminPanel />
        </RoleGuard>
      );

      expect(screen.queryByTestId('admin-panel')).not.toBeInTheDocument();
      expect(container).toBeEmptyDOMElement();
    });
  });

  describe('Permission-based access', () => {
    it('should show content when user has required permission', () => {
      useAuthStore.setState({ user: createMockUser('Developer') });

      render(
        <RoleGuard requiredPermissions={['manifests:write']}>
          <EditForm />
        </RoleGuard>
      );

      expect(screen.getByTestId('edit-form')).toBeInTheDocument();
    });

    it('should hide content when user lacks required permission', () => {
      useAuthStore.setState({ user: createMockUser('Viewer') });

      render(
        <RoleGuard requiredPermissions={['manifests:write']} fallback={<ViewOnly />}>
          <EditForm />
        </RoleGuard>
      );

      expect(screen.queryByTestId('edit-form')).not.toBeInTheDocument();
      expect(screen.getByTestId('view-only')).toBeInTheDocument();
    });

    it('should require all permissions when requireAll is true (default)', () => {
      useAuthStore.setState({ user: createMockUser('Developer') });

      render(
        <RoleGuard
          requiredPermissions={['manifests:write', 'tenants:write']}
          fallback={<ViewOnly />}
        >
          <AdminPanel />
        </RoleGuard>
      );

      // Developer has manifests:write but not tenants:write
      expect(screen.queryByTestId('admin-panel')).not.toBeInTheDocument();
      expect(screen.getByTestId('view-only')).toBeInTheDocument();
    });

    it('should require any permission when requireAll is false', () => {
      useAuthStore.setState({ user: createMockUser('Developer') });

      render(
        <RoleGuard
          requiredPermissions={['manifests:write', 'tenants:write']}
          requireAll={false}
        >
          <EditForm />
        </RoleGuard>
      );

      // Developer has manifests:write
      expect(screen.getByTestId('edit-form')).toBeInTheDocument();
    });
  });

  describe('Combined role and permission checks', () => {
    it('should check both role and permissions', () => {
      useAuthStore.setState({ user: createMockUser('Admin') });

      render(
        <RoleGuard
          allowedRoles={['Admin']}
          requiredPermissions={['tenants:write']}
        >
          <TenantConfig />
        </RoleGuard>
      );

      expect(screen.getByTestId('tenant-config')).toBeInTheDocument();
    });

    it('should deny access if role matches but permission fails', () => {
      useAuthStore.setState({ user: createMockUser('Developer') });

      render(
        <RoleGuard
          allowedRoles={['Developer']}
          requiredPermissions={['tenants:write']}
          fallback={<ViewOnly />}
        >
          <TenantConfig />
        </RoleGuard>
      );

      // Developer role matches but doesn't have tenants:write
      expect(screen.queryByTestId('tenant-config')).not.toBeInTheDocument();
      expect(screen.getByTestId('view-only')).toBeInTheDocument();
    });
  });

  describe('No user state', () => {
    it('should show fallback when user is null', () => {
      useAuthStore.setState({ user: null });

      render(
        <RoleGuard allowedRoles={['Admin']} fallback={<ViewOnly />}>
          <AdminPanel />
        </RoleGuard>
      );

      expect(screen.queryByTestId('admin-panel')).not.toBeInTheDocument();
      expect(screen.getByTestId('view-only')).toBeInTheDocument();
    });
  });
});
