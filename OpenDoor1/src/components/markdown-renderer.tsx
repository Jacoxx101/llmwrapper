'use client'

import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'

interface MarkdownRendererProps {
  content: string
}

// Utility function to convert structured content to tables
const convertToTable = (content: string): string => {
  // Detect patterns that would benefit from table conversion
  const lines = content.split('\n')
  let inTable = false
  let tableLines: string[] = []
  let result: string[] = []
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    
    // Detect list items with consistent structure that could be tables
    if (line.match(/^[-*+]\s+\w+:\s+.+/) || line.match(/^\d+\.\s+\w+:\s+.+/)) {
      if (!inTable) {
        // Start a new table
        inTable = true
        tableLines = []
        
        // Extract headers from the first few items
        const headers = extractTableHeaders(lines, i)
        if (headers.length > 1) {
          tableLines.push('| ' + headers.join(' | ') + ' |')
          tableLines.push('| ' + headers.map(() => '---').join(' | ') + ' |')
        }
      }
      
      // Convert list item to table row
      const rowData = extractTableRow(line)
      if (rowData) {
        tableLines.push('| ' + rowData.join(' | ') + ' |')
      }
    } else {
      if (inTable) {
        // End current table
        result.push(...tableLines)
        result.push('')
        inTable = false
        tableLines = []
      }
      result.push(lines[i])
    }
  }
  
  // Handle table still in progress
  if (inTable && tableLines.length > 0) {
    result.push(...tableLines)
  }
  
  return result.join('\n')
}

const extractTableHeaders = (lines: string[], startIndex: number): string[] => {
  const headers = new Set<string>()
  const maxItems = Math.min(5, lines.length - startIndex)
  
  for (let i = 0; i < maxItems; i++) {
    const line = lines[startIndex + i].trim()
    const match = line.match(/^[-*+\d.]\s+([^:]+):\s+(.+)/)
    if (match) {
      headers.add(match[1].trim())
    }
  }
  
  return Array.from(headers)
}

const extractTableRow = (line: string): string[] => {
  const match = line.match(/^[-*+\d.]\s+([^:]+):\s+(.+)/)
  if (match) {
    return [match[1].trim(), match[2].trim()]
  }
  
  // Try to extract key-value pairs from other formats
  const kvMatch = line.match(/^([^:]+):\s*(.+)$/)
  if (kvMatch) {
    return [kvMatch[1].trim(), kvMatch[2].trim()]
  }
  
  return null
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  // Convert content to use more tables where appropriate
  const enhancedContent = convertToTable(content)
  
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkBreaks]}
      components={{
        code({ node, inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '')
          const language = match ? match[1] : ''
          
          return !inline && language ? (
            <div className="code-block">
              <div className="code-header">
                <span className="code-lang">{language}</span>
                <button
                  className="copy-btn"
                  onClick={() => navigator.clipboard.writeText(String(children).replace(/\n$/, ''))}
                >
                  📋
                </button>
              </div>
              <SyntaxHighlighter
                style={tomorrow}
                language={language}
                PreTag="div"
                {...props}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            </div>
          ) : (
            <code className="inline-code" {...props}>
              {children}
            </code>
          )
        },
        blockquote({ children }) {
          return (
            <blockquote className="border-l-4 border-primary pl-4 italic my-4 text-muted-foreground">
              {children}
            </blockquote>
          )
        },
        table({ children }) {
          return (
            <div className="overflow-x-auto my-4">
              <table className="w-full border-collapse border border-border rounded-lg">
                {children}
              </table>
            </div>
          )
        },
        th({ children }) {
          return (
            <th className="border border-border px-4 py-3 bg-muted font-semibold text-foreground text-left">
              {children}
            </th>
          )
        },
        td({ children }) {
          return (
            <td className="border border-border px-4 py-3 text-foreground">
              {children}
            </td>
          )
        },
        h1({ children }) {
          return (
            <h1 className="text-2xl font-bold mb-4 mt-6 text-foreground">
              {children}
            </h1>
          )
        },
        h2({ children }) {
          return (
            <h2 className="text-xl font-semibold mb-3 mt-5 text-foreground">
              {children}
            </h2>
          )
        },
        h3({ children }) {
          return (
            <h3 className="text-lg font-semibold mb-2 mt-4 text-foreground">
              {children}
            </h3>
          )
        },
        h4({ children }) {
          return (
            <h4 className="text-md font-semibold mb-2 mt-3 text-foreground">
              {children}
            </h4>
          )
        },
        h5({ children }) {
          return (
            <h5 className="text-sm font-semibold mb-1 mt-2 text-foreground">
              {children}
            </h5>
          )
        },
        h6({ children }) {
          return (
            <h6 className="text-xs font-semibold mb-1 mt-2 text-foreground">
              {children}
            </h6>
          )
        },
        p({ children }) {
          return (
            <p className="mb-4 leading-relaxed text-foreground">
              {children}
            </p>
          )
        },
        ul({ children }) {
          return (
            <ul className="list-disc list-inside mb-4 ml-6 space-y-1">
              {children}
            </ul>
          )
        },
        ol({ children }) {
          return (
            <ol className="list-decimal list-inside mb-4 ml-6 space-y-1">
              {children}
            </ol>
          )
        },
        li({ children }) {
          return (
            <li className="mb-2">
              {children}
            </li>
          )
        },
        a({ children, href }) {
          return (
            <a 
              href={href} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              {children}
            </a>
          )
        },
        hr() {
          return (
            <hr className="my-6 border-border" />
          )
        },
        // Add custom component for table of contents
        // This will be triggered by [TOC] in the content
        div({ children, ...props }) {
          const className = props.className || ''
          if (className.includes('toc')) {
            return (
              <div className="toc bg-muted p-4 rounded-lg mb-6">
                {children}
              </div>
            )
          }
          return <div {...props}>{children}</div>
        }
      }}
    >
      {enhancedContent}
    </ReactMarkdown>
  )
}