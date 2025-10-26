import { describe, it, expect, beforeEach, vi } from "vitest"

describe("Authentication", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should sign in with valid credentials", async () => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "demo@dalta.ai",
        password: "demo123",
      }),
    })
    expect(response.ok).toBe(true)
  })

  it("should reject invalid credentials", async () => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "wrong@example.com",
        password: "wrong",
      }),
    })
    expect(response.status).toBe(401)
  })
})
