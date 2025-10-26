import express, { type Application, type Response } from "express"
import { runConversationPipeline } from "./conversation-pipeline"
import { generateEmbedding } from "./ai-agent"
import { embeddingsStore } from "./embeddings-store"
import { authenticateToken } from "./auth-middleware"
import type { AuthRequest } from "./types"
import { conversations, messages } from "./data-store"

const app: Application = express()
app.use(express.json())

// Replace the existing /api/chat endpoint with this:
app.post("/api/chat", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { conversationId, message: userMessage } = req.body

    if (!conversationId || !userMessage) {
      return res.status(400).json({ error: "Conversation ID and message required" })
    }

    const conversation = conversations.get(conversationId)
    if (!conversation || conversation.userId !== req.userId) {
      return res.status(404).json({ error: "Conversation not found" })
    }

    const conversationMessages = messages.get(conversationId) || []

    // Run the conversation pipeline
    const pipelineResult = await runConversationPipeline(userMessage, {
      conversation,
      messages: conversationMessages,
      userId: req.userId!,
    })

    // Store messages
    conversationMessages.push(pipelineResult.userMessage)
    conversationMessages.push(pipelineResult.assistantMessage)
    messages.set(conversationId, conversationMessages)

    // Generate and store embeddings for semantic search
    try {
      const userEmbedding = await generateEmbedding(pipelineResult.userMessage.content)
      embeddingsStore.storeEmbedding(
        conversationId,
        pipelineResult.userMessage.id,
        pipelineResult.userMessage.content,
        userEmbedding,
      )

      const assistantEmbedding = await generateEmbedding(pipelineResult.assistantMessage.content)
      embeddingsStore.storeEmbedding(
        conversationId,
        pipelineResult.assistantMessage.id,
        pipelineResult.assistantMessage.content,
        assistantEmbedding,
      )
    } catch (embeddingError) {
      console.error("Error storing embeddings:", embeddingError)
      // Continue even if embedding fails
    }

    // Update conversation timestamp
    conversation.updatedAt = new Date()

    res.json({
      userMessage: pipelineResult.userMessage,
      assistantMessage: pipelineResult.assistantMessage,
      topics: pipelineResult.topics,
      processingTime: pipelineResult.processingTime,
    })
  } catch (error) {
    console.error("Error in chat endpoint:", error)
    res.status(500).json({ error: "Failed to process message" })
  }
})

// Add semantic search endpoint
app.get("/api/semantic-search", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const query = (req.query.q as string) || ""
    const limit = Number.parseInt(req.query.limit as string) || 10

    if (!query.trim()) {
      return res.status(400).json({ error: "Search query required" })
    }

    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query)

    // Search across all user's conversations
    const userConversationIds = Array.from(conversations.values())
      .filter((c) => c.userId === req.userId)
      .map((c) => c.id)

    const results: any[] = []

    for (const convId of userConversationIds) {
      const convMessages = messages.get(convId) || []
      for (const msg of convMessages) {
        try {
          const msgEmbedding = await generateEmbedding(msg.content)
          let similarity = 0

          // Calculate cosine similarity
          let dotProduct = 0
          let normA = 0
          let normB = 0
          for (let i = 0; i < queryEmbedding.length; i++) {
            dotProduct += queryEmbedding[i] * msgEmbedding[i]
            normA += queryEmbedding[i] * queryEmbedding[i]
            normB += msgEmbedding[i] * msgEmbedding[i]
          }
          similarity = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))

          if (similarity > 0.5) {
            results.push({
              message: msg,
              conversationId: convId,
              similarity: Math.round(similarity * 100) / 100,
            })
          }
        } catch (err) {
          console.error("Error processing message embedding:", err)
        }
      }
    }

    // Sort by similarity and limit results
    results.sort((a, b) => b.similarity - a.similarity)

    res.json({
      results: results.slice(0, limit),
      query,
      count: results.length,
    })
  } catch (error) {
    console.error("Error in semantic search:", error)
    res.status(500).json({ error: "Search failed" })
  }
})

// Start the server
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
