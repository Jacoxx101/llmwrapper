"use client"

import clsx from "clsx"
import MarkdownMessage from "./MarkdownMessage"

export type Role = "assistant" | "user"
export type Message = { id: string; role: Role; content: string }

export default function ChatMessage({ role, content }: Message) {
  const isAssistant = role === "assistant"

  return (
    <div
      className={clsx(
        "w-full border rounded-xl px-4 py-3 overflow-visible",
        "border-chat-border",
        isAssistant ? "bg-chat-panel" : "bg-chat-user"
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={clsx(
            "flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-semibold",
            isAssistant ? "bg-emerald-600/90" : "bg-sky-600/90"
          )}
          aria-hidden
        >
          {isAssistant ? "AI" : "You"}
        </div>

        <div className="min-w-0 flex-1">
          <MarkdownMessage content={content} />
        </div>
      </div>
    </div>
  )
}