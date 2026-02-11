# 📊 PORTAFOLIO DE APLICACIONES TERPEL
## Análisis Ejecutivo del Inventario NexusT

**Fecha:** 9 de Febrero, 2026  
**Fuente:** Base de Datos NexusT - Arquitectura Empresarial  
**Total de Aplicaciones:** 24

---

## 🎯 RESUMEN EJECUTIVO

### Estadísticas Clave

| Métrica | Valor |
|---------|-------|
| **Total de aplicaciones** | 24 |
| **Componentes lógicos** | 185 |
| **Interfaces activas** | 180 |
| **Aplicaciones SaaS** | 12 (50%) |
| **Aplicaciones on-premise** | 10 (42%) |
| **Aplicaciones críticas** | 9 (38%) |

---

## 🔴 APLICACIONES CRÍTICAS (9)

Estas representan el **37.5%** del portafolio y son esenciales para la operación:

### 1. **Zenput** 🥇
- **Componentes:** 31 | **Interfaces:** 25
- **Modelo:** SaaS | **Fabricante:** SAP
- **Función:** Auditorías operacionales y control de procedimientos
- **Análisis:** La aplicación más compleja del portafolio

### 2. **SAP ECC (ERP)** 💼
- **Componentes:** 15 | **Interfaces:** 58
- **Modelo:** On-Premise | **Fabricante:** SAP
- **Función:** Sistema ERP central
- **Análisis:** Mayor número de integraciones (58) - backbone de sistemas

### 3. **SalesForce** 👥
- **Componentes:** 15 | **Interfaces:** 20
- **Modelo:** SaaS | **Fabricante:** SalesForce
- **Función:** CRM y gestión comercial
- **Análisis:** Alta integración con ecosistema comercial

### 4. **Archestra** 🏭
- **Componentes:** 15 | **Interfaces:** 0
- **Modelo:** On-Premise | **Fabricante:** Aveva
- **Función:** SCADA y control de procesos industriales
- **Análisis:** Sistema aislado, crítico para operaciones

### 5. **SIMAD** 📄
- **Componentes:** 19 | **Interfaces:** 12
- **Modelo:** SaaS | **Fabricante:** Aurea
- **Función:** Gestión administrativa y documental
- **Nota:** Clasificado como MEDIA criticidad, pero alta complejidad

### 6. **Gurusoft** 💳
- **Componentes:** 10 | **Interfaces:** 12
- **Modelo:** SaaS | **Fabricante:** Gurusoft
- **Función:** Facturación electrónica
- **Análisis:** Crítico para compliance fiscal

### 7. **WonderNET** 🔌
- **Componentes:** 9 | **Interfaces:** 4
- **Modelo:** On-Premise
- **Función:** Integración industrial Wonderware/AVEVA
- **Análisis:** Conecta sistemas industriales

### 8. **Nexus (Coupa)** 💰
- **Componentes:** 6 | **Interfaces:** 8
- **Modelo:** SaaS | **Fabricante:** Nexus
- **Función:** Gestión de gastos y adquisiciones
- **Análisis:** Spend management corporativo

### 9. **UIPATH** 🤖
- **Componentes:** 3 | **Interfaces:** 7
- **Modelo:** SaaS
- **Función:** Automatización robótica de procesos (RPA)
- **Análisis:** Automatización de tareas repetitivas

---

## 📊 DISTRIBUCIÓN POR CRITICIDAD

```
🔴 CRÍTICA      ████████████████████████░░░░░░░░  9 apps (37.5%)
🟠 ALTA         ██░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  1 app  (4.2%)
🟡 MEDIA        ████████░░░░░░░░░░░░░░░░░░░░░░░░  5 apps (20.8%)
🟢 BAJA         ██░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  1 app  (4.2%)
⚪ SIN DEFINIR  ████████░░░░░░░░░░░░░░░░░░░░░░░░  8 apps (33.3%)
```

**⚠️ ACCIÓN REQUERIDA:** 8 aplicaciones sin clasificación de criticidad (33.3%)

---

## ☁️ DISTRIBUCIÓN POR MODELO DE SERVICIO

