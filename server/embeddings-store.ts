/**
 * In-memory embeddings store for semantic search
 * In production, use a vector database like Pinecone, Weaviate, or pgvector
 */

interface StoredEmbedding {
  id: string
  conversationId: string
  messageId: string
  content: string
  embedding: number[]
  timestamp: Date
}

export class EmbeddingsStore {
  private embeddings: Map<string, StoredEmbedding> = new Map()

  /**
   * Store an embedding
   */
  storeEmbedding(conversationId: string, messageId: string, content: string, embedding: number[]): void {
    const id = `${conversationId}:${messageId}`
    this.embeddings.set(id, {
      id,
      conversationId,
      messageId,
      content,
      embedding,
      timestamp: new Date(),
    })
  }

  /**
   * Retrieve embeddings for a conversation
   */
  getConversationEmbeddings(conversationId: string): StoredEmbedding[] {
    return Array.from(this.embeddings.values()).filter((e) => e.conversationId === conversationId)
  }

  /**
   * Search embeddings by similarity
   */
  searchByEmbedding(queryEmbedding: number[], topK = 10): StoredEmbedding[] {
    const results = Array.from(this.embeddings.values()).map((stored) => ({
      stored,
      similarity: this.cosineSimilarity(queryEmbedding, stored.embedding),
    }))

    return results
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK)
      .map((r) => r.stored)
  }

  /**
   * Delete embeddings for a conversation
   */
  deleteConversationEmbeddings(conversationId: string): void {
    const keysToDelete: string[] = []
    for (const [key, embedding] of this.embeddings) {
      if (embedding.conversationId === conversationId) {
        keysToDelete.push(key)
      }
    }
    keysToDelete.forEach((key) => this.embeddings.delete(key))
  }

  /**
   * Calculate cosine similarity
   */
  private cosineSimilarity(a: number[], b: number[]): number {
    let dotProduct = 0
    let normA = 0
    let normB = 0

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i]
      normA += a[i] * a[i]
      normB += b[i] * b[i]
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
  }

  /**
   * Get statistics
   */
  getStats(): {
    totalEmbeddings: number
    conversationCount: number
  } {
    const conversationIds = new Set(Array.from(this.embeddings.values()).map((e) => e.conversationId))
    return {
      totalEmbeddings: this.embeddings.size,
      conversationCount: conversationIds.size,
    }
  }
}

export const embeddingsStore = new EmbeddingsStore()
