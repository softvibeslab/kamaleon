# Mr. Alfred & Agentes - Ecosistema Kamaleon

## Arquitectura de Agentes MoAI-ADK

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              MR. ALFRED                                          │
│                         (Chief Orchestrator)                                     │
│                              TIER 0                                              │
└────────────────────────────────┬────────────────────────────────────────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   TIER 1        │    │   TIER 1        │    │   TIER 1        │
│   @backend      │    │   @frontend     │    │   @devops       │
│   Specialists   │    │   Specialists   │    │   Specialists   │
└────────┬────────┘    └────────┬────────┘    └────────┬────────┘
         │                      │                      │
    ┌────┴────┐            ┌────┴────┐            ┌────┴────┐
    ▼         ▼            ▼         ▼            ▼         ▼
┌───────┐ ┌───────┐   ┌───────┐ ┌───────┐   ┌───────┐ ┌───────┐
│TIER 2 │ │TIER 2 │   │TIER 2 │ │TIER 2 │   │TIER 2 │ │TIER 2 │
│@api   │ │@db    │   │@ui    │ │@mobile│   │@ci    │ │@infra │
└───────┘ └───────┘   └───────┘ └───────┘   └───────┘ └───────┘
```

---

# PARTE 1: AGENTES DEL DASHBOARD

## 1.1 Dashboard Frontend Agents

### @dashboard-fe-lead
**Tier:** 1 - Specialist Lead
**Base Agent:** @frontend
**Responsabilidad:** Coordinar todo el desarrollo frontend del dashboard Kamaleon

```yaml
agent:
  name: "@dashboard-fe-lead"
  tier: 1
  base: "@frontend"

  context:
    project: "kamaleon-dashboard"
    framework: "React 18 + TypeScript"
    ui_library: "Material UI v5"
    state_management: "Zustand"

  capabilities:
    - "Arquitectura de componentes React"
    - "Gestión de estado global"
    - "Integración con APIs REST/GraphQL"
    - "Optimización de rendimiento"

  delegates_to:
    - "@dashboard-ui"
    - "@dashboard-state"
    - "@dashboard-api-client"

  escalates_to: "@alfred"

  quality_gates:
    - "ESLint zero errors"
    - "TypeScript strict mode"
    - "Test coverage > 80%"
    - "Lighthouse score > 90"
```

**Invocación:**
```
/moai:2-run SPEC-DASH-F002 --agent @dashboard-fe-lead
```

---

### @dashboard-ui
**Tier:** 2 - Implementation
**Base Agent:** @ui
**Responsabilidad:** Implementar componentes visuales del dashboard

```yaml
agent:
  name: "@dashboard-ui"
  tier: 2
  base: "@ui"

  context:
    design_system: "Material Design 3"
    figma_integration: true
    responsive: true
    accessibility: "WCAG 2.1 AA"

  capabilities:
    - "Componentes React reutilizables"
    - "Diseño responsivo mobile-first"
    - "Animaciones y transiciones"
    - "Temas claro/oscuro"

  tools:
    - "Storybook"
    - "Chromatic"
    - "Figma MCP"

  patterns:
    - "Atomic Design"
    - "Compound Components"
    - "Render Props"
```

**Ejemplo de uso:**
```
@dashboard-ui Implementa el componente FeatureBuilderCanvas según SPEC-DASH-F002
con drag-and-drop usando react-dnd y preview en tiempo real.
```

---

### @dashboard-state
**Tier:** 2 - Implementation
**Base Agent:** @frontend
**Responsabilidad:** Gestión de estado y lógica de negocio frontend

```yaml
agent:
  name: "@dashboard-state"
  tier: 2
  base: "@frontend"

  context:
    state_lib: "Zustand"
    persistence: "localStorage"
    real_time: "WebSocket"

  capabilities:
    - "Stores Zustand tipados"
    - "Sincronización con backend"
    - "Caché y persistencia local"
    - "Manejo de WebSocket"

  patterns:
    - "Flux unidirectional"
    - "Optimistic updates"
    - "Selector memoization"
