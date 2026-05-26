'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronRight } from 'lucide-react'
import { useAuth } from '@/components/providers/firebase-auth-provider'
import { BottomNav } from '@/components/layout/bottom-nav'
import { PromptInput } from '@/components/ai/prompt-input'
import { SkinViewer3D } from '@/components/editor/skin-viewer-3d'

// Default Steve skin for preview
const DEFAULT_SKIN = '/default-skin.png'

export default function HomePage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedSkin, setGeneratedSkin] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async (prompt: string) => {
    if (!user) {
      setError('You must be signed in to generate a skin.')
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          steps: 25,
          guidanceScale: 7.5,
        }),
      })

      const result = await response.json()
      
      if (result.success && result.imageUrl) {
        setGeneratedSkin(result.imageUrl)
      } else {
        setError(result.error || 'Er is een fout opgetreden bij het genereren van de skin.')
      }
    } catch (e) {
      console.error('Generation failed:', e)
      setError('Verbindingsfout. Het AI-model kon niet worden bereikt of de aanvraag is mislukt.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleEditSkin = () => {
    if (generatedSkin) {
      sessionStorage.setItem('editSkinUrl', generatedSkin)
      router.push('/editor')
    }
  }

  return (
    <div className="flex h-screen flex-col bg-background pb-16">
      {/* Header */}
      <header className="shrink-0 border-b border-border bg-obsidian-surface/95 backdrop-blur-lg">
        <div className="flex h-12 items-center justify-center px-4">
          <h1 className="text-xs font-bold tracking-wide">
            <span className="text-neon">AI</span>
            <span className="text-foreground"> Generator</span>
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 flex-col overflow-hidden">
        {/* 3D Preview Section */}
        <section 
          className="relative flex-1 overflow-hidden"
          style={{ backgroundImage: 'url(/minecraft-background.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}
        >
          <div className="mx-auto flex h-full w-full max-w-md items-center justify-center">
            <SkinViewer3D
              skinUrl={generatedSkin || DEFAULT_SKIN}
              className="h-full w-full"
              animation="none"
              autoRotate={true}
              autoRotateSpeed={0.5}
              showControls={true}
            />
          </div>
          
          {/* Error Overlay */}
          {error && (
            <div className="absolute inset-x-4 top-4 z-30 rounded-xl bg-destructive/95 p-3 text-center text-xs text-white backdrop-blur-sm transition-all shadow-lg flex items-center justify-between gap-2">
              <span className="flex-1 text-center font-medium">{error}</span>
              <button 
                onClick={() => setError(null)} 
                className="font-bold text-white/80 hover:text-white px-2 py-0.5 rounded hover:bg-white/10"
              >
                ✕
              </button>
            </div>
          )}
          
          {/* Loading Overlay */}
          {isGenerating && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-obsidian/80 backdrop-blur-sm">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-neon border-t-transparent" />
              <p className="mt-3 text-sm font-medium text-neon">Generating your skin...</p>
            </div>
          )}
        </section>

        {/* Prompt / Actions Section */}
        <section className="shrink-0 border-t border-border bg-obsidian-surface px-4 py-4">
          <div className="mx-auto max-w-md">
            {generatedSkin && !isGenerating ? (
              <div className="space-y-3">
                {/* Edit Button */}
                <button
                  onClick={handleEditSkin}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-neon text-sm font-bold tracking-wide text-obsidian neon-pulse transition-all hover:bg-neon-bright"
                >
                  Edit This Skin
                  <ChevronRight className="h-4 w-4" />
                </button>
                
                {/* Regenerate */}
                <button
                  onClick={() => setGeneratedSkin(null)}
                  className="flex h-10 w-full items-center justify-center rounded-xl bg-obsidian-card text-xs font-medium text-muted-foreground transition-colors hover:bg-obsidian-elevated hover:text-foreground"
                >
                  Generate Another
                </button>
              </div>
            ) : (
              <PromptInput
                onSubmit={handleGenerate}
                isLoading={isGenerating}
                placeholder="Describe your skin..."
              />
            )}
          </div>
        </section>
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  )
}
