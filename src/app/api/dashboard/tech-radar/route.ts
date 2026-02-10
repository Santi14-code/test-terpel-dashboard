import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { parseFilters, buildAppWhere } from '@/lib/filters'

// Infer ring based on adoption level
function inferRing(componentCount: number, appCount: number, hasCriticalApps: boolean): string {
  if (componentCount >= 5 && appCount >= 3) return 'Adopt'
  if (componentCount >= 3 || (appCount >= 2 && hasCriticalApps)) return 'Trial'
  if (componentCount >= 2 || appCount >= 2) return 'Assess'
  return 'Hold'
}

export async function GET(request: NextRequest) {
  const filters = parseFilters(request)
  const appWhere = buildAppWhere(filters)

  const [technologies, filteredApps] = await Promise.all([
    prisma.cat_tecnologia.findMany({
      select: {
        id_tecnologia: true,
        nombre: true,
        categoria: true,
        tbl_componente_logico: {
          select: {
            tbl_aplicacion: {
              select: { id_aplicacion: true, criticidad: true },
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

  const filteredIds = new Set(filteredApps.map((a) => a.id_aplicacion))

  const radarData = technologies
    .map((tech) => {
      const relevantComponents = tech.tbl_componente_logico.filter((c) =>
        filteredIds.has(c.tbl_aplicacion.id_aplicacion)
      )
      const uniqueApps = new Set(relevantComponents.map((c) => c.tbl_aplicacion.id_aplicacion))
      const hasCritical = relevantComponents.some((c) => c.tbl_aplicacion.criticidad === 'Crítica')
      const ring = inferRing(relevantComponents.length, uniqueApps.size, hasCritical)

      return {
        name: tech.nombre,
        category: tech.categoria || 'Otros',
        components: relevantComponents.length,
        apps: uniqueApps.size,
        hasCritical,
        ring,
      }
    })
    .filter((t) => t.components > 0)
    .sort((a, b) => b.components - a.components)

  // Ring counts
  const ringCounts = {
    Adopt: radarData.filter((t) => t.ring === 'Adopt').length,
    Trial: radarData.filter((t) => t.ring === 'Trial').length,
    Assess: radarData.filter((t) => t.ring === 'Assess').length,
    Hold: radarData.filter((t) => t.ring === 'Hold').length,
  }

  // Category counts
  const categories = [...new Set(radarData.map((t) => t.category))].sort()

  // Group by ring for display
  const byRing: Record<string, typeof radarData> = { Adopt: [], Trial: [], Assess: [], Hold: [] }
  for (const t of radarData) {
    byRing[t.ring].push(t)
  }

  return NextResponse.json({
    kpis: {
      totalTechs: radarData.length,
      ...ringCounts,
    },
    radarData,
    byRing,
    categories,
  })
}
