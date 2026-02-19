'use client'

import { useEffect, useRef, useState, useMemo } from 'react'
import { useChatStore } from '@/store/chat-store'
import type { AttachedFile } from '@/store/chat-store'
import ChatMessage from '@/components/chat/ChatMessage'
import TypingDots from '@/components/chat/TypingDots'
import { formatDate } from '@/lib/date-utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import ModelSelector, { ALL_MODELS } from '@/components/ModelSelector'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useTheme } from 'next-themes'
import {
  MessageSquare, Menu, Plus, Search, MoreVertical, Settings, X, Key,
  Upload, File as FileIcon, Image as ImageIcon, LogOut, User,
  Compass, BookOpen, FolderOpen, Clock, Sparkles, Paperclip, RotateCcw,
  Zap, CheckCircle, MoreHorizontal, Link2, Download, PanelLeftClose, PanelLeftOpen
} from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { useAuth } from '@/contexts/SupabaseAuthContext'
import { AuthModal } from '@/components/auth/AuthModal'
import ExploreView from '@/components/views/ExploreView'
import LibraryView from '@/components/views/LibraryView'
import FilesView from '@/components/views/FilesView'
import HistoryView from '@/components/views/HistoryView'

type ActiveView = 'home' | 'chat' | 'explore' | 'library' | 'files' | 'history'

