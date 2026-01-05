# Development Workflow - Ecosistema Kamaleon

## Ciclo de Desarrollo Plan → Run → Sync

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          PLAN → RUN → SYNC                                       │
│                         (Ciclo Infinito MoAI-ADK)                                │
└─────────────────────────────────────────────────────────────────────────────────┘

     ┌──────────────┐         ┌──────────────┐         ┌──────────────┐
     │     PLAN     │         │     RUN      │         │     SYNC     │
     │  (5-10 min)  │────────►│  (20-40 min) │────────►│  (5-10 min)  │
     │              │         │              │         │              │
     └──────────────┘         └──────────────┘         └──────────────┘
            │                                                 │
            │                                                 │
            └─────────────────────────────────────────────────┘
                              (Siguiente Iteración)
```

---

# PARTE 1: DASHBOARD WORKFLOW

## 1.1 Dashboard Frontend Workflow

### PLAN Phase (5-10 min)

```bash
# 1. Crear SPEC para el feature
/moai:1-plan "Implementar Feature Builder con drag-and-drop"

# Output esperado:
# SPEC-DASH-F002: Feature Builder - IDE Visual
# ├── Requirements (EARS syntax)
# ├── Affected files (auto-detected)
# ├── Test scenarios
# └── Estimated complexity: Medium
```

**Actividades:**
1. Definir SPEC usando EARS syntax
2. Identificar componentes React afectados
3. Diseñar estructura de estado Zustand
4. Planificar tests unitarios y E2E

**Checklist PLAN - Dashboard Frontend:**
- [ ] SPEC escrito con todos los patrones EARS
- [ ] Componentes identificados (nuevos y modificados)
- [ ] Store de estado definido
- [ ] API endpoints requeridos listados
- [ ] Casos de test definidos

---

### RUN Phase (20-40 min)

```bash
# 2. Ejecutar implementación TDD
/moai:2-run SPEC-DASH-F002 --agent @dashboard-fe-lead

# El agente ejecutará:
# 1. RED: Crear tests que fallan
# 2. GREEN: Implementar código mínimo
# 3. REFACTOR: Optimizar y limpiar
```

**Ciclo TDD para Dashboard Frontend:**

#### RED Phase
```typescript
// __tests__/FeatureBuilder.test.tsx
describe('FeatureBuilder', () => {
  it('should render canvas area', () => {
    render(<FeatureBuilder />);
    expect(screen.getByTestId('canvas')).toBeInTheDocument();
  });

  it('should allow drag component to canvas', async () => {
    render(<FeatureBuilder />);
    const dropdown = screen.getByTestId('toolbox-dropdown');
    const canvas = screen.getByTestId('canvas');

    await userEvent.drag(dropdown, canvas);

    expect(canvas).toContainElement(
      screen.getByTestId('component-dropdown')
    );
  });

  it('should update JSON manifest on component add', () => {
    const { result } = renderHook(() => useManifestStore());

    act(() => {
      result.current.addComponent({
        type: 'dropdown',
        id: 'cbo_pago'
      });
    });

    expect(result.current.manifest.components).toHaveLength(1);
  });
});
```

#### GREEN Phase
```typescript
// components/FeatureBuilder/index.tsx
export const FeatureBuilder: React.FC = () => {
  const { manifest, addComponent } = useManifestStore();

  const handleDrop = (item: DragItem) => {
    addComponent({
      type: item.type,
      id: generateId(),
      props: item.defaultProps
    });
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="feature-builder">
        <Toolbox />
        <Canvas
          components={manifest.components}
          onDrop={handleDrop}
          data-testid="canvas"
        />
        <PropertyPanel />
      </div>
    </DndProvider>
  );
};
```

#### REFACTOR Phase
```typescript
// Optimizaciones:
// 1. Memoizar componentes pesados
const MemoizedCanvas = memo(Canvas);

// 2. Usar selectores para evitar re-renders
const components = useManifestStore(
  useShallow((state) => state.manifest.components)
);

