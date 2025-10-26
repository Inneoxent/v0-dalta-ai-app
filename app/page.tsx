"use client"

import { useEffect, useState } from "react"
import { AuthProvider, useAuth } from "@/lib/auth-context"
import { PWAProvider } from "@/lib/pwa-context"
import LoginPage from "@/components/auth/login-page"
import ChatPage from "@/components/chat/chat-page"

function AppContent() {
  const { user, loading } = useAuth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading Dalta AI...</p>
        </div>
      </div>
    )
  }

  return user ? <ChatPage /> : <LoginPage />
}

export default function Home() {
  return (
    <PWAProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </PWAProvider>
  )
}
