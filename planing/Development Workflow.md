# Development Workflow - Plan → Run → Sync

## Framework MoAI-ADK: Ciclo de Desarrollo SPEC-First TDD

---

## Overview del Ciclo Infinito

El desarrollo con MoAI-ADK sigue un ciclo continuo de tres fases:

```
    ┌─────────────────────────────────────────────────────────┐
    │                    INFINITE LOOP                         │
    │                                                          │
    │    ┌──────────┐    ┌──────────┐    ┌──────────┐         │
    │    │   PLAN   │───▶│   RUN    │───▶│   SYNC   │─────┐   │
    │    │ (5-10min)│    │(20-40min)│    │ (5-10min)│     │   │
    │    └──────────┘    └──────────┘    └──────────┘     │   │
    │         ▲                                           │   │
    │         └───────────────────────────────────────────┘   │
    │                                                          │
    └─────────────────────────────────────────────────────────┘
```

**Beneficio:** 90% de reducción en retrabajo gracias a especificaciones claras.

---

## Fase 1: PLAN (Planificar)

### Objetivo
Clarificar requisitos y generar especificación SPEC formal antes de escribir código.

### Duración Estimada
5-10 minutos por feature

### Actividades

```
┌─────────────────────────────────────────────────────────────┐
│                         PLAN                                 │
├─────────────────────────────────────────────────────────────┤
│  1. Análisis de Requisito                                   │
│     └─ Entender qué se necesita construir                   │
│                                                              │
│  2. Investigación de Contexto                               │
│     └─ Revisar código existente, dependencias               │
│                                                              │
│  3. Generación de SPEC                                      │
│     └─ Escribir requisitos en formato EARS                  │
│                                                              │
│  4. Definición de Test Scenarios                            │
│     └─ Casos de prueba antes del código                     │
│                                                              │
│  5. Aprobación                                              │
│     └─ Validar SPEC con stakeholders                        │
└─────────────────────────────────────────────────────────────┘
```

### Comando MoAI

```bash
> /moai:1-plan "Implementar validación RENIEC en formulario de clientes"
```

### Output Esperado

```markdown
## SPEC-KML-002: Validación Síncrona de Identidad

**Requirements (EARS):**
- (Event-driven): CUANDO el foco sale del campo DNI (ON_EXIT),
  ENTONCES invocar Service.RENIEC con el valor capturado.
- (State-driven): SI response.valid == false, ENTONCES bloquear submit.
- (Unwanted): NO DEBE permitir continuar con DNI no verificado.

**Test Scenarios:**
- TC-002-01: DNI válido → autocomplete nombre
- TC-002-02: DNI inválido → mostrar error
- TC-002-03: Timeout > 2s → permitir entrada manual
```

### Checklist de PLAN

- [ ] ¿El SPEC está escrito en formato EARS?
- [ ] ¿Todos los edge cases están identificados?
- [ ] ¿Las constraints están definidas con valores?
- [ ] ¿Los test scenarios cubren happy path y errores?
- [ ] ¿Se revisó código existente relacionado?

---

## Fase 2: RUN (Ejecutar)

### Objetivo
Implementar el código siguiendo el ciclo TDD: Red → Green → Refactor

### Duración Estimada
20-40 minutos por feature

### El Ciclo TDD

```
           ┌──────────────────────────────────────┐
           │            TDD CYCLE                 │
           │                                      │
           │         ┌─────────┐                  │
           │    ┌───▶│   RED   │───┐              │
           │    │    │ (Write  │   │              │
           │    │    │ Failing │   │              │
           │    │    │  Test)  │   │              │
           │    │    └─────────┘   │              │
           │    │                  ▼              │
           │  ┌─────────┐    ┌─────────┐          │
           │  │REFACTOR │◀───│  GREEN  │          │
           │  │(Improve │    │ (Make   │          │
           │  │  Code)  │    │  Pass)  │          │
           │  └─────────┘    └─────────┘          │
           │        │                             │
           │        └────────────────────────┐    │
           │                                 │    │
           │         Next Test ◀─────────────┘    │
           │                                      │
           └──────────────────────────────────────┘
```

