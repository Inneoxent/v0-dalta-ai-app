import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  // In production, verify JWT token from cookies
  return NextResponse.json(null, { status: 401 })
}
