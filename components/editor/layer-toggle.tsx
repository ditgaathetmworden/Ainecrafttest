'use client'

import type { SkinLayer } from '@/types/skin'
import { cn } from '@/lib/utils'

interface LayerToggleProps {
  selectedLayer: SkinLayer
  onLayerChange: (layer: SkinLayer) => void
  className?: string
}

export function LayerToggle({
  selectedLayer,
  onLayerChange,
  className,
}: LayerToggleProps) {
  return (
    <div className={cn('flex rounded-xl bg-obsidian-card p-1', className)}>
      <button
        onClick={() => onLayerChange('base')}
        className={cn(
          'flex-1 rounded-lg py-2.5 text-xs font-semibold tracking-wide transition-all',
          selectedLayer === 'base'
            ? 'pill-selected'
            : 'pill-unselected'
        )}
      >
        Base Layer
      </button>
      <button
        onClick={() => onLayerChange('outer')}
        className={cn(
          'flex-1 rounded-lg py-2.5 text-xs font-semibold tracking-wide transition-all',
          selectedLayer === 'outer'
            ? 'pill-selected'
            : 'pill-unselected'
        )}
      >
        Outer Layer
      </button>
    </div>
  )
}
