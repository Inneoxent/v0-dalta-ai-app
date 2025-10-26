"use client"

import type React from "react"

import { useEffect } from "react"

export function PWAProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Register service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch((error) => {
        console.error("Service Worker registration failed:", error)
      })
    }

    // Initialize IndexedDB
    if ("indexedDB" in window) {
      const request = indexedDB.open("dalta-ai", 1)
      request.onupgradeneeded = (e) => {
        const db = (e.target as IDBOpenDBRequest).result
        if (!db.objectStoreNames.contains("messages")) {
          db.createObjectStore("messages", { keyPath: "id" })
        }
        if (!db.objectStoreNames.contains("queue")) {
          db.createObjectStore("queue", { keyPath: "id" })
        }
      }
    }
  }, [])

  return <>{children}</>
}