// 3. Lazy loading de componentes del toolbox
const AdvancedComponents = lazy(() =>
  import('./AdvancedComponents')
);
```

**Quality Gates - Dashboard Frontend:**
```yaml
quality_gates:
  lint:
    tool: "eslint"
    config: ".eslintrc.js"
    max_errors: 0

  typescript:
    strict: true
    no_any: true

  tests:
    coverage_min: 80%
    branches_min: 75%

  performance:
    lighthouse_score: 90
    bundle_size_max: "500KB"
```

---

### SYNC Phase (5-10 min)

```bash
# 3. Verificar y documentar
/moai:3-sync

# El agente verificará:
# ✓ Tests pasando
# ✓ Coverage > 80%
# ✓ No lint errors
# ✓ TypeScript compilando
# ✓ Documentación actualizada
```

**Actividades SYNC:**
1. Ejecutar suite completa de tests
2. Verificar coverage
3. Actualizar changelog
4. Crear PR con descripción detallada
5. Solicitar code review

---

## 1.2 Dashboard Backend Workflow

### PLAN Phase

```bash
/moai:1-plan "Crear API REST para gestión de manifiestos"

# SPEC-DASH-B002 generado con:
# - Endpoints REST
# - DTOs de request/response
# - Validaciones
# - Casos de error
```

**Checklist PLAN - Dashboard Backend:**
- [ ] Endpoints REST definidos (método, path, body)
- [ ] DTOs con validaciones class-validator
- [ ] Entidades de base de datos
- [ ] Migraciones planificadas
- [ ] Tests de integración definidos

---

### RUN Phase

**Ciclo TDD para Dashboard Backend:**

#### RED Phase
```typescript
// __tests__/manifest.controller.spec.ts
describe('ManifestController', () => {
  describe('POST /manifests', () => {
    it('should create manifest and return 201', async () => {
      const dto: CreateManifestDto = {
        name: 'Pedido V1',
        components: [{ type: 'form', id: 'frm_pedido' }]
      };

      const response = await request(app.getHttpServer())
        .post('/manifests')
        .send(dto)
        .expect(201);

      expect(response.body).toMatchObject({
        id: expect.any(String),
        version: '1.0.0',
        name: 'Pedido V1'
      });
    });

    it('should validate manifest with Guardian IA', async () => {
      const dto: CreateManifestDto = {
        name: 'Test',
        components: [{
          type: 'dropdown',
          dataSource: {
            query: 'DROP TABLE users' // Malicious
          }
        }]
      };

      await request(app.getHttpServer())
        .post('/manifests')
        .send(dto)
        .expect(400)
        .expect({
          error: 'GUARDIAN_REJECTED',
          message: 'Query blocked: destructive pattern detected'
        });
    });
  });
});
```

#### GREEN Phase
```typescript
// manifest.controller.ts
@Controller('manifests')
export class ManifestController {
  constructor(
    private manifestService: ManifestService,
    private guardianService: GuardianService
  ) {}

  @Post()
  @HttpCode(201)
  async create(@Body() dto: CreateManifestDto) {
    // Validar con Guardian IA
    const validation = await this.guardianService.validate(dto);
    if (!validation.approved) {
      throw new BadRequestException({
        error: 'GUARDIAN_REJECTED',
        message: validation.reason
      });
    }

    return this.manifestService.create(dto);
  }
}
```

#### REFACTOR Phase
```typescript
// Extraer validación a Guard de NestJS
@UseGuards(GuardianValidationGuard)
@Post()
async create(@Body() dto: CreateManifestDto) {
  return this.manifestService.create(dto);
}

// guardian-validation.guard.ts
@Injectable()
export class GuardianValidationGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const validation = await this.guardianService.validate(request.body);

    if (!validation.approved) {
      throw new BadRequestException({
        error: 'GUARDIAN_REJECTED',
        message: validation.reason
      });
    }

    return true;
  }
}
```

**Quality Gates - Dashboard Backend:**
```yaml
quality_gates:
  tests:
    unit_coverage: 85%
    integration_coverage: 70%

  security:
    sast: "semgrep"
    dependency_scan: "snyk"

  api:
    openapi_valid: true
    breaking_changes: false

  database:
    migration_reversible: true
