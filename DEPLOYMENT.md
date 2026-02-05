# Terpel Nexus Dashboard - Deployment Guide

## ✅ Arquitectura Implementada: Opción B

Después de múltiples intentos con diferentes enfoques de Azure, se implementó exitosamente la **Opción B**: Frontend estático + Backend separado.

### 🏗️ Arquitectura Final

```
┌─────────────────────────────────────────────────┐
│  FRONTEND (Next.js Static Export)               │
│  Azure Blob Storage - Static Website            │
│  https://sandboxarqstorage.z20.web.core.windows.net/  │
│  Costo: $0/mes                                  │
└─────────────────────────────────────────────────┘
                      │
                      │ API Calls
                      ▼
┌─────────────────────────────────────────────────┐
│  BACKEND (Azure Functions)                      │
│  Node.js 20 + Prisma + PostgreSQL              │
│  https://sandbox-arq-api.azurewebsites.net/api │
│  Costo: $0-5/mes (Consumption Plan)            │
└─────────────────────────────────────────────────┘
                      │
                      │ Database Connection
                      ▼
┌─────────────────────────────────────────────────┐
│  DATABASE (PostgreSQL Flexible Server)         │
│  sandbox-arquitectura-db.postgres.database.azure.com  │
│  Costo: ~$12/mes (B1ms)                         │
└─────────────────────────────────────────────────┘
```

## 💰 Costo Total Mensual: ~$12-17/mes

- **Frontend**: $0 (Azure Storage static website - prácticamente gratis)
- **Backend**: $0-5 (Azure Functions Consumption - primeras 1M ejecuciones gratis)
- **Database**: $12 (PostgreSQL Flexible Server B1ms - ya existente)

## 📦 Recursos de Azure Desplegados

| Recurso | Nombre | Ubicación | Tier | Estado |
|---------|--------|-----------|------|--------|
| Storage Account | `sandboxarqstorage` | East US 2 | Standard_LRS | ✅ Activo |
| Function App | `sandbox-arq-api` | East US 2 | Consumption (Windows) | ⚠️ Necesita ajuste |
| PostgreSQL Server | `sandbox-arquitectura-db` | East US 2 | B1ms | ✅ Activo |

## 🚀 Estado del Deployment

### ✅ Completado

1. **Frontend Estático**
   - ✅ Next.js configurado para export estático (`output: "export"`)
   - ✅ Build generado exitosamente en `/out`
   - ✅ Desplegado en Azure Blob Storage
   - ✅ Static website hosting habilitado
   - ✅ 404.html configurado
   - **URL**: https://sandboxarqstorage.z20.web.core.windows.net/

2. **Backend API - Azure Functions**
   - ✅ Estructura de proyecto creada en `/azure-functions`
   - ✅ Código TypeScript compilado
   - ✅ Prisma Client generado
   - ✅ DATABASE_URL configurado en Azure Functions
   - ✅ Deployment package creado y subido

3. **Base de Datos**
   - ✅ PostgreSQL Flexible Server funcionando
   - ✅ Firewall configurado para Azure services
   - ✅ Schema y datos existentes intactos

### ⚠️ Pendiente de Ajuste Final

**Azure Functions no está registrando las funciones correctamente.**

**Problema**: El deployment zip se sube correctamente pero las funciones no se registran en Azure.

**Causa Probable**: Azure Functions necesita que las dependencias de Node.js (específicamente `node_modules` con Prisma binaries) estén incluidas en el deployment package.

## 🔧 Próximos Pasos para Completar el Deployment

### Opción 1: Usar Azure Functions Core Tools (Recomendado)

```bash
# Instalar Azure Functions Core Tools
brew tap azure/functions
brew install azure-functions-core-tools@4

# Navegar al directorio de functions
cd azure-functions

# Desplegar usando func CLI
func azure functionapp publish sandbox-arq-api --typescript
```

### Opción 2: Incluir node_modules en el Zip

```bash
cd azure-functions

# Instalar dependencias de producción
npm install --production

# Crear package con node_modules
zip -r deploy.zip dist host.json package.json package-lock.json node_modules

# Desplegar
az functionapp deployment source config-zip \
  --resource-group SANDBOX-TERPEL-RG \
  --name sandbox-arq-api \
  --src deploy.zip
```

### Opción 3: Configurar CI/CD con GitHub Actions

Crear `.github/workflows/azure-functions-deploy.yml`:

