'use client'

import { MessageSquare, Trash2, Clock } from 'lucide-react'
import { formatDate } from '@/lib/date-utils'

interface Chat {
    id: string
    title: string
    messages: { id: string; content: string; role: 'user' | 'assistant'; createdAt: Date }[]
    createdAt: Date
    updatedAt: Date
}

interface HistoryViewProps {
    chats: Chat[]
    currentChatId: string | null
    onSelectChat: (chatId: string) => void
    onDeleteChat: (chatId: string) => void
}

function groupByDate(chats: Chat[]) {
    const now = Date.now()
    const oneDay = 86_400_000
    const groups: { label: string; items: Chat[] }[] = [
        { label: 'Today', items: [] },
        { label: 'Yesterday', items: [] },
        { label: 'Previous 7 days', items: [] },
        { label: 'Older', items: [] },
    ]
    for (const chat of chats) {
        const age = now - new Date(chat.updatedAt).getTime()
        if (age < oneDay) groups[0].items.push(chat)
        else if (age < 2 * oneDay) groups[1].items.push(chat)
        else if (age < 7 * oneDay) groups[2].items.push(chat)
        else groups[3].items.push(chat)
    }
    return groups.filter(g => g.items.length > 0)
}

export default function HistoryView({ chats, currentChatId, onSelectChat, onDeleteChat }: HistoryViewProps) {
    const grouped = groupByDate(chats)

    return (
        <div className="h-full overflow-y-auto">
            <div className="max-w-3xl mx-auto px-6 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-semibold text-foreground mb-1">History</h1>
                    <p className="text-sm text-muted-foreground">
                        {chats.length > 0 ? `${chats.length} conversation${chats.length !== 1 ? 's' : ''}` : 'Your conversations will appear here'}
                    </p>
                </div>

                {chats.length === 0 ? (
                    /* Empty State */
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center mb-4">
                            <Clock className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-base font-medium text-foreground mb-2">No conversations yet</h3>
                        <p className="text-sm text-muted-foreground max-w-xs">
                            Start a new chat and your history will appear here.
                        </p>
                    </div>
                ) : (
                    /* Chat Groups */
                    <div className="space-y-8">
                        {grouped.map((group) => (
                            <div key={group.label}>
                                <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                                    {group.label}
                                </h2>
                                <div className="space-y-2">
                                    {group.items.map((chat) => {
                                        const firstUserMsg = chat.messages.find(m => m.role === 'user')
                                        const msgCount = chat.messages.length
                                        const isActive = chat.id === currentChatId

                                        return (
                                            <button
                                                key={chat.id}
                                                onClick={() => onSelectChat(chat.id)}
                                                className={`w-full text-left p-4 rounded-xl border transition-all group flex items-start gap-3 ${isActive
                                                        ? 'border-[var(--gold-accent)]/50 bg-[var(--gold-accent-light)]'
                                                        : 'border-border bg-card hover:bg-accent'
                                                    }`}
                                            >
                                                {/* Icon */}
                                                <div className="p-2 rounded-lg bg-background flex-shrink-0 mt-0.5">
                                                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                                                </div>

                                                {/* Content */}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-foreground truncate mb-1">{chat.title}</p>
                                                    {firstUserMsg && (
                                                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                                            {firstUserMsg.content}
                                                        </p>
                                                    )}
                                                    <div className="flex items-center gap-3 mt-2">
                                                        <span className="text-[10px] text-muted-foreground">
                                                            {msgCount} message{msgCount !== 1 ? 's' : ''}
                                                        </span>
                                                        <span className="text-[10px] text-muted-foreground">
                                                            {formatDate(new Date(chat.updatedAt))}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Delete */}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        if (confirm('Delete this chat?')) onDeleteChat(chat.id)
                                                    }}
                                                    className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-background text-muted-foreground hover:text-destructive transition-all flex-shrink-0"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
