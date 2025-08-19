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

    // Make request to OpenRouter API
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