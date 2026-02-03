#!/bin/bash

# Script para eliminar recursos de Azure
# ADVERTENCIA: Este script eliminará PERMANENTEMENTE todos los recursos del Resource Group

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${RED}=== ADVERTENCIA: Eliminación de Recursos ===${NC}"
echo ""
echo -e "${RED}Este script eliminará PERMANENTEMENTE todos los recursos de Azure.${NC}"
echo -e "${RED}Esta acción NO se puede deshacer.${NC}"
echo ""

# Verificar Azure CLI
if ! command -v az &> /dev/null; then
    echo -e "${RED}Azure CLI no está instalado.${NC}"
    exit 1
fi

# Login a Azure
echo -e "${YELLOW}Verificando autenticación en Azure...${NC}"
az account show &> /dev/null || az login

# Pedir nombre del Resource Group
read -p "Nombre del Resource Group a eliminar: " RESOURCE_GROUP

# Verificar que el Resource Group existe
if ! az group exists --name "$RESOURCE_GROUP" &> /dev/null; then
    echo -e "${RED}El Resource Group '$RESOURCE_GROUP' no existe.${NC}"
    exit 1
fi

# Mostrar recursos que serán eliminados
echo ""
echo -e "${YELLOW}Los siguientes recursos serán eliminados:${NC}"
echo ""
az resource list --resource-group "$RESOURCE_GROUP" --output table

echo ""
echo -e "${RED}¿Estás SEGURO que deseas eliminar estos recursos? Esta acción NO se puede deshacer.${NC}"
read -p "Escribe 'ELIMINAR' para confirmar: " CONFIRM

if [ "$CONFIRM" != "ELIMINAR" ]; then
    echo -e "${GREEN}Operación cancelada. No se eliminó nada.${NC}"
    exit 0
fi

echo ""
echo -e "${YELLOW}Eliminando Resource Group '$RESOURCE_GROUP'...${NC}"
echo -e "${YELLOW}Esto puede tardar varios minutos...${NC}"

az group delete \
  --name "$RESOURCE_GROUP" \
  --yes \
  --no-wait

echo ""
echo -e "${GREEN}Solicitud de eliminación enviada.${NC}"
echo ""
echo "Los recursos se están eliminando en segundo plano."
echo "Puedes verificar el estado con:"
echo ""
echo -e "${YELLOW}az group show --name $RESOURCE_GROUP${NC}"
echo ""
echo "Una vez eliminado, verás un error 'Resource group not found'."
echo ""
echo -e "${GREEN}Recuerda también:${NC}"
echo "1. Eliminar los GitHub Secrets del repositorio"
echo "2. Eliminar el workflow de GitHub Actions si lo deseas"
echo ""