// ── Helper: group chats by time category ────────────────────
function groupChatsByTime(chats: { id: string; title: string; updatedAt: Date }[]) {
  const now = Date.now()
  const oneDay = 86_400_000
  const groups: { label: string; items: typeof chats }[] = [
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

export default function Home() {
  const { user, logout } = useAuth()

  const {
    currentChatId,
    messages,
    isLoading,
    chats,
    attachedFiles: storedFiles,
    apiKey,
    openRouterApiKey,
    selectedModel,
    selectedProvider,
    isDarkMode,
    isSidebarVisible,
    isSidebarCollapsed,
    setCurrentChatId,
    addMessage,
    setLoading,
    createNewChat,
    updateChatTitle,
    deleteChat,
    loadChat,
    setApiKey,
    setOpenRouterApiKey,
    setSelectedModel,
    setSelectedProvider,
    toggleTheme,
    toggleSidebar,
    toggleSidebarSize,
    clearMessages,
    addAttachedFile,
    removeAttachedFile,
  } = useChatStore()

  const [activeView, setActiveView] = useState<ActiveView>('home')

  const { theme, setTheme } = useTheme()
  const [inputMessage, setInputMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showApiModal, setShowApiModal] = useState(false)
  const [showOpenRouterModal, setShowOpenRouterModal] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [tempApiKey, setTempApiKey] = useState('')
  const [tempOpenRouterApiKey, setTempOpenRouterApiKey] = useState('')
  const [showChatMenu, setShowChatMenu] = useState<string | null>(null)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const isUploadingRef = useRef(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isHomePage = messages.length === 0

  // Initialize theme
  useEffect(() => {
    setTheme(isDarkMode ? 'dark' : 'light')
  }, [isDarkMode, setTheme])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Initialize API keys from store
  useEffect(() => {
    setTempApiKey(apiKey)
    setTempOpenRouterApiKey(openRouterApiKey)
  }, [apiKey, openRouterApiKey])

  // Update model when provider changes
  useEffect(() => {
    if (selectedProvider === 'gemini' && !selectedModel.startsWith('gemini')) {
      setSelectedModel('gemini-2.0-flash-exp')
    } else if (selectedProvider === 'openrouter' && !selectedModel.includes('/')) {
      setSelectedModel('openai/gpt-4o')
    }
  }, [selectedProvider, selectedModel, setSelectedModel])

  // Handle theme toggle
  const handleThemeToggle = () => { toggleTheme() }

  // Handle sending message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputMessage.trim() || isLoading) return

    if (selectedProvider === 'gemini' && !apiKey) {
      alert('Please configure your Gemini API key first')
      return
    }
    if (selectedProvider === 'openrouter' && !openRouterApiKey) {
      alert('Please configure your OpenRouter API key first')
      return
    }

    const userMessage = inputMessage.trim()
    setInputMessage('')

    addMessage({ content: userMessage, role: 'user' })

    if (!currentChatId) { createNewChat() }

    await new Promise(resolve => setTimeout(resolve, 100))
    setLoading(true)

    try {
      let response
      if (selectedProvider === 'gemini') {
        response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: userMessage, model: selectedModel, apiKey }),
        })
      } else {
        response = await fetch('/api/chat/openrouter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: userMessage, model: selectedModel, apiKey: openRouterApiKey }),
        })
      }

      if (!response.ok) {
        const errorData = await response.json()
        if (response.status === 429) {
          addMessage({ content: `⏳ Rate limited. Please wait 30-60 seconds.`, role: 'assistant' })
          setLoading(false)
          return
        }
        throw new Error(errorData.error || 'Failed to get response')
      }

      const data = await response.json()
      addMessage({ content: data.response, role: 'assistant' })
    } catch (error) {
      console.error('Chat error:', error)
      addMessage({ content: `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`, role: 'assistant' })
    } finally {
      setLoading(false)
    }
  }

  const handleNewChat = () => { createNewChat(); clearMessages(); setActiveView('chat') }
  const handleGoHome = () => { setCurrentChatId(null); clearMessages(); setActiveView('home') }
  const handleSelectChat = (chatId: string) => { loadChat(chatId); setShowChatMenu(null); setActiveView('chat') }
  const handleDeleteChat = (chatId: string) => { if (confirm('Delete this chat?')) { deleteChat(chatId); setShowChatMenu(null) } }
  const handleRenameChat = (chatId: string) => {
    const chat = chats.find(c => c.id === chatId)
    if (!chat) return
    const newTitle = prompt('Rename chat:', chat.title)
    if (newTitle && newTitle.trim()) { updateChatTitle(chatId, newTitle.trim()) }
    setShowChatMenu(null)
  }

  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const filteredChats = chats.filter(chat =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const groupedChats = useMemo(() => {
    if (!isMounted) return []
    return groupChatsByTime(filteredChats)
  }, [filteredChats, isMounted])

  const handleSaveApiKey = () => { setApiKey(tempApiKey); setShowApiModal(false) }
  const handleSaveOpenRouterApiKey = () => { setOpenRouterApiKey(tempOpenRouterApiKey); setShowOpenRouterModal(false) }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        const searchInput = document.getElementById('search-input') as HTMLInputElement
        searchInput?.focus()
      }
      if (e.key === 'Escape') { setShowChatMenu(null) }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Auto-resize textarea
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputMessage(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
  }

  // File handling
  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return
    const firstFile = files[0]
    setUploadedFiles(prev => {
      const exists = prev.some(f => f.name === firstFile.name && f.size === firstFile.size)
      if (exists) return prev
      return [...prev, firstFile]
    })
    // Read file and persist to store for Library/Files views
    const reader = new FileReader()
    reader.onload = (e) => {
      const dataUrl = firstFile.type.startsWith('image/') ? (e.target?.result as string) : undefined
      const af: AttachedFile = {
        id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        name: firstFile.name,
        size: firstFile.size,
        type: firstFile.type,
        chatId: currentChatId,
        attachedAt: new Date(),
        dataUrl,
      }
      addAttachedFile(af)
    }
    if (firstFile.type.startsWith('image/')) {
      reader.readAsDataURL(firstFile)
    } else {
      reader.readAsText(firstFile)
    }
  }

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true) }
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false) }
  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); handleFileUpload(e.dataTransfer.files) }
  const removeFile = (index: number) => { setUploadedFiles(prev => prev.filter((_, i) => i !== index)) }

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <ImageIcon className="h-4 w-4" />
    return <FileIcon className="h-4 w-4" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Get user display name
  const userName = user?.user_metadata?.full_name || user?.user_metadata?.name || 'User'
  const userEmail = user?.email || ''
  const userInitial = (userName || userEmail || 'U')[0].toUpperCase()

  // ─── Input disabled check ─────────────────
  const inputDisabled =
    (selectedProvider === 'gemini' && !apiKey) ||
    (selectedProvider === 'openrouter' && !openRouterApiKey) ||
    isLoading

  const inputPlaceholder =
    (selectedProvider === 'gemini' && apiKey) || (selectedProvider === 'openrouter' && openRouterApiKey)
      ? 'Ask me anything...'
      : `Configure ${selectedProvider === 'gemini' ? 'Gemini' : 'OpenRouter'} API key first`

  // ─── Render shared input bar ───────────────
  const renderInputBar = (isHome: boolean) => (
    <div className={isHome ? 'home-input-bar' : 'flex items-center gap-2.5 bg-card border border-border rounded-[14px] px-4 py-1.5 shadow-[0_4px_16px_rgba(0,0,0,0.08),0_2px_4px_rgba(0,0,0,0.04)] transition-all duration-200 focus-within:border-[var(--gold-accent)] focus-within:shadow-[0_0_0_3px_var(--gold-accent-light),0_4px_16px_rgba(0,0,0,0.08)]'}>
      <div className="flex items-center gap-2.5 w-full">
        {/* File Upload */}
        <input
          ref={fileInputRef}
          type="file"
          multiple={false}
          className="hidden"
          onChange={(e) => { if (e.target.files && e.target.files.length > 0) { handleFileUpload(e.target.files); e.target.value = '' } }}
          accept="*/*"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex-shrink-0 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          title="Attach file"
        >
          <Paperclip className="h-4 w-4" />
        </button>

        <form onSubmit={handleSendMessage} className="flex-1 flex items-center gap-2">
          <Textarea
            ref={inputRef}
            value={inputMessage}
            onChange={handleTextareaChange}
            placeholder={inputPlaceholder}
            disabled={inputDisabled}
            className="min-h-[34px] max-h-[120px] resize-none border-0 shadow-none focus-visible:ring-0 bg-transparent text-sm placeholder:text-muted-foreground"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(e) }
            }}
          />

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              type="button"
              onClick={() => setShowApiModal(true)}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              title="Settings"
            >
              <Settings className="h-4 w-4" />
            </button>

            <Button
              type="submit"
              disabled={
                (!inputMessage.trim() && uploadedFiles.length === 0) ||
                (selectedProvider === 'gemini' && !apiKey) ||
                (selectedProvider === 'openrouter' && !openRouterApiKey) ||
                isLoading
              }
              className="h-[34px] w-[34px] p-0 rounded-full bg-foreground text-background hover:bg-foreground/90 disabled:opacity-30"
            >
              <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path d="m5 12 14 0M12 5l7 7-7 7" />
              </svg>
            </Button>
          </div>
        </form>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Gemini API Key Modal */}
      <Dialog open={showApiModal} onOpenChange={setShowApiModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>API Configuration</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="apiKey">Gemini API Key</Label>
              <Input
                id="apiKey"
                type="password"
                value={tempApiKey}
                onChange={(e) => setTempApiKey(e.target.value)}
                placeholder="Enter your API key"
                className="mt-1"
              />
              <p className="text-sm text-muted-foreground mt-2">
                Get your API key from{' '}
                <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  Google AI Studio
                </a>
              </p>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowApiModal(false)}>Cancel</Button>
              <Button onClick={handleSaveApiKey}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* OpenRouter API Key Modal */}
      <Dialog open={showOpenRouterModal} onOpenChange={setShowOpenRouterModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>OpenRouter API Configuration</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="openRouterApiKey">OpenRouter API Key</Label>
              <Input
                id="openRouterApiKey"
                type="password"
                value={tempOpenRouterApiKey}
                onChange={(e) => setTempOpenRouterApiKey(e.target.value)}
                placeholder="Enter your OpenRouter API key"
                className="mt-1"
              />
              <p className="text-sm text-muted-foreground mt-2">
                Get your API key from{' '}
                <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  OpenRouter
                </a>
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Supports: ChatGPT, Claude, DeepSeek, Kimi K2, and more
              </p>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowOpenRouterModal(false)}>Cancel</Button>
              <Button onClick={handleSaveOpenRouterApiKey}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ═══════════════ SIDEBAR ═══════════════ */}
      <aside className={`bg-sidebar border-r border-border transition-all duration-300 ${isSidebarVisible ? 'translate-x-0' : '-translate-x-full'} ${isSidebarCollapsed ? 'w-16' : 'w-[260px]'} fixed md:relative h-full z-50 flex flex-col`}>

        {/* Sidebar Top: Logo + Collapse */}
        <div className="flex items-center justify-between px-4 h-[54px] border-b border-border flex-shrink-0">
          {!isSidebarCollapsed && (
            <button onClick={handleGoHome} className="flex items-center gap-2 text-foreground">
              <Sparkles className="h-4.5 w-4.5 text-[var(--gold-accent)]" />
              <span className="text-base font-semibold tracking-tight" style={{ fontFamily: "'Instrument Serif', serif" }}>
                llmwrapper
              </span>
              <span className="pro-badge text-[8px]" style={{ marginLeft: '2px' }}>PRO</span>
            </button>
          )}
          <button
            onClick={toggleSidebarSize}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            {isSidebarCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </button>
        </div>

        {!isSidebarCollapsed && (
          <>
            {/* New Chat Button */}
            <div className="px-3 pt-3 pb-1 flex-shrink-0">
              <button onClick={handleNewChat} className="new-chat-btn">
                <Plus className="h-4 w-4" />
                New chat
              </button>
            </div>

            {/* Search */}
            <div className="px-3 pt-2 pb-1 flex-shrink-0">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  id="search-input"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-8 py-1.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--gold-accent)]/30 placeholder:text-muted-foreground transition-all"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground bg-accent px-1 py-0.5 rounded font-mono">⌘K</span>
              </div>
            </div>

            {/* Nav Links */}
            <nav className="px-3 pt-2 pb-1 flex-shrink-0 space-y-0.5">
              <button
                className={`sidebar-nav-link ${activeView === 'explore' ? 'bg-accent text-foreground' : ''}`}
                onClick={() => setActiveView('explore')}
              >
                <Compass className="h-[18px] w-[18px]" />
                <span>Explore</span>
              </button>
              <button
                className={`sidebar-nav-link ${activeView === 'library' ? 'bg-accent text-foreground' : ''}`}
                onClick={() => setActiveView('library')}
              >
                <BookOpen className="h-[18px] w-[18px]" />
                <span>Library</span>
              </button>
              <button
                className={`sidebar-nav-link ${activeView === 'files' ? 'bg-accent text-foreground' : ''}`}
                onClick={() => setActiveView('files')}
              >
                <FolderOpen className="h-[18px] w-[18px]" />
                <span>Files</span>
              </button>
              <button
                className={`sidebar-nav-link ${activeView === 'history' ? 'bg-accent text-foreground' : ''}`}
                onClick={() => setActiveView('history')}
              >
                <Clock className="h-[18px] w-[18px]" />
                <span>History</span>
              </button>
            </nav>

            {/* Divider */}
            <div className="mx-3 my-2 h-px bg-border" />

            {/* Chat History grouped by time */}
            <div className="flex-1 overflow-y-auto px-2">
              {groupedChats.map((group) => (
                <div key={group.label}>
                  <div className="sidebar-section-label">{group.label}</div>
                  {group.items.map((chat) => (
                    <div key={chat.id} className="relative group">
                      <button
                        onClick={() => handleSelectChat(chat.id)}
                        className={`sidebar-chat-item ${currentChatId === chat.id ? 'active' : ''}`}
                      >
                        {chat.title}
                      </button>
                      <button
                        onClick={() => setShowChatMenu(showChatMenu === chat.id ? null : chat.id)}
                        className="absolute right-1 top-1/2 -translate-y-1/2 p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-accent text-muted-foreground hover:text-foreground transition-all"
                      >
                        <MoreVertical className="h-3 w-3" />
                      </button>

                      {/* Context Menu */}
                      {showChatMenu === chat.id && (
                        <div className="absolute right-0 top-full mt-1 bg-popover border border-border rounded-md shadow-lg z-10 min-w-[120px]">
                          <button onClick={() => handleRenameChat(chat.id)} className="w-full text-left px-3 py-2 text-sm hover:bg-accent">
                            Rename
                          </button>
                          <button onClick={() => handleDeleteChat(chat.id)} className="w-full text-left px-3 py-2 text-sm hover:bg-accent text-destructive">
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* User Profile Card at bottom */}
            <div className="user-profile-card flex-shrink-0">
              {user ? (
                <>
                  <div className="avatar">{userInitial}</div>
                  <div className="user-info">
                    <div className="user-name">{userName}</div>
                    <div className="user-email">{userEmail}</div>
                  </div>
                  <button
                    onClick={logout}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-accent transition-colors"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="flex items-center gap-2 text-sm font-medium text-foreground hover:bg-accent rounded-lg px-2 py-1 transition-colors w-full"
                >
                  <User className="h-4 w-4" />
                  <span>Sign In</span>
                </button>
              )}
            </div>
          </>
        )}
      </aside>

      {/* ═══════════════ MAIN CONTENT ═══════════════ */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Header */}
        <header className="bg-background/85 backdrop-blur-lg border-b border-border h-[54px] flex-shrink-0 z-10">
          <div className="flex items-center justify-between px-5 h-full">
            {/* Left: Model selector */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleSidebar}
                className="md:hidden p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                <Menu className="h-4 w-4" />
              </button>

              <ModelSelector
                selectedModel={selectedModel}
                selectedProvider={selectedProvider}
                onModelChange={setSelectedModel}
                onProviderChange={setSelectedProvider}
              />
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-1.5">
              <ThemeToggle />
              <Button
                variant={apiKey ? "default" : "outline"}
                size="sm"
                onClick={() => setShowApiModal(true)}
                className="h-[32px] text-xs rounded-lg shadow-sm"
              >
                <Key className="h-3.5 w-3.5 mr-1" />
                {apiKey ? '✓' : 'Gemini'}
              </Button>

              <Button
                variant={openRouterApiKey ? "default" : "outline"}
                size="sm"
                onClick={() => setShowOpenRouterModal(true)}
                className="h-[32px] text-xs rounded-lg shadow-sm"
              >
                <Key className="h-3.5 w-3.5 mr-1" />
                {openRouterApiKey ? '✓' : 'Router'}
              </Button>
            </div>
          </div>
        </header>

        {/* ═══════════════ BODY ═══════════════ */}
        <div className="flex-1 overflow-hidden relative flex flex-col">
          <div className="flex-1 overflow-y-auto">
            {activeView === 'explore' && (
              <ExploreView onSelectPrompt={(prompt) => { setInputMessage(prompt); setActiveView('home') }} />
            )}
            {activeView === 'library' && (
              <LibraryView attachedFiles={storedFiles} onOpenChat={handleSelectChat} />
            )}
            {activeView === 'files' && (
              <FilesView
                attachedFiles={storedFiles}
                onOpenChat={handleSelectChat}
                onRemoveFile={removeAttachedFile}
              />
            )}
            {activeView === 'history' && (
              <HistoryView
                chats={chats}
                currentChatId={currentChatId}
                onSelectChat={handleSelectChat}
                onDeleteChat={handleDeleteChat}
              />
            )}

            {(activeView === 'home' || activeView === 'chat') && (
              <>
                {activeView === 'home' ? (
                  /* ── HOME SCREEN ── */
                  <div className="flex flex-col items-center justify-center h-full text-center px-4 py-12">
                    <div className="hero-orb mb-10" />
                    <p className="greeting-muted mb-2">Hello, {user ? userName : 'there'}</p>
                    <h1 className="greeting-bold mb-10">How can I assist you today?</h1>

                    <div className="w-full max-w-[600px] mb-8">
                      {uploadedFiles.length > 0 && (
                        <div className="mb-3 p-3 bg-card rounded-xl border border-border">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <FileIcon className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm font-medium">{uploadedFiles.length} files attached</span>
                            </div>
                            <button onClick={() => setUploadedFiles([])} className="p-1 rounded hover:bg-accent"><X className="h-3 w-3" /></button>
                          </div>
                          <div className="space-y-1">
                            {uploadedFiles.map((file, i) => (
                              <div key={i} className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2 truncate">
                                  {getFileIcon(file)}
                                  <span className="truncate">{file.name}</span>
                                </div>
                                <button onClick={() => removeFile(i)} className="p-1"><X className="h-3 w-3" /></button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {renderInputBar(true)}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-[640px]">
                      <button className="suggestion-card" onClick={() => setInputMessage('Compare Python vs JavaScript in a table')}>
                        <RotateCcw className="card-icon" />
                        <span className="card-title">Compare</span>
                      </button>
                      <button className="suggestion-card" onClick={() => setInputMessage('Learning path for web development')}>
                        <Zap className="card-icon" />
                        <span className="card-title">Learning</span>
                      </button>
                      <button className="suggestion-card" onClick={() => setInputMessage('Current AI trends')}>
                        <CheckCircle className="card-icon" />
                        <span className="card-title">Trends</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* ── CHAT VIEW ── */
                  <div className="max-w-[720px] mx-auto px-4 pt-4 pb-24">
                    {messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-muted-foreground mt-24">
                        <Sparkles className="h-12 w-12 mb-4 opacity-10" />
                        <p className="text-sm">Start a new conversation</p>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-6">
                          {messages.map((m) => (
                            <ChatMessage key={m.id} {...m} />
                          ))}
                          {isLoading && <TypingDots />}
                        </div>
                        <div ref={messagesEndRef} />
                      </>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {/* ═══════════════ CHAT INPUT BAR (Bottom, only in chat view) ═══════════════ */}
          {activeView === 'chat' && (
            <div className="bg-background/85 backdrop-blur-lg border-t border-border p-4 absolute bottom-0 left-0 right-0">
              <div className="max-w-[720px] mx-auto">
                {uploadedFiles.length > 0 && (
                  <div className="mb-2 flex flex-wrap gap-2">
                    {uploadedFiles.map((f, i) => (
                      <div key={i} className="bg-accent px-2 py-1 rounded text-[10px] flex items-center gap-1">
                        <span className="truncate max-w-[100px]">{f.name}</span>
                        <X className="h-2.5 w-2.5 cursor-pointer" onClick={() => removeFile(i)} />
                      </div>
                    ))}
                  </div>
                )}
                {renderInputBar(false)}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Auth Modal */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  )
}