import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params
    const outputDir = join(process.cwd(), 'output', 'plantuml', 'temp')
    const filePath = join(outputDir, filename)

    const fileBuffer = await readFile(filePath)

    const isPuml = filename.endsWith('.puml')
    const contentType = isPuml ? 'text/plain' : 'image/png'

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch (error) {
    console.error('Error serving temp diagram:', error)
    return NextResponse.json(
      { error: 'Diagrama no encontrado' },
      { status: 404 }
    )
  }
}
