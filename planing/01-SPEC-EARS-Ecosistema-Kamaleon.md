# SPEC & EARS Format - Ecosistema Completo Kamaleon

## Arquitectura del Ecosistema

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           ECOSISTEMA KAMALEON                                    │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐              │
│  │   DASHBOARD     │    │   SERVICIOS     │    │   CEREBRO IA    │              │
│  │   (Frontend)    │◄──►│   INTERMEDIOS   │◄──►│   & AUTOMATION  │              │
│  │   (Backend)     │    │   (Gateway)     │    │   (n8n + RAG)   │              │
│  └────────┬────────┘    └────────┬────────┘    └────────┬────────┘              │
│           │                      │                      │                        │
│           └──────────────────────┼──────────────────────┘                        │
│                                  │                                               │
│                         ┌────────▼────────┐                                      │
│                         │   SYNC ENGINE   │                                      │
│                         │   (Real-time)   │                                      │
│                         └────────┬────────┘                                      │
│                                  │                                               │
│           ┌──────────────────────┼──────────────────────┐                        │
│           │                      │                      │                        │
│  ┌────────▼────────┐    ┌────────▼────────┐    ┌────────▼────────┐              │
│  │   MOBILE APP    │    │   MOBILE APP    │    │   MOBILE APP    │              │
│  │   (Frontend)    │    │   (Frontend)    │    │   (Frontend)    │              │
│  │   (SQLite)      │    │   (SQLite)      │    │   (SQLite)      │              │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘              │
│                                                                                  │
├─────────────────────────────────────────────────────────────────────────────────┤
│                         CI/CD & TESTING PIPELINE                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

# PARTE 1: DASHBOARD KAMALEON

## 1.1 Dashboard Frontend

### SPEC-DASH-F001: Sistema de Autenticación y Autorización

**Descripción:**
El frontend del dashboard debe implementar un sistema de autenticación seguro con gestión de roles y permisos granulares para administrar el ecosistema Kamaleon.

**Requirements (EARS):**

#### Ubiquitous
- El sistema SIEMPRE debe validar el token JWT en cada petición al backend
- El sistema SIEMPRE debe cifrar las credenciales antes de transmitirlas
- El sistema SIEMPRE debe mantener el estado de sesión en localStorage encriptado

#### Event-Driven
- CUANDO el usuario inicia sesión, ENTONCES el sistema debe solicitar token al backend y almacenarlo de forma segura
- CUANDO el token expira (401), ENTONCES redirigir automáticamente a login
- CUANDO el usuario cierra sesión, ENTONCES limpiar todos los datos de sesión y tokens

#### State-Driven
- SI el usuario tiene rol "Admin", ENTONCES mostrar todas las opciones del menú
- SI el usuario tiene rol "Developer", ENTONCES ocultar módulos de configuración de tenants
- SI el usuario tiene rol "Viewer", ENTONCES deshabilitar todas las acciones de escritura

#### Unwanted
- El sistema NO DEBE almacenar contraseñas en texto plano
- El sistema NO DEBE permitir sesiones concurrentes desde diferentes dispositivos sin confirmación
- El sistema NO DEBE exponer tokens en la URL o logs del navegador

#### Optional
- DONDE SEA POSIBLE, implementar autenticación biométrica para dispositivos compatibles
- DONDE SEA POSIBLE, ofrecer 2FA mediante TOTP

**Constraints:**
| Constraint | Valor | Justificación |
|------------|-------|---------------|
| Token TTL | 8 horas | Jornada laboral estándar |
| Refresh Token TTL | 7 días | Evitar re-login frecuente |
| Max intentos login | 5 | Prevenir fuerza bruta |
| Lockout time | 15 min | Balance seguridad/UX |

**Success Criteria:**
- [ ] Login exitoso en < 2 segundos
- [ ] 0 tokens expuestos en logs del navegador
- [ ] 100% de rutas protegidas por guards de autenticación
- [ ] Logout limpia completamente la sesión

**Test Scenarios:**
- TC-DASH-F001-01: Login válido → Token almacenado, redirección a dashboard
- TC-DASH-F001-02: Login inválido x5 → Cuenta bloqueada 15 min
- TC-DASH-F001-03: Token expirado → Redirect a login con mensaje
- TC-DASH-F001-04: Cambio de rol en tiempo real → UI se actualiza sin refresh

---

### SPEC-DASH-F002: Feature Builder - IDE Visual

**Descripción:**
El Feature Builder es el IDE visual que permite construir módulos de la aplicación móvil mediante drag-and-drop, generando manifiestos JSON que definen la UI y lógica.

**Requirements (EARS):**

#### Ubiquitous
- El sistema SIEMPRE debe mostrar una preview en tiempo real del componente editado
- El sistema SIEMPRE debe validar la sintaxis JSON antes de guardar
- El sistema SIEMPRE debe generar IDs únicos para cada componente (UUID v4)

#### Event-Driven
- CUANDO el usuario arrastra un componente al canvas, ENTONCES agregar el nodo JSON correspondiente al manifiesto
- CUANDO el usuario modifica una propiedad, ENTONCES actualizar el JSON y la preview en < 100ms
- CUANDO el usuario hace click en "Importar Figma", ENTONCES parsear el archivo y generar componentes equivalentes
- CUANDO el usuario conecta un data_source, ENTONCES validar la query SQL con Guardian IA

#### State-Driven
- SI el componente requiere data_source, ENTONCES mostrar panel de configuración SQL
- SI el JSON es inválido, ENTONCES deshabilitar botón de guardar y mostrar errores
- SI existe un cambio sin guardar, ENTONCES mostrar indicador visual y confirmar antes de salir

#### Unwanted
- El sistema NO DEBE permitir guardar manifiestos con referencias a tablas inexistentes
- El sistema NO DEBE permitir queries SQL sin validación de Guardian IA
- El sistema NO DEBE perder cambios ante desconexión (auto-save local)

#### Optional
- DONDE SEA POSIBLE, sugerir componentes basados en el contexto del módulo
- DONDE SEA POSIBLE, ofrecer templates prediseñados para flujos comunes

**Constraints:**
| Constraint | Valor | Justificación |
|------------|-------|---------------|
| Preview refresh | < 100ms | Experiencia fluida |
| Max componentes/pantalla | 50 | Performance móvil |
| Tamaño max JSON | 500KB | Sync eficiente |
| Auto-save interval | 30 seg | Prevenir pérdida |

**Success Criteria:**
- [ ] Importación de Figma exitosa en > 90% de los casos
- [ ] 0 manifiestos inválidos en producción
- [ ] Tiempo de diseño reducido en 60% vs código manual
- [ ] Preview fiel al renderizado móvil final

**Test Scenarios:**
- TC-DASH-F002-01: Drag dropdown → JSON incluye component:"dropdown"
- TC-DASH-F002-02: Query SQL inválida → Guardian IA bloquea y muestra error
- TC-DASH-F002-03: Importar Figma → Componentes mapeados correctamente
- TC-DASH-F002-04: Desconexión durante edición → Cambios recuperados al reconectar

---

### SPEC-DASH-F003: Gestor Multi-Tenant

**Descripción:**
Panel de administración para gestionar múltiples clientes (tenants) con configuraciones aisladas de módulos, usuarios y datos.

**Requirements (EARS):**

#### Ubiquitous
- El sistema SIEMPRE debe aislar los datos entre tenants (zero data leakage)
- El sistema SIEMPRE debe mostrar el tenant activo en el header
- El sistema SIEMPRE debe registrar auditoría de cambios por tenant