```

---

# PARTE 2: SERVICIOS INTERMEDIOS WORKFLOW

## 2.1 Gateway Workflow

### PLAN Phase

```bash
/moai:1-plan "Implementar integración con RENIEC para validación de DNI"

# SPEC-GW-002 generado con:
# - Endpoint del gateway
# - Configuración de RENIEC
# - Manejo de errores
# - Caché strategy
```

**Checklist PLAN - Gateway:**
- [ ] Endpoint externo documentado
- [ ] Credenciales en vault
- [ ] Timeout y retry configurados
- [ ] Fallback strategy definido
- [ ] Logging y métricas

---

### RUN Phase

**Ciclo TDD para Gateway:**

#### RED Phase
```typescript
// __tests__/reniec.integration.spec.ts
describe('RENIEC Integration', () => {
  it('should validate valid DNI and return citizen data', async () => {
    const response = await request(gateway)
      .post('/validate/dni')
      .send({ dni: '12345678' })
      .expect(200);

    expect(response.body).toMatchObject({
      valid: true,
      data: {
        nombres: expect.any(String),
        apellidos: expect.any(String)
      }
    });
  });

  it('should return cached response for repeated queries', async () => {
    // First call
    await request(gateway)
      .post('/validate/dni')
      .send({ dni: '12345678' });

    // Second call should be from cache
    const start = Date.now();
    await request(gateway)
      .post('/validate/dni')
      .send({ dni: '12345678' });
    const duration = Date.now() - start;

    expect(duration).toBeLessThan(50); // Cache hit
  });

  it('should handle RENIEC timeout gracefully', async () => {
    // Simulate slow RENIEC
    mockReniec.setDelay(3000);

    const response = await request(gateway)
      .post('/validate/dni')
      .send({ dni: '12345678' })
      .expect(408);

    expect(response.body).toMatchObject({
      error: 'EXTERNAL_TIMEOUT',
      allowManualEntry: true
    });
  });
});
```

#### GREEN Phase
```typescript
// reniec.service.ts
@Injectable()
export class ReniecService {
  private cache: Cache;

  async validateDni(dni: string): Promise<ReniecResponse> {
    // Check cache first
    const cached = await this.cache.get(`dni:${dni}`);
    if (cached) return cached;

    try {
      const response = await this.httpService.post(
        this.config.reniecUrl,
        { dni },
        { timeout: 2000 }
      ).toPromise();

      // Cache successful response
      await this.cache.set(`dni:${dni}`, response.data, 86400);

      return {
        valid: true,
        data: response.data
      };

    } catch (error) {
      if (error.code === 'ETIMEDOUT') {
        return {
          valid: null,
          error: 'EXTERNAL_TIMEOUT',
          allowManualEntry: true
        };
      }
      throw error;
    }
  }
}
```

**Quality Gates - Gateway:**
```yaml
quality_gates:
  latency:
    p95: "< 10ms added"
    p99: "< 50ms added"

  availability:
    uptime: "99.99%"

  security:
    no_credentials_logged: true
    rate_limiting: true

  resilience:
    circuit_breaker_tested: true
    fallback_tested: true
```

---

# PARTE 3: CEREBRO IA WORKFLOW

## 3.1 Guardian IA Workflow

### PLAN Phase

```bash
/moai:1-plan "Implementar validación de queries SQL con RAG"

# SPEC-AI-001 generado con:
# - Patrones a detectar
# - Base de conocimiento
# - Threshold de confianza
# - Mensajes de error
```

**Checklist PLAN - Guardian IA:**
- [ ] Patrones maliciosos definidos
- [ ] Documentos de políticas ingestados
- [ ] Modelo de embeddings seleccionado
- [ ] Threshold de confianza definido
- [ ] Tests adversarios planificados

---

### RUN Phase

**Ciclo TDD para Guardian IA:**

#### RED Phase
```python
# tests/test_guardian.py
class TestGuardianIA:
    def test_blocks_drop_table(self):
        query = "DROP TABLE DEVICE_CUSTOMER"
        result = guardian.validate(query)

        assert result.approved == False
        assert "destructive" in result.reason.lower()

    def test_blocks_sql_injection(self):
        query = "SELECT * FROM users WHERE id = '1; DROP TABLE users--'"
        result = guardian.validate(query)

        assert result.approved == False
        assert result.threat_level == "critical"

    def test_approves_safe_select(self):
        query = """
            SELECT id, descripcion
            FROM DEVICE_PAYMENT_TYPE
            WHERE activo = 1
        """
        result = guardian.validate(query)

        assert result.approved == True
        assert result.confidence > 0.9

    def test_detects_policy_violation(self):
        # Trigger que aplica descuento > 15%
        trigger = """
            CREATE TRIGGER apply_discount
            AFTER INSERT ON DEVICE_ORDER
            BEGIN
                UPDATE DEVICE_ORDER
                SET discount = 0.50
                WHERE id = NEW.id;
            END
        """
        result = guardian.validate(trigger)

        assert result.approved == False
        assert "policy violation" in result.reason.lower()
        assert "discount exceeds 15%" in result.details
