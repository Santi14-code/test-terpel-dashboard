# Guía de Despliegue en Azure

Esta guía te ayudará a desplegar la aplicación Terpel Nexus Dashboard en Azure usando Static Web Apps + PostgreSQL Flexible Server.

## Costos Estimados

- **Azure Static Web Apps (Free tier)**: $0/mes (100GB ancho de banda)
- **Azure Static Web Apps (Standard)**: ~$9/mes (sin límites)
- **PostgreSQL Flexible Server B1ms**: ~$12/mes

**Total: $12-21 USD/mes**

## Requisitos Previos

1. Cuenta de Azure activa
2. Azure CLI instalado ([Instalar aquí](https://docs.microsoft.com/cli/azure/install-azure-cli))
3. Repositorio en GitHub
4. Node.js 18+ instalado localmente

## Paso 1: Provisionar Recursos en Azure

### Opción A: Usar Base de Datos Existente (Recomendado si ya tienes una BD)

Si ya tienes una base de datos PostgreSQL en Azure, usa el script simplificado:

```bash
cd azure
./provision-simple.sh
```

El script te pedirá:
- **Resource Group**: Nombre para agrupar recursos (ej: `rg-terpel-nexus`)
- **Región**: Ubicación de Azure (ej: `eastus`, `westus2`)
- **Static App Name**: Nombre de tu app (ej: `terpel-nexus-dashboard`)
- **Información de tu BD existente**:
  - Servidor PostgreSQL (ej: `miservidor.postgres.database.azure.com`)
  - Nombre de base de datos
  - Usuario
  - Contraseña

El script creará:
- Resource Group (si no existe)
- Azure Static Web App (tier Free)

### Opción B: Crear Todo desde Cero

Si necesitas crear también la base de datos:

```bash
cd azure
./provision.sh
```

El script te pedirá:
- **Resource Group**: Nombre para agrupar recursos (ej: `rg-terpel-nexus`)
- **Región**: Ubicación de Azure (ej: `eastus`, `westus2`)
- **Static App Name**: Nombre de tu app (ej: `terpel-nexus-dashboard`)
- **PostgreSQL Server**: Nombre del servidor (ej: `terpel-nexus-db`)
- **Admin User**: Usuario administrador de PostgreSQL
- **Admin Password**: Contraseña (mínimo 8 caracteres)

El script creará:
- Resource Group
- PostgreSQL Flexible Server (tier B1ms - el más económico)
- Base de datos `terpel_nexus`
- Azure Static Web App (tier Free)

## Paso 1.5: Configurar Firewall de PostgreSQL (Si usas BD existente)

Si usas una base de datos existente, asegúrate de que el firewall permita conexiones desde Azure:

1. Ve a [Azure Portal](https://portal.azure.com)
2. Busca tu servidor PostgreSQL
3. Ve a **Networking** en el menú lateral
4. En **Firewall rules**:
   - Habilita: **"Allow public access from any Azure service within Azure to this server"**
   - O agrega una regla específica con el rango de IPs de Azure Static Web Apps

Alternativamente, desde Azure CLI:

```bash
az postgres flexible-server firewall-rule create \
  --resource-group [tu-resource-group] \
  --name [tu-servidor-postgres] \
  --rule-name AllowAzureServices \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0
```

## Paso 2: Configurar GitHub Secrets

Después de ejecutar el script, copia los valores mostrados y agrégalos a tu repositorio de GitHub:

1. Ve a tu repositorio en GitHub
2. Click en **Settings** > **Secrets and variables** > **Actions**
3. Click en **New repository secret**

Agrega estos secrets:

### AZURE_STATIC_WEB_APPS_API_TOKEN
```
<token generado por el script>
```

### DATABASE_URL
```
postgresql://[user]:[password]@[server].postgres.database.azure.com:5432/terpel_nexus?schema=reestructuracion&sslmode=require
```

## Paso 3: Ejecutar Migraciones de Prisma

Necesitas poblar tu base de datos con el schema de Prisma.

### Opción A: Desde tu máquina local

1. Crea un archivo `.env.production` con el DATABASE_URL:
```bash
DATABASE_URL="postgresql://[user]:[password]@[server].postgres.database.azure.com:5432/terpel_nexus?schema=reestructuracion&sslmode=require"
```

2. Ejecuta las migraciones:
```bash
# Si tienes migraciones
npx prisma migrate deploy

# O si solo necesitas crear el schema
npx prisma db push
```

### Opción B: Conectarse con Azure Data Studio o pgAdmin

1. Descarga el certificado SSL de Azure
2. Conéctate al servidor PostgreSQL
3. Ejecuta el schema manualmente

## Paso 4: Desplegar la Aplicación

Una vez configurados los secrets de GitHub:

```bash
git add .
git commit -m "feat: configurar despliegue en Azure"
git push origin featue-initial
```

GitHub Actions automáticamente:
1. Construirá tu aplicación Next.js
2. Generará el cliente de Prisma
3. Desplegará a Azure Static Web Apps

Puedes ver el progreso en la pestaña **Actions** de tu repositorio.

## Paso 5: Verificar Despliegue

1. Ve a tu [Azure Portal](https://portal.azure.com)
2. Busca tu Static Web App
3. Click en **Browse** para ver tu aplicación en vivo

La URL será algo como: `https://[nombre-app].azurestaticapps.net`

## Configuración Adicional

### Dominio Personalizado

1. En Azure Portal, ve a tu Static Web App
2. Click en **Custom domains**
3. Sigue las instrucciones para agregar tu dominio

### Variables de Entorno Adicionales

Si necesitas agregar más variables de entorno:

1. Azure Portal > Tu Static Web App > Configuration
2. Click en **Add** para agregar nuevas variables
3. O agrégalas como GitHub Secrets

### Firewall de PostgreSQL

Por defecto, el script permite acceso desde cualquier IP. Para mayor seguridad:

1. Azure Portal > Tu PostgreSQL Server > Networking
2. Configura las IP addresses permitidas
3. Considera usar Azure Virtual Network para mayor seguridad

## Monitoreo y Logs

### Ver logs de la aplicación

```bash
az staticwebapp logs show \
  --name [nombre-static-app] \
  --resource-group [resource-group]
```

### Métricas de PostgreSQL

1. Azure Portal > PostgreSQL Server > Metrics
2. Monitorea CPU, memoria, conexiones, etc.

## Actualización de Tier (si necesitas más recursos)

### Upgrade a Static Web App Standard

```bash
az staticwebapp update \
  --name [nombre-static-app] \
  --resource-group [resource-group] \
  --sku Standard
```

### Upgrade PostgreSQL

```bash
az postgres flexible-server update \
  --resource-group [resource-group] \
  --name [nombre-servidor] \
  --sku-name Standard_B2s
```

## Troubleshooting

### Error: Prisma client no genera correctamente

Asegúrate de que el workflow de GitHub tenga el paso `npx prisma generate`.

### Error: No se puede conectar a PostgreSQL

1. Verifica que el firewall de PostgreSQL permita conexiones desde Azure Static Web Apps
2. Verifica que el DATABASE_URL sea correcto y tenga `sslmode=require`

### Error: Build falla en GitHub Actions

1. Revisa los logs en la pestaña Actions
2. Verifica que todos los secrets estén configurados correctamente
3. Asegúrate de que `npm run build` funcione localmente

## Comandos Útiles

### Ver recursos creados
```bash
az resource list --resource-group [resource-group] --output table
```

### Eliminar todos los recursos (para empezar de nuevo)
```bash
az group delete --name [resource-group] --yes --no-wait
```

### Ver URL de la Static Web App
```bash
az staticwebapp show \
  --name [nombre-static-app] \
  --resource-group [resource-group] \
  --query "defaultHostname" \
  --output tsv
```

### Conectarse a PostgreSQL desde CLI
```bash
psql "host=[servidor].postgres.database.azure.com port=5432 dbname=terpel_nexus user=[admin-user] sslmode=require"
```

## Costos y Optimización

### Reducir costos

1. **Usar Free tier** de Static Web Apps si tu tráfico es bajo
2. **Apagar PostgreSQL** cuando no lo uses (entornos de desarrollo):
   ```bash
   az postgres flexible-server stop \
     --resource-group [resource-group] \
     --name [nombre-servidor]
   ```
3. **Reducir storage** si no necesitas mucho espacio
4. **Monitorear uso** regularmente en Azure Cost Management

### Estimar costos futuros

Usa la [Calculadora de Precios de Azure](https://azure.microsoft.com/pricing/calculator/)

## Soporte

Si tienes problemas:
1. Revisa los logs de GitHub Actions
2. Revisa los logs de Azure Static Web Apps
3. Verifica la conectividad con PostgreSQL
4. Consulta la [documentación oficial de Azure](https://docs.microsoft.com/azure/static-web-apps/)
