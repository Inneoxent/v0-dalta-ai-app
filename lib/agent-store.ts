import { create } from "zustand"
import { AGENTS } from "./agents"

interface AgentStore {
  selectedAgentId: string
  setSelectedAgent: (agentId: string) => void
  getSelectedAgent: () => (typeof AGENTS)[string]
}

export const useAgentStore = create<AgentStore>((set, get) => ({
  selectedAgentId: "agent-1",
  setSelectedAgent: (agentId: string) => set({ selectedAgentId: agentId }),
  getSelectedAgent: () => AGENTS[get().selectedAgentId],
}))
