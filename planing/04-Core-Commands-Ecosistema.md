# Core Commands - Ecosistema Kamaleon

## Comandos MoAI-ADK

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            CORE COMMANDS                                         │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│   /moai:0-project    →    Inicialización y configuración del proyecto           │
│   /moai:1-plan       →    Planificación y creación de SPECs                     │
│   /moai:2-run        →    Ejecución TDD con agentes                             │
│   /moai:3-sync       →    Verificación, documentación y CI/CD                   │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

# /moai:0-project - Inicialización del Proyecto

## Descripción
Comando para inicializar, analizar y configurar el proyecto Kamaleon dentro del framework MoAI-ADK.

## Sintaxis

```bash
/moai:0-project [subcommand] [options]
```

## Subcomandos

### --init
Inicializa MoAI-ADK en el proyecto actual.

```bash
/moai:0-project --init

# Output:
# ✓ Creando estructura .moai/
# ✓ Generando config.yaml
# ✓ Generando agents.yaml
# ✓ Escaneando estructura del proyecto
# ✓ Detectando stack tecnológico
#
# Proyecto inicializado:
# - Nombre: kamaleon
# - Tipo: monorepo
# - Stack detectado:
#   - dashboard/frontend: React + TypeScript
#   - dashboard/backend: NestJS
#   - app/android: Kotlin + Compose
#   - services/guardian: Python
#
# Ejecuta /moai:0-project --analyze para análisis detallado
```

**Archivos generados:**
```
.moai/
├── config.yaml          # Configuración general
├── agents.yaml          # Definición de agentes
├── specs/               # Carpeta para SPECs
├── knowledge/           # Base de conocimiento RAG
└── templates/           # Templates de SPEC
```

---

### --analyze
Analiza el proyecto y genera reporte de estado.

```bash
/moai:0-project --analyze

# Output:
# ════════════════════════════════════════════════════════════════
#                    ANÁLISIS DEL PROYECTO KAMALEON
# ════════════════════════════════════════════════════════════════
#
# COMPONENTES DETECTADOS:
# ┌──────────────────────┬────────────┬──────────────┬───────────┐
# │ Componente           │ Tecnología │ Coverage     │ Estado    │
# ├──────────────────────┼────────────┼──────────────┼───────────┤
# │ dashboard/frontend   │ React 18   │ 78%          │ ⚠ Warning │
# │ dashboard/backend    │ NestJS     │ 85%          │ ✓ OK      │
# │ app/android          │ Kotlin     │ 72%          │ ⚠ Warning │
# │ services/gateway     │ Express    │ 80%          │ ✓ OK      │
# │ services/guardian    │ Python     │ 90%          │ ✓ OK      │
# │ services/sync        │ Kotlin     │ 75%          │ ⚠ Warning │
# └──────────────────────┴────────────┴──────────────┴───────────┘
#
# SPECS EXISTENTES: 24
# - Completados: 18 (75%)
# - En progreso: 4 (17%)
# - Pendientes: 2 (8%)
#
# DEUDA TÉCNICA:
# - 12 TODOs pendientes
# - 3 issues de seguridad (low)
# - Coverage < 80% en 3 componentes
#
# RECOMENDACIONES:
# 1. Incrementar coverage en dashboard/frontend (actual: 78%, target: 80%)
# 2. Implementar SPEC-SYNC-002 (pendiente crítico)
# 3. Resolver issue de seguridad en gateway (SQL injection potencial)
```

---

### --setup-component
Configura un nuevo componente del ecosistema.

```bash
/moai:0-project --setup-component [nombre] --type [tipo]

# Ejemplo: Agregar nuevo microservicio
/moai:0-project --setup-component notification-service --type nestjs

# Output:
# ✓ Creando estructura services/notification-service/
# ✓ Inicializando proyecto NestJS
# ✓ Configurando TypeScript
# ✓ Agregando a monorepo
# ✓ Creando agente @notification-service
# ✓ Actualizando CI/CD pipeline
#
# Nuevo componente creado:
# - Path: services/notification-service/
# - Agente: @notification-service
# - Tests: jest configurado
# - CI/CD: job agregado a workflow
```

**Tipos soportados:**
| Tipo | Stack | Agente base |
|------|-------|-------------|
| `react` | React + TypeScript | @frontend |
| `nestjs` | NestJS + TypeScript | @backend |
| `kotlin-app` | Kotlin + Compose | @mobile |
| `python` | Python + FastAPI | @backend |
| `n8n-workflow` | n8n | @automation |

---

### --status
Muestra estado actual del proyecto y tareas pendientes.

