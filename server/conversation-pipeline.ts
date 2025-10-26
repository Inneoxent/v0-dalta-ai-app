import type { Message, Conversation } from "./index"
import { processMessage, generateConversationTitle, extractTopics } from "./ai-agent"

export interface PipelineContext {
  conversation: Conversation
  messages: Message[]
  userId: string
}

export interface PipelineResult {
  userMessage: Message
  assistantMessage: Message
  topics?: string[]
  processingTime: number
}

/**
 * Main conversation pipeline that orchestrates the AI agent
 */
export async function runConversationPipeline(userContent: string, context: PipelineContext): Promise<PipelineResult> {
  const startTime = Date.now()

  try {
    // Step 1: Create user message
    const userMessage: Message = {
      id: generateId(),
      conversationId: context.conversation.id,
      role: "user",
      content: userContent,
      timestamp: new Date(),
    }

    // Step 2: Process through AI agent
    const assistantContent = await processMessage(userContent, {
      conversation: context.conversation,
      messages: context.messages,
      relevantHistory: [],
    })

    // Step 3: Create assistant message
    const assistantMessage: Message = {
      id: generateId(),
      conversationId: context.conversation.id,
      role: "assistant",
      content: assistantContent,
      timestamp: new Date(),
    }

    // Step 4: Extract topics if conversation is long enough
    let topics: string[] | undefined
    if (context.messages.length > 5) {
      topics = await extractTopics([...context.messages, userMessage, assistantMessage])
    }

    // Step 5: Update conversation title if it's the first message
    if (context.messages.length === 0) {
      context.conversation.title = await generateConversationTitle(userContent)
    }

    const processingTime = Date.now() - startTime

    return {
      userMessage,
      assistantMessage,
      topics,
      processingTime,
    }
  } catch (error) {
    console.error("Pipeline error:", error)
    throw new Error("Failed to process conversation")
  }
}

/**
 * Batch process multiple messages for conversation analysis
 */
export async function analyzeConversation(
  messages: Message[],
  conversation: Conversation,
): Promise<{
  topics: string[]
  summary: string
  messageCount: number
}> {
  try {
    const topics = await extractTopics(messages)

    // Generate a brief summary
    const conversationText = messages.map((m) => `${m.role}: ${m.content}`).join("\n")

    const summary = `Conversation with ${messages.filter((m) => m.role === "user").length} user messages and ${messages.filter((m) => m.role === "assistant").length} assistant responses.`

    return {
      topics,
      summary,
      messageCount: messages.length,
    }
  } catch (error) {
    console.error("Error analyzing conversation:", error)
    return {
      topics: [],
      summary: "Unable to analyze conversation",
      messageCount: messages.length,
    }
  }
}

/**
 * Generate a unique ID
 */
function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}
