#!/bin/bash

# Script para verificar que todo está configurado correctamente antes de desplegar

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}=== Verificación de Configuración para Azure ===${NC}"
echo ""

# Verificar Node.js
echo -e "${YELLOW}Verificando Node.js...${NC}"
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✓ Node.js instalado: ${NODE_VERSION}${NC}"
else
    echo -e "${RED}✗ Node.js no está instalado${NC}"
    exit 1
fi

# Verificar npm
echo -e "${YELLOW}Verificando npm...${NC}"
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    echo -e "${GREEN}✓ npm instalado: ${NPM_VERSION}${NC}"
else
    echo -e "${RED}✗ npm no está instalado${NC}"
    exit 1
fi

# Verificar Azure CLI
echo -e "${YELLOW}Verificando Azure CLI...${NC}"
if command -v az &> /dev/null; then
    AZ_VERSION=$(az version --query '\"azure-cli\"' -o tsv 2>/dev/null || echo "instalado")
    echo -e "${GREEN}✓ Azure CLI instalado: ${AZ_VERSION}${NC}"

    # Verificar autenticación (con manejo de SSL)
    echo -e "${YELLOW}Verificando autenticación...${NC}"
    if az account show &> /tmp/az_auth_error.log 2>&1; then
        echo -e "${GREEN}✓ Ya estás autenticado en Azure${NC}"
    else
        if grep -q "CERTIFICATE_VERIFY_FAILED" /tmp/az_auth_error.log 2>/dev/null; then
            echo -e "${YELLOW}! Detectado ambiente corporativo con proxy${NC}"
            echo -e "${YELLOW}  El script de provisionamiento manejará esto automáticamente${NC}"
        else
            echo -e "${YELLOW}! No autenticado - necesitarás hacer 'az login' al ejecutar el script${NC}"
        fi
    fi
    rm -f /tmp/az_auth_error.log
else
    echo -e "${RED}✗ Azure CLI no está instalado${NC}"
    echo -e "${YELLOW}Instálalo desde: https://docs.microsoft.com/cli/azure/install-azure-cli${NC}"
    exit 1
fi

# Verificar que estamos en el directorio correcto
echo -e "${YELLOW}Verificando estructura del proyecto...${NC}"
if [ -f "package.json" ] && [ -f "next.config.ts" ]; then
    echo -e "${GREEN}✓ Estructura del proyecto correcta${NC}"
else
    echo -e "${RED}✗ No se encuentra en el directorio raíz del proyecto${NC}"
    exit 1
fi

# Verificar dependencias instaladas
echo -e "${YELLOW}Verificando dependencias...${NC}"
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓ Dependencias instaladas${NC}"
else
    echo -e "${YELLOW}! Dependencias no instaladas. Ejecuta: npm install${NC}"
fi

# Verificar Prisma
echo -e "${YELLOW}Verificando Prisma...${NC}"
if [ -f "prisma/schema.prisma" ]; then
    echo -e "${GREEN}✓ Schema de Prisma encontrado${NC}"
else
    echo -e "${RED}✗ Schema de Prisma no encontrado${NC}"
    exit 1
fi

# Verificar archivo .env (opcional para local)
echo -e "${YELLOW}Verificando variables de entorno...${NC}"
if [ -f ".env" ]; then
    echo -e "${GREEN}✓ Archivo .env encontrado${NC}"
    if grep -q "DATABASE_URL" .env; then
        echo -e "${GREEN}✓ DATABASE_URL configurado${NC}"
    else
        echo -e "${YELLOW}! DATABASE_URL no encontrado en .env${NC}"
    fi
else
    echo -e "${YELLOW}! Archivo .env no encontrado (opcional para desarrollo local)${NC}"
fi

# Verificar archivos de configuración de Azure
echo -e "${YELLOW}Verificando archivos de configuración de Azure...${NC}"
if [ -f "staticwebapp.config.json" ]; then
    echo -e "${GREEN}✓ staticwebapp.config.json encontrado${NC}"
else
    echo -e "${RED}✗ staticwebapp.config.json no encontrado${NC}"
    exit 1
fi

if [ -f ".github/workflows/azure-static-web-apps.yml" ]; then
    echo -e "${GREEN}✓ GitHub Actions workflow encontrado${NC}"
else
    echo -e "${RED}✗ GitHub Actions workflow no encontrado${NC}"
    exit 1
fi

# Verificar que el build funcione localmente
echo ""
echo -e "${YELLOW}¿Deseas probar el build localmente? (esto puede tardar unos minutos) [y/N]${NC}"
read -r response
if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    echo -e "${YELLOW}Ejecutando build...${NC}"
    npm run build
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Build exitoso${NC}"
    else
        echo -e "${RED}✗ Build falló${NC}"
        exit 1
    fi
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✓ Todas las verificaciones pasaron${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}Próximos pasos:${NC}"
echo "1. Ejecuta ./azure/provision.sh para crear recursos en Azure"
echo "2. Configura los GitHub Secrets según la documentación"
echo "3. Haz push a tu repositorio para desplegar"
echo ""
echo "Lee azure/DEPLOYMENT.md para instrucciones detalladas"
