'use client'

import { useEffect, useRef, useState } from 'react'
import { useChatStore } from '@/store/chat-store'
import { MarkdownRenderer } from '@/components/markdown-renderer'
import { formatDate } from '@/lib/date-utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer'
import { useTheme } from 'next-themes'
import { MessageSquare, Menu, Plus, Search, MoreVertical, Settings, X, Key, Upload, File, Image, LogOut, User } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { useAuth } from '@/contexts/SupabaseAuthContext'
import { AuthModal } from '@/components/auth/AuthModal'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

// Available models for each provider
const AVAILABLE_MODELS = {
  gemini: [
    { value: 'gemini-pro', label: 'Gemini Pro (Stable)' },
    { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' },
    { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash' },
    { value: 'gemini-2.0-flash-exp', label: 'Gemini 2.0 Flash (Experimental)' },
  ],
  openrouter: [
    { value: 'openai/gpt-4o', label: 'ChatGPT GPT-4o' },
    { value: 'openai/gpt-4o-mini', label: 'ChatGPT GPT-4o Mini' },
    { value: 'anthropic/claude-3.5-sonnet', label: 'Claude 3.5 Sonnet' },
    { value: 'anthropic/claude-3-haiku', label: 'Claude 3 Haiku' },
    { value: 'deepseek/deepseek-r1', label: 'DeepSeek R1' },
    { value: 'deepseek/deepseek-chat', label: 'DeepSeek Chat' },
    { value: 'moonshot/kimi-v1', label: 'Kimi K2' },
    { value: 'google/gemini-pro-1.5', label: 'Gemini Pro 1.5 (via OpenRouter)' },
  ]
}

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
      return <Image className="h-4 w-4" alt="" />
    }
    return <File className="h-4 w-4" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="flex h-screen bg-background">
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
      <aside className={`bg-sidebar border-r border-border transition-all duration-300 ${
        isSidebarVisible ? 'translate-x-0' : '-translate-x-full'
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
                      className={`w-full text-left p-3 rounded-lg hover:bg-accent transition-colors ${
                        currentChatId === chat.id ? 'bg-accent' : ''
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
        <header className="border-b border-border bg-background">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleSidebar}
                className="md:hidden"
              >
                <Menu className="h-4 w-4" />
              </Button>
              <div className="flex items-center space-x-2">
                <div className="flex items-center">
                  <span className="text-2xl font-bold text-foreground">llmwrapper</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Provider Selection */}
              <Select value={selectedProvider} onValueChange={(value: 'gemini' | 'openrouter') => setSelectedProvider(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gemini">Gemini</SelectItem>
                  <SelectItem value="openrouter">OpenRouter</SelectItem>
                </SelectContent>
              </Select>

              {/* Model Selection */}
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AVAILABLE_MODELS[selectedProvider].map((model) => (
                    <SelectItem key={model.value} value={model.value}>
                      {model.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <ThemeToggle />
              
              {/* API Key Buttons */}
              <Button
                variant={apiKey ? "default" : "outline"}
                size="sm"
                onClick={() => setShowApiModal(true)}
              >
                <Key className="h-4 w-4 mr-1" />
                {apiKey ? 'Gemini' : 'Gemini Key'}
              </Button>
              
              <Button
                variant={openRouterApiKey ? "default" : "outline"}
                size="sm"
                onClick={() => setShowOpenRouterModal(true)}
              >
                <Key className="h-4 w-4 mr-1" />
                {openRouterApiKey ? 'OpenRouter' : 'OpenRouter Key'}
              </Button>
              
              {/* Auth Section (Right Corner) */}
              <div className="flex items-center justify-center">
                {user ? (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span className="text-sm font-medium truncate max-w-24">
                        {user.displayName || user.email}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={logout}
                      className="text-sm p-1"
                    >
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-sm"
                    onClick={() => setShowAuthModal(true)}
                  >
                    Sign In
                  </Button>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Chat Container */}
        <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-4">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto py-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="flex items-center mb-8">
                  <span className="text-3xl font-bold text-foreground">llmwrapper</span>
                  <span className="pro-badge">PRO</span>
                </div>
                
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-2xl">
                  {[
                    { title: 'Compare Features', prompt: 'Compare Python vs JavaScript in a table with features, pros, and cons' },
                    { title: 'Learning Path', prompt: 'Show me a step-by-step learning path for web development in a table' },
                    { title: 'Health Tips', prompt: 'Create a weekly meal plan table with breakfast, lunch, and dinner' },
                    { title: 'Tech Trends', prompt: 'List current AI trends in a table with descriptions and impact levels' },
                  ].map((example) => (
                    <button
                      key={example.title}
                      onClick={() => setInputMessage(example.prompt)}
                      className="p-4 border border-border rounded-lg hover:bg-accent transition-colors text-left"
                    >
                      <h3 className="font-medium text-sm mb-1">{example.title}</h3>
                      <p className="text-xs text-muted-foreground">{example.prompt}</p>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((message, index) => (
                  <div
                    key={message.id}
                    className={`flex gap-4 py-4 ${index > 0 ? 'border-t border-border/30' : ''} ${
                      message.role === 'assistant' ? 'bg-muted/20' : ''
                    }`}
                  >
                    <div className="flex-shrink-0">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                        message.role === 'user' 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-emerald-600 text-white'
                      }`}>
                        {message.role === 'user' ? 'U' : 'AI'}
                      </div>
                    </div>
                    <div className="flex-1 max-w-none">
                      <div className={`${
                        message.role === 'user' 
                          ? 'inline-block px-4 py-2 rounded-2xl bg-primary text-primary-foreground max-w-lg' 
                          : 'w-full'
                      }`}>
                        {message.role === 'assistant' ? (
                          <div className="markdown-content">
                            <MarkdownRenderer content={message.content} />
                          </div>
                        ) : (
                          <div className="whitespace-pre-wrap text-[15px] font-normal leading-normal">{message.content}</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Loading indicator */}
                {isLoading && (
                  <div className="flex gap-4 py-4 bg-muted/20">
                    <div className="flex-shrink-0">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium bg-emerald-600 text-white">
                        AI
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex space-x-1 items-center">
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t border-border p-4">
            {/* Uploaded Files */}
            {uploadedFiles.length > 0 && (
              <div className="mb-3 p-3 bg-muted rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <File className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      {uploadedFiles.length} file{uploadedFiles.length !== 1 ? 's' : ''} uploaded
                    </span>
                    <span className="text-xs text-muted-foreground">
                      (Debug: {uploadedFiles.map(f => f.name).join(', ')})
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
                      <div className="flex items-center space-x-2 flex-1 min-w-0">
                        {getFileIcon(file)}
                        <span className="truncate" title={file.name}>
                          {file.name}
                        </span>
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

            <div className="flex gap-2">
              {/* File Upload Button */}
              <input
                ref={fileInputRef}
                type="file"
                multiple={false} // Changed to single file
                className="hidden"
                onChange={(e) => {
                  console.log('File input change triggered')
                  if (e.target.files && e.target.files.length > 0) {
                    handleFileUpload(e.target.files)
                    e.target.value = ''
                  }
                }}
                accept="*/*"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  console.log('Upload button clicked')
                  fileInputRef.current?.click()
                }}
                className="h-10 w-10 p-0 flex-shrink-0"
                title="Upload files"
              >
                <Upload className="h-4 w-4" />
              </Button>

              <form onSubmit={handleSendMessage} className="flex-1">
                <div className="relative">
                  <Textarea
                    ref={inputRef}
                    value={inputMessage}
                    onChange={handleTextareaChange}
                    placeholder={
                      (selectedProvider === 'gemini' && apiKey) || 
                      (selectedProvider === 'openrouter' && openRouterApiKey)
                        ? "Ask anything..." 
                        : `Configure ${selectedProvider === 'gemini' ? 'Gemini' : 'OpenRouter'} API key first`
                    }
                    disabled={
                      (selectedProvider === 'gemini' && !apiKey) || 
                      (selectedProvider === 'openrouter' && !openRouterApiKey) ||
                      isLoading
                    }
                    className="min-h-[48px] max-h-[120px] resize-none pr-12"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage(e)
                      }
                    }}
                  />
                  
                  {/* Send Button */}
                  <Button
                    type="submit"
                    disabled={
                      !inputMessage.trim() && uploadedFiles.length === 0 || 
                      (selectedProvider === 'gemini' && !apiKey) || 
                      (selectedProvider === 'openrouter' && !openRouterApiKey) ||
                      isLoading
                    }
                    className="absolute right-2 bottom-2 h-8 w-8 p-0"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                      />
                    </svg>
                  </Button>
                </div>
              </form>
            </div>
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