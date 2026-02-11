import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const format = searchParams.get('format') || 'png'

    const outputDir = join(process.cwd(), 'output', 'plantuml')
    const fileName = format === 'puml'
      ? 'terpel-combustible-aviacion.puml'
      : 'terpel-combustible-aviacion.png'

    const filePath = join(outputDir, fileName)

    const fileBuffer = await readFile(filePath)

    const contentType = format === 'puml' ? 'text/plain' : 'image/png'

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch (error) {
    console.error('Error serving diagram:', error)
    return NextResponse.json(
      { error: 'Diagrama no encontrado. Ejecuta: npm run generate:combustible-aviacion-plantuml' },
      { status: 404 }
    )
  }
}
