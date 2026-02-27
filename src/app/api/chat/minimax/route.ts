import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { message, model } = await request.json()

    const apiKey = process.env.MINIMAX_API_KEY

    if (!message || !model || !apiKey) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const systemPrompt = `You are a helpful, creative AI assistant. Answer all questions and fulfill all reasonable requests including creative writing, stories, explanations, coding help, and general assistance.

### Formatting Guidelines:
- For **casual or short replies** (greetings, simple answers, brief explanations): respond naturally with plain text. Do NOT use tables or heavy formatting.
- For **structured information** (comparisons, feature lists, step-by-step processes, data with multiple properties): use well-formatted markdown tables.
- Use headings (### or ##) to organize longer responses into sections.
- Keep paragraphs short (2-3 sentences max).
- Use bullet points for simple lists.
- **Bold** for important terms, *italic* for emphasis.
- \`code\` for actual code references.

### Table Rules (only when appropriate):
- Use clean markdown table syntax with header, separator, and data rows.
- Maximum 6 columns for readability.
- Add blank lines before and after tables.

Always be helpful and match the level of formality to the question. Simple questions get simple answers.`

    const modelMap: Record<string, string> = {
      'minimax-text-01': 'abab6.5s-chat',
    }

    const apiModel = modelMap[model] || model

    const response = await fetch('https://api.minimax.chat/v1/text/chatcompletion_v2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: apiModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 1024,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('MiniMax API Error:', errorText)

      if (response.status === 401) {
        return NextResponse.json(
          { error: 'Invalid MiniMax API key. Please check your API key and try again.' },
          { status: 401 }
        )
      }

      return NextResponse.json(
        { error: `MiniMax API Error: ${response.status}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    const responseContent = data.choices?.[0]?.message?.content

    if (!responseContent) {
      throw new Error('No response content received from MiniMax API')
    }

    return NextResponse.json({
      response: responseContent,
      model: model,
      provider: 'minimax',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('MiniMax Chat API Error:', error)

    if (error instanceof Error) {
      if (error.message.includes('Network error') || error.message.includes('Failed to fetch')) {
        return NextResponse.json(
          { error: 'Network error. Please check your internet connection and try again.' },
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
