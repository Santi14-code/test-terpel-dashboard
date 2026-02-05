/**
 * ArchiMate Diagram Generator
 * Generates ArchiMate XML files from PostgreSQL database
 */

import 'dotenv/config'
import { prisma } from '../../src/lib/db'
import { writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'

// Generate unique IDs for ArchiMate elements
function generateId(prefix: string, id: number): string {
  return `id-${prefix}-${id}`
}

// Generate ArchiMate XML header
function generateXmlHeader(): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<archimate:model xmlns:archimate="http://www.archimatetool.com/archimate"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    name="Terpel Enterprise Architecture"
    id="model-root"
    version="5.0.0">
  <folder name="Business" id="folder-business" type="business">
`
}

// Generate ArchiMate XML footer
function generateXmlFooter(): string {
  return `  </folder>
  <folder name="Application" id="folder-application" type="application">
  </folder>
  <folder name="Technology" id="folder-technology" type="technology">
  </folder>
  <folder name="Motivation" id="folder-motivation" type="motivation">
  </folder>
  <folder name="Implementation" id="folder-implementation" type="implementation_migration">
  </folder>
  <folder name="Other" id="folder-other" type="other">
  </folder>
  <folder name="Relations" id="folder-relations" type="relations">
  </folder>
  <folder name="Views" id="folder-views" type="diagrams">
  </folder>
</archimate:model>`
}

// Generate Capability elements (ArchiMate Business Capability)
async function generateCapabilities(): Promise<string> {
  console.log('📊 Extracting capabilities...')

  const capabilities = await prisma.cat_capacidad.findMany({
    include: {
      cat_capacidad_nivel_2: {
        include: {
          cat_capacidad_nivel_3: true,
        },
      },
    },
    orderBy: { nombre: 'asc' },
  })

  let xml = '    <!-- Business Capabilities Level 1 -->\n'

  for (const cap1 of capabilities) {
    xml += `    <element xsi:type="archimate:Capability"
        id="${generateId('cap1', cap1.id_capacidad)}"
        name="${escapeXml(cap1.nombre)}" />\n`

    // Level 2
    for (const cap2 of cap1.cat_capacidad_nivel_2) {
      xml += `    <element xsi:type="archimate:Capability"
        id="${generateId('cap2', cap2.id_capacidad_nivel_2)}"
        name="${escapeXml(cap2.nombre)}" />\n`

      // Level 3
      for (const cap3 of cap2.cat_capacidad_nivel_3) {
        xml += `    <element xsi:type="archimate:Capability"
        id="${generateId('cap3', cap3.id_capacidad_nivel_3)}"
        name="${escapeXml(cap3.nombre)}" />\n`
      }
    }
  }

  console.log(`✅ Generated ${capabilities.length} L1 capabilities`)
  return xml
}

// Generate Application elements
async function generateApplications(): Promise<string> {
  console.log('📱 Extracting applications...')

  const applications = await prisma.tbl_aplicacion.findMany({
    orderBy: { nombre: 'asc' },
  })

  let xml = '\n    <!-- Application Components -->\n'

  for (const app of applications) {
    xml += `    <element xsi:type="archimate:ApplicationComponent"
        id="${generateId('app', app.id_aplicacion)}"
        name="${escapeXml(app.nombre)}">\n`

    if (app.criticidad) {
      xml += `      <property key="Criticidad" value="${escapeXml(app.criticidad)}" />\n`
    }
    if (app.descripcion) {
      xml += `      <documentation>${escapeXml(app.descripcion)}</documentation>\n`
    }

    xml += `    </element>\n`
  }

  console.log(`✅ Generated ${applications.length} applications`)
  return xml
}

// Generate relations between capabilities and applications
async function generateCapabilityAppRelations(): Promise<string> {
  console.log('🔗 Extracting capability-application relations...')

  const relations = await prisma.cat_capacidad_nivel_3.findMany({
    include: {
      rel_subproceso_capacidad_nvl_3: {
        include: {
          cat_subproceso: {
            include: {
              rel_componente_log_subproceso: {
                include: {
                  tbl_componente_logico: {
                    select: {
                      id_aplicacion: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  })

  let xml = '\n    <!-- Capability-Application Relations -->\n'
  let relationCount = 0

  for (const cap3 of relations) {
    const appIds = new Set<number>()

    cap3.rel_subproceso_capacidad_nvl_3.forEach((rel) => {
      rel.cat_subproceso.rel_componente_log_subproceso.forEach((compRel) => {
        appIds.add(compRel.tbl_componente_logico.id_aplicacion)
      })
    })

    for (const appId of appIds) {
      xml += `    <relationship xsi:type="archimate:RealizationRelationship"
        id="rel-${relationCount++}"
        source="${generateId('app', appId)}"
        target="${generateId('cap3', cap3.id_capacidad_nivel_3)}" />\n`
    }
  }

  console.log(`✅ Generated ${relationCount} relations`)
  return xml
}

// Generate capability composition relations (L1 -> L2 -> L3)
async function generateCapabilityCompositionRelations(): Promise<string> {
  console.log('🔗 Extracting capability composition relations...')

  const capabilities = await prisma.cat_capacidad.findMany({
    include: {
      cat_capacidad_nivel_2: {
        include: {
          cat_capacidad_nivel_3: true,
        },
      },
    },
  })

  let xml = '\n    <!-- Capability Composition Relations -->\n'
  let relationCount = 0

  for (const cap1 of capabilities) {
    for (const cap2 of cap1.cat_capacidad_nivel_2) {
      // L1 -> L2
      xml += `    <relationship xsi:type="archimate:CompositionRelationship"
        id="rel-comp-${relationCount++}"
        source="${generateId('cap1', cap1.id_capacidad)}"
        target="${generateId('cap2', cap2.id_capacidad_nivel_2)}" />\n`

      // L2 -> L3
      for (const cap3 of cap2.cat_capacidad_nivel_3) {
        xml += `    <relationship xsi:type="archimate:CompositionRelationship"
        id="rel-comp-${relationCount++}"
        source="${generateId('cap2', cap2.id_capacidad_nivel_2)}"
        target="${generateId('cap3', cap3.id_capacidad_nivel_3)}" />\n`
      }
    }
  }

  console.log(`✅ Generated ${relationCount} composition relations`)
  return xml
}

// Escape XML special characters
function escapeXml(unsafe: string | null): string {
  if (!unsafe) return ''
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

// Main generation function
async function generateArchiMateXml() {
  console.log('🚀 Starting ArchiMate diagram generation...\n')

  try {
    const outputDir = join(process.cwd(), 'output', 'archimate')
    mkdirSync(outputDir, { recursive: true })

    const xmlHeader = generateXmlHeader()
    const capabilities = await generateCapabilities()
    const applications = await generateApplications()

    // Close business folder and open relations folder
    let xml = xmlHeader + capabilities
    xml += '  </folder>\n'
    xml += '  <folder name="Application" id="folder-application" type="application">\n'
    xml += applications
    xml += '  </folder>\n'
    xml += '  <folder name="Relations" id="folder-relations" type="relations">\n'

    const capCompositionRels = await generateCapabilityCompositionRelations()
    const capAppRels = await generateCapabilityAppRelations()

    xml += capCompositionRels
    xml += capAppRels
    xml += '  </folder>\n'

    // Add empty folders
    xml += '  <folder name="Technology" id="folder-technology" type="technology"></folder>\n'
    xml += '  <folder name="Motivation" id="folder-motivation" type="motivation"></folder>\n'
    xml += '  <folder name="Implementation" id="folder-implementation" type="implementation_migration"></folder>\n'
    xml += '  <folder name="Other" id="folder-other" type="other"></folder>\n'
    xml += '  <folder name="Views" id="folder-views" type="diagrams"></folder>\n'
    xml += '</archimate:model>'

    const outputPath = join(outputDir, 'terpel-enterprise-architecture.archimate')
    writeFileSync(outputPath, xml, 'utf-8')

    console.log('\n✅ ArchiMate diagram generated successfully!')
    console.log(`📁 Output: ${outputPath}`)
    console.log('\n📖 Next steps:')
    console.log('1. Download Archi from https://www.archimatetool.com/')
    console.log('2. Open Archi')
    console.log('3. File > Open Model > Select the generated .archimate file')
    console.log('4. Create views and arrange elements as needed')
    console.log('5. Export to PNG/SVG/PDF\n')

  } catch (error) {
    console.error('❌ Error generating ArchiMate diagram:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run if called directly
if (require.main === module) {
  generateArchiMateXml().catch(console.error)
}

export { generateArchiMateXml }
