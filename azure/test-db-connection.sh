#!/bin/bash

# Script para probar la conexión a la base de datos PostgreSQL en Azure

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}=== Test de Conexión PostgreSQL ===${NC}"
echo ""

# Verificar si existe .env
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}No se encontró archivo .env${NC}"
    echo ""
    read -p "Servidor PostgreSQL (ej: miservidor.postgres.database.azure.com): " POSTGRES_SERVER
    read -p "Nombre de la base de datos: " POSTGRES_DB_NAME
    read -p "Usuario: " POSTGRES_USER
    read -sp "Contraseña: " POSTGRES_PASSWORD
    echo ""

    DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_SERVER}:5432/${POSTGRES_DB_NAME}?schema=reestructuracion&sslmode=require"
else
    echo -e "${GREEN}✓ Encontrado archivo .env${NC}"
    # Cargar DATABASE_URL desde .env
    export $(cat .env | grep DATABASE_URL | xargs)
    echo -e "${GREEN}✓ DATABASE_URL cargado desde .env${NC}"
fi

echo ""
echo -e "${YELLOW}Probando conexión a PostgreSQL...${NC}"

# Crear un script temporal de Node.js para probar la conexión
cat > /tmp/test-db-connection.js << 'EOF'
const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('ERROR: DATABASE_URL no está definido');
  process.exit(1);
}

const pool = new Pool({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

async function testConnection() {
  try {
    console.log('Intentando conectar...');
    const client = await pool.connect();
    console.log('✓ Conexión exitosa!');

    const result = await client.query('SELECT version()');
    console.log('✓ PostgreSQL Version:', result.rows[0].version);

    // Verificar que el schema existe
    const schemaResult = await client.query(
      "SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'reestructuracion'"
    );

    if (schemaResult.rows.length > 0) {
      console.log('✓ Schema "reestructuracion" encontrado');
    } else {
      console.log('⚠ Schema "reestructuracion" NO encontrado');
      console.log('  Puedes crearlo con: CREATE SCHEMA reestructuracion;');
    }

    client.release();
    await pool.end();

    console.log('\n✓ Test de conexión exitoso!');
    process.exit(0);
  } catch (err) {
    console.error('✗ Error de conexión:', err.message);
    await pool.end();
    process.exit(1);
  }
}

testConnection();
EOF

# Ejecutar el script con Node.js
if command -v node &> /dev/null; then
    if [ -f ".env" ]; then
        export $(cat .env | grep DATABASE_URL | xargs)
    fi
    export DATABASE_URL="${DATABASE_URL}"

    node /tmp/test-db-connection.js

    if [ $? -eq 0 ]; then
        echo ""
        echo -e "${GREEN}========================================${NC}"
        echo -e "${GREEN}La conexión a PostgreSQL funciona correctamente${NC}"
        echo -e "${GREEN}========================================${NC}"
    else
        echo ""
        echo -e "${RED}========================================${NC}"
        echo -e "${RED}Error al conectar a PostgreSQL${NC}"
        echo -e "${RED}========================================${NC}"
        echo ""
        echo -e "${YELLOW}Verifica:${NC}"
        echo "1. Que el servidor PostgreSQL esté ejecutándose"
        echo "2. Que el firewall permita tu IP o conexiones desde Azure"
        echo "3. Que las credenciales sean correctas"
        echo "4. Que la base de datos exista"
    fi
else
    echo -e "${RED}Node.js no está instalado${NC}"
    echo "Instala Node.js para probar la conexión"
fi

# Limpiar archivo temporal
rm -f /tmp/test-db-connection.js
