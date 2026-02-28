"use client"

import { useState } from "react"
import clsx from "clsx"
import MarkdownMessage from "./MarkdownMessage"
import { Copy, Check } from "lucide-react"

export type Role = "assistant" | "user"
export type Message = {
  id: string
  role: Role
  content: string
  modelName?: string
  timestamp?: string
}

export default function ChatMessage({ role, content, modelName, timestamp }: Message) {
  const isAssistant = role === "assistant"
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex w-full py-2">
      <div className={clsx(
        "max-w-[75%] mx-auto rounded-2xl px-5 py-3",
        isAssistant 
          ? "bg-muted/50" 
          : "bg-primary text-primary-foreground"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between gap-3 mb-1.5">
          <div className="flex items-center gap-2">
            <span className={clsx(
              "text-xs font-medium",
              isAssistant ? "text-muted-foreground" : "text-primary-foreground/70"
            )}>
              {isAssistant ? (modelName || "AI") : "You"}
            </span>
          </div>
          <button
            onClick={handleCopy}
            className={clsx(
              "p-1.5 rounded-md transition-colors hover:bg-black/5 dark:hover:bg-white/10",
              isAssistant ? "text-muted-foreground hover:text-foreground" : "text-primary-foreground/70 hover:text-primary-foreground"
            )}
            title="Copy"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
        </div>

        {/* Content */}
        <div className={isAssistant ? "ai-response-content" : ""}>
          {isAssistant ? (
            <MarkdownMessage content={content} />
          ) : (
            <p className="text-[15px] leading-relaxed whitespace-pre-wrap">
              {content}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
