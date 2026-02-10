'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, Shield, AlertTriangle, Network, Target,
  ShieldAlert, DollarSign, Lightbulb, Activity, RefreshCw,
  Briefcase, ChevronLeft, ChevronRight, GitBranch, FolderKanban,
  Crosshair,
} from 'lucide-react'
import { useState } from 'react'

const navItems = [
  { name: 'Principal', href: '/', icon: LayoutDashboard },
  { name: 'Ejecutivo', href: '/executive', icon: Briefcase },
  { name: 'Gobernanza', href: '/governance', icon: Shield },
  { name: 'Portafolio', href: '/portfolio', icon: FolderKanban },
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
]

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        'flex flex-col bg-sidebar text-sidebar-foreground h-screen sticky top-0 transition-all duration-200 z-40',
        collapsed ? 'w-16' : 'w-56'
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm">
              T
            </div>
            <span className="font-semibold text-sm">Terpel EA</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded hover:bg-white/10 transition-colors"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <nav className="flex-1 py-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-2.5 mx-2 rounded-md text-sm transition-colors',
                isActive
                  ? 'bg-sidebar-accent text-white font-medium'
                  : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-white/5'
              )}
              title={collapsed ? item.name : undefined}
            >
              <Icon size={18} className="shrink-0" />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
