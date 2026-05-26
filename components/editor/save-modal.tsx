'use client'

import { useState } from 'react'
import { X, Globe, Lock, Heart, Download, MessageCircle, ChevronLeft } from 'lucide-react'
import { SkinViewer3D } from '@/components/editor/skin-viewer-3d'
import { cn } from '@/lib/utils'

interface SaveModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (name: string, description: string, isPublic: boolean) => void
  skinUrl?: string
  isSaving?: boolean
}

export function SaveModal({ isOpen, onClose, onSave, skinUrl, isSaving }: SaveModalProps) {
  const [step, setStep] = useState<'input' | 'preview'>('input')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isPublic, setIsPublic] = useState(true)

  if (!isOpen) return null

  const handleNext = () => {
    if (name.trim()) {
      setStep('preview')
    }
  }

  const handleBack = () => {
    setStep('input')
  }

  const handleSubmit = () => {
    if (name.trim()) {
      onSave(name.trim(), description.trim(), isPublic)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70" />

      {/* Bottom sheet */}
      <div
        className="relative w-full animate-in slide-in-from-bottom-4 ease-out duration-500 rounded-t-3xl bg-obsidian-card border-t border-border max-h-[92dvh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="h-1 w-12 rounded-full bg-muted-foreground/30" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 shrink-0">
          <div className="flex items-center gap-2">
            {step === 'preview' && (
              <button
                onClick={handleBack}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-obsidian-elevated hover:text-foreground"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            )}
            <h2 className="text-base font-bold text-foreground">
              {step === 'input' ? 'Publish skin' : 'Preview'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-obsidian-elevated hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          {step === 'input' ? (
            // Step 1: Input
            <div className="px-4 pb-6 space-y-5">
              {/* Visibility toggle */}
              <div className="flex gap-2 rounded-xl bg-obsidian-elevated p-1">
                <button
                  type="button"
                  onClick={() => setIsPublic(true)}
                  className={cn(
                    'flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all',
                    isPublic
                      ? 'bg-neon text-obsidian shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Globe className="h-4 w-4" />
                  Public
                </button>
                <button
                  type="button"
                  onClick={() => setIsPublic(false)}
                  className={cn(
                    'flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all',
                    !isPublic
                      ? 'bg-obsidian-surface text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Lock className="h-4 w-4" />
                  Private
                </button>
              </div>

              {/* Inputs */}
              <div className="space-y-3">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Skin name..."
                  className="h-12 w-full rounded-xl border border-border bg-obsidian-elevated px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-neon focus:outline-none"
                  autoFocus
                />
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add a description (optional)..."
                  rows={3}
                  className="w-full resize-none rounded-xl border border-border bg-obsidian-elevated px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-neon focus:outline-none leading-relaxed"
                />
              </div>
            </div>
          ) : (
            // Step 2: Preview
            <div className="px-4 pb-6 space-y-5">
              <div className="rounded-xl bg-obsidian-surface overflow-hidden border border-border">
                {/* 3D Preview */}
                <div
                  className="relative aspect-square w-full overflow-hidden"
                  style={{ backgroundImage: 'url(/minecraft-background.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}
                >
                  <div className="pointer-events-none absolute inset-0 z-10" />
                  {skinUrl && (
                    <SkinViewer3D
                      skinUrl={skinUrl}
                      className="h-full w-full"
                      animation="walk"
                      autoRotate={false}
                      showControls={false}
                    />
                  )}
                </div>

                {/* Info */}
                <div className="px-4 pt-4 pb-3">
                  <h3 className="text-base font-bold text-foreground leading-tight">{name}</h3>
                  <p className="mt-0.5 text-sm text-muted-foreground">@YourUsername</p>
                  {description && (
                    <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{description}</p>
                  )}
                  <div className="my-3 h-px bg-border" />
                  <div className="flex items-center gap-5 text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Heart className="h-5 w-5" />
                      <span className="text-sm font-medium">0</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Download className="h-5 w-5" />
                      <span className="text-sm font-medium">0</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MessageCircle className="h-5 w-5" />
                      <span className="text-sm font-medium">0</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer buttons */}
        <div className="shrink-0 border-t border-border px-4 py-4 space-y-3">
          {step === 'input' && (
            <button
              onClick={handleNext}
              disabled={!name.trim()}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-neon font-bold tracking-wide text-obsidian transition-all hover:bg-neon-bright disabled:opacity-50"
            >
              Next
            </button>
          )}
          {step === 'preview' && (
            <button
              onClick={handleSubmit}
              disabled={isSaving}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-neon font-bold tracking-wide text-obsidian transition-all hover:bg-neon-bright disabled:opacity-50"
            >
              {isSaving ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-obsidian border-t-transparent" />
              ) : (
                isPublic ? 'Publish to gallery' : 'Save to profile'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
