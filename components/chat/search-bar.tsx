"use client"

import { useState, useEffect } from "react"
import { useChatStore } from "@/lib/chat-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"

interface SearchBarProps {
  onClose: () => void
}

export default function SearchBar({ onClose }: SearchBarProps) {
  const { messages } = useChatStore()
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<typeof messages>([])

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }

    // Simple semantic search - in production, use embeddings
    const filtered = messages.filter((msg) => msg.content.toLowerCase().includes(query.toLowerCase()))
    setResults(filtered)
  }, [query, messages])

  return (
    <div className="flex-1 flex flex-col p-6 bg-background">
      <div className="mb-6">
        <div className="flex gap-3 mb-4">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search conversations..."
            autoFocus
            className="flex-1"
          />
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Found {results.length} result{results.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3">
        {results.map((msg) => (
          <Card key={msg.id} className="p-4 border border-border bg-muted">
            <p className="text-sm text-muted-foreground mb-2">{msg.role === "user" ? "You" : "Dalta AI"}</p>
            <p className="text-foreground">{msg.content}</p>
            <p className="text-xs text-muted-foreground mt-2">{new Date(msg.timestamp).toLocaleString()}</p>
          </Card>
        ))}
      </div>
    </div>
  )
}