```bash
/moai:0-project --status

# Output:
# ════════════════════════════════════════════════════════════════
#                      ESTADO DEL PROYECTO
# ════════════════════════════════════════════════════════════════
#
# RAMA ACTUAL: feature/SPEC-APP-F002-dynamic-forms
#
# SPEC EN PROGRESO:
# ┌─────────────────┬─────────────────────────────┬──────────┐
# │ SPEC            │ Descripción                 │ Progreso │
# ├─────────────────┼─────────────────────────────┼──────────┤
# │ SPEC-APP-F002   │ Sistema de Formularios      │ 65%      │
# │                 │ Dinámicos                   │          │
# └─────────────────┴─────────────────────────────┴──────────┘
#
# TAREAS PENDIENTES:
# - [ ] Implementar validación ON_EXIT
# - [ ] Agregar auto-save de borradores
# - [ ] Tests E2E para triggers
#
# ÚLTIMO SYNC: hace 2 horas
# TESTS: 145 passing, 2 pending
# COVERAGE: 78%
#
# PRÓXIMO PASO SUGERIDO:
# /moai:2-run SPEC-APP-F002 --continue
```

---

### --configure
Edita configuración de MoAI-ADK interactivamente.

```bash
/moai:0-project --configure

# Output interactivo:
# ════════════════════════════════════════════════════════════════
#                    CONFIGURACIÓN MoAI-ADK
# ════════════════════════════════════════════════════════════════
#
# Selecciona qué configurar:
# 1. Quality Gates
# 2. Agentes personalizados
# 3. Routing rules
# 4. CI/CD integration
# 5. Knowledge base
#
# > 1
#
# QUALITY GATES ACTUALES:
# ┌────────────────────┬──────────────┬─────────────┐
# │ Métrica            │ Valor actual │ Nuevo valor │
# ├────────────────────┼──────────────┼─────────────┤
# │ Test coverage      │ 80%          │ _           │
# │ Max lint errors    │ 0            │ _           │
# │ Build time         │ 10min        │ _           │
# └────────────────────┴──────────────┴─────────────┘
#
# Ingresa nuevo valor para 'Test coverage' (Enter para mantener): 85
# ✓ Coverage actualizado a 85%
```

---

## Ejemplos Completos para Kamaleon

### Inicialización del Proyecto

```bash
# 1. Clonar e inicializar
cd kamaleon
/moai:0-project --init

# 2. Verificar configuración generada
cat .moai/config.yaml
```

**config.yaml generado:**
```yaml
project:
  name: "kamaleon"
  type: "monorepo"
  description: "Plataforma SDUI para movilidad empresarial"

components:
  - name: "dashboard-frontend"
    path: "dashboard/frontend"
    type: "react"
    agent: "@dashboard-fe-lead"

  - name: "dashboard-backend"
    path: "dashboard/backend"
    type: "nestjs"
    agent: "@dashboard-be-lead"

  - name: "mobile-app"
    path: "app/android"
    type: "kotlin-app"
    agent: "@app-fe-lead"

  - name: "gateway"
    path: "services/gateway"
    type: "express"
    agent: "@gateway-lead"

  - name: "guardian-ia"
    path: "services/guardian"
    type: "python"
    agent: "@kamaleon-guardian"

  - name: "sync-engine"
    path: "services/sync"
    type: "kotlin"
    agent: "@kamaleon-sync"

quality_gates:
  coverage:
    minimum: 80
    tool: "jest|jacoco|pytest"
  lint:
    tools: ["eslint", "detekt", "ruff"]
    fail_on_error: true
  security:
    sast: true
    dependency_scan: true
  performance:
    build_time_max: "10m"

environments:
  development:
    url: "http://localhost:3000"
  staging:
    url: "https://staging.kamaleon.example.com"
  production:
    url: "https://kamaleon.example.com"
```

---

# /moai:1-plan - Planificación

## Descripción
Comando para crear y gestionar SPECs usando sintaxis EARS.

## Sintaxis

```bash
/moai:1-plan "[descripción del feature]" [options]
```

## Opciones

| Opción | Descripción |
|--------|-------------|
| `--component` | Componente específico |
| `--priority` | Prioridad (critical, high, medium, low) |
| `--template` | Template de SPEC a usar |
| `--output` | Archivo de salida |

---

## Ejemplos por Componente

### Dashboard Frontend

