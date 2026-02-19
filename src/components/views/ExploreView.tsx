'use client'

import { Sparkles, Zap, Search, FileText, Code2, Lightbulb, BarChart2, Globe, BookOpen, Mail, Brain, Pencil } from 'lucide-react'

interface ExploreViewProps {
    onSelectPrompt: (prompt: string) => void
}

interface PromptCard {
    icon: React.ReactNode
    category: string
    title: string
    description: string
    prompt: string
}

const FEATURED_PROMPTS: PromptCard[] = [
    // Creative
    {
        icon: <Pencil className="h-5 w-5" />,
        category: 'Creative',
        title: 'Write a Short Story',
        description: 'Generate a compelling short story with a twist ending.',
        prompt: 'Write a 300-word short story with a surprising twist ending. The genre is up to you.',
    },
    {
        icon: <Sparkles className="h-5 w-5" />,
        category: 'Creative',
        title: 'Brand Tagline Generator',
        description: 'Create 5 punchy taglines for any product or service.',
        prompt: 'Generate 5 creative and memorable taglines for a sustainable tech startup that sells solar-powered backpacks.',
    },
    {
        icon: <Mail className="h-5 w-5" />,
        category: 'Creative',
        title: 'Cold Email Draft',
        description: 'Write a personalized cold outreach email.',
        prompt: 'Write a concise, compelling cold email to a potential client in the SaaS industry offering a product demo. Keep it under 150 words.',
    },
    // Research
    {
        icon: <Search className="h-5 w-5" />,
        category: 'Research',
        title: 'Explain a Concept',
        description: 'Get a clear, structured breakdown of any complex topic.',
        prompt: 'Explain quantum computing in simple terms. Use an analogy, then cover: what it is, how it differs from classical computing, and real-world use cases.',
    },
    {
        icon: <Globe className="h-5 w-5" />,
        category: 'Research',
        title: 'Compare Two Things',
        description: 'Side-by-side comparison of any two topics in a table.',
        prompt: 'Create a detailed comparison table of React vs Vue.js covering: learning curve, performance, ecosystem, job market, and best use cases.',
    },
    {
        icon: <BookOpen className="h-5 w-5" />,
        category: 'Research',
        title: 'Summarize & Key Points',
        description: 'Paste any text and get a structured summary.',
        prompt: 'Summarize the following text into 5 key bullet points, then provide a one-sentence TL;DR:\n\n[Paste your text here]',
    },
    // Technical
    {
        icon: <Code2 className="h-5 w-5" />,
        category: 'Technical',
        title: 'Code Review',
        description: 'Get feedback and improvements for your code.',
        prompt: 'Review the following code for bugs, performance issues, and best practices. Provide specific suggestions:\n\n```\n// Paste your code here\n```',
    },
    {
        icon: <Zap className="h-5 w-5" />,
        category: 'Technical',
        title: 'Debug This Error',
        description: 'Paste an error message and get a fix.',
        prompt: 'Help me debug this error. Explain what caused it and provide a fix:\n\nError: [Paste your error here]\n\nCode context:\n```\n// Paste relevant code\n```',
    },
    {
        icon: <Brain className="h-5 w-5" />,
        category: 'Technical',
        title: 'System Design',
        description: 'Design a scalable system architecture.',
        prompt: 'Design a scalable architecture for a real-time chat application that supports 1 million concurrent users. Cover: database, backend, caching, and deployment strategy.',
    },
    // Productivity
    {
        icon: <BarChart2 className="h-5 w-5" />,
        category: 'Productivity',
        title: 'Meeting Notes → Action Items',
        description: 'Turn raw notes into structured action items.',
        prompt: 'Convert the following meeting notes into: 1) A brief summary, 2) Key decisions made, 3) Action items with owners and deadlines:\n\n[Paste meeting notes here]',
    },
    {
        icon: <FileText className="h-5 w-5" />,
        category: 'Productivity',
        title: 'Weekly Report Draft',
        description: 'Write a professional progress report.',
        prompt: 'Write a professional weekly progress report based on these accomplishments: [List what you did]. Format it with: Summary, Completed tasks, In Progress, Blockers, Next week plan.',
    },
    {
        icon: <Lightbulb className="h-5 w-5" />,
        category: 'Productivity',
        title: 'Brainstorm Ideas',
        description: 'Generate 10 creative ideas on any topic.',
        prompt: 'Brainstorm 10 creative and practical ideas for increasing user engagement in a mobile fitness app. Include a brief rationale for each.',
    },
]

const CATEGORIES = ['All', 'Creative', 'Research', 'Technical', 'Productivity']
const CATEGORY_COLORS: Record<string, string> = {
    Creative: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    Research: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    Technical: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    Productivity: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
}

export default function ExploreView({ onSelectPrompt }: ExploreViewProps) {
    const [activeCategory, setActiveCategory] = useState('All')

    const filtered = activeCategory === 'All'
        ? FEATURED_PROMPTS
        : FEATURED_PROMPTS.filter(p => p.category === activeCategory)

    return (
        <div className="h-full overflow-y-auto">
            <div className="max-w-4xl mx-auto px-6 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-semibold text-foreground mb-1">Explore</h1>
                    <p className="text-sm text-muted-foreground">Featured prompts to get you started</p>
                </div>

                {/* Category Filter */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${activeCategory === cat
                                    ? 'bg-foreground text-background'
                                    : 'bg-accent text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Prompt Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map((card, i) => (
                        <button
                            key={i}
                            onClick={() => onSelectPrompt(card.prompt)}
                            className="text-left p-4 rounded-xl border border-border bg-card hover:bg-accent hover:border-[var(--gold-accent)]/40 transition-all duration-200 group"
                        >
                            <div className="flex items-start gap-3 mb-3">
                                <div className="p-2 rounded-lg bg-background text-muted-foreground group-hover:text-foreground transition-colors">
                                    {card.icon}
                                </div>
                                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full mt-1 ${CATEGORY_COLORS[card.category]}`}>
                                    {card.category}
                                </span>
                            </div>
                            <h3 className="text-sm font-semibold text-foreground mb-1">{card.title}</h3>
                            <p className="text-xs text-muted-foreground leading-relaxed">{card.description}</p>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}

// Need to import useState (not at top since this file uses it)
import { useState } from 'react'
