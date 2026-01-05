# SPEC-DASH-F001: Sistema de Autenticacion y Autorizacion

## Plan de Implementacion MoAI-ADK

**Fecha:** 2025-01-04
**Agente:** @dashboard-fe-lead
**Prioridad:** Alta
**Complejidad:** Media-Alta

---

## 1. Resumen Ejecutivo

Implementar un sistema completo de autenticacion y autorizacion para el Dashboard Kamaleon usando JWT con refresh tokens, gestion de roles (RBAC) y proteccion de rutas.

---

## 2. Arquitectura Propuesta

```
┌─────────────────────────────────────────────────────────────────┐
│                    DASHBOARD FRONTEND                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐        │
│  │  LoginPage   │   │  AuthGuard   │   │  RoleGuard   │        │
│  │  Component   │   │  (HOC/Hook)  │   │  (HOC/Hook)  │        │
│  └──────┬───────┘   └──────┬───────┘   └──────┬───────┘        │
│         │                  │                  │                 │
│         └──────────────────┼──────────────────┘                 │
│                            │                                    │
│                   ┌────────▼────────┐                          │
│                   │   AuthStore     │                          │
│                   │   (Zustand)     │                          │
│                   └────────┬────────┘                          │
│                            │                                    │
│         ┌──────────────────┼──────────────────┐                │
│         │                  │                  │                 │
│  ┌──────▼───────┐  ┌──────▼───────┐  ┌──────▼───────┐        │
│  │ TokenService │  │ AuthService  │  │ RoleService  │        │
│  │ (encrypt/    │  │ (login/      │  │ (permissions │        │
│  │  decrypt)    │  │  logout)     │  │  /roles)     │        │
│  └──────────────┘  └──────┬───────┘  └──────────────┘        │
│                           │                                    │
└───────────────────────────┼────────────────────────────────────┘
                            │
                   ┌────────▼────────┐
                   │   API Backend   │
                   │   /auth/*       │
                   └─────────────────┘
```

---

## 3. Estructura de Archivos

```
dashboard/frontend/src/
├── modules/
│   └── auth/
│       ├── components/
│       │   ├── LoginForm.tsx
│       │   ├── LogoutButton.tsx
│       │   ├── SessionExpiredModal.tsx
│       │   └── RoleIndicator.tsx
│       │
│       ├── guards/
│       │   ├── AuthGuard.tsx
│       │   ├── RoleGuard.tsx
│       │   └── GuestGuard.tsx
│       │
│       ├── hooks/
│       │   ├── useAuth.ts
│       │   ├── usePermissions.ts
│       │   └── useSession.ts
│       │
│       ├── services/
│       │   ├── auth.service.ts
│       │   ├── token.service.ts
│       │   └── role.service.ts
│       │
│       ├── store/
│       │   └── auth.store.ts
│       │
│       ├── types/
│       │   └── auth.types.ts
│       │
│       └── pages/
│           ├── LoginPage.tsx
│           └── UnauthorizedPage.tsx
│
├── __tests__/
│   └── auth/
│       ├── LoginForm.test.tsx
│       ├── AuthGuard.test.tsx
│       ├── auth.service.test.ts
│       └── auth.store.test.ts
```

---

## 4. Implementacion por Fases

### FASE 1: Core Authentication (RED)

**Objetivo:** Tests que definen el comportamiento esperado

#### 4.1.1 Types Definition
```typescript
// src/modules/auth/types/auth.types.ts

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  tenantId: string;
  permissions: Permission[];
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
  expiresAt: number; // timestamp
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
```

