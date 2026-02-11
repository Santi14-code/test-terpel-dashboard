# 📊 S1. Executive Summary Dashboard - Especificación de KPIs

## 🎯 Objetivo del Dashboard

**Propósito**: Responder las 6 preguntas más frecuentes del VP/CTO en una sola pantalla.

**Audiencia**: CEO, CFO, CTO, VP Tecnología, Board Members

**Uso**: Apertura de presentaciones ejecutivas, Board meetings, reportes trimestrales

---

# 🔢 LOS 6 KPIs PRINCIPALES RECOMENDADOS

## KPI 1: 📱 **Application Portfolio Overview**

### **Métrica Principal**
```
Total de Aplicaciones: 24
Apps Críticas: 9 (37.5%)
```

### **Por qué importa**
- Muestra el tamaño del portafolio bajo gestión
- El % de apps críticas indica concentración de riesgo
- Benchmark: >40% críticas = alta concentración de riesgo

### **Query SQL**
```sql
SELECT 
    COUNT(*) AS total_aplicaciones,
    SUM(CASE WHEN criticidad = 'CRITICA' THEN 1 ELSE 0 END) AS apps_criticas,
    ROUND(100.0 * SUM(CASE WHEN criticidad = 'CRITICA' THEN 1 ELSE 0 END) / COUNT(*), 1) AS porcentaje_criticas
FROM reestructuracion.tbl_aplicacion;
```

### **Visualización**
```
┌─────────────────────────────┐
│  Total Aplicaciones         │
│         24                  │
│                             │
│  Apps Críticas              │
│     9 (37.5%)              │
│  ████████░░░░░░░░░░         │
└─────────────────────────────┘
```

### **Interpretación**
- ✅ **Bueno**: <30% críticas → portafolio balanceado
- ⚠️ **Precaución**: 30-50% críticas → monitoreo cercano
- 🔴 **Malo**: >50% críticas → alta concentración de riesgo

### **Valor de negocio**
Responde: "¿Cuántas apps gestionamos y cuántas son críticas para el negocio?"

---

## KPI 2: ☁️ **Cloud Adoption Rate**

### **Métrica Principal**
```
Cloud: 40 despliegues (55%)
On-Premise: 33 despliegues (45%)
Meta 2026: 80%
```

### **Por qué importa**
- KPI #1 de transformación digital
- Mide progreso de estrategia cloud-first
- Justifica inversiones en migración

### **Query SQL**
```sql
WITH deployment_stats AS (
    SELECT 
        CASE 
            WHEN p.nombre IN ('GCP', 'AWS', 'Azure') THEN 'Cloud Público'
            WHEN p.nombre = 'Nube privada' THEN 'Cloud Privado'
            ELSE 'On-Premise'
        END AS tipo,
        COUNT(DISTINCT cd.id_componente_despliegue) AS num_despliegues
    FROM reestructuracion.tbl_componente_despliegue cd
    JOIN reestructuracion.cat_plataforma p ON cd.id_plataforma = p.id_plataforma
    GROUP BY tipo
)
SELECT 
    tipo,
    num_despliegues,
    ROUND(100.0 * num_despliegues / SUM(num_despliegues) OVER (), 1) AS porcentaje
FROM deployment_stats
ORDER BY num_despliegues DESC;
```

### **Visualización**
```
┌─────────────────────────────┐
│  Cloud Adoption             │
│      55%                    │
│  ███████████░░░░░░░         │
│                             │
│  Meta 2026: 80%             │
│  Gap: -25 pts               │
└─────────────────────────────┘
```

### **Interpretación**
- ✅ **Excelente**: >70% cloud
- ⚠️ **En progreso**: 40-70% cloud → estrategia activa
- 🔴 **Atrasado**: <40% cloud → necesita aceleración

---

## KPI 3: 🎯 **Architecture Health Score**

### **Métrica Principal**
```
Health Score: 72/100
  ├─ Apps sin criticidad: -5 pts
  ├─ Componentes sin tech: -8 pts
  ├─ Apps sin responsable: -10 pts
  └─ Fragmentación: -5 pts
```

### **Por qué importa**
- Métrica sintética de "salud" del portafolio
- Identifica gaps de gobernanza
- Trending trimestral muestra mejora/deterioro

