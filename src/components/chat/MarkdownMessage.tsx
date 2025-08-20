"use client"

import React, { useMemo } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeHighlight from "rehype-highlight"
import "highlight.js/styles/github-dark.css"

type Props = { content: string }

export default function MarkdownMessage({ content }: Props) {
  // Create a deterministic id to anchor the copy button region
  const blockId = useMemo(() => Math.random().toString(36).slice(2), [])

  return (
    <div className="prose prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          pre({ children }) {
            return (
              <div className="relative group">
                <button
                  onClick={() => {
                    const text = (children as any)?.props?.children?.[0] ?? ""
                    navigator.clipboard.writeText(String(text))
                  }}
                  className="absolute right-2 top-2 rounded border border-chat-border px-2 py-1 text-xs opacity-0 transition group-hover:opacity-100"
                >
                  Copy
                </button>
                <pre>{children}</pre>
              </div>
            )
          },
          a({ href, children }) {
            return (
              <a href={href} target="_blank" rel="noreferrer" className="underline hover:opacity-80">
                {children}
              </a>
            )
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}