#### 4.1.2 Test: Auth Store
```typescript
// src/__tests__/auth/auth.store.test.ts

describe('AuthStore', () => {
  beforeEach(() => {
    useAuthStore.getState().reset();
    localStorage.clear();
  });

  describe('login', () => {
    it('should store user and tokens on successful login', async () => {
      const credentials = { email: 'admin@test.com', password: 'password' };

      await useAuthStore.getState().login(credentials);

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(true);
      expect(state.user).not.toBeNull();
      expect(state.user?.role).toBe('Admin');
      expect(state.tokens?.accessToken).toBeDefined();
    });

    it('should encrypt tokens before storing in localStorage', async () => {
      await useAuthStore.getState().login(validCredentials);

      const stored = localStorage.getItem('kamaleon_auth');
      expect(stored).not.toContain('eyJ'); // No raw JWT
      expect(stored).toMatch(/^encrypted:/); // Custom encrypted format
    });

    it('should block account after 5 failed attempts', async () => {
      const badCredentials = { email: 'admin@test.com', password: 'wrong' };

      for (let i = 0; i < 5; i++) {
        await useAuthStore.getState().login(badCredentials);
      }

      const result = await useAuthStore.getState().login(badCredentials);
      expect(result.error).toContain('Account locked');
    });
  });

  describe('logout', () => {
    it('should clear all auth data on logout', async () => {
      await useAuthStore.getState().login(validCredentials);
      await useAuthStore.getState().logout();

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
      expect(state.tokens).toBeNull();
      expect(localStorage.getItem('kamaleon_auth')).toBeNull();
    });
  });

  describe('token refresh', () => {
    it('should auto-refresh token before expiry', async () => {
      jest.useFakeTimers();
      await useAuthStore.getState().login(validCredentials);

      const initialToken = useAuthStore.getState().tokens?.accessToken;

      // Advance to 7.5 hours (before 8h expiry)
      jest.advanceTimersByTime(7.5 * 60 * 60 * 1000);

      const newToken = useAuthStore.getState().tokens?.accessToken;
      expect(newToken).not.toBe(initialToken);
    });
  });
});
```

#### 4.1.3 Test: Auth Guard
```typescript
// src/__tests__/auth/AuthGuard.test.tsx

describe('AuthGuard', () => {
  it('should redirect to login when not authenticated', () => {
    useAuthStore.setState({ isAuthenticated: false });

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <AuthGuard>
          <Dashboard />
        </AuthGuard>
      </MemoryRouter>
    );

    expect(screen.queryByTestId('dashboard')).not.toBeInTheDocument();
    // Should redirect to /login
  });

  it('should render children when authenticated', () => {
    useAuthStore.setState({
      isAuthenticated: true,
      user: mockAdminUser
    });

    render(
      <MemoryRouter>
        <AuthGuard>
          <Dashboard />
        </AuthGuard>
      </MemoryRouter>
    );

    expect(screen.getByTestId('dashboard')).toBeInTheDocument();
  });
});
```

#### 4.1.4 Test: Role Guard
```typescript
// src/__tests__/auth/RoleGuard.test.tsx

describe('RoleGuard', () => {
  it('should show content for Admin role', () => {
    useAuthStore.setState({ user: { ...mockUser, role: 'Admin' } });

    render(
      <RoleGuard allowedRoles={['Admin']}>
        <TenantConfig />
      </RoleGuard>
    );

    expect(screen.getByTestId('tenant-config')).toBeInTheDocument();
  });

  it('should hide tenant config for Developer role', () => {
    useAuthStore.setState({ user: { ...mockUser, role: 'Developer' } });

    render(
      <RoleGuard allowedRoles={['Admin']}>
        <TenantConfig />
      </RoleGuard>
    );

    expect(screen.queryByTestId('tenant-config')).not.toBeInTheDocument();
  });

  it('should disable write actions for Viewer role', () => {
    useAuthStore.setState({ user: { ...mockUser, role: 'Viewer' } });

    render(
      <RoleGuard allowedRoles={['Admin', 'Developer']} fallback={<ViewOnly />}>
        <EditForm />
      </RoleGuard>
    );

    expect(screen.queryByTestId('edit-form')).not.toBeInTheDocument();
    expect(screen.getByTestId('view-only')).toBeInTheDocument();
  });
});
```

---

### FASE 2: Implementation (GREEN)

