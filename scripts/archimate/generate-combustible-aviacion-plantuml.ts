/**
 * PlantUML Combustible-Aviación Diagram Generator
 * Generates a PlantUML diagram with visual connections for:
 * - Línea Principal: Combustible (ID: 1)
 * - Tipo Línea: Aviación (ID: 2)
 */

import 'dotenv/config'
import { prisma } from '../../src/lib/db'
import { writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'

const COMBUSTIBLE_PRINCIPAL_ID = 1 // Línea principal "combustible"
const AVIACION_LINE_ID = 2 // Tipo línea "aviacion"

// Clean string for PlantUML (remove special characters, keep spaces and alphanumeric)
function cleanForPlantUML(text: string | null): string {
  if (!text) return 'Sin_Nombre'
  return text
    .replace(/[^\wáéíóúñÁÉÍÓÚÑ\s]/g, '') // Remove special chars, keep accented letters
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .substring(0, 100) // Limit length
}

// Generate PlantUML ID from text
function generatePlantUMLId(prefix: string, id: number, name: string): string {
  const cleanName = cleanForPlantUML(name)
  return `${prefix}_${id}_${cleanName}`
}

// Get capabilities related to Combustible-Aviación through subprocesses
async function getCombustibleAviacionCapabilities() {
  console.log('🔍 Buscando capacidades relacionadas con Combustible-Aviación...')

  // Get subprocesses linked to aviacion business line
  const subprocesses = await prisma.cat_subproceso.findMany({
    where: {
      rel_subproceso_linea_negocio: {
        some: {
          id_linea_negocio: AVIACION_LINE_ID,
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
  const cap1Map = new Map()
  const cap2Map = new Map()
  const cap3Map = new Map()
  const appMap = new Map()

  subprocesses.forEach((subprocess) => {
    subprocess.rel_subproceso_capacidad_nvl_3.forEach((rel) => {
      const cap3 = rel.cat_capacidad_nivel_3
      const cap2 = cap3.cat_capacidad_nivel_2
      const cap1 = cap2.cat_capacidad

      cap3Map.set(cap3.id_capacidad_nivel_3, cap3)
      cap2Map.set(cap2.id_capacidad_nivel_2, cap2)
      cap1Map.set(cap1.id_capacidad, cap1)
    })

    subprocess.rel_componente_log_subproceso.forEach((rel) => {
      const app = rel.tbl_componente_logico.tbl_aplicacion
      appMap.set(app.id_aplicacion, app)
    })
  })

  const cap1 = Array.from(cap1Map.values())
  const cap2 = Array.from(cap2Map.values())
  const cap3 = Array.from(cap3Map.values())
  const apps = Array.from(appMap.values())

  console.log(`✅ Encontradas:`)
  console.log(`   - ${cap1.length} Capacidades L1`)
  console.log(`   - ${cap2.length} Capacidades L2`)
  console.log(`   - ${cap3.length} Capacidades L3`)
  console.log(`   - ${apps.length} Aplicaciones`)

  return { cap1, cap2, cap3, apps }
}

// Generate PlantUML diagram
async function generatePlantUMLDiagram() {
  console.log('🚀 Generando diagrama PlantUML de Combustible-Aviación...\n')

  try {
    const outputDir = join(process.cwd(), 'output', 'plantuml')
    mkdirSync(outputDir, { recursive: true })

    // Get combustible-aviacion specific data
    const { cap1, cap2, cap3, apps } = await getCombustibleAviacionCapabilities()

    let puml = '@startuml\n'
    puml += '!theme plain\n'
    puml += 'top to bottom direction\n'
    puml += 'scale max 800 width\n'
    puml += 'title Vista Combustible-Aviación\\nCapacidades y Aplicaciones\n\n'
    puml += 'skinparam packageStyle rectangle\n'
    puml += 'skinparam nodesep 20\n'
    puml += 'skinparam ranksep 80\n'
    puml += 'skinparam component {\n'
    puml += '  BackgroundColor<<L1>> #FFE4B5\n'
    puml += '  BackgroundColor<<L2>> #FFD700\n'
    puml += '  BackgroundColor<<L3>> #FFA500\n'
    puml += '  BackgroundColor<<APP>> #87CEEB\n'
    puml += '  BorderColor Black\n'
    puml += '  ArrowColor Black\n'
    puml += '}\n\n'

    // Build hierarchy maps
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

    // Generate L1 Capabilities
    puml += "' Capacidades Nivel 1\n"
    cap1.forEach((c) => {
      const id = generatePlantUMLId('L1', c.id_capacidad, c.nombre)
      puml += `[${c.nombre}] <<L1>> as ${id}\n`
    })
    puml += '\n'

    // Generate L2 Capabilities
    puml += "' Capacidades Nivel 2\n"
    cap2.forEach((c) => {
      const id = generatePlantUMLId('L2', c.id_capacidad_nivel_2, c.nombre)
      puml += `[${c.nombre}] <<L2>> as ${id}\n`
    })
    puml += '\n'

    // Generate L3 Capabilities
    puml += "' Capacidades Nivel 3\n"
    cap3.forEach((c) => {
      const id = generatePlantUMLId('L3', c.id_capacidad_nivel_3, c.nombre)
      puml += `[${c.nombre}] <<L3>> as ${id}\n`
    })
    puml += '\n'

    // Generate Applications
    puml += "' Aplicaciones\n"
    apps.forEach((app) => {
      const id = generatePlantUMLId('APP', app.id_aplicacion, app.nombre)
      const criticidad = app.criticidad ? ` (${app.criticidad})` : ''
      puml += `[${app.nombre}${criticidad}] <<APP>> as ${id}\n`
    })
    puml += '\n'

    // Generate connections L1 -> L2
    puml += "' Connections L1 -> L2\n"
    cap1.forEach((c1) => {
      const id1 = generatePlantUMLId('L1', c1.id_capacidad, c1.nombre)
      const children = cap2ByParent.get(c1.id_capacidad) || []
      children.forEach((c2) => {
        const id2 = generatePlantUMLId('L2', c2.id_capacidad_nivel_2, c2.nombre)
        puml += `${id1} --> ${id2}\n`
      })
    })
    puml += '\n'

    // Generate connections L2 -> L3
    puml += "' Connections L2 -> L3\n"
    cap2.forEach((c2) => {
      const id2 = generatePlantUMLId('L2', c2.id_capacidad_nivel_2, c2.nombre)
      const children = cap3ByParent.get(c2.id_capacidad_nivel_2) || []
      children.forEach((c3) => {
        const id3 = generatePlantUMLId('L3', c3.id_capacidad_nivel_3, c3.nombre)
        puml += `${id2} --> ${id3}\n`
      })
    })
    puml += '\n'

    // Generate connections L3 -> Apps (from database relationships)
    puml += "' Connections L3 -> Applications\n"
    console.log('🔗 Generando relaciones Aplicaciones -> Capacidades...')

    const relations = await prisma.cat_capacidad_nivel_3.findMany({
      where: {
        id_capacidad_nivel_3: { in: cap3.map((c) => c.id_capacidad_nivel_3) },
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

    const appIds = new Set(apps.map((a) => a.id_aplicacion))
    let relationCount = 0

    for (const cap3Item of relations) {
      const relevantApps = new Set<number>()

      cap3Item.rel_subproceso_capacidad_nvl_3.forEach((rel) => {
        const hasAviacionLink = rel.cat_subproceso.rel_subproceso_linea_negocio.some(
          (lineaRel) => lineaRel.id_linea_negocio === AVIACION_LINE_ID
        )

        if (hasAviacionLink) {
          rel.cat_subproceso.rel_componente_log_subproceso.forEach((compRel) => {
            const appId = compRel.tbl_componente_logico.id_aplicacion
            if (appIds.has(appId)) {
              relevantApps.add(appId)
            }
          })
        }
      })

      for (const appId of relevantApps) {
        const app = apps.find((a) => a.id_aplicacion === appId)
        if (app) {
          const appIdStr = generatePlantUMLId('APP', app.id_aplicacion, app.nombre)
          const cap3IdStr = generatePlantUMLId('L3', cap3Item.id_capacidad_nivel_3, cap3Item.nombre)
          puml += `${appIdStr} ..> ${cap3IdStr}\n`
          relationCount++
        }
      }
    }

    console.log(`✅ Generadas ${relationCount} relaciones App->Capacidad`)

    puml += '\n@enduml\n'

    const outputPath = join(outputDir, 'terpel-combustible-aviacion.puml')
    writeFileSync(outputPath, puml, 'utf-8')

    console.log('\n✅ Diagrama PlantUML generado exitosamente!')
    console.log(`📁 Archivo: ${outputPath}`)
    console.log('\n📖 Próximos pasos:')
    console.log('1. Instala PlantUML: brew install plantuml (Mac) o descarga de https://plantuml.com/')
    console.log('2. Genera la imagen: plantuml output/plantuml/terpel-combustible-aviacion.puml')
    console.log('3. O usa un editor online: http://www.plantuml.com/plantuml/uml/')
    console.log('4. El diagrama incluirá TODAS las conexiones jerárquicas automáticamente\n')
  } catch (error) {
    console.error('❌ Error generando diagrama PlantUML:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run if called directly
if (require.main === module) {
  generatePlantUMLDiagram().catch(console.error)
}

export { generatePlantUMLDiagram }