```

---

### @dashboard-api-client
**Tier:** 2 - Implementation
**Base Agent:** @api
**Responsabilidad:** Comunicación con APIs del backend

```yaml
agent:
  name: "@dashboard-api-client"
  tier: 2
  base: "@api"

  context:
    http_client: "Axios"
    api_style: "REST + GraphQL"
    auth: "JWT Bearer"

  capabilities:
    - "Interceptors de auth"
    - "Retry automático"
    - "Transformación de responses"
    - "Caché de queries"

  integrations:
    - "React Query"
    - "Apollo Client"
```

---

## 1.2 Dashboard Backend Agents

### @dashboard-be-lead
**Tier:** 1 - Specialist Lead
**Base Agent:** @backend
**Responsabilidad:** Coordinar desarrollo backend del dashboard

```yaml
agent:
  name: "@dashboard-be-lead"
  tier: 1
  base: "@backend"

  context:
    project: "kamaleon-api"
    framework: "NestJS"
    language: "TypeScript"
    database: "PostgreSQL"
    cache: "Redis"

  capabilities:
    - "Arquitectura hexagonal"
    - "Domain-Driven Design"
    - "Event-driven architecture"
    - "Multi-tenancy"

  delegates_to:
    - "@dashboard-api"
    - "@dashboard-db"
    - "@dashboard-auth"
    - "@dashboard-events"

  quality_gates:
    - "Test coverage > 85%"
    - "Zero vulnerabilities"
    - "API documented (OpenAPI)"
```

**Invocación:**
```
/moai:2-run SPEC-DASH-B001 --agent @dashboard-be-lead
```

---

### @dashboard-api
**Tier:** 2 - Implementation
**Base Agent:** @api
**Responsabilidad:** Endpoints REST y GraphQL

```yaml
agent:
  name: "@dashboard-api"
  tier: 2
  base: "@api"

  context:
    framework: "NestJS"
    validation: "class-validator"
    serialization: "class-transformer"
    docs: "Swagger/OpenAPI 3.0"

  capabilities:
    - "Controllers REST"
    - "Resolvers GraphQL"
    - "DTOs y validación"
    - "Versionado de API"

  patterns:
    - "Controller → Service → Repository"
    - "Guards y Interceptors"
    - "Exception Filters"
```

---

### @dashboard-db
**Tier:** 2 - Implementation
**Base Agent:** @database
**Responsabilidad:** Persistencia y acceso a datos

```yaml
agent:
  name: "@dashboard-db"
  tier: 2
  base: "@database"

  context:
    orm: "TypeORM"
    db: "PostgreSQL 15"
    migrations: "TypeORM migrations"

  capabilities:
    - "Entities y relaciones"
    - "Queries optimizadas"
    - "Migraciones seguras"
    - "Multi-tenant isolation"

  patterns:
    - "Repository Pattern"
    - "Query Builder"
    - "Row-Level Security"
```

---

### @dashboard-auth
**Tier:** 2 - Implementation
**Base Agent:** @security
**Responsabilidad:** Autenticación y autorización

```yaml
agent:
  name: "@dashboard-auth"
  tier: 2
  base: "@security"

  context:
    strategy: "JWT + Refresh Token"
    rbac: true
    mfa: "TOTP optional"

  capabilities:
    - "JWT generation/validation"
    - "Role-based access control"
    - "Session management"
    - "OAuth2 integration"

  security_policies:
    - "Password hashing: bcrypt"
    - "Token rotation"
    - "Brute force protection"
```

---

### @dashboard-events
**Tier:** 2 - Implementation
**Base Agent:** @backend
**Responsabilidad:** Sistema de eventos y mensajería

```yaml
agent:
  name: "@dashboard-events"
  tier: 2
  base: "@backend"

  context:
    broker: "Redis Pub/Sub"
    websocket: "Socket.io"
    queue: "BullMQ"

  capabilities:
    - "Event emission/subscription"
    - "WebSocket real-time"
    - "Job queues"
    - "Event sourcing"

  patterns:
    - "CQRS"
    - "Saga Pattern"
    - "Outbox Pattern"
