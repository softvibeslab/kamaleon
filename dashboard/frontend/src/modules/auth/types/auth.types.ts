// ════════════════════════════════════════════════════════════════
//                    SPEC-DASH-F001: Auth Types
//                    Agent: @dashboard-fe-lead
// ════════════════════════════════════════════════════════════════

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  tenantId: string;
  permissions: Permission[];
  avatarUrl?: string;
  lastLoginAt?: string;
}

export type UserRole = 'Admin' | 'Developer' | 'Viewer';

export type Permission =
  | 'manifests:read'
  | 'manifests:write'
  | 'manifests:publish'
  | 'tenants:read'
  | 'tenants:write'
  | 'users:read'
  | 'users:write'
  | 'reports:read'
  | 'reports:export';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // timestamp in milliseconds
}

export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

// Role permissions mapping
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  Admin: [
    'manifests:read',
    'manifests:write',
    'manifests:publish',
    'tenants:read',
    'tenants:write',
    'users:read',
    'users:write',
    'reports:read',
    'reports:export',
  ],
  Developer: [
    'manifests:read',
    'manifests:write',
    'manifests:publish',
    'reports:read',
  ],
  Viewer: [
    'manifests:read',
    'reports:read',
  ],
};
