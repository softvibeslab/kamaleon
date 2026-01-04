# Core Commands - MoAI-ADK (/moai:0-3)

## Quick Reference

| Comando | Función | Tiempo |
|---------|---------|--------|
| `/moai:0-project` | Inicializar/analizar proyecto | 2-5 min |
| `/moai:1-plan` | Generar SPEC con EARS | 5-10 min |
| `/moai:2-run` | Ejecutar ciclo TDD | 20-40 min |
| `/moai:3-sync` | Verificar y documentar | 5-10 min |

---

## /moai:0-project — Inicialización de Proyecto

### Propósito
Genera metadatos del proyecto, analiza estructura, detecta lenguaje/framework y configura quality gates.

### Sintaxis

```bash
> /moai:0-project [opciones]
```

### Opciones

| Opción | Descripción |
|--------|-------------|
| `--analyze` | Solo analizar, no modificar |
| `--init` | Inicializar configuración MoAI |
| `--update` | Actualizar configuración existente |

### Ejemplo para Kamaleon

```bash
> /moai:0-project --init

🔍 Analyzing project structure...

📁 Project: Kamaleon
├── Type: Android Native (Kotlin)
├── Framework: Jetpack Compose
├── Build: Gradle (Kotlin DSL)
├── Min SDK: 24
├── Target SDK: 34
└── Architecture: SDUI (Server-Driven UI)

📦 Dependencies detected:
├── androidx.compose:*
├── kotlinx.serialization
├── retrofit2
├── room
└── hilt

🎯 Quality Gates configured:
├── Test Coverage: 80%
├── Lint: Android Lint + Detekt
├── Security: dependency-check
└── Docs: KDoc required

✅ Created: .moai/config.yaml
✅ Created: .moai/agents.yaml
✅ Created: specs/
```

### Archivos Generados

```yaml
# .moai/config.yaml
project:
  name: "Kamaleon"
  type: "android"
  language: "kotlin"
  framework: "jetpack-compose"

quality_gates:
  coverage:
    minimum: 80
    tool: "jacoco"
  lint:
    tools: ["android-lint", "detekt"]
    fail_on_error: true
  security:
    scan: true
    tool: "dependency-check"

spec_format:
  syntax: "EARS"
  template: "default"
  output_dir: "specs/"

tdd:
  test_framework: "junit5"
  mock_framework: "mockk"
  assertion_library: "truth"
```

---

## /moai:1-plan — Generación de SPEC

### Propósito
Clarificar requisitos y generar documento SPEC en formato EARS con test scenarios.

### Sintaxis

```bash
> /moai:1-plan "descripción del feature"
> /moai:1-plan --from-issue ISSUE-123
> /moai:1-plan --interactive
```

### Opciones

| Opción | Descripción |
|--------|-------------|
| `--interactive` | Modo guiado con preguntas |
| `--from-issue` | Importar desde issue tracker |
| `--template` | Usar plantilla específica |
| `--output` | Directorio de salida |

### Ejemplo para Kamaleon