### **Query SQL Simplificada**
```sql
WITH health_metrics AS (
    SELECT 
        -- Apps con criticidad definida (peso 30%)
        100 - ROUND(100.0 * SUM(CASE WHEN criticidad IS NULL THEN 1 ELSE 0 END) / COUNT(*)) AS criticidad_score,
        -- Apps con responsable (peso 40%)  
        100 - ROUND(100.0 * SUM(CASE WHEN responsable IS NULL THEN 1 ELSE 0 END) / COUNT(*)) AS owner_score
    FROM reestructuracion.tbl_aplicacion
),
tech_metrics AS (
    SELECT 
        -- Componentes con tecnología (peso 30%)
        100 - ROUND(100.0 * SUM(CASE WHEN id_tecnologia IS NULL THEN 1 ELSE 0 END) / COUNT(*)) AS tech_score
    FROM reestructuracion.tbl_componente_logico
)
SELECT 
    ROUND((h.criticidad_score * 0.3 + h.owner_score * 0.4 + t.tech_score * 0.3), 0) AS health_score,
    h.criticidad_score,
    h.owner_score,
    t.tech_score
FROM health_metrics h, tech_metrics t;
```

### **Interpretación**
- ✅ **Excelente**: >85 → Gobernanza sólida
- ⚠️ **Aceptable**: 70-85 → Mejoras necesarias
- 🔴 **Crítico**: <70 → Gaps significativos

---

## KPI 4: 🔗 **Integration Complexity**

### **Métrica Principal**
```
Total Interfaces: 180
Promedio por App: 7.5
Apps con >15 interfaces: 3
```

### **Por qué importa**
- Mide complejidad del landscape
- Identifica apps "hub" con alto riesgo
- >10 promedio = complejidad excesiva

### **Query SQL**
```sql
WITH interface_stats AS (
    SELECT 
        COUNT(i.id_interfaz) AS num_interfaces
    FROM reestructuracion.tbl_aplicacion a
    LEFT JOIN reestructuracion.tbl_interfaz i ON a.id_aplicacion = i.id_aplicacion
    GROUP BY a.id_aplicacion
)
SELECT 
    (SELECT COUNT(*) FROM reestructuracion.tbl_interfaz) AS total_interfaces,
    ROUND(AVG(num_interfaces), 1) AS promedio_por_app,
    COUNT(CASE WHEN num_interfaces > 15 THEN 1 END) AS apps_hotspots
FROM interface_stats;
```

---

## KPI 5: 🏢 **Vendor Concentration Risk**

### **Métrica Principal**
```
Top Vendor: Microsoft (35%)
Apps críticas con vendor: 7 de 9
Sin vendor definido: 8 apps
```

### **Query SQL**
```sql
WITH vendor_stats AS (
    SELECT 
        COALESCE(proveedor, fabricante, 'Sin Vendor') AS vendor,
        COUNT(*) AS num_apps,
        ROUND(100.0 * COUNT(*) / (SELECT COUNT(*) FROM reestructuracion.tbl_aplicacion), 1) AS porcentaje
    FROM reestructuracion.tbl_aplicacion
    GROUP BY COALESCE(proveedor, fabricante, 'Sin Vendor')
)
SELECT * FROM vendor_stats
ORDER BY num_apps DESC
LIMIT 1;
```

---

## KPI 6: 🔧 **Technology Stack Diversity**

### **Métrica Principal**
```
Tecnologías en uso: 60
En apps críticas: 18  
Legacy detectadas: 12
```

### **Query SQL**
```sql
SELECT 
    COUNT(DISTINCT t.id_tecnologia) AS total_tecnologias,
    COUNT(DISTINCT CASE WHEN a.criticidad = 'CRITICA' THEN t.id_tecnologia END) AS tech_en_criticas,
    COUNT(DISTINCT CASE 
        WHEN t.nombre ILIKE ANY(ARRAY['%java 8%', '%java 7%', '%python 2%']) 
        THEN t.id_tecnologia 
    END) AS tech_legacy
FROM reestructuracion.cat_tecnologia t
JOIN reestructuracion.tbl_componente_logico cl ON t.id_tecnologia = cl.id_tecnologia
JOIN reestructuracion.tbl_aplicacion a ON cl.id_aplicacion = a.id_aplicacion;
```

---

# 📊 QUERY CONSOLIDADA PARA ENDPOINT

