# Supabase DB SDK

A comprehensive TypeScript SDK for Supabase operations in your Next.js app.

## Features

- ✅ **Typed Supabase clients** (client + server)
- ✅ **Conversation & message helpers** with proper sequence ordering
- ✅ **File attachments** with Storage integration
- ✅ **Full-text search** RPC wrapper
- ✅ **No-Realtime polling hook** for live-ish updates
- ✅ **Complete TypeScript support** with Database types

## Structure

```
src/lib/
├── supabase/
│   ├── client.ts          # Client-side Supabase client
│   └── server.ts          # Server-side Supabase client
├── db/
│   ├── conversations.ts   # Conversation CRUD operations
│   ├── messages.ts        # Message operations with sequence ordering
│   ├── attachments.ts     # File upload & attachment management
│   ├── search.ts          # Full-text search wrapper
│   └── index.ts          # Export all SDK functions
├── hooks/
│   └── useMessagesPoller.ts  # Polling hook for live updates
├── types.ts              # Database type definitions
└── examples/
    └── ClientChatExample.tsx  # Complete usage example
```

## Quick Start

```tsx
import { 
  createConversation, 
  addMessage, 
  useMessagesPoller 
} from '@/lib/db';

function MyChat() {
  const [convId, setConvId] = useState(null);
  const { messages, loading } = useMessagesPoller(convId);

  const handleSend = async (content: string) => {
    if (!convId) {
      const conv = await createConversation("New Chat");
      setConvId(conv.id);
    }
    await addMessage(convId, "user", content);
    // Messages auto-update via polling hook
  };

  return (
    <div>
      {messages.map(msg => (
        <div key={msg.id}>{msg.content}</div>
      ))}
    </div>
  );
}
```

## Key Benefits

1. **Sequence-based ordering**: Messages are properly ordered by database triggers
2. **No Realtime required**: Polling hook provides live-ish updates without WebSocket overhead
3. **Type safety**: Full TypeScript support with generated Database types
4. **RLS compliant**: All operations respect Row Level Security
5. **File handling**: Seamless file uploads with Storage integration

## Prerequisites

Assumes you have run the Supabase SQL schema with:
- `conversations` table with RLS
- `messages` table with sequence triggers
- `message_attachments` table
- `search_messages` RPC function
- `uploads` Storage bucket

See the main SQL setup documentation for details.