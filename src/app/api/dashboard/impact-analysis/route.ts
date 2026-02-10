import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { parseFilters, buildAppWhere } from '@/lib/filters'

/* eslint-disable @typescript-eslint/no-explicit-any */

function calculateImpactScore(
  componentCount: number,
  interfaceCount: number,
  processCount: number,
  criticality: string | null,
  personalDataCount: number
) {
  const components =
    componentCount >= 41 ? 25 :
    componentCount >= 21 ? 20 :
    componentCount >= 11 ? 15 :
    componentCount >= 6 ? 10 :
    componentCount >= 1 ? 5 : 0

  const interfaces =
    interfaceCount >= 31 ? 25 :
    interfaceCount >= 21 ? 20 :
    interfaceCount >= 11 ? 15 :
    interfaceCount >= 6 ? 10 :
    interfaceCount >= 1 ? 5 : 0

  const processes =
    processCount >= 11 ? 20 :
    processCount >= 7 ? 15 :
    processCount >= 4 ? 10 :
    processCount >= 1 ? 5 : 0

  const criticalityScore =
    criticality === 'Crítica' ? 15 :
    criticality === 'Alta' ? 10 :
    criticality === 'Media' ? 5 :
    criticality === 'Baja' ? 2 : 0

  const personalData =
    personalDataCount >= 6 ? 15 :
    personalDataCount >= 3 ? 10 :
    personalDataCount >= 1 ? 5 : 0

  const total = components + interfaces + processes + criticalityScore + personalData

  const level =
    total >= 75 ? 'MUY ALTO' :
    total >= 50 ? 'ALTO' :
    total >= 25 ? 'MEDIO' : 'BAJO'

  return {
    total,
    breakdown: { components, interfaces, processes, criticality: criticalityScore, personalData },
    level,
  }
}

function calculateEffortEstimation(
  impactLevel: string,
  interfaceCount: number,
  componentCount: number
) {
  const configs: Record<string, { baseMonths: number; contingencyMultiplier: number; teamSize: number }> = {
    'MUY ALTO': { baseMonths: 30, contingencyMultiplier: 1.5, teamSize: 10 },
    'ALTO': { baseMonths: 18, contingencyMultiplier: 1.4, teamSize: 7 },
    'MEDIO': { baseMonths: 9, contingencyMultiplier: 1.3, teamSize: 5 },
    'BAJO': { baseMonths: 4, contingencyMultiplier: 1.25, teamSize: 3 },
  }
  const config = configs[impactLevel] || configs['MEDIO']

  const phases = [
    { name: 'Discovery y Arquitectura', durationWeeks: '4-6', risk: 'Diseno inadecuado, omision de requisitos' },
    {
      name: 'Migracion de Datos',
      durationWeeks: `${Math.max(4, Math.ceil(componentCount / 3))}-${Math.max(8, Math.ceil(componentCount / 2))}`,
      risk: 'Perdida de datos, corrupcion, inconsistencias',
    },
    {
      name: 'Re-implementacion de APIs',
      durationWeeks: `${Math.max(4, interfaceCount)}-${Math.max(8, Math.ceil(interfaceCount * 1.5))}`,
      risk: 'Downtime de integraciones, bugs en produccion',
    },
    { name: 'Validacion con Negocio', durationWeeks: '6-8', risk: 'Rechazo de usuarios, funcionalidades faltantes' },
    { name: 'Capacitacion', durationWeeks: '4-6', risk: 'Resistencia al cambio, curva de aprendizaje' },
    { name: 'Hypercare Post Go-Live', durationWeeks: '4-8', risk: 'Incidentes criticos, rollback necesario' },
  ]

  return {
    durationMonths: {
      base: config.baseMonths,
      withContingency: Math.round(config.baseMonths * config.contingencyMultiplier),
    },
    teamSize: config.teamSize,
    complexity: impactLevel,
    phases,
  }
}