```

---

# PARTE 2: AGENTES DE SERVICIOS INTERMEDIOS

## 2.1 Gateway Agents

### @gateway-lead
**Tier:** 1 - Specialist Lead
**Base Agent:** @backend
**Responsabilidad:** Coordinar desarrollo del API Gateway

```yaml
agent:
  name: "@gateway-lead"
  tier: 1
  base: "@backend"

  context:
    project: "kamaleon-gateway"
    technology: "Kong / Express Gateway"
    protocol: "REST + gRPC"

  capabilities:
    - "API Gateway patterns"
    - "Rate limiting"
    - "Circuit breaker"
    - "Request transformation"

  delegates_to:
    - "@gateway-routing"
    - "@gateway-security"
    - "@gateway-integration"

  quality_gates:
    - "Latency < 10ms added"
    - "99.99% uptime"
    - "Zero security bypasses"
```

---

### @gateway-routing
**Tier:** 2 - Implementation
**Base Agent:** @backend
**Responsabilidad:** Enrutamiento y balanceo de carga

```yaml
agent:
  name: "@gateway-routing"
  tier: 2
  base: "@backend"

  capabilities:
    - "Dynamic routing"
    - "Load balancing"
    - "Service discovery"
    - "Traffic splitting"

  patterns:
    - "Weighted routing"
    - "Canary deployments"
    - "Blue-green routing"
```

---

### @gateway-security
**Tier:** 2 - Implementation
**Base Agent:** @security
**Responsabilidad:** Seguridad a nivel de gateway

```yaml
agent:
  name: "@gateway-security"
  tier: 2
  base: "@security"

  capabilities:
    - "Token validation"
    - "Rate limiting per tenant"
    - "IP whitelisting"
    - "DDoS protection"

  security_measures:
    - "OWASP API Security Top 10"
    - "Request sanitization"
    - "Response masking"
```

---

### @gateway-integration
**Tier:** 2 - Implementation
**Base Agent:** @backend
**Responsabilidad:** Integración con servicios externos

```yaml
agent:
  name: "@gateway-integration"
  tier: 2
  base: "@backend"

  integrations:
    reniec:
      type: "REST"
      auth: "API Key"
      timeout: 2000ms
      cache_ttl: 24h

    sunat:
      type: "REST"
      auth: "OAuth2"
      timeout: 3000ms

    sap:
      type: "RFC/BAPI"
      protocol: "SAP JCo"
      timeout: 5000ms

  capabilities:
    - "Adapter pattern"
    - "Response transformation"
    - "Error normalization"
    - "Fallback strategies"
```

---

# PARTE 3: AGENTES DEL CEREBRO IA

## 3.1 Guardian IA Agents

### @kamaleon-guardian
**Tier:** 1 - Specialist Lead
**Base Agent:** @security
**Responsabilidad:** Firewall de código SQL con IA

```yaml
agent:
  name: "@kamaleon-guardian"
  tier: 1
  base: "@security"
  specialization: "sql-validation-rag"

  context:
    project: "guardian-ia"
    model: "claude-3-opus"
    vector_db: "Pinecone"

  capabilities:
    - "SQL static analysis"
    - "Intent classification"
    - "Policy compliance check"
    - "RAG-augmented validation"

  delegates_to:
    - "@guardian-analyzer"
    - "@guardian-rag"
    - "@guardian-policy"

  knowledge_base:
    - "./research/*.pdf"
    - "./policies/*.md"

  rules:
    block_patterns:
      - "DROP TABLE"
      - "TRUNCATE"
      - "ALTER TABLE"
      - "DELETE FROM .* WHERE 1=1"

    require_approval:
      - "Acceso a DEVICE_CUSTOMER"
      - "Descuento > 15%"
      - "Modificación de triggers"
```

**Invocación:**
```
/moai:2-run SPEC-AI-001 --agent @kamaleon-guardian
```

---

### @guardian-analyzer
**Tier:** 2 - Implementation
**Base Agent:** @security
**Responsabilidad:** Análisis estático de código SQL

```yaml
agent:
  name: "@guardian-analyzer"
  tier: 2
  base: "@security"

  capabilities:
    - "SQL parsing (ANTLR)"
    - "AST analysis"
    - "Pattern matching"
    - "Risk scoring"

  analysis_types:
    - "Syntax validation"
    - "Injection detection"
    - "Performance hints"
    - "Best practices"
