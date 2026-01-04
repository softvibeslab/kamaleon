# SPEC & EARS Format - Proyecto Kamaleon

## Overview del Framework MoAI-ADK

**MoAI-ADK** (Agentic AI-Based SPEC-First TDD Development Framework) es un framework de desarrollo que utiliza especificaciones formales (SPEC) con sintaxis EARS para guiar el desarrollo mediante TDD automatizado con agentes de IA.

---

## 1. Formato SPEC (Specification)

Cada SPEC debe contener las siguientes secciones:

### Estructura Base de un SPEC

```yaml
SPEC-[ID]: [Título Descriptivo]
├── Description      # Qué debe hacer el sistema
├── Requirements     # Requisitos en formato EARS
├── Constraints      # Limitaciones técnicas/negocio
├── Success Criteria # Criterios de aceptación medibles
└── Test Scenarios   # Casos de prueba específicos
```

### Ejemplo de SPEC para Kamaleon

```markdown
## SPEC-KML-001: Renderizado Dinámico de UI Server-Driven

**Description:**
El sistema debe renderizar interfaces móviles desde manifiestos JSON
enviados por el servidor Kamaleon, eliminando la necesidad de releases
binarios para cambios de UI.

**Requirements (EARS):**
- (Ubiquitous): El sistema SIEMPRE debe renderizar componentes
  basándose en el "Manifiesto JSON" recibido durante sincronización.
- (Event-driven): CUANDO un dropdown es instanciado, ENTONCES ejecutar
  la query SQL definida en `data_source.query` contra SQLite local.
- (State-driven): SI la query contiene `@current_client_type`, ENTONCES
  inyectar el valor de sesión del usuario antes de ejecución.
- (Unwanted): El sistema NO DEBE ejecutar queries no validadas por Guardian IA.

**Constraints:**
- Latencia de renderizado: < 100ms para mantener 60fps
- Disponibilidad: UI funcional 100% en modo Offline
- Compatibilidad: SQLite local (tablas DEVICE_*)

**Success Criteria:**
- [ ] Dropdown muestra opciones diferentes por tipo de usuario (Retail vs Distribuidor)
- [ ] Cero excepciones "Table not found" en producción
- [ ] Tiempo de respuesta < 100ms en dispositivos de gama media

**Test Scenarios:**
- TC-001: Context Injection - Verificar polimorfismo de UI por rol
- TC-002: Offline Resilience - Datos cargan sin conexión
- TC-003: Query Validation - Rechazar queries no autorizadas
```

---

## 2. Sintaxis EARS (Easy Approach to Requirements Syntax)

EARS proporciona 5 patrones para escribir requisitos no ambiguos:

### 2.1 Ubiquitous (Siempre Activo)

**Patrón:** `El sistema SIEMPRE debe [acción]`

**Cuándo usar:** Requisitos que aplican en todo momento, sin condiciones.

```
✓ "El sistema SIEMPRE debe validar queries SQL antes de ejecución"
✓ "El sistema SIEMPRE debe cifrar datos sensibles en SQLite"
✓ "El sistema SIEMPRE debe registrar logs de sincronización"
```

### 2.2 Event-Driven (Basado en Eventos)

**Patrón:** `CUANDO [trigger/evento], ENTONCES el sistema debe [respuesta]`

**Cuándo usar:** Requisitos que responden a eventos específicos.

```
✓ "CUANDO el usuario sale del campo DNI (ON_EXIT), ENTONCES invocar Service.RENIEC"
✓ "CUANDO se detecta conexión WiFi, ENTONCES iniciar sincronización delta"
✓ "CUANDO el pedido excede $10k, ENTONCES activar validación crediticia"
```

### 2.3 State-Driven (Basado en Estado)

**Patrón:** `SI [condición/estado], ENTONCES el sistema debe [comportamiento]`

**Cuándo usar:** Requisitos que dependen del estado actual del sistema.

```
✓ "SI el cliente es VIP, ENTONCES aplicar descuento automático del 5%"
✓ "SI la tabla es DEVICE_ORDER, ENTONCES sincronizar cada 5 minutos"
✓ "SI el servicio retorna valid:false, ENTONCES bloquear envío del formulario"
```

### 2.4 Unwanted Behavior (Comportamiento No Deseado)

**Patrón:** `El sistema NO DEBE [acción prohibida]`

**Cuándo usar:** Restricciones de seguridad, rendimiento o negocio.