```bash
/moai:1-plan "Implementar Feature Builder con canvas drag-and-drop" \
  --component dashboard-frontend \
  --priority high

# Output:
# ════════════════════════════════════════════════════════════════
#                    GENERANDO SPEC-DASH-F002
# ════════════════════════════════════════════════════════════════
#
# Analizando contexto del proyecto...
# ✓ Componente: dashboard-frontend (React 18)
# ✓ Archivos relacionados detectados: 12
# ✓ SPECs relacionados: SPEC-DASH-F001 (Auth)
#
# SPEC GENERADO:
# ════════════════════════════════════════════════════════════════
#
# ## SPEC-DASH-F002: Feature Builder - IDE Visual
#
# **Descripción:**
# Implementar un IDE visual que permita construir interfaces móviles
# mediante drag-and-drop, generando manifiestos JSON compatibles con
# el motor SDUI de la app móvil.
#
# **Requirements (EARS):**
#
# ### Ubiquitous
# - El sistema SIEMPRE debe mostrar preview en tiempo real
# - El sistema SIEMPRE debe validar JSON antes de guardar
# - El sistema SIEMPRE debe generar IDs únicos (UUID v4)
#
# ### Event-Driven
# - CUANDO el usuario arrastra componente al canvas,
#   ENTONCES agregar nodo JSON al manifiesto
# - CUANDO el usuario modifica propiedad,
#   ENTONCES actualizar preview en < 100ms
# - CUANDO el usuario hace click en "Importar Figma",
#   ENTONCES parsear y convertir a componentes
#
# ### State-Driven
# - SI el componente requiere data_source,
#   ENTONCES mostrar panel de configuración SQL
# - SI el JSON es inválido,
#   ENTONCES deshabilitar botón guardar
#
# ### Unwanted
# - El sistema NO DEBE guardar manifiestos con queries no validadas
# - El sistema NO DEBE perder cambios ante desconexión
#
# ### Optional
# - DONDE SEA POSIBLE, sugerir componentes por contexto
#
# **Archivos Afectados:**
# - src/components/FeatureBuilder/index.tsx (nuevo)
# - src/components/FeatureBuilder/Canvas.tsx (nuevo)
# - src/components/FeatureBuilder/Toolbox.tsx (nuevo)
# - src/stores/manifestStore.ts (nuevo)
# - src/types/manifest.ts (nuevo)
#
# **Test Scenarios:**
# - TC-DASH-F002-01: Drag dropdown → JSON actualizado
# - TC-DASH-F002-02: Query inválida → Guardian rechaza
# - TC-DASH-F002-03: Import Figma → Componentes generados
#
# **Agente Asignado:** @dashboard-fe-lead
# **Estimación:** Medium complexity
#
# ════════════════════════════════════════════════════════════════
#
# ¿Guardar SPEC? (y/n): y
# ✓ SPEC guardado en .moai/specs/SPEC-DASH-F002.md
# ✓ Branch creado: feature/SPEC-DASH-F002-feature-builder
#
# Siguiente paso:
# /moai:2-run SPEC-DASH-F002 --agent @dashboard-fe-lead
```

---

### Dashboard Backend

```bash
/moai:1-plan "Crear API REST para gestión de manifiestos con versionado" \
  --component dashboard-backend

# Output:
# ════════════════════════════════════════════════════════════════
#                    GENERANDO SPEC-DASH-B002
# ════════════════════════════════════════════════════════════════
#
# ## SPEC-DASH-B002: API de Gestión de Manifiestos
#
# **Requirements (EARS):**
#
# ### Ubiquitous
# - El sistema SIEMPRE debe versionar cada cambio (semver)
# - El sistema SIEMPRE debe validar esquema JSON Schema
# - El sistema SIEMPRE debe auditar cambios
#
# ### Event-Driven
# - CUANDO se publica manifiesto,
#   ENTONCES notificar a Sync Engine
# - CUANDO Guardian rechaza,
#   ENTONCES retornar 400 con razón
#
# **Endpoints:**
# ```
# POST   /api/v1/manifests           # Crear
# GET    /api/v1/manifests           # Listar
# GET    /api/v1/manifests/:id       # Obtener
# PUT    /api/v1/manifests/:id       # Actualizar
# DELETE /api/v1/manifests/:id       # Eliminar
# POST   /api/v1/manifests/:id/publish  # Publicar
# POST   /api/v1/manifests/:id/rollback # Rollback
# GET    /api/v1/manifests/:id/versions # Historial
# ```
#
# **Archivos Afectados:**
# - src/modules/manifest/manifest.controller.ts
# - src/modules/manifest/manifest.service.ts
# - src/modules/manifest/manifest.entity.ts
# - src/modules/manifest/dto/*.ts
#
# **Agente Asignado:** @dashboard-be-lead
```

---

### Gateway / Servicios Intermedios

```bash
/moai:1-plan "Implementar integración con RENIEC incluyendo cache y fallback" \
  --component gateway

