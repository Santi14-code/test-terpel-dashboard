# ANÁLISIS DE IMPACTO: REEMPLAZO DE SALESFORCE
## Terpel - Arquitectura Empresarial NexusT

**Fecha:** 9 de Febrero, 2026  
**Sistema Analizado:** SalesForce CRM  
**Criticidad:** 🔴 CRÍTICA  
**Nivel de Impacto:** 🔴 MUY ALTO (Score: 82/100)

---

## 📋 RESUMEN EJECUTIVO

Este análisis evalúa el impacto técnico, operacional y de negocio de reemplazar SalesForce como sistema CRM principal de Terpel. Los datos provienen directamente de la base de datos de Arquitectura Empresarial NexusT.

### Conclusión Clave

**⚠️ El reemplazo de SalesForce representa un proyecto de transformación de MUY ALTO IMPACTO** que requiere:
- **30-45 meses** de duración con equipo de 10 FTEs
- **Alto riesgo operacional** por criticidad del sistema
- **Coordinación compleja** con 20 integraciones activas
- **Evaluación exhaustiva de alternativas** antes de comprometer al proyecto

---

## 📊 DIMENSIONES DEL IMPACTO

### Impacto Técnico

| Dimensión | Cantidad | Nivel de Riesgo |
|-----------|----------|----------------|
| **Módulos funcionales** | 15 | 🔴 Alto |
| **Interfaces de integración** | 20 | 🔴 Muy Alto |
| **Procesos de negocio** | 9 subprocesos | 🟠 Alto |
| **Tecnologías cloud específicas** | 5 | 🟡 Medio |
| **Componentes con datos personales** | 0 | 🟢 Bajo |

### Complejidad de Integraciones

**20 interfaces activas** que requieren re-implementación o reconexión:

**APIs REST (13):**
- Salesforce REST API estándar
- Salesforce Flow API (automatizaciones)
- Marketing Cloud Social API
- Journey Builder API
- Personalization API
- Content Builder API
- Email Studio API
- Mobile Push API
- Data Extensions API
- CDP API
- Service Cloud API
- Einstein API
- Reporting API

**Otras tecnologías (7):**
- Salesforce SOAP API (1)
- Platform Events - Mensajería (3)
- GraphQL API (1)
- OAuth/OIDC Connector (1)
- Adaptador personalizado (1)

### Impacto en Áreas de Negocio

| Macroproceso | Categoría | Subprocesos | Criticidad |
|--------------|-----------|-------------|------------|
| **Gestión de la comercialización** | Operativos | 5 | 🔴 Crítico |
| **Gestión de gobierno del dato** | Corporativos | 3 | 🟠 Alto |
| **Gestión legal y jurídica** | Corporativos | 1 | 🟢 Medio |

#### Detalle de Procesos Críticos Impactados

**Gestión de Ventas:**
- Propuestas comerciales [Relación: Principal]
- Gestión de visitas comerciales [Relación: Principal]

**Gestión de Clientes:**
- Gestión comercial de clientes [Relación: Principal]
- Gestión seguimiento clientes actuales [Relación: Principal]
- Creación, activación y configuración de cliente [Relación: Principal]

**Gestión del Dato Maestro:**
- Creación de clientes nacional y destino [Relación: Principal]
- Modificación de destinos [Relación: Principal]
- Bloqueo y desbloqueo de clientes [Relación: Principal]

**Gestión Contractual:**
- Gestión solicitud contratos clientes aviación [Relación: Principal]

---

## ⚙️ MÓDULOS FUNCIONALES A MIGRAR

SalesForce actual está compuesto por **15 módulos funcionales** que requieren evaluación individual:

### Marketing Cloud (4 módulos)
1. **Social Studio** - Gestión de redes sociales, escucha y engagement
2. **Journey Builder** - Orquestación de experiencias y customer journeys
3. **Personalization Builder** - Motor de personalización en tiempo real
4. **Content Builder** - Gestión centralizada de contenido