### Actividades por Sub-fase

#### RED: Escribir Test que Falla

```kotlin
// Test para SPEC-KML-002
@Test
fun `WHEN dni field loses focus THEN call RENIEC service`() {
    // Given
    val viewModel = CustomerFormViewModel(reniecService)

    // When
    viewModel.onDniFieldExit("12345678")

    // Then
    verify(reniecService).validateDni("12345678")
}

@Test
fun `IF reniec returns invalid THEN block form submission`() {
    // Given
    whenever(reniecService.validateDni(any()))
        .thenReturn(ReniecResponse(valid = false))

    // When
    viewModel.onDniFieldExit("00000000")

    // Then
    assertThat(viewModel.isSubmitEnabled.value).isFalse()
    assertThat(viewModel.dniError.value).isNotNull()
}
```

#### GREEN: Implementar Código Mínimo

```kotlin
class CustomerFormViewModel(
    private val reniecService: ReniecService
) : ViewModel() {

    private val _isSubmitEnabled = MutableStateFlow(true)
    val isSubmitEnabled: StateFlow<Boolean> = _isSubmitEnabled

    private val _dniError = MutableStateFlow<String?>(null)
    val dniError: StateFlow<String?> = _dniError

    fun onDniFieldExit(dni: String) {
        viewModelScope.launch {
            val response = reniecService.validateDni(dni)
            if (!response.valid) {
                _isSubmitEnabled.value = false
                _dniError.value = "DNI inválido"
            } else {
                _isSubmitEnabled.value = true
                _dniError.value = null
            }
        }
    }
}
```

#### REFACTOR: Mejorar sin Cambiar Comportamiento

```kotlin
// Refactored: Extraer lógica de validación
class CustomerFormViewModel(
    private val reniecService: ReniecService,
    private val errorMapper: ErrorMapper
) : ViewModel() {

    fun onDniFieldExit(dni: String) = viewModelScope.launch {
        runCatching { reniecService.validateDni(dni) }
            .onSuccess { handleValidationResult(it) }
            .onFailure { handleTimeout() }
    }

    private fun handleValidationResult(response: ReniecResponse) {
        _isSubmitEnabled.value = response.valid
        _dniError.value = if (!response.valid)
            errorMapper.mapDniError(response.code)
        else null
    }

    private fun handleTimeout() {
        // Allow manual entry on timeout
        _isSubmitEnabled.value = true
        _dniError.value = null
        _manualEntryMode.value = true
    }
}
```

### Comando MoAI

```bash
> /moai:2-run SPEC-KML-002
```

### Output Esperado

```
🔴 RED Phase:
   ├─ Created: CustomerFormViewModelTest.kt
   ├─ Tests: 3 written, 3 failing
   └─ Coverage target: 80%

🟢 GREEN Phase:
   ├─ Created: CustomerFormViewModel.kt
   ├─ Modified: ReniecService.kt
   ├─ Tests: 3 passing
   └─ Coverage: 85%

🔄 REFACTOR Phase:
   ├─ Extracted: ErrorMapper.kt
   ├─ Applied: Coroutine best practices
   └─ No test regressions
```

---

## Fase 3: SYNC (Sincronizar)

### Objetivo
Automatizar verificación de calidad, actualizar documentación y preparar para siguiente iteración.

### Duración Estimada
5-10 minutos por feature

### Actividades

```
┌─────────────────────────────────────────────────────────────┐
│                         SYNC                                 │
├─────────────────────────────────────────────────────────────┤
│  1. Run All Tests                                           │
│     └─ Verificar que no hay regresiones                     │
│                                                              │
│  2. Check Coverage                                          │
│     └─ Asegurar >= 80% coverage                             │
│                                                              │
│  3. Code Quality                                            │
│     └─ Linting, static analysis                             │
│                                                              │
│  4. Update Documentation                                    │
│     └─ CHANGELOG, API docs                                  │
│                                                              │
│  5. Commit & Version                                        │
│     └─ Semantic versioning                                  │
└─────────────────────────────────────────────────────────────┘
```

