"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useChatStore } from "@/lib/chat-store"
import { useOfflineQueue } from "@/lib/offline-queue"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import ChatMessage from "./chat-message"
import SearchBar from "./search-bar"

export default function ChatPage() {
  const { user, signOut } = useAuth()
  const { conversations, currentConversation, messages, addMessage, createConversation, selectConversation } =
    useChatStore()
  const { queueMessage, isOnline } = useOfflineQueue()
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    if (!currentConversation && conversations.length === 0) {
      createConversation()
    }
  }, [])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !currentConversation) return

    const userMessage = {
      id: Date.now().toString(),
      conversationId: currentConversation.id,
      role: "user" as const,
      content: input,
      timestamp: new Date(),
      synced: isOnline,
    }

    setInput("")
    addMessage(userMessage)

    if (!isOnline) {
      queueMessage(userMessage)
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: currentConversation.id,
          message: input,
          userId: user?.id,
        }),
      })

      if (!response.ok) throw new Error("Failed to send message")

      const data = await response.json()
      addMessage({
        id: data.id,
        conversationId: currentConversation.id,
        role: "assistant",
        content: data.content,
        timestamp: new Date(data.timestamp),
        synced: true,
      })
    } catch (error) {
      console.error("Error sending message:", error)
      queueMessage(userMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-64 border-r border-border bg-muted flex flex-col">
        <div className="p-4 border-b border-border">
          <Button
            onClick={() => createConversation()}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-sm"
          >
            New Chat
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => selectConversation(conv.id)}
              className={`w-full text-left p-3 rounded transition ${
                currentConversation?.id === conv.id
                  ? "bg-primary/20 text-primary"
                  : "text-muted-foreground hover:bg-muted-foreground/10"
              }`}
            >
              <p className="text-sm truncate">{conv.title}</p>
              <p className="text-xs text-muted-foreground mt-1">{new Date(conv.createdAt).toLocaleDateString()}</p>
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-border space-y-2">
          <Button onClick={() => setShowSearch(!showSearch)} variant="outline" className="w-full text-sm">
            Search
          </Button>
          <Button
            onClick={signOut}
            variant="outline"
            className="w-full text-sm text-red-400 hover:text-red-300 bg-transparent"
          >
            Sign Out
          </Button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {showSearch ? (
          <SearchBar onClose={() => setShowSearch(false)} />
        ) : (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-foreground mb-2">Welcome to Dalta AI</h2>
                    <p className="text-muted-foreground">Start a conversation to get started</p>
                  </div>
                </div>
              ) : (
                messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Status Bar */}
            {!isOnline && (
              <div className="px-6 py-2 bg-yellow-900/20 border-t border-yellow-700 text-yellow-400 text-sm">
                Offline mode - messages will sync when online
              </div>
            )}

            {/* Input */}
            <form onSubmit={handleSendMessage} className="p-6 border-t border-border">
              <div className="flex gap-3">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  disabled={loading}
                  className="flex-1"
                />
                <Button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {loading ? "Sending..." : "Send"}
                </Button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
