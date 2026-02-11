<<<<<<< HEAD
# test-terpel-dashboard
=======
# Terpel Nexus Dashboard

Dashboard de visualización de arquitectura empresarial para Terpel.

## 🚀 Quick Start

### Prerequisitos

- **Node.js** 20.19.0 o superior
- **Java** (JRE o JDK) — requerido por PlantUML
- **PlantUML** — requerido para la generación de diagramas blueprint

Instalar PlantUML según tu sistema operativo:

```bash
# macOS
brew install plantuml

# Ubuntu / Debian
sudo apt-get install plantuml

# Windows (con Chocolatey)
choco install plantuml
```

Verifica que esté instalado correctamente:

```bash
plantuml -version
```

### Desarrollo Local

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

La aplicación estará disponible en: **http://localhost:3000**

## 📊 Funcionalidades

### Dashboards Estratégicos

Dirigidos a CEO, CFO, CTO, VP y Board Members para toma de decisiones ejecutivas.

- **Executive Summary** (`/`): Vista panorámica de la arquitectura empresarial con 6 KPIs, gráfico de dona por criticidad y heatmap de macroprocesos vs tecnologías
- **Strategic Risk Matrix** (`/strategic-risk-matrix`): Scatter plot de criticidad vs complejidad arquitectónica con cuadrantes de priorización, top 10 apps en zona roja con acciones sugeridas
- **Cloud Transformation Tracker** (`/cloud-transformation`): Progreso de adopción cloud vs meta, distribución por modelo de servicio y plataforma, candidatos a migración
- **Vendor Concentration** (`/vendor-concentration`): Treemap de concentración por proveedor, indicadores de riesgo de dependencia, top 10 vendors con desglose por criticidad

### Dashboards Tácticos

Dirigidos a Directores, Gerentes y Arquitectos Senior para planificación y coordinación.

- **Application Portfolio Matrix** (`/portfolio-matrix`): Matriz Gartner con cuadrantes Invertir/Modernizar/Tolerar/Eliminar, scoring automático de valor de negocio y capacidad técnica
- **Technology Radar** (`/tech-radar`): Clasificación de tecnologías por nivel de adopción (Adopt/Trial/Assess/Hold), visualización radar SVG con tablas por anillo
- **Capability Fragmentation Report** (`/capability-fragmentation`): Identificación de capacidades servidas por múltiples aplicaciones, oportunidades de consolidación

### Dashboards Operativos

Dirigidos a Arquitectos de Solución, Tech Leads y DevOps para trabajo diario.

- **Application Deep Dive** (`/app-deep-dive`): Vista 360° de una aplicación individual con componentes, interfaces, despliegues, procesos soportados y compliance de datos personales
- **Technology Stack Analyzer** (`/tech-stack-analyzer`): Análisis detallado por tecnología con heatmap tech×app, alertas de tecnologías huérfanas y multi-versión, filtro por categoría
- **Data Privacy & Compliance** (`/data-privacy`): Tracking de componentes con datos personales, indicadores de riesgo, distribución por modelo de servicio y criticidad

### Filtros Avanzados

- Criticidad de aplicaciones
- Estados
- Líneas de negocio
- Líneas de negocio principal

### Generador de Diagramas

Genera diagramas de arquitectura empresarial desde la base de datos usando PlantUML:

- **Vista de Capacidades**: Jerarquía de capacidades de negocio con aplicaciones asociadas
- **Vista de Integraciones**: Blueprint Trivadis con interfaces y flujos entre aplicaciones

