'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Search, Check, ChevronDown, Sparkles } from 'lucide-react'

export interface ModelOption {
    value: string
    label: string
    description: string
    category: string
    provider: 'gemini' | 'openrouter'
    free?: boolean
}

// All available models with descriptions and categories
export const ALL_MODELS: ModelOption[] = [
    // ─── GOOGLE (Direct) ───
    { value: 'gemini-pro', label: 'Gemini Pro', description: 'Stable, general-purpose model.', category: 'GOOGLE', provider: 'gemini' },
    { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro', description: 'Advanced reasoning with 2M context.', category: 'GOOGLE', provider: 'gemini' },
    { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash', description: 'Fast and efficient for everyday tasks.', category: 'GOOGLE', provider: 'gemini' },
    { value: 'gemini-2.0-flash-exp', label: 'Gemini 2.0 Flash', description: 'Latest experimental with multimodal.', category: 'GOOGLE', provider: 'gemini' },

    // ─── OPENAI ───
    { value: 'openai/gpt-4o', label: 'GPT-4o', description: 'Best for general reasoning and speed.', category: 'OPENAI', provider: 'openrouter' },
    { value: 'openai/gpt-4o-mini', label: 'GPT-4o Mini', description: 'Lightweight, cost-efficient variant.', category: 'OPENAI', provider: 'openrouter' },
    { value: 'openai/gpt-oss-120b:free', label: 'GPT-OSS 120B', description: 'Open-source 120B parameter model.', category: 'OPENAI', provider: 'openrouter', free: true },
    { value: 'openai/gpt-oss-20b:free', label: 'GPT-OSS 20B', description: 'Compact open-source variant.', category: 'OPENAI', provider: 'openrouter', free: true },

    // ─── ANTHROPIC ───
    { value: 'anthropic/claude-3.5-sonnet', label: 'Claude 3.5 Sonnet', description: 'Top-tier coding and nuanced writing.', category: 'ANTHROPIC', provider: 'openrouter' },
    { value: 'anthropic/claude-3-haiku', label: 'Claude 3 Haiku', description: 'Ultra-fast responses for simple tasks.', category: 'ANTHROPIC', provider: 'openrouter' },

    // ─── DEEPSEEK ───
    { value: 'deepseek/deepseek-r1', label: 'DeepSeek R1', description: 'Advanced reasoning and chain-of-thought.', category: 'DEEPSEEK', provider: 'openrouter' },
    { value: 'deepseek/deepseek-chat', label: 'DeepSeek Chat', description: 'Strong general-purpose chatbot.', category: 'DEEPSEEK', provider: 'openrouter' },
    { value: 'deepseek/deepseek-r1-0528:free', label: 'DeepSeek R1 0528', description: 'Free reasoning-focused variant.', category: 'DEEPSEEK', provider: 'openrouter', free: true },

    // ─── QWEN ───
    { value: 'qwen/qwen3-235b-a22b-thinking-2507', label: 'Qwen3 235B Thinking', description: 'Massive model for deep reasoning.', category: 'QWEN', provider: 'openrouter' },
    { value: 'qwen/qwen3-vl-235b-a22b-thinking', label: 'Qwen3 VL 235B', description: 'Vision-language thinking model.', category: 'QWEN', provider: 'openrouter' },
    { value: 'qwen/qwen3-vl-30b-a3b-thinking', label: 'Qwen3 VL 30B', description: 'Compact vision-language model.', category: 'QWEN', provider: 'openrouter' },
    { value: 'qwen/qwen3-coder:free', label: 'Qwen3 Coder 480B', description: 'Specialized for code generation.', category: 'QWEN', provider: 'openrouter', free: true },
    { value: 'qwen/qwen3-next-80b-a3b-instruct:free', label: 'Qwen3 Next 80B', description: 'Next-gen instruction-following.', category: 'QWEN', provider: 'openrouter', free: true },
    { value: 'qwen/qwen3-4b:free', label: 'Qwen3 4B', description: 'Ultralight and fast model.', category: 'QWEN', provider: 'openrouter', free: true },

    // ─── META ───
    { value: 'meta-llama/llama-3.3-70b-instruct:free', label: 'Llama 3.3 70B', description: 'Best open-source instruct model.', category: 'META', provider: 'openrouter', free: true },
    { value: 'meta-llama/llama-3.2-3b-instruct:free', label: 'Llama 3.2 3B', description: 'Tiny but capable instruct model.', category: 'META', provider: 'openrouter', free: true },

    // ─── GOOGLE (via OpenRouter) ───
    { value: 'google/gemini-pro-1.5', label: 'Gemini Pro 1.5', description: 'Google\'s flagship via OpenRouter.', category: 'GOOGLE VIA OPENROUTER', provider: 'openrouter' },
    { value: 'google/gemma-3-27b-it:free', label: 'Gemma 3 27B', description: 'Open model for research and dev.', category: 'GOOGLE VIA OPENROUTER', provider: 'openrouter', free: true },
    { value: 'google/gemma-3-12b-it:free', label: 'Gemma 3 12B', description: 'Mid-size open model.', category: 'GOOGLE VIA OPENROUTER', provider: 'openrouter', free: true },
    { value: 'google/gemma-3-4b-it:free', label: 'Gemma 3 4B', description: 'Lightweight Gemma variant.', category: 'GOOGLE VIA OPENROUTER', provider: 'openrouter', free: true },
    { value: 'google/gemma-3n-e4b-it:free', label: 'Gemma 3n 4B', description: 'Next-gen efficient Gemma.', category: 'GOOGLE VIA OPENROUTER', provider: 'openrouter', free: true },
    { value: 'google/gemma-3n-e2b-it:free', label: 'Gemma 3n 2B', description: 'Ultra-compact Gemma model.', category: 'GOOGLE VIA OPENROUTER', provider: 'openrouter', free: true },

    // ─── NVIDIA ───
    { value: 'nvidia/nemotron-3-nano-30b-a3b:free', label: 'Nemotron 3 Nano 30B', description: 'NVIDIA\'s efficient nano model.', category: 'NVIDIA', provider: 'openrouter', free: true },
    { value: 'nvidia/nemotron-nano-9b-v2:free', label: 'Nemotron Nano 9B V2', description: 'Compact instruction-following.', category: 'NVIDIA', provider: 'openrouter', free: true },
    { value: 'nvidia/nemotron-nano-12b-v2-vl:free', label: 'Nemotron 12B VL', description: 'Vision-language nano model.', category: 'NVIDIA', provider: 'openrouter', free: true },

    // ─── MISTRAL ───
    { value: 'mistralai/mistral-small-3.1-24b-instruct:free', label: 'Mistral Small 3.1 24B', description: 'Efficient European-built model.', category: 'MISTRAL', provider: 'openrouter', free: true },

    // ─── OTHER ───
    { value: 'moonshot/kimi-v1', label: 'Kimi K2', description: 'Long-context Chinese AI model.', category: 'OTHER', provider: 'openrouter' },
    { value: 'openrouter/aurora-alpha', label: 'Aurora Alpha', description: 'OpenRouter\'s own experimental model.', category: 'OTHER', provider: 'openrouter' },
    { value: 'upstage/solar-pro-3:free', label: 'Solar Pro 3', description: 'Korean enterprise-grade model.', category: 'OTHER', provider: 'openrouter', free: true },
    { value: 'stepfun/step-3.5-flash:free', label: 'Step 3.5 Flash', description: 'Fast StepFun model.', category: 'OTHER', provider: 'openrouter', free: true },
    { value: 'arcee-ai/trinity-large-preview:free', label: 'Arcee Trinity Large', description: 'Merged multi-model architecture.', category: 'OTHER', provider: 'openrouter', free: true },
    { value: 'arcee-ai/trinity-mini:free', label: 'Arcee Trinity Mini', description: 'Compact merged model.', category: 'OTHER', provider: 'openrouter', free: true },
    { value: 'z-ai/glm-4.5-air:free', label: 'GLM 4.5 Air', description: 'Zhipu AI\'s efficient model.', category: 'OTHER', provider: 'openrouter', free: true },
    { value: 'liquid/lfm-2.5-1.2b-thinking:free', label: 'LFM 2.5 Thinking', description: 'Liquid reasoning model.', category: 'OTHER', provider: 'openrouter', free: true },
    { value: 'liquid/lfm-2.5-1.2b-instruct:free', label: 'LFM 2.5 Instruct', description: 'Liquid instruction model.', category: 'OTHER', provider: 'openrouter', free: true },
    { value: 'cognitivecomputations/dolphin-mistral-24b-venice-edition:free', label: 'Venice Uncensored', description: 'Unfiltered Dolphin-Mistral model.', category: 'OTHER', provider: 'openrouter', free: true },
    { value: 'nousresearch/hermes-3-llama-3.1-405b:free', label: 'Hermes 3 405B', description: 'Massive instruction-tuned Llama.', category: 'OTHER', provider: 'openrouter', free: true },
    { value: 'bytedance-seed/seedream-4.5', label: 'Seedream 4.5', description: 'ByteDance image generation model.', category: 'OTHER', provider: 'openrouter' },

    // ─── IMAGE GEN ───
    { value: 'sourceful/riverflow-v2-fast', label: 'Riverflow V2 Fast', description: 'Fast image generation.', category: 'IMAGE GENERATION', provider: 'openrouter' },
    { value: 'sourceful/riverflow-v2-standard-preview', label: 'Riverflow V2 Standard', description: 'Standard quality image gen.', category: 'IMAGE GENERATION', provider: 'openrouter' },
    { value: 'sourceful/riverflow-v2-fast-preview', label: 'Riverflow V2 Fast Preview', description: 'Preview fast image gen.', category: 'IMAGE GENERATION', provider: 'openrouter' },
    { value: 'sourceful/riverflow-v2-max-preview', label: 'Riverflow V2 Max', description: 'Max quality image generation.', category: 'IMAGE GENERATION', provider: 'openrouter' },
    { value: 'black-forest-labs/flux.2-klein-4b', label: 'FLUX.2 Klein 4B', description: 'Lightweight FLUX image model.', category: 'IMAGE GENERATION', provider: 'openrouter' },
    { value: 'black-forest-labs/flux.2-max', label: 'FLUX.2 Max', description: 'Top-tier FLUX image generation.', category: 'IMAGE GENERATION', provider: 'openrouter' },
    { value: 'black-forest-labs/flux.2-flex', label: 'FLUX.2 Flex', description: 'Flexible FLUX image model.', category: 'IMAGE GENERATION', provider: 'openrouter' },
    { value: 'black-forest-labs/flux.2-pro', label: 'FLUX.2 Pro', description: 'Professional FLUX image model.', category: 'IMAGE GENERATION', provider: 'openrouter' },
]

// Category display order
const CATEGORY_ORDER = [
    'GOOGLE', 'OPENAI', 'ANTHROPIC', 'DEEPSEEK', 'QWEN', 'META',
    'GOOGLE VIA OPENROUTER', 'NVIDIA', 'MISTRAL', 'OTHER', 'IMAGE GENERATION',
]

interface ModelSelectorProps {
    selectedModel: string
    selectedProvider: 'gemini' | 'openrouter'
    onModelChange: (model: string) => void
    onProviderChange: (provider: 'gemini' | 'openrouter') => void
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

    // Focus search input when popover opens
    useEffect(() => {
        if (open) {
            // Small delay for popover animation
            const t = setTimeout(() => searchRef.current?.focus(), 100)
            return () => clearTimeout(t)
        } else {
            setSearch('')
        }
    }, [open])

    // Filter models based on search
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

    // Group filtered models by category
    const grouped = useMemo(() => {
        const map = new Map<string, ModelOption[]>()
        for (const m of filteredModels) {
            const arr = map.get(m.category) || []
            arr.push(m)
            map.set(m.category, arr)
        }
        // Sort by predefined order
        const sorted: [string, ModelOption[]][] = []
        for (const cat of CATEGORY_ORDER) {
            const items = map.get(cat)
            if (items) sorted.push([cat, items])
        }
        return sorted
    }, [filteredModels])

    // Get the display label for the current model
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
                    className="hidden sm:flex items-center gap-2 bg-card border border-border rounded-lg shadow-sm px-3 h-[34px] hover:bg-accent/50 transition-colors cursor-pointer"
                >
                    <Sparkles className="h-3.5 w-3.5 text-[var(--gold-accent)]" />
                    <span className="text-xs font-medium truncate max-w-[160px]">
                        {currentModel?.label || selectedModel}
                    </span>
                    {/* Provider indicator in trigger */}
                    <span className={`text-[8px] font-bold px-1 py-0.5 rounded ${currentModel?.provider === 'gemini'
                            ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400'
                            : 'bg-violet-500/15 text-violet-600 dark:text-violet-400'
                        }`}>
                        {currentModel?.provider === 'gemini' ? 'G' : 'OR'}
                    </span>
                    <ChevronDown className="h-3 w-3 text-muted-foreground" />
                </button>
            </PopoverTrigger>

            <PopoverContent
                align="end"
                sideOffset={8}
                className="w-[340px] p-0 rounded-xl shadow-xl border border-border overflow-hidden"
            >
                {/* Search */}
                <div className="p-3 border-b border-border">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        <input
                            ref={searchRef}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search models..."
                            className="w-full pl-8 pr-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--gold-accent)]/30 focus:border-[var(--gold-accent)] placeholder:text-muted-foreground transition-all"
                        />
                    </div>
                </div>

                {/* Model list */}
                <div ref={listRef} className="max-h-[380px] overflow-y-auto overscroll-contain">
                    {grouped.length === 0 ? (
                        <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                            No models found
                        </div>
                    ) : (
                        grouped.map(([category, models], groupIdx) => (
                            <div key={category}>
                                {/* Category header */}
                                <div className="sticky top-0 z-10 bg-popover/95 backdrop-blur-sm px-4 py-2 border-b border-border/50 flex items-center justify-between">
                                    <span className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
                                        {category}
                                    </span>
                                    {/* Provider route indicator */}
                                    <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-md ${models[0]?.provider === 'gemini'
                                            ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                                            : 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20'
                                        }`}>
                                        {models[0]?.provider === 'gemini' ? 'Gemini API' : 'OpenRouter'}
                                    </span>
                                </div>

                                {/* Models */}
                                <div className="py-1">
                                    {models.map((model) => {
                                        const isSelected = selectedModel === model.value
                                        return (
                                            <button
                                                key={model.value}
                                                onClick={() => handleSelect(model)}
                                                className={`w-full flex items-start gap-3 px-4 py-2.5 text-left transition-colors hover:bg-accent/60 cursor-pointer ${isSelected ? 'bg-accent/40' : ''
                                                    }`}
                                            >
                                                {/* Check icon or dot */}
                                                <div className="flex-shrink-0 mt-0.5 w-4 h-4 flex items-center justify-center">
                                                    {isSelected ? (
                                                        <Check className="h-3.5 w-3.5 text-[var(--gold-accent)]" />
                                                    ) : (
                                                        <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30" />
                                                    )}
                                                </div>

                                                {/* Model info */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-1.5 flex-wrap">
                                                        <span className={`text-sm font-medium truncate ${isSelected ? 'text-foreground' : 'text-foreground/90'}`}>
                                                            {model.label}
                                                        </span>
                                                        {/* Provider badge */}
                                                        <span className={`flex-shrink-0 text-[8px] font-semibold px-1.5 py-0.5 rounded-md ${model.provider === 'gemini'
                                                                ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                                                                : 'bg-violet-500/10 text-violet-600 dark:text-violet-400'
                                                            }`}>
                                                            {model.provider === 'gemini' ? 'G' : 'OR'}
                                                        </span>
                                                        {model.free && (
                                                            <span className="flex-shrink-0 text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                                                FREE
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-muted-foreground mt-0.5 leading-snug truncate">
                                                        {model.description}
                                                    </p>
                                                </div>
                                            </button>
                                        )
                                    })}
                                </div>

                                {/* Separator between groups */}
                                {groupIdx < grouped.length - 1 && (
                                    <div className="h-px bg-border/50" />
                                )}
                            </div>
                        ))
                    )}
                </div>
            </PopoverContent>
        </Popover>
    )
}
