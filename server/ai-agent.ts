import { generateText, embed } from "ai"
import type { Message, Conversation } from "./index"

interface ConversationContext {
  conversation: Conversation
  messages: Message[]
  relevantHistory: Message[]
}

interface EmbeddingResult {
  messageId: string
  content: string
  embedding: number[]
  similarity?: number
}

// Initialize embedding model
const embeddingModel = "openai/text-embedding-3-small"

/**
 * Generate embeddings for a message using the Vercel AI SDK
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const { embedding } = await embed({
      model: embeddingModel,
      value: text,
    })
    return embedding
  } catch (error) {
    console.error("Error generating embedding:", error)
    // Fallback to simple hash-based embedding for demo
    return generateSimpleEmbedding(text)
  }
}

/**
 * Simple embedding fallback for demo purposes
 */
function generateSimpleEmbedding(text: string): number[] {
  const embedding = new Array(384).fill(0)
  for (let i = 0; i < text.length; i++) {
    embedding[i % 384] += text.charCodeAt(i) / 256
  }
  return embedding.map((v) => v / text.length)
}

/**
 * Calculate cosine similarity between two embeddings
 */
function cosineSimilarity(a: number[], b: number[]): number {
  let dotProduct = 0
  let normA = 0
  let normB = 0

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
}

/**
 * Find semantically similar messages from conversation history
 */
export async function findRelevantContext(query: string, messages: Message[], topK = 5): Promise<Message[]> {
  if (messages.length === 0) return []

  try {
    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query)

    // Generate embeddings for all messages and calculate similarity
    const similarities: Array<{ message: Message; similarity: number }> = []

    for (const message of messages) {
      const messageEmbedding = await generateEmbedding(message.content)
      const similarity = cosineSimilarity(queryEmbedding, messageEmbedding)
      similarities.push({ message, similarity })
    }

    // Sort by similarity and return top K
    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK)
      .map((item) => item.message)
  } catch (error) {
    console.error("Error finding relevant context:", error)
    // Fallback: return last N messages
    return messages.slice(-topK)
  }
}

/**
 * Build system prompt with conversation context
 */
function buildSystemPrompt(context: ConversationContext): string {
  const relevantHistory = context.relevantHistory
    .map((msg) => `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`)
    .join("\n")

  return `You are Dalta AI, an intelligent and helpful chat assistant. You have access to the conversation history and should use it to provide contextual, coherent responses.

Conversation Title: ${context.conversation.title}

Relevant Conversation History:
${relevantHistory || "No previous messages in this conversation."}

Guidelines:
- Be helpful, harmless, and honest
- Provide clear and concise responses
- Use the conversation history to maintain context
- Ask clarifying questions if needed
- Acknowledge when you don't know something`
}

/**
 * Process a user message through the AI agent pipeline
 */
export async function processMessage(userMessage: string, context: ConversationContext): Promise<string> {
  try {
    // Find relevant context from conversation history
    const relevantMessages = await findRelevantContext(userMessage, context.messages, 5)
    context.relevantHistory = relevantMessages

    // Build the conversation history for the model
    const conversationHistory = context.messages
      .slice(-10) // Use last 10 messages for context
      .map((msg) => ({
        role: msg.role as "user" | "assistant" | "system",
        content: msg.content,
      }))

    // Add the current user message
    conversationHistory.push({
      role: "user",
      content: userMessage,
    })

    // Generate response using the AI SDK
    const { text } = await generateText({
      model: "openai/gpt-4-mini",
      system: buildSystemPrompt(context),
      messages: conversationHistory,
      temperature: 0.7,
      maxTokens: 1000,
    })

    return text
  } catch (error) {
    console.error("Error processing message:", error)
    return "I apologize, but I encountered an error processing your message. Please try again."
  }
}

/**
 * Generate a conversation title based on the first message
 */
export async function generateConversationTitle(firstMessage: string): Promise<string> {
  try {
    const { text } = await generateText({
      model: "openai/gpt-4-mini",
      prompt: `Generate a short, concise title (max 5 words) for a conversation that starts with: "${firstMessage}"\n\nRespond with only the title, no quotes or explanation.`,
      maxTokens: 20,
    })

    return text.trim() || `Chat ${new Date().toLocaleDateString()}`
  } catch (error) {
    console.error("Error generating title:", error)
    return `Chat ${new Date().toLocaleDateString()}`
  }
}

/**
 * Semantic search across all conversations
 */
export async function semanticSearch(
  query: string,
  allMessages: Map<string, Message[]>,
  topK = 10,
): Promise<Array<{ message: Message; conversationId: string; similarity: number }>> {
  try {
    const queryEmbedding = await generateEmbedding(query)
    const results: Array<{ message: Message; conversationId: string; similarity: number }> = []

    // Search across all conversations
    for (const [conversationId, messages] of allMessages) {
      for (const message of messages) {
        const messageEmbedding = await generateEmbedding(message.content)
        const similarity = cosineSimilarity(queryEmbedding, messageEmbedding)

        if (similarity > 0.5) {
          // Only include results above similarity threshold
          results.push({ message, conversationId, similarity })
        }
      }
    }

    // Sort by similarity and return top K
    return results.sort((a, b) => b.similarity - a.similarity).slice(0, topK)
  } catch (error) {
    console.error("Error in semantic search:", error)
    return []
  }
}

/**
 * Extract key topics from a conversation
 */
export async function extractTopics(messages: Message[]): Promise<string[]> {
  if (messages.length === 0) return []

  try {
    const conversationText = messages.map((m) => m.content).join(" ")

    const { text } = await generateText({
      model: "openai/gpt-4-mini",
      prompt: `Extract 3-5 key topics or themes from this conversation:\n\n${conversationText}\n\nRespond with a comma-separated list of topics only.`,
      maxTokens: 100,
    })

    return text
      .split(",")
      .map((topic) => topic.trim())
      .filter((topic) => topic.length > 0)
  } catch (error) {
    console.error("Error extracting topics:", error)
    return []
  }
}