```

---

### @guardian-rag
**Tier:** 2 - Implementation
**Base Agent:** @ai
**Responsabilidad:** Sistema RAG para contexto de políticas

```yaml
agent:
  name: "@guardian-rag"
  tier: 2
  base: "@ai"

  context:
    embedding_model: "text-embedding-3-large"
    vector_db: "Pinecone"
    chunk_size: 512

  capabilities:
    - "Document ingestion"
    - "Vectorization"
    - "Similarity search"
    - "Context retrieval"

  document_types:
    - "PDF policies"
    - "Markdown guidelines"
    - "SQL examples"
```

---

### @guardian-policy
**Tier:** 2 - Implementation
**Base Agent:** @security
**Responsabilidad:** Motor de reglas de políticas

```yaml
agent:
  name: "@guardian-policy"
  tier: 2
  base: "@security"

  capabilities:
    - "Policy definition (YAML/JSON)"
    - "Rule evaluation"
    - "Compliance reporting"
    - "Exception handling"

  policy_categories:
    - "Security policies"
    - "Business rules"
    - "Data governance"
    - "Compliance (GDPR, PCI)"
```

---

## 3.2 Automation Agents

### @kamaleon-automation
**Tier:** 1 - Specialist Lead
**Base Agent:** @devops
**Responsabilidad:** Orquestación de automatizaciones n8n

```yaml
agent:
  name: "@kamaleon-automation"
  tier: 1
  base: "@devops"

  context:
    platform: "n8n"
    triggers: ["webhook", "schedule", "event"]

  capabilities:
    - "Workflow design"
    - "Integration orchestration"
    - "Error handling"
    - "Monitoring"

  delegates_to:
    - "@automation-workflows"
    - "@automation-integrations"
    - "@automation-monitoring"
```

---

### @automation-workflows
**Tier:** 2 - Implementation
**Base Agent:** @devops
**Responsabilidad:** Diseño e implementación de workflows

```yaml
agent:
  name: "@automation-workflows"
  tier: 2
  base: "@devops"

  workflow_templates:
    order_processing:
      trigger: "webhook"
      steps:
        - "validate_order"
        - "check_inventory"
        - "process_payment"
        - "create_erp_order"
        - "notify_customer"

    sync_failed_recovery:
      trigger: "schedule"
      cron: "*/5 * * * *"
      steps:
        - "find_failed_syncs"
        - "retry_sync"
        - "escalate_if_failed"
```

---

## 3.3 AI Assistant Agents

### @kamaleon-assistant
**Tier:** 1 - Specialist Lead
**Base Agent:** @ai
**Responsabilidad:** Agente de soporte inteligente

```yaml
agent:
  name: "@kamaleon-assistant"
  tier: 1
  base: "@ai"

  context:
    model: "claude-3-sonnet"
    knowledge_base: "@guardian-rag"
    conversation_memory: 10

  capabilities:
    - "Natural language understanding"
    - "Context-aware responses"
    - "Product information"
    - "Troubleshooting"

  delegates_to:
    - "@assistant-product"
    - "@assistant-support"

  escalation:
    low_confidence_threshold: 0.7
    escalate_to: "human_support"
```

---

# PARTE 4: AGENTES DE LA APP MÓVIL

## 4.1 App Frontend Agents

### @app-fe-lead
**Tier:** 1 - Specialist Lead
**Base Agent:** @mobile
**Responsabilidad:** Coordinar desarrollo Android/Kotlin

```yaml
agent:
  name: "@app-fe-lead"
  tier: 1
  base: "@mobile"

  context:
    project: "kamaleon-app"
    platform: "Android"
    language: "Kotlin"
    ui_framework: "Jetpack Compose"
    min_sdk: 26
    target_sdk: 34

  capabilities:
    - "MVVM architecture"
    - "Compose UI"
    - "Offline-first design"
    - "Performance optimization"

  delegates_to:
    - "@app-sdui"
    - "@app-forms"
    - "@app-printing"
    - "@app-storage"

  quality_gates:
    - "60fps performance"
    - "< 50MB memory/screen"
    - "100% offline capability"
    - "Test coverage > 80%"
