"use client"

import { cn } from "@/lib/utils"

interface GridBackgroundProps {
  children: React.ReactNode
  className?: string
}

export function GridBackground({ children, className }: GridBackgroundProps) {
  return (
    <div className={cn("cyber-grid bg-obsidian overflow-hidden", className)}>
      {children}
    </div>
  )
}
