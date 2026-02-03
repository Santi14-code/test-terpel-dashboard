# Azure Deployment Scripts

Este directorio contiene todos los scripts y documentación necesarios para desplegar la aplicación en Azure.

## Inicio Rápido

### 1. Verificar configuración

```bash
./azure/verify-config.sh
```

Este script verifica que tengas todo lo necesario instalado y configurado.

### 2. Provisionar recursos en Azure

**Opción A: Si ya tienes una base de datos PostgreSQL en Azure** (recomendado)

```bash
./azure/provision-simple.sh
```

Este script solo creará:
- Resource Group (si no existe)
- Azure Static Web App (Free tier)

**Opción B: Si necesitas crear todo desde cero**

```bash
./azure/provision.sh
```

Este script creará:
- Resource Group
- Azure Static Web App (Free tier)
- PostgreSQL Flexible Server (B1ms)
- Base de datos configurada

### 3. Configurar GitHub Secrets

Después de ejecutar `provision.sh`, copia los valores mostrados y agrégalos a GitHub:

1. Ve a: `https://github.com/[tu-usuario]/[tu-repo]/settings/secrets/actions`
2. Agrega:
   - `AZURE_STATIC_WEB_APPS_API_TOKEN`
   - `DATABASE_URL`

### 4. Desplegar

```bash
git add .
git commit -m "feat: configurar despliegue en Azure"
git push
```

## Documentación Completa

Lee [DEPLOYMENT.md](./DEPLOYMENT.md) para instrucciones detalladas, troubleshooting y configuración avanzada.

## Costos

- **Azure Static Web Apps**: $0-9/mes (Free o Standard)
- **PostgreSQL B1ms**: ~$12/mes
- **Total**: $12-21/mes

## Archivos en este directorio

- `provision.sh` - Script de provisionamiento automático
- `verify-config.sh` - Verificación de requisitos previos
- `DEPLOYMENT.md` - Guía completa de despliegue
- `README.md` - Este archivo

## Soporte

Si tienes problemas, revisa la sección de Troubleshooting en [DEPLOYMENT.md](./DEPLOYMENT.md).
