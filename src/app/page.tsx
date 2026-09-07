'use client'

import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'

export default function Home() {
  const [text, setText] = useState('')
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleTune() {
    setLoading(true)
    try {
      const res = await fetch('/api/tune', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      const data = await res.json()
      setOutput(data.text)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 font-sans dark:bg-black">
      <main className="grid flex-1 grid-cols-1 items-center gap-6 p-6 sm:grid-cols-[1fr_auto_1fr]">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Start typing..."
          className="h-full resize-none text-base"
        />
        <Button onClick={handleTune} disabled={loading}>
          {loading ? 'Tuning...' : 'Tune'}
        </Button>
        <Card className="h-full overflow-auto">
          <CardContent>
            {output ? (
              <p className="whitespace-pre-wrap">{output}</p>
            ) : (
              <p className="text-muted-foreground">Your text will appear here.</p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