#### 4.2.1 Token Service
```typescript
// src/modules/auth/services/token.service.ts

import CryptoJS from 'crypto-js';

const STORAGE_KEY = 'kamaleon_auth';
const SECRET = import.meta.env.VITE_ENCRYPTION_KEY;

export const tokenService = {
  encrypt(data: string): string {
    const encrypted = CryptoJS.AES.encrypt(data, SECRET).toString();
    return `encrypted:${encrypted}`;
  },

  decrypt(encryptedData: string): string | null {
    try {
      const data = encryptedData.replace('encrypted:', '');
      const bytes = CryptoJS.AES.decrypt(data, SECRET);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch {
      return null;
    }
  },

  saveTokens(tokens: AuthTokens): void {
    const encrypted = this.encrypt(JSON.stringify(tokens));
    localStorage.setItem(STORAGE_KEY, encrypted);
  },

  getTokens(): AuthTokens | null {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const decrypted = this.decrypt(stored);
    if (!decrypted) return null;

    try {
      return JSON.parse(decrypted);
    } catch {
      return null;
    }
  },

  clearTokens(): void {
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.clear();
  },

  isTokenExpired(tokens: AuthTokens): boolean {
    return Date.now() >= tokens.expiresAt;
  },

  shouldRefresh(tokens: AuthTokens): boolean {
    const buffer = 30 * 60 * 1000; // 30 minutes before expiry
    return Date.now() >= (tokens.expiresAt - buffer);
  }
};
```

#### 4.2.2 Auth Store (Zustand)
```typescript
// src/modules/auth/store/auth.store.ts

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { authService } from '../services/auth.service';
import { tokenService } from '../services/token.service';
import type { AuthState, LoginCredentials, User, AuthTokens } from '../types/auth.types';

interface AuthActions {
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  checkAuth: () => Promise<void>;
  reset: () => void;
}

const initialState: AuthState = {
  user: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      login: async (credentials) => {
        set({ isLoading: true, error: null });

        try {
          const response = await authService.login(credentials);

          tokenService.saveTokens(response.tokens);

          set({
            user: response.user,
            tokens: response.tokens,
            isAuthenticated: true,
            isLoading: false,
          });

          // Setup auto-refresh
          get().setupTokenRefresh();

          return { success: true };
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Login failed';
          set({
            isLoading: false,
            error: errorMessage,
            isAuthenticated: false
          });
          return { success: false, error: errorMessage };
        }
      },

      logout: async () => {
        try {
          await authService.logout();
        } finally {
          tokenService.clearTokens();
          set(initialState);
        }
      },

      refreshToken: async () => {
        const { tokens } = get();
        if (!tokens?.refreshToken) return false;

        try {
          const newTokens = await authService.refreshToken(tokens.refreshToken);
          tokenService.saveTokens(newTokens);
          set({ tokens: newTokens });
          return true;
        } catch {
          get().logout();
          return false;
        }
      },

      checkAuth: async () => {
        const tokens = tokenService.getTokens();

        if (!tokens) {
          set({ isAuthenticated: false });
          return;
        }

        if (tokenService.isTokenExpired(tokens)) {
          const refreshed = await get().refreshToken();
          if (!refreshed) return;
        }

        try {
          const user = await authService.getCurrentUser();
          set({ user, isAuthenticated: true, tokens });
        } catch {
          get().logout();
        }
      },

      reset: () => set(initialState),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => ({
        getItem: (name) => {
          const encrypted = localStorage.getItem(name);
          return encrypted ? tokenService.decrypt(encrypted) : null;
        },
        setItem: (name, value) => {
          localStorage.setItem(name, tokenService.encrypt(value));
        },
        removeItem: (name) => localStorage.removeItem(name),
      })),
      partialize: (state) => ({
        tokens: state.tokens,
        user: state.user
      }),
    }
  )
);
```

#### 4.2.3 Auth Guard Component
```typescript
// src/modules/auth/guards/AuthGuard.tsx

import { ReactNode, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface AuthGuardProps {
  children: ReactNode;
}

export const AuthGuard = ({ children }: AuthGuardProps) => {
  const location = useLocation();
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
```

#### 4.2.4 Role Guard Component
```typescript
// src/modules/auth/guards/RoleGuard.tsx

import { ReactNode } from 'react';
import { useAuthStore } from '../store/auth.store';
import type { UserRole, Permission } from '../types/auth.types';

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
  requiredPermissions?: Permission[];
  fallback?: ReactNode;
}

export const RoleGuard = ({
  children,
  allowedRoles,
  requiredPermissions,
  fallback = null
}: RoleGuardProps) => {
  const user = useAuthStore((state) => state.user);

  if (!user) return fallback;

  // Check role
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return fallback;
  }

  // Check permissions
  if (requiredPermissions) {
    const hasAllPermissions = requiredPermissions.every(
      (permission) => user.permissions.includes(permission)
    );
    if (!hasAllPermissions) return fallback;
  }

  return <>{children}</>;
};
```

