# Inicio Rápido - Base de Datos Existente

Si ya tienes una base de datos PostgreSQL en Azure, sigue estos pasos simplificados:

## 1. Verificar Requisitos

```bash
./azure/verify-config.sh
```

Asegúrate de tener:
- ✓ Node.js 18+
- ✓ Azure CLI instalado
- ✓ npm/package.json funcionando

## 2. Probar Conexión a tu BD (Opcional pero recomendado)

```bash
./azure/test-db-connection.sh
```

Este script verificará que puedas conectarte a tu base de datos PostgreSQL desde local.

## 3. Configurar Firewall de PostgreSQL

Ve a Azure Portal y asegúrate de permitir conexiones desde Azure:

1. Azure Portal > Tu PostgreSQL Server > **Networking**
2. Habilita: **"Allow public access from any Azure service within Azure to this server"**

O desde CLI:

```bash
az postgres flexible-server firewall-rule create \
  --resource-group [tu-resource-group] \
  --name [tu-servidor-postgres] \
  --rule-name AllowAzureServices \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0
```

## 4. Crear Azure Static Web App

```bash
./azure/provision-simple.sh
```

El script te pedirá:
- Nombre del Resource Group
- Región de Azure
- Nombre de tu Static Web App
- **Información de tu BD existente**:
  - Servidor (ej: `miservidor.postgres.database.azure.com`)
  - Base de datos
  - Usuario
  - Contraseña

## 5. Configurar GitHub Secrets

Después del script, ve a tu repositorio de GitHub:

**Settings > Secrets and variables > Actions > New repository secret**

Agrega estos 2 secrets (el script te los mostrará):

1. `AZURE_STATIC_WEB_APPS_API_TOKEN`
2. `DATABASE_URL`

## 6. Verificar Schema de Prisma

Asegúrate de que tu base de datos tenga el schema `reestructuracion`:

```bash
# Opción A: Crear schema manualmente
psql -h [servidor].postgres.database.azure.com \
     -U [usuario] \
     -d [base-datos] \
     -c "CREATE SCHEMA IF NOT EXISTS reestructuracion;"

# Opción B: Ejecutar migraciones de Prisma
npx prisma migrate deploy
# o
npx prisma db push
```

## 7. Desplegar

```bash
git add .
git commit -m "feat: configurar despliegue en Azure"
git push
```

GitHub Actions desplegará automáticamente. Ve el progreso en la pestaña **Actions** de tu repo.

## 8. Verificar Despliegue

Tu app estará disponible en:
```
https://[nombre-app].azurestaticapps.net
```

Revisa los logs en GitHub Actions si hay algún problema.

## Troubleshooting

### Error: Cannot connect to database

1. Verifica que el firewall de PostgreSQL permita conexiones desde Azure
2. Verifica que el `DATABASE_URL` en GitHub Secrets sea correcto
3. Asegúrate de usar `sslmode=require` en la connection string

### Error: Schema "reestructuracion" does not exist

Crea el schema manualmente:
```sql
CREATE SCHEMA IF NOT EXISTS reestructuracion;
```

O ejecuta las migraciones de Prisma:
```bash
npx prisma db push
```

### Build falla en GitHub Actions

1. Revisa los logs en la pestaña Actions
2. Verifica que el secret `DATABASE_URL` esté configurado
3. Asegúrate de que `npm run build` funcione localmente

## Costos

- **Azure Static Web Apps (Free tier)**: $0/mes (100GB ancho de banda)
- **Tu BD PostgreSQL existente**: Sin costo adicional

**Total: $0/mes adicionales** (solo pagas tu BD existente)

Si necesitas más ancho de banda, el tier Standard cuesta ~$9/mes.

## Comandos Útiles

Ver URL de tu Static Web App:
```bash
az staticwebapp show \
  --name [nombre-app] \
  --resource-group [resource-group] \
  --query "defaultHostname" \
  --output tsv
```

Ver logs:
```bash
az staticwebapp logs show \
  --name [nombre-app] \
  --resource-group [resource-group]
```

Eliminar todo (si quieres empezar de nuevo):
```bash
./azure/cleanup.sh
```