```yaml
name: Deploy Azure Functions

on:
  push:
    branches: [ main, featue-initial ]
    paths:
      - 'azure-functions/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: |
          cd azure-functions
          npm ci

      - name: Generate Prisma Client
        run: |
          cd ../
          npx prisma generate

      - name: Build TypeScript
        run: |
          cd azure-functions
          npm run build

      - name: Deploy to Azure Functions
        uses: Azure/functions-action@v1
        with:
          app-name: sandbox-arq-api
          package: azure-functions
          publish-profile: ${{ secrets.AZURE_FUNCTIONAPP_PUBLISH_PROFILE }}
```

## 📋 Endpoints Implementados

Las siguientes funciones están implementadas en el código pero necesitan ser registradas en Azure:

| Endpoint | Descripción | Implementado |
|----------|-------------|--------------|
| `GET /api/filters` | Obtener filtros (criticidades, líneas de negocio, estados) | ✅ |
| `GET /api/dashboard/home` | Dashboard principal con KPIs y gráficos | ✅ |

**Pendientes de migrar** (código Next.js original):
- `/api/dashboard/alignment`
- `/api/dashboard/architecture`
- `/api/dashboard/change`
- `/api/dashboard/costs`
- `/api/dashboard/executive`
- `/api/dashboard/governance`
- `/api/dashboard/innovation`
- `/api/dashboard/performance`
- `/api/dashboard/risks`
- `/api/dashboard/technical-debt`

## 🧪 Testing

### Verificar Frontend

```bash
# Abrir en navegador
open https://sandboxarqstorage.z20.web.core.windows.net/
```

### Verificar Backend (Una vez arreglado)

```bash
# Test filters endpoint
curl https://sandbox-arq-api.azurewebsites.net/api/filters

# Test home dashboard
curl https://sandbox-arq-api.azurewebsites.net/api/dashboard/home

# Con filtros
curl "https://sandbox-arq-api.azurewebsites.net/api/dashboard/home?criticidad=Alta,Cr%C3%ADtica"
```

## 📝 Variables de Entorno

### Frontend (.env.production)
```bash
NEXT_PUBLIC_API_URL=https://sandbox-arq-api.azurewebsites.net/api
```

### Backend (Azure Functions App Settings)
```bash
DATABASE_URL=postgresql://admin_arq:Terpel2025%2A@sandbox-arquitectura-db.postgres.database.azure.com:5432/arq?schema=reestructuracion&sslmode=require
```

## 🔄 Workflow de Actualización

### Frontend
```bash
# 1. Hacer cambios en el código
# 2. Build
npm run build

# 3. Deploy a Azure Storage
az storage blob upload-batch \
  --account-name sandboxarqstorage \
  --auth-mode key \
  --destination '$web' \
  --source out \
  --overwrite
```

### Backend
```bash
cd azure-functions

# 1. Hacer cambios en el código
# 2. Compilar
npm run build

# 3. Deploy (usar una de las opciones anteriores)
func azure functionapp publish sandbox-arq-api --typescript
```

## 🗑️ Recursos Eliminados (Limpieza)

Durante la implementación se eliminaron recursos no funcionales:

- ❌ Azure Static Web App "sandbox-arquitectura-swa" (Standard tier) - Error persistente: "Failed to deploy Azure Functions"
- ❌ Azure Static Web App "nexust-app" (Free tier) - Mismo error
- ❌ GitHub workflows de Static Web Apps
- ❌ API routes de Next.js (`/src/app/api/*`) - Migrados a Azure Functions

## 📚 Documentación Adicional

- [Azure Functions v4 Programming Model](https://learn.microsoft.com/en-us/azure/azure-functions/functions-reference-node)
- [Next.js Static Exports](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)
- [Azure Blob Storage Static Websites](https://learn.microsoft.com/en-us/azure/storage/blobs/storage-blob-static-website)

## 🐛 Troubleshooting

### Frontend no carga
- Verificar que static website esté habilitado
- Verificar que los archivos existan en `$web` container
- Verificar la URL correcta del static website

### API devuelve 404
- Verificar que las funciones estén registradas: `az functionapp function list --name sandbox-arq-api`
- Verificar logs: Ir a Azure Portal > Function App > Log stream
- Revisar Application Insights para errors

### Base de datos no conecta
- Verificar firewall rules en PostgreSQL
- Verificar DATABASE_URL en App Settings
- Verificar que Prisma Client esté generado

---

**Última actualización**: 2026-02-05
**Estado**: ⚠️ Frontend desplegado, Backend necesita ajuste final para registrar funciones
