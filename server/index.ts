import express, { type Request, type Response, type NextFunction } from "express"
import cors from "cors"
import jwt from "jsonwebtoken"
import { v4 as uuidv4 } from "uuid"

const app = express()
const PORT = process.env.PORT || 3001
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production"

// Middleware
app.use(cors())
app.use(express.json())

// In-memory storage (replace with database in production)
interface User {
  id: string
  email: string
  password: string
  createdAt: Date
  updatedAt: Date
}

interface Message {
  id: string
  conversationId: string
  role: "user" | "assistant" | "system"
  content: string
  timestamp: Date
}

interface Conversation {
  id: string
  userId: string
  title: string
  createdAt: Date
  updatedAt: Date
}

const users: Map<string, User> = new Map()
const conversations: Map<string, Conversation> = new Map()
const messages: Map<string, Message[]> = new Map()

// Demo user
users.set("demo-user", {
  id: "demo-user",
  email: "demo@dalta.ai",
  password: "demo123",
  createdAt: new Date(),
  updatedAt: new Date(),
})

// Authentication middleware
interface AuthRequest extends Request {
  userId?: string
}

const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]

  if (!token) {
    return res.status(401).json({ error: "Access token required" })
  }

  jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
    if (err) {
      return res.status(403).json({ error: "Invalid token" })
    }
    req.userId = decoded.userId
    next()
  })
}

// Auth Routes
app.post("/api/auth/signup", (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" })
    }

    if (password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters" })
    }

    // Check if user exists
    for (const user of users.values()) {
      if (user.email === email) {
        return res.status(400).json({ error: "User already exists" })
      }
    }

    const userId = uuidv4()
    const newUser: User = {
      id: userId,
      email,
      password, // In production, hash the password
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    users.set(userId, newUser)

    const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" })

    res.status(201).json({
      id: userId,
      email,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt,
      token,
    })
  } catch (error) {
    res.status(500).json({ error: "Internal server error" })
  }
})

app.post("/api/auth/login", (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" })
    }

    let user: User | undefined
    for (const u of users.values()) {
      if (u.email === email && u.password === password) {
        user = u
        break
      }
    }

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" })

    res.json({
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      token,
    })
  } catch (error) {
    res.status(500).json({ error: "Internal server error" })
  }
})

app.post("/api/auth/logout", authenticateToken, (req: AuthRequest, res: Response) => {
  // In production, invalidate token in blacklist
  res.json({ message: "Logged out successfully" })
})

app.get("/api/auth/me", authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const user = users.get(req.userId!)
    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    res.json({
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    })
  } catch (error) {
    res.status(500).json({ error: "Internal server error" })
  }
})

// Conversation Routes
app.get("/api/conversations", authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const limit = Number.parseInt(req.query.limit as string) || 20
    const offset = Number.parseInt(req.query.offset as string) || 0

    const userConversations = Array.from(conversations.values())
      .filter((c) => c.userId === req.userId)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      .slice(offset, offset + limit)

    res.json({
      conversations: userConversations,
      total: Array.from(conversations.values()).filter((c) => c.userId === req.userId).length,
    })
  } catch (error) {
    res.status(500).json({ error: "Internal server error" })
  }
})

app.post("/api/conversations", authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const { title } = req.body

    if (!title) {
      return res.status(400).json({ error: "Title required" })
    }

    const conversationId = uuidv4()
    const newConversation: Conversation = {
      id: conversationId,
      userId: req.userId!,
      title,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    conversations.set(conversationId, newConversation)
    messages.set(conversationId, [])

    res.status(201).json(newConversation)
  } catch (error) {
    res.status(500).json({ error: "Internal server error" })
  }
})

app.get("/api/conversations/:conversationId", authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const { conversationId } = req.params
    const conversation = conversations.get(conversationId)

    if (!conversation || conversation.userId !== req.userId) {
      return res.status(404).json({ error: "Conversation not found" })
    }

    const conversationMessages = messages.get(conversationId) || []

    res.json({
      conversation,
      messages: conversationMessages,
    })
  } catch (error) {
    res.status(500).json({ error: "Internal server error" })
  }
})

app.delete("/api/conversations/:conversationId", authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const { conversationId } = req.params
    const conversation = conversations.get(conversationId)

    if (!conversation || conversation.userId !== req.userId) {
      return res.status(404).json({ error: "Conversation not found" })
    }

    conversations.delete(conversationId)
    messages.delete(conversationId)

    res.json({ message: "Conversation deleted" })
  } catch (error) {
    res.status(500).json({ error: "Internal server error" })
  }
})

// Chat Routes
app.post("/api/chat", authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const { conversationId, message: userMessage } = req.body

    if (!conversationId || !userMessage) {
      return res.status(400).json({ error: "Conversation ID and message required" })
    }

    const conversation = conversations.get(conversationId)
    if (!conversation || conversation.userId !== req.userId) {
      return res.status(404).json({ error: "Conversation not found" })
    }

    // Add user message
    const userMsg: Message = {
      id: uuidv4(),
      conversationId,
      role: "user",
      content: userMessage,
      timestamp: new Date(),
    }

    const conversationMessages = messages.get(conversationId) || []
    conversationMessages.push(userMsg)

    // Generate AI response (demo)
    const aiResponse = `I received your message: "${userMessage}". This is a demo response from Dalta AI. In production, this would be powered by an AI model.`

    const assistantMsg: Message = {
      id: uuidv4(),
      conversationId,
      role: "assistant",
      content: aiResponse,
      timestamp: new Date(),
    }

    conversationMessages.push(assistantMsg)
    messages.set(conversationId, conversationMessages)

    // Update conversation timestamp
    conversation.updatedAt = new Date()

    res.json({
      userMessage: userMsg,
      assistantMessage: assistantMsg,
    })
  } catch (error) {
    res.status(500).json({ error: "Internal server error" })
  }
})

// Search Routes
app.get("/api/search", authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const query = (req.query.q as string) || ""
    const limit = Number.parseInt(req.query.limit as string) || 20

    if (!query.trim()) {
      return res.status(400).json({ error: "Search query required" })
    }

    const results: any[] = []
    const searchLower = query.toLowerCase()

    // Search in conversations
    for (const [, conv] of conversations) {
      if (conv.userId === req.userId && conv.title.toLowerCase().includes(searchLower)) {
        results.push({
          type: "conversation",
          data: conv,
        })
      }
    }

    // Search in messages
    for (const [convId, msgs] of messages) {
      const conversation = conversations.get(convId)
      if (conversation && conversation.userId === req.userId) {
        for (const msg of msgs) {
          if (msg.content.toLowerCase().includes(searchLower)) {
            results.push({
              type: "message",
              data: msg,
            })
          }
        }
      }
    }

    res.json({
      results: results.slice(0, limit),
    })
  } catch (error) {
    res.status(500).json({ error: "Internal server error" })
  }
})

// Health check
app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok" })
})

// Start server
app.listen(PORT, () => {
  console.log(`Dalta AI Server running on http://localhost:${PORT}`)
  console.log(`API Documentation: http://localhost:${PORT}/api-docs`)
  console.log(`Demo credentials: email: demo@dalta.ai, password: demo123`)
})
