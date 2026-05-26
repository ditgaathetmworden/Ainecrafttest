'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { BODY_PARTS, BODY_PART_NAMES, BODY_FACES, type BodyPart, type BodyFace } from '@/types/skin'
import { cn } from '@/lib/utils'

interface BodyPartSelectorProps {
  selectedPart: BodyPart
  selectedFace: BodyFace
  onPartChange: (part: BodyPart) => void
  onFaceChange: (face: BodyFace) => void
  className?: string
}

export function BodyPartSelector({
  selectedPart,
  selectedFace,
  onPartChange,
  onFaceChange,
  className,
}: BodyPartSelectorProps) {
  const currentIndex = BODY_PARTS.indexOf(selectedPart)

  const goToPrevPart = () => {
    const prevIndex = currentIndex <= 0 ? BODY_PARTS.length - 1 : currentIndex - 1
    onPartChange(BODY_PARTS[prevIndex])
  }

  const goToNextPart = () => {
    const nextIndex = currentIndex >= BODY_PARTS.length - 1 ? 0 : currentIndex + 1
    onPartChange(BODY_PARTS[nextIndex])
  }

  return (
    <div className={cn('space-y-3', className)}>
      {/* Body Part Navigation */}
      <div className="flex items-center gap-2">
        <button
          onClick={goToPrevPart}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-obsidian-card text-muted-foreground transition-colors hover:bg-obsidian-elevated hover:text-foreground"
          aria-label="Previous body part"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        
        <div className="flex h-12 flex-1 items-center justify-center rounded-xl bg-obsidian-card px-4">
          <span className="text-sm font-bold tracking-wider text-neon">
            {BODY_PART_NAMES[selectedPart]}
          </span>
        </div>
        
        <button
          onClick={goToNextPart}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-obsidian-card text-muted-foreground transition-colors hover:bg-obsidian-elevated hover:text-foreground"
          aria-label="Next body part"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Face Direction Tabs - evenly distributed, no scroll */}
      <div className="flex gap-1">
        {BODY_FACES.map((face) => (
          <button
            key={face}
            onClick={() => onFaceChange(face)}
            className={cn(
              'flex-1 rounded-lg py-1.5 text-[10px] font-semibold tracking-wide transition-all capitalize',
              selectedFace === face
                ? 'pill-selected'
                : 'pill-unselected'
            )}
          >
            {face}
          </button>
        ))}
      </div>
    </div>
  )
}
