import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { writeFileSync, mkdirSync, unlinkSync } from 'fs'
import { join } from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

function cleanId(text: string): string {
  return text
    .replace(/[^\w]/g, '_')
    .replace(/_+/g, '_')
    .substring(0, 60)
}

function wrapText(text: string, maxLength: number = 25): string {
  if (text.length <= maxLength) return text
  const words = text.split(' ')
  const lines: string[] = []
  let currentLine = ''
  for (const word of words) {
    if ((currentLine + ' ' + word).trim().length > maxLength) {
      if (currentLine) lines.push(currentLine.trim())
      currentLine = word
    } else {
      currentLine = currentLine ? currentLine + ' ' + word : word
    }
  }
  if (currentLine) lines.push(currentLine.trim())
  return lines.join('\\n')
}

function generateTrivadisBlueprint(integrations: any[]): string {
  // Collect unique providers, consumers, and interface types
  const providers = new Map<string, Set<string>>() // app -> set of interface names
  const consumers = new Map<string, Set<string>>() // app -> set of interface names consumed
  const interfacesByType = new Map<string, any[]>() // type -> integrations

  for (const row of integrations) {
    // Provider - always include
    if (!providers.has(row.providerApp)) providers.set(row.providerApp, new Set())
    providers.get(row.providerApp)!.add(row.interfaceName)

    // Consumer - only if exists
    if (row.consumerApp !== '—') {
      if (!consumers.has(row.consumerApp)) consumers.set(row.consumerApp, new Set())
      consumers.get(row.consumerApp)!.add(row.interfaceName)
    }

    // By type - always include
    if (!interfacesByType.has(row.interfaceType)) interfacesByType.set(row.interfaceType, [])
    interfacesByType.get(row.interfaceType)!.push(row)
  }

  // Sort by number of interfaces (most connected first)
  const sortedProviders = Array.from(providers.entries()).sort((a, b) => b[1].size - a[1].size)
  const sortedConsumers = Array.from(consumers.entries()).sort((a, b) => b[1].size - a[1].size)

  let puml = '@startuml\n'
  puml += '!theme plain\n'
  puml += 'left to right direction\n'
  puml += 'scale 2400 height\n'
  puml += 'title Blueprint de Integración Trivadis\n\n'

  puml += 'skinparam packageStyle rectangle\n'
  puml += 'skinparam nodesep 30\n'
  puml += 'skinparam ranksep 150\n'
  puml += 'skinparam defaultFontSize 11\n'
  puml += 'skinparam defaultFontName Arial\n'
  puml += 'skinparam componentStyle rectangle\n'

  puml += 'skinparam rectangle {\n'
  puml += '  BorderColor #333333\n'
  puml += '  FontSize 12\n'
  puml += '  FontStyle bold\n'
  puml += '}\n\n'

  puml += 'skinparam component {\n'
  puml += '  BackgroundColor<<provider>> #4A90D9\n'
  puml += '  FontColor<<provider>> #FFFFFF\n'
  puml += '  BackgroundColor<<consumer>> #7B68EE\n'
  puml += '  FontColor<<consumer>> #FFFFFF\n'
  puml += '  BackgroundColor<<both>> #2E8B57\n'
  puml += '  FontColor<<both>> #FFFFFF\n'
  puml += '  BorderColor #333333\n'
  puml += '  FontSize 10\n'
  puml += '  Padding 10\n'
  puml += '}\n\n'

  puml += 'skinparam interface {\n'
  puml += '  BackgroundColor #FFD700\n'
  puml += '  BorderColor #333333\n'
  puml += '  FontSize 9\n'
  puml += '}\n\n'

  // --- Left column: Source Systems (Providers) ---
  puml += 'rectangle "Sistemas Fuente" as sources #E8F4FD {\n'
  for (const [appName] of sortedProviders) {
    const id = 'src_' + cleanId(appName)
    const isAlsoConsumer = consumers.has(appName)
    const stereotype = isAlsoConsumer ? '<<both>>' : '<<provider>>'
    puml += `  [${wrapText(appName)}] ${stereotype} as ${id}\n`
  }
  puml += '}\n\n'

  // --- Center: Integration Layer (grouped by interface type) ---
  puml += 'rectangle "Capa de Integración" as integration_layer #FFF8DC {\n'

  for (const [typeName, rows] of interfacesByType) {
    const typeId = 'type_' + cleanId(typeName)
    puml += `  rectangle "${typeName}" as ${typeId} #FFEEBA {\n`

    // Deduplicate interfaces within this type
    const uniqueInterfaces = new Map<string, any>()
    for (const row of rows) {
      if (!uniqueInterfaces.has(row.interfaceName)) {
        uniqueInterfaces.set(row.interfaceName, row)
      }
    }

    for (const [ifaceName] of uniqueInterfaces) {
      const ifaceId = 'iface_' + cleanId(typeName) + '_' + cleanId(ifaceName)
      puml += `    () "${wrapText(ifaceName, 20)}" as ${ifaceId}\n`
    }
    puml += '  }\n'
  }
  puml += '}\n\n'

  // --- Right column: Target Systems (Consumers) - only if there are consumers ---
  if (sortedConsumers.length > 0) {
    puml += 'rectangle "Sistemas Destino" as targets #F0E6FF {\n'
    for (const [appName] of sortedConsumers) {
      const id = 'tgt_' + cleanId(appName)
      const isAlsoProvider = providers.has(appName)
      const stereotype = isAlsoProvider ? '<<both>>' : '<<consumer>>'
      puml += `  [${wrapText(appName)}] ${stereotype} as ${id}\n`
    }
    puml += '}\n\n'
  }

  // --- Connections: Provider -> Interface ---
  puml += "' Provider -> Interface connections\n"
  const drawnProviderLinks = new Set<string>()
  for (const row of integrations) {
    const srcId = 'src_' + cleanId(row.providerApp)
    const ifaceId = 'iface_' + cleanId(row.interfaceType) + '_' + cleanId(row.interfaceName)
    const linkKey = `${srcId}-${ifaceId}`
    if (!drawnProviderLinks.has(linkKey)) {
      puml += `${srcId} --> ${ifaceId}\n`
      drawnProviderLinks.add(linkKey)
    }
  }
  puml += '\n'

  // --- Connections: Interface -> Consumer ---
  puml += "' Interface -> Consumer connections\n"
  const drawnConsumerLinks = new Set<string>()
  for (const row of integrations) {
    if (row.consumerApp === '—') continue
    const ifaceId = 'iface_' + cleanId(row.interfaceType) + '_' + cleanId(row.interfaceName)
    const tgtId = 'tgt_' + cleanId(row.consumerApp)
    const linkKey = `${ifaceId}-${tgtId}`
    if (!drawnConsumerLinks.has(linkKey)) {
      puml += `${ifaceId} --> ${tgtId}\n`
      drawnConsumerLinks.add(linkKey)
    }
  }

  // Legend
  puml += '\n'
  puml += 'legend right\n'
  puml += '  |= Color |= Rol |\n'
  puml += '  | <back:#4A90D9><color:#FFFFFF> Azul </color></back> | Solo Proveedor |\n'
  puml += '  | <back:#7B68EE><color:#FFFFFF> Púrpura </color></back> | Solo Consumidor |\n'
  puml += '  | <back:#2E8B57><color:#FFFFFF> Verde </color></back> | Proveedor y Consumidor |\n'
  puml += '  | <back:#FFD700> Dorado </back> | Interfaz |\n'
  puml += 'endlegend\n'

  puml += '\n@enduml\n'
  return puml
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const lineaPrincipalId = searchParams.get('lineaPrincipal')
    const tipoLineaId = searchParams.get('tipoLinea')

    // Build subprocess filter by business line
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

    // Get subprocesses with their components
    const subprocesses = await prisma.cat_subproceso.findMany({
      where: Object.keys(subprocessWhere).length > 0 ? subprocessWhere : undefined,
      include: {
        rel_componente_log_subproceso: {
          include: {
            tbl_componente_logico: {
              select: {
                id_componente_logico: true,
                nombre: true,
                id_aplicacion: true,
                tbl_aplicacion: {
                  select: {
                    id_aplicacion: true,
                    nombre: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    // Collect unique component IDs from filtered subprocesses
    const componentIds = new Set<number>()
    subprocesses.forEach((sp) => {
      sp.rel_componente_log_subproceso.forEach((rel) => {
        componentIds.add(rel.tbl_componente_logico.id_componente_logico)
      })
    })

    if (componentIds.size === 0) {
      return NextResponse.json({
        integrations: [],
        stats: { totalIntegrations: 0, uniqueProviders: 0, uniqueConsumers: 0, interfaceTypes: 0 },
      })
    }

    // Get interfaces exposed by these components, along with their consumers
    const interfaces = await prisma.tbl_interfaz.findMany({
      where: {
        id_componente_logico: { in: Array.from(componentIds) },
      },
      include: {
        cat_tipo_interfaz: {
          select: { nombre_tipo: true },
        },
        tbl_componente_logico: {
          select: {
            nombre: true,
            tbl_aplicacion: {
              select: { nombre: true },
            },
          },
        },
        rel_com_interfaz_consumo: {
          include: {
            tbl_componente_logico: {
              select: {
                nombre: true,
                tbl_aplicacion: {
                  select: { nombre: true },
                },
              },
            },
          },
        },
      },
    })

    // Build flat integration list
    const integrations: any[] = []
    const providerApps = new Set<string>()
    const consumerApps = new Set<string>()
    const interfaceTypeSet = new Set<string>()

    for (const iface of interfaces) {
      const providerAppName = iface.tbl_componente_logico?.tbl_aplicacion?.nombre || 'Sin aplicación'
      const providerComponentName = iface.tbl_componente_logico?.nombre || 'Sin componente'
      const interfaceType = iface.cat_tipo_interfaz?.nombre_tipo || 'Sin tipo'

      providerApps.add(providerAppName)
      interfaceTypeSet.add(interfaceType)

      if (iface.rel_com_interfaz_consumo.length === 0) {
        integrations.push({
          providerApp: providerAppName,
          providerComponent: providerComponentName,
          interfaceName: iface.nombre_interfaz,
          interfaceType,
          interfaceStatus: iface.estado || 'Sin estado',
          consumerApp: '—',
          consumerComponent: '—',
        })
      } else {
        for (const consumption of iface.rel_com_interfaz_consumo) {
          const consumerAppName = consumption.tbl_componente_logico?.tbl_aplicacion?.nombre || 'Sin aplicación'
          const consumerComponentName = consumption.tbl_componente_logico?.nombre || 'Sin componente'
          consumerApps.add(consumerAppName)

          integrations.push({
            providerApp: providerAppName,
            providerComponent: providerComponentName,
            interfaceName: iface.nombre_interfaz,
            interfaceType,
            interfaceStatus: iface.estado || 'Sin estado',
            consumerApp: consumerAppName,
            consumerComponent: consumerComponentName,
          })
        }
      }
    }

    // Sort by provider app, then interface name
    integrations.sort((a, b) =>
      a.providerApp.localeCompare(b.providerApp) || a.interfaceName.localeCompare(b.interfaceName)
    )

    // Generate Trivadis Integration Blueprint diagram
    let imageUrl = null
    let pumlUrl = null

    if (integrations.length > 0) {
      const puml = generateTrivadisBlueprint(integrations)
      const timestamp = Date.now()
      const outputDir = join(process.cwd(), 'output', 'plantuml', 'temp')
      mkdirSync(outputDir, { recursive: true })

      const pumlFileName = `integration-${timestamp}.puml`
      const pngFileName = `integration-${timestamp}.png`
      const pumlPath = join(outputDir, pumlFileName)
      const pngPath = join(outputDir, pngFileName)

      writeFileSync(pumlPath, puml, 'utf-8')

      try {
        await execAsync(`plantuml -DPLANTUML_LIMIT_SIZE=16384 ${pumlPath}`)

        // Clean up old temp files (older than 1 hour)
        const tempFiles = await import('fs').then((fs) => fs.promises.readdir(outputDir))
        const oneHourAgo = Date.now() - 3600000
        for (const file of tempFiles) {
          const match = file.match(/(?:diagram|integration)-(\d+)\.(puml|png)/)
          if (match && parseInt(match[1]) < oneHourAgo) {
            unlinkSync(join(outputDir, file))
          }
        }

        imageUrl = `/api/diagrams/temp/${pngFileName}`
        pumlUrl = `/api/diagrams/temp/${pumlFileName}`
      } catch (err) {
        console.error('Error generating Trivadis blueprint PNG:', err)
      }
    }

    return NextResponse.json({
      integrations,
      imageUrl,
      pumlUrl,
      stats: {
        totalIntegrations: integrations.length,
        uniqueProviders: providerApps.size,
        uniqueConsumers: consumerApps.size,
        interfaceTypes: interfaceTypeSet.size,
      },
    })
  } catch (error) {
    console.error('Error fetching integrations:', error)
    return NextResponse.json(
      { error: 'Error consultando integraciones', details: String(error) },
      { status: 500 }
    )
  }
}