# Output:
# ════════════════════════════════════════════════════════════════
#                    GENERANDO SPEC-GW-002
# ════════════════════════════════════════════════════════════════
#
# ## SPEC-GW-002: Integración RENIEC
#
# **Requirements (EARS):**
#
# ### Ubiquitous
# - El sistema SIEMPRE debe cachear respuestas exitosas (24h)
# - El sistema SIEMPRE debe loguear todas las consultas
#
# ### Event-Driven
# - CUANDO se solicita validación DNI,
#   ENTONCES consultar cache primero, luego RENIEC
# - CUANDO RENIEC timeout,
#   ENTONCES retornar último valor cacheado si existe
#
# ### State-Driven
# - SI DNI ya consultado en 24h,
#   ENTONCES retornar desde cache
# - SI circuit breaker abierto,
#   ENTONCES permitir modo degradado
#
# ### Unwanted
# - El sistema NO DEBE exponer credenciales en logs
# - El sistema NO DEBE exceder 1000 consultas/día/tenant
#
# **Integración:**
# ```yaml
# reniec:
#   url: "https://api.reniec.gob.pe/v1/dni"
#   auth: "API Key"
#   timeout: 2000ms
#   retries: 3
#   cache_ttl: 86400 # 24h
#   circuit_breaker:
#     threshold: 50%
#     timeout: 30s
# ```
#
# **Agente Asignado:** @gateway-lead
```

---

### Guardian IA

```bash
/moai:1-plan "Implementar validación SQL con análisis RAG de políticas" \
  --component guardian-ia

# Output:
# ════════════════════════════════════════════════════════════════
#                    GENERANDO SPEC-AI-001
# ════════════════════════════════════════════════════════════════
#
# ## SPEC-AI-001: Firewall SQL con RAG
#
# **Requirements (EARS):**
#
# ### Ubiquitous
# - El sistema SIEMPRE debe analizar queries antes de aprobar
# - El sistema SIEMPRE debe explicar rechazos en lenguaje natural
#
# ### Event-Driven
# - CUANDO detecta DROP/TRUNCATE/ALTER,
#   ENTONCES rechazar inmediatamente
# - CUANDO detecta posible violación de política,
#   ENTONCES consultar RAG para contexto
#
# ### Unwanted
# - El sistema NO DEBE tener falsos negativos (0%)
# - El sistema NO DEBE aprobar acceso a datos sensibles sin filtro
#
# **Patrones Bloqueados:**
# ```python
# DANGEROUS_PATTERNS = [
#     r'\bDROP\s+TABLE\b',
#     r'\bTRUNCATE\b',
#     r'\bALTER\s+TABLE\b',
#     r';\s*--',  # SQL injection
#     r'\bDELETE\s+FROM\s+\w+\s*$'  # DELETE sin WHERE
# ]
# ```
#
# **Knowledge Base:**
# - research/*.pdf (políticas de seguridad)
# - policies/*.md (reglas de negocio)
#
# **Agente Asignado:** @kamaleon-guardian
```

---

### Mobile App

```bash
/moai:1-plan "Implementar motor SDUI con renderizado Jetpack Compose" \
  --component mobile-app

# Output:
# ════════════════════════════════════════════════════════════════
#                    GENERANDO SPEC-APP-F001
# ════════════════════════════════════════════════════════════════
#
# ## SPEC-APP-F001: Motor de Renderizado SDUI
#
# **Requirements (EARS):**
#
# ### Ubiquitous
# - El sistema SIEMPRE debe renderizar componentes nativos (no WebView)
# - El sistema SIEMPRE debe mantener 60fps
# - El sistema SIEMPRE debe funcionar 100% offline
#
# ### Event-Driven
# - CUANDO recibe nuevo manifiesto,
#   ENTONCES re-renderizar UI afectada
# - CUANDO componente requiere data,
#   ENTONCES ejecutar query SQLite local
#
# ### State-Driven
# - SI manifiesto incluye @context_param,
#   ENTONCES inyectar valor de sesión
# - SI no hay manifiesto cacheado,
#   ENTONCES mostrar UI fallback
#
# **Componentes Soportados:**
# ```kotlin
# sealed class SDUIComponent {
#     data class Text(val content: String, val style: TextStyle)
#     data class Button(val label: String, val action: Action)
#     data class Dropdown(val id: String, val dataSource: DataSource)
#     data class Form(val children: List<SDUIComponent>)
#     // ...
# }
# ```
#
# **Agente Asignado:** @app-fe-lead
```

---

### Sync Engine

```bash
/moai:1-plan "Implementar sincronización diferencial con priorización" \
  --component sync-engine

