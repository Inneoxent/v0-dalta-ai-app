"use client"

import type { Message } from "@/lib/types"
import { useState } from "react"
import { Copy, Check } from "lucide-react"

interface ChatMessageProps {
  message: Message
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user"
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg group relative ${
          isUser ? "bg-primary text-primary-foreground" : "bg-muted text-foreground border border-border"
        }`}
      >
        <p className="text-sm leading-relaxed">{message.content}</p>
        <p className={`text-xs mt-2 ${isUser ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </p>
        {!message.synced && <p className="text-xs mt-1 text-yellow-400">Pending sync...</p>}

        <button
          onClick={handleCopy}
          className={`absolute top-2 right-2 p-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity ${
            isUser ? "hover:bg-primary-foreground/20 text-primary-foreground" : "hover:bg-foreground/10 text-foreground"
          }`}
          aria-label="Copy message"
          title={copied ? "Copied!" : "Copy message"}
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
    </div>
  )
}
