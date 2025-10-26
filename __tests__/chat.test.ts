import { describe, it, expect } from "vitest"
import { useChatStore } from "@/lib/chat-store"

describe("Chat Store", () => {
  it("should create a new conversation", () => {
    const store = useChatStore.getState()
    store.createConversation()
    expect(store.conversations.length).toBeGreaterThan(0)
  })

  it("should add a message to conversation", () => {
    const store = useChatStore.getState()
    store.createConversation()
    const conv = store.currentConversation
    if (conv) {
      store.addMessage({
        id: "1",
        conversationId: conv.id,
        role: "user",
        content: "Hello",
        timestamp: new Date(),
        synced: true,
      })
      expect(store.messages.length).toBe(1)
    }
  })

  it("should select a conversation", () => {
    const store = useChatStore.getState()
    store.createConversation()
    const firstConv = store.currentConversation
    store.createConversation()
    if (firstConv) {
      store.selectConversation(firstConv.id)
      expect(store.currentConversation?.id).toBe(firstConv.id)
    }
  })
})
