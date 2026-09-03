import configPromise from '@payload-config'
import { NextResponse } from 'next/server'
import { getPayload } from 'payload'

export const dynamic = 'force-dynamic'

const RATE_LIMIT = 5
const WINDOW_MS = 60 * 60 * 1000 // 1 hour

// ponytail: module-level Map keyed by IP, fine for a single-process standalone
// container. Swap for a shared store (e.g. Redis) if this ever runs multi-replica.
const hits = new Map<string, number[]>()

function isRateLimited(ip: string): boolean {
  const cutoff = Date.now() - WINDOW_MS

  // sweep stale entries on every check so the map can't grow unbounded
  for (const [key, timestamps] of hits) {
    const recent = timestamps.filter((t) => t > cutoff)
    if (recent.length === 0) hits.delete(key)
    else hits.set(key, recent)
  }

  const timestamps = hits.get(ip) ?? []
  if (timestamps.length >= RATE_LIMIT) return true

  timestamps.push(Date.now())
  hits.set(ip, timestamps)
  return false
}

function getClientIP(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0]!.trim()
  return req.headers.get('x-real-ip') || 'unknown'
}

export async function POST(req: Request) {
  try {
    const ip = getClientIP(req)
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 },
      )
    }

    const body = await req.json()
    const { name, email, address, city, postal, room, website } = body || {}

    // Honeypot: only bots fill this. Answer as if it worked rather than 400,
    // so a scripted submitter gets no signal to retry without the field.
    if (website) {
      return NextResponse.json({ message: 'Swatch box request received successfully.', success: true })
    }

    if (!name || !email || !address || !city || !postal) {
      return NextResponse.json(
        { error: 'Missing required fields (name, email, address, city, postal).' },
        { status: 400 },
      )
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email address format.' }, { status: 400 })
    }

    const payload = await getPayload({ config: configPromise })

    const formattedMessage = [
      `Free Swatch Box & $50 Voucher Request`,
      `---`,
      `Recipient: ${name}`,
      `Email: ${email}`,
      `Address: ${address}`,
      `City: ${city}`,
      `Postal/ZIP: ${postal}`,
      `Target Room/Space: ${room || 'Living Room / Not specified'}`,
    ].join('\n')

    const enquiry = await payload.create({
      collection: 'contact-enquiries',
      data: {
        email,
        message: formattedMessage,
        name,
        status: 'new',
        subject: `[Swatch Box] ${name} - ${city}`,
      },
      overrideAccess: true,
    })

    return NextResponse.json({
      id: enquiry.id,
      message: 'Swatch box request received successfully.',
      success: true,
    })
  } catch (err) {
    console.error('Failed to record swatch enquiry:', err)
    return NextResponse.json(
      { error: 'Internal server error while processing request.' },
      { status: 500 },
    )
  }
}