```

#### GREEN Phase
```python
# guardian/validator.py
class GuardianValidator:
    def __init__(self, rag_service: RAGService):
        self.rag = rag_service
        self.dangerous_patterns = [
            r'\bDROP\s+TABLE\b',
            r'\bTRUNCATE\b',
            r'\bALTER\s+TABLE\b',
            r';\s*--',  # SQL injection
            r'\bDELETE\s+FROM\s+\w+\s*$'  # DELETE without WHERE
        ]

    async def validate(self, query: str) -> ValidationResult:
        # 1. Pattern matching for obvious threats
        for pattern in self.dangerous_patterns:
            if re.search(pattern, query, re.IGNORECASE):
                return ValidationResult(
                    approved=False,
                    reason="Destructive pattern detected",
                    threat_level="critical"
                )

        # 2. RAG-based policy check
        context = await self.rag.get_relevant_policies(query)
        analysis = await self.analyze_with_context(query, context)

        if analysis.violates_policy:
            return ValidationResult(
                approved=False,
                reason="Policy violation",
                details=analysis.violation_details
            )

        return ValidationResult(
            approved=True,
            confidence=analysis.confidence
        )
```

**Quality Gates - Guardian IA:**
```yaml
quality_gates:
  security:
    false_negatives: 0%  # CRÍTICO
    false_positives: "< 0.1%"

  performance:
    validation_time: "< 1s"

  coverage:
    pattern_coverage: 100%
    adversarial_tests: true

  rag:
    embedding_quality: "> 0.8 relevance"
```

---

## 3.2 Automation (n8n) Workflow

### PLAN Phase

```bash
/moai:1-plan "Crear workflow de procesamiento de pedidos"

# SPEC-AI-003 generado con:
# - Trigger (webhook)
# - Steps del workflow
# - Error handling
# - Notificaciones
```

---

### RUN Phase

**Ciclo TDD para n8n Workflows:**

#### RED Phase
```typescript
// __tests__/order-workflow.test.ts
describe('Order Processing Workflow', () => {
  it('should process valid order end-to-end', async () => {
    const order = {
      id: 'ORD-001',
      items: [{ sku: 'PROD-1', qty: 2 }],
      total: 100
    };

    const result = await triggerWorkflow('order-processing', order);

    expect(result.status).toBe('completed');
    expect(result.steps).toEqual([
      { name: 'validate_order', status: 'success' },
      { name: 'check_inventory', status: 'success' },
      { name: 'create_erp_order', status: 'success' },
      { name: 'notify_customer', status: 'success' }
    ]);
  });

  it('should retry on ERP timeout', async () => {
    mockErp.simulateTimeout(2);

    const result = await triggerWorkflow('order-processing', validOrder);

    expect(result.steps.find(s => s.name === 'create_erp_order')).toMatchObject({
      status: 'success',
      retries: 2
    });
  });

  it('should escalate after max retries', async () => {
    mockErp.simulateTimeout(10);

    const result = await triggerWorkflow('order-processing', validOrder);

    expect(result.status).toBe('escalated');
    expect(mockNotifications.getLastAlert()).toContain('ERP integration failed');
  });
});
```

---

# PARTE 4: APLICACIÓN MÓVIL WORKFLOW

## 4.1 App Frontend (Kotlin) Workflow

### PLAN Phase

```bash
/moai:1-plan "Implementar motor de renderizado SDUI"

