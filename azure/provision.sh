#!/bin/bash

# Script para provisionar recursos en Azure
# Azure Static Web Apps + PostgreSQL Flexible Server

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Provisionamiento de Azure Resources ===${NC}"
echo ""

# Variables (modifica según tus necesidades)
read -p "Nombre del Resource Group: " RESOURCE_GROUP
read -p "Región de Azure (ej: eastus, westus2): " LOCATION
read -p "Nombre de la Static Web App: " STATIC_APP_NAME
read -p "Nombre del servidor PostgreSQL: " POSTGRES_SERVER_NAME
read -p "Usuario admin de PostgreSQL: " POSTGRES_ADMIN_USER
read -sp "Contraseña admin de PostgreSQL (mínimo 8 caracteres): " POSTGRES_ADMIN_PASSWORD
echo ""

# Nombre de la base de datos
POSTGRES_DB_NAME="terpel_nexus"

echo -e "${YELLOW}Verificando que Azure CLI esté instalado...${NC}"
if ! command -v az &> /dev/null; then
    echo -e "${RED}Azure CLI no está instalado. Instálalo desde: https://docs.microsoft.com/cli/azure/install-azure-cli${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Azure CLI encontrado${NC}"
echo ""

# Login a Azure (si no está autenticado)
echo -e "${YELLOW}Verificando autenticación en Azure...${NC}"
az account show &> /dev/null || az login

echo -e "${GREEN}✓ Autenticado en Azure${NC}"
echo ""

# Crear Resource Group
echo -e "${YELLOW}Creando Resource Group: ${RESOURCE_GROUP}...${NC}"
az group create \
  --name "$RESOURCE_GROUP" \
  --location "$LOCATION" \
  --output table

echo -e "${GREEN}✓ Resource Group creado${NC}"
echo ""

# Crear PostgreSQL Flexible Server (tier más económico: B1ms)
echo -e "${YELLOW}Creando PostgreSQL Flexible Server (esto puede tardar 5-10 minutos)...${NC}"
az postgres flexible-server create \
  --resource-group "$RESOURCE_GROUP" \
  --name "$POSTGRES_SERVER_NAME" \
  --location "$LOCATION" \
  --admin-user "$POSTGRES_ADMIN_USER" \
  --admin-password "$POSTGRES_ADMIN_PASSWORD" \
  --sku-name Standard_B1ms \
  --tier Burstable \
  --version 16 \
  --storage-size 32 \
  --public-access 0.0.0.0-255.255.255.255 \
  --output table

echo -e "${GREEN}✓ PostgreSQL Server creado${NC}"
echo ""

# Crear base de datos
echo -e "${YELLOW}Creando base de datos: ${POSTGRES_DB_NAME}...${NC}"
az postgres flexible-server db create \
  --resource-group "$RESOURCE_GROUP" \
  --server-name "$POSTGRES_SERVER_NAME" \
  --database-name "$POSTGRES_DB_NAME" \
  --output table

echo -e "${GREEN}✓ Base de datos creada${NC}"
echo ""

# Habilitar extensiones necesarias (si las necesitas)
echo -e "${YELLOW}Configurando extensiones de PostgreSQL...${NC}"
az postgres flexible-server parameter set \
  --resource-group "$RESOURCE_GROUP" \
  --server-name "$POSTGRES_SERVER_NAME" \
  --name azure.extensions \
  --value "uuid-ossp" \
  --output table

echo -e "${GREEN}✓ Extensiones configuradas${NC}"
echo ""

# Crear Static Web App
echo -e "${YELLOW}Creando Azure Static Web App...${NC}"
az staticwebapp create \
  --name "$STATIC_APP_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --location "$LOCATION" \
  --sku Free \
  --output table

echo -e "${GREEN}✓ Static Web App creada${NC}"
echo ""

# Obtener el deployment token
echo -e "${YELLOW}Obteniendo deployment token...${NC}"
DEPLOYMENT_TOKEN=$(az staticwebapp secrets list \
  --name "$STATIC_APP_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --query "properties.apiKey" \
  --output tsv)

echo -e "${GREEN}✓ Deployment token obtenido${NC}"
echo ""

# Construir DATABASE_URL
DATABASE_URL="postgresql://${POSTGRES_ADMIN_USER}:${POSTGRES_ADMIN_PASSWORD}@${POSTGRES_SERVER_NAME}.postgres.database.azure.com:5432/${POSTGRES_DB_NAME}?schema=reestructuracion&sslmode=require"

# Mostrar resumen
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✓ Provisionamiento completado exitosamente${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}SIGUIENTE PASO: Configurar GitHub Secrets${NC}"
echo ""
echo "Ve a tu repositorio de GitHub:"
echo "Settings > Secrets and variables > Actions > New repository secret"
echo ""
echo "Agrega estos secrets:"
echo ""
echo -e "${YELLOW}1. AZURE_STATIC_WEB_APPS_API_TOKEN${NC}"
echo "$DEPLOYMENT_TOKEN"
echo ""
echo -e "${YELLOW}2. DATABASE_URL${NC}"
echo "$DATABASE_URL"
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${YELLOW}Información de conexión:${NC}"
echo ""
echo "PostgreSQL Server: ${POSTGRES_SERVER_NAME}.postgres.database.azure.com"
echo "Database: ${POSTGRES_DB_NAME}"
echo "Admin User: ${POSTGRES_ADMIN_USER}"
echo "Schema: reestructuracion"
echo ""
echo "Static Web App URL:"
az staticwebapp show \
  --name "$STATIC_APP_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --query "defaultHostname" \
  --output tsv
echo ""
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}IMPORTANTE:${NC}"
echo "1. Copia los secrets de arriba y agrégalos a GitHub"
echo "2. Ejecuta las migraciones de Prisma:"
echo "   npx prisma migrate deploy"
echo "3. Haz push a tu repositorio para activar el deployment"
echo ""
echo -e "${GREEN}¡Listo! Tu aplicación se desplegará automáticamente en el siguiente push.${NC}"
