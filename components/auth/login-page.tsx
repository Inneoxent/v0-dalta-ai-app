"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"

export default function LoginPage() {
  const { signIn, signUp } = useAuth()
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      if (isSignUp) {
        await signUp(email, password)
      } else {
        await signIn(email, password)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-transparent to-transparent pointer-events-none" />

      <Card className="w-full max-w-md p-8 border border-gold-glow bg-card relative z-10">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-4xl">✨</span>
            <h1 className="text-3xl font-bold text-gold-glow">Dalta AI</h1>
          </div>
          <p className="text-muted-foreground">Premium AI assistant with offline support</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              disabled={loading}
              required
              className="bg-background border-border/50 focus:border-primary/50"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={loading}
              required
              className="bg-background border-border/50 focus:border-primary/50"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-900/20 border border-red-700/50 rounded text-red-400 text-sm font-medium">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold glow-gold transition-all duration-300"
          >
            {loading ? "Loading..." : isSignUp ? "Sign Up" : "Sign In"}
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-border/50">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="w-full text-center text-sm text-primary hover:text-primary/80 transition font-medium"
          >
            {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
          </button>
        </div>

        <div className="mt-6 pt-6 border-t border-border/50">
          <p className="text-xs text-muted-foreground text-center mb-3 font-semibold">Demo Credentials:</p>
          <p className="text-xs text-muted-foreground text-center">Email: demo@dalta.ai</p>
          <p className="text-xs text-muted-foreground text-center">Password: demo123</p>
        </div>
      </Card>
    </div>
  )
}