#### 4.2.5 Login Page
```typescript
// src/modules/auth/pages/LoginPage.tsx

import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '../store/auth.store';
import {
  TextField,
  Button,
  Alert,
  Card,
  Typography
} from '@mui/material';

const loginSchema = z.object({
  email: z.string().email('Email invalido'),
  password: z.string().min(8, 'Minimo 8 caracteres'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, error } = useAuthStore();
  const [attempts, setAttempts] = useState(0);

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    if (attempts >= 5) {
      return; // Locked
    }

    const result = await login(data);

    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setAttempts((prev) => prev + 1);
    }
  };

  const isLocked = attempts >= 5;

  return (
    <div className="login-page" data-testid="login-page">
      <Card className="login-card">
        <Typography variant="h4" component="h1">
          Kamaleon Dashboard
        </Typography>

        {error && (
          <Alert severity="error" data-testid="login-error">
            {error}
          </Alert>
        )}

        {isLocked && (
          <Alert severity="warning">
            Cuenta bloqueada por 15 minutos debido a multiples intentos fallidos.
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} data-testid="login-form">
          <TextField
            {...register('email')}
            label="Email"
            type="email"
            fullWidth
            error={!!errors.email}
            helperText={errors.email?.message}
            disabled={isLocked || isLoading}
            data-testid="email-input"
          />

          <TextField
            {...register('password')}
            label="Password"
            type="password"
            fullWidth
            error={!!errors.password}
            helperText={errors.password?.message}
            disabled={isLocked || isLoading}
            data-testid="password-input"
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={isLocked || isLoading}
            data-testid="login-button"
          >
            {isLoading ? 'Iniciando sesion...' : 'Iniciar Sesion'}
          </Button>
        </form>
      </Card>
    </div>
  );
};
```

---

### FASE 3: Optimization (REFACTOR)

#### 4.3.1 Custom Hooks
```typescript
// src/modules/auth/hooks/useAuth.ts

import { useCallback } from 'react';
import { useAuthStore } from '../store/auth.store';
import { useShallow } from 'zustand/react/shallow';

export const useAuth = () => {
  const { user, isAuthenticated, isLoading, error, login, logout } = useAuthStore(
    useShallow((state) => ({
      user: state.user,
      isAuthenticated: state.isAuthenticated,
      isLoading: state.isLoading,
      error: state.error,
      login: state.login,
      logout: state.logout,
    }))
  );

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    isAdmin: user?.role === 'Admin',
    isDeveloper: user?.role === 'Developer',
    isViewer: user?.role === 'Viewer',
  };
};

// src/modules/auth/hooks/usePermissions.ts

export const usePermissions = () => {
  const user = useAuthStore((state) => state.user);

  const hasPermission = useCallback(
    (permission: Permission) => {
      if (!user) return false;
      return user.permissions.includes(permission);
    },
    [user]
  );

  const hasAnyPermission = useCallback(
    (permissions: Permission[]) => {
      if (!user) return false;
      return permissions.some((p) => user.permissions.includes(p));
    },
    [user]
  );

  const hasAllPermissions = useCallback(
    (permissions: Permission[]) => {
      if (!user) return false;
      return permissions.every((p) => user.permissions.includes(p));
    },
    [user]
  );

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    permissions: user?.permissions || [],
  };
};
```