#### Event-Driven
- CUANDO se crea un nuevo tenant, ENTONCES generar esquema de base de datos aislado
- CUANDO se asigna un módulo a un tenant, ENTONCES sincronizar a todos sus dispositivos
- CUANDO se elimina un tenant, ENTONCES archivar datos (soft delete) por 90 días

#### State-Driven
- SI el tenant está en estado "Trial", ENTONCES limitar a 10 dispositivos
- SI el tenant excede su cuota de usuarios, ENTONCES bloquear nuevos registros
- SI el tenant tiene facturación pendiente, ENTONCES mostrar banner de aviso

#### Unwanted
- El sistema NO DEBE permitir acceso cruzado entre datos de diferentes tenants
- El sistema NO DEBE eliminar permanentemente datos sin confirmación de superadmin
- El sistema NO DEBE permitir más dispositivos que los contratados

**Constraints:**
| Constraint | Valor | Justificación |
|------------|-------|---------------|
| Max tenants/instancia | 1000 | Capacidad servidor |
| Max usuarios/tenant | 10000 | Licenciamiento |
| Retención datos eliminados | 90 días | Compliance legal |

**Success Criteria:**
- [ ] 0 incidentes de data leakage entre tenants
- [ ] Creación de tenant en < 30 segundos
- [ ] 100% de operaciones auditadas
- [ ] Escalado horizontal sin downtime

**Test Scenarios:**
- TC-DASH-F003-01: Crear tenant → Esquema BD creado e inicializado
- TC-DASH-F003-02: Usuario Tenant A accede datos Tenant B → 403 Forbidden
- TC-DASH-F003-03: Tenant Trial + 11 dispositivos → Bloqueo con mensaje
- TC-DASH-F003-04: Eliminar tenant → Datos archivados, no destruidos

---

### SPEC-DASH-F004: Ticket Designer

**Descripción:**
Editor visual para diseñar plantillas de impresión térmica (tickets, facturas, contratos) con binding dinámico de datos.

**Requirements (EARS):**

#### Ubiquitous
- El sistema SIEMPRE debe mostrar preview fiel al formato 80mm
- El sistema SIEMPRE debe validar que las variables {{campo}} existan en el esquema
- El sistema SIEMPRE debe generar código ESC/POS válido

#### Event-Driven
- CUANDO el usuario agrega un campo, ENTONCES mostrar selector de variables disponibles
- CUANDO el tipo es "qr_code", ENTONCES generar bitmap QR con datos concatenados
- CUANDO el usuario guarda la plantilla, ENTONCES compilar a formato ESC/POS binario

#### State-Driven
- SI la plantilla es para factura electrónica, ENTONCES incluir campos fiscales obligatorios
- SI el tenant opera en Perú, ENTONCES incluir formato SUNAT
- SI incluye firma digital, ENTONCES validar certificado del tenant

#### Unwanted
- El sistema NO DEBE permitir plantillas sin campos obligatorios fiscales
- El sistema NO DEBE generar QR con datos incompletos
- El sistema NO DEBE exceder el ancho de 80mm en el layout

**Constraints:**
| Constraint | Valor | Justificación |
|------------|-------|---------------|
| Ancho papel | 80mm / 58mm | Estándar térmico |
| Max caracteres/línea | 48 (80mm) | Hardware limit |
| Tiempo generación | < 2 seg | UX aceptable |

**Success Criteria:**
- [ ] 100% de tickets impresos coinciden con preview
- [ ] QR legibles en > 99% de impresiones
- [ ] Cumplimiento fiscal 100% por país

**Test Scenarios:**
- TC-DASH-F004-01: Preview 80mm → Coincide con impresión real
- TC-DASH-F004-02: Variable inexistente → Error de validación
- TC-DASH-F004-03: Factura sin RUC → Bloqueo de guardado
- TC-DASH-F004-04: QR con 50 pedidos → Genera correctamente

---

### SPEC-DASH-F005: Monitor de Telemetría

**Descripción:**
Dashboard de monitoreo en tiempo real del estado de sincronización, errores y métricas de la flota de dispositivos.

**Requirements (EARS):**

#### Ubiquitous
- El sistema SIEMPRE debe mostrar datos con máximo 5 minutos de retraso
- El sistema SIEMPRE debe alertar cuando un dispositivo lleva > 24h offline
- El sistema SIEMPRE debe calcular KPIs en tiempo real (tasa error, velocidad sync)

#### Event-Driven
- CUANDO un dispositivo falla sincronización, ENTONCES registrar en log y notificar
- CUANDO la tasa de error supera 1%, ENTONCES activar alerta crítica
- CUANDO un dispositivo se conecta después de offline, ENTONCES marcar en verde

#### State-Driven
- SI el dispositivo tiene batería < 20%, ENTONCES mostrar indicador amarillo
- SI el dispositivo tiene almacenamiento < 10%, ENTONCES mostrar alerta
- SI hay > 100 dispositivos offline, ENTONCES escalar a nivel crítico

#### Unwanted
- El sistema NO DEBE ocultar errores o fallas del dashboard
- El sistema NO DEBE generar alertas duplicadas para el mismo evento
- El sistema NO DEBE mostrar datos de tenants diferentes mezclados

**Constraints:**
| Constraint | Valor | Justificación |
|------------|-------|---------------|
| Refresh rate | 30 seg | Balance carga/actualidad |
| Retención logs | 30 días | Análisis histórico |
| Max dispositivos vista | 10000 | Performance UI |

**Success Criteria:**
- [ ] Detección de dispositivo offline en < 30 minutos
- [ ] Tasa de falsos positivos en alertas < 1%
- [ ] Dashboard carga en < 3 segundos con 10k dispositivos

**Test Scenarios:**
- TC-DASH-F005-01: Dispositivo offline 25h → Alerta generada
- TC-DASH-F005-02: Error rate 1.5% → Alerta crítica visible
- TC-DASH-F005-03: 10000 dispositivos → Dashboard responsive

---

## 1.2 Dashboard Backend

### SPEC-DASH-B001: API REST - Core Services

**Descripción:**
API RESTful que expone todos los servicios del dashboard para consumo del frontend y sistemas externos.

**Requirements (EARS):**

#### Ubiquitous
- El sistema SIEMPRE debe responder con formato JSON estándar
- El sistema SIEMPRE debe incluir headers CORS configurables por tenant
- El sistema SIEMPRE debe versionar endpoints (v1, v2, etc.)
- El sistema SIEMPRE debe loguear request/response para auditoría

#### Event-Driven
- CUANDO se recibe una petición, ENTONCES validar token JWT antes de procesar
- CUANDO un endpoint falla, ENTONCES retornar error estructurado con código y mensaje
- CUANDO se modifica un recurso, ENTONCES emitir evento a WebSocket para sync

#### State-Driven
- SI el rate limit se excede, ENTONCES retornar 429 Too Many Requests
- SI el tenant está suspendido, ENTONCES retornar 403 con mensaje específico
- SI la versión del API está deprecada, ENTONCES incluir header Warning

#### Unwanted
- El sistema NO DEBE exponer stack traces en producción
- El sistema NO DEBE permitir SQL injection en ningún parámetro
- El sistema NO DEBE aceptar requests sin Content-Type válido

#### Optional
- DONDE SEA POSIBLE, implementar GraphQL para queries complejas
- DONDE SEA POSIBLE, soportar compresión gzip/brotli

