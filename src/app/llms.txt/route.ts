import { promises as fs } from 'fs'
import path from 'path'
import { NextResponse } from 'next/server'

export const dynamic = 'force-static'

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'public', 'llms.txt')
    const content = await fs.readFile(filePath, 'utf-8')
    return new NextResponse(content, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
      },
    })
  } catch (e) {
    return new NextResponse('# The Flat Set\n> Whole-Home Flat-Pack Living System', {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  }
}
