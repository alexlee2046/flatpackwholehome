import configPromise from '@payload-config'
import { NextResponse } from 'next/server'
import { getPayload } from 'payload'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, address, city, postal, room } = body || {}

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
