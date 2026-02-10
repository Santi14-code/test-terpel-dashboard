import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { parseFilters, buildAppWhere } from '@/lib/filters'

export async function GET(request: NextRequest) {
  const filters = parseFilters(request)
  const appWhere = buildAppWhere(filters)

  const [technologies, apps] = await Promise.all([
    prisma.cat_tecnologia.findMany({
      select: {
        id_tecnologia: true,
        nombre: true,
        categoria: true,
        tbl_componente_logico: {
          select: {
            id_componente_logico: true,
            version: true,
            tbl_aplicacion: {
              select: {
                id_aplicacion: true,
                nombre: true,
                criticidad: true,
              },
            },
          },
        },
      },
    }),
    prisma.tbl_aplicacion.findMany({
      where: appWhere,
      select: { id_aplicacion: true },
    }),
  ])

  const filteredAppIds = new Set(apps.map((a) => a.id_aplicacion))

  // Build technology table data
  const techTable = technologies.map((tech) => {
    // Filter components to those belonging to filtered apps
    const relevantComponents = tech.tbl_componente_logico.filter((c) =>
      filteredAppIds.has(c.tbl_aplicacion.id_aplicacion)
    )
    const uniqueApps = new Map<number, { nombre: string; criticidad: string | null }>()
    const versions = new Set<string>()

    for (const comp of relevantComponents) {
      uniqueApps.set(comp.tbl_aplicacion.id_aplicacion, {
        nombre: comp.tbl_aplicacion.nombre,
        criticidad: comp.tbl_aplicacion.criticidad,
      })
      if (comp.version) versions.add(comp.version)
    }

    const appList = [...uniqueApps.values()]
    const criticalCount = appList.filter((a) => a.criticidad === 'Crítica').length
    const highCount = appList.filter((a) => a.criticidad === 'Alta').length

    return {
      id: tech.id_tecnologia,
      name: tech.nombre,
      category: tech.categoria || 'Sin categoria',
      components: relevantComponents.length,
      apps: appList.length,
      criticalApps: criticalCount,
      highApps: highCount,
      versions: [...versions].sort(),
      maxCriticality:
        criticalCount > 0 ? 'Crítica' : highCount > 0 ? 'Alta' : appList.some((a) => a.criticidad === 'Media') ? 'Media' : 'Baja',
    }
  })
    .filter((t) => t.components > 0)
    .sort((a, b) => b.components - a.components)

  // Alerts
  const orphanTechs = techTable.filter((t) => t.components === 1)
  const multiVersionTechs = techTable.filter((t) => t.versions.length > 1)
  const criticalSingleTech = techTable.filter((t) => t.criticalApps > 0 && t.apps === 1)

  // Category distribution
  const categoryMap: Record<string, { count: number; components: number }> = {}
  for (const t of techTable) {
    if (!categoryMap[t.category]) categoryMap[t.category] = { count: 0, components: 0 }
    categoryMap[t.category].count++
    categoryMap[t.category].components += t.components
  }
  const categoryDistribution = Object.entries(categoryMap)
    .map(([name, data]) => ({ name, techs: data.count, components: data.components }))
    .sort((a, b) => b.components - a.components)

  // Tech × App heatmap (top 10 techs × top 10 apps by component count)
  const top10Techs = techTable.slice(0, 10)
  const appComponentCounts: Record<number, { nombre: string; count: number }> = {}
  for (const tech of technologies) {
    for (const comp of tech.tbl_componente_logico) {
      if (!filteredAppIds.has(comp.tbl_aplicacion.id_aplicacion)) continue
      const appId = comp.tbl_aplicacion.id_aplicacion
      if (!appComponentCounts[appId]) {
        appComponentCounts[appId] = { nombre: comp.tbl_aplicacion.nombre, count: 0 }
      }
      appComponentCounts[appId].count++
    }
  }
  const top10Apps = Object.entries(appComponentCounts)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 10)
    .map(([id, data]) => ({ id: Number(id), nombre: data.nombre }))

  // Cross-tabulate
  const heatmapMatrix = top10Techs.map((tech) => {
    const techData = technologies.find((t) => t.id_tecnologia === tech.id)!
    return top10Apps.map((app) =>
      techData.tbl_componente_logico.filter((c) => c.tbl_aplicacion.id_aplicacion === app.id).length
    )
  })

  return NextResponse.json({
    kpis: {
      totalTechs: techTable.length,
      totalCategories: Object.keys(categoryMap).length,
      orphanCount: orphanTechs.length,
      multiVersionCount: multiVersionTechs.length,
    },
    techTable,
    categoryDistribution,
    alerts: {
      orphanTechs: orphanTechs.map((t) => ({ name: t.name, category: t.category })),
      multiVersionTechs: multiVersionTechs.map((t) => ({ name: t.name, versions: t.versions })),
      criticalSingleTech: criticalSingleTech.map((t) => ({ name: t.name, criticalApps: t.criticalApps })),
    },
    heatmap: {
      technologies: top10Techs.map((t) => t.name),
      applications: top10Apps.map((a) => a.nombre),
      matrix: heatmapMatrix,
    },
  })
}
