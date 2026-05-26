'use client'

import { 
  Pencil, 
  Eraser, 
  Pipette, 
  PaintBucket, 
  Layers,
  Undo2,
  Redo2,
  Sparkles,
  CircleDot,
  Droplet
} from 'lucide-react'
import type { BrushTool } from '@/types/skin'
import { cn } from '@/lib/utils'

interface ToolPaletteProps {
  currentTool: BrushTool
  onToolChange: (tool: BrushTool) => void
  onUndo: () => void
  onRedo: () => void
  canUndo: boolean
  canRedo: boolean
  className?: string
}

const TOOLS: Array<{ id: BrushTool; icon: React.ReactNode; label: string; shortcut?: string }> = [
  { id: 'pen', icon: <Pencil className="h-5 w-5" />, label: 'Pen', shortcut: 'P' },
  { id: 'eraser', icon: <Eraser className="h-5 w-5" />, label: 'Eraser', shortcut: 'E' },
  { id: 'eyedropper', icon: <Pipette className="h-5 w-5" />, label: 'Eyedropper', shortcut: 'I' },
  { id: 'bucket', icon: <PaintBucket className="h-5 w-5" />, label: 'Bucket Fill', shortcut: 'G' },
  { id: 'opacity', icon: <Layers className="h-5 w-5" />, label: 'Opacity' },
]

const SMART_TOOLS: Array<{ id: BrushTool; icon: React.ReactNode; label: string }> = [
  { id: 'noise', icon: <Sparkles className="h-5 w-5" />, label: 'Classic Noise' },
  { id: 'faux-depth', icon: <CircleDot className="h-5 w-5" />, label: 'Faux-Depth' },
  { id: 'cluster', icon: <Droplet className="h-5 w-5" />, label: 'Cluster' },
]

export function ToolPalette({
  currentTool,
  onToolChange,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  className,
}: ToolPaletteProps) {
  return (
    <div className={cn('flex items-center gap-1 rounded-xl bg-obsidian-card p-1.5', className)}>
      {/* Standard Tools */}
      <div className="flex items-center gap-1">
        {TOOLS.map((tool) => (
          <button
            key={tool.id}
            onClick={() => onToolChange(tool.id)}
            className={cn(
              'flex h-11 w-11 items-center justify-center rounded-lg transition-all',
              currentTool === tool.id
                ? 'bg-neon text-obsidian neon-glow-sm'
                : 'text-muted-foreground hover:bg-obsidian-elevated hover:text-foreground'
            )}
            title={`${tool.label}${tool.shortcut ? ` (${tool.shortcut})` : ''}`}
          >
            {tool.icon}
          </button>
        ))}
      </div>

      {/* Separator */}
      <div className="mx-1 h-6 w-px bg-border" />

      {/* Undo/Redo */}
      <div className="flex items-center gap-1">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className={cn(
            'flex h-11 w-11 items-center justify-center rounded-lg transition-all',
            canUndo
              ? 'text-muted-foreground hover:bg-obsidian-elevated hover:text-foreground'
              : 'cursor-not-allowed text-muted-foreground/30'
          )}
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className="h-5 w-5" />
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className={cn(
            'flex h-11 w-11 items-center justify-center rounded-lg transition-all',
            canRedo
              ? 'text-muted-foreground hover:bg-obsidian-elevated hover:text-foreground'
              : 'cursor-not-allowed text-muted-foreground/30'
          )}
          title="Redo (Ctrl+Shift+Z)"
        >
          <Redo2 className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}

// Separate component for smart brushes (shown in expanded mode)
export function SmartToolPalette({
  currentTool,
  onToolChange,
  className,
}: {
  currentTool: BrushTool
  onToolChange: (tool: BrushTool) => void
  className?: string
}) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <span className="text-xs font-medium tracking-wide text-muted-foreground">
        Smart Brushes
      </span>
      <div className="flex gap-1">
        {SMART_TOOLS.map((tool) => (
          <button
            key={tool.id}
            onClick={() => onToolChange(tool.id)}
            className={cn(
              'flex h-10 items-center gap-2 rounded-lg px-3 transition-all',
              currentTool === tool.id
                ? 'bg-neon text-obsidian'
                : 'bg-obsidian-card text-muted-foreground hover:bg-obsidian-elevated hover:text-foreground'
            )}
            title={tool.label}
          >
            {tool.icon}
            <span className="text-xs font-medium">{tool.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
