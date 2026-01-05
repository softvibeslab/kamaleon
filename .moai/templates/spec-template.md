# SPEC-[PREFIX]-[XXX]: [Título]

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

### TC-[PREFIX]-[XXX]-01: [Nombre del Test]
- **Precondición:** [estado inicial]
- **Input:** [acción/datos de entrada]
- **Expected:** [resultado esperado]

### TC-[PREFIX]-[XXX]-02: [Nombre del Test]
- **Precondición:** [estado inicial]
- **Input:** [acción/datos de entrada]
- **Expected:** [resultado esperado]

## Archivos Afectados
- path/to/file1.ts (nuevo/modificar)
- path/to/file2.ts (nuevo/modificar)

## Agente Asignado
@[agent-name]

## Referencias
- [Documentación relacionada]
- [SPECs relacionados]
