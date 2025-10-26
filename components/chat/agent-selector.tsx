"use client"

import { AGENTS } from "@/lib/agents"
import { useAgentStore } from "@/lib/agent-store"
import { Button } from "@/components/ui/button"

export default function AgentSelector() {
  const { selectedAgentId, setSelectedAgent } = useAgentStore()

  return (
    <div className="p-4 border-b border-border bg-card">
      <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Select Agent</p>
      <div className="grid grid-cols-2 gap-2">
        {Object.values(AGENTS).map((agent) => (
          <Button
            key={agent.id}
            onClick={() => setSelectedAgent(agent.id)}
            variant={selectedAgentId === agent.id ? "default" : "outline"}
            className={`flex flex-col items-center justify-center h-auto py-3 px-2 text-xs transition-all duration-200 ${
              selectedAgentId === agent.id
                ? `bg-gradient-to-r ${agent.color} text-white border-0 glow-gold`
                : "border-border/50 hover:border-primary/50"
            }`}
            title={agent.description}
          >
            <span className="text-lg mb-1">{agent.icon}</span>
            <span className="font-semibold text-center line-clamp-2">{agent.name}</span>
          </Button>
        ))}
      </div>
    </div>
  )
}