```

**Invocación:**
```
/moai:2-run SPEC-APP-F001 --agent @app-fe-lead
```

---

### @app-sdui
**Tier:** 2 - Implementation
**Base Agent:** @mobile
**Responsabilidad:** Motor de renderizado Server-Driven UI

```yaml
agent:
  name: "@app-sdui"
  tier: 2
  base: "@mobile"

  context:
    renderer: "Jetpack Compose"
    manifest_format: "JSON"

  capabilities:
    - "JSON manifest parsing"
    - "Component mapping"
    - "Dynamic rendering"
    - "Context injection"

  component_library:
    primitives:
      - "text"
      - "button"
      - "input"
      - "dropdown"
      - "checkbox"
      - "image"

    containers:
      - "column"
      - "row"
      - "card"
      - "list"
      - "form"

    advanced:
      - "camera"
      - "signature"
      - "location"
      - "barcode_scanner"
```

---

### @app-forms
**Tier:** 2 - Implementation
**Base Agent:** @mobile
**Responsabilidad:** Sistema de formularios dinámicos

```yaml
agent:
  name: "@app-forms"
  tier: 2
  base: "@mobile"

  capabilities:
    - "Dynamic form generation"
    - "Validation engine"
    - "Dependency management"
    - "Auto-save drafts"

  validation_rules:
    - "required"
    - "min_length"
    - "max_length"
    - "pattern (regex)"
    - "custom_function"

  triggers:
    - "ON_CHANGE"
    - "ON_BLUR"
    - "ON_SUBMIT"
    - "ON_EXIT"
```

---

### @app-printing
**Tier:** 2 - Implementation
**Base Agent:** @mobile
**Responsabilidad:** Motor de impresión térmica

```yaml
agent:
  name: "@app-printing"
  tier: 2
  base: "@mobile"

  context:
    protocol: "ESC/POS"
    connection: "Bluetooth"

  capabilities:
    - "Bluetooth discovery"
    - "ESC/POS command generation"
    - "QR code generation"
    - "Print queue management"

  supported_printers:
    - "Epson TM series"
    - "Zebra"
    - "Brother"
    - "Generic ESC/POS"
```

---

## 4.2 App Backend Agents

### @kamaleon-sync
**Tier:** 1 - Specialist Lead
**Base Agent:** @backend
**Responsabilidad:** Motor de sincronización offline-first

```yaml
agent:
  name: "@kamaleon-sync"
  tier: 1
  base: "@backend"
  specialization: "offline-first-sync"

  context:
    project: "kamaleon-sync-engine"
    local_db: "SQLite + SQLCipher"
    protocol: "Delta Sync"

  capabilities:
    - "Differential synchronization"
    - "Conflict resolution"
    - "Priority-based sync"
    - "Bandwidth optimization"

  delegates_to:
    - "@sync-engine"
    - "@sync-conflict"
    - "@sync-queue"

  sync_priorities:
    high:
      tables: ["DEVICE_ORDER", "DEVICE_ORDERDETAIL"]
      interval: "5m"
    medium:
      tables: ["DEVICE_PRODUCT", "DEVICE_PRODUCT_PRICE"]
      interval: "2h"
    low:
      tables: ["DEVICE_CUSTOMER"]
      interval: "24h"
```

**Invocación:**
```
/moai:2-run SPEC-SYNC-001 --agent @kamaleon-sync
```

---

### @sync-engine
**Tier:** 2 - Implementation
**Base Agent:** @backend
**Responsabilidad:** Core del motor de sincronización

```yaml
agent:
  name: "@sync-engine"
  tier: 2
  base: "@backend"

  capabilities:
    - "Delta calculation"
    - "Compression (gzip)"
    - "Batch processing"
    - "Checkpoint management"

  algorithms:
    - "Merkle tree diff"
    - "Version vectors"
    - "Timestamp-based"
```

---

### @sync-conflict
**Tier:** 2 - Implementation
**Base Agent:** @backend
**Responsabilidad:** Resolución de conflictos

```yaml
agent:
  name: "@sync-conflict"
  tier: 2
  base: "@backend"

  strategies:
    server_wins:
      applies_to: ["master_data"]

    client_wins:
      applies_to: ["user_preferences"]

    merge:
      applies_to: ["transactions"]
      merge_algorithm: "field-level"

    manual:
      applies_to: ["critical_data"]
      escalate_to: "supervisor"