# SPEC-APP-F001 generado con:
# - Componentes Compose
# - Parser de manifiestos
# - Binding de datos
# - Performance targets
```

**Checklist PLAN - App Frontend:**
- [ ] Componentes Compose mapeados a JSON types
- [ ] ViewModel definido
- [ ] Queries SQLite identificadas
- [ ] Tests de UI definidos
- [ ] Performance benchmarks establecidos

---

### RUN Phase

**Ciclo TDD para App Kotlin:**

#### RED Phase
```kotlin
// src/test/kotlin/SDUIRendererTest.kt
class SDUIRendererTest {

    @get:Rule
    val composeTestRule = createComposeRule()

    @Test
    fun `renders dropdown from JSON manifest`() {
        val manifest = """
        {
            "components": [{
                "type": "dropdown",
                "id": "cbo_pago",
                "label": "Forma de Pago",
                "dataSource": {
                    "type": "sqlite",
                    "query": "SELECT id, descripcion FROM DEVICE_PAYMENT_TYPE"
                }
            }]
        }
        """.trimIndent()

        composeTestRule.setContent {
            SDUIRenderer(manifest = manifest)
        }

        composeTestRule
            .onNodeWithTag("dropdown_cbo_pago")
            .assertIsDisplayed()

        composeTestRule
            .onNodeWithText("Forma de Pago")
            .assertExists()
    }

    @Test
    fun `executes SQL query and populates dropdown`() {
        // Setup mock database
        val mockDb = MockSQLiteDatabase()
        mockDb.insertPaymentTypes(listOf(
            PaymentType(1, "Efectivo"),
            PaymentType(2, "Tarjeta")
        ))

        composeTestRule.setContent {
            SDUIRenderer(
                manifest = dropdownManifest,
                database = mockDb
            )
        }

        // Click dropdown to expand
        composeTestRule
            .onNodeWithTag("dropdown_cbo_pago")
            .performClick()

        // Verify options
        composeTestRule.onNodeWithText("Efectivo").assertExists()
        composeTestRule.onNodeWithText("Tarjeta").assertExists()
    }

    @Test
    fun `maintains 60fps during scroll`() {
        val manifest = generateLargeListManifest(100)

        composeTestRule.setContent {
            SDUIRenderer(manifest = manifest)
        }

        val metrics = composeTestRule.measureFrameTime {
            composeTestRule
                .onNodeWithTag("list")
                .performScrollToIndex(50)
        }

        assertThat(metrics.averageFrameTime).isLessThan(16.ms)
    }
}
```

#### GREEN Phase
```kotlin
// src/main/kotlin/ui/sdui/SDUIRenderer.kt
@Composable
fun SDUIRenderer(
    manifest: String,
    database: SQLiteDatabase = LocalDatabase.current,
    modifier: Modifier = Modifier
) {
    val parsedManifest = remember(manifest) {
        ManifestParser.parse(manifest)
    }

    Column(modifier = modifier) {
        parsedManifest.components.forEach { component ->
            SDUIComponent(
                component = component,
                database = database
            )
        }
    }
}

@Composable
private fun SDUIComponent(
    component: ComponentDefinition,
    database: SQLiteDatabase
) {
    when (component.type) {
        "dropdown" -> SDUIDropdown(
            id = component.id,
            label = component.props["label"] as? String ?: "",
            dataSource = component.dataSource,
            database = database
        )
        "text" -> SDUIText(component)
        "button" -> SDUIButton(component)
        // ... más componentes
    }
}

