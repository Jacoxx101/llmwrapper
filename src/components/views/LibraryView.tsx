'use client'

import { useState } from 'react'
import { ImageIcon, X, Download, ExternalLink } from 'lucide-react'
import { AttachedFile } from '@/store/chat-store'

interface LibraryViewProps {
    attachedFiles: AttachedFile[]
    onOpenChat: (chatId: string) => void
}

export default function LibraryView({ attachedFiles, onOpenChat }: LibraryViewProps) {
    const [preview, setPreview] = useState<AttachedFile | null>(null)

    const images = attachedFiles.filter(f => f.type.startsWith('image/'))

    return (
        <div className="h-full overflow-y-auto">
            <div className="max-w-4xl mx-auto px-6 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-semibold text-foreground mb-1">Library</h1>
                    <p className="text-sm text-muted-foreground">
                        {images.length > 0 ? `${images.length} image${images.length !== 1 ? 's' : ''} from your chats` : 'Images from your chats will appear here'}
                    </p>
                </div>

                {images.length === 0 ? (
                    /* Empty State */
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center mb-4">
                            <ImageIcon className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-base font-medium text-foreground mb-2">No images yet</h3>
                        <p className="text-sm text-muted-foreground max-w-xs">
                            Upload images in a chat or ask the AI to describe an image — they'll appear here.
                        </p>
                    </div>
                ) : (
                    /* Image Grid */
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                        {images.map((file) => (
                            <button
                                key={file.id}
                                onClick={() => setPreview(file)}
                                className="group relative aspect-square rounded-xl overflow-hidden border border-border bg-accent hover:border-[var(--gold-accent)]/50 transition-all"
                            >
                                {file.dataUrl ? (
                                    <img
                                        src={file.dataUrl}
                                        alt={file.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-end">
                                    <div className="w-full p-2 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                        <p className="text-white text-[10px] truncate">{file.name}</p>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Full Image Preview Modal */}
            {preview && (
                <div
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={() => setPreview(null)}
                >
                    <div
                        className="relative bg-card rounded-2xl overflow-hidden max-w-3xl w-full max-h-[85vh] shadow-2xl"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                            <span className="text-sm font-medium text-foreground truncate">{preview.name}</span>
                            <div className="flex items-center gap-2">
                                {preview.chatId && (
                                    <button
                                        onClick={() => { onOpenChat(preview.chatId!); setPreview(null) }}
                                        className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                                        title="Open in chat"
                                    >
                                        <ExternalLink className="h-4 w-4" />
                                    </button>
                                )}
                                {preview.dataUrl && (
                                    <a
                                        href={preview.dataUrl}
                                        download={preview.name}
                                        className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                                        title="Download"
                                    >
                                        <Download className="h-4 w-4" />
                                    </a>
                                )}
                                <button
                                    onClick={() => setPreview(null)}
                                    className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                        {/* Image */}
                        {preview.dataUrl && (
                            <img
                                src={preview.dataUrl}
                                alt={preview.name}
                                className="w-full object-contain max-h-[70vh]"
                            />
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
