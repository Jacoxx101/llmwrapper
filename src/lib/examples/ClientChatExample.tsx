// Example usage of the DB SDK
"use client";
import { useEffect, useState } from "react";
import { addMessage, getMessages } from "@/lib/db/messages";
import { createConversation, listConversations } from "@/lib/db/conversations";
import { useMessagesPoller } from "@/lib/hooks/useMessagesPoller";
import { searchMessages } from "@/lib/db/search";
import { uploadAttachment, listAttachments } from "@/lib/db/attachments";

export default function ClientChatExample({ conversationId }: { conversationId?: string }) {
  const [text, setText] = useState("");
  const [currentConvId, setCurrentConvId] = useState(conversationId || null);
  const [conversations, setConversations] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  
  // Use the polling hook for live-ish updates
  const { messages, loading } = useMessagesPoller(currentConvId, 2500);

  // Load conversations on mount
  useEffect(() => {
    listConversations().then(setConversations).catch(console.error);
  }, []);

  // Create a new conversation
  async function createNewConversation() {
    try {
      const conv = await createConversation("New Chat");
      setCurrentConvId(conv.id);
      setConversations(prev => [conv, ...prev]);
    } catch (error) {
      console.error("Failed to create conversation:", error);
    }
  }

  // Send a message
  async function sendMessage() {
    const content = text.trim();
    if (!content || !currentConvId) return;
    
    setText("");
    try {
      await addMessage(currentConvId, "user", content);
      // The polling hook will automatically pick up the new message
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  }

  // Search messages
  async function handleSearch(query: string) {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    
    try {
      const results = await searchMessages(query, currentConvId || undefined);
      setSearchResults(results);
    } catch (error) {
      console.error("Search failed:", error);
    }
  }

  // Handle file upload
  async function handleFileUpload(file: File, messageId: number) {
    try {
      const attachment = await uploadAttachment(messageId, file);
      console.log("Uploaded attachment:", attachment);
    } catch (error) {
      console.error("Upload failed:", error);
    }
  }

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      {/* Header with conversation selector */}
      <div className="border-b p-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={createNewConversation}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            New Chat
          </button>
          
          <select 
            value={currentConvId || ""} 
            onChange={(e) => setCurrentConvId(e.target.value || null)}
            className="px-3 py-2 border rounded"
          >
            <option value="">Select conversation...</option>
            {conversations.map((conv) => (
              <option key={conv.id} value={conv.id}>
                {conv.title || `Chat ${conv.id.slice(0, 8)}`}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Search messages..."
            onChange={(e) => handleSearch(e.target.value)}
            className="px-3 py-2 border rounded flex-1"
          />
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto space-y-2 p-4">
        {loading && <div className="text-center opacity-60">Loading messages...</div>}
        
        {searchResults.length > 0 && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <h3 className="font-semibold mb-2">Search Results:</h3>
            {searchResults.map((result) => (
              <div key={result.id} className="mb-2 p-2 bg-white rounded text-sm">
                <div className="font-semibold">{result.role}</div>
                <div>{result.content}</div>
                <div className="text-xs opacity-60">Rank: {result.rank}</div>
              </div>
            ))}
          </div>
        )}

        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`rounded-lg border p-3 ${
              message.role === 'user' 
                ? 'bg-blue-50 border-blue-200 ml-8' 
                : 'bg-gray-50 border-gray-200 mr-8'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-semibold opacity-60 uppercase">
                {message.role}
              </div>
              <div className="text-xs opacity-50">
                Seq: {message.sequence} | Status: {message.message_status}
              </div>
            </div>
            <div className="whitespace-pre-wrap">{message.content}</div>
            {message.metadata && Object.keys(message.metadata as object).length > 0 && (
              <div className="mt-2 text-xs opacity-60">
                Metadata: {JSON.stringify(message.metadata)}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Input area */}
      {currentConvId && (
        <div className="border-t p-4">
          <div className="flex gap-2">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type your message..."
              rows={2}
              className="flex-1 px-3 py-2 border rounded resize-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
            />
            <button 
              onClick={sendMessage}
              disabled={!text.trim()}
              className="px-6 py-2 bg-green-600 text-white rounded disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}