@Composable
private fun SDUIDropdown(
    id: String,
    label: String,
    dataSource: DataSourceConfig,
    database: SQLiteDatabase
) {
    var expanded by remember { mutableStateOf(false) }
    var selectedOption by remember { mutableStateOf<DropdownOption?>(null) }

    val options by produceState<List<DropdownOption>>(
        initialValue = emptyList()
    ) {
        value = withContext(Dispatchers.IO) {
            database.rawQuery(dataSource.query, null).use { cursor ->
                buildList {
                    while (cursor.moveToNext()) {
                        add(DropdownOption(
                            id = cursor.getInt(0),
                            label = cursor.getString(1)
                        ))
                    }
                }
            }
        }
    }

    ExposedDropdownMenuBox(
        expanded = expanded,
        onExpandedChange = { expanded = it },
        modifier = Modifier.testTag("dropdown_$id")
    ) {
        OutlinedTextField(
            value = selectedOption?.label ?: "",
            onValueChange = {},
            readOnly = true,
            label = { Text(label) },
            trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded) },
            modifier = Modifier.menuAnchor()
        )

        ExposedDropdownMenu(
            expanded = expanded,
            onDismissRequest = { expanded = false }
        ) {
            options.forEach { option ->
                DropdownMenuItem(
                    text = { Text(option.label) },
                    onClick = {
                        selectedOption = option
                        expanded = false
                    }
                )
            }
        }
    }
}
```

#### REFACTOR Phase
```kotlin
// Optimizaciones:

// 1. Usar key estable para LazyColumn
LazyColumn {
    items(
        items = components,
        key = { it.id }  // Evita re-composición innecesaria
    ) { component ->
        SDUIComponent(component)
    }
}

// 2. Derivar estado en vez de recalcular
val filteredOptions by remember(options, searchText) {
    derivedStateOf {
        options.filter { it.label.contains(searchText, ignoreCase = true) }
    }
}

// 3. Usar LaunchedEffect para side effects
LaunchedEffect(dataSource.query) {
    loadOptions()
}
```

**Quality Gates - App Frontend:**
```yaml
quality_gates:
  performance:
    frame_rate: "60fps"
    render_time: "< 100ms"
    memory_per_screen: "< 50MB"

  tests:
    unit_coverage: 80%
    ui_tests: true

  lint:
    detekt_errors: 0
    android_lint_errors: 0
```

---

## 4.2 App Backend (Sync Engine) Workflow

### PLAN Phase

```bash
/moai:1-plan "Implementar sincronización diferencial priorizada"

# SPEC-SYNC-001 generado con:
# - Tablas y prioridades
# - Algoritmo de delta
# - Manejo de conflictos
# - Métricas de sync
```

---

### RUN Phase

**Ciclo TDD para Sync Engine:**

#### RED Phase
```kotlin
// src/test/kotlin/SyncEngineTest.kt
class SyncEngineTest {

    @Test
    fun `syncs only changed records`() = runTest {
        // Setup: 100 records, 5 changed
        val localDb = setupLocalDb(100)
        val serverDb = setupServerDb(100, changedIds = listOf(1, 5, 10, 50, 100))

        val syncResult = syncEngine.sync(
            table = "DEVICE_CUSTOMER",
            lastSyncTimestamp = yesterday
        )

        assertThat(syncResult.downloaded).isEqualTo(5)
        assertThat(syncResult.uploaded).isEqualTo(0)
    }

    @Test
    fun `prioritizes orders over catalog`() = runTest {
        val orderSync = async { syncEngine.sync("DEVICE_ORDER") }
        val catalogSync = async { syncEngine.sync("DEVICE_PRODUCT") }

        // Orders should complete first even if started later
        val orderTime = measureTime { orderSync.await() }
        val catalogTime = measureTime { catalogSync.await() }

        // Verify order queue priority was respected
        assertThat(syncEngine.getQueueOrder())
            .containsExactly("DEVICE_ORDER", "DEVICE_PRODUCT")
    }

    @Test
    fun `handles offline queue correctly`() = runTest {
        // Create 10 orders while offline
        networkSimulator.setOffline()
        repeat(10) { index ->
            orderRepository.create(Order(id = "ORDER-$index"))
        }

        assertThat(syncQueue.pendingCount()).isEqualTo(10)

        // Go online
        networkSimulator.setOnline()
        syncEngine.processQueue()

        assertThat(syncQueue.pendingCount()).isEqualTo(0)
        assertThat(serverDb.orders.count()).isEqualTo(10)
    }