#### 4.3.2 Axios Interceptor
```typescript
// src/lib/axios/auth.interceptor.ts

import axios from 'axios';
import { useAuthStore } from '@/modules/auth/store/auth.store';
import { tokenService } from '@/modules/auth/services/token.service';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Request interceptor - add token
api.interceptors.request.use(
  (config) => {
    const tokens = tokenService.getTokens();
    if (tokens?.accessToken) {
      config.headers.Authorization = `Bearer ${tokens.accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshed = await useAuthStore.getState().refreshToken();

      if (refreshed) {
        const tokens = tokenService.getTokens();
        originalRequest.headers.Authorization = `Bearer ${tokens?.accessToken}`;
        return api(originalRequest);
      } else {
        // Token refresh failed, logout
        useAuthStore.getState().logout();
        window.location.href = '/login?session=expired';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
```

---

## 5. Routing Configuration

```typescript
// src/routes/index.tsx

import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthGuard } from '@/modules/auth/guards/AuthGuard';
import { GuestGuard } from '@/modules/auth/guards/GuestGuard';
import { RoleGuard } from '@/modules/auth/guards/RoleGuard';

const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <GuestGuard>
        <LoginPage />
      </GuestGuard>
    ),
  },
  {
    path: '/',
    element: (
      <AuthGuard>
        <DashboardLayout />
      </AuthGuard>
    ),
    children: [
      {
        path: 'dashboard',
        element: <DashboardHome />,
      },
      {
        path: 'feature-builder',
        element: (
          <RoleGuard allowedRoles={['Admin', 'Developer']}>
            <FeatureBuilder />
          </RoleGuard>
        ),
      },
      {
        path: 'tenants',
        element: (
          <RoleGuard allowedRoles={['Admin']}>
            <TenantsPage />
          </RoleGuard>
        ),
      },
      {
        path: 'unauthorized',
        element: <UnauthorizedPage />,
      },
    ],
  },
]);
```

---

## 6. Checklist de Implementacion

### Fase 1: Setup (RED)
- [ ] Crear estructura de carpetas
- [ ] Definir tipos TypeScript
- [ ] Escribir tests unitarios para AuthStore
- [ ] Escribir tests para AuthGuard
- [ ] Escribir tests para RoleGuard
- [ ] Escribir tests para LoginPage

### Fase 2: Implementation (GREEN)
- [ ] Implementar TokenService (encrypt/decrypt)
- [ ] Implementar AuthStore con Zustand
- [ ] Implementar AuthService (API calls)
- [ ] Implementar AuthGuard component
- [ ] Implementar RoleGuard component
- [ ] Implementar LoginPage component
- [ ] Configurar Axios interceptors

### Fase 3: Optimization (REFACTOR)
- [ ] Crear custom hooks (useAuth, usePermissions)
- [ ] Optimizar re-renders con useShallow
- [ ] Implementar auto-refresh de tokens
- [ ] Agregar SessionExpiredModal
- [ ] Configurar routing con guards

### Fase 4: Testing & QA
- [ ] Ejecutar todos los tests
- [ ] Verificar coverage > 80%
- [ ] Test manual de flujos criticos
- [ ] Verificar no hay tokens en logs
- [ ] Test de bloqueo por intentos fallidos

---

## 7. Dependencias Requeridas

```json
{
  "dependencies": {
    "zustand": "^4.5.0",
    "axios": "^1.6.0",
    "react-router-dom": "^6.20.0",
    "react-hook-form": "^7.49.0",
    "@hookform/resolvers": "^3.3.0",
    "zod": "^3.22.0",
    "crypto-js": "^4.2.0",
    "@mui/material": "^5.15.0"
  },
  "devDependencies": {
    "@types/crypto-js": "^4.2.0",
    "@testing-library/react": "^14.1.0",
    "@testing-library/jest-dom": "^6.1.0",
    "msw": "^2.0.0"
  }
}
```

---

## 8. Variables de Entorno

```env
# .env
VITE_API_URL=http://localhost:3001/api
VITE_ENCRYPTION_KEY=your-32-character-secret-key-here
```

---

## 9. Comandos de Ejecucion

```bash
# Ejecutar tests
npm run test -- --coverage --watch

# Ejecutar implementacion con agente
/moai:2-run SPEC-DASH-F001 --agent @dashboard-fe-lead

# Verificar calidad
/moai:3-sync --spec SPEC-DASH-F001
```

---

## 10. Criterios de Aceptacion

| Criterio | Target | Verificacion |
|----------|--------|--------------|
| Login time | < 2 seg | Performance test |
| Token exposure | 0 | Console/network inspection |
| Route protection | 100% | Manual + E2E test |
| Logout cleanup | Complete | LocalStorage check |
| Test coverage | > 80% | Jest coverage report |

---

## Referencias

- [SPEC-DASH-F001](../../../planing/01-SPEC-EARS-Ecosistema-Kamaleon.md#spec-dash-f001)
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
- [React Router Auth Guide](https://reactrouter.com/en/main/start/overview)
