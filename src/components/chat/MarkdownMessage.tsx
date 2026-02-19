"use client"

import React, { useMemo } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeHighlight from "rehype-highlight"
import "highlight.js/styles/github-dark.css"

type Props = { content: string }

export default function MarkdownMessage({ content }: Props) {
  const blockId = useMemo(() => Math.random().toString(36).slice(2), [])

  return (
    <div className="markdown-content ai-markdown">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          // Headings render as styled section titles with emoji support
          h1({ children }) {
            return (
              <h1 className="ai-section-title text-lg font-bold mt-5 mb-3 text-foreground flex items-center gap-2">
                {children}
              </h1>
            )
          },
          h2({ children }) {
            return (
              <h2 className="ai-section-title text-base font-semibold mt-5 mb-2.5 text-foreground flex items-center gap-2">
                {children}
              </h2>
            )
          },
          h3({ children }) {
            return (
              <h3 className="ai-section-title text-[15px] font-semibold mt-4 mb-2 text-foreground flex items-center gap-2">
                {children}
              </h3>
            )
          },
          h4({ children }) {
            return (
              <h4 className="text-sm font-semibold mt-3 mb-1.5 text-foreground">
                {children}
              </h4>
            )
          },
          // Paragraphs
          p({ children }) {
            return (
              <p className="text-[15px] leading-relaxed mb-3 text-foreground/90">
                {children}
              </p>
            )
          },
          // Unordered lists with proper bullet styling
          ul({ children }) {
            return (
              <ul className="ai-list space-y-1.5 mb-3 ml-1">
                {children}
              </ul>
            )
          },
          ol({ children }) {
            return (
              <ol className="ai-list-ordered space-y-1.5 mb-3 ml-1">
                {children}
              </ol>
            )
          },
          li({ children }) {
            return (
              <li className="ai-list-item text-[15px] leading-relaxed text-foreground/90 flex items-start gap-2">
                <span className="text-muted-foreground mt-[7px] shrink-0 text-[6px]">●</span>
                <span className="flex-1">{children}</span>
              </li>
            )
          },
          // Strong / bold text
          strong({ children }) {
            return (
              <strong className="font-semibold text-foreground">{children}</strong>
            )
          },
          // Tables
          table({ children }) {
            return (
              <div className="w-full overflow-x-auto my-3 rounded-lg border border-border">
                <table className="min-w-full">{children}</table>
              </div>
            )
          },
          // Code blocks with copy button
          pre({ children }) {
            return (
              <div className="relative group w-full overflow-x-auto my-3">
                <button
                  onClick={() => {
                    const text = (children as any)?.props?.children?.[0] ?? ""
                    navigator.clipboard.writeText(String(text))
                  }}
                  className="absolute right-2 top-2 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-white/60 opacity-0 transition hover:bg-white/10 group-hover:opacity-100"
                >
                  Copy
                </button>
                <pre className="!bg-[#0f1116] !border !border-[#2a2d36] rounded-lg">{children}</pre>
              </div>
            )
          },
          // Links
          a({ href, children }) {
            return (
              <a href={href} target="_blank" rel="noreferrer" className="text-sky-400 underline underline-offset-2 hover:text-sky-300 transition-colors">
                {children}
              </a>
            )
          },
          // Blockquotes as callout cards
          blockquote({ children }) {
            return (
              <blockquote className="ai-callout-card my-3 pl-4 py-2 border-l-3 border-amber-500/60 bg-amber-500/5 rounded-r-lg">
                {children}
              </blockquote>
            )
          },
          // Horizontal rules as subtle dividers
          hr() {
            return <hr className="my-4 border-border/50" />
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}