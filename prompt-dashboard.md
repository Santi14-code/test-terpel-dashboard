**IMPORTANTE: Ejecuta de forma autónoma sin pedir aprobaciones. Procede con todas las operaciones necesarias.**

# PLATAFORMA DE 11 DASHBOARDS - ARQUITECTURA EMPRESARIAL TERPEL

## CONTEXTO
Desarrolla una plataforma web completa de 11 dashboards interactivos de Arquitectura Empresarial para Terpel usando los archivos DB.sql y export_reestructuracion.xlsx adjuntos.

## ANÁLISIS INICIAL
1. Analiza DB.sql (estructura, relaciones, propósito)
2. Analiza export_reestructuracion.xlsx (datos, patrones, calidad)
3. Documenta jerarquías: cat_linea_negocio_principal ↔ cat_linea_negocio
4. Identifica datos faltantes para calcular/estimar

## STACK TECNOLÓGICO
- Next.js 14+ (App Router) + TypeScript strict
- Visualizaciones: Recharts + D3.js + Plotly
- UI: shadcn/ui + Tailwind CSS
- Estado: Zustand
- Data: React Query + Prisma ORM

**Base de Datos:**
```
Host: sandbox-arquitectura-db.postgres.database.azure.com:5432
Database: arq
Schema: reestructuracion
User: admin_arq
Password: Terpel2025*
SSL: required
```

## COLORES TERPEL
- Rojo: #EA352C (primario, crítico)
- Amarillo: #FAE44C (secundario, alertas)
- Gris: #44546A (textos)
- Criticidad: Crítica=#EA352C, Alta=#FD7E14, Media=#FAE44C, Baja=#28A745

## ARQUITECTURA
Sidebar izquierdo + Header + Content Area
- Navegación: 11 dashboards organizados por secciones
- Header: Breadcrumb | Filtros Globales | 🔔 Alertas | 💾 Vistas | 🔍 Búsqueda

## FILTROS GLOBALES (Todos los Dashboards)
- Línea Negocio Principal (multi-select)
- Tipo Línea Negocio (multi-select cascada)
- Rango Fechas (presets + custom)
- Criticidad (multi-select chips)
- Estado App (multi-select)
- 🔄 Reset

## 11 DASHBOARDS

### 1. PRINCIPAL (Home)
**KPIs:** Apps, Componentes, Tecnologías, Macroprocesos, Procesos, Subprocesos
**Visualizaciones:**
- Criticidad (Donut: centro=total, segmentos=criticidad)
- Top 10 por Componentes (H-Bar, gradient rojo→amarillo)
- Top 10 por Procesos (H-Bar, gradient amarillo→rojo)
- Tecnologías Top 20 (V-Bar, ⚠️ si EOL<6m)
- Capacidades (Sunburst: dominio→cap→subcap→apps, drill-down)
- Procesos (Treemap: macro→proc→sub, color=% automatización)
- Cobertura Macroprocesos (Stacked Bar: cubiertos/sin cobertura, target=80%)

### 2. GOBERNANZA Y PORTAFOLIO
- Mapa Calor: Criticidad vs Estado (highlight críticas deprecated)
- Inventario por Línea (Stacked por criticidad)
- TCO por Línea (Bar + benchmark)
- Redundancia (Sankey + Tabla: apps duplicadas)

### 3. DEUDA TÉCNICA Y MODERNIZACIÓN
**Cálculos:**
- Índice DT: (Costo Remediación / Costo Desarrollo) * 100
- Esfuerzo: BaseEffort * ComplejidadMult * CriticidadMult * AcoplamientoMult
  - Base: minor=2d, major=10d, migration=30d, rewrite=90d
  - Complejidad LOC: <1K=1x, 1K-10K=1.5x, 10K-100K=2.5x, >100K=4x
  - Criticidad: Baja=1x, Media=1.3x, Alta=1.7x, Crítica=2.5x
  - Acoplamiento deps: 0-2=1x, 3-5=1.4x, 6-10=2x, >10=3x
