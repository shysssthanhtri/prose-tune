import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { text } = await request.json()

  await new Promise((resolve) => setTimeout(resolve, 3000))

  return NextResponse.json({ text })
}
