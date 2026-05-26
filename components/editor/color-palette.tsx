'use client'

import { useRef } from 'react'
import { Plus } from 'lucide-react'
import type { RGBAColor } from '@/types/skin'
import { rgbaToHex, hexToRgba } from '@/lib/brush-algorithms'
import { cn } from '@/lib/utils'

interface ColorPaletteProps {
  palette: RGBAColor[]
  currentColor: RGBAColor
  onColorChange: (color: RGBAColor) => void
  onAddColor?: (color: RGBAColor) => void
  className?: string
}

export function ColorPalette({
  palette,
  currentColor,
  onColorChange,
  onAddColor,
  className,
}: ColorPaletteProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const handleColorInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = hexToRgba(e.target.value, currentColor.a)
    onColorChange(color)
  }

  return (
    <div className={cn('flex items-center gap-1 rounded-xl bg-obsidian-card p-1.5', className)}>
      {/* Active color swatch — doubles as color picker trigger */}
      <div className="relative flex-shrink-0">
        <div
          className="h-11 w-11 rounded-lg border-2 border-neon neon-glow-sm"
          style={{ backgroundColor: rgbaToHex(currentColor) }}
        />
        <input
          type="color"
          value={rgbaToHex(currentColor)}
          onChange={handleColorInput}
          className="absolute inset-0 cursor-pointer opacity-0"
          title="Pick a color"
        />
      </div>

      {/* Separator */}
      <div className="mx-0.5 h-6 w-px flex-shrink-0 bg-border" />

      {/* Horizontally scrollable palette swatches */}
      <div
        ref={scrollRef}
        className="flex flex-1 items-center gap-1.5 overflow-x-auto"
        style={{ scrollbarWidth: 'none' }}
      >
        {palette.map((color, index) => {
          const hex = rgbaToHex(color)
          const isActive =
            color.r === currentColor.r &&
            color.g === currentColor.g &&
            color.b === currentColor.b &&
            color.a === currentColor.a

          return (
            <button
              key={`${hex}-${index}`}
              onClick={() => onColorChange(color)}
              className={cn(
                'h-9 w-9 flex-shrink-0 rounded-lg transition-transform hover:scale-110',
                isActive && 'ring-2 ring-neon ring-offset-1 ring-offset-obsidian-card'
              )}
              style={{ backgroundColor: hex }}
              title={hex}
            />
          )
        })}
      </div>

      {/* Separator */}
      <div className="mx-0.5 h-6 w-px flex-shrink-0 bg-border" />

      {/* Add to palette button */}
      {onAddColor && (
        <button
          onClick={() => onAddColor(currentColor)}
          className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-obsidian-elevated hover:text-foreground"
          title="Add current color to palette"
        >
          <Plus className="h-5 w-5" />
        </button>
      )}
    </div>
  )
}
