import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

const SYSTEM_PROMPT = `You are a helpful customer service assistant for NicePlayland Indramayu, a family theme park located in Indramayu, West Java, Indonesia.

Key information:
- Ticket price: Rp 35.000 per person for all rides access
- VIP Ticket: Rp 75.000 per person (all rides + fast track + welcome drink)
- Kids Ticket (under 100cm): Rp 20.000
- Group Ticket (min 10 people): Rp 28.000 per person
- Operating hours: 09:00 - 17:00 WIB (Western Indonesian Time)
- Open every day including weekends and holidays
- Various rides for all ages: family rides, extreme rides, kids rides, and water rides
- Facilities: parking area, food court, prayer room (mushola), restrooms, first aid station
- Location: Jl. Raya Indramayu, Kabupaten Indramayu, Jawa Barat

Rules:
- Answer in Indonesian language (Bahasa Indonesia)
- Be friendly, professional, and helpful
- If you don't know specific information, politely say so and suggest contacting the park directly
- Keep responses concise but informative
- Use appropriate Indonesian greetings and politeness levels`

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, sessionId } = body

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Message is required' },
        { status: 400, headers: corsHeaders }
      )
    }

    if (message.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Message cannot be empty' },
        { status: 400, headers: corsHeaders }
      )
    }

    const zai = await ZAI.create()
    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'assistant' as const, content: SYSTEM_PROMPT },
        { role: 'user' as const, content: message.trim() },
      ],
      thinking: { type: 'disabled' },
    })

    const reply = completion.choices?.[0]?.message?.content || 'Maaf, saya tidak dapat memproses permintaan Anda saat ini.'

    return NextResponse.json(
      { success: true, data: { reply, sessionId: sessionId || null } },
      { status: 200, headers: corsHeaders }
    )
  } catch (error) {
    console.error('Chatbot error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process your message. Please try again.' },
      { status: 500, headers: corsHeaders }
    )
  }
}
