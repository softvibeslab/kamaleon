# MVP Ecosistema Kamaleon

## Plan de Implementacion MoAI-ADK

**Fecha:** 2025-01-05
**Prioridad:** Critica
**Objetivo:** Demostrar flujo completo end-to-end

---

## 1. Alcance del MVP

### Flujo Principal
```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  DASHBOARD  │────►│   GATEWAY   │────►│   BACKEND   │────►│  DATABASE   │
│  (React)    │     │  (Express)  │     │   (Node)    │     │ (PostgreSQL)│
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │  MOBILE APP │
                    │(React Native│
                    │  + SQLite)  │
                    └─────────────┘
```

### SPECs Incluidos en MVP

| Componente | SPEC | Funcionalidad MVP |
|------------|------|-------------------|
| Dashboard Frontend | SPEC-DASH-F001 | Login/Logout basico |
| Dashboard Backend | SPEC-DASH-B001 | REST API + Auth JWT |
| Gateway | SPEC-GW-001 | Routing + Rate Limiting |
| Mobile App | SPEC-APP-F001 | Renderizado SDUI basico |
| Mobile App | SPEC-APP-B001 | SQLite + Sync |
| Sync Engine | SPEC-SYNC-001 | Sincronizacion basica |

---

## 2. Arquitectura MVP

```
kamaleon/
├── dashboard/
│   ├── frontend/          # React + Vite (YA IMPLEMENTADO - Auth)
│   └── backend/           # Node.js + Express + Prisma
│
├── gateway/               # Node.js + Express (API Gateway)
│
├── mobile/
│   └── app/               # React Native + Expo
│
├── shared/
│   └── types/             # TypeScript types compartidos
│
├── docker-compose.yml     # Orquestacion desarrollo
└── .env.example           # Variables de entorno
```

---

## 3. Stack Tecnologico

### Backend (Todos los servicios)
- **Runtime:** Node.js 20 LTS
- **Framework:** Express.js + TypeScript
- **ORM:** Prisma
- **Auth:** JWT (jsonwebtoken)
- **Validation:** Zod
- **Database:** PostgreSQL 15

### Mobile App
- **Framework:** React Native + Expo
- **State:** Zustand
- **Database:** SQLite (expo-sqlite)
- **Navigation:** React Navigation

### Infraestructura Dev
- **Containers:** Docker + Docker Compose
- **Reverse Proxy:** Nginx (opcional)

---

## 4. Implementacion por Fase

### FASE 1: Backend Foundation (Dashboard + Gateway)

#### 4.1.1 Shared Types
```typescript
// shared/types/index.ts

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'Admin' | 'Developer' | 'Viewer';
  tenantId: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface Manifest {
  id: string;
  tenantId: string;
  name: string;
  version: string;
  screens: Screen[];
  createdAt: string;
  updatedAt: string;
}

export interface Screen {
  id: string;
  name: string;
  components: Component[];
}

export interface Component {
  id: string;
  type: string;
  props: Record<string, unknown>;
  children?: Component[];
}

export interface SyncPayload {
  deviceId: string;
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
```

#### 4.1.2 Dashboard Backend
```typescript
// dashboard/backend/src/index.ts

import express from 'express';
import cors from 'cors';
import { authRouter } from './routes/auth';
import { manifestRouter } from './routes/manifests';
import { userRouter } from './routes/users';
import { errorHandler } from './middleware/error';
import { authMiddleware } from './middleware/auth';

const app = express();

app.use(cors());
app.use(express.json());

// Public routes
app.use('/api/auth', authRouter);

// Protected routes
app.use('/api/manifests', authMiddleware, manifestRouter);
app.use('/api/users', authMiddleware, userRouter);

app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Dashboard Backend running on port ${PORT}`);
});
```

#### 4.1.3 Gateway API
```typescript
// gateway/src/index.ts

import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { authMiddleware } from './middleware/auth';
import { proxyMiddleware } from './middleware/proxy';
import { syncRouter } from './routes/sync';
import { manifestRouter } from './routes/manifests';

const app = express();

// Rate limiting por tenant
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 1000, // 1000 requests per minute
  keyGenerator: (req) => req.headers['x-tenant-id'] as string || 'anonymous',
});

app.use(cors());
app.use(express.json());
app.use(limiter);

// Auth validation for all routes
app.use(authMiddleware);

// Mobile-facing routes
app.use('/api/v1/sync', syncRouter);
app.use('/api/v1/manifests', manifestRouter);

// Proxy to internal services
app.use('/internal', proxyMiddleware);

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Gateway running on port ${PORT}`);
});
```

---

### FASE 2: Mobile App Foundation

#### 4.2.1 App Entry Point
```typescript
// mobile/app/App.tsx

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider } from './providers/AuthProvider';
import { SyncProvider } from './providers/SyncProvider';
import { LoginScreen } from './screens/LoginScreen';
import { HomeScreen } from './screens/HomeScreen';
import { DynamicScreen } from './screens/DynamicScreen';
import { useAuthStore } from './stores/auth.store';

const Stack = createNativeStackNavigator();

function AppNavigator() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return (
    <Stack.Navigator>
      {!isAuthenticated ? (
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : (
        <>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Dynamic" component={DynamicScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SyncProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </SyncProvider>
    </AuthProvider>
  );
}
```