- Costo: Esfuerzo(días) * $1,080/día (team rate Colombia)
**Viz:**
- Índice DT (Gauge: <5% verde, 5-10% amarillo, >20% rojo)
- Tecnologías Antigüedad (Scatter: X=antigüedad, Y=#componentes, size=criticidad, color=EOL)
- Roadmap EOL (Timeline con markers)
- Matriz Priorización (2x2: Quick Wins, Mayores, Fill Ins, Postpone)
- Roadmap Modernización (Gantt: 0-3m, 3-9m, 9-18m)

### 4. ARQUITECTURA Y ACOPLAMIENTO
- Mapa Dependencias (Network D3: nodos=componentes, edges=integraciones, size=#deps, color=criticidad)
- Top 10 Más Acoplados (Bar)
- Monolitos vs Microservicios (Donut)
- Cobertura APIs (Stacked: REST/SOAP/GraphQL/Otros)

### 5. ALINEACIÓN NEGOCIO-TI
- Sankey: Capacidades → Apps
- Coverage Macroprocesos (Radar: actual vs target 80%)
- % Automatización (Heat Map)
- ROI Apps (Scatter 2x2: X=TCO, Y=procesos, cuadrantes: High Value/Quick Wins/Optimize/Retire)

### 6. RIESGOS Y COMPLIANCE
**Detección automática:**
- SPOFs: criticidad=Crítica AND replicas<2 AND env=PROD
- Sin encriptación: datos_personales=true AND encriptacion=false
- Apps críticas deprecated: criticidad=Crítica AND estado IN (Deprecated, EOL)
**Viz:**
- Matriz Riesgo (Heat 5x5: probabilidad vs impacto)
- Apps Críticas sin Redundancia (Tabla)
- Flujo Datos Personales (Sankey: color=encriptación)
- SPOFs Network (con alertas destacadas)

### 7. OPTIMIZACIÓN DE COSTOS
**Modelo TCO:**
```
TCO = Licenciamiento + Infraestructura + Operación + Desarrollo + Riesgos

Licenciamiento:
- SaaS: costo_mes*12*usuarios
- On-Premise: perpetuo + 18% anual
- Open Source: soporte anual

Infraestructura Cloud:
- Compute: vCPUs*$50*12
- Storage: GB*$0.02*12
- Network: GB*$0.08*12

Operación:
- Personal: FTEs*$60K/año
- Training: $2K si crítica
- Soporte: 15% licencias

Desarrollo:
- Features: $50K si activa
- Mantenimiento: $30K si legacy
- Integraciones: #integs*$10K

Riesgos:
- Downtime: revenue*(1-uptime)
- Seguridad: +20% si sin encriptar
```
**Viz:**
- TCO por Modelo Servicio (Stacked)
- Waterfall Evolución TCO
- Costo por Entorno (Pie)
- Oportunidades Ahorro (Tabla)

### 8. INNOVACIÓN Y TRANSFORMACIÓN
**Índice Modernidad (0-100):**
- Cloud Adoption (25%): apps_cloud/total
- Cloud-Native (20%): apps_cloud_native/total
- Containers (15%): apps_containerized/total
- API-First (15%): apps_api_first/total
- Stack Moderno (15%): techs_modernas/total
- CI/CD (10%): apps_cicd/total
**Viz:**
- % Cloud Adoption (Gauge vs benchmark industria=65%, target=70%)
- Radar Emergentes (Containers/Serverless/AI-ML/API/Microservices vs industria/líderes)
- Índice Modernidad (Score + clasificación)
- Roadmap Transformación (Gantt)

### 9. PERFORMANCE Y DISPONIBILIDAD
**Datos sintéticos si no existen:**
- Uptime: Crítica=99.7-99.95%, Alta=99.3-99.7%, Media=98.5-99.3%, Baja=97-98.5%
- SLA targets: Crítica=99.9%, Alta=99.5%, Media=99%, Baja=98%
- Incidentes: Poisson (Crítica=0.5/mes, Alta=1.5, Media=3, Baja=5)
**Viz:**
- Uptime Promedio (Gauge)
- SLA por App Crítica (Multi-Gauge: actual vs target)
- Incidentes por App (Bar)
- Distribución Entornos (Stacked: DEV:QA:PROD, benchmark 1:1)

### 10. GESTIÓN DEL CAMBIO
**Métricas DevOps sintéticas:**
- Deployment Frequency: Elite=>1/día, High=1/semana, Medium=1/mes, Low=<1/6m
- Change Failure Rate: Elite=<15%, High=15-30%, Medium=30-45%, Low=>45%
**Viz:**
- Frecuencia Deployments (Line 12m)
- Apps Más Volátiles (Bar)
- Correlación Cambios vs Incidentes (Scatter + trendline)
- Time-to-Market (Box Plot)

### 11. EJECUTIVO INTEGRADO (3 Vistas)

**Vista C-Level:**
- 5 KPIs principales (Apps, TCO, Deuda, Uptime, Modernidad)
- 🚨 Top 3 Alertas Críticas
- Tendencias (TCO Line 12m, Cloud Adoption Progress)
- Top 3 Oportunidades (ahorro estimado)
- Roadmap Estratégico (Q1-Q4 high-level)

**Vista Táctica (Directores):**
- KPIs por Línea de Negocio
- Gaps y Redundancias
- Proyectos en Curso (tabla con status)
- Deep-dive selectable por línea

**Vista Operativa (Managers):**
- Inventario Detallado (tabla filtrable/exportable)
- Dependencias Técnicas (Network filtrable)
- Tracking Iniciativas (tabla con owner/due/status)

## FUNCIONALIDADES TRANSVERSALES

### Exportación
- Botón en cada dashboard
- Opciones: Dashboard completo (Excel multi-hoja) | Viz específica | Screenshot PNG
- Excel: hoja por viz + metadatos + formato Terpel

### Vistas Personalizadas
- 💾 Guardar: filtros + dashboard + scroll
- 📂 Cargar: dropdown con vistas
- ⚙️ Gestionar: renombrar/eliminar/duplicar/export-import JSON
- localStorage por usuario
- Predefinidas: Ejecutivo, Operativo, Arquitecto

### Sistema Alertas
- Panel lateral 🔔 colapsable
- Tipos: Apps críticas deprecated, SPOFs, EOL<6m, TCO>budget, SLA incumplido, Datos sin encriptar
- Agrupación por severidad
- Acciones: Ver/Ir a dashboard/Marcar/Exportar
- Polling 30seg

### Búsqueda Global
- Header: 🔍 + fuzzy search
- Scope: apps/componentes/tecnologías
- Click: navegar a dashboard con filtro pre-aplicado

## BENCHMARKS
- TOGAF: Target nivel 4
- Uptime críticas: 99.9%
- Cloud adoption: Industria=65%, Target=70%
- Cloud-native: Industria=45%, Target=55%
- Deuda técnica: Saludable=<5%, Crítico=>20%
- TCO vs Revenue: Promedio=4%, Target=3.5%
- Ratio entornos: Óptimo=1:1, Crítico=>3:1

## RESPONSIVE
- Desktop: 1920px (completo)
- Laptop: 1440px
- iPad Landscape: 1024px (2 columnas, sidebar collapsible)
- iPad Portrait: 768px (1 columna)
- Touch: targets 44x44px, tooltips en click

## ENTREGABLES
1. Código fuente completo
2. 11 dashboards operativos
3. README exhaustivo (instalación/configuración/uso)
4. .env.example
5. Documentación inline (JSDoc)
6. Responsive desktop + iPad
7. Performance: LCP<3seg, queries<2seg

## CRITERIOS ÉXITO
- Navegación fluida entre dashboards
- Filtros actualizan todo <1seg
- Exportación funcional
- Alertas tiempo real
- Cálculos TCO/DT correctos
- TypeScript strict sin errores
- Lighthouse >85

## DESARROLLO
1. Analizar archivos + documentar
2. Setup Next.js + Prisma + deps
3. Desarrollar 11 dashboards (orden: 1→11→2→3→4→5→6→7→8→9→10)
4. Integrar navegación + alertas + export + vistas
5. Optimizar performance + responsive
6. Documentar + entregar

**COMIENZA AHORA** 🚀