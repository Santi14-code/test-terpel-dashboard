# ArchiMate Diagram Generator

Genera diagramas ArchiMate automáticamente desde la base de datos PostgreSQL de Terpel.

## 📋 Requisitos Previos

1. **Base de datos PostgreSQL** conectada y funcionando
2. **Node.js 20+** instalado
3. **Archi** (herramienta de modelado ArchiMate) - Descarga: https://www.archimatetool.com/

## 🚀 Uso

### 1. Generar el archivo ArchiMate

Ejecuta el siguiente comando desde la raíz del proyecto:

```bash
npm run generate:archimate
```

Este comando:
- ✅ Extrae datos de la base de datos PostgreSQL
- ✅ Genera elementos ArchiMate:
  - **Business Capabilities** (3 niveles)
  - **Application Components** (aplicaciones)
  - **Relaciones** entre capacidades y aplicaciones
  - **Composición** jerárquica de capacidades
- ✅ Crea un archivo `.archimate` en `/output/archimate/`

### 2. Abrir en Archi

1. Abre **Archi**
2. Ve a **File > Open Model**
3. Selecciona el archivo generado:
   ```
   output/archimate/terpel-enterprise-architecture.archimate
   ```

### 3. Crear vistas

El archivo generado contiene todos los elementos y relaciones, pero necesitas crear las vistas manualmente:

#### Vista 1: Mapa de Capacidades

1. En Archi, haz clic derecho en **Views** > **New > Archimate View**
2. Nombre: "Mapa de Capacidades de Negocio"
3. Arrastra las capacidades desde el panel izquierdo al canvas
4. Organiza en jerarquía (L1 → L2 → L3)
5. Archi mostrará automáticamente las relaciones de composición

#### Vista 2: Aplicaciones por Capacidad

1. Crea una nueva vista
2. Nombre: "Aplicaciones por Capacidad"
3. Arrastra capacidades L3 y sus aplicaciones relacionadas
4. Las relaciones de realización se mostrarán automáticamente

#### Vista 3: Landscape de Aplicaciones

1. Crea una nueva vista
2. Nombre: "Application Landscape"
3. Arrastra todas las aplicaciones
4. Agrupa por criticidad usando colores:
   - Crítica: Rojo
   - Alta: Naranja
   - Media: Amarillo
   - Baja: Verde

### 4. Personalizar

- **Colores**: Haz clic derecho > Properties > Appearance
- **Iconos**: Archi incluye iconos predeterminados para cada tipo de elemento
- **Layout automático**: View > Layout > Grid Layout / Tree Layout
- **Documentación**: Agrega notas y documentación adicional en Properties

### 5. Exportar

Una vez que hayas creado y personalizado las vistas:

1. **Exportar como imagen**: File > Export > View As Image
   - Formatos: PNG, JPEG, BMP, SVG
   - Resolución configurable

2. **Exportar como PDF**: File > Export > View As PDF
   - Incluye todas las vistas seleccionadas

3. **Exportar modelo completo**: File > Export > Model To Archimate Exchange
   - Formato estándar para compartir con otras herramientas

## 📊 Elementos Generados

### Business Layer

- **Capability (Nivel 1)**: Capacidades principales del negocio
- **Capability (Nivel 2)**: Sub-capacidades
- **Capability (Nivel 3)**: Capacidades específicas

### Application Layer

- **ApplicationComponent**: Aplicaciones del portafolio
  - Propiedades:
    - `Criticidad`: Crítica, Alta, Media, Baja
  - Documentación: Descripción de la aplicación

### Relations

- **CompositionRelationship**: Jerarquía entre capacidades (L1→L2→L3)
- **RealizationRelationship**: Aplicaciones que realizan capacidades

## 🔄 Regenerar Diagramas

Si actualizas la base de datos y quieres regenerar:

```bash
npm run generate:archimate
```

El archivo se sobrescribirá. Si ya tienes vistas personalizadas en Archi:

1. **Opción A**: Guarda tu modelo actual con otro nombre
2. **Opción B**: Importa el nuevo modelo y combina elementos manualmente

## 🎨 Convenciones de Nombres

- **Capacidades L1**: `id-cap1-{id}`
- **Capacidades L2**: `id-cap2-{id}`
- **Capacidades L3**: `id-cap3-{id}`
- **Aplicaciones**: `id-app-{id}`
- **Relaciones de composición**: `rel-comp-{index}`
- **Relaciones de realización**: `rel-{index}`

## 🐛 Troubleshooting

### Error: "Cannot connect to database"

Verifica que la variable `DATABASE_URL` esté configurada en tu `.env`:

```bash
DATABASE_URL="postgresql://..."
```

### Error: "Permission denied" al crear archivo

El directorio `/output` se crea automáticamente. Si hay problemas:

```bash
mkdir -p output/archimate
```

### Archi no abre el archivo

Verifica que el archivo `.archimate` se haya generado correctamente:

```bash
ls -lh output/archimate/
```

## 📚 Recursos

- **ArchiMate Specification**: https://pubs.opengroup.org/architecture/archimate3-doc/
- **Archi User Guide**: https://www.archimatetool.com/support/
- **ArchiMate Tutorial**: https://www.archimatetool.com/tutorial/

## 🔧 Desarrollo

El script está en TypeScript y usa:
- **Prisma**: Para consultar la base de datos
- **Node.js fs**: Para escribir archivos
- **XML**: Formato estándar de ArchiMate

Para modificar el generador, edita:
```
scripts/archimate/generate-archimate.ts
```

Y luego ejecuta:
```bash
npm run generate:archimate
```
