export interface User {
  id: string
  email: string
  createdAt: Date
}

export interface Agent {
  id: string
  name: string
  description: string
  icon: string
  personality: string
  model: "gpt-4" | "gpt-4-turbo" | "gpt-3.5-turbo"
  systemPrompt: string
  color: string
}

export interface Message {
  id: string
  conversationId: string
  role: "user" | "assistant" | "system"
  content: string
  timestamp: Date
  synced: boolean
  agentId?: string
}

export interface Conversation {
  id: string
  userId: string
  title: string
  createdAt: Date
  updatedAt: Date
}

export interface ChatRequest {
  conversationId: string
  message: string
  userId: string
}

export interface ChatResponse {
  id: string
  content: string
  timestamp: string
  conversationId: string
}
