"use client"

import clsx from "clsx"
import MarkdownMessage from "./MarkdownMessage"

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

  return (
    <div className="w-full py-2">
      {/* Header row: avatar + label + timestamp */}
      <div className="flex items-center gap-2.5 mb-2">
        <div
          className={clsx(
            "flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-semibold shrink-0 text-white",
            isAssistant ? "bg-emerald-600" : "bg-sky-600"
          )}
          aria-hidden
        >
          {isAssistant ? "AI" : "You"}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">
            {isAssistant ? (modelName || "AI") : "You"}
          </span>
          {timestamp && (
            <span className="text-xs text-muted-foreground">{timestamp}</span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className={clsx("pl-[38px]", isAssistant && "ai-response-content")}>
        {isAssistant ? (
          <MarkdownMessage content={content} />
        ) : (
          <p className="text-[15px] leading-relaxed text-foreground whitespace-pre-wrap">
            {content}
          </p>
        )}
      </div>
    </div>
  )
}