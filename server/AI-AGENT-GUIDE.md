# Dalta AI Agent & Semantic Search Guide

## Overview

The Dalta AI Agent is a sophisticated conversation pipeline that combines:
- **AI Language Model Integration**: Uses OpenAI GPT-4 via Vercel AI SDK
- **Semantic Search**: Finds relevant context from conversation history using embeddings
- **Conversation Management**: Maintains context and generates meaningful titles
- **Topic Extraction**: Automatically identifies key topics in conversations

## Architecture

### Components

1. **AI Agent** (`ai-agent.ts`)
   - Generates embeddings for semantic understanding
   - Finds relevant context from conversation history
   - Processes messages through the language model
   - Extracts topics and generates conversation titles

2. **Conversation Pipeline** (`conversation-pipeline.ts`)
   - Orchestrates the message processing workflow
   - Manages conversation state and context
   - Analyzes conversations for insights

3. **Embeddings Store** (`embeddings-store.ts`)
   - In-memory vector storage for embeddings
   - Semantic search across stored embeddings
   - Conversation-specific embedding retrieval

## How It Works

### Message Processing Flow

\`\`\`
User Message
    ↓
Generate Embedding
    ↓
Find Relevant Context (Semantic Search)
    ↓
Build System Prompt with Context
    ↓
Call Language Model (GPT-4)
    ↓
Generate Response
    ↓
Store Embeddings
    ↓
Extract Topics
    ↓
Return Response to User
\`\`\`

### Semantic Search

The system uses cosine similarity to find semantically similar messages:

1. **Query Embedding**: Convert user query to vector
2. **Message Embeddings**: Convert all messages to vectors
3. **Similarity Calculation**: Compute cosine similarity between vectors
4. **Ranking**: Sort by similarity score
5. **Context Selection**: Use top-K most similar messages as context

## API Endpoints

### Chat with AI Agent

\`\`\`bash
POST /api/chat
Authorization: Bearer <token>
Content-Type: application/json

{
  "conversationId": "conv-123",
  "message": "What did we discuss about project X?"
}

Response:
{
  "userMessage": { ... },
  "assistantMessage": { ... },
  "topics": ["project", "discussion", "planning"],
  "processingTime": 1250
}
\`\`\`

### Semantic Search

\`\`\`bash
GET /api/semantic-search?q=project+timeline&limit=10
Authorization: Bearer <token>

Response:
{
  "results": [
    {
      "message": { ... },
      "conversationId": "conv-123",
      "similarity": 0.87
    },
    ...
  ],
  "query": "project timeline",
  "count": 5
}
\`\`\`

## Configuration

### Environment Variables

\`\`\`env
# AI Model Configuration
OPENAI_API_KEY=sk-...
AI_MODEL=openai/gpt-4-mini

# Embedding Model
EMBEDDING_MODEL=openai/text-embedding-3-small

# Search Configuration
SEMANTIC_SEARCH_THRESHOLD=0.5
SEMANTIC_SEARCH_TOP_K=5
\`\`\`

### Model Selection

- **Chat Model**: `openai/gpt-4-mini` (fast, cost-effective)
- **Embedding Model**: `openai/text-embedding-3-small` (efficient, 384 dimensions)

For production, consider:
- `openai/gpt-4-turbo` for higher quality responses
- `openai/text-embedding-3-large` for better semantic understanding

## Performance Optimization

### Caching

Implement caching for frequently accessed embeddings:

\`\`\`typescript
const embeddingCache = new Map<string, number[]>()

function getCachedEmbedding(text: string): number[] | null {
  return embeddingCache.get(text) || null
}

function cacheEmbedding(text: string, embedding: number[]): void {
  embeddingCache.set(text, embedding)
}
\`\`\`

### Batch Processing

Process multiple messages in parallel:

\`\`\`typescript
const embeddings = await Promise.all(
  messages.map(msg => generateEmbedding(msg.content))
)
\`\`\`

### Vector Database Integration

For production, replace in-memory store with:

- **Pinecone**: Managed vector database
- **Weaviate**: Open-source vector search
- **pgvector**: PostgreSQL extension
- **Supabase Vector**: Managed pgvector

## Advanced Features

### Context Window Management

Limit context to recent messages to avoid token limits:

\`\`\`typescript
const contextMessages = messages.slice(-10) // Last 10 messages
\`\`\`

### Temperature Control

Adjust response creativity:

\`\`\`typescript
temperature: 0.7  // Balanced (default)
temperature: 0.3  // More deterministic
temperature: 0.9  // More creative
\`\`\`

### Token Counting

Monitor token usage:

\`\`\`typescript
const estimatedTokens = text.split(/\s+/).length * 1.3
\`\`\`

## Troubleshooting

### Embeddings Not Generated

- Check API key configuration
- Verify network connectivity
- Fallback to simple hash-based embeddings

### Poor Search Results

- Increase `topK` parameter
- Lower similarity threshold
- Use longer context windows
- Consider fine-tuned models

### Slow Response Times

- Reduce context window size
- Use faster model (`gpt-4-mini`)
- Implement caching
- Batch process embeddings

## Future Enhancements

1. **Fine-tuned Models**: Train on domain-specific data
2. **Multi-modal Search**: Support images and documents
3. **Real-time Streaming**: Stream responses as they're generated
4. **Conversation Summarization**: Auto-summarize long conversations
5. **Intent Recognition**: Classify user intents
6. **Entity Extraction**: Extract key entities from messages
7. **Fact Verification**: Verify claims against knowledge base
8. **Multi-language Support**: Support multiple languages

## Resources

- [Vercel AI SDK Documentation](https://sdk.vercel.ai)
- [OpenAI API Reference](https://platform.openai.com/docs)
- [Embeddings Guide](https://platform.openai.com/docs/guides/embeddings)
- [Vector Search Best Practices](https://www.pinecone.io/learn/vector-search/)
