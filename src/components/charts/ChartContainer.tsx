'use client'

import { ReactNode } from 'react'
import { Download } from 'lucide-react'

interface ChartContainerProps {
  title: string
  subtitle?: string
  children: ReactNode
  className?: string
  height?: string
  onExport?: () => void
}

export function ChartContainer({ title, subtitle, children, className = '', height = 'h-80', onExport }: ChartContainerProps) {
  return (
    <div className={`bg-card rounded-lg border border-border p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        {onExport && (
          <button
            onClick={onExport}
            className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground"
            title="Exportar"
          >
            <Download size={14} />
          </button>
        )}
      </div>
      <div className={height}>{children}</div>
    </div>
  )
}
