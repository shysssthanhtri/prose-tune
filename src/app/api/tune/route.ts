import { NextResponse } from 'next/server'

import { tuneText } from '@/lib/ai/tune'

export async function POST(request: Request) {
  const { text } = await request.json()

  if (typeof text !== 'string' || !text.trim()) {
    return NextResponse.json({ error: 'text is required' }, { status: 400 })
  }

  const tuned = await tuneText(text)

  return NextResponse.json({ text: tuned })
}