**Constraints:**
| Constraint | Valor | Justificación |
|------------|-------|---------------|
| Response time P95 | < 200ms | UX fluida |
| Rate limit | 1000 req/min | Protección DDoS |
| Payload max | 10MB | Uploads razonables |
| Concurrent connections | 10000 | Escala enterprise |

**Success Criteria:**
- [ ] 99.9% uptime mensual
- [ ] 0 vulnerabilidades OWASP Top 10
- [ ] P95 latency < 200ms
- [ ] 100% de endpoints documentados en OpenAPI

**Test Scenarios:**
- TC-DASH-B001-01: Request sin token → 401 Unauthorized
- TC-DASH-B001-02: SQL injection attempt → Request sanitizado, no error
- TC-DASH-B001-03: 1001 requests/min → 429 retornado
- TC-DASH-B001-04: Tenant suspendido → 403 con mensaje claro

---

### SPEC-DASH-B002: Gestión de Manifiestos JSON

**Descripción:**
Servicio backend para almacenar, versionar y distribuir los manifiestos JSON que definen la UI móvil.

**Requirements (EARS):**

#### Ubiquitous
- El sistema SIEMPRE debe versionar cada cambio de manifiesto (semver)
- El sistema SIEMPRE debe validar esquema JSON antes de persistir
- El sistema SIEMPRE debe mantener historial de últimas 10 versiones

#### Event-Driven
- CUANDO se publica un manifiesto, ENTONCES notificar a Sync Engine para distribución
- CUANDO se solicita rollback, ENTONCES restaurar versión anterior y notificar
- CUANDO Guardian IA rechaza un manifiesto, ENTONCES registrar razón y bloquear

#### State-Driven
- SI el manifiesto es tipo "draft", ENTONCES no distribuir a dispositivos
- SI el manifiesto tiene dependencias, ENTONCES validar que existan
- SI hay conflicto de versiones, ENTONCES requerir merge manual

#### Unwanted
- El sistema NO DEBE distribuir manifiestos no validados por Guardian IA
- El sistema NO DEBE perder historial de versiones
- El sistema NO DEBE permitir referencias circulares entre manifiestos

**Constraints:**
| Constraint | Valor | Justificación |
|------------|-------|---------------|
| Max tamaño manifiesto | 500KB | Sync móvil eficiente |
| Versiones retenidas | 10 | Rollback rápido |
| Tiempo validación | < 5 seg | Flujo desarrollo ágil |

**Success Criteria:**
- [ ] 100% de manifiestos versionados
- [ ] Rollback exitoso en < 30 segundos
- [ ] 0 manifiestos inválidos en producción

**Test Scenarios:**
- TC-DASH-B002-01: Publicar manifiesto → Versión incrementada, sync triggered
- TC-DASH-B002-02: Manifiesto > 500KB → Error de validación
- TC-DASH-B002-03: Rollback v3 → v2 → v2 restaurada y distribuida
- TC-DASH-B002-04: Referencia circular → Detectada y bloqueada

---

### SPEC-DASH-B003: Motor de Reportes y Analytics

**Descripción:**
Servicio de generación de reportes y analytics sobre operaciones de la plataforma y datos de negocio.

**Requirements (EARS):**

#### Ubiquitous
- El sistema SIEMPRE debe ejecutar queries de reportes en réplica de lectura
- El sistema SIEMPRE debe cachear resultados de reportes frecuentes
- El sistema SIEMPRE debe respetar el aislamiento de datos por tenant

#### Event-Driven
- CUANDO se solicita un reporte pesado, ENTONCES procesarlo en background y notificar al completar
- CUANDO el reporte está listo, ENTONCES enviar email con link de descarga
- CUANDO expira el cache, ENTONCES regenerar en siguiente petición

#### State-Driven
- SI el reporte tiene > 100k filas, ENTONCES forzar exportación async
- SI el usuario solicita Excel, ENTONCES generar .xlsx con formato
- SI el período excede 1 año, ENTONCES advertir sobre tiempo de procesamiento

#### Unwanted
- El sistema NO DEBE ejecutar reportes pesados en la BD principal
- El sistema NO DEBE exponer datos de otros tenants en reportes
- El sistema NO DEBE generar reportes sin filtro de fecha (evitar full scan)

**Constraints:**
| Constraint | Valor | Justificación |
|------------|-------|---------------|
| Timeout reporte sync | 30 seg | UX razonable |
| Cache TTL | 15 min | Balance frescura/performance |
| Max filas export | 1M | Límite Excel |
| Período máximo | 2 años | Performance BD |

**Success Criteria:**
- [ ] Reportes < 10k filas en < 5 segundos
- [ ] 0 impacto en BD principal durante reportes
- [ ] 100% de reportes con datos correctos

**Test Scenarios:**
- TC-DASH-B003-01: Reporte 5k filas → Respuesta en < 5 seg
- TC-DASH-B003-02: Reporte 500k filas → Job async creado, email enviado
- TC-DASH-B003-03: Reporte sin filtro fecha → Error de validación
- TC-DASH-B003-04: Tenant A solicita datos Tenant B → 0 resultados

---

# PARTE 2: SERVICIOS INTERMEDIOS (GATEWAY)

### SPEC-GW-001: API Gateway Central

**Descripción:**
Punto de entrada único que gestiona autenticación, rate limiting, routing y transformación de requests hacia los microservicios internos.

**Requirements (EARS):**

#### Ubiquitous
- El sistema SIEMPRE debe validar autenticación antes de routing
- El sistema SIEMPRE debe registrar métricas de latencia por endpoint
- El sistema SIEMPRE debe aplicar rate limiting por tenant
- El sistema SIEMPRE debe balancear carga entre instancias de servicios

#### Event-Driven
- CUANDO llega un request, ENTONCES extraer tenant_id del token y enrutar
- CUANDO un servicio downstream falla, ENTONCES activar circuit breaker
- CUANDO se detecta ataque DDoS, ENTONCES activar modo de protección

#### State-Driven
- SI el circuit breaker está abierto, ENTONCES retornar 503 inmediatamente
- SI el tenant excede rate limit, ENTONCES encolar requests en vez de rechazar
- SI el servicio downstream tiene latencia > 5s, ENTONCES timeout y fallback

#### Unwanted
- El sistema NO DEBE exponer endpoints internos sin autenticación
- El sistema NO DEBE permitir request smuggling
- El sistema NO DEBE loguear datos sensibles (passwords, tokens completos)

#### Optional
- DONDE SEA POSIBLE, implementar request caching para GETs idempotentes
- DONDE SEA POSIBLE, comprimir responses > 1KB

**Constraints:**
| Constraint | Valor | Justificación |
|------------|-------|---------------|
| Latencia agregada | < 10ms | Overhead mínimo |
| Concurrent requests | 50000 | Escala enterprise |
| Circuit breaker threshold | 50% failures | Balance sensibilidad |
| Rate limit default | 1000 req/min/tenant | Uso fair |

**Success Criteria:**
- [ ] 99.99% uptime
- [ ] Latencia agregada < 10ms P99
- [ ] 0 requests sin autenticación a servicios internos
- [ ] Recovery automático tras falla de downstream

**Test Scenarios:**
- TC-GW-001-01: Request válido → Routing correcto, latencia < 10ms
- TC-GW-001-02: Servicio caído → Circuit breaker abre, 503 retornado
- TC-GW-001-03: 1001 req/min → Request 1001 encolado
- TC-GW-001-04: Token inválido → 401 antes de routing

---