```bash
> /moai:1-plan "Implementar Guardian IA para validar queries SQL"

🎯 Analyzing requirement...

📋 Generated SPEC-KML-003: Guardian IA SQL Validation

## Descripción
El sistema debe validar todas las queries SQL enviadas al Feature Builder
utilizando análisis de intención con RAG antes de permitir su ejecución
en dispositivos móviles.

## Requirements (EARS)

### Ubiquitous
- El sistema SIEMPRE debe analizar queries SQL mediante Guardian IA
  antes de permitir distribución a dispositivos.

### Event-Driven
- CUANDO Guardian IA detecta patrones destructivos (DROP, TRUNCATE, ALTER),
  ENTONCES rechazar el release inmediatamente.
- CUANDO se detecta violación de política, ENTONCES registrar evento
  con contexto completo.

### State-Driven
- SI el script define reglas de negocio (descuentos, precios),
  ENTONCES el motor RAG debe consultar Base de Conocimiento Vectorial.
- SI el rol del desarrollador es "Junior",
  ENTONCES requerir aprobación adicional para tablas maestras.

### Unwanted
- NO DEBE permitir queries no validadas.
- NO DEBE tener latencia > 1.0s en validación.

### Optional
- DONDE SEA POSIBLE, sugerir corrección para queries rechazadas.

## Constraints
| Constraint | Valor | Justificación |
|------------|-------|---------------|
| Latencia | <1.0s | No bloquear CI/CD |
| False Positives | <0.1% | No impactar productividad |
| Tasa Aprobación | >95% | Baseline actual |

## Success Criteria
- [ ] 100% rechazo ante DROP TABLE
- [ ] Feedback en lenguaje natural explicando rechazo
- [ ] Latencia promedio <0.3s
- [ ] Integración con pipeline CI/CD

## Test Scenarios

### TC-003-01: Detección de DROP TABLE
- Precondición: Query contiene "DROP TABLE DEVICE_ORDER"
- Expected: Rechazo inmediato, evento "MOMOP TABLE detected"

### TC-003-02: Violación de Política de Descuento
- Precondición: Trigger con "SET discount = 0.50" (50%)
- Context: Política dice máximo 15%
- Expected: Rechazo con mensaje "Descuento excede límite 15%"

### TC-003-03: Query Válida
- Precondición: SELECT simple en DEVICE_PRODUCT
- Expected: Aprobación en <0.3s

---

✅ SPEC saved to: specs/SPEC-KML-003.md
📝 Awaiting approval before proceeding to RUN phase
```

### Flujo Interactivo

```bash
> /moai:1-plan --interactive

🎯 SPEC Generation Wizard

? What feature are you implementing?
> Validación de queries SQL con Guardian IA

? What is the main trigger for this feature?
> Cuando un desarrollador guarda una query en Feature Builder

? What should happen on success?
> La query se marca como validada y se permite distribución

? What should NOT happen?
> No debe permitir DROP, TRUNCATE o queries destructivas

? Are there any performance constraints?
> Latencia máxima de 1 segundo

? Any edge cases to consider?
> Timeout de servicio RAG, queries muy complejas

📋 Generating SPEC-KML-003...
```

---

## /moai:2-run — Ejecución TDD

### Propósito
Implementar código siguiendo ciclo Red → Green → Refactor basado en un SPEC aprobado.

### Sintaxis

```bash
> /moai:2-run SPEC-ID
> /moai:2-run SPEC-KML-003 --phase red
> /moai:2-run SPEC-KML-003 --continue
```

### Opciones

| Opción | Descripción |
|--------|-------------|
| `--phase` | Ejecutar fase específica (red/green/refactor) |
| `--continue` | Continuar desde última fase |
| `--skip-refactor` | Omitir fase de refactor |
| `--dry-run` | Mostrar plan sin ejecutar |

### Ejemplo para Kamaleon

```bash
> /moai:2-run SPEC-KML-003

🔴 RED PHASE - Writing Failing Tests
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Creating test file: GuardianIAValidatorTest.kt

```kotlin
@Test
fun `WHEN query contains DROP TABLE THEN reject immediately`() {
    // Given
    val query = "DROP TABLE DEVICE_ORDER"
    val validator = GuardianIAValidator(ragService, policyStore)

    // When
    val result = validator.validate(query)

    // Then
    assertThat(result.isRejected).isTrue()
    assertThat(result.reason).contains("MOMOP TABLE detected")
}

@Test
fun `WHEN discount exceeds policy limit THEN reject with explanation`() {
    // Given
    val trigger = "CREATE TRIGGER x AFTER UPDATE SET discount = 0.50"
    whenever(policyStore.getMaxDiscount()).thenReturn(0.15)

    // When
    val result = validator.validate(trigger)

    // Then
    assertThat(result.isRejected).isTrue()
    assertThat(result.reason).contains("Descuento excede límite 15%")
}

