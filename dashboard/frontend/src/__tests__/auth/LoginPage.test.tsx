// ════════════════════════════════════════════════════════════════
//                    SPEC-DASH-F001: LoginPage Tests
//                    Agent: @dashboard-fe-lead
// ════════════════════════════════════════════════════════════════

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { LoginPage } from '../../modules/auth/pages/LoginPage';
import { useAuthStore } from '../../modules/auth/store/auth.store';

// Mock MUI icons to avoid import issues in tests
vi.mock('@mui/icons-material', () => ({
  Visibility: () => <span data-testid="visibility-icon">Visibility</span>,
  VisibilityOff: () => <span data-testid="visibility-off-icon">VisibilityOff</span>,
}));

const Dashboard = () => <div data-testid="dashboard">Dashboard</div>;

const renderLoginPage = () => {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </MemoryRouter>
  );
};

describe('LoginPage', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      login: vi.fn(),
    });
  });

  describe('Rendering', () => {
    it('should render login form', () => {
      renderLoginPage();

      expect(screen.getByTestId('login-page')).toBeInTheDocument();
      expect(screen.getByTestId('login-form')).toBeInTheDocument();
      expect(screen.getByTestId('email-input')).toBeInTheDocument();
      expect(screen.getByTestId('password-input')).toBeInTheDocument();
      expect(screen.getByTestId('login-button')).toBeInTheDocument();
    });

    it('should display Kamaleon branding', () => {
      renderLoginPage();

      expect(screen.getByText('Kamaleon')).toBeInTheDocument();
      expect(screen.getByText('Dashboard de Administracion')).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should show error for invalid email', async () => {
      const user = userEvent.setup();
      renderLoginPage();

      const emailInput = screen.getByTestId('email-input').querySelector('input')!;
      const submitButton = screen.getByTestId('login-button');

      await user.type(emailInput, 'invalid-email');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Email invalido')).toBeInTheDocument();
      });
    });

    it('should show error for short password', async () => {
      const user = userEvent.setup();
      renderLoginPage();

      const emailInput = screen.getByTestId('email-input').querySelector('input')!;
      const passwordInput = screen.getByTestId('password-input').querySelector('input')!;
      const submitButton = screen.getByTestId('login-button');

      await user.type(emailInput, 'valid@email.com');
      await user.type(passwordInput, 'short');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Minimo 8 caracteres')).toBeInTheDocument();
      });
    });

    it('should show error for empty email', async () => {
      const user = userEvent.setup();
      renderLoginPage();

      const submitButton = screen.getByTestId('login-button');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Email es requerido')).toBeInTheDocument();
      });
    });
  });

  describe('Login Flow', () => {
    it('should call login on valid form submission', async () => {
      const mockLogin = vi.fn().mockResolvedValue({ success: true });
      useAuthStore.setState({ login: mockLogin });

      const user = userEvent.setup();
      renderLoginPage();

      const emailInput = screen.getByTestId('email-input').querySelector('input')!;
      const passwordInput = screen.getByTestId('password-input').querySelector('input')!;
      const submitButton = screen.getByTestId('login-button');

      await user.type(emailInput, 'admin@kamaleon.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith({
          email: 'admin@kamaleon.com',
          password: 'password123',
        });
      });
    });

    it('should display error message on failed login', async () => {
      const mockLogin = vi.fn().mockResolvedValue({
        success: false,
        error: 'Invalid credentials',
      });
      useAuthStore.setState({
        login: mockLogin,
        error: 'Invalid credentials',
      });

      const user = userEvent.setup();
      renderLoginPage();

      const emailInput = screen.getByTestId('email-input').querySelector('input')!;
      const passwordInput = screen.getByTestId('password-input').querySelector('input')!;
      const submitButton = screen.getByTestId('login-button');

      await user.type(emailInput, 'admin@kamaleon.com');
      await user.type(passwordInput, 'wrongpassword');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByTestId('login-error')).toBeInTheDocument();
      });
    });

    it('should disable form during loading', () => {
      useAuthStore.setState({ isLoading: true });

      renderLoginPage();

      const emailInput = screen.getByTestId('email-input').querySelector('input')!;
      const passwordInput = screen.getByTestId('password-input').querySelector('input')!;
      const submitButton = screen.getByTestId('login-button');

      expect(emailInput).toBeDisabled();
      expect(passwordInput).toBeDisabled();
      expect(submitButton).toBeDisabled();
      expect(submitButton).toHaveTextContent('Iniciando sesion...');
    });
  });

  describe('Account Lockout', () => {
    it('should show remaining attempts after failed login', async () => {
      const mockLogin = vi.fn().mockResolvedValue({
        success: false,
        error: 'Invalid credentials',
      });
      useAuthStore.setState({ login: mockLogin });

      const user = userEvent.setup();
      renderLoginPage();

      const emailInput = screen.getByTestId('email-input').querySelector('input')!;
      const passwordInput = screen.getByTestId('password-input').querySelector('input')!;
      const submitButton = screen.getByTestId('login-button');

      await user.type(emailInput, 'admin@kamaleon.com');
      await user.type(passwordInput, 'wrongpassword');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Intentos restantes: 4/)).toBeInTheDocument();
      });
    });

    it('should lock account after 5 failed attempts', async () => {
      const mockLogin = vi.fn().mockResolvedValue({
        success: false,
        error: 'Invalid credentials',
      });
      useAuthStore.setState({ login: mockLogin });

      const user = userEvent.setup();
      renderLoginPage();

      const emailInput = screen.getByTestId('email-input').querySelector('input')!;
      const passwordInput = screen.getByTestId('password-input').querySelector('input')!;
      const submitButton = screen.getByTestId('login-button');

      // Simulate 5 failed attempts
      for (let i = 0; i < 5; i++) {
        await user.clear(emailInput);
        await user.clear(passwordInput);
        await user.type(emailInput, 'admin@kamaleon.com');
        await user.type(passwordInput, 'wrongpassword');
        await user.click(submitButton);
        await waitFor(() => {
          expect(mockLogin).toHaveBeenCalled();
        });
      }

      await waitFor(() => {
        expect(screen.getByTestId('account-locked')).toBeInTheDocument();
        expect(emailInput).toBeDisabled();
        expect(passwordInput).toBeDisabled();
        expect(submitButton).toBeDisabled();
      });
    });
  });

  describe('Password Visibility Toggle', () => {
    it('should toggle password visibility', async () => {
      const user = userEvent.setup();
      renderLoginPage();

      const passwordInput = screen.getByTestId('password-input').querySelector('input')!;

      // Initially password type
      expect(passwordInput).toHaveAttribute('type', 'password');

      // Find and click visibility toggle button
      const toggleButton = screen.getByRole('button', { name: /toggle password visibility/i });
      await user.click(toggleButton);

      // Should now show password
      expect(passwordInput).toHaveAttribute('type', 'text');

      // Toggle back
      await user.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'password');
    });
  });
});