#### 4.2.2 SDUI Renderer
```typescript
// mobile/app/components/SDUIRenderer.tsx

import React from 'react';
import { View, Text, TextInput, Button, ScrollView } from 'react-native';
import type { Component } from '@kamaleon/shared-types';

interface SDUIRendererProps {
  components: Component[];
  onAction?: (action: string, params: Record<string, unknown>) => void;
}

const componentRegistry: Record<string, React.ComponentType<any>> = {
  container: ({ children, style }) => <View style={style}>{children}</View>,
  text: ({ value, style }) => <Text style={style}>{value}</Text>,
  input: ({ placeholder, value, onChange, style }) => (
    <TextInput
      style={style}
      placeholder={placeholder}
      value={value}
      onChangeText={onChange}
    />
  ),
  button: ({ label, onPress, style }) => (
    <Button title={label} onPress={onPress} />
  ),
  scroll: ({ children, style }) => (
    <ScrollView style={style}>{children}</ScrollView>
  ),
};

export function SDUIRenderer({ components, onAction }: SDUIRendererProps) {
  const renderComponent = (component: Component): React.ReactNode => {
    const Component = componentRegistry[component.type];

    if (!Component) {
      console.warn(`Unknown component type: ${component.type}`);
      return (
        <View key={component.id} style={{ padding: 8, backgroundColor: '#ffcccc' }}>
          <Text>Unknown: {component.type}</Text>
        </View>
      );
    }

    const children = component.children?.map(renderComponent);

    return (
      <Component
        key={component.id}
        {...component.props}
        onAction={onAction}
      >
        {children}
      </Component>
    );
  };

  return <>{components.map(renderComponent)}</>;
}
```

#### 4.2.3 SQLite Database
```typescript
// mobile/app/database/index.ts

import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('kamaleon.db');

export const initDatabase = async () => {
  return new Promise<void>((resolve, reject) => {
    db.transaction((tx) => {
      // Manifests cache
      tx.executeSql(`
        CREATE TABLE IF NOT EXISTS manifests (
          id TEXT PRIMARY KEY,
          tenant_id TEXT,
          name TEXT,
          version TEXT,
          data TEXT,
          synced_at TEXT
        )
      `);

      // Pending sync queue
      tx.executeSql(`
        CREATE TABLE IF NOT EXISTS sync_queue (
          id TEXT PRIMARY KEY,
          table_name TEXT,
          operation TEXT,
          data TEXT,
          created_at TEXT,
          status TEXT DEFAULT 'pending'
        )
      `);

      // Local data storage
      tx.executeSql(`
        CREATE TABLE IF NOT EXISTS local_data (
          id TEXT PRIMARY KEY,
          table_name TEXT,
          data TEXT,
          created_at TEXT,
          updated_at TEXT,
          sync_status TEXT DEFAULT 'pending'
        )
      `);
    }, reject, resolve);
  });
};

export const getManifest = (id: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM manifests WHERE id = ?',
        [id],
        (_, { rows }) => resolve(rows._array[0] || null),
        (_, error) => { reject(error); return false; }
      );
    });
  });
};

export const saveManifest = (manifest: any): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        `INSERT OR REPLACE INTO manifests (id, tenant_id, name, version, data, synced_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          manifest.id,
          manifest.tenantId,
          manifest.name,
          manifest.version,
          JSON.stringify(manifest),
          new Date().toISOString(),
        ],
        () => resolve(),
        (_, error) => { reject(error); return false; }
      );
    });
  });
};

export const addToSyncQueue = (
  tableName: string,
  operation: string,
  data: any
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    db.transaction((tx) => {
      tx.executeSql(
        `INSERT INTO sync_queue (id, table_name, operation, data, created_at)
         VALUES (?, ?, ?, ?, ?)`,
        [id, tableName, operation, JSON.stringify(data), new Date().toISOString()],
        () => resolve(),
        (_, error) => { reject(error); return false; }
      );
    });
  });
};

export const getPendingSync = (): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        "SELECT * FROM sync_queue WHERE status = 'pending' ORDER BY created_at",
        [],
        (_, { rows }) => resolve(rows._array),
        (_, error) => { reject(error); return false; }
      );
    });
  });
};

export const markSynced = (ids: string[]): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      const placeholders = ids.map(() => '?').join(',');
      tx.executeSql(
        `UPDATE sync_queue SET status = 'synced' WHERE id IN (${placeholders})`,
        ids,
        () => resolve(),
        (_, error) => { reject(error); return false; }
      );
    });
  });
};
```

---

### FASE 3: Sync Engine

#### 4.3.1 Sync Service (Gateway)
```typescript
// gateway/src/services/sync.service.ts

import type { SyncPayload, PendingChange } from '@kamaleon/shared-types';

interface SyncResult {
  success: boolean;
  processedChanges: string[];
  serverChanges: any[];
  newSyncTimestamp: string;
}

