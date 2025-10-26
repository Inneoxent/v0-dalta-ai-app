import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  // In production, clear JWT token
  return NextResponse.json({ success: true })
}