@Test
fun `WHEN valid SELECT query THEN approve within latency threshold`() {
    // Given
    val query = "SELECT * FROM DEVICE_PRODUCT WHERE active = 1"

    // When
    val (result, duration) = measureTimedValue {
        validator.validate(query)
    }

    // Then
    assertThat(result.isApproved).isTrue()
    assertThat(duration).isLessThan(300.milliseconds)
}
```

Running tests...
❌ 3 tests FAILED (expected)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🟢 GREEN PHASE - Implementing Code
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Creating: GuardianIAValidator.kt

```kotlin
class GuardianIAValidator(
    private val ragService: RAGService,
    private val policyStore: PolicyStore
) {
    private val destructivePatterns = listOf(
        "DROP\\s+TABLE",
        "TRUNCATE\\s+TABLE",
        "ALTER\\s+TABLE.*DROP"
    ).map { it.toRegex(RegexOption.IGNORE_CASE) }

    suspend fun validate(query: String): ValidationResult {
        // Check destructive patterns first (fast path)
        destructivePatterns.forEach { pattern ->
            if (pattern.containsMatchIn(query)) {
                return ValidationResult.rejected("MOMOP TABLE detected")
            }
        }

        // Check business rules via RAG
        val businessRules = extractBusinessRules(query)
        businessRules.forEach { rule ->
            val policyCheck = ragService.checkAgainstPolicy(rule)
            if (!policyCheck.compliant) {
                return ValidationResult.rejected(policyCheck.explanation)
            }
        }

        return ValidationResult.approved()
    }

    private fun extractBusinessRules(query: String): List<BusinessRule> {
        // Extract discount, price modifications, etc.
        return BusinessRuleExtractor.extract(query)
    }
}
```

Running tests...
✅ 3 tests PASSED

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔄 REFACTOR PHASE - Improving Code
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Improvements applied:
├── Extracted: DestructivePatternDetector.kt
├── Extracted: BusinessRuleChecker.kt
├── Added: Coroutine timeout handling
└── Applied: Result sealed class pattern

Running tests after refactor...
✅ 3 tests PASSED (no regressions)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 RUN Phase Complete

Files created:
├── src/main/kotlin/guardian/GuardianIAValidator.kt
├── src/main/kotlin/guardian/DestructivePatternDetector.kt
├── src/main/kotlin/guardian/BusinessRuleChecker.kt
├── src/test/kotlin/guardian/GuardianIAValidatorTest.kt
└── src/test/kotlin/guardian/DestructivePatternDetectorTest.kt

Test Results: 3 passed, 0 failed
Coverage: 92%

Ready for SYNC phase: /moai:3-sync
```

---

## /moai:3-sync — Sincronización y Calidad

### Propósito
Ejecutar verificaciones de calidad, actualizar documentación y preparar release.

### Sintaxis

```bash
> /moai:3-sync
> /moai:3-sync --skip-docs
> /moai:3-sync --commit "feat: add guardian ia"
```

### Opciones

| Opción | Descripción |
|--------|-------------|
| `--skip-docs` | No actualizar documentación |
| `--skip-lint` | Omitir análisis de lint |
| `--commit` | Crear commit automático |
| `--release` | Crear release tag |

### Ejemplo para Kamaleon

```bash
> /moai:3-sync

📊 SYNC - Quality Verification
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🧪 Running all tests...
   Unit Tests:      47 passed
   Integration:     12 passed
   Total:           59 passed, 0 failed
   ✅ PASSED

📈 Checking coverage...
   Lines:           87%
   Branches:        82%
   Functions:       91%
   Target:          80%
   ✅ PASSED (87% >= 80%)

🔍 Running lint analysis...
   Detekt:          0 errors, 3 warnings
   Android Lint:    0 errors, 1 warning
   ✅ PASSED

🔒 Security scan...
   Dependencies:    0 vulnerabilities
   Code patterns:   0 issues
   ✅ PASSED

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 Updating documentation...

CHANGELOG.md updated:
```markdown
## [1.3.0] - 2026-01-04

