"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Message, Conversation } from "./types"

interface ChatStore {
  conversations: Conversation[]
  currentConversation: Conversation | null
  messages: Message[]
  createConversation: () => void
  selectConversation: (id: string) => void
  addMessage: (message: Message) => void
  loadMessages: (conversationId: string) => void
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      conversations: [],
      currentConversation: null,
      messages: [],

      createConversation: () => {
        const newConversation: Conversation = {
          id: Date.now().toString(),
          userId: "current-user",
          title: `Chat ${new Date().toLocaleDateString()}`,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        set((state) => ({
          conversations: [newConversation, ...state.conversations],
          currentConversation: newConversation,
          messages: [],
        }))
      },

      selectConversation: (id: string) => {
        const conversation = get().conversations.find((c) => c.id === id)
        if (conversation) {
          set({ currentConversation: conversation })
          get().loadMessages(id)
        }
      },

      addMessage: (message: Message) => {
        set((state) => ({
          messages: [...state.messages, message],
        }))
      },

      loadMessages: (conversationId: string) => {
        // In production, load from IndexedDB or API
        set((state) => ({
          messages: state.messages.filter((m) => m.conversationId === conversationId),
        }))
      },
    }),
    {
      name: "chat-store",
    },
  ),
)