```

---

### @app-storage
**Tier:** 2 - Implementation
**Base Agent:** @database
**Responsabilidad:** Persistencia local SQLite

```yaml
agent:
  name: "@app-storage"
  tier: 2
  base: "@database"

  context:
    database: "SQLite"
    encryption: "SQLCipher AES-256"
    orm: "Room"

  capabilities:
    - "Entity mapping"
    - "Migrations"
    - "Query optimization"
    - "Backup/restore"

  tables:
    - "DEVICE_CUSTOMER"
    - "DEVICE_ORDER"
    - "DEVICE_ORDERDETAIL"
    - "DEVICE_PRODUCT"
    - "DEVICE_PRODUCT_PRICE"
    - "DEVICE_ORDERTAXITEM"
    - "DEVICE_ORDERDISCOUNTITEM"
```

---

### @app-calculator
**Tier:** 2 - Implementation
**Base Agent:** @backend
**Responsabilidad:** Motor de cálculo local

```yaml
agent:
  name: "@app-calculator"
  tier: 2
  base: "@backend"

  capabilities:
    - "Price calculation"
    - "Tax computation"
    - "Discount application"
    - "Volume pricing"

  tax_configurations:
    peru:
      igv: 18%

    mexico:
      iva: 16%

  discount_types:
    - "percentage"
    - "fixed_amount"
    - "volume_based"
    - "promotional"
```

---

# PARTE 5: AGENTES DE CI/CD & TESTING

### @cicd-lead
**Tier:** 1 - Specialist Lead
**Base Agent:** @devops
**Responsabilidad:** Coordinar pipelines CI/CD

```yaml
agent:
  name: "@cicd-lead"
  tier: 1
  base: "@devops"

  context:
    platform: "GitHub Actions"
    registry: "Docker Hub / GCR"
    k8s: "GKE"

  capabilities:
    - "Pipeline design"
    - "Infrastructure as Code"
    - "Release management"
    - "Monitoring setup"

  delegates_to:
    - "@cicd-build"
    - "@cicd-test"
    - "@cicd-deploy"
    - "@cicd-ota"
```

---

### @cicd-build
**Tier:** 2 - Implementation
**Base Agent:** @devops
**Responsabilidad:** Compilación y empaquetado

```yaml
agent:
  name: "@cicd-build"
  tier: 2
  base: "@devops"

  build_configs:
    dashboard_fe:
      tool: "npm/vite"
      output: "docker image"

    dashboard_be:
      tool: "npm/nest"
      output: "docker image"

    mobile_app:
      tool: "gradle"
      output: "APK/AAB"

    gateway:
      tool: "npm"
      output: "docker image"
```

---

### @cicd-test
**Tier:** 2 - Implementation
**Base Agent:** @testing
**Responsabilidad:** Ejecución de tests automatizados

```yaml
agent:
  name: "@cicd-test"
  tier: 2
  base: "@testing"

  test_suites:
    unit:
      framework: "Jest / JUnit"
      coverage_min: 80%

    integration:
      framework: "Supertest / MockK"
      database: "TestContainers"

    e2e:
      framework: "Playwright / Maestro"
      parallel: true

    security:
      tools: ["SAST", "DAST", "Dependency scan"]
```

---

### @cicd-deploy
**Tier:** 2 - Implementation
**Base Agent:** @devops
**Responsabilidad:** Despliegue a ambientes

```yaml
agent:
  name: "@cicd-deploy"
  tier: 2
  base: "@devops"

  environments:
    development:
      trigger: "push to develop"
      auto: true

    staging:
      trigger: "push to main"
      auto: true

    production:
      trigger: "manual / tag"
      approvers: ["tech-lead", "qa-lead"]

  strategies:
    - "Rolling update"
    - "Blue-green"
    - "Canary"
```

---

### @cicd-ota
**Tier:** 2 - Implementation
**Base Agent:** @mobile
**Responsabilidad:** Updates Over-The-Air

```yaml
agent:
  name: "@cicd-ota"
  tier: 2
  base: "@mobile"

  capabilities:
    - "Manifest versioning"
    - "Delta packaging"
    - "Rollout management"
    - "Rollback"

  rollout_strategy:
    beta_group: 5%
    gradual_rollout:
      - "10% after 1h"
      - "50% after 24h"
      - "100% after 48h"