### Added
- Guardian IA SQL validation with RAG integration
- Destructive pattern detection for queries
- Business rule compliance checking

### Security
- Added query validation before device distribution
```

API documentation updated:
├── GuardianIAValidator.kt: KDoc added
├── ValidationResult.kt: KDoc added
└── README.md: Updated with Guardian IA section

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📦 Version Management

Current:  1.2.0
Proposed: 1.3.0 (minor - new feature)

? Proceed with version bump? [Y/n] Y

✅ Updated version to 1.3.0

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎉 SYNC Complete!

Summary:
├── Tests:       59 passed
├── Coverage:    87%
├── Lint:        0 errors
├── Security:    0 issues
├── Version:     1.3.0
└── Status:      Ready for commit

Next steps:
> git add -A
> git commit -m "feat(guardian-ia): add SQL validation with RAG"
> git push origin feature/guardian-ia
```

---

## Comandos Auxiliares

### Estado del Ciclo

```bash
> /moai:status

📍 Current Status: RUN Phase (GREEN)

SPEC: KML-003 - Guardian IA SQL Validation
Progress:
├── PLAN:     ✅ Complete
├── RUN:
│   ├── RED:      ✅ 3 tests written
│   ├── GREEN:    🔄 In progress (2/3 implemented)
│   └── REFACTOR: ⏳ Pending
└── SYNC:     ⏳ Pending

Resume: /moai:2-run SPEC-KML-003 --continue
```

### Historial

```bash
> /moai:history

📜 Recent SPEC History

| SPEC ID   | Status    | Date       | Duration |
|-----------|-----------|------------|----------|
| KML-003   | In Progress| Today     | -        |
| KML-002   | Completed | Yesterday  | 45 min   |
| KML-001   | Completed | 2 days ago | 1h 20min |
```

### Abortar Ciclo

```bash
> /moai:abort

⚠️  Abort current cycle?
Current: SPEC-KML-003 (RUN phase)

? Are you sure? [y/N] y

✅ Cycle aborted
💾 State saved to .moai/state/KML-003.json
📝 Can resume later with: /moai:2-run SPEC-KML-003 --continue
```

---

## Flujo Completo Rápido

```bash
# Inicializar proyecto (una vez)
> /moai:0-project --init

# Ciclo de desarrollo
> /moai:1-plan "Nueva funcionalidad"    # Generar SPEC
# Revisar y aprobar SPEC
> /moai:2-run SPEC-XXX                  # Implementar TDD
> /moai:3-sync                           # Verificar y documentar

# O todo en uno (automático)
> /moai:full "Nueva funcionalidad"
```

---

## Configuración de Comandos

### Archivo: `.moai/commands.yaml`

```yaml
commands:
  plan:
    template: "ears-full"
    require_approval: true
    output_format: "markdown"

  run:
    test_framework: "junit5"
    coverage_tool: "jacoco"
    min_coverage: 80
    auto_refactor: true

  sync:
    lint_tools:
      - detekt
      - android-lint
    security_scan: true
    auto_docs: true
    version_bump: "semver"

  aliases:
    p: "1-plan"
    r: "2-run"
    s: "3-sync"
```

---

## Referencias

- **MoAI-ADK Repository:** https://github.com/softvibeslab/moai-adk
- **EARS Syntax Guide:** [SPEC and EARS Format.md](./SPEC%20and%20EARS%20Format.md)
- **Agent Configuration:** [Mr.Alfred & Agents.md](./Mr.Alfred%20&%20Agents.md)
- **Workflow Details:** [Development Workflow.md](./Development%20Workflow.md)