function generateRiskAssessment(
  criticality: string | null,
  interfaceCount: number,
  componentCount: number,
  personalDataCount: number,
  processCount: number
) {
  const risks: Array<{
    id: number
    title: string
    probability: string
    impact: string
    severity: string
    mitigation: string
  }> = []
  let id = 1

  if (componentCount > 0) {
    risks.push({
      id: id++,
      title: 'Perdida o Corrupcion de Datos Historicos',
      probability: componentCount > 10 ? 'Alta' : 'Media',
      impact: 'Catastrofico',
      severity: 'Critico',
      mitigation: 'Backup completo, dry-runs multiples, validacion exhaustiva post-migracion',
    })
  }

  if (interfaceCount >= 10) {
    risks.push({
      id: id++,
      title: 'Downtime de Integraciones Criticas',
      probability: 'Alta',
      impact: 'Muy Alto',
      severity: 'Critico',
      mitigation: 'Stub services, feature flags, rollback automatico, testing en produccion',
    })
  } else if (interfaceCount >= 3) {
    risks.push({
      id: id++,
      title: 'Disrupcion Temporal de Integraciones',
      probability: 'Media',
      impact: 'Alto',
      severity: 'Alto',
      mitigation: 'Plan de migracion por fases, stub services para integraciones criticas',
    })
  }

  if (processCount > 3) {
    risks.push({
      id: id++,
      title: 'Resistencia al Cambio de Usuarios',
      probability: 'Alta',
      impact: 'Alto',
      severity: 'Alto',
      mitigation: 'Change management desde dia 1, champions por area, training continuo',
    })
  }

  if (componentCount > 5) {
    risks.push({
      id: id++,
      title: 'Funcionalidades Custom No Soportadas',
      probability: componentCount > 15 ? 'Alta' : 'Media-Alta',
      impact: 'Alto',
      severity: 'Alto',
      mitigation: 'Gap analysis exhaustivo en discovery, priorizacion de must-haves',
    })
  }

  if (personalDataCount > 0) {
    risks.push({
      id: id++,
      title: 'Incumplimiento de Normativa de Datos Personales',
      probability: 'Media',
      impact: personalDataCount > 3 ? 'Muy Alto' : 'Alto',
      severity: personalDataCount > 3 ? 'Critico' : 'Alto',
      mitigation: 'Auditoria de datos personales, validacion con area legal, plan de cumplimiento',
    })
  }

  if (criticality === 'Crítica' || criticality === 'Alta') {
    risks.push({
      id: id++,
      title: 'Capacidad del Equipo Insuficiente',
      probability: 'Media',
      impact: 'Medio',
      severity: 'Medio',
      mitigation: 'Contratacion de consultores especializados, training intensivo',
    })
  }

  return risks
}

