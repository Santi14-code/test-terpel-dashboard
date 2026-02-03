#!/bin/bash

# Script simplificado para provisionar solo Azure Static Web App
# Usa una base de datos PostgreSQL existente

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Provisionamiento de Azure Static Web App ===${NC}"
echo -e "${YELLOW}(Base de datos PostgreSQL existente)${NC}"
echo ""

# Variables
read -p "Nombre del Resource Group (ej: rg-terpel-nexus): " RESOURCE_GROUP
read -p "Región de Azure (ej: eastus, westus2): " LOCATION
read -p "Nombre de la Static Web App (ej: terpel-nexus-dashboard): " STATIC_APP_NAME

echo ""
echo -e "${YELLOW}Información de tu base de datos existente:${NC}"
read -p "Servidor PostgreSQL (ej: miservidor.postgres.database.azure.com): " POSTGRES_SERVER
read -p "Nombre de la base de datos: " POSTGRES_DB_NAME
read -p "Usuario de la base de datos: " POSTGRES_USER
read -sp "Contraseña de la base de datos: " POSTGRES_PASSWORD
echo ""

# Verificar Azure CLI
echo -e "${YELLOW}Verificando Azure CLI...${NC}"
if ! command -v az &> /dev/null; then
    echo -e "${RED}Azure CLI no está instalado. Instálalo desde: https://docs.microsoft.com/cli/azure/install-azure-cli${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Azure CLI encontrado${NC}"
echo ""

# Detectar y manejar problemas de SSL
echo -e "${YELLOW}Verificando autenticación en Azure...${NC}"
if ! az account show &> /tmp/az_error.log 2>&1; then
    # Verificar si el error es de SSL
    if grep -q "CERTIFICATE_VERIFY_FAILED" /tmp/az_error.log 2>/dev/null; then
        echo -e "${RED}Detectado problema de certificado SSL (ambiente corporativo con proxy)${NC}"
        echo ""
        echo -e "${YELLOW}Opciones:${NC}"
        echo "1. Deshabilitar verificación SSL (recomendado para ambientes corporativos)"
        echo "2. Configurar certificado manualmente"
        echo "3. Salir"
        echo ""
        read -p "Selecciona una opción (1-3): " SSL_OPTION

        case $SSL_OPTION in
            1)
                echo -e "${YELLOW}Deshabilitando verificación SSL...${NC}"
                export AZURE_CLI_DISABLE_CONNECTION_VERIFICATION=1
                echo -e "${GREEN}✓ Verificación SSL deshabilitada${NC}"
                echo ""
                ;;
            2)
                echo -e "${YELLOW}Configura la variable REQUESTS_CA_BUNDLE con la ruta al certificado de tu proxy:${NC}"
                echo "export REQUESTS_CA_BUNDLE=/path/to/corporate-ca-bundle.pem"
                echo ""
                read -p "Presiona Enter cuando hayas configurado la variable..."
                ;;
            3)
                echo -e "${YELLOW}Saliendo...${NC}"
                rm -f /tmp/az_error.log
                exit 0
                ;;
            *)
                echo -e "${RED}Opción inválida${NC}"
                rm -f /tmp/az_error.log
                exit 1
                ;;
        esac
    fi

    # Intentar login
    echo -e "${YELLOW}Iniciando sesión en Azure...${NC}"
    az login
fi

rm -f /tmp/az_error.log
echo -e "${GREEN}✓ Autenticado en Azure${NC}"
echo ""

# Crear o verificar Resource Group
echo -e "${YELLOW}Verificando Resource Group: ${RESOURCE_GROUP}...${NC}"
if az group show --name "$RESOURCE_GROUP" &> /dev/null; then
    echo -e "${GREEN}✓ Resource Group ya existe${NC}"
else
    echo -e "${YELLOW}Creando Resource Group...${NC}"
    az group create \
      --name "$RESOURCE_GROUP" \
      --location "$LOCATION" \
      --output table
    echo -e "${GREEN}✓ Resource Group creado${NC}"
fi
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
DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_SERVER}:5432/${POSTGRES_DB_NAME}?schema=reestructuracion&sslmode=require"

# Obtener URL de la Static Web App
STATIC_APP_URL=$(az staticwebapp show \
  --name "$STATIC_APP_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --query "defaultHostname" \
  --output tsv)

# Mostrar resumen
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✓ Provisionamiento completado exitosamente${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}PASO 1: Configurar GitHub Secrets${NC}"
echo ""
echo "Ve a tu repositorio de GitHub:"
echo "Settings > Secrets and variables > Actions > New repository secret"
echo ""
echo "Agrega estos 2 secrets:"
echo ""
echo -e "${YELLOW}Secret 1: AZURE_STATIC_WEB_APPS_API_TOKEN${NC}"
echo "${DEPLOYMENT_TOKEN}"
echo ""
echo -e "${YELLOW}Secret 2: DATABASE_URL${NC}"
echo "${DATABASE_URL}"
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${YELLOW}PASO 2: Verificar que la base de datos esté accesible${NC}"
echo ""
echo "Asegúrate de que el firewall de tu PostgreSQL Server permita conexiones desde Azure:"
echo "1. Ve a Azure Portal > Tu PostgreSQL Server > Networking"
echo "2. Habilita 'Allow public access from any Azure service within Azure to this server'"
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${YELLOW}Tu aplicación:${NC}"
echo ""
echo "URL: https://${STATIC_APP_URL}"
echo "Resource Group: ${RESOURCE_GROUP}"
echo "Static Web App: ${STATIC_APP_NAME}"
echo ""
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}PASO 3: Desplegar${NC}"
echo ""
echo "1. Configura los GitHub Secrets (paso 1)"
echo "2. Haz push a tu repositorio:"
echo ""
echo "   git add ."
echo "   git commit -m \"feat: configurar despliegue en Azure\""
echo "   git push"
echo ""
echo -e "${GREEN}¡GitHub Actions desplegará automáticamente tu aplicación!${NC}"
