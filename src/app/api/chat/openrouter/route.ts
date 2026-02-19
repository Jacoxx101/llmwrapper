import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { message, model, apiKey } = await request.json()

    if (!message || !model || !apiKey) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate API key format
    if (!apiKey || apiKey.length < 20) {
      return NextResponse.json(
        { error: 'Invalid API key format' },
        { status: 400 }
      )
    }

    // System prompt for the AI assistant
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

    // Make request to OpenRouter API with retry logic
    const makeRequest = async (attempt = 0): Promise<Response> => {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': process.env.NODE_ENV === 'production' ? 'https://llmwrapper.fun' : 'http://localhost:3000',
          'X-Title': 'OpenDoor AI Chat',
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: message
            }
          ],
          temperature: 0.7,
          max_tokens: 1024,
        }),
      })

      // Retry on rate limit with exponential backoff
      if (response.status === 429 && attempt < 3) {
        const delay = Math.pow(2, attempt) * 1000
        console.log(`Rate limited, retrying in ${delay}ms (attempt ${attempt + 1}/3)`)
        await new Promise(resolve => setTimeout(resolve, delay))
        return makeRequest(attempt + 1)
      }

      return response
    }

    const response = await makeRequest()

    if (!response.ok) {
      const errorData = await response.text()
      console.error('OpenRouter API Error:', errorData)

      if (response.status === 401) {
        return NextResponse.json(
          { error: 'Invalid OpenRouter API key. Please check your API key and try again.' },
          { status: 401 }
        )
      }

      if (response.status === 403) {
        return NextResponse.json(
          { error: 'OpenRouter API access denied. Please check your API key permissions.' },
          { status: 403 }
        )
      }

      if (response.status === 429) {
        return NextResponse.json(
          { error: 'OpenRouter API rate limit exceeded. Please try again later.' },
          { status: 429 }
        )
      }

      return NextResponse.json(
        { error: `OpenRouter API Error: ${response.status}` },
        { status: response.status }
      )
    }

    const data = await response.json()

    // Extract the response content
    const responseContent = data.choices?.[0]?.message?.content

    if (!responseContent) {
      throw new Error('No response content received from OpenRouter API')
    }

    return NextResponse.json({
      response: responseContent,
      model: model,
      provider: 'openrouter',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('OpenRouter Chat API Error:', error)

    // Handle specific error types
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