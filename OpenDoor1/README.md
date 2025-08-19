# 🚪 OpenDoor - AI Chat Assistant

A modern, feature-rich AI chat application powered by Gemini AI, built with Next.js 15 and cutting-edge web technologies. Experience seamless conversations with an intelligent assistant in a beautiful, responsive interface.

## ✨ Features

- **🤖 Multi-AI Support** - Gemini (direct) + OpenRouter (ChatGPT, Claude, DeepSeek, Kimi K2, and more)
- **🎨 Beautiful UI** - Modern, responsive design with dark/light mode support
- **💬 Chat History** - Persistent chat history with search and organization
- **📱 Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices
- **🌙 Dark Mode** - Comfortable viewing experience with automatic theme detection
- **⚡ Real-time** - Fast, responsive chat experience with loading indicators
- **📝 Markdown Support** - Rich text formatting with code syntax highlighting
- **🔍 Search** - Find your previous conversations instantly
- **⌨️ Keyboard Shortcuts** - Productivity-boosting keyboard shortcuts
- **🔄 Easy Provider Switching** - Switch between AI providers with model auto-selection

## 🚀 Technology Stack

### 🎯 Core Framework
- **⚡ Next.js 15** - React framework with App Router
- **📘 TypeScript 5** - Type-safe development
- **🎨 Tailwind CSS 4** - Utility-first CSS framework

### 🧩 UI & Experience
- **🧩 shadcn/ui** - High-quality, accessible components
- **🎯 Lucide React** - Beautiful icon library
- **🌈 Next Themes** - Perfect dark mode implementation
- **🎨 Framer Motion** - Smooth animations

### 🔄 State & Data
- **🐻 Zustand** - Lightweight state management
- **🔄 TanStack Query** - Server state management
- **📝 React Markdown** - Markdown rendering with syntax highlighting

### 🤖 AI Integration
- **🤖 Z-AI Web Dev SDK** - Seamless AI integration
- **🔐 API Key Management** - Secure API key handling

### 🗄️ Backend
- **🗄️ Prisma** - Modern database ORM
- **🗄️ SQLite** - Lightweight database

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Set up the database
npm run db:push

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to see your OpenDoor chat application running.

## 🔧 Configuration

### API Key Setup

#### Gemini API (Direct)
1. Get your Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click the "Gemini Key" button in the application header
3. Enter your API key to start chatting with Gemini models

#### OpenRouter API (Multiple Providers)
1. Get your OpenRouter API key from [OpenRouter](https://openrouter.ai/keys)
2. Click the "OpenRouter Key" button in the application header
3. Enter your API key to access multiple AI providers:
   - **ChatGPT** (GPT-4o, GPT-4o Mini)
   - **Claude** (3.5 Sonnet, 3 Haiku)
   - **DeepSeek** (R1, Chat)
   - **Kimi** (K2)
   - **Gemini** (Pro 1.5 via OpenRouter)
   - And many more!

### Provider Switching

- Use the provider dropdown in the header to switch between Gemini and OpenRouter
- Models are automatically updated when you switch providers
- Each provider maintains its own API key configuration

### Database

The application uses SQLite with Prisma ORM. The database schema includes:

- **Chats** - Stores conversation metadata
- **Messages** - Individual chat messages
- **API Keys** - Secure API key management

## 🎯 Key Features

### Chat Interface
- **Real-time Messaging** - Instant responses from AI
- **Message History** - Complete conversation persistence
- **Search Functionality** - Find past conversations quickly
- **Chat Management** - Create, rename, and delete conversations

### AI Capabilities
- **Multiple AI Providers** - Switch between Gemini and OpenRouter models
- **Creative Writing** - Stories, poems, and content creation
- **Code Assistance** - Programming help and code generation
- **Problem Solving** - Math, logic, and analytical thinking
- **General Knowledge** - Answer questions on various topics
- **Formatting Support** - Rich text with markdown, tables, and code blocks
- **Provider-Specific Models** - Access to the latest models from each provider

### User Experience
- **Responsive Design** - Works on all device sizes
- **Dark/Light Mode** - Automatic theme switching
- **Keyboard Shortcuts** - Cmd/Ctrl+K for search, Enter to send
- **Loading Indicators** - Visual feedback during AI processing
- **Error Handling** - Clear error messages and recovery options

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   └── chat/          # Chat API endpoint
│   ├── layout.tsx         # Root layout with theme provider
│   ├── page.tsx           # Main chat interface
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── markdown-renderer.tsx  # Markdown rendering component
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions
│   ├── db.ts            # Database client
│   ├── date-utils.ts    # Date formatting utilities
│   └── utils.ts         # General utilities
└── store/               # State management
    └── chat-store.ts    # Zustand chat store
```

## 🎨 Available Components

### UI Components (shadcn/ui)
- **Layout**: Card, Separator, Aspect Ratio
- **Forms**: Input, Textarea, Select, Button
- **Feedback**: Alert, Toast, Progress, Skeleton
- **Navigation**: Dialog, Sheet, Popover, Tooltip
- **Data Display**: Badge, Avatar

### Custom Components
- **MarkdownRenderer** - Advanced markdown with syntax highlighting
- **ChatInterface** - Complete chat experience
- **Sidebar** - Chat history and management

## 🌍 Production Features

- **Type Safety** - End-to-end TypeScript
- **Performance** - Optimized build and runtime
- **Accessibility** - WCAG compliant components
- **SEO** - Meta tags and structured data
- **Security** - Proper input validation and sanitization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🚀 Future Enhancements

- [ ] Multiple AI model support
- [ ] User authentication and accounts
- [ ] File upload and processing
- [ ] Voice input/output
- [ ] Advanced conversation features
- [ ] Plugin system
- [ ] Mobile app

---

Built with ❤️ for the AI community. Powered by Google Gemini AI 🤖