# Output:
# ════════════════════════════════════════════════════════════════
#                    GENERANDO SPEC-SYNC-001
# ════════════════════════════════════════════════════════════════
#
# ## SPEC-SYNC-001: Sync Diferencial Priorizado
#
# **Requirements (EARS):**
#
# ### Ubiquitous
# - El sistema SIEMPRE debe usar delta sync
# - El sistema SIEMPRE debe ejecutar en background
#
# ### State-Driven
# - SI tabla es DEVICE_ORDER (alta prioridad),
#   ENTONCES sync cada 5 minutos
# - SI tabla es DEVICE_PRODUCT (media prioridad),
#   ENTONCES sync cada 2 horas
# - SI tabla es DEVICE_CUSTOMER (baja prioridad),
#   ENTONCES sync cada 24 horas
#
# ### Unwanted
# - El sistema NO DEBE re-descargar datos sin cambios
# - El sistema NO DEBE perder transacciones
#
# **Prioridades:**
# ```yaml
# sync_priorities:
#   high:
#     tables: [DEVICE_ORDER, DEVICE_ORDERDETAIL]
#     interval: 5m
#   medium:
#     tables: [DEVICE_PRODUCT, DEVICE_PRODUCT_PRICE]
#     interval: 2h
#   low:
#     tables: [DEVICE_CUSTOMER]
#     interval: 24h
# ```
#
# **Agente Asignado:** @kamaleon-sync
```

---

# /moai:2-run - Ejecución TDD

## Descripción
Comando para ejecutar implementación TDD guiada por agentes.

## Sintaxis

```bash
/moai:2-run [SPEC-ID] [options]
```

## Opciones

| Opción | Descripción |
|--------|-------------|
| `--agent` | Agente específico a usar |
| `--dry-run` | Simular sin escribir código |
| `--continue` | Continuar desde última pausa |
| `--skip-tests` | Omitir ejecución de tests (no recomendado) |
| `--verbose` | Output detallado |

---

## Ejemplos por Componente

### Dashboard Frontend

```bash
/moai:2-run SPEC-DASH-F002 --agent @dashboard-fe-lead --verbose

# Output:
# ════════════════════════════════════════════════════════════════
#                    EJECUTANDO SPEC-DASH-F002
#                    Agente: @dashboard-fe-lead
# ════════════════════════════════════════════════════════════════
#
# Cargando contexto del proyecto...
# ✓ React 18.2.0 detectado
# ✓ TypeScript 5.3 configurado
# ✓ Jest + Testing Library configurados
#
# ══════════════════ FASE RED ══════════════════
#
# Generando tests que deben fallar...
#
# [1/5] Creando test: Canvas renderiza correctamente
# 📝 __tests__/FeatureBuilder/Canvas.test.tsx
#
# ```typescript
# import { render, screen } from '@testing-library/react';
# import { Canvas } from './Canvas';
#
# describe('Canvas', () => {
#   it('renders empty canvas with drop zone', () => {
#     render(<Canvas components={[]} onDrop={jest.fn()} />);
#     expect(screen.getByTestId('canvas')).toBeInTheDocument();
#     expect(screen.getByText('Arrastra componentes aquí')).toBeVisible();
#   });
# });
# ```
#
# Ejecutando test...
# ❌ FAIL: Cannot find module './Canvas'
#
# [2/5] Creando test: Dropdown se agrega al canvas
# 📝 __tests__/FeatureBuilder/Canvas.test.tsx (append)
#
# Ejecutando tests...
# ❌ FAIL: 2 tests fallando (esperado en fase RED)
#
# ══════════════════ FASE GREEN ══════════════════
#
# Implementando código mínimo para pasar tests...
#
# [1/5] Creando componente Canvas
# 📝 src/components/FeatureBuilder/Canvas.tsx
#
# ```typescript
# import { FC } from 'react';
# import { useDrop } from 'react-dnd';
#
# interface CanvasProps {
#   components: ComponentDefinition[];
#   onDrop: (item: DragItem) => void;
# }
#
# export const Canvas: FC<CanvasProps> = ({ components, onDrop }) => {
#   const [{ isOver }, dropRef] = useDrop({
#     accept: 'COMPONENT',
#     drop: (item: DragItem) => onDrop(item),
#     collect: (monitor) => ({
#       isOver: monitor.isOver()
#     })
#   });
#
#   return (
#     <div
#       ref={dropRef}
#       data-testid="canvas"
#       className={`canvas ${isOver ? 'canvas--hover' : ''}`}
#     >
#       {components.length === 0 ? (
#         <p>Arrastra componentes aquí</p>
#       ) : (
#         components.map(comp => (
#           <CanvasComponent key={comp.id} component={comp} />
#         ))
#       )}
#     </div>
#   );
# };
# ```
#
# Ejecutando tests...
# ✅ PASS: 2/2 tests pasando
#
# [Continúa con más implementaciones...]
#
# ══════════════════ FASE REFACTOR ══════════════════
#
# Optimizando código...
#
# [1/3] Aplicando memoización
# 📝 Modificando Canvas.tsx
# - Agregando React.memo al componente
# - Usando useCallback para handlers
#
# [2/3] Extrayendo tipos
# 📝 Creando src/types/canvas.ts
#
# [3/3] Optimizando re-renders
# 📝 Usando Zustand selector
#
# ══════════════════ RESUMEN ══════════════════
#
# ✅ Tests: 12/12 pasando
# ✅ Coverage: 85%
# ✅ Lint: 0 errores
# ✅ TypeScript: compilando sin errores
#
# Archivos creados/modificados:
# + src/components/FeatureBuilder/Canvas.tsx
# + src/components/FeatureBuilder/Toolbox.tsx
# + src/components/FeatureBuilder/index.tsx
# + src/stores/manifestStore.ts
# + src/types/canvas.ts
# + __tests__/FeatureBuilder/*.test.tsx
#
# Siguiente paso:
# /moai:3-sync
```

---

### Dashboard Backend

```bash
/moai:2-run SPEC-DASH-B002 --agent @dashboard-be-lead

