"use client"

import { useEffect, useState } from "react"
import type { Message } from "./types"

export function useOfflineQueue() {
  const [isOnline, setIsOnline] = useState(true)
  const [queue, setQueue] = useState<Message[]>([])

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  const queueMessage = (message: Message) => {
    setQueue((prev) => [...prev, message])
    // Store in IndexedDB for persistence
    if ("indexedDB" in window) {
      const request = indexedDB.open("dalta-ai", 1)
      request.onsuccess = (e) => {
        const db = (e.target as IDBOpenDBRequest).result
        const tx = db.transaction("queue", "readwrite")
        tx.objectStore("queue").add(message)
      }
    }
  }

  return { isOnline, queue, queueMessage }
}