Accede desde la sección **Generador** en el menú lateral. Requiere PlantUML instalado (ver [Prerequisitos](#prerequisitos)).

## 🏗️ Arquitectura

### Stack Tecnológico

- **Frontend**: Next.js 16.1.6 (App Router) + React 19
- **Styling**: Tailwind CSS 4
- **UI Components**: Radix UI + Shadcn
- **Charts**: Recharts + D3.js
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Backend**: Next.js API Routes
- **ORM**: Prisma 7.3.0
- **Database**: PostgreSQL (Azure Flexible Server)

### Estructura del Proyecto

```
terpel-nexus-t/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API Routes
│   │   │   ├── dashboard/    # Dashboard endpoints
│   │   │   ├── diagrams/     # Generación de diagramas
│   │   │   └── filters/      # Filtros endpoint
│   │   ├── strategic-risk-matrix/     # S2. Matriz de riesgo estratégico
│   │   ├── cloud-transformation/     # S3. Transformación cloud
│   │   ├── vendor-concentration/     # S4. Concentración de vendors
│   │   ├── portfolio-matrix/         # T2. Matriz de portafolio
│   │   ├── tech-radar/               # T3. Radar tecnológico
│   │   ├── capability-fragmentation/ # T6. Fragmentación de capacidades
│   │   ├── app-deep-dive/            # O1. Deep dive de aplicación
│   │   ├── tech-stack-analyzer/      # O2. Analizador de stack
│   │   ├── data-privacy/             # O4. Privacidad y compliance
│   │   ├── generador/                # Generador de diagramas
│   │   └── ...                       # Dashboards legacy
│   ├── components/           # Componentes React
│   │   ├── charts/          # Componentes de gráficos
│   │   ├── layout/          # Layout components
│   │   └── ui/              # UI components (Shadcn)
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utilidades
│   │   ├── db.ts           # Cliente Prisma
│   │   ├── filters.ts      # Lógica de filtros
│   │   └── utils.ts        # Utilidades generales
│   ├── store/              # Zustand stores
│   └── generated/          # Código generado (Prisma)
├── prisma/                # Schema de Prisma
├── output/                # Archivos generados (git ignored)
└── public/                # Assets estáticos
```

## 📦 Scripts Disponibles

```bash
# Desarrollo
npm run dev                  # Inicia servidor de desarrollo

# Build
npm run build               # Build de producción

# Production
npm start                   # Inicia servidor de producción

# Utilidades
npm run postinstall        # Genera Prisma Client (automático)
```

## 🗄️ Base de Datos

La aplicación se conecta a PostgreSQL en Azure. La configuración se hace mediante la variable de entorno `DATABASE_URL`.

### Schema Principal

- **Aplicaciones**: `tbl_aplicacion`
- **Componentes Lógicos**: `tbl_componente_logico`
- **Interfaces**: `tbl_interfaz`, `rel_com_interfaz_consumo`
- **Despliegues**: `tbl_componente_despliegue`, `rel_componente_log_despliegue`
- **Tecnologías**: `cat_tecnologia`
- **Capacidades**: `cat_capacidad` (3 niveles)
- **Procesos**: `cat_macroproceso`, `cat_proceso`, `cat_subproceso`
- **Líneas de Negocio**: `cat_linea_negocio`, `cat_linea_negocio_principal`

## 🔧 Configuración

### Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con la variable `DATABASE_URL` apuntando a tu instancia de PostgreSQL.

### Prisma

El proyecto usa Prisma con:
- **Adapter**: `@prisma/adapter-pg` para mejor compatibilidad con PostgreSQL
- **Pool de conexiones**: Configurado para serverless
- **Multi-schema**: Soporte para múltiples schemas en PostgreSQL

## 📊 Visualizaciones

El dashboard incluye diversos tipos de gráficos:

- **Pie/Donut Charts**: Distribución de criticidad, modelos de servicio, compliance
- **Scatter Plots**: Matrices de riesgo, portafolio Gartner con cuadrantes
- **Bar Charts**: Top aplicaciones, tecnologías, vendors, fragmentación
- **Stacked Bar Charts**: Cobertura de macroprocesos, plataformas por criticidad
- **Heatmaps**: Macroprocesos × tecnologías, tecnologías × aplicaciones
- **Treemaps**: Jerarquía de procesos, concentración de vendors
- **Sunburst Charts**: Jerarquía de capacidades
- **Radar SVG**: Technology radar con anillos de adopción
- **Progress Bars**: Metas de transformación cloud

## 🎨 UI/UX

- **Design System**: Basado en Shadcn/ui
- **Tema**: Dark mode por defecto
- **Responsive**: Optimizado para desktop (dashboards requieren espacio)
- **Performance**: Lazy loading de componentes pesados
- **Accesibilidad**: Componentes Radix UI con ARIA

## 🔐 Seguridad

- **Conexión SSL**: PostgreSQL con SSL requerido
- **Environment Variables**: Credenciales nunca en código
- **SQL Injection**: Protección vía Prisma ORM
- **CORS**: Configurado para desarrollo local

## 📈 Performance

- **Server Components**: Uso de React Server Components cuando es posible
- **Data Caching**: React Query para caché de datos
- **Code Splitting**: Automático con Next.js
- **Image Optimization**: Next.js Image component (con Sharp)

## 🤝 Contribución

Este proyecto sigue **GitHub Flow**:

1. Crea un branch desde `main`
2. Haz tus cambios
3. Crea un Pull Request
4. Aprueba y merge a `main`

## 📝 Notas

- **Base de datos**: Solo lectura (no modifica datos)
- **Timezone**: Configurado para zona horaria de Colombia

## 🐛 Troubleshooting

### Error de conexión a base de datos

Verifica que:
1. La variable `DATABASE_URL` esté correctamente configurada
2. El firewall de PostgreSQL permita tu IP
3. Las credenciales sean correctas

### Error en build

```bash
# Limpia caché y reinstala
rm -rf node_modules package-lock.json .next
npm cache clean --force
npm install
```

### Prisma Client no se genera

```bash
npx prisma generate
```

### El diagrama blueprint no se genera / no aparecen botones de descarga

Esto ocurre cuando PlantUML no está instalado en el sistema. Verifica:

1. Que PlantUML esté instalado: `plantuml -version`
2. Que Java esté instalado: `java -version`
3. Si no están instalados, sigue las instrucciones en [Prerequisitos](#prerequisitos)

## 📚 Recursos

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Shadcn/ui](https://ui.shadcn.com/)
- [PlantUML](https://plantuml.com/)

## 📄 Licencia

Uso interno de Terpel.

---

**Última actualización**: 2026-02-10
>>>>>>> origen/main