# Output:
# ════════════════════════════════════════════════════════════════
#                    EJECUTANDO SPEC-DASH-B002
#                    Agente: @dashboard-be-lead
# ════════════════════════════════════════════════════════════════
#
# ══════════════════ FASE RED ══════════════════
#
# [1/8] Test: POST /manifests crea manifiesto
# 📝 src/modules/manifest/__tests__/manifest.controller.spec.ts
#
# ```typescript
# describe('ManifestController', () => {
#   describe('POST /manifests', () => {
#     it('should create manifest and return 201', async () => {
#       const dto = { name: 'Test', components: [] };
#
#       const response = await request(app.getHttpServer())
#         .post('/manifests')
#         .send(dto)
#         .expect(201);
#
#       expect(response.body).toHaveProperty('id');
#       expect(response.body.version).toBe('1.0.0');
#     });
#   });
# });
# ```
#
# ❌ FAIL: Cannot resolve 'ManifestController'
#
# ══════════════════ FASE GREEN ══════════════════
#
# [1/8] Creando entidad
# 📝 src/modules/manifest/entities/manifest.entity.ts
#
# ```typescript
# @Entity()
# export class Manifest {
#   @PrimaryGeneratedColumn('uuid')
#   id: string;
#
#   @Column()
#   name: string;
#
#   @Column('jsonb')
#   components: object[];
#
#   @Column({ default: '1.0.0' })
#   version: string;
#
#   @CreateDateColumn()
#   createdAt: Date;
#
#   @Column({ default: 'draft' })
#   status: 'draft' | 'published';
# }
# ```
#
# [2/8] Creando DTO
# 📝 src/modules/manifest/dto/create-manifest.dto.ts
#
# [3/8] Creando servicio
# 📝 src/modules/manifest/manifest.service.ts
#
# [4/8] Creando controller
# 📝 src/modules/manifest/manifest.controller.ts
#
# Ejecutando tests...
# ✅ PASS: 8/8 tests pasando
#
# ══════════════════ MIGRACIÓN ══════════════════
#
# Generando migración de base de datos...
# 📝 migrations/1704384000000-CreateManifestTable.ts
#
# ```typescript
# export class CreateManifestTable1704384000000 implements MigrationInterface {
#   async up(queryRunner: QueryRunner): Promise<void> {
#     await queryRunner.createTable(new Table({
#       name: 'manifest',
#       columns: [
#         { name: 'id', type: 'uuid', isPrimary: true },
#         { name: 'name', type: 'varchar' },
#         { name: 'components', type: 'jsonb' },
#         { name: 'version', type: 'varchar', default: "'1.0.0'" },
#         { name: 'status', type: 'varchar', default: "'draft'" },
#         { name: 'created_at', type: 'timestamp', default: 'now()' }
#       ]
#     }));
#   }
# }
# ```
```

---

### Guardian IA

```bash
/moai:2-run SPEC-AI-001 --agent @kamaleon-guardian

# Output:
# ════════════════════════════════════════════════════════════════
#                    EJECUTANDO SPEC-AI-001
#                    Agente: @kamaleon-guardian
# ════════════════════════════════════════════════════════════════
#
# ══════════════════ FASE RED ══════════════════
#
# [1/6] Test: Bloquea DROP TABLE
# 📝 tests/test_guardian.py
#
# ```python
# def test_blocks_drop_table():
#     query = "DROP TABLE DEVICE_CUSTOMER"
#     result = guardian.validate(query)
#     assert result.approved == False
#     assert "destructive" in result.reason.lower()
# ```
#
# [2/6] Test: Detecta SQL injection
# [3/6] Test: Aprueba SELECT seguro
# [4/6] Test: Detecta violación de política
# [5/6] Test: Consulta RAG para contexto
# [6/6] Test: Latencia < 1 segundo
#
# ══════════════════ FASE GREEN ══════════════════
#
# [1/4] Implementando analizador de patrones
# 📝 guardian/pattern_analyzer.py
#
# ```python
# class PatternAnalyzer:
#     DANGEROUS_PATTERNS = [
#         r'\bDROP\s+TABLE\b',
#         r'\bTRUNCATE\b',
#         r'\bALTER\s+TABLE\b',
#         r';\s*--',
#         r'\bDELETE\s+FROM\s+\w+\s*$'
#     ]
#
#     def analyze(self, query: str) -> AnalysisResult:
#         for pattern in self.DANGEROUS_PATTERNS:
#             if re.search(pattern, query, re.IGNORECASE):
#                 return AnalysisResult(
#                     safe=False,
#                     threat="destructive_pattern",
#                     pattern_matched=pattern
#                 )
#         return AnalysisResult(safe=True)
# ```
#
# [2/4] Implementando servicio RAG
# 📝 guardian/rag_service.py
#
# [3/4] Implementando validador principal
# 📝 guardian/validator.py
#
# [4/4] Integrando con API
# 📝 guardian/api.py
#
# ✅ Tests: 6/6 pasando
# ✅ Coverage: 92%
```

---

### Mobile App (Kotlin)

```bash
/moai:2-run SPEC-APP-F001 --agent @app-fe-lead

