import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { message, model } = await request.json()

    const apiKey = process.env.GEMINI_API_KEY

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

    // Try different model if the current one fails
    let apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`

    // Fallback for older models
    if (model.includes('2.0')) {
      console.log('Using Gemini 2.0 model:', model)
    } else if (model === 'gemini-pro') {
      apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent`
    }

    console.log('Calling Gemini API:', apiUrl)

    // Call Gemini API directly
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': apiKey
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: systemPrompt + "\n\nUser question: " + message
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
        }
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Gemini API Error Response:', errorText)

      try {
        const errorData = JSON.parse(errorText)
        if (response.status === 400 && errorData.error?.message?.includes('API_KEY_INVALID')) {
          return NextResponse.json(
            { error: 'Invalid API key. Please check your API key and try again.' },
            { status: 401 }
          )
        }
        if (response.status === 403) {
          return NextResponse.json(
            { error: 'API access denied. Please check your API key permissions.' },
            { status: 403 }
          )
        }
        return NextResponse.json(
          { error: `API Error: ${errorData.error?.message || response.status}` },
          { status: response.status }
        )
      } catch (parseError) {
        return NextResponse.json(
          { error: `API Error: ${response.status} - ${errorText}` },
          { status: response.status }
        )
      }
    }

    const data = await response.json()
    console.log('Gemini API Response:', data)

    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('Invalid response from Gemini API')
    }

    const responseContent = data.candidates[0].content.parts[0].text

    return NextResponse.json({
      response: responseContent,
      model: model,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Chat API Error:', error)

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('API_KEY_INVALID') || error.message.includes('Invalid API key')) {
        return NextResponse.json(
          { error: 'Invalid API key. Please check your API key and try again.' },
          { status: 401 }
        )
      }

      if (error.message.includes('access denied') || error.message.includes('403')) {
        return NextResponse.json(
          { error: 'API access denied. Please check your API key permissions.' },
          { status: 403 }
        )
      }

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