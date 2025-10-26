import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Demo authentication - in production, use proper auth
    if (email === "demo@dalta.ai" && password === "demo123") {
      return NextResponse.json({
        id: "demo-user",
        email: "demo@dalta.ai",
        createdAt: new Date(),
      })
    }

    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