export class SyncService {
  async processSync(
    tenantId: string,
    deviceId: string,
    payload: SyncPayload
  ): Promise<SyncResult> {
    const processedChanges: string[] = [];
    const serverChanges: any[] = [];

    // 1. Process incoming changes from device
    for (const change of payload.pendingChanges) {
      try {
        await this.applyChange(tenantId, change);
        processedChanges.push(change.id);
      } catch (error) {
        console.error(`Failed to process change ${change.id}:`, error);
      }
    }

    // 2. Get server changes since last sync
    const serverUpdates = await this.getChangesSince(
      tenantId,
      payload.lastSyncAt
    );
    serverChanges.push(...serverUpdates);

    return {
      success: true,
      processedChanges,
      serverChanges,
      newSyncTimestamp: new Date().toISOString(),
    };
  }

  private async applyChange(tenantId: string, change: PendingChange) {
    // Apply change to database based on operation type
    switch (change.operation) {
      case 'INSERT':
        // Insert into appropriate table
        break;
      case 'UPDATE':
        // Update existing record
        break;
      case 'DELETE':
        // Soft delete
        break;
    }
  }

  private async getChangesSince(tenantId: string, since: string) {
    // Query database for changes after timestamp
    return [];
  }
}
```

---

## 5. Docker Compose

```yaml
# docker-compose.yml

version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: kamaleon
      POSTGRES_PASSWORD: kamaleon_dev
      POSTGRES_DB: kamaleon
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  dashboard-backend:
    build: ./dashboard/backend
    ports:
      - "3001:3001"
    environment:
      DATABASE_URL: postgresql://kamaleon:kamaleon_dev@postgres:5432/kamaleon
      JWT_SECRET: dev-jwt-secret-change-in-prod
      PORT: 3001
    depends_on:
      - postgres

  gateway:
    build: ./gateway
    ports:
      - "3002:3002"
    environment:
      DASHBOARD_BACKEND_URL: http://dashboard-backend:3001
      JWT_SECRET: dev-jwt-secret-change-in-prod
      PORT: 3002
    depends_on:
      - dashboard-backend

  dashboard-frontend:
    build: ./dashboard/frontend
    ports:
      - "3000:80"
    environment:
      VITE_API_URL: http://localhost:3001/api
    depends_on:
      - dashboard-backend

volumes:
  postgres_data:
```

---

## 6. Estructura de Archivos Final

```
kamaleon/
├── dashboard/
│   ├── frontend/                    # YA IMPLEMENTADO
│   │   └── src/modules/auth/        # Sistema de auth completo
│   │
│   └── backend/
│       ├── src/
│       │   ├── index.ts
│       │   ├── routes/
│       │   │   ├── auth.ts
│       │   │   ├── manifests.ts
│       │   │   └── users.ts
│       │   ├── middleware/
│       │   │   ├── auth.ts
│       │   │   └── error.ts
│       │   ├── services/
│       │   │   ├── auth.service.ts
│       │   │   └── manifest.service.ts
│       │   └── prisma/
│       │       └── schema.prisma
│       ├── package.json
│       ├── tsconfig.json
│       └── Dockerfile
│
├── gateway/
│   ├── src/
│   │   ├── index.ts
│   │   ├── routes/
│   │   │   ├── sync.ts
│   │   │   └── manifests.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts
│   │   │   ├── proxy.ts
│   │   │   └── rateLimit.ts
│   │   └── services/
│   │       └── sync.service.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
│
├── mobile/
│   └── app/
│       ├── App.tsx
│       ├── screens/
│       │   ├── LoginScreen.tsx
│       │   ├── HomeScreen.tsx
│       │   └── DynamicScreen.tsx
│       ├── components/
│       │   └── SDUIRenderer.tsx
│       ├── stores/
│       │   ├── auth.store.ts
│       │   └── sync.store.ts
│       ├── database/
│       │   └── index.ts
│       ├── services/
│       │   ├── api.ts
│       │   └── sync.ts
│       ├── app.json
│       └── package.json
│
├── shared/
│   └── types/
│       ├── index.ts
│       └── package.json
│
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 7. Comandos de Ejecucion

```bash
# Desarrollo local (todos los servicios)
docker-compose up -d

# Solo backend
cd dashboard/backend && npm run dev

# Solo gateway
cd gateway && npm run dev

# Mobile app (Expo)
cd mobile/app && npx expo start

# Tests
npm run test

# Build produccion
docker-compose -f docker-compose.prod.yml build
```

---

## 8. Criterios de Exito MVP

| Criterio | Target | Verificacion |
|----------|--------|--------------|
| Login Dashboard | Funcional | Test manual |
| Login Mobile | Funcional | Test manual |
| Crear Manifest | < 2 seg | Performance test |
| Sync Mobile | < 5 seg | E2E test |
| Offline Mode | Funcional | Test sin conexion |
| SDUI Render | < 100ms | Performance test |

---

## 9. Roadmap Post-MVP

1. **Fase 2:** Guardian IA (validacion SQL)
2. **Fase 3:** Feature Builder (IDE visual)
3. **Fase 4:** Multi-tenant completo
4. **Fase 5:** Integraciones ERP
5. **Fase 6:** Motor de impresion termica
