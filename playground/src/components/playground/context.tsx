import { createContext, useContext, type ReactNode } from 'react'
import { usePlayground, type Playground } from '@/hooks/use-playground'

const PlaygroundContext = createContext<Playground | null>(null)

export function PlaygroundProvider({ children }: { children: ReactNode }) {
  return <PlaygroundContext.Provider value={usePlayground()}>{children}</PlaygroundContext.Provider>
}

export function usePlaygroundContext(): Playground {
  const ctx = useContext(PlaygroundContext)
  if (!ctx) throw new Error('usePlaygroundContext must be used within a PlaygroundProvider')
  return ctx
}