### SPEC-GW-002: Servicio de Validación Externa (RENIEC/SUNAT)

**Descripción:**
Microservicio que integra con APIs externas gubernamentales para validación de identidad y datos fiscales.

**Requirements (EARS):**

#### Ubiquitous
- El sistema SIEMPRE debe cachear respuestas exitosas por 24 horas
- El sistema SIEMPRE debe reintentar en caso de timeout (max 3)
- El sistema SIEMPRE debe registrar todas las consultas para auditoría

#### Event-Driven
- CUANDO se solicita validación DNI, ENTONCES consultar RENIEC y retornar datos
- CUANDO se solicita validación RUC, ENTONCES consultar SUNAT y retornar estado
- CUANDO el servicio externo falla, ENTONCES retornar último valor cacheado si existe

#### State-Driven
- SI el DNI ya fue consultado en 24h, ENTONCES retornar desde cache
- SI el servicio externo está caído (circuit breaker), ENTONCES permitir modo degradado
- SI la respuesta indica DNI inválido, ENTONCES cachear resultado negativo por 1h

#### Unwanted
- El sistema NO DEBE exponer credenciales de APIs externas en logs
- El sistema NO DEBE permitir más de 1000 consultas/día por tenant (límite RENIEC)
- El sistema NO DEBE reintentar indefinidamente ante servicios caídos

#### Optional
- DONDE SEA POSIBLE, pre-validar formato de DNI antes de consulta externa
- DONDE SEA POSIBLE, enriquecer respuesta con datos adicionales (ubigeo)

**Constraints:**
| Constraint | Valor | Justificación |
|------------|-------|---------------|
| Timeout | 2000ms | Límite RENIEC |
| Cache TTL positivo | 24h | Datos estables |
| Cache TTL negativo | 1h | Permitir re-intento |
| Max retries | 3 | Balance tiempo/disponibilidad |
| Latencia objetivo | 145ms | Benchmark actual |

**Success Criteria:**
- [ ] 99% de consultas exitosas
- [ ] Latencia P95 < 200ms
- [ ] 0 credenciales expuestas
- [ ] 100% de consultas auditadas

**Test Scenarios:**
- TC-GW-002-01: DNI válido → Datos retornados en < 200ms
- TC-GW-002-02: DNI cacheado → Respuesta en < 10ms
- TC-GW-002-03: RENIEC timeout → Retry automático, respuesta en < 6s
- TC-GW-002-04: Cuota excedida → 429 con mensaje claro

---

### SPEC-GW-003: Servicio de Integración ERP (SAP/Oracle)

**Descripción:**
Conector middleware para sincronización bidireccional con sistemas ERP empresariales.

**Requirements (EARS):**

#### Ubiquitous
- El sistema SIEMPRE debe transformar datos al formato esperado por cada ERP
- El sistema SIEMPRE debe manejar transacciones con idempotencia
- El sistema SIEMPRE debe loguear payloads completos para debugging

#### Event-Driven
- CUANDO se crea un pedido en Kamaleon, ENTONCES replicar a ERP via RFC/BAPI
- CUANDO el ERP confirma recepción, ENTONCES actualizar estado en Kamaleon
- CUANDO hay conflicto de datos, ENTONCES encolar para resolución manual

#### State-Driven
- SI el pedido ya existe en ERP, ENTONCES actualizar en vez de crear
- SI el ERP retorna error de validación, ENTONCES marcar pedido como "Error ERP"
- SI la conexión al ERP falla, ENTONCES encolar y reintentar cada 5 min

#### Unwanted
- El sistema NO DEBE crear duplicados en ERP
- El sistema NO DEBE perder pedidos ante fallas de conexión
- El sistema NO DEBE exponer credenciales SAP en logs

#### Optional
- DONDE SEA POSIBLE, sincronizar stock en tiempo real
- DONDE SEA POSIBLE, obtener límites de crédito actualizados

**Constraints:**
| Constraint | Valor | Justificación |
|------------|-------|---------------|
| Timeout SAP | 5000ms | RFC típico |
| Retry interval | 5 min | Balance carga/velocidad |
| Max retries | 10 | Evitar pérdida |
| Latencia objetivo | 320ms | Benchmark actual |

**Success Criteria:**
- [ ] 99.8% de pedidos sincronizados exitosamente
- [ ] 0 duplicados en ERP
- [ ] Latencia P95 < 500ms
- [ ] Recovery completo tras caída de ERP

**Test Scenarios:**
- TC-GW-003-01: Pedido nuevo → Creado en SAP, ID retornado
- TC-GW-003-02: Pedido existente → Actualizado, no duplicado
- TC-GW-003-03: SAP caído 30 min → Pedidos encolados, sincronizados al recovery
- TC-GW-003-04: Error validación SAP → Pedido marcado "Error ERP"

---

# PARTE 3: CEREBRO IA & AUTOMATIZACIÓN

### SPEC-AI-001: Guardian IA - Firewall SQL

**Descripción:**
Motor de IA que analiza y valida todo código SQL antes de su distribución a dispositivos móviles, previniendo inyecciones y violaciones de políticas.

**Requirements (EARS):**

#### Ubiquitous
- El sistema SIEMPRE debe analizar queries SQL antes de aprobar distribución
- El sistema SIEMPRE debe consultar la base de conocimiento vectorial para contexto
- El sistema SIEMPRE debe explicar en lenguaje natural las razones de rechazo

#### Event-Driven
- CUANDO se detecta patrón destructivo (DROP, TRUNCATE), ENTONCES rechazar inmediatamente
- CUANDO se detecta posible inyección SQL, ENTONCES bloquear y alertar
- CUANDO la query viola política de negocio, ENTONCES rechazar con explicación

#### State-Driven
- SI el desarrollador tiene rol "Junior", ENTONCES aplicar validación estricta
- SI la query accede a tabla sensible (DEVICE_CUSTOMER), ENTONCES requerir aprobación adicional
- SI la confianza del análisis es < 80%, ENTONCES escalar a revisión humana

#### Unwanted
- El sistema NO DEBE aprobar queries con DROP, TRUNCATE, ALTER
- El sistema NO DEBE permitir acceso a columnas de datos sensibles sin filtro
- El sistema NO DEBE tener falsos negativos (aprobar código malicioso)

#### Optional
- DONDE SEA POSIBLE, sugerir correcciones para queries rechazadas
- DONDE SEA POSIBLE, aprender de correcciones manuales para mejorar

**Constraints:**
| Constraint | Valor | Justificación |
|------------|-------|---------------|
| Tiempo análisis | < 1 seg | Flujo desarrollo ágil |
| Falsos positivos | < 0.1% | No bloquear desarrollo |
| Falsos negativos | 0% | Seguridad absoluta |
| Latencia benchmark | 0.3 seg | Medición actual |

**Success Criteria:**
- [ ] 100% de bloqueo de queries destructivas
- [ ] Tasa de aprobación > 95% para código legítimo
- [ ] Feedback útil en 100% de rechazos
- [ ] Análisis en < 1 segundo

**Test Scenarios:**
- TC-AI-001-01: DROP TABLE → Rechazo inmediato con explicación
- TC-AI-001-02: SELECT con WHERE seguro → Aprobado en < 0.3s
- TC-AI-001-03: Descuento > 15% → Rechazo por política de negocio
- TC-AI-001-04: Query ambigua → Escalado a revisión humana

---

### SPEC-AI-002: Base de Conocimiento Vectorial (RAG)

