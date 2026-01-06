// ════════════════════════════════════════════════════════════════
//                    Kamaleon Shared Types
//                    MVP Ecosistema
// ════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────
// Auth Types
// ─────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  tenantId: string;
  permissions: Permission[];
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
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

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
}

// ─────────────────────────────────────────────────────────────────
// Tenant Types
// ─────────────────────────────────────────────────────────────────

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  status: TenantStatus;
  plan: TenantPlan;
  maxDevices: number;
  maxUsers: number;
  createdAt: string;
  updatedAt: string;
}

export type TenantStatus = 'active' | 'trial' | 'suspended' | 'archived';
export type TenantPlan = 'free' | 'starter' | 'professional' | 'enterprise';

// ─────────────────────────────────────────────────────────────────
// Manifest Types (SDUI)
// ─────────────────────────────────────────────────────────────────

export interface Manifest {
  id: string;
  tenantId: string;
  name: string;
  version: string;
  status: ManifestStatus;
  screens: Screen[];
  metadata: ManifestMetadata;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export type ManifestStatus = 'draft' | 'published' | 'archived';

export interface ManifestMetadata {
  author: string;
  description?: string;
  tags?: string[];
}

export interface Screen {
  id: string;
  name: string;
  route: string;
  components: Component[];
  actions?: ScreenAction[];
}

export interface Component {
  id: string;
  type: ComponentType;
  props: Record<string, unknown>;
  style?: Record<string, unknown>;
  children?: Component[];
  dataSource?: DataSource;
  visibilityRule?: string;
}

export type ComponentType =
  | 'container'
  | 'scroll'
  | 'text'
  | 'input'
  | 'button'
  | 'image'
  | 'list'
  | 'card'
  | 'dropdown'
  | 'checkbox'
  | 'datepicker'
  | 'form';

export interface DataSource {
  type: 'local' | 'remote';
  query?: string;
  endpoint?: string;
  params?: Record<string, string>;
}

export interface ScreenAction {
  id: string;
  trigger: 'onLoad' | 'onSubmit' | 'onRefresh';
  type: 'navigate' | 'api' | 'sync' | 'print';
  config: Record<string, unknown>;
}

// ─────────────────────────────────────────────────────────────────
// Sync Types
// ─────────────────────────────────────────────────────────────────

export interface SyncPayload {
  deviceId: string;
  tenantId: string;
  lastSyncAt: string;
  pendingChanges: PendingChange[];
}

export interface PendingChange {
  id: string;
  table: string;
  operation: 'INSERT' | 'UPDATE' | 'DELETE';
  data: Record<string, unknown>;
  timestamp: string;
}

export interface SyncResponse {
  success: boolean;
  processedChanges: string[];
  serverChanges: ServerChange[];
  manifests?: Manifest[];
  newSyncTimestamp: string;
}

export interface ServerChange {
  id: string;
  table: string;
  operation: 'INSERT' | 'UPDATE' | 'DELETE';
  data: Record<string, unknown>;
  timestamp: string;
}

// ─────────────────────────────────────────────────────────────────
// API Response Types
// ─────────────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: PaginationMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ─────────────────────────────────────────────────────────────────
// Device Types
// ─────────────────────────────────────────────────────────────────

export interface Device {
  id: string;
  tenantId: string;
  userId: string;
  name: string;
  platform: 'android' | 'ios';
  appVersion: string;
  lastSyncAt: string;
  status: 'active' | 'inactive';
  createdAt: string;
}
