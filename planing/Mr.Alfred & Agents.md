# Mr. Alfred & Sistema de Agentes - Proyecto Kamaleon

## Overview

**Mr. Alfred** es el orquestador principal del framework MoAI-ADK. Analiza solicitudes, delega a agentes especializados e integra resultados para entregar soluciones completas.

---

## 1. Arquitectura de Agentes (5 Tiers)

```
┌─────────────────────────────────────────────────────────────────┐
│                        MR. ALFRED                                │
│                   (Chief Orchestrator)                           │
│         Analiza → Delega → Integra → Entrega                    │
└─────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│   TIER 1      │    │   TIER 2      │    │   TIER 3      │
│ Domain Experts│    │  Workflow     │    │Meta-Generators│
└───────────────┘    │  Managers     │    └───────────────┘
        │            └───────────────┘            │
        ▼                     │                   ▼
┌───────────────┐            ▼           ┌───────────────┐
│   TIER 4      │    ┌───────────────┐   │   TIER 5      │
│MCP Integrators│    │ Quality Gates │   │  AI Services  │
└───────────────┘    └───────────────┘   └───────────────┘
```

---

## 2. Tier 1: Domain Experts (Expertos de Dominio)

Agentes especializados en tecnologías específicas:

| Agente | Rol | Aplicación en Kamaleon |
|--------|-----|------------------------|
| `@backend` | APIs, servicios, lógica servidor | Middleware Gateway, Sync Engine |
| `@frontend` | UI/UX, componentes visuales | Feature Builder, Ticket Designer |
| `@database` | Modelado, queries, migraciones | SQLite DEVICE_*, Guardian IA |
| `@security` | Auth, encriptación, validación | Guardian IA, Certificate Pinning |
| `@devops` | CI/CD, deployment, infraestructura | Release CI/CD, Multi-Tenant |
| `@ui-ux` | Design systems, accesibilidad | Material Design 3, Figma MCP |
| `@debugging` | Análisis de errores, profiling | Telemetría, error tracking |

### Ejemplo de Invocación

```bash
# Solicitar ayuda de backend para API Gateway
> @backend Diseñar endpoint para validación RENIEC con timeout 2s

# Solicitar análisis de seguridad para Guardian IA
> @security Revisar validación de queries SQL contra inyección
```

---

## 3. Tier 2: Workflow Managers (Gestores de Flujo)

Agentes que gestionan procesos de desarrollo:

| Agente | Función | Aplicación en Kamaleon |
|--------|---------|------------------------|
| `@spec-writer` | Genera documentos SPEC en formato EARS | Definir requisitos de módulos |
| `@tdd-runner` | Ejecuta ciclo Red-Green-Refactor | Implementar features con tests |
| `@doc-gen` | Genera documentación automática | API docs, README, CHANGELOG |
| `@qa-verifier` | Valida calidad y cobertura | Code review, test coverage |

### Flujo de Trabajo TDD

```
@spec-writer          @tdd-runner           @qa-verifier
     │                     │                      │
     ▼                     ▼                      ▼
┌─────────┐          ┌─────────┐           ┌─────────┐
│  SPEC   │──────────│  RED    │───────────│ VERIFY  │
│ Created │          │ (Test)  │           │ Quality │
└─────────┘          └─────────┘           └─────────┘
                           │
                           ▼
                     ┌─────────┐
                     │  GREEN  │
                     │ (Code)  │
                     └─────────┘
                           │
                           ▼
                     ┌─────────┐
                     │REFACTOR │
                     │(Improve)│
                     └─────────┘
```

---

## 4. Tier 3: Meta-Generators (Generadores)

Agentes que crean nuevos agentes y extensiones:

| Agente | Capacidad | Uso |
|--------|-----------|-----|
| `@agent-creator` | Crear nuevos agentes especializados | Agente específico para Kamaleon |
| `@skill-builder` | Definir nuevas habilidades | Skills de validación SQL |
| `@command-gen` | Generar comandos personalizados | Comandos específicos del proyecto |

### Crear Agente Personalizado para Kamaleon

```yaml
# Definición de agente Guardian IA
agent:
  name: "@guardian-ia"
  tier: 1
  domain: "sql-security"
  capabilities:
    - validate_sql_queries
    - detect_injection_patterns
    - enforce_policy_rules
  integrations:
    - rag_knowledge_base
    - policy_vectors
  constraints:
    max_validation_time: "1s"
    false_positive_rate: "<0.1%"
```

---

## 5. Tier 4: MCP Integrators (Integradores de Contexto)

Agentes que conectan con fuentes externas de conocimiento:

| Agente | Integración | Aplicación en Kamaleon |
|--------|-------------|------------------------|
| `@docs-lookup` | Documentación técnica | Android Docs, Compose API |
| `@reasoner` | Análisis lógico complejo | Validación de reglas de negocio |
| `@web-automation` | Navegación y scraping | Verificar servicios externos |
| `@design-system` | Figma MCP, tokens | Material Design 3 integration |

### Integración Figma MCP para Kamaleon

```javascript
// Flujo: Figma → JSON → Feature Builder
const figmaMCP = {
  server: "figma-mcp-server",
  actions: [
    "get_file_info",
    "get_node_details",
    "export_design_tokens"
  ],
  mapping: {
    "Frame[AutoLayout:vertical]": "vertical_stack",
    "Instance[ProductCard]": "product_card",
    "sys.color.primary": "MaterialTheme.colorScheme.primary"
  }
};
```

---

## 6. Tier 5: AI Services (Servicios de IA)

| Servicio | Función | Aplicación |
|----------|---------|------------|
| `@image-gen` | Generación de imágenes | Assets, mockups |
| `@code-completion` | Autocompletado inteligente | Kotlin/Compose |
| `@translation` | Multi-idioma | Internacionalización |

---

## 7. Configuración de Agentes para Kamaleon

### Archivo: `.moai/agents.yaml`

```yaml
# Configuración de Mr. Alfred para Proyecto Kamaleon
project:
  name: "Kamaleon"
  type: "android-sdui"
  framework: "jetpack-compose"

mr_alfred:
  default_agents:
    - "@backend"
    - "@frontend"
    - "@database"
    - "@security"

  custom_agents:
    - name: "@kamaleon-guardian"
      base: "@security"
      specialization: "sql-validation-rag"
      knowledge_base: "./research/*.pdf"

    - name: "@kamaleon-sync"
      base: "@backend"
      specialization: "offline-first-sync"
      tables:
        - DEVICE_ORDER
        - DEVICE_CUSTOMER
        - DEVICE_PRODUCT

routing_rules:
  - pattern: "SQL|query|injection"
    agent: "@kamaleon-guardian"

  - pattern: "sync|offline|delta"
    agent: "@kamaleon-sync"

  - pattern: "UI|component|render"
    agent: "@frontend"

  - pattern: "RENIEC|Gateway|API"
    agent: "@backend"
```

---

## 8. Comandos de Interacción con Agentes

### Invocar Agente Específico

```bash
# Sintaxis: @[agente] [solicitud]
> @backend Implementar endpoint /api/validate-dni con RENIEC

# Con contexto de archivo
> @database @file:schema.sql Optimizar índices para DEVICE_ORDER
```

### Encadenar Agentes

```bash
# Pipeline: spec → implement → test
> @spec-writer SPEC para validación RENIEC
> @tdd-runner Implementar SPEC-KML-002
> @qa-verifier Verificar cobertura de SPEC-KML-002
```

### Consultar Estado

```bash
> /agents list        # Ver agentes disponibles
> /agents status      # Estado de agentes activos
> /agents history     # Historial de delegaciones
```

---

## 9. Mapeo de Módulos Kamaleon → Agentes

| Módulo Kamaleon | Agente Principal | Agentes Secundarios |
|-----------------|------------------|---------------------|
| Feature Builder | `@frontend` | `@design-system`, `@database` |
| Guardian IA | `@security` | `@database`, `@reasoner` |
| Middleware Gateway | `@backend` | `@security`, `@devops` |
| Sync Engine | `@backend` | `@database`, `@devops` |
| Ticket Designer | `@frontend` | `@backend` |
| Release CI/CD | `@devops` | `@qa-verifier` |
| Cerebros AI (n8n) | `@backend` | `@reasoner` |

---

## 10. Flujo de Resolución de Mr. Alfred

```
Usuario: "Implementar validación de DNI con RENIEC"
           │
           ▼
    ┌──────────────┐
    │  MR. ALFRED  │
    │   Análisis   │
    └──────────────┘
           │
           ▼
    ┌──────────────────────────────────────┐
    │ Detectado: API + Validación + Seguridad │
    └──────────────────────────────────────┘
           │
    ┌──────┼──────┐
    ▼      ▼      ▼
┌──────┐┌──────┐┌──────┐
│@back-││@secu-││@spec-│
│end   ││rity  ││writer│
└──────┘└──────┘└──────┘
    │      │      │
    └──────┼──────┘
           ▼
    ┌──────────────┐
    │  Integración │
    │   de Results │
    └──────────────┘
           │
           ▼
    ┌──────────────┐
    │   Entrega:   │
    │ - SPEC-002   │
    │ - Código     │
    │ - Tests      │
    └──────────────┘
```

---

## Referencias

- **MoAI-ADK Repository:** https://github.com/softvibeslab/moai-adk
- **Arquitectura Kamaleon:** [Análisis de Sistema Kamaleon.pdf](../research/)