**Descripción:**
Sistema de Retrieval-Augmented Generation que almacena y consulta documentación de políticas, manuales y reglas de negocio para contextualizar las decisiones de Guardian IA.

**Requirements (EARS):**

#### Ubiquitous
- El sistema SIEMPRE debe vectorizar documentos en chunks de 512 tokens
- El sistema SIEMPRE debe mantener índice actualizado tras cada ingesta
- El sistema SIEMPRE debe retornar top-5 chunks más relevantes por query

#### Event-Driven
- CUANDO se sube un nuevo documento, ENTONCES vectorizar e indexar
- CUANDO Guardian IA consulta contexto, ENTONCES realizar similarity search
- CUANDO se elimina un documento, ENTONCES remover vectores asociados

#### State-Driven
- SI el documento es PDF, ENTONCES extraer texto con OCR si es necesario
- SI la relevancia del chunk es < 0.7, ENTONCES no incluir en respuesta
- SI el índice no tiene chunks relevantes, ENTONCES indicar "sin contexto"

#### Unwanted
- El sistema NO DEBE retornar chunks de documentos de otros tenants
- El sistema NO DEBE vectorizar documentos corruptos o vacíos
- El sistema NO DEBE perder sincronización entre documento y vectores

#### Optional
- DONDE SEA POSIBLE, soportar múltiples idiomas
- DONDE SEA POSIBLE, auto-categorizar documentos

**Constraints:**
| Constraint | Valor | Justificación |
|------------|-------|---------------|
| Chunk size | 512 tokens | Balance contexto/precisión |
| Embedding model | text-embedding-3-large | Calidad/costo |
| Vector DB | Pinecone/Qdrant | Performance |
| Latencia search | < 100ms | UX guardian |

**Success Criteria:**
- [ ] 100% de documentos indexados correctamente
- [ ] Relevancia > 0.8 en top-1 chunk para queries específicas
- [ ] Latencia de búsqueda < 100ms
- [ ] Aislamiento perfecto entre tenants

**Test Scenarios:**
- TC-AI-002-01: Upload PDF política → Vectorizado e indexable
- TC-AI-002-02: Query "descuento máximo" → Chunk relevante retornado
- TC-AI-002-03: Tenant A busca en docs Tenant B → 0 resultados
- TC-AI-002-04: Documento corrupto → Error de ingesta, no indexado

---

### SPEC-AI-003: Motor de Automatización n8n

**Descripción:**
Plataforma de automatización de flujos de trabajo que orquesta procesos entre los diferentes componentes del ecosistema.

**Requirements (EARS):**

#### Ubiquitous
- El sistema SIEMPRE debe ejecutar workflows en modo transaccional
- El sistema SIEMPRE debe loguear cada paso de ejecución
- El sistema SIEMPRE debe notificar ante fallos de workflow

#### Event-Driven
- CUANDO se recibe webhook de nuevo pedido, ENTONCES ejecutar workflow de procesamiento
- CUANDO un workflow falla, ENTONCES reintentar según política configurada
- CUANDO se completa workflow crítico, ENTONCES enviar notificación

#### State-Driven
- SI el workflow tiene retry > 3, ENTONCES marcar como fallido y escalar
- SI el tenant tiene workflow personalizado, ENTONCES usar ese en vez del default
- SI es horario no laboral, ENTONCES encolar workflows no urgentes

#### Unwanted
- El sistema NO DEBE ejecutar workflows sin validar inputs
- El sistema NO DEBE perder eventos ante caídas
- El sistema NO DEBE exponer credenciales en logs de workflow

#### Optional
- DONDE SEA POSIBLE, paralelizar pasos independientes
- DONDE SEA POSIBLE, ofrecer editor visual de workflows

**Constraints:**
| Constraint | Valor | Justificación |
|------------|-------|---------------|
| Max execution time | 5 min | Evitar bloqueos |
| Max retries | 3 | Balance confiabilidad |
| Concurrent workflows | 100 | Capacidad servidor |
| Event retention | 7 días | Debugging |

**Success Criteria:**
- [ ] 99.9% de workflows completados exitosamente
- [ ] 0 eventos perdidos
- [ ] Latencia de trigger < 1 segundo
- [ ] 100% de pasos logueados

**Test Scenarios:**
- TC-AI-003-01: Webhook pedido → Workflow ejecutado en < 1s
- TC-AI-003-02: Paso falla → Retry automático hasta 3 veces
- TC-AI-003-03: n8n reinicia → Workflows pendientes retomados
- TC-AI-003-04: Workflow > 5 min → Timeout y notificación

---

### SPEC-AI-004: Agente de Soporte Inteligente

**Descripción:**
Chatbot con IA que asiste a vendedores en campo respondiendo preguntas sobre productos, políticas y procedimientos.

**Requirements (EARS):**

#### Ubiquitous
- El sistema SIEMPRE debe responder en < 3 segundos
- El sistema SIEMPRE debe citar la fuente de la información
- El sistema SIEMPRE debe mantener contexto de la conversación

#### Event-Driven
- CUANDO el usuario hace una pregunta, ENTONCES consultar RAG y generar respuesta
- CUANDO la confianza es baja, ENTONCES ofrecer escalar a humano
- CUANDO se detecta frustración, ENTONCES transferir a agente humano

#### State-Driven
- SI la pregunta es sobre precios, ENTONCES consultar catálogo actualizado
- SI el usuario es nuevo, ENTONCES ofrecer tour guiado
- SI es horario no laboral, ENTONCES indicar tiempos de respuesta humana

#### Unwanted
- El sistema NO DEBE inventar información no presente en knowledge base
- El sistema NO DEBE revelar datos de otros clientes
- El sistema NO DEBE procesar requests que violen políticas de uso

#### Optional
- DONDE SEA POSIBLE, ofrecer respuestas en múltiples idiomas
- DONDE SEA POSIBLE, sugerir preguntas frecuentes relacionadas

**Constraints:**
| Constraint | Valor | Justificación |
|------------|-------|---------------|
| Response time | < 3 seg | UX conversacional |
| Context window | 10 mensajes | Memoria razonable |
| Confidence threshold | 0.7 | Balance precision/recall |

**Success Criteria:**
- [ ] 80% de preguntas resueltas sin escalar
- [ ] Satisfacción usuario > 4/5
- [ ] 0 respuestas con información falsa
- [ ] Latencia < 3 segundos

**Test Scenarios:**
- TC-AI-004-01: "¿Precio producto X?" → Respuesta con precio actual
- TC-AI-004-02: Pregunta fuera de scope → "No tengo esa información"
- TC-AI-004-03: 5 preguntas sin resolver → Oferta de escalar
- TC-AI-004-04: Pregunta sobre otro cliente → Rechazo cortés

---

# PARTE 4: APLICACIÓN MÓVIL

## 4.1 App Frontend (Kotlin/Jetpack Compose)

### SPEC-APP-F001: Motor de Renderizado SDUI

**Descripción:**
Engine que interpreta manifiestos JSON del servidor y renderiza interfaces nativas de alto rendimiento usando Jetpack Compose.

**Requirements (EARS):**

#### Ubiquitous
- El sistema SIEMPRE debe renderizar componentes nativos (no WebView)
- El sistema SIEMPRE debe mantener 60fps durante scroll y animaciones
- El sistema SIEMPRE debe cachear manifiestos localmente

#### Event-Driven
- CUANDO se recibe nuevo manifiesto, ENTONCES re-renderizar UI afectada
- CUANDO un componente requiere data, ENTONCES ejecutar query SQL local
- CUANDO el usuario interactúa, ENTONCES ejecutar acción definida en manifiesto

