'use client'

import { useState } from 'react'
import { 
  Pencil, 
  Eraser, 
  Pipette, 
  PaintBucket, 
  Sun,
  Undo2,
  Redo2,
  Copy,
} from 'lucide-react'
import type { BrushTool, RGBAColor } from '@/types/skin'
import { rgbaToHex } from '@/lib/brush-algorithms'
import { cn } from '@/lib/utils'

interface CombinedToolbarProps {
  currentTool: BrushTool
  onToolChange: (tool: BrushTool) => void
  onUndo: () => void
  onRedo: () => void
  canUndo: boolean
  canRedo: boolean
  currentColor: RGBAColor
  onColorClick: () => void
  onCopyPart?: () => void
  shadingMode?: 'darken' | 'lighten'
  onShadingModeChange?: (mode: 'darken' | 'lighten') => void
  className?: string
}

const TOOLS: Array<{ id: BrushTool; icon: React.ReactNode; label: string; shortcut?: string }> = [
  { id: 'pen', icon: <Pencil className="h-4 w-4" />, label: 'Pen', shortcut: 'P' },
  { id: 'eraser', icon: <Eraser className="h-4 w-4" />, label: 'Eraser', shortcut: 'E' },
  { id: 'eyedropper', icon: <Pipette className="h-4 w-4" />, label: 'Eyedropper', shortcut: 'I' },
  { id: 'bucket', icon: <PaintBucket className="h-4 w-4" />, label: 'Bucket Fill', shortcut: 'G' },
  { id: 'shading', icon: <Sun className="h-4 w-4" />, label: 'Shading (Darken/Lighten)', shortcut: 'S' },
  { id: 'copy', icon: <Copy className="h-4 w-4" />, label: 'Copy to similar parts', shortcut: 'C' },
]

export function CombinedToolbar({
  currentTool,
  onToolChange,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  currentColor,
  onColorClick,
  onCopyPart,
  shadingMode = 'darken',
  onShadingModeChange,
  className,
}: CombinedToolbarProps) {
  const [localShadingMode, setLocalShadingMode] = useState<'darken' | 'lighten'>(shadingMode)

  const handleToolClick = (toolId: BrushTool) => {
    if (toolId === 'copy') {
      // Copy tool triggers action immediately
      onCopyPart?.()
      return
    }
    if (toolId === 'shading' && currentTool === 'shading') {
      // Toggle between darken/lighten when clicking shading tool again
      const newMode = localShadingMode === 'darken' ? 'lighten' : 'darken'
      setLocalShadingMode(newMode)
      onShadingModeChange?.(newMode)
    } else {
      onToolChange(toolId)
    }
  }

  return (
    <div className={cn('flex items-center justify-between rounded-xl bg-obsidian-card p-1', className)}>
      {/* Left: Tools */}
      <div className="flex items-center gap-0.5">
        {TOOLS.map((tool) => (
          <button
            key={tool.id}
            onClick={() => handleToolClick(tool.id)}
            className={cn(
              'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg transition-all relative',
              currentTool === tool.id
                ? 'bg-neon text-obsidian neon-glow-sm'
                : 'text-muted-foreground hover:bg-obsidian-elevated hover:text-foreground'
            )}
            title={`${tool.label}${tool.shortcut ? ` (${tool.shortcut})` : ''}${tool.id === 'shading' ? ` - ${localShadingMode === 'darken' ? 'Darken' : 'Lighten'}` : ''}`}
          >
            {tool.icon}
            {tool.id === 'shading' && currentTool === 'shading' && (
              <span className="absolute -bottom-0.5 text-[8px] font-bold">
                {localShadingMode === 'darken' ? '-' : '+'}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Center: Undo/Redo */}
      <div className="flex items-center gap-0.5">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className={cn(
            'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg transition-all',
            canUndo
              ? 'text-muted-foreground hover:bg-obsidian-elevated hover:text-foreground'
              : 'cursor-not-allowed text-muted-foreground/30'
          )}
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className="h-4 w-4" />
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className={cn(
            'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg transition-all',
            canRedo
              ? 'text-muted-foreground hover:bg-obsidian-elevated hover:text-foreground'
              : 'cursor-not-allowed text-muted-foreground/30'
          )}
          title="Redo (Ctrl+Shift+Z)"
        >
          <Redo2 className="h-4 w-4" />
        </button>
      </div>

      {/* Right: Single color button */}
      <button
        onClick={onColorClick}
        className="h-9 w-9 flex-shrink-0 rounded-lg border-2 border-border transition-all hover:border-foreground/50 active:scale-95"
        style={{ backgroundColor: rgbaToHex(currentColor) }}
        title="Open color picker"
      />
    </div>
  )
}
