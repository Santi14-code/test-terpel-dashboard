import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { writeFileSync, mkdirSync, existsSync, unlinkSync } from 'fs'
import { join } from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

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

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const lineaPrincipalId = searchParams.get('lineaPrincipal')
    const tipoLineaId = searchParams.get('tipoLinea')
    const capacidadL1Id = searchParams.get('capacidadL1')

    console.log('🚀 Generando diagrama con filtros:', {
      lineaPrincipalId,
      tipoLineaId,
      capacidadL1Id,
    })

    // Build dynamic query filters
    const subprocessWhere: any = {}

    if (tipoLineaId) {
      subprocessWhere.rel_subproceso_linea_negocio = {
        some: {
          id_linea_negocio: parseInt(tipoLineaId),
        },
      }
    } else if (lineaPrincipalId) {
      subprocessWhere.rel_subproceso_linea_negocio = {
        some: {
          cat_linea_negocio: {
            id_linea_negocio_principal: parseInt(lineaPrincipalId),
          },
        },
      }
    }

    // Get subprocesses based on filters
    const subprocesses = await prisma.cat_subproceso.findMany({
      where: Object.keys(subprocessWhere).length > 0 ? subprocessWhere : undefined,
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

        // Filter by capacidadL1 if specified
        if (capacidadL1Id && cap1.id_capacidad !== parseInt(capacidadL1Id)) {
          return
        }

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

    if (cap1.length === 0) {
      return NextResponse.json(
        {
          error: 'No se encontraron capacidades con los filtros especificados',
          stats: { cap1: 0, cap2: 0, cap3: 0, apps: 0, relations: 0 },
        },
        { status: 404 }
      )
    }

    // Generate PlantUML diagram
    let puml = '@startuml\n'
    puml += '!theme plain\n'
    puml += 'top to bottom direction\n'
    puml += 'scale 2400 width\n'
    puml += 'title Vista Arquitectónica\\nCapacidades y Aplicaciones\n\n'
    puml += 'skinparam packageStyle rectangle\n'
    puml += 'skinparam nodesep 40\n'
    puml += 'skinparam ranksep 120\n'
    puml += 'skinparam defaultFontSize 14\n'
    puml += 'skinparam defaultFontName Arial\n'
    puml += 'skinparam component {\n'
    puml += '  BackgroundColor<<L1>> #FFE4B5\n'
    puml += '  BackgroundColor<<L2>> #FFD700\n'
    puml += '  BackgroundColor<<L3>> #FFA500\n'
    puml += '  BackgroundColor<<APP>> #87CEEB\n'
    puml += '  BorderColor Black\n'
    puml += '  ArrowColor Black\n'
    puml += '  FontSize 14\n'
    puml += '  Padding 10\n'
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

    // Generate connections L3 -> Apps
    puml += "' Connections L3 -> Applications\n"
    console.log('🔗 Generando relaciones Aplicaciones -> Capacidades...')

    const appIds = new Set(apps.map((a) => a.id_aplicacion))
    let relationCount = 0

    const cap3Ids = cap3.map((c) => c.id_capacidad_nivel_3)
    const relations = await prisma.cat_capacidad_nivel_3.findMany({
      where: {
        id_capacidad_nivel_3: { in: cap3Ids },
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
              },
            },
          },
        },
      },
    })

    for (const cap3Item of relations) {
      const relevantApps = new Set<number>()

      cap3Item.rel_subproceso_capacidad_nvl_3.forEach((rel) => {
        rel.cat_subproceso.rel_componente_log_subproceso.forEach((compRel) => {
          const appId = compRel.tbl_componente_logico.id_aplicacion
          if (appIds.has(appId)) {
            relevantApps.add(appId)
          }
        })
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

    // Generate unique filename based on timestamp
    const timestamp = Date.now()
    const outputDir = join(process.cwd(), 'output', 'plantuml', 'temp')
    mkdirSync(outputDir, { recursive: true })

    const pumlFileName = `diagram-${timestamp}.puml`
    const pngFileName = `diagram-${timestamp}.png`
    const pumlPath = join(outputDir, pumlFileName)
    const pngPath = join(outputDir, pngFileName)

    // Write PlantUML file
    writeFileSync(pumlPath, puml, 'utf-8')
    console.log(`📁 PlantUML file: ${pumlPath}`)

    // Generate PNG using PlantUML
    try {
      await execAsync(`plantuml ${pumlPath}`)
      console.log(`✅ PNG generated: ${pngPath}`)

      // Clean up old temporary files (older than 1 hour)
      const tempFiles = await import('fs').then((fs) => fs.promises.readdir(outputDir))
      const oneHourAgo = Date.now() - 3600000
      for (const file of tempFiles) {
        const match = file.match(/diagram-(\d+)\.(puml|png)/)
        if (match && parseInt(match[1]) < oneHourAgo) {
          const oldFilePath = join(outputDir, file)
          unlinkSync(oldFilePath)
          console.log(`🗑️  Deleted old file: ${file}`)
        }
      }
    } catch (error) {
      console.error('❌ Error executing PlantUML:', error)
      return NextResponse.json(
        { error: 'Error generando imagen PNG. Verifica que PlantUML esté instalado.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      imageUrl: `/api/diagrams/temp/${pngFileName}`,
      pumlUrl: `/api/diagrams/temp/${pumlFileName}`,
      stats: {
        cap1: cap1.length,
        cap2: cap2.length,
        cap3: cap3.length,
        apps: apps.length,
        relations: relationCount,
      },
    })
  } catch (error) {
    console.error('❌ Error generando diagrama:', error)
    return NextResponse.json(
      { error: 'Error generando diagrama', details: String(error) },
      { status: 500 }
    )
  }
}
