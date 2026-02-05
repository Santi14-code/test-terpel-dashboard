import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Generador de Diagramas | Terpel Dashboard',
  description: 'Visualizador de diagramas arquitectónicos generados con PlantUML',
}

export default function GeneradorPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Generador de Diagramas</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-1">
        <div className="rounded-lg border bg-card p-6">
          <h2 className="mb-4 text-xl font-semibold">
            Vista Combustible-Aviación
          </h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Diagrama de capacidades y aplicaciones para la línea de negocio Combustible-Aviación.
            Incluye jerarquía completa L1 → L2 → L3 → Aplicaciones con todas las conexiones visibles.
          </p>

          <div className="mb-4 rounded-lg bg-muted p-4">
            <h3 className="mb-2 text-sm font-medium">Estadísticas del Diagrama:</h3>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• 3 Capacidades Nivel 1</li>
              <li>• 10 Capacidades Nivel 2</li>
              <li>• 18 Capacidades Nivel 3</li>
              <li>• 13 Aplicaciones</li>
              <li>• 44 Relaciones de Realización</li>
            </ul>
          </div>

          <div className="mb-4">
            <div className="overflow-hidden rounded-lg border bg-white">
              <div className="overflow-auto">
                <img
                  src="/api/diagrams/combustible-aviacion"
                  alt="Diagrama Combustible-Aviación"
                  className="w-full"
                  style={{ maxWidth: '100%', height: 'auto' }}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <a
              href="/api/diagrams/combustible-aviacion"
              download="terpel-combustible-aviacion.png"
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Descargar PNG
            </a>
            <a
              href="/api/diagrams/combustible-aviacion?format=puml"
              download="terpel-combustible-aviacion.puml"
              className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
            >
              Descargar PlantUML
            </a>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <h2 className="mb-4 text-xl font-semibold">Cómo Generar Nuevos Diagramas</h2>
          <div className="space-y-4 text-sm text-muted-foreground">
            <div>
              <h3 className="mb-2 font-medium text-foreground">1. Desde la terminal:</h3>
              <pre className="rounded-md bg-muted p-3">
                <code>npm run generate:combustible-aviacion-plantuml</code>
              </pre>
            </div>
            <div>
              <h3 className="mb-2 font-medium text-foreground">2. El diagrama se genera automáticamente:</h3>
              <ul className="list-inside list-disc space-y-1">
                <li>Archivo PlantUML: output/plantuml/terpel-combustible-aviacion.puml</li>
                <li>Imagen PNG: output/plantuml/terpel-combustible-aviacion.png</li>
              </ul>
            </div>
            <div>
              <h3 className="mb-2 font-medium text-foreground">3. Recarga esta página para ver el nuevo diagrama</h3>
              <p>Los cambios se reflejan automáticamente en el visor.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