#### State-Driven
- SI el manifiesto incluye @context_param, ENTONCES inyectar valor de sesión
- SI el componente tiene visibility_rule, ENTONCES evaluar antes de renderizar
- SI no hay manifiesto cacheado, ENTONCES mostrar UI de fallback

#### Unwanted
- El sistema NO DEBE renderizar componentes no definidos en biblioteca
- El sistema NO DEBE bloquear UI durante carga de datos
- El sistema NO DEBE ejecutar queries no validadas por Guardian IA

#### Optional
- DONDE SEA POSIBLE, pre-renderizar pantallas probables
- DONDE SEA POSIBLE, animar transiciones entre estados

**Constraints:**
| Constraint | Valor | Justificación |
|------------|-------|---------------|
| Frame rate | 60fps | UX premium |
| Render time | < 100ms | Percepción instantánea |
| Memory per screen | < 50MB | Dispositivos gama media |
| Max components | 50/screen | Performance |

**Success Criteria:**
- [ ] 60fps en 95% de interacciones
- [ ] Render inicial < 100ms
- [ ] 0 crashes por manifiestos inválidos
- [ ] UI funcional 100% offline

**Test Scenarios:**
- TC-APP-F001-01: Manifiesto válido → UI renderizada en < 100ms
- TC-APP-F001-02: Dropdown con query → Opciones cargadas desde SQLite
- TC-APP-F001-03: Componente desconocido → Fallback a placeholder
- TC-APP-F001-04: Sin conexión → UI de cache funcional

---

### SPEC-APP-F002: Sistema de Formularios Dinámicos

**Descripción:**
Framework para renderizar y gestionar formularios complejos con validaciones, dependencias y lógica condicional definida en el servidor.

**Requirements (EARS):**

#### Ubiquitous
- El sistema SIEMPRE debe validar campos según reglas del manifiesto
- El sistema SIEMPRE debe guardar borrador automáticamente cada 30 segundos
- El sistema SIEMPRE debe mostrar errores de validación inline

#### Event-Driven
- CUANDO el usuario sale de un campo (ON_EXIT), ENTONCES ejecutar validaciones y triggers
- CUANDO un campo cambia, ENTONCES re-evaluar campos dependientes
- CUANDO el formulario es válido, ENTONCES habilitar botón de envío

#### State-Driven
- SI el campo tiene trigger externo, ENTONCES invocar Gateway (ej: RENIEC)
- SI el campo es requerido y vacío, ENTONCES mostrar error
- SI existe borrador guardado, ENTONCES preguntar si restaurar

#### Unwanted
- El sistema NO DEBE enviar formularios con campos inválidos
- El sistema NO DEBE perder datos ante cierre accidental
- El sistema NO DEBE bloquear UI durante validaciones async

#### Optional
- DONDE SEA POSIBLE, autocompletar desde respuestas anteriores
- DONDE SEA POSIBLE, ofrecer entrada por voz

**Constraints:**
| Constraint | Valor | Justificación |
|------------|-------|---------------|
| Auto-save interval | 30 seg | Balance batería/seguridad |
| Validation feedback | < 100ms | UX responsiva |
| Max fields/form | 100 | Usabilidad |
| Draft retention | 7 días | Recovery razonable |

**Success Criteria:**
- [ ] 0 pérdida de datos por cierre accidental
- [ ] 100% de validaciones ejecutadas antes de envío
- [ ] Feedback de error en < 100ms
- [ ] Restauración de borrador exitosa

**Test Scenarios:**
- TC-APP-F002-01: Campo requerido vacío → Error inline mostrado
- TC-APP-F002-02: ON_EXIT DNI → RENIEC invocado, nombre autocompletado
- TC-APP-F002-03: App cerrada con datos → Borrador guardado
- TC-APP-F002-04: Reabrir formulario → Oferta de restaurar borrador

---

### SPEC-APP-F003: Motor de Impresión Térmica

**Descripción:**
Módulo que genera y envía comandos ESC/POS a impresoras térmicas Bluetooth para tickets y facturas.

**Requirements (EARS):**

#### Ubiquitous
- El sistema SIEMPRE debe descubrir impresoras Bluetooth disponibles
- El sistema SIEMPRE debe generar comandos ESC/POS estándar
- El sistema SIEMPRE debe reintentar impresión ante fallo de conexión

#### Event-Driven
- CUANDO el usuario solicita imprimir, ENTONCES generar buffer ESC/POS y enviar
- CUANDO la impresora desconecta, ENTONCES intentar reconexión automática
- CUANDO la impresión falla, ENTONCES encolar y reintentar

#### State-Driven
- SI la plantilla incluye QR, ENTONCES generar bitmap y embeber
- SI la impresora es 58mm vs 80mm, ENTONCES ajustar layout
- SI hay tickets pendientes, ENTONCES mostrar indicador y opción de reintento

#### Unwanted
- El sistema NO DEBE perder tickets por fallas de Bluetooth
- El sistema NO DEBE imprimir tickets incompletos
- El sistema NO DEBE bloquear UI durante impresión

#### Optional
- DONDE SEA POSIBLE, mostrar preview antes de imprimir
- DONDE SEA POSIBLE, soportar impresoras USB

**Constraints:**
| Constraint | Valor | Justificación |
|------------|-------|---------------|
| Tiempo generación | < 2 seg | UX aceptable |
| Queue max | 50 tickets | Memoria razonable |
| Retry attempts | 3 | Balance confiabilidad |
| BT reconnect timeout | 10 seg | No bloquear mucho |

**Success Criteria:**
- [ ] 99% de tickets impresos exitosamente
- [ ] 0 tickets perdidos
- [ ] QR legible en 99% de impresiones
- [ ] Impresión en < 5 segundos

**Test Scenarios:**
- TC-APP-F003-01: Imprimir ticket → Salida en < 5 segundos
- TC-APP-F003-02: BT desconecta → Reconexión y reintento automático
- TC-APP-F003-03: Cola de 10 tickets → Todos impresos en orden
- TC-APP-F003-04: Sin impresora → Ticket encolado para después

---

## 4.2 App Backend (SQLite Local)

### SPEC-APP-B001: Motor de Base de Datos SQLite

**Descripción:**
Capa de persistencia local que almacena datos operativos, catálogos y transacciones pendientes de sincronización.

**Requirements (EARS):**

#### Ubiquitous
- El sistema SIEMPRE debe ejecutar queries con transacciones ACID
- El sistema SIEMPRE debe cifrar la base de datos con SQLCipher
- El sistema SIEMPRE debe mantener índices optimizados

#### Event-Driven
- CUANDO se inserta un registro transaccional, ENTONCES marcar como pending_sync
- CUANDO sync confirma recepción, ENTONCES actualizar flag sync_status
- CUANDO se detecta corrupción, ENTONCES restaurar desde backup

#### State-Driven
- SI la tabla es DEVICE_ORDER, ENTONCES usar Write-Ahead Logging
- SI el storage disponible < 100MB, ENTONCES alertar y limpiar cache
- SI existe backup de emergencia, ENTONCES restaurar ante corrupción

#### Unwanted
- El sistema NO DEBE ejecutar queries sin transacción en tablas críticas
- El sistema NO DEBE almacenar credenciales en texto plano
- El sistema NO DEBE perder datos ante cierre abrupto

#### Optional
- DONDE SEA POSIBLE, comprimir datos históricos
- DONDE SEA POSIBLE, particionar tablas grandes por fecha

