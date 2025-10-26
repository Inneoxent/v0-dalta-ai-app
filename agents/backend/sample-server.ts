import express from "express"
import cors from "cors"
import jwt from "jsonwebtoken"

const app = express()
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret"

app.use(cors())
app.use(express.json())

// Middleware to verify JWT
const verifyToken = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(" ")[1]
  if (!token) return res.status(401).json({ error: "No token" })

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.user = decoded
    next()
  } catch (error) {
    res.status(401).json({ error: "Invalid token" })
  }
}

// Auth endpoints
app.post("/v1/auth/signup", (req, res) => {
  const { email, password } = req.body
  if (!email || !password) {
    return res.status(400).json({ error: "Missing credentials" })
  }

  const user = {
    id: Date.now().toString(),
    email,
    createdAt: new Date(),
  }

  const token = jwt.sign({ userId: user.id }, JWT_SECRET)
  res.status(201).json({ user, token })
})

app.post("/v1/auth/login", (req, res) => {
  const { email, password } = req.body
  // In production, verify against database
  if (email === "demo@dalta.ai" && password === "demo123") {
    const user = { id: "demo-user", email, createdAt: new Date() }
    const token = jwt.sign({ userId: user.id }, JWT_SECRET)
    return res.json({ user, token })
  }

  res.status(401).json({ error: "Invalid credentials" })
})

// Chat endpoint
app.post("/v1/chat", verifyToken, (req, res) => {
  const { conversationId, message } = req.body

  // Demo AI response
  const aiResponse = `Echo: ${message}`

  res.json({
    id: Date.now().toString(),
    conversationId,
    role: "assistant",
    content: aiResponse,
    timestamp: new Date().toISOString(),
  })
})

// Search endpoint
app.get("/v1/search", verifyToken, (req, res) => {
  const query = req.query.q as string
  res.json({
    results: [
      {
        id: "1",
        content: `Result for "${query}"`,
        timestamp: new Date().toISOString(),
      },
    ],
  })
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Dalta AI server running on port ${PORT}`)
})
