'use client'

import { useEffect, useRef, useState } from 'react'
import { useChatStore } from '@/store/chat-store'
import { MarkdownRenderer } from '@/components/markdown-renderer'
import ChatMessage from '@/components/chat/ChatMessage'
import TypingDots from '@/components/chat/TypingDots'
import { formatDate } from '@/lib/date-utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import ModelSelector from '@/components/ModelSelector'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer'
import { useTheme } from 'next-themes'
import { MessageSquare, Menu, Plus, Search, MoreVertical, Settings, X, Key, Upload, File as FileIcon, Image as ImageIcon, LogOut, User } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { useAuth } from '@/contexts/SupabaseAuthContext'
import { AuthModal } from '@/components/auth/AuthModal'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'



export default function Home() {
  const { user, logout } = useAuth()

  const {
    currentChatId,
    messages,
    isLoading,
    chats,
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
  } = useChatStore()

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

  // Initialize theme
  useEffect(() => {
    if (isDarkMode) {
      setTheme('dark')
    } else {
      setTheme('light')
    }
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
  const handleThemeToggle = () => {
    toggleTheme()
  }

  // Handle sending message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputMessage.trim() || isLoading) return

    // Check if we have the required API key for the selected provider
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

    // Add user message
    addMessage({ content: userMessage, role: 'user' })

    // Create new chat if none exists
    if (!currentChatId) {
      createNewChat()
    }

    // Show loading
    setLoading(true)

    try {
      let response
      let apiUrl

      // Choose the appropriate API endpoint based on the provider
      if (selectedProvider === 'gemini') {
        apiUrl = '/api/chat'
        response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: userMessage,
            model: selectedModel,
            apiKey: apiKey,
          }),
        })
      } else {
        apiUrl = '/api/chat/openrouter'
        response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: userMessage,
            model: selectedModel,
            apiKey: openRouterApiKey,
          }),
        })
      }

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to get response')
      }

      const data = await response.json()

      // Add assistant message
      addMessage({ content: data.response, role: 'assistant' })
    } catch (error) {
      console.error('Chat error:', error)
      addMessage({
        content: `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        role: 'assistant'
      })
    } finally {
      setLoading(false)
    }
  }

  // Handle new chat
  const handleNewChat = () => {
    createNewChat()
    clearMessages()
  }

  // Handle go home
  const handleGoHome = () => {
    // Clear current chat and messages to show home page
    setCurrentChatId(null)
    clearMessages()
  }

  // Handle chat selection
  const handleSelectChat = (chatId: string) => {
    loadChat(chatId)
    setShowChatMenu(null)
  }

  // Handle chat deletion
  const handleDeleteChat = (chatId: string) => {
    if (confirm('Delete this chat?')) {
      deleteChat(chatId)
      setShowChatMenu(null)
    }
  }

  // Handle chat rename
  const handleRenameChat = (chatId: string) => {
    const chat = chats.find(c => c.id === chatId)
    if (!chat) return

    const newTitle = prompt('Rename chat:', chat.title)
    if (newTitle && newTitle.trim()) {
      updateChatTitle(chatId, newTitle.trim())
    }
    setShowChatMenu(null)
  }

  // Filter chats based on search
  const filteredChats = chats.filter(chat =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Handle API key save
  const handleSaveApiKey = () => {
    setApiKey(tempApiKey)
    setShowApiModal(false)
  }

  // Handle OpenRouter API key save
  const handleSaveOpenRouterApiKey = () => {
    setOpenRouterApiKey(tempOpenRouterApiKey)
    setShowOpenRouterModal(false)
  }

  // Handle key shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K for search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        const searchInput = document.getElementById('search-input') as HTMLInputElement
        searchInput?.focus()
      }

      // Escape to close menus
      if (e.key === 'Escape') {
        setShowChatMenu(null)
      }
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

  // File handling functions - simplified approach
  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return

    console.log('=== SIMPLE FILE UPLOAD ===')
    console.log('Files received:', files.length)

    // Just take the first file for now to test
    const firstFile = files[0]
    console.log('First file:', firstFile.name)

    // Simple direct update
    setUploadedFiles(prev => {
      console.log('Current files:', prev.length)
      // Check if file already exists
      const exists = prev.some(f => f.name === firstFile.name && f.size === firstFile.size)
      if (exists) {
        console.log('File already exists, not adding')
        return prev
      }
      console.log('Adding file, new count:', prev.length + 1)
      return [...prev, firstFile]
    })

    console.log('=== SIMPLE UPLOAD END ===')
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFileUpload(e.dataTransfer.files)
  }

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <ImageIcon className="h-4 w-4" />
    }
    return <FileIcon className="h-4 w-4" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* API Key Modal */}
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
                <a
                  href="https://makersuite.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Google AI Studio
                </a>
              </p>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowApiModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveApiKey}>
                Save
              </Button>
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
                <a
                  href="https://openrouter.ai/keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  OpenRouter
                </a>
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Supports: ChatGPT, Claude, DeepSeek, Kimi K2, and more
              </p>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowOpenRouterModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveOpenRouterApiKey}>
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Sidebar */}
      <aside className={`bg-sidebar border-r border-border transition-all duration-300 ${isSidebarVisible ? 'translate-x-0' : '-translate-x-full'
        } ${isSidebarCollapsed ? 'w-16' : 'w-64'} fixed md:relative h-full z-50`}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-border flex items-center justify-between">
            {!isSidebarCollapsed && (
              <Button onClick={handleNewChat} className="flex-1 mr-2" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Chat
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebarSize}
              className="shrink-0"
            >
              <Menu className="h-4 w-4" />
            </Button>
          </div>

          {/* Search */}
          {!isSidebarCollapsed && (
            <div className="p-4 border-b border-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search-input"
                  placeholder="Search chats... (Cmd+K)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          )}

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto">
            {!isSidebarCollapsed && (
              <div className="p-2 space-y-1">
                {filteredChats.map((chat) => (
                  <div key={chat.id} className="relative">
                    <button
                      onClick={() => handleSelectChat(chat.id)}
                      className={`w-full text-left p-3 rounded-lg hover:bg-accent transition-colors ${currentChatId === chat.id ? 'bg-accent' : ''
                        }`}
                    >
                      <div className="font-medium text-sm truncate">{chat.title}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {formatDate(chat.updatedAt)}
                      </div>
                    </button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowChatMenu(showChatMenu === chat.id ? null : chat.id)}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                    >
                      <MoreVertical className="h-3 w-3" />
                    </Button>

                    {/* Chat Menu */}
                    {showChatMenu === chat.id && (
                      <div className="absolute right-0 top-full mt-1 bg-popover border border-border rounded-md shadow-lg z-10 min-w-[120px]">
                        <button
                          onClick={() => handleRenameChat(chat.id)}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-accent"
                        >
                          Rename
                        </button>
                        <button
                          onClick={() => handleDeleteChat(chat.id)}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-accent text-destructive"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-background/85 backdrop-blur-lg border-b border-border sticky top-0 z-10">
          <div className="flex items-center justify-between px-5 h-[54px]">
            <button
              onClick={handleGoHome}
              className="text-lg tracking-tight text-foreground"
              style={{ fontFamily: "'Instrument Serif', serif" }}
            >
              llmwrapper
            </button>

            <div className="flex items-center gap-2">
              {/* Model selector */}
              <ModelSelector
                selectedModel={selectedModel}
                selectedProvider={selectedProvider}
                onModelChange={setSelectedModel}
                onProviderChange={setSelectedProvider}
              />

              <ThemeToggle />

              {/* API Key buttons */}
              <Button
                variant={apiKey ? "default" : "outline"}
                size="sm"
                onClick={() => setShowApiModal(true)}
                className="h-[34px] text-xs rounded-lg shadow-sm"
              >
                <Key className="h-3.5 w-3.5 mr-1.5" />
                {apiKey ? 'Gemini ✓' : 'Gemini Key'}
              </Button>

              <Button
                variant={openRouterApiKey ? "default" : "outline"}
                size="sm"
                onClick={() => setShowOpenRouterModal(true)}
                className="h-[34px] text-xs rounded-lg shadow-sm"
              >
                <Key className="h-3.5 w-3.5 mr-1.5" />
                {openRouterApiKey ? 'Router ✓' : 'Router Key'}
              </Button>

              {/* Auth */}
              {user ? (
                <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-2.5 py-1 shadow-sm">
                  <div className="h-6 w-6 rounded-full bg-foreground flex items-center justify-center text-[10px] text-background font-semibold">
                    {(user.user_metadata?.full_name || user.email || 'U')[0].toUpperCase()}
                  </div>
                  <span className="text-xs font-medium truncate max-w-20 hidden md:block">
                    {user.user_metadata?.full_name || user.user_metadata?.name || 'User'}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={logout}
                    className="h-5 w-5 p-0 hover:text-destructive"
                  >
                    <LogOut className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="text-sm font-medium text-foreground hover:bg-card rounded-lg px-3 py-1.5 transition-colors"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Chat Container - Messages only */}
        <div className="flex-1 overflow-hidden">
          {/* Messages - The ONLY scroll area */}
          <div className="h-full overflow-y-auto px-4 py-2 max-w-4xl mx-auto">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                {/* Hero */}
                <div className="mb-10">
                  <h1 className="text-[42px] tracking-tight text-foreground flex items-center justify-center gap-3 mb-3" style={{ fontFamily: "'Instrument Serif', serif" }}>
                    llmwrapper
                    <span className="pro-badge text-[10px]">PRO</span>
                  </h1>
                  <p className="text-sm text-muted-foreground font-light max-w-sm mx-auto leading-relaxed">
                    Chat with the world&apos;s best AI models — Gemini, GPT-4o, Claude, DeepSeek and more.
                  </p>
                </div>

                {/* Prompt Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-[580px]">
                  {[
                    { emoji: '⚖️', title: 'Compare Features', prompt: 'Compare Python vs JavaScript in a table with features, pros, and cons' },
                    { emoji: '🗺️', title: 'Learning Path', prompt: 'Show me a step-by-step learning path for web development in a table' },
                    { emoji: '🥗', title: 'Health Tips', prompt: 'Create a weekly meal plan table with breakfast, lunch, and dinner' },
                    { emoji: '🤖', title: 'Tech Trends', prompt: 'List current AI trends in a table with descriptions and impact levels' },
                  ].map((example) => (
                    <button
                      key={example.title}
                      onClick={() => setInputMessage(example.prompt)}
                      className="group relative p-5 rounded-[14px] border border-border bg-card text-left transition-all duration-200 hover:-translate-y-[3px] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08),0_2px_4px_rgba(0,0,0,0.04)] hover:border-[#d4c9b0] overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-[var(--gold-accent-light)] to-transparent opacity-0 group-hover:opacity-50 transition-opacity duration-200" />
                      <div className="relative">
                        <div className="h-[34px] w-[34px] rounded-lg bg-[var(--gold-accent-light)] dark:bg-accent flex items-center justify-center mb-3 text-base">
                          {example.emoji}
                        </div>
                        <h3 className="font-semibold text-sm mb-1.5 tracking-tight">{example.title}</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed font-light line-clamp-2">{example.prompt}</p>
                      </div>
                      <span className="absolute top-4 right-4 text-muted-foreground text-sm opacity-0 -translate-x-1 translate-y-1 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-200">↗</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    id={message.id}
                    role={message.role}
                    content={message.content}
                  />
                ))}

                {/* Loading indicator - ChatGPT style */}
                {isLoading && (
                  <div className="w-full rounded-xl border border-chat-border bg-chat-panel px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600/90 text-[11px] font-semibold">
                        AI
                      </div>
                      <TypingDots />
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>

        {/* Input Area - Fixed at bottom of screen */}
        <div className="bg-background/85 backdrop-blur-lg border-t border-border p-4">
          <div className="max-w-[640px] mx-auto">
            {/* Uploaded Files */}
            {uploadedFiles.length > 0 && (
              <div className="mb-3 p-3 bg-card rounded-xl border border-border">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <FileIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      {uploadedFiles.length} file{uploadedFiles.length !== 1 ? 's' : ''} attached
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setUploadedFiles([])}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                <div className="space-y-1">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {getFileIcon(file)}
                        <span className="truncate text-xs" title={file.name}>{file.name}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        className="h-5 w-5 p-0 flex-shrink-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Input Card */}
            <div className="flex items-center gap-2.5 bg-card border border-border rounded-[14px] px-4 py-1.5 shadow-[0_4px_16px_rgba(0,0,0,0.08),0_2px_4px_rgba(0,0,0,0.04)] transition-all duration-200 focus-within:border-[var(--gold-accent)] focus-within:shadow-[0_0_0_3px_var(--gold-accent-light),0_4px_16px_rgba(0,0,0,0.08)]">
              {/* File Upload */}
              <input
                ref={fileInputRef}
                type="file"
                multiple={false}
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    handleFileUpload(e.target.files)
                    e.target.value = ''
                  }
                }}
                accept="*/*"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-shrink-0 p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                title="Attach file"
              >
                <Upload className="h-4 w-4" />
              </button>

              <form onSubmit={handleSendMessage} className="flex-1 flex items-center gap-2">
                <Textarea
                  ref={inputRef}
                  value={inputMessage}
                  onChange={handleTextareaChange}
                  placeholder={
                    (selectedProvider === 'gemini' && apiKey) ||
                      (selectedProvider === 'openrouter' && openRouterApiKey)
                      ? "Message llmwrapper…"
                      : `Configure ${selectedProvider === 'gemini' ? 'Gemini' : 'OpenRouter'} API key first`
                  }
                  disabled={
                    (selectedProvider === 'gemini' && !apiKey) ||
                    (selectedProvider === 'openrouter' && !openRouterApiKey) ||
                    isLoading
                  }
                  className="min-h-[34px] max-h-[120px] resize-none border-0 shadow-none focus-visible:ring-0 bg-transparent text-sm placeholder:text-muted-foreground"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage(e)
                    }
                  }}
                />

                <Button
                  type="submit"
                  disabled={
                    !inputMessage.trim() && uploadedFiles.length === 0 ||
                    (selectedProvider === 'gemini' && !apiKey) ||
                    (selectedProvider === 'openrouter' && !openRouterApiKey) ||
                    isLoading
                  }
                  className="h-[34px] w-[34px] p-0 flex-shrink-0 rounded-lg bg-foreground text-background hover:bg-foreground/90 disabled:opacity-30"
                >
                  <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path d="m5 12 14 0M12 5l7 7-7 7" />
                  </svg>
                </Button>
              </form>
            </div>

            <p className="text-center text-[11.5px] text-muted-foreground mt-2">
              Configure your API key to start chatting
            </p>
          </div>
        </div>
      </main>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  )
}