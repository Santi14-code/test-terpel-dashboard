'use client'

import { useFilteredQuery } from '@/hooks/useFilteredQuery'
import { Header } from '@/components/layout/Header'
import { KPICard } from '@/components/charts/KPICard'
import { ChartContainer } from '@/components/charts/ChartContainer'
import { CheckCircle, FlaskConical, Search, Ban, Cpu } from 'lucide-react'

/* eslint-disable @typescript-eslint/no-explicit-any */

const RING_COLORS: Record<string, string> = {
  Adopt: '#28A745',
  Trial: '#17A2B8',
  Assess: '#FAE44C',
  Hold: '#EA352C',
}

const RING_LABELS: Record<string, string> = {
  Adopt: 'Adoptar — Estándar corporativo',
  Trial: 'Probar — En evaluación activa',
  Assess: 'Evaluar — Uso limitado',
  Hold: 'Mantener — Evitar nuevos usos',
}

const CATEGORY_COLORS: Record<string, string> = {}
const BASE_COLORS = ['#EA352C', '#44546A', '#28A745', '#6F42C1', '#FD7E14', '#17A2B8', '#E83E8C', '#20C997']

export default function TechRadarPage() {
  const { data, isLoading } = useFilteredQuery('/api/dashboard/tech-radar')

  if (isLoading) {
    return (
      <div className="flex-1">
        <Header title="Technology Radar" subtitle="Clasificación de tecnologías por nivel de adopción (Adopt / Trial / Assess / Hold)" />
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-card rounded-lg border border-border p-4 h-24 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  const kpis = data?.kpis

  // Assign colors to categories
  const categories: string[] = data?.categories ?? []
  categories.forEach((cat, i) => {
    CATEGORY_COLORS[cat] = BASE_COLORS[i % BASE_COLORS.length]
  })

  const kpiCards = [
    { label: 'Total Tecnologías', value: kpis?.totalTechs ?? 0, icon: Cpu },
    { label: 'Adopt', value: kpis?.Adopt ?? 0, icon: CheckCircle, color: 'text-success' },
    { label: 'Trial', value: kpis?.Trial ?? 0, icon: FlaskConical, color: 'text-info' },
    { label: 'Assess', value: kpis?.Assess ?? 0, icon: Search, color: 'text-warning' },
    { label: 'Hold', value: kpis?.Hold ?? 0, icon: Ban, color: 'text-danger' },
  ]

  // Build radar visualization data — concentric rings with dots
  const rings = ['Adopt', 'Trial', 'Assess', 'Hold']

  return (
    <div className="flex-1">
      <Header title="Technology Radar" subtitle="Clasificación de tecnologías por nivel de adopción (Adopt / Trial / Assess / Hold)" />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {kpiCards.map((kpi) => (
            <KPICard key={kpi.label} label={kpi.label} value={String(kpi.value)} icon={kpi.icon} color={kpi.color} />
          ))}
        </div>

        {/* Radar Visualization */}
        <ChartContainer title="Radar de Tecnologías" subtitle="Centro = mayor adopción | Exterior = menor adopción" height="h-[550px]">
          <div className="w-full h-full flex items-center justify-center">
            <svg viewBox="-250 -250 500 500" className="w-full h-full max-w-[550px] max-h-[550px]">
              {/* Concentric rings */}
              {rings.map((ring, ri) => {
                const r = 60 + ri * 50
                return (
                  <g key={ring}>
                    <circle cx={0} cy={0} r={r} fill="none" stroke={RING_COLORS[ring]} strokeOpacity={0.3} strokeWidth={1} />
                    <text x={4} y={-r + 14} fontSize={9} fill={RING_COLORS[ring]} fontWeight={600}>{ring}</text>
                  </g>
                )
              })}
              {/* Quadrant lines */}
              <line x1={0} y1={-230} x2={0} y2={230} stroke="#444" strokeWidth={0.5} />
              <line x1={-230} y1={0} x2={230} y2={0} stroke="#444" strokeWidth={0.5} />
              {/* Quadrant labels */}
              {categories.slice(0, 4).map((cat, qi) => {
                const positions = [
                  { x: 115, y: -225 },
                  { x: 115, y: 235 },
                  { x: -230, y: -225 },
                  { x: -230, y: 235 },
                ]
                const pos = positions[qi]
                return (
                  <text key={cat} x={pos.x} y={pos.y} fontSize={10} fill={CATEGORY_COLORS[cat]}
                    fontWeight={600} textAnchor="start">
                    {cat}
                  </text>
                )
              })}
              {/* Technology dots */}
              {data?.radarData?.map((tech: any, idx: number) => {
                const ringIdx = rings.indexOf(tech.ring)
                const catIdx = categories.indexOf(tech.category)
                // Place in quadrant based on category, ring for radius
                const baseAngle = (catIdx % 4) * 90 + 45 // center of quadrant
                const spreadAngle = 70 // spread within quadrant
                // Distribute items within ring+quadrant
                const itemsInRingCat = data.radarData.filter(
                  (t: any) => t.ring === tech.ring && categories.indexOf(t.category) % 4 === catIdx % 4
                )
                const posInGroup = itemsInRingCat.indexOf(tech)
                const totalInGroup = itemsInRingCat.length
                const angleOffset = totalInGroup > 1
                  ? (posInGroup / (totalInGroup - 1) - 0.5) * spreadAngle
                  : 0
                const angle = ((baseAngle + angleOffset) * Math.PI) / 180
                const radius = 60 + ringIdx * 50 - 20 + (posInGroup % 3) * 12
                const cx = Math.cos(angle) * radius
                const cy = Math.sin(angle) * radius
                const dotSize = Math.min(4 + tech.components * 0.5, 10)

                return (
                  <g key={idx}>
                    <circle cx={cx} cy={cy} r={dotSize} fill={CATEGORY_COLORS[tech.category] || '#888'}
                      fillOpacity={0.8} stroke="#fff" strokeWidth={0.5} />
                    <title>{`${tech.name}\n${tech.ring} | ${tech.category}\n${tech.components} componentes | ${tech.apps} apps`}</title>
                  </g>
                )
              })}
            </svg>
          </div>
        </ChartContainer>

        {/* Legend */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          {categories.slice(0, 4).map((cat) => (
            <div key={cat} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[cat] }} />
              <span>{cat}</span>
            </div>
          ))}
        </div>

        {/* Ring tables */}
        {rings.map((ring) => {
          const items = data?.byRing?.[ring] ?? []
          if (items.length === 0) return null
          return (
            <div key={ring} className="bg-card rounded-lg border p-4" style={{ borderColor: RING_COLORS[ring] + '55' }}>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: RING_COLORS[ring] }} />
                <h3 className="font-semibold">{ring}</h3>
                <span className="text-xs text-muted-foreground">— {RING_LABELS[ring]}</span>
              </div>
              <div className="overflow-auto max-h-48 mt-3">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-card">
                    <tr className="border-b border-border">
                      <th className="text-left p-2">Tecnología</th>
                      <th className="text-left p-2">Categoría</th>
                      <th className="text-right p-2">Componentes</th>
                      <th className="text-right p-2">Apps</th>
                      <th className="text-center p-2">En App Crítica</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((t: any, i: number) => (
                      <tr key={i} className="border-b border-border/50 hover:bg-muted/50">
                        <td className="p-2 font-medium">{t.name}</td>
                        <td className="p-2 text-muted-foreground">{t.category}</td>
                        <td className="p-2 text-right">{t.components}</td>
                        <td className="p-2 text-right">{t.apps}</td>
                        <td className="p-2 text-center">{t.hasCritical ? <span className="text-red-400">Si</span> : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
