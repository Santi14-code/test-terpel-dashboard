'use client'

import { useParams } from 'next/navigation'
import { Construction } from 'lucide-react'

function slugToTitle(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export default function ComingSoonPage() {
  const params = useParams()
  const slug = params.dashboard as string
  const title = slugToTitle(slug)

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-8">{title}</h1>
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
          <Construction size={40} className="text-muted-foreground" />
        </div>
        <h2 className="text-xl font-semibold mb-2">Proximamente</h2>
        <p className="text-muted-foreground max-w-md">
          La implementacion de este dashboard se realizara proximamente.
        </p>
      </div>
    </div>
  )
}