    @Test
    fun `resolves conflicts with server-wins for master data`() = runTest {
        // Local and server have different customer names
        val localCustomer = Customer(id = "C1", name = "John Local")
        val serverCustomer = Customer(id = "C1", name = "John Server")

        localDb.insert(localCustomer)
        serverDb.insert(serverCustomer)

        syncEngine.sync("DEVICE_CUSTOMER")

        val resolved = localDb.getCustomer("C1")
        assertThat(resolved.name).isEqualTo("John Server") // Server wins
    }
}
```

#### GREEN Phase
```kotlin
// src/main/kotlin/sync/SyncEngine.kt
class SyncEngine(
    private val localDb: SQLiteDatabase,
    private val api: SyncApi,
    private val conflictResolver: ConflictResolver,
    private val config: SyncConfig
) {
    private val syncQueue = PriorityBlockingQueue<SyncJob>(
        100,
        compareBy { config.getPriority(it.table) }
    )

    suspend fun sync(table: String): SyncResult = withContext(Dispatchers.IO) {
        val lastSync = getLastSyncTimestamp(table)

        // 1. Upload local changes
        val pendingChanges = localDb.getChangesSince(table, lastSync)
        val uploadResult = if (pendingChanges.isNotEmpty()) {
            api.uploadChanges(table, pendingChanges)
        } else UploadResult.empty()

        // 2. Download server changes (delta only)
        val serverChanges = api.getChangesSince(table, lastSync)

        // 3. Apply changes with conflict resolution
        var conflictsResolved = 0
        serverChanges.forEach { change ->
            val localVersion = localDb.getVersion(table, change.id)

            if (localVersion != null && localVersion != change.baseVersion) {
                // Conflict detected
                val resolved = conflictResolver.resolve(
                    table = table,
                    local = localVersion,
                    server = change,
                    strategy = config.getConflictStrategy(table)
                )
                localDb.apply(table, resolved)
                conflictsResolved++
            } else {
                localDb.apply(table, change)
            }
        }

        // 4. Update sync timestamp
        setLastSyncTimestamp(table, Clock.System.now())

        SyncResult(
            table = table,
            uploaded = uploadResult.count,
            downloaded = serverChanges.size,
            conflictsResolved = conflictsResolved
        )
    }

    suspend fun processQueue() {
        while (syncQueue.isNotEmpty()) {
            val job = syncQueue.poll() ?: break
            try {
                sync(job.table)
            } catch (e: Exception) {
                if (job.retries < MAX_RETRIES) {
                    syncQueue.add(job.copy(retries = job.retries + 1))
                } else {
                    onSyncFailed(job, e)
                }
            }
        }
    }
}
```

**Quality Gates - Sync Engine:**
```yaml
quality_gates:
  reliability:
    data_loss: 0%
    eventual_consistency: true

  performance:
    sync_speed: "45 MB/s"
    battery_impact: "< 5%/hour"

  tests:
    offline_scenarios: true
    conflict_scenarios: true

  monitoring:
    sync_metrics: true
    error_tracking: true
```

---

# PARTE 5: CI/CD WORKFLOW

## 5.1 Pipeline Workflow

### PLAN Phase

```bash
/moai:1-plan "Configurar pipeline CI/CD para todos los componentes"

