import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { parseFilters, buildAppWhere } from '@/lib/filters'

export async function GET(request: NextRequest) {
  const filters = parseFilters(request)
  const appWhere = buildAppWhere(filters)

  const apps = await prisma.tbl_aplicacion.findMany({
    where: appWhere,
    select: {
      id_aplicacion: true,
      nombre: true,
      criticidad: true,
      proveedor: true,
      _count: { select: { tbl_componente_logico: true } },
    },
  })

  // Group by vendor
  const vendorMap = new Map<string, {
    apps: { name: string; criticidad: string | null }[]
    components: number
    criticalCount: number
    highCount: number
  }>()

  for (const app of apps) {
    const vendor = app.proveedor || 'Sin proveedor'
    if (!vendorMap.has(vendor)) {
      vendorMap.set(vendor, { apps: [], components: 0, criticalCount: 0, highCount: 0 })
    }
    const v = vendorMap.get(vendor)!
    v.apps.push({ name: app.nombre, criticidad: app.criticidad })
    v.components += app._count.tbl_componente_logico
    if (app.criticidad === 'Crítica') v.criticalCount++
    if (app.criticidad === 'Alta') v.highCount++
  }

  const vendorList = [...vendorMap.entries()]
    .map(([name, data]) => ({
      name,
      totalApps: data.apps.length,
      criticalApps: data.criticalCount,
      highApps: data.highCount,
      components: data.components,
      criticalPercent: data.apps.length > 0 ? Math.round((data.criticalCount / data.apps.length) * 100) : 0,
      apps: data.apps,
    }))
    .sort((a, b) => b.totalApps - a.totalApps)

  // Risk indicators
  const highRiskVendors = vendorList.filter((v) => v.criticalPercent >= 30 && v.criticalApps > 0)
  const singleVendorCritical = vendorList.filter((v) => v.criticalApps > 0 && v.totalApps === v.criticalApps)
  const topVendor = vendorList[0]
  const concentrationIndex = apps.length > 0 && topVendor
    ? Math.round((topVendor.totalApps / apps.length) * 100)
    : 0

  // Treemap data
  const treemapData = vendorList.slice(0, 20).map((v) => ({
    name: v.name,
    value: v.totalApps,
    criticalPercent: v.criticalPercent,
  }))

  // Bar chart: top 10 vendors
  const barChart = vendorList.slice(0, 10).map((v) => ({
    name: v.name.length > 20 ? v.name.slice(0, 20) + '...' : v.name,
    fullName: v.name,
    totalApps: v.totalApps,
    criticalApps: v.criticalApps,
    highApps: v.highApps,
    components: v.components,
  }))

  return NextResponse.json({
    kpis: {
      totalVendors: vendorList.length,
      totalApps: apps.length,
      highRiskVendors: highRiskVendors.length,
      concentrationIndex,
    },
    treemapData,
    barChart,
    highRiskVendors: highRiskVendors.slice(0, 10).map((v) => ({
      name: v.name,
      totalApps: v.totalApps,
      criticalApps: v.criticalApps,
      criticalPercent: v.criticalPercent,
    })),
    vendorDetail: vendorList.slice(0, 30),
  })
}