### Data Cloud (3 módulos)
5. **Unificación de Perfiles** - Single view of customer
6. **Segmentación Avanzada** - Segmentos dinámicos y comportamentales
7. **Activación de Datos** - Integración cross-cloud

### Service Cloud (3 módulos)
8. **Gestión de Casos** - Ciclo de vida de atención al cliente
9. **Omnicanal** - Atención multicanal orquestada
10. **Base de Conocimiento** - Self-service y soporte interno

### Sales Cloud (2 módulos)
11. **Gestión de Oportunidades** - Pipeline comercial
12. **Pronósticos Comerciales** - Forecasting y analytics

### Loyalty & Experience (3 módulos)
13. **Fielo Loyalty** - Programas de lealtad B2C y B2B
14. **Gestión de Campañas** - Ejecución multicanal
15. **Analytics & Reporting** - Dashboards ejecutivos

---

## 🛠️ CONSIDERACIONES TECNOLÓGICAS

### Stack Tecnológico Actual

**Tecnologías cloud específicas de Salesforce:**
- Salesforce Data Cloud
- Salesforce Marketing Cloud
- Salesforce Sales Cloud
- Salesforce Service Cloud
- Salesforce Fielo (Loyalty)

**Implicaciones:**
- ✓ No hay infraestructura on-premise que migrar
- ✓ No hay servidores ni hardware que des-aprovisionar
- ⚠️ Habilidades del equipo altamente especializadas en Salesforce
- ⚠️ Integraciones profundamente acopladas al ecosistema Salesforce
- ⚠️ Dependencia de APIs y servicios propietarios

### Infraestructura

**Modelo de servicio:** SaaS  
**Plataforma:** Salesforce Cloud (multi-tenant)  
**Despliegues on-premise:** Ninguno

---

## ⏱️ ESTIMACIÓN DE ESFUERZO

### Timeline del Proyecto

**Duración base:** 30 meses  
**Con contingencia (recomendado):** 45 meses

### Recursos Necesarios

**Equipo core:** 10 FTEs

**Perfiles requeridos:**
- 1 Arquitecto de Solución (lidera diseño técnico)
- 3 Desarrolladores Full-Stack (implementación)
- 1 Especialista en Integración / APIs
- 1 Ingeniero de Datos / DBA (migración)
- 2 Ingenieros de QA / Testing
- 1 Product Owner (backlog y priorización)
- 1 Change Manager (adopción)

### Fases Críticas

| Fase | Duración | Riesgos Principales |
|------|----------|-------------------|
| **1. Discovery y Arquitectura** | 4-6 semanas | Diseño inadecuado, omisión de requisitos |
| **2. Migración de Datos** | 8-12 semanas | Pérdida de datos, corrupción, inconsistencias |
| **3. Re-implementación de APIs** | 12-16 semanas | Downtime de integraciones, bugs en producción |
| **4. Validación con Negocio** | 6-8 semanas | Rechazo de usuarios, funcionalidades faltantes |
| **5. Capacitación** | 4-6 semanas | Resistencia al cambio, curva de aprendizaje |
| **6. Hypercare Post Go-Live** | 4-8 semanas | Incidentes críticos, rollback necesario |

**Total estimado:** 38-56 semanas para el core path (sin contar paralelización)

---

## 🚨 RIESGOS PRINCIPALES

### Riesgos de Alto Impacto

#### 🔴 Riesgo Crítico #1: Pérdida o Corrupción de Datos Históricos
- **Probabilidad:** Media
- **Impacto:** Catastrófico
- **Mitigación:** Backup completo, dry-runs múltiples, validación exhaustiva post-migración

#### 🔴 Riesgo Crítico #2: Downtime de Integraciones Críticas
- **Probabilidad:** Alta
- **Impacto:** Muy Alto
- **Mitigación:** Stub services, feature flags, rollback automático, testing en producción

#### 🟠 Riesgo Alto #3: Resistencia al Cambio de Usuarios
- **Probabilidad:** Alta
- **Impacto:** Alto
- **Mitigación:** Change management desde día 1, champions por área, training continuo