### Comando MoAI

```bash
> /moai:3-sync
```

### Output Esperado

```
📋 SYNC Report for SPEC-KML-002:

✅ Tests:        47 passed, 0 failed
✅ Coverage:     87% (target: 80%)
✅ Lint:         0 errors, 2 warnings
✅ Security:     No vulnerabilities detected

📝 Documentation Updated:
   ├─ CHANGELOG.md: Added entry for v1.2.0
   ├─ API.md: Updated CustomerFormViewModel
   └─ README.md: No changes needed

🏷️ Version: 1.2.0-beta.1
📦 Ready for commit
```

### Quality Gates

| Gate | Threshold | Action if Fails |
|------|-----------|-----------------|
| Test Pass Rate | 100% | Block commit |
| Code Coverage | ≥80% | Warning |
| Lint Errors | 0 | Block commit |
| Security Scan | 0 Critical | Block commit |

---

## Workflow Completo para Kamaleon

### Ejemplo: Implementar Guardian IA

```bash
# Fase 1: PLAN
> /moai:1-plan "Guardian IA debe validar queries SQL contra inyección usando RAG"

# Output: SPEC-KML-003 generado
# Revisar y aprobar SPEC

# Fase 2: RUN
> /moai:2-run SPEC-KML-003

# Output: Tests + Implementation + Refactor

# Fase 3: SYNC
> /moai:3-sync

# Output: Quality report + Documentation + Version bump
```

### Pipeline Visual

```
┌────────────────────────────────────────────────────────────────┐
│                    KAMALEON DEVELOPMENT FLOW                    │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Feature Request                                                │
│       │                                                         │
│       ▼                                                         │
│  ┌─────────┐                                                    │
│  │  PLAN   │ → SPEC Document (EARS format)                      │
│  └────┬────┘                                                    │
│       │                                                         │
│       ▼                                                         │
│  ┌─────────┐   ┌─────────┐   ┌─────────┐                       │
│  │   RED   │──▶│  GREEN  │──▶│REFACTOR │                       │
│  │  Test   │   │  Code   │   │ Improve │                       │
│  └─────────┘   └─────────┘   └─────────┘                       │
│       │                            │                            │
│       └────────────────────────────┘                            │
│                    │                                            │
│                    ▼                                            │
│  ┌─────────┐                                                    │
│  │  SYNC   │ → Quality Gates → Documentation → Version          │
│  └────┬────┘                                                    │
│       │                                                         │
│       ▼                                                         │
│  ┌─────────┐                                                    │
│  │ RELEASE │ → CI/CD Pipeline → Deploy to Kamaleon              │
│  └─────────┘                                                    │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

---

## Integración con Kamaleon/Meleon

### Sincronización con Dashboard

Después de cada ciclo SYNC exitoso:

1. **Feature Builder**: Actualizar registro de componentes disponibles
2. **Release CI/CD**: Crear nueva versión del módulo
3. **Guardian IA**: Actualizar base de conocimiento con nuevas políticas
4. **Telemetría**: Configurar métricas para el nuevo feature

### Artefactos Generados por Ciclo

| Fase | Artefacto | Destino |
|------|-----------|---------|
| PLAN | SPEC-XXX.md | `specs/` |
| RUN | *.kt + *Test.kt | `src/` |
| SYNC | CHANGELOG.md | root |
| SYNC | coverage.xml | `reports/` |
| SYNC | lint-results.xml | `reports/` |

---

## Comandos Rápidos

```bash
# Flujo completo automático
> /moai:full "Descripción del feature"

# Solo planificación
> /moai:1-plan "Descripción"

# Solo implementación (requiere SPEC existente)
> /moai:2-run SPEC-ID

# Solo sincronización
> /moai:3-sync

# Estado del ciclo actual
> /moai:status

# Abortar ciclo actual
> /moai:abort
```

---

## Referencias

- **MoAI-ADK Repository:** https://github.com/softvibeslab/moai-adk
- **TDD Best Practices:** Kent Beck's Test-Driven Development
- **EARS Syntax:** Easy Approach to Requirements Syntax
