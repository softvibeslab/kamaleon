// ════════════════════════════════════════════════════════════════
//                    SPEC-DASH-F001: Auth Module Index
//                    Agent: @dashboard-fe-lead
// ════════════════════════════════════════════════════════════════

// Types
export type {
  User,
  UserRole,
  Permission,
  LoginCredentials,
  AuthTokens,
  AuthState,
  LoginResponse,
} from './types/auth.types';
export { ROLE_PERMISSIONS } from './types/auth.types';

// Store
export { useAuthStore } from './store/auth.store';

// Services
export { authService } from './services/auth.service';
export { tokenService } from './services/token.service';

// Guards
export { AuthGuard, GuestGuard, RoleGuard } from './guards';

// Hooks
export { useAuth, usePermissions, useSession } from './hooks';

// Components
export { LogoutButton, RoleIndicator, SessionExpiredModal } from './components';

// Pages
export { LoginPage } from './pages/LoginPage';
export { UnauthorizedPage } from './pages/UnauthorizedPage';
