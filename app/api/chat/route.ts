import { type NextRequest, NextResponse } from "next/server"
import { AGENTS } from "@/lib/agents"

export async function POST(request: NextRequest) {
  try {
    const { conversationId, message, userId, agentId = "agent-1" } = await request.json()

    const agent = AGENTS[agentId as keyof typeof AGENTS]
    if (!agent) {
      return NextResponse.json({ error: "Invalid agent" }, { status: 400 })
    }

    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: agent.model,
        messages: [
          {
            role: "system",
            content: agent.systemPrompt,
          },
          {
            role: "user",
            content: message,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    })

    if (!openaiResponse.ok) {
      const error = await openaiResponse.json()
      console.error("OpenAI API error:", error)
      return NextResponse.json({ error: "Failed to get AI response" }, { status: 500 })
    }

    const data = await openaiResponse.json()
    const aiResponse = data.choices[0].message.content

    return NextResponse.json({
      id: Date.now().toString(),
      content: aiResponse,
      timestamp: new Date().toISOString(),
      conversationId,
      agentId,
    })
  } catch (error) {
    console.error("Error in chat API:", error)
    return NextResponse.json({ error: "Failed to process message" }, { status: 500 })
  }
}
