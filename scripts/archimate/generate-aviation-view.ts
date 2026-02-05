/**
 * ArchiMate Aviation View Generator
 * Generates a focused view of capabilities and applications related to Aviation business line
 */

import 'dotenv/config'
import { prisma } from '../../src/lib/db'
import { writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'

const AVIATION_LINE_ID = 2 // ID de la línea de negocio "aviacion"

// Generate unique IDs for ArchiMate elements
function generateId(prefix: string, id: number): string {
  return `id-${prefix}-${id}`
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

// Generate ArchiMate XML header
function generateXmlHeader(): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<archimate:model xmlns:archimate="http://www.archimatetool.com/archimate"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    name="Terpel - Vista Aviación"
    id="model-aviation"
    version="5.0.0">
`
}

// Generate ArchiMate XML footer
function generateXmlFooter(): string {
  return `</archimate:model>`
}

// Get capabilities related to aviation through subprocesses
async function getAviationCapabilities() {
  console.log('🔍 Buscando capacidades relacionadas con Aviación...')

  // Get subprocesses linked to aviation business line
  const subprocesses = await prisma.cat_subproceso.findMany({
    where: {
      rel_subproceso_linea_negocio: {
        some: {
          id_linea_negocio: AVIATION_LINE_ID,
        },
      },
    },
    include: {
      rel_subproceso_capacidad_nvl_3: {
        include: {
          cat_capacidad_nivel_3: {
            include: {
              cat_capacidad_nivel_2: {
                include: {
                  cat_capacidad: true,
                },
              },
            },
          },
        },
      },
      rel_componente_log_subproceso: {
        include: {
          tbl_componente_logico: {
            include: {
              tbl_aplicacion: true,
            },
          },
        },
      },
    },
  })

  // Extract unique capabilities at all levels
  const cap1Set = new Set<number>()
  const cap2Set = new Set<number>()
  const cap3Set = new Set<number>()
  const appSet = new Set<number>()

  const cap1Map = new Map()
  const cap2Map = new Map()
  const cap3Map = new Map()
  const appMap = new Map()

  subprocesses.forEach((subprocess) => {
    subprocess.rel_subproceso_capacidad_nvl_3.forEach((rel) => {
      const cap3 = rel.cat_capacidad_nivel_3
      const cap2 = cap3.cat_capacidad_nivel_2
      const cap1 = cap2.cat_capacidad

      cap3Set.add(cap3.id_capacidad_nivel_3)
      cap2Set.add(cap2.id_capacidad_nivel_2)
      cap1Set.add(cap1.id_capacidad)

      cap3Map.set(cap3.id_capacidad_nivel_3, cap3)
      cap2Map.set(cap2.id_capacidad_nivel_2, cap2)
      cap1Map.set(cap1.id_capacidad, cap1)
    })

    subprocess.rel_componente_log_subproceso.forEach((rel) => {
      const app = rel.tbl_componente_logico.tbl_aplicacion
      appSet.add(app.id_aplicacion)
      appMap.set(app.id_aplicacion, app)
    })
  })

  console.log(`✅ Encontradas:`)
  console.log(`   - ${cap1Set.size} Capacidades L1`)
  console.log(`   - ${cap2Set.size} Capacidades L2`)
  console.log(`   - ${cap3Set.size} Capacidades L3`)
  console.log(`   - ${appSet.size} Aplicaciones`)

  return {
    cap1: Array.from(cap1Map.values()),
    cap2: Array.from(cap2Map.values()),
    cap3: Array.from(cap3Map.values()),
    apps: Array.from(appMap.values()),
  }
}

// Generate capability-application relations for aviation
async function generateAviationRelations(appIds: Set<number>, cap3Ids: Set<number>): Promise<string> {
  console.log('🔗 Generando relaciones...')

  const relations = await prisma.cat_capacidad_nivel_3.findMany({
    where: {
      id_capacidad_nivel_3: { in: Array.from(cap3Ids) },
    },
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
              rel_subproceso_linea_negocio: true,
            },
          },
        },
      },
    },
  })

  let xml = ''
  let relationCount = 0

  for (const cap3 of relations) {
    const relevantApps = new Set<number>()

    cap3.rel_subproceso_capacidad_nvl_3.forEach((rel) => {
      // Only include if subprocess is linked to aviation
      const hasAviationLink = rel.cat_subproceso.rel_subproceso_linea_negocio.some(
        (lineaRel) => lineaRel.id_linea_negocio === AVIATION_LINE_ID
      )

      if (hasAviationLink) {
        rel.cat_subproceso.rel_componente_log_subproceso.forEach((compRel) => {
          const appId = compRel.tbl_componente_logico.id_aplicacion
          if (appIds.has(appId)) {
            relevantApps.add(appId)
          }
        })
      }
    })

    for (const appId of relevantApps) {
      xml += `    <relationship xsi:type="archimate:RealizationRelationship"
        id="rel-${relationCount++}"
        source="${generateId('app', appId)}"
        target="${generateId('cap3', cap3.id_capacidad_nivel_3)}" />\n`
    }
  }

  console.log(`✅ Generadas ${relationCount} relaciones`)
  return xml
}

// Main generation function
async function generateAviationView() {
  console.log('🚀 Generando vista de Aviación...\n')

  try {
    const outputDir = join(process.cwd(), 'output', 'archimate')
    mkdirSync(outputDir, { recursive: true })

    // Get aviation-specific data
    const { cap1, cap2, cap3, apps } = await getAviationCapabilities()

    let xml = generateXmlHeader()

    // Business folder with capabilities
    xml += '  <folder name="Business" id="folder-business" type="business">\n'
    xml += '    <!-- Aviation-Related Capabilities -->\n'

    // L1 capabilities
    cap1.forEach((c) => {
      xml += `    <element xsi:type="archimate:Capability"
        id="${generateId('cap1', c.id_capacidad)}"
        name="${escapeXml(c.nombre)}" />\n`
    })

    // L2 capabilities
    cap2.forEach((c) => {
      xml += `    <element xsi:type="archimate:Capability"
        id="${generateId('cap2', c.id_capacidad_nivel_2)}"
        name="${escapeXml(c.nombre)}" />\n`
    })

    // L3 capabilities
    cap3.forEach((c) => {
      xml += `    <element xsi:type="archimate:Capability"
        id="${generateId('cap3', c.id_capacidad_nivel_3)}"
        name="${escapeXml(c.nombre)}" />\n`
    })

    xml += '  </folder>\n'

    // Application folder
    xml += '  <folder name="Application" id="folder-application" type="application">\n'
    xml += '    <!-- Aviation Applications -->\n'

    apps.forEach((app) => {
      xml += `    <element xsi:type="archimate:ApplicationComponent"
        id="${generateId('app', app.id_aplicacion)}"
        name="${escapeXml(app.nombre)}">\n`

      if (app.criticidad) {
        xml += `      <property key="Criticidad" value="${escapeXml(app.criticidad)}" />\n`
      }
      xml += `      <property key="Business Line" value="Aviación" />\n`

      if (app.descripcion) {
        xml += `      <documentation>${escapeXml(app.descripcion)}</documentation>\n`
      }

      xml += `    </element>\n`
    })

    xml += '  </folder>\n'

    // Relations folder
    xml += '  <folder name="Relations" id="folder-relations" type="relations">\n'

    // Composition relations (L1 -> L2 -> L3)
    xml += '    <!-- Capability Hierarchy -->\n'
    let compCount = 0

    const cap2ByParent = new Map<number, any[]>()
    cap2.forEach((c) => {
      if (!cap2ByParent.has(c.id_capacidad)) {
        cap2ByParent.set(c.id_capacidad, [])
      }
      cap2ByParent.get(c.id_capacidad)!.push(c)
    })

    const cap3ByParent = new Map<number, any[]>()
    cap3.forEach((c) => {
      if (!cap3ByParent.has(c.id_capacidad_nivel_2)) {
        cap3ByParent.set(c.id_capacidad_nivel_2, [])
      }
      cap3ByParent.get(c.id_capacidad_nivel_2)!.push(c)
    })

    cap1.forEach((c1) => {
      const children = cap2ByParent.get(c1.id_capacidad) || []
      children.forEach((c2) => {
        xml += `    <relationship xsi:type="archimate:CompositionRelationship"
        id="rel-comp-${compCount++}"
        source="${generateId('cap1', c1.id_capacidad)}"
        target="${generateId('cap2', c2.id_capacidad_nivel_2)}" />\n`

        const grandchildren = cap3ByParent.get(c2.id_capacidad_nivel_2) || []
        grandchildren.forEach((c3) => {
          xml += `    <relationship xsi:type="archimate:CompositionRelationship"
        id="rel-comp-${compCount++}"
        source="${generateId('cap2', c2.id_capacidad_nivel_2)}"
        target="${generateId('cap3', c3.id_capacidad_nivel_3)}" />\n`
        })
      })
    })

    // Realization relations (apps -> capabilities)
    xml += '\n    <!-- Application-Capability Relations -->\n'
    const appIds = new Set(apps.map((a) => a.id_aplicacion))
    const cap3Ids = new Set(cap3.map((c) => c.id_capacidad_nivel_3))
    const realizationRels = await generateAviationRelations(appIds, cap3Ids)
    xml += realizationRels

    xml += '  </folder>\n'

    // Empty folders
    xml += '  <folder name="Technology" id="folder-technology" type="technology"></folder>\n'
    xml += '  <folder name="Motivation" id="folder-motivation" type="motivation"></folder>\n'
    xml += '  <folder name="Implementation" id="folder-implementation" type="implementation_migration"></folder>\n'
    xml += '  <folder name="Other" id="folder-other" type="other"></folder>\n'
    xml += '  <folder name="Views" id="folder-views" type="diagrams"></folder>\n'

    xml += generateXmlFooter()

    const outputPath = join(outputDir, 'terpel-aviacion.archimate')
    writeFileSync(outputPath, xml, 'utf-8')

    console.log('\n✅ Vista de Aviación generada exitosamente!')
    console.log(`📁 Archivo: ${outputPath}`)
    console.log('\n📖 Próximos pasos:')
    console.log('1. Abre Archi')
    console.log('2. File > Open Model > Selecciona terpel-aviacion.archimate')
    console.log('3. Crea una vista arrastrando elementos al canvas')
    console.log('4. Las relaciones se mostrarán automáticamente\n')

  } catch (error) {
    console.error('❌ Error generando vista de Aviación:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run if called directly
if (require.main === module) {
  generateAviationView().catch(console.error)
}

export { generateAviationView }