#### 🟠 Riesgo Alto #4: Funcionalidades Custom No Soportadas
- **Probabilidad:** Media-Alta
- **Impacto:** Alto
- **Mitigación:** Gap analysis exhaustivo en discovery, priorización de must-haves

#### 🟡 Riesgo Medio #5: Capacidad del Equipo
- **Probabilidad:** Baja-Media
- **Impacto:** Medio
- **Mitigación:** Contratación de consultores especializados, training intensivo

---

## 💼 CONSIDERACIONES ESTRATÉGICAS

### Factores de Decisión

**A favor del reemplazo:**
- ✅ Reducción potencial de costos de licenciamiento (a validar con business case)
- ✅ Mayor control sobre roadmap y personalizaciones
- ✅ Posible mejor alineación con stack tecnológico corporativo
- ✅ Oportunidad de modernizar arquitectura y eliminar deuda técnica

**En contra del reemplazo:**
- ❌ Sistema **CRÍTICO** para operación comercial - zero downtime requerido
- ❌ **20 integraciones activas** - alto acoplamiento con ecosistema
- ❌ Ecosistema Salesforce maduro con funcionalidades probadas
- ❌ Timeline extenso (30-45 meses) con inversión significativa
- ❌ Alto riesgo de disrupción operativa durante transición
- ❌ Pérdida de expertise actual del equipo en Salesforce

### Preguntas Críticas para el Comité Ejecutivo

1. **ROI:** ¿El ahorro en licencias justifica la inversión de 30-45 meses de un equipo de 10 personas?

2. **Riesgo operacional:** ¿Estamos dispuestos a aceptar el riesgo de disrupciones en ventas y servicio al cliente durante la transición?

3. **Timing estratégico:** ¿Es este el momento correcto considerando otras iniciativas en curso?

4. **Alternativas:** ¿Hemos evaluado exhaustivamente opciones de optimización in-place o estrategia híbrida?

5. **Sistema target:** ¿Tenemos identificado y validado un reemplazo que cubra TODAS las funcionalidades críticas?

---

## 🔀 ALTERNATIVAS RECOMENDADAS

### Opción 1: Reemplazo Completo (Evaluación Actual)

**Descripción:** Migrar completamente de Salesforce a plataforma alternativa

**Pros:**
- Control total sobre roadmap
- Posible reducción de costos de licenciamiento
- Alineación con estrategia tecnológica corporativa

**Contras:**
- Alto riesgo operacional
- Timeline extenso (30-45 meses)
- Inversión significativa
- Disrupción de operaciones

**Recomendación:** ⚠️ Solo si business case es absolutamente convincente y no hay alternativas viables

---

### Opción 2: Estrategia Híbrida (Recomendada para Evaluación)

**Descripción:** Mantener Sales/Service Cloud core, reemplazar módulos específicos

**Ejemplo de implementación:**
- **Mantener:** Sales Cloud, Service Cloud (core CRM)
- **Reemplazar:** Marketing Cloud → Plataforma alternativa de marketing automation
- **Reemplazar:** Data Cloud → CDP independiente
- **Complementar:** Analytics → BI corporativo existente (Power BI)

**Pros:**
- Reduce significativamente alcance y riesgo
- Permite migración por fases
- Mantiene operación comercial estable
- Timeline más manejable (12-18 meses por fase)

**Contras:**
- Mantiene dependencia parcial de Salesforce
- Complejidad de integración entre plataformas
- Gestión de múltiples proveedores

**Recomendación:** ✅ **Evaluar prioritariamente** - balance óptimo riesgo/beneficio

---

### Opción 3: Optimización In-Place (Quick Win)

**Descripción:** Modernizar implementación actual de Salesforce sin reemplazar

**Acciones concretas:**
- Auditoría de licencias y consolidación de usuarios inactivos
- Migración a Lightning Experience (si aplica)
- Optimización de automatizaciones (flows vs. código)
- Renegociación comercial con Salesforce
- Limpieza de datos y decommissioning de módulos no usados

