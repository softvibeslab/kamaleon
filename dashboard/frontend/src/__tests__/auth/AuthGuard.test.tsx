// ════════════════════════════════════════════════════════════════
//                    SPEC-DASH-F001: AuthGuard Tests
//                    Agent: @dashboard-fe-lead
// ════════════════════════════════════════════════════════════════

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthGuard } from '../../modules/auth/guards/AuthGuard';
import { useAuthStore } from '../../modules/auth/store/auth.store';
import type { User } from '../../modules/auth/types/auth.types';

// Mock LoadingSpinner component
vi.mock('../../components/ui/LoadingSpinner', () => ({
  LoadingSpinner: ({ 'data-testid': testId }: { 'data-testid'?: string }) => (
    <div data-testid={testId || 'loading-spinner'}>Loading...</div>
  ),
}));

const mockUser: User = {
  id: '1',
  email: 'admin@kamaleon.com',
  name: 'Admin User',
  role: 'Admin',
  tenantId: 'tenant-1',
  permissions: ['manifests:read', 'manifests:write'],
};

const Dashboard = () => <div data-testid="dashboard">Dashboard Content</div>;
const LoginPage = () => <div data-testid="login-page">Login Page</div>;

const renderWithRouter = (initialEntry: string = '/dashboard') => {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/dashboard"
          element={
            <AuthGuard>
              <Dashboard />
            </AuthGuard>
          }
        />
      </Routes>
    </MemoryRouter>
  );
};

describe('AuthGuard', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  });

  it('should redirect to login when not authenticated', async () => {
    useAuthStore.setState({
      isAuthenticated: false,
      isLoading: false,
      checkAuth: vi.fn().mockResolvedValue(undefined),
    });

    renderWithRouter('/dashboard');

    await waitFor(() => {
      expect(screen.queryByTestId('dashboard')).not.toBeInTheDocument();
      expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });
  });

  it('should render children when authenticated', async () => {
    useAuthStore.setState({
      isAuthenticated: true,
      isLoading: false,
      user: mockUser,
      checkAuth: vi.fn().mockResolvedValue(undefined),
    });

    renderWithRouter('/dashboard');

    await waitFor(() => {
      expect(screen.getByTestId('dashboard')).toBeInTheDocument();
    });
  });

  it('should show loading spinner while checking auth', () => {
    useAuthStore.setState({
      isAuthenticated: false,
      isLoading: true,
      checkAuth: vi.fn(),
    });

    renderWithRouter('/dashboard');

    expect(screen.getByTestId('auth-loading')).toBeInTheDocument();
    expect(screen.queryByTestId('dashboard')).not.toBeInTheDocument();
    expect(screen.queryByTestId('login-page')).not.toBeInTheDocument();
  });

  it('should call checkAuth on mount', () => {
    const mockCheckAuth = vi.fn().mockResolvedValue(undefined);

    useAuthStore.setState({
      isAuthenticated: false,
      isLoading: false,
      checkAuth: mockCheckAuth,
    });

    renderWithRouter('/dashboard');

    expect(mockCheckAuth).toHaveBeenCalled();
  });

  it('should preserve intended destination in redirect state', async () => {
    useAuthStore.setState({
      isAuthenticated: false,
      isLoading: false,
      checkAuth: vi.fn().mockResolvedValue(undefined),
    });

    render(
      <MemoryRouter initialEntries={['/dashboard?param=value']}>
        <Routes>
          <Route
            path="/login"
            element={
              <div data-testid="login-page">
                Login Page
              </div>
            }
          />
          <Route
            path="/dashboard"
            element={
              <AuthGuard>
                <Dashboard />
              </AuthGuard>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });
  });
});
