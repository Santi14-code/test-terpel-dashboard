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

### Dashboard Interactivo

- **Dashboard Principal**: KPIs, criticidad de aplicaciones, tecnologías más usadas
- **Alineación**: Alineación de aplicaciones con capacidades de negocio
- **Arquitectura**: Vista de componentes y sus relaciones
- **Gestión del Cambio**: Tracking de cambios y transformaciones
- **Costos**: Análisis de costos por aplicación y tecnología
- **Ejecutivo**: Vista resumida para liderazgo
- **Gobierno**: Métricas de cumplimiento y gobernanza
- **Innovación**: Tracking de iniciativas de innovación
- **Performance**: Métricas de rendimiento de aplicaciones
- **Riesgos**: Análisis de riesgos tecnológicos
- **Deuda Técnica**: Identificación y tracking de deuda técnica

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
│   │   │   └── filters/      # Filtros endpoint
│   │   ├── alignment/        # Página de alineación
│   │   ├── architecture/     # Página de arquitectura
│   │   └── ...               # Otras páginas
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
- **Tecnologías**: `cat_tecnologia`
- **Capacidades**: `cat_capacidad` (3 niveles)
- **Procesos**: `cat_macroproceso`, `cat_proceso`, `cat_subproceso`
- **Líneas de Negocio**: `cat_linea_negocio`, `cat_linea_negocio_principal`

## 🔧 Configuración

### Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
DATABASE_URL="postgresql://user:password@host:5432/database?schema=schema_name&sslmode=require"
```

### Prisma

El proyecto usa Prisma con:
- **Adapter**: `@prisma/adapter-pg` para mejor compatibilidad con PostgreSQL
- **Pool de conexiones**: Configurado para serverless
- **Multi-schema**: Soporte para múltiples schemas en PostgreSQL

## 📊 Visualizaciones

El dashboard incluye diversos tipos de gráficos:

- **Pie Charts**: Distribución de criticidad
- **Bar Charts**: Top aplicaciones, tecnologías
- **Treemaps**: Jerarquía de procesos
- **Sunburst Charts**: Jerarquía de capacidades
- **Stacked Bar Charts**: Cobertura de macroprocesos

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

**Última actualización**: 2026-02-05