| Modelo | Cantidad | Porcentaje | Tendencia |
|--------|----------|------------|-----------|
| **SaaS** | 12 | 50% | ⬆️ Cloud-first |
| **On-Premise** | 10 | 42% | ➡️ Legacy maduro |
| **PaaS** | 1 | 4% | - |
| **IaaS** | 1 | 4% | - |

**Insight:** 54% del portafolio ya está en la nube (SaaS + PaaS + IaaS)

---

## 🏆 TOP 5 APLICACIONES POR COMPLEJIDAD

Basado en número de componentes + interfaces:

| Rank | Aplicación | Componentes | Interfaces | Score Total |
|------|------------|-------------|------------|-------------|
| 🥇 | **Zenput** | 31 | 25 | 56 |
| 🥈 | **SAP ECC** | 15 | 58 | 73 ⚠️ |
| 🥉 | **SalesForce** | 15 | 20 | 35 |
| 4 | **SIMAD** | 19 | 12 | 31 |
| 5 | **Office 365** | 14 | 13 | 27 |

**Nota:** SAP ECC tiene el mayor score por sus 58 integraciones

---

## 🔗 APLICACIONES MÁS INTEGRADAS

Por número de interfaces:

1. **SAP ECC** - 58 interfaces (hub central)
2. **Zenput** - 25 interfaces
3. **SalesForce** - 20 interfaces
4. **Office 365** - 13 interfaces
5. **SIMAD** - 12 interfaces
6. **Gurusoft** - 12 interfaces

**Análisis:** SAP ECC es el principal punto de integración del ecosistema

---

## 🏭 ECOSISTEMA SAP

Terpel tiene un ecosistema SAP significativo:

| Sistema | Modelo | Criticidad | Función |
|---------|--------|-----------|---------|
| SAP ECC (ERP) | On-Premise | CRÍTICA | Core ERP |
| SAP PI | On-Premise | CRÍTICA | Middleware integración |
| SAP Fiori | On-Premise | MEDIA | UX moderna |
| SAP Portales | On-Premise | MEDIA | Portal empresarial |
| SAP Solman | On-Premise | MEDIA | Gestión ciclo vida |
| SAP BO | On-Premise | Sin Definir | Business Intelligence |
| SAP Concur | On-Premise | BAJA | Viáticos y gastos |
| Zenput | SaaS | CRÍTICA | Auditorías (SAP) |

**Total:** 8 sistemas SAP (33% del portafolio)

---

## ⚠️ APLICACIONES SIN CLASIFICAR (8)

Estas aplicaciones **requieren revisión inmediata** de criticidad:

1. **Bizagi** (8 componentes, 6 interfaces) - BPM
2. **Power BI** (6 componentes, 7 interfaces) - Analytics
3. **Volarte** (11 componentes) - Aviación
4. **SAP BO** (2 componentes) - BI
5. **FlightControl** (1 componente) - Aviación
6. **Uruk** (1 componente) - Firmas digitales
7. **WhatsApp** (1 componente) - Comunicación
8. **Office 365** (14 componentes, 13 interfaces) - Marcada como "REVISAR"

**Recomendación:** Priorizar clasificación de Power BI, Volarte y Bizagi por su complejidad

---

## 📈 INSIGHTS ESTRATÉGICOS

### 1. Concentración de Riesgo
- **58 interfaces** conectadas a SAP ECC
- Si SAP falla, impacta a la mayoría del ecosistema
- **Recomendación:** Plan de contingencia robusto para SAP

### 2. Tendencia Cloud
- 50% ya en SaaS
- 42% aún on-premise (principalmente SAP)
- **Oportunidad:** Evaluar migración SAP a S/4HANA Cloud

### 3. Complejidad Oculta
- Zenput tiene más componentes (31) que el ERP (15)
- **Pregunta:** ¿Es justificada esta complejidad?
- **Recomendación:** Auditoría de arquitectura de Zenput

### 4. Aplicaciones "Huérfanas"
- Archestra: 15 componentes, 0 interfaces
- Volarte: 11 componentes, 0 interfaces
- ¿Están realmente aisladas o falta documentación?