# Output:
# ════════════════════════════════════════════════════════════════
#                    EJECUTANDO SPEC-APP-F001
#                    Agente: @app-fe-lead
# ════════════════════════════════════════════════════════════════
#
# ══════════════════ FASE RED ══════════════════
#
# [1/5] Test: Renderiza dropdown desde JSON
# 📝 app/src/test/kotlin/SDUIRendererTest.kt
#
# ```kotlin
# @Test
# fun `renders dropdown from JSON manifest`() {
#     val manifest = """{"components":[{"type":"dropdown","id":"cbo_test"}]}"""
#
#     composeTestRule.setContent {
#         SDUIRenderer(manifest = manifest)
#     }
#
#     composeTestRule
#         .onNodeWithTag("dropdown_cbo_test")
#         .assertIsDisplayed()
# }
# ```
#
# ══════════════════ FASE GREEN ══════════════════
#
# [1/5] Creando parser de manifiestos
# 📝 app/src/main/kotlin/sdui/ManifestParser.kt
#
# ```kotlin
# object ManifestParser {
#     private val json = Json { ignoreUnknownKeys = true }
#
#     fun parse(jsonString: String): Manifest {
#         return json.decodeFromString<Manifest>(jsonString)
#     }
# }
# ```
#
# [2/5] Creando componentes SDUI
# 📝 app/src/main/kotlin/sdui/components/SDUIDropdown.kt
#
# ```kotlin
# @Composable
# fun SDUIDropdown(
#     id: String,
#     label: String,
#     dataSource: DataSourceConfig,
#     modifier: Modifier = Modifier
# ) {
#     var expanded by remember { mutableStateOf(false) }
#     val options by loadOptions(dataSource).collectAsState(initial = emptyList())
#
#     ExposedDropdownMenuBox(
#         expanded = expanded,
#         onExpandedChange = { expanded = it },
#         modifier = modifier.testTag("dropdown_$id")
#     ) {
#         // Implementation...
#     }
# }
# ```
#
# [3/5] Creando renderer principal
# 📝 app/src/main/kotlin/sdui/SDUIRenderer.kt
#
# ✅ Tests: 5/5 pasando
# ✅ UI Tests: 3/3 pasando
# ✅ Performance: 60fps verificado
```

---

# /moai:3-sync - Verificación y Sincronización

## Descripción
Comando para verificar calidad, sincronizar cambios y preparar para integración.

## Sintaxis

```bash
/moai:3-sync [options]
```

## Opciones

| Opción | Descripción |
|--------|-------------|
| `--spec` | SPEC específico a verificar |
| `--commit` | Crear commit automático |
| `--pr` | Crear Pull Request |
| `--deploy` | Trigger deployment |
| `--report` | Generar reporte completo |

---

## Ejemplos

### Verificación Completa

```bash
/moai:3-sync --report

# Output:
# ════════════════════════════════════════════════════════════════
#                    VERIFICACIÓN Y SYNC
# ════════════════════════════════════════════════════════════════
#
# ══════════════════ QUALITY GATES ══════════════════
#
# ┌─────────────────────┬──────────┬──────────┬────────┐
# │ Métrica             │ Actual   │ Target   │ Status │
# ├─────────────────────┼──────────┼──────────┼────────┤
# │ Test Coverage       │ 85%      │ 80%      │ ✅     │
# │ Lint Errors         │ 0        │ 0        │ ✅     │
# │ TypeScript Errors   │ 0        │ 0        │ ✅     │
# │ Security Issues     │ 0        │ 0        │ ✅     │
# │ Build Time          │ 4m 32s   │ < 10m    │ ✅     │
# └─────────────────────┴──────────┴──────────┴────────┘
#
# ══════════════════ TESTS ══════════════════
#
# Dashboard Frontend:
# ✅ Unit Tests: 45/45 passing
# ✅ Integration: 12/12 passing
#
# Dashboard Backend:
# ✅ Unit Tests: 78/78 passing
# ✅ E2E: 23/23 passing
#
# Mobile App:
# ✅ Unit Tests: 56/56 passing
# ✅ UI Tests: 15/15 passing
#
# ══════════════════ DOCUMENTACIÓN ══════════════════
#
# ✅ SPEC-DASH-F002 actualizado con implementación
# ✅ API docs generados (OpenAPI 3.0)
# ✅ Changelog actualizado
#
# ══════════════════ RESUMEN ══════════════════
#
# ✅ Todos los quality gates pasando
# ✅ 0 issues bloqueantes
# ✅ Listo para PR
#
# Siguiente paso:
# /moai:3-sync --pr
```

---

### Crear Pull Request

```bash
/moai:3-sync --pr