```
✓ "El sistema NO DEBE permitir DROP TABLE en queries remotas"
✓ "El sistema NO DEBE sincronizar datos sin validación de Guardian IA"
✓ "El sistema NO DEBE almacenar credenciales en texto plano"
```

### 2.5 Optional (Condicional/Opcional)

**Patrón:** `DONDE SEA POSIBLE, el sistema debe [característica opcional]`

**Cuándo usar:** Mejoras deseables pero no críticas.

```
✓ "DONDE SEA POSIBLE, autocompletar nombre desde respuesta RENIEC"
✓ "DONDE SEA POSIBLE, pre-cargar catálogo en background"
✓ "DONDE SEA POSIBLE, mostrar preview del ticket antes de impresión"
```

---

## 3. Plantilla de SPEC para Kamaleon

```markdown
# SPEC-KML-[XXX]: [Título]

## Descripción
[Párrafo describiendo el objetivo y contexto del requisito]

## Requirements (EARS)

### Ubiquitous
- El sistema SIEMPRE debe [...]

### Event-Driven
- CUANDO [...], ENTONCES [...]

### State-Driven
- SI [...], ENTONCES [...]

### Unwanted
- El sistema NO DEBE [...]

### Optional
- DONDE SEA POSIBLE, [...]

## Constraints
| Constraint | Valor | Justificación |
|------------|-------|---------------|
| Latencia   | <Xms  | [razón]       |
| Timeout    | Xs    | [razón]       |

## Success Criteria
- [ ] Criterio 1 medible
- [ ] Criterio 2 medible
- [ ] Criterio N medible

## Test Scenarios

### TC-[XXX]-01: [Nombre del Test]
- **Precondición:** [estado inicial]
- **Input:** [acción/datos de entrada]
- **Expected:** [resultado esperado]
- **Actual:** [a completar durante testing]
```

---

## 4. SPECs Identificados para Kamaleon

Basado en el análisis del sistema Kamaleon, se identifican los siguientes módulos SPEC:

| SPEC ID | Módulo | Descripción |
|---------|--------|-------------|
| KML-001 | Feature Builder | Renderizado dinámico de UI (Server-Driven) |
| KML-002 | Gateway | Validación síncrona de identidad (RENIEC) |
| KML-003 | Guardian IA | Firewall de código SQL con RAG |
| KML-004 | Ticket Designer | Generación dinámica de tickets térmicos |
| KML-005 | Sync Engine | Sincronización diferencial priorizada |
| KML-006 | Multi-Tenant | Gestión de clientes y configuraciones |
| KML-007 | Cerebros AI | Integración n8n y agentes autónomos |
| KML-008 | Release CI/CD | Versionado y despliegue de módulos |

---

## 5. Mapeo Kamaleon → EARS Patterns

### Componentes del Dashboard Kamaleon

| Componente | EARS Pattern | Ejemplo |
|------------|--------------|---------|
| Dropdown SQL | Event-Driven | CUANDO se instancia, ENTONCES ejecutar query |
| Trigger RENIEC | Event-Driven | CUANDO ON_EXIT(dni), ENTONCES validar |
| Guardian IA | Ubiquitous + Unwanted | SIEMPRE validar / NO DEBE permitir DROP |
| Sync Engine | State-Driven | SI tabla=ORDER, ENTONCES sync cada 5m |
| Ticket Generator | Event-Driven | CUANDO tipo=qr_code, ENTONCES generar bitmap |

---

## 6. Checklist de Validación SPEC

Antes de aprobar un SPEC, verificar:

- [ ] ¿Cada requisito usa exactamente UN patrón EARS?
- [ ] ¿Los requisitos son atómicos (un solo comportamiento)?
- [ ] ¿Los criterios de éxito son medibles y verificables?
- [ ] ¿Los test scenarios cubren happy path + edge cases?
- [ ] ¿Las constraints tienen valores numéricos específicos?
- [ ] ¿Se identificaron todos los comportamientos "Unwanted"?

---

## Referencias

- **Análisis Kamaleon:** [Análisis de Sistema Kamaleon.pdf](../research/)
- **Especificaciones Técnicas:** [Especificaciones Técnicas SPEC & EARS.pdf](../research/)
- **Dashboard Screenshots:** [dashboard/](../dashboard/)
- **MoAI-ADK Repository:** https://github.com/softvibeslab/moai-adk
