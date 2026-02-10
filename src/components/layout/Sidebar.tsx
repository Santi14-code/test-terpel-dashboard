'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Shield, AlertTriangle, Network, Target,
  ShieldAlert, DollarSign, Lightbulb, Activity, RefreshCw,
  Briefcase, ChevronLeft, ChevronRight, GitBranch, FolderKanban,
  Crosshair, Table, ChevronDown,
  BarChart3, ShieldCheck, Cloud, Building2, Flame, TrendingUp,
  Share2, LayoutGrid, Cpu, ArrowUpCircle, Globe, PieChart,
  Search, Layers, Server, Lock, Plug, Link2, Clock, GraduationCap,
  Archive,
} from 'lucide-react'
import { useState } from 'react'

interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<{ size?: number; className?: string }>
}

interface NavGroup {
  id: string
  name: string
  items: NavItem[]
  defaultExpanded: boolean
}

const navGroups: NavGroup[] = [
  {
    id: 'estrategico',
    name: 'Estrategico',
    defaultExpanded: true,
    items: [
      { name: 'Executive Summary', href: '/', icon: BarChart3 },
      { name: 'Strategic Risk Matrix', href: '/coming-soon/strategic-risk-matrix', icon: ShieldCheck },
      { name: 'Cloud Transformation', href: '/coming-soon/cloud-transformation-tracker', icon: Cloud },
      { name: 'Vendor Concentration', href: '/coming-soon/vendor-concentration-dashboard', icon: Building2 },
      { name: 'Business Capability', href: '/coming-soon/business-capability-heat-map', icon: Flame },
      { name: 'Tech Investment', href: '/coming-soon/technology-investment-portfolio', icon: TrendingUp },
    ],
  },
  {
    id: 'tactico',
    name: 'Tactico',
    defaultExpanded: false,
    items: [
      { name: 'Integration Complexity', href: '/coming-soon/integration-complexity-map', icon: Share2 },
      { name: 'App Portfolio Matrix', href: '/coming-soon/application-portfolio-matrix', icon: LayoutGrid },
      { name: 'Technology Radar', href: '/coming-soon/technology-radar', icon: Cpu },
      { name: 'Modernization Pipeline', href: '/coming-soon/modernization-pipeline', icon: ArrowUpCircle },
      { name: 'Multi-Cloud Distribution', href: '/coming-soon/multi-cloud-distribution-dashboard', icon: Globe },
      { name: 'Capability Fragmentation', href: '/coming-soon/capability-fragmentation-report', icon: PieChart },
    ],
  },
  {
    id: 'operativo',
    name: 'Operativo',
    defaultExpanded: false,
    items: [
      { name: 'App Deep Dive', href: '/coming-soon/application-deep-dive', icon: Search },
      { name: 'Tech Stack Analyzer', href: '/coming-soon/technology-stack-analyzer', icon: Layers },
      { name: 'Deployment Architecture', href: '/coming-soon/deployment-architecture-viewer', icon: Server },
      { name: 'Data Privacy & Compliance', href: '/coming-soon/data-privacy-compliance-tracker', icon: Lock },
      { name: 'Interface Catalog', href: '/coming-soon/interface-catalog-explorer', icon: Plug },
      { name: 'Process Traceability', href: '/coming-soon/process-to-technology-traceability', icon: Link2 },
      { name: 'Component Lifecycle', href: '/coming-soon/component-lifecycle-dashboard', icon: Clock },
      { name: 'Skills Gap Analysis', href: '/coming-soon/skills-expertise-gap-analysis', icon: GraduationCap },
    ],
  },
  {
    id: 'old',
    name: 'Old',
    defaultExpanded: false,
    items: [
      { name: 'Ejecutivo', href: '/executive', icon: Briefcase },
      { name: 'Gobernanza', href: '/governance', icon: Shield },
      { name: 'Portafolio', href: '/portfolio', icon: FolderKanban },
      { name: 'Matriz Apps×Tech', href: '/matrix', icon: Table },
      { name: 'Impacto', href: '/impact-analysis', icon: Crosshair },
      { name: 'Deuda Tecnica', href: '/technical-debt', icon: AlertTriangle },
      { name: 'Arquitectura', href: '/architecture', icon: Network },
      { name: 'Alineacion', href: '/alignment', icon: Target },
      { name: 'Riesgos', href: '/risks', icon: ShieldAlert },
      { name: 'Costos', href: '/costs', icon: DollarSign },
      { name: 'Innovacion', href: '/innovation', icon: Lightbulb },
      { name: 'Performance', href: '/performance', icon: Activity },
      { name: 'Cambios', href: '/change', icon: RefreshCw },
      { name: 'Generador', href: '/generador', icon: GitBranch },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    navGroups.forEach(g => {
      initial[g.id] = g.defaultExpanded
    })
    return initial
  })

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }))
  }

  return (
    <aside
      className={cn(
        'flex flex-col bg-sidebar text-sidebar-foreground h-screen sticky top-0 transition-all duration-200 z-40',
        collapsed ? 'w-16' : 'w-56'
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm">
              T
            </div>
            <span className="font-semibold text-sm">Terpel EA</span>
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded hover:bg-white/10 transition-colors"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <nav className="flex-1 py-2 overflow-y-auto">
        {navGroups.map((group, groupIndex) => {
          const isExpanded = expandedGroups[group.id]

          return (
            <div key={group.id}>
              {groupIndex > 0 && collapsed && (
                <div className="mx-3 my-1 border-t border-white/10" />
              )}

              {!collapsed && (
                <button
                  onClick={() => toggleGroup(group.id)}
                  className="flex items-center w-full px-4 py-2 mt-2 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50 hover:text-sidebar-foreground/80 transition-colors"
                >
                  <ChevronDown
                    size={14}
                    className={cn(
                      'mr-2 transition-transform shrink-0',
                      !isExpanded && '-rotate-90'
                    )}
                  />
                  <span>{group.name}</span>
                </button>
              )}

              {(collapsed || isExpanded) && (
                <div>
                  {group.items.map((item) => {
                    const isActive = pathname === item.href
                    const Icon = item.icon
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          'flex items-center gap-3 px-4 py-2 mx-2 rounded-md text-sm transition-colors',
                          isActive
                            ? 'bg-sidebar-accent text-white font-medium'
                            : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-white/5'
                        )}
                        title={collapsed ? item.name : undefined}
                      >
                        <Icon size={16} className="shrink-0" />
                        {!collapsed && <span className="truncate">{item.name}</span>}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>
    </aside>
  )
}
