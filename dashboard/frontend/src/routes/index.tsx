// ════════════════════════════════════════════════════════════════
//                    SPEC-DASH-F001: Routes Configuration
//                    Agent: @dashboard-fe-lead
// ════════════════════════════════════════════════════════════════

import { createBrowserRouter } from 'react-router-dom';
import {
  AuthGuard,
  GuestGuard,
  RoleGuard,
  LoginPage,
  UnauthorizedPage,
} from '../modules/auth';

// Lazy load dashboard pages (these will be implemented later)
// import { DashboardLayout } from '../layouts/DashboardLayout';
// import { DashboardHome } from '../pages/DashboardHome';
// import { FeatureBuilder } from '../pages/FeatureBuilder';
// import { TenantsPage } from '../pages/TenantsPage';

// Placeholder components until full dashboard is implemented
const DashboardLayout = ({ children }: { children?: React.ReactNode }) => (
  <div data-testid="dashboard-layout">
    <nav>Dashboard Navigation</nav>
    <main>{children}</main>
  </div>
);

const DashboardHome = () => (
  <div data-testid="dashboard-home">Dashboard Home</div>
);

const FeatureBuilder = () => (
  <div data-testid="feature-builder">Feature Builder</div>
);

const TenantsPage = () => (
  <div data-testid="tenants-page">Tenants Management</div>
);

const UsersPage = () => (
  <div data-testid="users-page">Users Management</div>
);

const ReportsPage = () => (
  <div data-testid="reports-page">Reports</div>
);

export const router = createBrowserRouter([
  // Public routes (Guest only)
  {
    path: '/login',
    element: (
      <GuestGuard>
        <LoginPage />
      </GuestGuard>
    ),
  },

  // Protected routes
  {
    path: '/',
    element: (
      <AuthGuard>
        <DashboardLayout />
      </AuthGuard>
    ),
    children: [
      {
        index: true,
        element: <DashboardHome />,
      },
      {
        path: 'dashboard',
        element: <DashboardHome />,
      },
      {
        path: 'feature-builder',
        element: (
          <RoleGuard
            allowedRoles={['Admin', 'Developer']}
            fallback={<UnauthorizedPage />}
          >
            <FeatureBuilder />
          </RoleGuard>
        ),
      },
      {
        path: 'tenants',
        element: (
          <RoleGuard
            allowedRoles={['Admin']}
            fallback={<UnauthorizedPage />}
          >
            <TenantsPage />
          </RoleGuard>
        ),
      },
      {
        path: 'users',
        element: (
          <RoleGuard
            allowedRoles={['Admin']}
            requiredPermissions={['users:read']}
            fallback={<UnauthorizedPage />}
          >
            <UsersPage />
          </RoleGuard>
        ),
      },
      {
        path: 'reports',
        element: (
          <RoleGuard
            requiredPermissions={['reports:read']}
            fallback={<UnauthorizedPage />}
          >
            <ReportsPage />
          </RoleGuard>
        ),
      },
      {
        path: 'unauthorized',
        element: <UnauthorizedPage />,
      },
    ],
  },

  // Catch-all redirect to dashboard
  {
    path: '*',
    element: (
      <AuthGuard>
        <DashboardHome />
      </AuthGuard>
    ),
  },
]);