export async function GET(request: NextRequest) {
  const filters = parseFilters(request)
  const appWhere = buildAppWhere(filters)
  const appIdParam = request.nextUrl.searchParams.get('appId')
  const appId = appIdParam ? Number(appIdParam) : null

  // Always fetch the applications list (filtered by global filters)
  const applications = await prisma.tbl_aplicacion.findMany({
    where: appWhere,
    select: { id_aplicacion: true, nombre: true, criticidad: true },
    orderBy: { nombre: 'asc' },
  })

  // If no appId, return just the list
  if (!appId) {
    return NextResponse.json({ applications })
  }

  // Fetch full data for the selected application in parallel
  const [application, components, ownedInterfaces, consumedInterfaces] = await Promise.all([
    // Application details
    prisma.tbl_aplicacion.findUnique({
      where: { id_aplicacion: appId },
      select: {
        id_aplicacion: true,
        nombre: true,
        descripcion: true,
        criticidad: true,
        proveedor: true,
        fabricante: true,
        responsable: true,
        cat_estado: { select: { nombre: true } },
        cat_modelo_servicio: { select: { nombre: true } },
      },
    }),

    // All logical components with deep relations
    prisma.tbl_componente_logico.findMany({
      where: { id_aplicacion: appId },
      select: {
        id_componente_logico: true,
        nombre: true,
        descripcion: true,
        is_contiene_datos_personales: true,
        version: true,
        cat_tecnologia: { select: { nombre: true, categoria: true } },
        cat_componente_logico_tipo: { select: { nombre_tipo: true } },
        rel_componente_log_subproceso: {
          select: {
            tipo_relacion: true,
            cat_subproceso: {
              select: {
                nombre: true,
                cat_proceso: {
                  select: {
                    nombre: true,
                    cat_macroproceso: { select: { nombre: true, categoria: true } },
                  },
                },
              },
            },
          },
        },
        rel_componente_log_despliegue: {
          select: {
            tbl_componente_despliegue: {
              select: {
                componente: true,
                cat_entorno: { select: { nombre: true } },
                cat_plataforma: { select: { nombre: true } },
                cat_componente_despliegue_tipo: { select: { nombre_tipo: true } },
              },
            },
          },
        },
      },
    }),

    // Interfaces owned by the application
    prisma.tbl_interfaz.findMany({
      where: { id_aplicacion: appId },
      select: {
        id_interfaz: true,
        nombre_interfaz: true,
        descripcion: true,
        estado: true,
        cat_tipo_interfaz: { select: { nombre_tipo: true } },
        tbl_componente_logico: { select: { nombre: true } },
        rel_com_interfaz_consumo: {
          select: {
            tbl_componente_logico: {
              select: {
                nombre: true,
                tbl_aplicacion: { select: { nombre: true } },
              },
            },
          },
        },
      },
    }),

    // Interfaces consumed by this application's components
    prisma.rel_com_interfaz_consumo.findMany({
      where: {
        tbl_componente_logico: { id_aplicacion: appId },
      },
      select: {
        tbl_interfaz: {
          select: {
            nombre_interfaz: true,
            cat_tipo_interfaz: { select: { nombre_tipo: true } },
            tbl_aplicacion: { select: { nombre: true } },
          },
        },
        tbl_componente_logico: { select: { nombre: true } },
      },
    }),
  ])

  if (!application) {
    return NextResponse.json({ applications, error: 'Aplicacion no encontrada' }, { status: 404 })
  }

  // --- Compute dimensions ---
  const personalDataComponents = components.filter((c) => c.is_contiene_datos_personales === 'Si')

  // Unique technologies
  const techSet = new Set<string>()
  const technologies: Array<{ nombre: string; categoria: string | null }> = []
  for (const c of components) {
    if (c.cat_tecnologia && !techSet.has(c.cat_tecnologia.nombre)) {
      techSet.add(c.cat_tecnologia.nombre)
      technologies.push({ nombre: c.cat_tecnologia.nombre, categoria: c.cat_tecnologia.categoria })
    }
  }

  // Unique subprocesses
  const subprocessSet = new Set<string>()
  for (const c of components) {
    for (const rel of c.rel_componente_log_subproceso) {
      if (rel.cat_subproceso.nombre) {
        subprocessSet.add(rel.cat_subproceso.nombre)
      }
    }
  }

  const dimensions = {
    modulesCount: components.length,
    interfacesCount: ownedInterfaces.length,
    processesCount: subprocessSet.size,
    technologiesCount: technologies.length,
    personalDataComponents: personalDataComponents.length,
  }

  // --- Impact Score ---
  const impactScore = calculateImpactScore(
    dimensions.modulesCount,
    dimensions.interfacesCount,
    dimensions.processesCount,
    application.criticidad,
    dimensions.personalDataComponents
  )

  // --- Integration Complexity ---
  const interfacesByType = new Map<string, { count: number; interfaces: string[] }>()
  for (const iface of ownedInterfaces) {
    const tipo = iface.cat_tipo_interfaz.nombre_tipo
    const entry = interfacesByType.get(tipo) || { count: 0, interfaces: [] }
    entry.count++
    entry.interfaces.push(iface.nombre_interfaz)
    interfacesByType.set(tipo, entry)
  }

  const integrationComplexity = {
    total: ownedInterfaces.length,
    byType: Array.from(interfacesByType.entries()).map(([type, data]) => ({
      type,
      count: data.count,
      interfaces: data.interfaces,
    })).sort((a, b) => b.count - a.count),
    consumedInterfaces: consumedInterfaces.map((ci) => ({
      interface: ci.tbl_interfaz.nombre_interfaz,
      type: ci.tbl_interfaz.cat_tipo_interfaz.nombre_tipo,
      providerApp: ci.tbl_interfaz.tbl_aplicacion?.nombre || 'Desconocido',
      consumer: ci.tbl_componente_logico.nombre,
    })),
    interfaceDetails: ownedInterfaces.map((iface) => ({
      nombre: iface.nombre_interfaz,
      tipo: iface.cat_tipo_interfaz.nombre_tipo,
      estado: iface.estado || 'Sin definir',
      componente: iface.tbl_componente_logico?.nombre || 'N/A',
      consumers: iface.rel_com_interfaz_consumo.map((c) => ({
        componente: c.tbl_componente_logico.nombre,
        aplicacion: c.tbl_componente_logico.tbl_aplicacion.nombre,
      })),
      consumerCount: iface.rel_com_interfaz_consumo.length,
    })),
  }

  // --- Business Process Impact ---
  const macroprocessMap = new Map<string, { categoria: string; subprocesses: Map<string, { proceso: string; tipoRelacion: string }> }>()
  for (const c of components) {
    for (const rel of c.rel_componente_log_subproceso) {
      const sp = rel.cat_subproceso
      const macroName = sp.cat_proceso.cat_macroproceso.nombre
      const macroCategoria = sp.cat_proceso.cat_macroproceso.categoria
      if (!macroprocessMap.has(macroName)) {
        macroprocessMap.set(macroName, { categoria: macroCategoria, subprocesses: new Map() })
      }
      const entry = macroprocessMap.get(macroName)!
      if (sp.nombre && !entry.subprocesses.has(sp.nombre)) {
        entry.subprocesses.set(sp.nombre, { proceso: sp.cat_proceso.nombre, tipoRelacion: rel.tipo_relacion })
      }
    }
  }

  const businessProcessImpact = Array.from(macroprocessMap.entries()).map(([macroproceso, data]) => ({
    macroproceso,
    categoria: data.categoria,
    subprocessCount: data.subprocesses.size,
    subprocesses: Array.from(data.subprocesses.entries()).map(([name, info]) => ({
      name,
      proceso: info.proceso,
      tipoRelacion: info.tipoRelacion,
    })),
  }))

  // --- Functional Modules (grouped by component type) ---
  const modulesByType = new Map<string, Array<{ nombre: string; descripcion: string; technology: string | null; hasPersonalData: boolean }>>()
  for (const c of components) {
    const tipo = c.cat_componente_logico_tipo.nombre_tipo
    if (!modulesByType.has(tipo)) {
      modulesByType.set(tipo, [])
    }
    modulesByType.get(tipo)!.push({
      nombre: c.nombre,
      descripcion: c.descripcion,
      technology: c.cat_tecnologia?.nombre || null,
      hasPersonalData: c.is_contiene_datos_personales === 'Si',
    })
  }

  const functionalModules = Array.from(modulesByType.entries()).map(([tipo, comps]) => ({
    tipo,
    count: comps.length,
    components: comps,
  }))

  // --- Technology Considerations ---
  const deploymentSummary = new Map<string, number>()
  for (const c of components) {
    for (const rel of c.rel_componente_log_despliegue) {
      const d = rel.tbl_componente_despliegue
      const key = `${d.cat_entorno.nombre} | ${d.cat_plataforma.nombre} | ${d.cat_componente_despliegue_tipo.nombre_tipo}`
      deploymentSummary.set(key, (deploymentSummary.get(key) || 0) + 1)
    }
  }

  const CLOUD_MODELS = ['SaaS', 'PaaS', 'IaaS']
  const technologyConsiderations = {
    technologies,
    modeloServicio: application.cat_modelo_servicio.nombre,
    isCloudNative: CLOUD_MODELS.includes(application.cat_modelo_servicio.nombre),
    deployments: Array.from(deploymentSummary.entries()).map(([key, count]) => {
      const [entorno, plataforma, tipo] = key.split(' | ')
      return { entorno, plataforma, tipo, count }
    }),
  }

  // --- Effort Estimation ---
  const effortEstimation = calculateEffortEstimation(
    impactScore.level,
    dimensions.interfacesCount,
    dimensions.modulesCount
  )

  // --- Risk Assessment ---
  const riskAssessment = generateRiskAssessment(
    application.criticidad,
    dimensions.interfacesCount,
    dimensions.modulesCount,
    dimensions.personalDataComponents,
    dimensions.processesCount
  )

  return NextResponse.json({
    applications,
    application: {
      id: application.id_aplicacion,
      nombre: application.nombre,
      descripcion: application.descripcion,
      criticidad: application.criticidad || 'Sin definir',
      estado: application.cat_estado.nombre,
      modeloServicio: application.cat_modelo_servicio.nombre,
      proveedor: application.proveedor || 'Sin definir',
      fabricante: application.fabricante || 'Sin definir',
      responsable: application.responsable || 'Sin definir',
    },
    impactScore,
    dimensions,
    integrationComplexity,
    businessProcessImpact,
    functionalModules,
    technologyConsiderations,
    effortEstimation,
    riskAssessment,
  })
}