**Constraints:**
| Constraint | Valor | Justificación |
|------------|-------|---------------|
| Max DB size | 500MB | Dispositivos típicos |
| Query timeout | 5 seg | Evitar bloqueos |
| Backup frequency | Diario | Recovery point |
| Encryption | SQLCipher AES-256 | Seguridad datos |

**Success Criteria:**
- [ ] 0 pérdida de datos en operación normal
- [ ] Queries < 100ms para operaciones típicas
- [ ] Recovery exitoso ante corrupción
- [ ] Cifrado verificable

**Test Scenarios:**
- TC-APP-B001-01: Insert pedido → Transacción completa, pending_sync=true
- TC-APP-B001-02: App killed durante write → Datos consistentes al reabrir
- TC-APP-B001-03: DB corrupta → Restauración desde backup
- TC-APP-B001-04: Storage bajo → Alerta mostrada, limpieza sugerida

---

### SPEC-APP-B002: Motor de Cálculo Local

**Descripción:**
Engine que ejecuta cálculos de precios, impuestos y descuentos localmente sin depender de conexión.

**Requirements (EARS):**

#### Ubiquitous
- El sistema SIEMPRE debe calcular precios usando reglas sincronizadas
- El sistema SIEMPRE debe aplicar impuestos según configuración del país
- El sistema SIEMPRE debe mostrar desglose completo al usuario

#### Event-Driven
- CUANDO se agrega item al carrito, ENTONCES recalcular totales
- CUANDO cambia cantidad, ENTONCES aplicar reglas de volumen
- CUANDO se aplica cupón, ENTONCES validar y calcular descuento

#### State-Driven
- SI el cliente tiene precio especial, ENTONCES usar lista de precios asignada
- SI el país es Perú, ENTONCES aplicar IGV 18%
- SI el total > umbral, ENTONCES aplicar descuento por volumen

#### Unwanted
- El sistema NO DEBE mostrar precios diferentes a los sincronizados
- El sistema NO DEBE aplicar descuentos no autorizados
- El sistema NO DEBE calcular impuestos incorrectos

#### Optional
- DONDE SEA POSIBLE, mostrar ahorro vs precio regular
- DONDE SEA POSIBLE, sugerir productos para alcanzar descuento

**Constraints:**
| Constraint | Valor | Justificación |
|------------|-------|---------------|
| Cálculo time | < 50ms | UX fluida |
| Precisión decimal | 2 decimales | Estándar monetario |
| Max items carrito | 500 | Caso extremo |

**Success Criteria:**
- [ ] 100% de cálculos coinciden con backend
- [ ] Latencia < 50ms para 100 items
- [ ] 0 errores de redondeo
- [ ] Cumplimiento fiscal 100%

**Test Scenarios:**
- TC-APP-B002-01: Agregar item → Subtotal + IGV calculados correctamente
- TC-APP-B002-02: Cliente VIP → Precio especial aplicado
- TC-APP-B002-03: 100 items variados → Cálculo < 50ms
- TC-APP-B002-04: Cupón válido → Descuento aplicado correctamente

---

# PARTE 5: SYNC ENGINE

### SPEC-SYNC-001: Motor de Sincronización Diferencial

**Descripción:**
Sistema que gestiona la sincronización bidireccional entre dispositivos móviles y el servidor, optimizando ancho de banda y batería.

**Requirements (EARS):**

#### Ubiquitous
- El sistema SIEMPRE debe usar delta sync (solo cambios)
- El sistema SIEMPRE debe priorizar datos transaccionales sobre maestros
- El sistema SIEMPRE debe ejecutar en background sin bloquear UI

#### Event-Driven
- CUANDO hay conectividad, ENTONCES iniciar ciclo de sincronización
- CUANDO sync completa, ENTONCES actualizar timestamp de última sync
- CUANDO hay conflicto, ENTONCES aplicar estrategia configurada (server-wins/merge)

#### State-Driven
- SI la tabla es DEVICE_ORDER, ENTONCES sync cada 5 minutos
- SI la tabla es DEVICE_PRODUCT, ENTONCES sync cada 2 horas
- SI es WiFi vs móvil, ENTONCES ajustar batch size

#### Unwanted
- El sistema NO DEBE re-descargar datos sin cambios
- El sistema NO DEBE perder transacciones ante fallas
- El sistema NO DEBE drenar batería excesivamente

#### Optional
- DONDE SEA POSIBLE, comprimir payloads con gzip
- DONDE SEA POSIBLE, sincronizar en horarios de bajo uso

**Constraints:**
| Constraint | Valor | Justificación |
|------------|-------|---------------|
| Velocidad sync | 45 MB/s | Benchmark actual |
| Intervalo pedidos | 5 min | Criticidad alta |
| Intervalo catálogo | 2 horas | Cambios lentos |
| Battery impact | < 5%/hora | UX aceptable |

**Success Criteria:**
- [ ] 100% de transacciones sincronizadas eventualmente
- [ ] Reducción 80% de data transfer vs full sync
- [ ] Pedido visible en servidor en < 6 minutos
- [ ] Battery drain < 5% hora de sync activo

**Test Scenarios:**
- TC-SYNC-001-01: Nuevo pedido → Sincronizado en < 6 min
- TC-SYNC-001-02: Sin cambios → 0 bytes transferidos
- TC-SYNC-001-03: Offline 2 horas → Todos los pedidos synced al reconectar
- TC-SYNC-001-04: Conflicto → Estrategia server-wins aplicada

---

### SPEC-SYNC-002: Gestión de Conflictos

**Descripción:**
Sistema de resolución de conflictos cuando el mismo registro es modificado en servidor y dispositivo.

**Requirements (EARS):**

#### Ubiquitous
- El sistema SIEMPRE debe detectar conflictos usando versión/timestamp
- El sistema SIEMPRE debe preservar ambas versiones ante conflicto
- El sistema SIEMPRE debe notificar al usuario sobre conflictos no resueltos

#### Event-Driven
- CUANDO se detecta conflicto, ENTONCES aplicar estrategia según tipo de dato
- CUANDO el usuario resuelve manualmente, ENTONCES propagar resolución
- CUANDO el conflicto persiste, ENTONCES escalar a supervisor

#### State-Driven
- SI el conflicto es en datos maestros, ENTONCES server-wins
- SI el conflicto es en transacciones, ENTONCES preservar ambos y merge
- SI el conflicto no se resuelve en 24h, ENTONCES escalar

#### Unwanted
- El sistema NO DEBE perder datos de ninguna versión en conflicto
- El sistema NO DEBE resolver silenciosamente conflictos en transacciones
- El sistema NO DEBE crear duplicados por conflictos mal resueltos

#### Optional
- DONDE SEA POSIBLE, auto-merge campos no conflictivos
- DONDE SEA POSIBLE, mostrar diff visual al usuario

**Constraints:**
| Constraint | Valor | Justificación |
|------------|-------|---------------|
| Detection latency | < 1 sync cycle | Detectar temprano |
| Resolution timeout | 24 horas | Operación continua |
| Max conflicts/device | 100 | Señal de problema |

**Success Criteria:**
- [ ] 100% de conflictos detectados
- [ ] 0 pérdida de datos por conflictos
- [ ] 90% de conflictos resueltos automáticamente
- [ ] Escalamiento efectivo de conflictos críticos