# SPEC-CICD-001 generado con:
# - Stages del pipeline
# - Jobs por componente
# - Environments
# - Approvals
```

---

### RUN Phase

**GitHub Actions Workflow:**

```yaml
# .github/workflows/ci-cd.yml
name: Kamaleon CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  # ==================== DASHBOARD ====================
  dashboard-fe:
    name: Dashboard Frontend
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: dashboard/frontend/package-lock.json

      - name: Install Dependencies
        run: npm ci
        working-directory: dashboard/frontend

      - name: Lint
        run: npm run lint
        working-directory: dashboard/frontend

      - name: Type Check
        run: npm run type-check
        working-directory: dashboard/frontend

      - name: Unit Tests
        run: npm run test:coverage
        working-directory: dashboard/frontend

      - name: Build
        run: npm run build
        working-directory: dashboard/frontend

      - name: Upload Coverage
        uses: codecov/codecov-action@v3
        with:
          files: dashboard/frontend/coverage/lcov.info

  dashboard-be:
    name: Dashboard Backend
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: test
        ports:
          - 5432:5432
      redis:
        image: redis:7
        ports:
          - 6379:6379

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install Dependencies
        run: npm ci
        working-directory: dashboard/backend

      - name: Lint
        run: npm run lint
        working-directory: dashboard/backend

      - name: Unit Tests
        run: npm run test
        working-directory: dashboard/backend

      - name: Integration Tests
        run: npm run test:e2e
        working-directory: dashboard/backend
        env:
          DATABASE_URL: postgresql://postgres:test@localhost:5432/test

  # ==================== MOBILE APP ====================
  mobile-app:
    name: Android App
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup JDK
        uses: actions/setup-java@v4
        with:
          java-version: '17'
          distribution: 'temurin'

      - name: Setup Gradle
        uses: gradle/gradle-build-action@v2

      - name: Run Detekt
        run: ./gradlew detekt
        working-directory: app/android

      - name: Unit Tests
        run: ./gradlew testDebugUnitTest
        working-directory: app/android

      - name: Build Debug APK
        run: ./gradlew assembleDebug
        working-directory: app/android

      - name: Upload APK
        uses: actions/upload-artifact@v3
        with:
          name: app-debug
          path: app/android/app/build/outputs/apk/debug/app-debug.apk

  # ==================== GUARDIAN IA ====================
  guardian-ia:
    name: Guardian IA
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'

      - name: Install Dependencies
        run: |
          pip install poetry
          poetry install
        working-directory: services/guardian

      - name: Lint
        run: poetry run ruff check .
        working-directory: services/guardian

      - name: Type Check
        run: poetry run mypy .
        working-directory: services/guardian

      - name: Tests
        run: poetry run pytest --cov
        working-directory: services/guardian

  # ==================== E2E TESTS ====================
  e2e-tests:
    name: E2E Tests
    needs: [dashboard-fe, dashboard-be, mobile-app]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Start Services
        run: docker-compose up -d
        working-directory: tests/e2e

      - name: Run E2E Tests
        run: npm run test:e2e
        working-directory: tests/e2e

      - name: Upload Results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: e2e-results
          path: tests/e2e/results

  # ==================== DEPLOY ====================
  deploy-staging:
    name: Deploy to Staging
    needs: [e2e-tests]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - uses: actions/checkout@v4

      - name: Deploy Dashboard
        run: |
          kubectl apply -f k8s/staging/dashboard/

      - name: Deploy Gateway
        run: |
          kubectl apply -f k8s/staging/gateway/

      - name: Verify Deployment
        run: |
          kubectl rollout status deployment/dashboard-fe -n staging
          kubectl rollout status deployment/dashboard-be -n staging

  deploy-production:
    name: Deploy to Production
    needs: [deploy-staging]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment:
      name: production
      url: https://kamaleon.example.com
    steps:
      - uses: actions/checkout@v4

      - name: Deploy with Blue-Green
        run: |
          ./scripts/blue-green-deploy.sh production
```

---

## 5.2 Quality Gates Summary

```yaml
# quality-gates.yaml
global:
  code_coverage: 80%
  security_scan: required
  lint_errors: 0

per_component:
  dashboard_frontend:
    lighthouse_score: 90
    bundle_size: "< 500KB"
    typescript_strict: true

  dashboard_backend:
    integration_coverage: 70%
    api_breaking_changes: false
    migration_reversible: true

  mobile_app:
    frame_rate: 60fps
    memory_limit: "50MB/screen"
    offline_capable: true

  guardian_ia:
    false_negatives: 0%
    validation_time: "< 1s"

  sync_engine:
    data_loss: 0%
    sync_speed: "45 MB/s"

  cicd:
    build_time: "< 10min"
    deploy_time: "< 5min"
```

---

## Referencias

- **SPEC Documentation:** [01-SPEC-EARS-Ecosistema-Kamaleon.md](./01-SPEC-EARS-Ecosistema-Kamaleon.md)
- **Agent Documentation:** [02-MrAlfred-Agentes-Ecosistema.md](./02-MrAlfred-Agentes-Ecosistema.md)
- **MoAI-ADK Framework:** https://github.com/softvibeslab/moai-adk
