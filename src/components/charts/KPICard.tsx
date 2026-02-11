'use client'

import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface KPICardProps {
  label: string
  value: string | number
  icon: LucideIcon
  trend?: { value: number; label: string }
  color?: string
}

export function KPICard({ label, value, icon: Icon, trend, color = 'text-primary' }: KPICardProps) {
  return (
    <div className="bg-card rounded-lg border border-border p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</span>
        <Icon size={16} className={color} />
      </div>
      <div className="text-2xl font-bold text-foreground">{value}</div>
      {trend && (
        <div className={cn('flex items-center gap-1 text-xs', trend.value >= 0 ? 'text-success' : 'text-danger')}>
          {trend.value >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          <span>{Math.abs(trend.value)}% {trend.label}</span>
        </div>
      )}
    </div>
  )
}
