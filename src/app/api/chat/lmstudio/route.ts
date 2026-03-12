import { NextRequest, NextResponse } from 'next/server'

const LMSTUDIO_BASE = process.env.LMSTUDIO_API_URL ?? 'http://localhost:1234'

function stripThinkTags(content: string): string {
  return content.replace(/<think>[\s\S]*?<\/think>/gi, '').trim()
}

export async function POST(request: NextRequest) {
  try {
    const { message, model } = await request.json()

    if (!message) {
      return NextResponse.json({ error: 'Missing message' }, { status: 400 })
    }

    const modelId = model || 'qwen3.5-9b-mlx'

    const response = await fetch(`${LMSTUDIO_BASE}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: modelId,
        messages: [{ role: 'user', content: message }],
        temperature: 0.7,
        max_tokens: 1024,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('LM Studio API Error:', errorText)

      if (response.status === 503) {
        return NextResponse.json(
          { error: 'LM Studio is not running or model not loaded. Start with: lms server start && lms load <model>' },
          { status: 503 }
        )
      }

      return NextResponse.json(
        { error: `LM Studio Error: ${response.status} - ${errorText.slice(0, 200)}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    let content = data.choices?.[0]?.message?.content

    if (content == null || typeof content !== 'string') {
      throw new Error('No response content from LM Studio')
    }

    content = stripThinkTags(content)

    return NextResponse.json({
      response: content,
      model: modelId,
      provider: 'lmstudio',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('LM Studio Chat API Error:', error)

    if (error instanceof Error) {
      if (error.message.includes('ECONNREFUSED') || error.message.includes('fetch')) {
        return NextResponse.json(
          { error: 'Cannot reach LM Studio. Is it running on the server?' },
          { status: 503 }
        )
      }
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred while processing your request.' },
      { status: 500 }
    )
  }
}
