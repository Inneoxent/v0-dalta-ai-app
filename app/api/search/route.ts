import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const query = request.nextUrl.searchParams.get("q")

    if (!query) {
      return NextResponse.json({ results: [] })
    }

    // Demo semantic search - in production, use embeddings
    return NextResponse.json({
      results: [
        {
          id: "1",
          content: `Result for "${query}"`,
          score: 0.95,
        },
      ],
    })
  } catch (error) {
    return NextResponse.json({ error: "Search failed" }, { status: 500 })
  }
}