**Pros:**
- Menor riesgo
- Timeline corto (3-6 meses)
- Aprovecha inversión existente
- Sin disrupción operativa

**Contras:**
- No elimina dependencia de Salesforce
- Reducción de costos limitada
- No resuelve limitaciones inherentes de la plataforma

**Recomendación:** ✅ **Ejecutar como quick win** independientemente de decisión de largo plazo

---

### Opción 4: Estrategia de Complemento

**Descripción:** Extender Salesforce con herramientas especializadas sin reemplazar core

**Ejemplo de implementación:**
- **Complementar:** Agregar CDP independiente que se integre con Salesforce
- **Complementar:** BI avanzado (Power BI ya disponible) para analytics
- **Complementar:** Plataforma de loyalty independiente
- **Mantener:** Salesforce para CRM transaccional

**Pros:**
- Extiende capacidades sin riesgo de reemplazo
- Permite adopción de best-of-breed tools
- Flexibilidad para cambios futuros
- Sin disrupción operativa

**Contras:**
- Incrementa complejidad de integración
- Gestión de múltiples vendors
- No reduce costos de Salesforce

**Recomendación:** ✅ **Considerar para necesidades específicas** no bien cubiertas por Salesforce

---

## 💡 RECOMENDACIÓN EJECUTIVA

### Nivel de Impacto: 🔴 MUY ALTO

### Acciones Inmediatas (Próximos 30 días)

1. **Business Case Detallado**
   - Cuantificar ahorro real en licencias vs. costo total del proyecto
   - Incluir costos ocultos: training, consultores, licencias temporales, downtime
   - Calcular NPV y payback period

2. **Evaluación de Alternativas**
   - Workshop ejecutivo para evaluar Opciones 2, 3 y 4
   - Validar con áreas de negocio qué módulos son realmente críticos vs. nice-to-have
   - Identificar quick wins de la Opción 3 que puedan ejecutarse ya

3. **Validación Técnica**
   - Si se mantiene interés en reemplazo: PoC de 8-12 semanas
   - Probar migración de subset de datos
   - Validar re-implementación de 3-4 integraciones críticas
   - Medir performance y usabilidad con usuarios reales

### Recomendación Final

**⚠️ NO PROCEDER CON REEMPLAZO COMPLETO** sin antes:

✅ Demostrar ROI positivo con business case riguroso  
✅ Agotar alternativas de menor riesgo (Opciones 2, 3, 4)  
✅ Validar viabilidad técnica con PoC exitoso  
✅ Obtener buy-in explícito de stakeholders de negocio  
✅ Asegurar sponsorship ejecutivo continuo por 30-45 meses  

**Recomendación preferida a corto plazo:**
1. **Ejecutar Opción 3** (optimización) → Quick win, 3-6 meses
2. **Evaluar Opción 2** (híbrida) → Decisión informada en 60-90 días
3. **Mantener Opción 1** (reemplazo) como último recurso si todo lo demás falla

---

## 📎 ANEXOS

### Datos de Soporte

**Fuente:** Base de Datos NexusT - Arquitectura Empresarial Terpel  
**Fecha de extracción:** 9 de Febrero, 2026  
**Consultas SQL ejecutadas:** 6 queries de análisis de impacto  

### Componentes Detallados (15 módulos)

1. Social Studio
2. Journey Builder
3. Personalization Builder
4. Unificación de Perfiles de Cliente
5. Segmentación Avanzada de Audiencias
6. Activación de Datos
7. Gestión de Casos
8. Omnicanal de Atención
9. Base de Conocimiento
10. Fielo Loyalty
11. Content Builder
12. Email Studio
13. Mobile Studio
14. Einstein Analytics
15. Salesforce CPQ (Configure-Price-Quote)

### Interfaces Críticas (20 integraciones)

Ver sección "Complejidad de Integraciones" para detalle completo.

---

**Preparado por:** Arquitectura Empresarial - Terpel  
**Clasificación:** Confidencial - Solo Uso Interno  
**Próxima revisión:** Post decisión ejecutiva