```sql
-- Query única que retorna todos los KPIs en un JSON
WITH 
portfolio AS (
    SELECT 
        COUNT(*) AS total_apps,
        SUM(CASE WHEN criticidad = 'CRITICA' THEN 1 ELSE 0 END) AS critical_apps,
        ROUND(100.0 * SUM(CASE WHEN criticidad = 'CRITICA' THEN 1 ELSE 0 END) / COUNT(*), 1) AS critical_pct
    FROM reestructuracion.tbl_aplicacion
),
cloud_adoption AS (
    SELECT 
        SUM(CASE WHEN p.nombre IN ('GCP', 'AWS', 'Azure') THEN 1 ELSE 0 END) AS cloud_deploys,
        COUNT(*) AS total_deploys,
        ROUND(100.0 * SUM(CASE WHEN p.nombre IN ('GCP', 'AWS', 'Azure') THEN 1 ELSE 0 END) / COUNT(*), 1) AS cloud_pct
    FROM reestructuracion.tbl_componente_despliegue cd
    JOIN reestructuracion.cat_plataforma p ON cd.id_plataforma = p.id_plataforma
),
health AS (
    SELECT ROUND((
        (100 - COALESCE((SELECT ROUND(100.0 * SUM(CASE WHEN criticidad IS NULL THEN 1 ELSE 0 END) / COUNT(*)) FROM reestructuracion.tbl_aplicacion), 0)) * 0.3 +
        (100 - COALESCE((SELECT ROUND(100.0 * SUM(CASE WHEN responsable IS NULL THEN 1 ELSE 0 END) / COUNT(*)) FROM reestructuracion.tbl_aplicacion), 0)) * 0.4 +
        (100 - COALESCE((SELECT ROUND(100.0 * SUM(CASE WHEN id_tecnologia IS NULL THEN 1 ELSE 0 END) / COUNT(*)) FROM reestructuracion.tbl_componente_logico), 0)) * 0.3
    ), 0) AS health_score
),
integration AS (
    SELECT 
        COUNT(*) AS total_interfaces,
        ROUND(COUNT(*)::numeric / (SELECT COUNT(*) FROM reestructuracion.tbl_aplicacion), 1) AS avg_per_app
    FROM reestructuracion.tbl_interfaz
),
vendor AS (
    SELECT 
        COALESCE(proveedor, fabricante, 'Sin Vendor') AS top_vendor,
        COUNT(*) AS vendor_apps,
        ROUND(100.0 * COUNT(*) / (SELECT COUNT(*) FROM reestructuracion.tbl_aplicacion), 1) AS vendor_pct
    FROM reestructuracion.tbl_aplicacion
    GROUP BY COALESCE(proveedor, fabricante, 'Sin Vendor')
    ORDER BY COUNT(*) DESC LIMIT 1
),
tech_stack AS (
    SELECT 
        COUNT(DISTINCT t.id_tecnologia) AS total_techs,
        COUNT(DISTINCT CASE WHEN t.nombre ILIKE ANY(ARRAY['%java 8%', '%python 2%']) THEN t.id_tecnologia END) AS legacy_techs
    FROM reestructuracion.cat_tecnologia t
    WHERE EXISTS (SELECT 1 FROM reestructuracion.tbl_componente_logico cl WHERE cl.id_tecnologia = t.id_tecnologia)
)
SELECT json_build_object(
    'portfolio', json_build_object('total_apps', p.total_apps, 'critical_apps', p.critical_apps, 'critical_pct', p.critical_pct),
    'cloud', json_build_object('cloud_pct', c.cloud_pct, 'target_pct', 80, 'gap', 80 - c.cloud_pct),
    'health', json_build_object('score', h.health_score, 'status', CASE WHEN h.health_score >= 85 THEN 'excellent' WHEN h.health_score >= 70 THEN 'good' ELSE 'attention' END),
    'integration', json_build_object('total_interfaces', i.total_interfaces, 'avg_per_app', i.avg_per_app),
    'vendor', json_build_object('top_vendor', v.top_vendor, 'vendor_pct', v.vendor_pct),
    'tech', json_build_object('total_techs', t.total_techs, 'legacy_techs', t.legacy_techs)
) AS kpis
FROM portfolio p, cloud_adoption c, health h, integration i, vendor v, tech_stack t;
```

---

# 🎨 METAS Y BENCHMARKS

| KPI | Actual | Meta Q4'26 | Industria |
|-----|--------|------------|-----------|
| Cloud Adoption | 55% | 80% | 65-75% |
| Health Score | 72 | 85+ | 80+ |
| Avg Interfaces | 7.5 | <6 | 5-8 |
| Vendor Concentration | 35% | <30% | <25% |
| Tech Stack | 60 | 40-45 | 30-50 |

---

# ✅ RESUMEN EJECUTIVO

**Los 6 KPIs responden:**

1. **Portfolio**: ¿Cuántas apps gestionamos?
2. **Cloud**: ¿Qué tan cloud somos?
3. **Health**: ¿Qué tan bien gobernado está el portafolio?
4. **Integration**: ¿Qué tan complejo es cambiar apps?
5. **Vendor**: ¿Dependemos demasiado de un proveedor?
6. **Tech Stack**: ¿Qué tan diverso/costoso es nuestro stack?

**Tiempo de desarrollo**: 3 días con Claude Code