### 5. Ecosistema Microsoft
- Office 365: 14 componentes, 13 interfaces
- Power BI: 6 componentes, 7 interfaces
- Alta integración con stack Microsoft

---

## 🎯 RECOMENDACIONES PRIORITARIAS

### Corto Plazo (30 días)
1. ✅ **Clasificar criticidad** de las 8 aplicaciones sin definir
2. ✅ **Documentar interfaces** de Archestra y Volarte (0 registradas)
3. ✅ **Validar complejidad** de Zenput (31 componentes vs 15 de ERP)

### Mediano Plazo (90 días)
4. ✅ **Análisis de dependencias** de SAP ECC (58 integraciones)
5. ✅ **Plan de contingencia** para sistemas críticos sin redundancia
6. ✅ **Roadmap de modernización** para stack on-premise

### Largo Plazo (12 meses)
7. ✅ **Estrategia cloud** para sistemas on-premise
8. ✅ **Consolidación** de funcionalidades duplicadas
9. ✅ **Optimización** de licenciamiento SaaS

---

## 📋 MATRIZ DE DECISIÓN

### Candidatos para Consolidación
| Sistema | Razón | Alternativa Propuesta |
|---------|-------|----------------------|
| SAP BO | Duplica con Power BI | Consolidar en Power BI |
| SAP Concur | Bajo uso (BAJA criticidad) | Evaluar eliminar o integrar mejor |

### Candidatos para Modernización
| Sistema | Razón | Estrategia |
|---------|-------|------------|
| SAP ECC | Legacy on-premise | Migración a S/4HANA Cloud |
| Archestra | Aislado, sin integraciones | Evaluar conectividad con ecosistema |

### Candidatos para Revisión de Arquitectura
| Sistema | Razón | Acción |
|---------|-------|--------|
| Zenput | Complejidad excesiva (31 componentes) | Auditoría de diseño |
| Office 365 | Criticidad "REVISAR" | Definir estrategia |

---

## 📊 MÉTRICAS DE SALUD DEL PORTAFOLIO

| Métrica | Valor | Estado |
|---------|-------|--------|
| % Apps con criticidad definida | 67% | 🟡 Mejorable |
| % Apps en cloud | 54% | 🟢 Bien |
| Promedio componentes/app | 7.7 | ✅ Normal |
| Promedio interfaces/app | 7.5 | ✅ Normal |
| Apps con >10 componentes | 7 (29%) | ⚠️ Revisar |
| Apps con >10 interfaces | 7 (29%) | ⚠️ Revisar |
| Concentración en un proveedor (SAP) | 33% | 🟠 Alto |

---

## 🔍 PREGUNTAS PARA PROFUNDIZAR

1. **¿Por qué Zenput es más complejo que el ERP?**
   - 31 componentes vs 15 de SAP ECC
   - ¿Hay oportunidad de simplificar?

2. **¿Archestra realmente no tiene integraciones?**
   - Sistema industrial crítico con 0 interfaces registradas
   - ¿Falta documentación o es realmente standalone?

3. **¿Cuál es la estrategia de Power BI vs SAP BO?**
   - Dos herramientas de BI sin criticidad definida
   - ¿Duplican funcionalidad?

4. **¿Office 365 requiere revisión de qué?**
   - Marcado como "REVISAR"
   - 14 componentes, 13 interfaces
   - ¿Cuál es el concern?

5. **¿Volarte está activo o legacy?**
   - 11 componentes, aviación
   - Sin criticidad definida
   - ¿Plan de modernización?

---

## 📎 ANEXO: LISTADO COMPLETO

Ver archivo adjunto: **listado_aplicaciones_terpel.csv**

Columnas incluidas:
- ID, Nombre, Criticidad, Estado
- Modelo de Servicio, Proveedor, Fabricante
- Responsable, Componentes, Interfaces
- Descripción completa

---

**Preparado por:** Arquitectura Empresarial - Terpel  
**Herramienta:** NexusT PostgreSQL + Análisis Python  
**Próxima actualización:** Trimestral o según cambios significativos
