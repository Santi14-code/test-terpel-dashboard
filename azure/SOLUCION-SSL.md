# Solución para Error de Certificado SSL en Azure CLI

Si ves este error:
```
CERTIFICATE_VERIFY_FAILED: certificate verify failed: self-signed certificate in certificate chain
```

Esto ocurre en ambientes corporativos con proxies que interceptan tráfico HTTPS.

## Solución Rápida (Recomendada)

El script `provision-simple.sh` ahora detecta automáticamente este problema y te ofrece deshabilitarlo. Solo ejecuta:

```bash
./azure/provision-simple.sh
```

Cuando detecte el problema de SSL, selecciona la opción 1 para deshabilitar la verificación.

## Solución Manual

### Opción 1: Deshabilitar verificación SSL

Ejecuta esto antes de usar Azure CLI:

```bash
export AZURE_CLI_DISABLE_CONNECTION_VERIFICATION=1
```

Luego puedes usar Azure CLI normalmente:

```bash
az login
az account show
./azure/provision-simple.sh
```

### Opción 2: Configurar el certificado del proxy (Más segura)

Si tu empresa te ha proporcionado el certificado del proxy:

```bash
export REQUESTS_CA_BUNDLE=/path/to/corporate-ca-bundle.pem
```

O agrégalo permanentemente a tu `.bashrc` o `.zshrc`:

```bash
echo 'export AZURE_CLI_DISABLE_CONNECTION_VERIFICATION=1' >> ~/.zshrc
source ~/.zshrc
```

## Verificar que funciona

```bash
az login
az account show
```

Si ves tu información de cuenta, ¡está funcionando!

## Alternativa: Crear recursos desde Azure Portal

Si prefieres no usar Azure CLI, puedes crear la Static Web App desde el portal:

1. Ve a [Azure Portal](https://portal.azure.com)
2. Busca "Static Web Apps"
3. Click en "Create"
4. Selecciona:
   - Tu Resource Group existente
   - Nombre de la app
   - Region
   - SKU: Free
   - Deployment: GitHub (conecta tu repositorio)

Azure creará automáticamente el workflow de GitHub Actions.

## Después de crear la Static Web App

Solo necesitas agregar el secret `DATABASE_URL` en GitHub:

```
postgresql://[user]:[password]@[server].postgres.database.azure.com:5432/[database]?schema=reestructuracion&sslmode=require
```

El token `AZURE_STATIC_WEB_APPS_API_TOKEN` ya estará configurado automáticamente si creaste la app desde el portal con integración de GitHub.