**Test Scenarios:**
- TC-SYNC-002-01: Mismo cliente editado → Conflicto detectado
- TC-SYNC-002-02: Conflicto en maestro → Server-wins aplicado
- TC-SYNC-002-03: Conflicto en pedido → Ambas versiones preservadas
- TC-SYNC-002-04: 101 conflictos → Alerta de problema sistémico

---

# PARTE 6: CI/CD & TESTING

### SPEC-CICD-001: Pipeline de Integración Continua

**Descripción:**
Pipeline automatizado que valida, construye y despliega los diferentes componentes del ecosistema.

**Requirements (EARS):**

#### Ubiquitous
- El sistema SIEMPRE debe ejecutar tests antes de merge
- El sistema SIEMPRE debe validar linting y formato de código
- El sistema SIEMPRE debe generar artifacts versionados

#### Event-Driven
- CUANDO se crea PR, ENTONCES ejecutar pipeline de validación
- CUANDO tests fallan, ENTONCES bloquear merge y notificar
- CUANDO merge a main, ENTONCES trigger deployment a staging

#### State-Driven
- SI es branch feature, ENTONCES solo ejecutar tests unitarios
- SI es branch main, ENTONCES ejecutar suite completa + deploy
- SI es hotfix, ENTONCES fast-track con tests críticos

#### Unwanted
- El sistema NO DEBE permitir merge sin tests pasando
- El sistema NO DEBE desplegar sin validación de seguridad
- El sistema NO DEBE exponer secrets en logs de CI

#### Optional
- DONDE SEA POSIBLE, paralelizar jobs de test
- DONDE SEA POSIBLE, cachear dependencias entre builds

**Constraints:**
| Constraint | Valor | Justificación |
|------------|-------|---------------|
| Build time | < 10 min | Developer productivity |
| Test coverage | > 80% | Calidad mínima |
| Security scan | SAST + DAST | Compliance |

**Success Criteria:**
- [ ] 100% de PRs validados por pipeline
- [ ] Build time < 10 minutos
- [ ] 0 deploys con tests fallando
- [ ] Coverage > 80% mantenido

**Test Scenarios:**
- TC-CICD-001-01: PR con tests pasando → Merge habilitado
- TC-CICD-001-02: PR con test fallando → Merge bloqueado
- TC-CICD-001-03: Merge a main → Deploy a staging automático
- TC-CICD-001-04: Hotfix → Pipeline fast-track ejecutado

---

### SPEC-CICD-002: Testing Automatizado End-to-End

**Descripción:**
Suite de tests que valida flujos completos desde el dispositivo móvil hasta el backend.

**Requirements (EARS):**

#### Ubiquitous
- El sistema SIEMPRE debe probar flujos críticos de negocio
- El sistema SIEMPRE debe ejecutar en ambiente aislado
- El sistema SIEMPRE debe generar reportes detallados

#### Event-Driven
- CUANDO se ejecuta suite E2E, ENTONCES levantar ambiente completo
- CUANDO un test falla, ENTONCES capturar screenshots y logs
- CUANDO suite completa, ENTONCES publicar reporte

#### State-Driven
- SI es nightly build, ENTONCES ejecutar suite completa
- SI es PR, ENTONCES ejecutar subset de smoke tests
- SI hay flaky test, ENTONCES reintentar hasta 3 veces

#### Unwanted
- El sistema NO DEBE usar datos de producción en tests
- El sistema NO DEBE dejar recursos huérfanos post-test
- El sistema NO DEBE tener tests dependientes de orden

#### Optional
- DONDE SEA POSIBLE, ejecutar tests en paralelo
- DONDE SEA POSIBLE, grabar video de ejecución

**Constraints:**
| Constraint | Valor | Justificación |
|------------|-------|---------------|
| E2E suite time | < 30 min | Feedback razonable |
| Flaky rate | < 5% | Confiabilidad |
| Coverage flows | 100% críticos | Negocio protegido |

**Success Criteria:**
- [ ] 100% de flujos críticos cubiertos
- [ ] Flaky rate < 5%
- [ ] Tiempo de ejecución < 30 minutos
- [ ] Reportes accionables generados

**Test Scenarios:**
- TC-CICD-002-01: Flujo pedido completo → E2E pass
- TC-CICD-002-02: Test falla → Screenshot + logs capturados
- TC-CICD-002-03: Flaky test → Reintento exitoso
- TC-CICD-002-04: Suite completa → Reporte HTML publicado

---

### SPEC-CICD-003: Despliegue de Módulos Móviles (OTA)

**Descripción:**
Sistema de actualización Over-The-Air que distribuye nuevos manifiestos y configuraciones a dispositivos sin requerir actualización de app store.

**Requirements (EARS):**

#### Ubiquitous
- El sistema SIEMPRE debe versionar cada release de módulo
- El sistema SIEMPRE debe permitir rollback instantáneo
- El sistema SIEMPRE debe validar integridad de paquetes

#### Event-Driven
- CUANDO se publica nuevo módulo, ENTONCES notificar a dispositivos elegibles
- CUANDO dispositivo descarga update, ENTONCES verificar checksum
- CUANDO update falla, ENTONCES mantener versión anterior

#### State-Driven
- SI el dispositivo está en grupo beta, ENTONCES recibir updates primero
- SI el módulo es crítico, ENTONCES forzar update antes de operar
- SI hay rollback activo, ENTONCES revertir todos los dispositivos

#### Unwanted
- El sistema NO DEBE distribuir módulos no validados por Guardian IA
- El sistema NO DEBE corromper datos locales durante update
- El sistema NO DEBE forzar update durante operación activa

#### Optional
- DONDE SEA POSIBLE, pre-descargar updates en background
- DONDE SEA POSIBLE, aplicar updates en horario de bajo uso

**Constraints:**
| Constraint | Valor | Justificación |
|------------|-------|---------------|
| Rollback time | < 1 min | Recovery rápido |
| Update size max | 10MB | Bandwidth móvil |
| Beta group | 5% flota | Detección temprana |

**Success Criteria:**
- [ ] 100% de dispositivos actualizados en < 24h
- [ ] 0 dispositivos corrompidos por update
- [ ] Rollback efectivo en < 1 minuto
- [ ] 99% de updates exitosos

**Test Scenarios:**
- TC-CICD-003-01: Nuevo módulo → Dispositivos beta actualizados primero
- TC-CICD-003-02: Update corrupto → Dispositivo mantiene versión anterior
- TC-CICD-003-03: Rollback → Todos los dispositivos revertidos
- TC-CICD-003-04: Update durante pedido → Pospuesto hasta terminar

---

## Resumen de SPECs por Componente

| Componente | SPECs | Prioridad |
|------------|-------|-----------|
| **Dashboard Frontend** | DASH-F001 a F005 | Alta |
| **Dashboard Backend** | DASH-B001 a B003 | Alta |
| **Gateway/Middleware** | GW-001 a GW-003 | Alta |
| **Cerebro IA** | AI-001 a AI-004 | Alta |
| **App Frontend** | APP-F001 a F003 | Crítica |
| **App Backend** | APP-B001 a B002 | Crítica |
| **Sync Engine** | SYNC-001 a SYNC-002 | Crítica |
| **CI/CD & Testing** | CICD-001 a CICD-003 | Alta |

---

## Referencias

- **Análisis Kamaleon:** [research/Análisis de Sistema Kamaleon_Meleon.pdf](../research/)
- **Especificaciones Técnicas:** [research/Especificaciones Técnicas SPEC & EARS.pdf](../research/)
- **MoAI-ADK Repository:** https://github.com/softvibeslab/moai-adk