```

---

# PARTE 6: CONFIGURACIÓN GLOBAL

## Archivo de Configuración de Agentes

```yaml
# .moai/agents.yaml

mr_alfred:
  model: "claude-3-opus"

  default_agents:
    - "@backend"
    - "@frontend"
    - "@mobile"
    - "@database"
    - "@security"
    - "@devops"
    - "@testing"
    - "@ai"

  custom_agents:
    # Dashboard
    - name: "@dashboard-fe-lead"
      base: "@frontend"
      context_files:
        - "./dashboard/frontend/**/*"

    - name: "@dashboard-be-lead"
      base: "@backend"
      context_files:
        - "./dashboard/backend/**/*"

    # Gateway
    - name: "@gateway-lead"
      base: "@backend"
      context_files:
        - "./gateway/**/*"

    # Cerebro IA
    - name: "@kamaleon-guardian"
      base: "@security"
      specialization: "sql-validation-rag"
      knowledge_base:
        - "./research/*.pdf"
        - "./policies/*.md"

    - name: "@kamaleon-automation"
      base: "@devops"
      context_files:
        - "./automation/n8n/**/*"

    # Mobile App
    - name: "@app-fe-lead"
      base: "@mobile"
      context_files:
        - "./app/android/**/*"

    - name: "@kamaleon-sync"
      base: "@backend"
      specialization: "offline-first-sync"
      context_files:
        - "./sync-engine/**/*"

    # CI/CD
    - name: "@cicd-lead"
      base: "@devops"
      context_files:
        - "./.github/workflows/**/*"
        - "./infrastructure/**/*"

  routing_rules:
    # Por tipo de SPEC
    - pattern: "SPEC-DASH-F*"
      agent: "@dashboard-fe-lead"

    - pattern: "SPEC-DASH-B*"
      agent: "@dashboard-be-lead"

    - pattern: "SPEC-GW-*"
      agent: "@gateway-lead"

    - pattern: "SPEC-AI-*"
      agent: "@kamaleon-guardian"

    - pattern: "SPEC-APP-F*"
      agent: "@app-fe-lead"

    - pattern: "SPEC-APP-B*"
      agent: "@kamaleon-sync"

    - pattern: "SPEC-SYNC-*"
      agent: "@kamaleon-sync"

    - pattern: "SPEC-CICD-*"
      agent: "@cicd-lead"

    # Por archivo modificado
    - file_pattern: "dashboard/frontend/**"
      agent: "@dashboard-fe-lead"

    - file_pattern: "dashboard/backend/**"
      agent: "@dashboard-be-lead"

    - file_pattern: "app/android/**"
      agent: "@app-fe-lead"

    - file_pattern: ".github/workflows/**"
      agent: "@cicd-lead"
```

---

## Matriz de Responsabilidades por Componente

| Componente | Lead Agent | Tier 2 Agents |
|------------|------------|---------------|
| Dashboard Frontend | @dashboard-fe-lead | @dashboard-ui, @dashboard-state, @dashboard-api-client |
| Dashboard Backend | @dashboard-be-lead | @dashboard-api, @dashboard-db, @dashboard-auth, @dashboard-events |
| Gateway | @gateway-lead | @gateway-routing, @gateway-security, @gateway-integration |
| Guardian IA | @kamaleon-guardian | @guardian-analyzer, @guardian-rag, @guardian-policy |
| Automation | @kamaleon-automation | @automation-workflows, @automation-integrations |
| App Frontend | @app-fe-lead | @app-sdui, @app-forms, @app-printing |
| App Backend | @kamaleon-sync | @sync-engine, @sync-conflict, @app-storage, @app-calculator |
| CI/CD | @cicd-lead | @cicd-build, @cicd-test, @cicd-deploy, @cicd-ota |

---

## Referencias

- **MoAI-ADK Agent System:** https://github.com/softvibeslab/moai-adk
- **SPEC Documentation:** [01-SPEC-EARS-Ecosistema-Kamaleon.md](./01-SPEC-EARS-Ecosistema-Kamaleon.md)
