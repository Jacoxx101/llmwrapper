import { create } from 'zustand'

interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  createdAt: Date
}

interface Chat {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
}

interface ChatState {
  // Current state
  currentChatId: string | null
  messages: Message[]
  isLoading: boolean
  
  // Chat history
  chats: Chat[]
  
  // Settings
  apiKey: string
  openRouterApiKey: string
  selectedModel: string
  selectedProvider: 'gemini' | 'openrouter'
  isDarkMode: boolean
  isSidebarVisible: boolean
  isSidebarCollapsed: boolean
  
  // Actions
  setCurrentChatId: (id: string | null) => void
  addMessage: (message: Omit<Message, 'id' | 'createdAt'>) => void
  setLoading: (loading: boolean) => void
  createNewChat: () => string
  updateChatTitle: (chatId: string, title: string) => void
  deleteChat: (chatId: string) => void
  loadChat: (chatId: string) => void
  setApiKey: (key: string) => void
  setOpenRouterApiKey: (key: string) => void
  setSelectedModel: (model: string) => void
  setSelectedProvider: (provider: 'gemini' | 'openrouter') => void
  toggleTheme: () => void
  toggleSidebar: () => void
  toggleSidebarSize: () => void
  clearMessages: () => void
}

export const useChatStore = create<ChatState>((set, get) => ({
  // Initial state
  currentChatId: null,
  messages: [],
  isLoading: false,
  chats: [],
  apiKey: '',
  openRouterApiKey: '',
  selectedModel: 'gemini-2.0-flash-exp',
  selectedProvider: 'gemini',
  isDarkMode: false,
  isSidebarVisible: true,
  isSidebarCollapsed: false,

  // Actions
  setCurrentChatId: (id) => set({ currentChatId: id }),
  
  addMessage: (message) => {
    const newMessage: Message = {
      ...message,
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
    }
    
    set((state) => {
      const newMessages = [...state.messages, newMessage]
      
      // Update chat in history if we have a current chat
      if (state.currentChatId) {
        const updatedChats = state.chats.map(chat => 
          chat.id === state.currentChatId 
            ? { 
                ...chat, 
                messages: newMessages,
                updatedAt: new Date(),
                // Update title if this is the first message
                title: chat.title === 'New Chat' && message.role === 'user'
                  ? message.content.length > 50 
                    ? message.content.substring(0, 50) + '...'
                    : message.content
                  : chat.title
              }
            : chat
        )
        
        return {
          messages: newMessages,
          chats: updatedChats
        }
      }
      
      return { messages: newMessages }
    })
  },
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  createNewChat: () => {
    const chatId = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const newChat: Chat = {
      id: chatId,
      title: 'New Chat',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    
    set((state) => ({
      currentChatId: chatId,
      messages: [],
      chats: [newChat, ...state.chats],
    }))
    
    return chatId
  },
  
  updateChatTitle: (chatId, title) => {
    set((state) => ({
      chats: state.chats.map(chat =>
        chat.id === chatId
          ? { ...chat, title, updatedAt: new Date() }
          : chat
      )
    }))
  },
  
  deleteChat: (chatId) => {
    set((state) => {
      const newChats = state.chats.filter(chat => chat.id !== chatId)
      
      // If we're deleting the current chat, create a new one
      if (state.currentChatId === chatId) {
        const newChatId = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        const newChat: Chat = {
          id: newChatId,
          title: 'New Chat',
          messages: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        
        return {
          currentChatId: newChatId,
          messages: [],
          chats: [newChat, ...newChats],
        }
      }
      
      return {
        chats: newChats,
        currentChatId: state.currentChatId === chatId ? null : state.currentChatId,
      }
    })
  },
  
  loadChat: (chatId) => {
    const chat = get().chats.find(c => c.id === chatId)
    if (chat) {
      set({
        currentChatId: chatId,
        messages: chat.messages,
      })
    }
  },
  
  setApiKey: (key) => set({ apiKey: key }),
  
  setOpenRouterApiKey: (key) => set({ openRouterApiKey: key }),
  
  setSelectedModel: (model) => set({ selectedModel: model }),
  
  setSelectedProvider: (provider) => set({ selectedProvider: provider }),
  
  toggleTheme: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
  
  toggleSidebar: () => set((state) => ({ isSidebarVisible: !state.isSidebarVisible })),
  
  toggleSidebarSize: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
  
  clearMessages: () => set({ messages: [] }),
}))