# Output:
# ════════════════════════════════════════════════════════════════
#                    CREANDO PULL REQUEST
# ════════════════════════════════════════════════════════════════
#
# Branch: feature/SPEC-DASH-F002-feature-builder
# Target: develop
#
# Generando descripción del PR...
#
# ══════════════════ PR CREADO ══════════════════
#
# Title: feat(dashboard): Implement Feature Builder IDE (SPEC-DASH-F002)
#
# Description:
# ## Summary
# Implementa el Feature Builder, un IDE visual para crear módulos de
# la aplicación móvil mediante drag-and-drop.
#
# ## Changes
# - Nuevo componente FeatureBuilder con canvas y toolbox
# - Store Zustand para gestión de manifiestos
# - Integración con Guardian IA para validación SQL
# - Preview en tiempo real
#
# ## SPEC Reference
# - SPEC-DASH-F002: Feature Builder - IDE Visual
#
# ## Test Coverage
# - Unit Tests: 45 nuevos (100% passing)
# - Integration Tests: 12 nuevos (100% passing)
# - Coverage: 85%
#
# ## Screenshots
# [Preview del Feature Builder]
#
# ## Checklist
# - [x] Tests passing
# - [x] Coverage > 80%
# - [x] No lint errors
# - [x] Documentation updated
#
# PR URL: https://github.com/softvibeslab/kamaleon/pull/42
#
# Reviewers asignados:
# - @tech-lead
# - @frontend-lead
```

---

### Deploy a Staging

```bash
/moai:3-sync --deploy staging

# Output:
# ════════════════════════════════════════════════════════════════
#                    DEPLOYMENT A STAGING
# ════════════════════════════════════════════════════════════════
#
# Verificando pre-requisitos...
# ✅ Tests pasando
# ✅ Build exitoso
# ✅ No conflictos pendientes
# ✅ PR aprobado
#
# Iniciando deployment...
#
# [1/4] Building Docker images...
# ✅ dashboard-fe:1.2.0 built
# ✅ dashboard-be:1.2.0 built
#
# [2/4] Pushing to registry...
# ✅ Images pushed to gcr.io/kamaleon
#
# [3/4] Deploying to Kubernetes...
# ✅ dashboard-fe deployment updated
# ✅ dashboard-be deployment updated
#
# [4/4] Running smoke tests...
# ✅ Health check passed
# ✅ API endpoints responding
# ✅ UI accessible
#
# ══════════════════ DEPLOYMENT EXITOSO ══════════════════
#
# Environment: staging
# URL: https://staging.kamaleon.example.com
# Version: 1.2.0
# Deployed at: 2024-01-04 15:30:00 UTC
#
# Próximo paso:
# - Verificar manualmente en staging
# - Ejecutar tests de aceptación
# - Aprobar para producción
```

---

## Resumen de Comandos

```bash
# ════════════════════════════════════════════════════════════════
#                    QUICK REFERENCE
# ════════════════════════════════════════════════════════════════

# INICIALIZACIÓN
/moai:0-project --init                    # Inicializar proyecto
/moai:0-project --analyze                 # Analizar estado
/moai:0-project --status                  # Ver estado actual
/moai:0-project --configure               # Configurar MoAI-ADK

# PLANIFICACIÓN
/moai:1-plan "descripción"                # Crear nuevo SPEC
/moai:1-plan "desc" --component X         # SPEC para componente específico

# EJECUCIÓN
/moai:2-run SPEC-XXX                      # Ejecutar implementación TDD
/moai:2-run SPEC-XXX --agent @X           # Con agente específico
/moai:2-run SPEC-XXX --continue           # Continuar donde quedó
/moai:2-run SPEC-XXX --dry-run            # Simular sin escribir

# SINCRONIZACIÓN
/moai:3-sync                              # Verificar calidad
/moai:3-sync --report                     # Reporte completo
/moai:3-sync --pr                         # Crear Pull Request
/moai:3-sync --deploy staging             # Deploy a staging
/moai:3-sync --deploy production          # Deploy a producción
```

---

## Referencias

- **SPEC Documentation:** [01-SPEC-EARS-Ecosistema-Kamaleon.md](./01-SPEC-EARS-Ecosistema-Kamaleon.md)
- **Agent Documentation:** [02-MrAlfred-Agentes-Ecosistema.md](./02-MrAlfred-Agentes-Ecosistema.md)
- **Workflow Documentation:** [03-Development-Workflow-Ecosistema.md](./03-Development-Workflow-Ecosistema.md)
- **MoAI-ADK Framework:** https://github.com/softvibeslab/moai-adk
