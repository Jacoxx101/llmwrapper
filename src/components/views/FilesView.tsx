'use client'

import { FolderOpen, File as FileIcon, FileText, FileCode, ExternalLink, Trash2 } from 'lucide-react'
import { AttachedFile } from '@/store/chat-store'
import { formatDate } from '@/lib/date-utils'

interface FilesViewProps {
    attachedFiles: AttachedFile[]
    onOpenChat: (chatId: string) => void
    onRemoveFile: (fileId: string) => void
}

function getFileIcon(type: string) {
    if (type.includes('pdf') || type.includes('text')) return <FileText className="h-5 w-5 text-red-500" />
    if (type.includes('javascript') || type.includes('typescript') || type.includes('json') || type.includes('html') || type.includes('css'))
        return <FileCode className="h-5 w-5 text-blue-500" />
    return <FileIcon className="h-5 w-5 text-muted-foreground" />
}

function formatSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function FilesView({ attachedFiles, onOpenChat, onRemoveFile }: FilesViewProps) {
    const docs = attachedFiles.filter(f => !f.type.startsWith('image/'))

    return (
        <div className="h-full overflow-y-auto">
            <div className="max-w-3xl mx-auto px-6 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-semibold text-foreground mb-1">Files</h1>
                    <p className="text-sm text-muted-foreground">
                        {docs.length > 0 ? `${docs.length} document${docs.length !== 1 ? 's' : ''} from your chats` : 'Documents uploaded in chats will appear here'}
                    </p>
                </div>

                {docs.length === 0 ? (
                    /* Empty State */
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center mb-4">
                            <FolderOpen className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-base font-medium text-foreground mb-2">No files yet</h3>
                        <p className="text-sm text-muted-foreground max-w-xs">
                            Attach documents in a chat using the paperclip icon — they'll be listed here.
                        </p>
                    </div>
                ) : (
                    /* Files List */
                    <div className="space-y-2">
                        {docs.map((file) => (
                            <div
                                key={file.id}
                                className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:bg-accent transition-all group"
                            >
                                {/* Icon */}
                                <div className="p-2 rounded-lg bg-background flex-shrink-0">
                                    {getFileIcon(file.type)}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {formatSize(file.size)} · {formatDate(file.attachedAt)}
                                    </p>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {file.chatId && (
                                        <button
                                            onClick={() => onOpenChat(file.chatId!)}
                                            className="p-1.5 rounded-lg hover:bg-background text-muted-foreground hover:text-foreground transition-colors"
                                            title="Open in chat"
                                        >
                                            <ExternalLink className="h-3.5 w-3.5" />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => onRemoveFile(file.id)}
                                        className="p-1.5 rounded-lg hover:bg-background text-muted-foreground hover:text-destructive transition-colors"
                                        title="Remove"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
