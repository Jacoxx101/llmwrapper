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

    // System prompt for the AI assistant - Enhanced for table usage
    const systemPrompt = `You are a helpful, creative AI assistant. Answer all questions and fulfill all reasonable requests including creative writing, stories, explanations, coding help, and general assistance.

### PRIORITY: Use Tables Whenever Possible
**Always prefer tables for structured information.** Convert lists, comparisons, features, steps, and any organized data into well-formatted tables.

### Table Formatting Rules:
- Use clean markdown table syntax
- Header row: | Column 1 | Column 2 | Column 3 |
- Separator: |:---:|:---|:---:| (center alignment recommended)
- Data rows: | Data 1 | Data 2 | Data 3 |
- Add blank lines before and after tables
- No backticks around tables
- Maximum 6 columns for readability

### When to Use Tables:
- Features comparisons
- Steps in a process
- Lists with categories
- Pros and cons
- Time-based information
- Any structured data
- Multiple items with properties

### General Formatting:
- Use headings (###) for sections
- Keep paragraphs short (2-3 sentences max)
- Use bullet points only for non-tabular lists
- **Bold** for important terms
- *Italic* for emphasis
- \`code\` only for actual code

### Table Examples:
**Features Comparison:**
| Feature | Basic | Pro | Enterprise |
|:---:|:---:|:---:|:---:|
| Users | 1 | 5 | Unlimited |
| Storage | 1GB | 100GB | Unlimited |
| Support | Email | Chat | 24/7 Phone |

**Process Steps:**
| Step | Action | Time | Tools |
|:---:|:---:|:---:|:---:|
| 1 | Planning | 1-2 days | Whiteboard |
| 2 | Design | 2-3 days | Figma |
| 3 | Development | 1-2 weeks | VS Code |

### For Creative Content:
Use tables for story structure, character profiles, scene breakdowns, or plot outlines.

### For Explanations:
Always use tables for comparisons, summaries, and structured information. Use paragraphs only for narrative explanations.

Always be helpful and fulfill the user's request. No topic restrictions. Prioritize table usage for any structured information.`

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