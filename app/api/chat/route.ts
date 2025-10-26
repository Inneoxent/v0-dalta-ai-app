import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { conversationId, message, userId } = await request.json()

    // Demo AI response - in production, call actual AI model
    const aiResponse = `I received your message: "${message}". This is a demo response from Dalta AI.`

    return NextResponse.json({
      id: Date.now().toString(),
      content: aiResponse,
      timestamp: new Date().toISOString(),
      conversationId,
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to process message" }, { status: 500 })
  }
}
