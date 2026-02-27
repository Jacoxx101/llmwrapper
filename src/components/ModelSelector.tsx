'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Search, Check, ChevronDown, Sparkles } from 'lucide-react'

export interface ModelOption {
    value: string
    label: string
    description: string
    category: string
    provider: 'gemini' | 'kimi' | 'minimax'
}

export const ALL_MODELS: ModelOption[] = [
    // ─── GOOGLE ───
    { value: 'gemini-2.0-flash-exp', label: 'Gemini 2.0 Flash', description: 'Latest experimental with multimodal', category: 'GOOGLE', provider: 'gemini' },
    { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro', description: 'Advanced reasoning with 2M context', category: 'GOOGLE', provider: 'gemini' },
    { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash', description: 'Fast and efficient for everyday tasks', category: 'GOOGLE', provider: 'gemini' },

    // ─── KIMI ───
    { value: 'kimi-k2.5', label: 'Kimi K2.5', description: 'Latest Kimi model with advanced reasoning', category: 'KIMI', provider: 'kimi' },
    { value: 'kimi-k2', label: 'Kimi K2', description: 'Long-context Chinese AI model', category: 'KIMI', provider: 'kimi' },

    // ─── MINIMAX ───
    { value: 'minimax-text-01', label: 'MiniMax Text 01', description: 'Latest MiniMax text model', category: 'MINIMAX', provider: 'minimax' },
]

const CATEGORY_ORDER = ['GOOGLE', 'KIMI', 'MINIMAX']

interface ModelSelectorProps {
    selectedModel: string
    selectedProvider: 'gemini' | 'kimi' | 'minimax'
    onModelChange: (model: string) => void
    onProviderChange: (provider: 'gemini' | 'kimi' | 'minimax') => void
}

const PROVIDER_LABELS: Record<string, string> = {
    gemini: 'G',
    kimi: 'K',
    minimax: 'M',
}

const PROVIDER_COLORS: Record<string, string> = {
    gemini: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
    kimi: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
    minimax: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
}

export default function ModelSelector({
    selectedModel,
    selectedProvider,
    onModelChange,
    onProviderChange,
}: ModelSelectorProps) {
    const [open, setOpen] = useState(false)
    const [search, setSearch] = useState('')
    const searchRef = useRef<HTMLInputElement>(null)
    const listRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (open) {
            const t = setTimeout(() => searchRef.current?.focus(), 100)
            return () => clearTimeout(t)
        } else {
            setSearch('')
        }
    }, [open])

    const filteredModels = useMemo(() => {
        if (!search.trim()) return ALL_MODELS
        const q = search.toLowerCase()
        return ALL_MODELS.filter(
            (m) =>
                m.label.toLowerCase().includes(q) ||
                m.description.toLowerCase().includes(q) ||
                m.category.toLowerCase().includes(q) ||
                m.value.toLowerCase().includes(q)
        )
    }, [search])

    const grouped = useMemo(() => {
        const map = new Map<string, ModelOption[]>()
        for (const m of filteredModels) {
            const arr = map.get(m.category) || []
            arr.push(m)
            map.set(m.category, arr)
        }
        const sorted: [string, ModelOption[]][] = []
        for (const cat of CATEGORY_ORDER) {
            const items = map.get(cat)
            if (items) sorted.push([cat, items])
        }
        return sorted
    }, [filteredModels])

    const currentModel = ALL_MODELS.find((m) => m.value === selectedModel)

    const handleSelect = (model: ModelOption) => {
        onModelChange(model.value)
        onProviderChange(model.provider)
        setOpen(false)
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button
                    className="flex items-center gap-1.5 bg-card border border-border rounded-md px-2.5 h-7 hover:bg-accent/50 transition-colors cursor-pointer"
                >
                    <Sparkles className="h-3 w-3 text-[var(--gold-accent)]" />
                    <span className="text-xs font-medium truncate max-w-[120px]">
                        {currentModel?.label || selectedModel}
                    </span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${PROVIDER_COLORS[currentModel?.provider || 'gemini']}`}>
                        {PROVIDER_LABELS[currentModel?.provider || 'gemini']}
                    </span>
                    <ChevronDown className="h-3 w-3 text-muted-foreground" />
                </button>
            </PopoverTrigger>

            <PopoverContent
                align="start"
                sideOffset={4}
                className="w-[280px] p-0 rounded-lg shadow-lg border border-border overflow-hidden"
            >
                <div className="p-2 border-b border-border">
                    <div className="relative">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                        <input
                            ref={searchRef}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search models..."
                            className="w-full pl-7 pr-2 py-1.5 text-xs bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--gold-accent)]/30 placeholder:text-muted-foreground"
                        />
                    </div>
                </div>

                <div ref={listRef} className="max-h-[240px] overflow-y-auto">
                    {grouped.length === 0 ? (
                        <div className="px-3 py-4 text-center text-xs text-muted-foreground">
                            No models found
                        </div>
                    ) : (
                        grouped.map(([category, models]) => (
                            <div key={category}>
                                <div className="sticky top-0 z-10 bg-popover/95 px-3 py-1.5 border-b border-border/50">
                                    <span className="text-[9px] font-semibold tracking-wider text-muted-foreground uppercase">
                                        {category}
                                    </span>
                                </div>
                                <div className="py-0.5">
                                    {models.map((model) => {
                                        const isSelected = selectedModel === model.value
                                        return (
                                            <button
                                                key={model.value}
                                                onClick={() => handleSelect(model)}
                                                className={`w-full flex items-center gap-2 px-3 py-1.5 text-left transition-colors hover:bg-accent/50 cursor-pointer ${isSelected ? 'bg-accent/30' : ''}`}
                                            >
                                                {isSelected ? (
                                                    <Check className="h-3 w-3 text-[var(--gold-accent)]" />
                                                ) : (
                                                    <div className="w-3" />
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-xs font-medium truncate">
                                                            {model.label}
                                                        </span>
                                                        <span className={`text-[8px] font-bold px-1 py-0.5 rounded ${PROVIDER_COLORS[model.provider]}`}>
                                                            {PROVIDER_LABELS[model.provider]}
                                                        </span>
                                                    </div>
                                                </div>
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </PopoverContent>
        </Popover>
    )
}
