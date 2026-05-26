'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronRight } from 'lucide-react'
import { useAuth } from '@/components/providers/firebase-auth-provider'
import { BottomNav } from '@/components/layout/bottom-nav'
import { PromptInput } from '@/components/ai/prompt-input'
import { SkinViewer3D } from '@/components/editor/skin-viewer-3d'

// Default Steve skin for preview
const DEFAULT_SKIN = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAFDUlEQVR4Xu2bSU8UQRSG+9c4Ei+evHtRr17c/4gbHryo4EYMShAEZBkGBBdQEJcoILgTFVBQJxp1jPu+G59v3lspO9MT7aaGMn1S6VSqXlX1e1+9qqquaWq43V1fv3dHZ6TLXZ+/fHV9/aaP09OnTruGxsY4KfTv7sPCOXX6jGtubu7OClPTM+7i4mL1e3BoOAVCo4B0G2w5CqQkCDcECABuJsS9n55x/QODXQ0wEQSIwMrKinN+hBB++OGnc+eWloLR2cX6wd/QiLuxuuqWlpe9F0RJwCe8ffceBQTi4+vXbn5+oQPA/v4Bt7yyBqAQO5/tZ6vL1NTk2fX7Dx67w8dOdnY+d+6Ss0q9B8zMLTq/A3z55u3A4KCbmJpx+w8ecW9cvBTawgQAhO07djkA9m4JefDgkds5Md3V4dPLF69cf3+/W15Z7XoOoFLFYLAhgL5+K0tLWZ/J4BAEoKmp2T2bXwg+5/yrZd0ACAgJdggQ3r95S0DXC0EcAJIE9HZuEzz5aA5I3gCzABKCYAQQPCEkC3ASgtoCxGNAOAL4DxJ+h/C5F4QEoJFAWAIYXhCCSBYwnHWt/i83+VvfA0IyQNpAHWGGABEEcUGQJMC4oSJgjgDBJPDsogQwOj1oAKAiIK0cAAEKlgRNEMIADADBAIwbOgJGXSQQwJIAOgjWA0QBMgQoJIDC1p1DAFEXSQYQpAiE/T7p8VEEZC1AFgB+r/LzgCQBIpJgLQkKbQHaJigJMJDnAmEugb0AfPzyJXCGKAvgJIAlQNMCaZKrGkQBoJKhJOAI4JSYzfYUgb7xGdcyNuH6Jqbcn/9JKC81V+sFiACEkAAB+qoSoGXICOBnQGhkzPUMj7qeIaZBNzw86oY1t+G6hwbdsHIhPD6sIeLh0mLg1LWdF+S4CYwM/n7/UdCm+WnN65qaGt3Y2Lg/YLb/0UgZ7Ozic/1ePHv2zB0/ccIb/2fv3nPHjh/P9B+3fO6C0NXdM3J2ZGxC8UMDA15CaEvhRUICdARxU/hXAGYBhyBIm8DHDYEpCaIFYFqAOgIYM0D8DjDjBiMYISAJmH2r7O+xLZC0EAwDIBYEdQRtDwCEI0BxQj0DCAYI+BUAU4W+sUk3jAuCOgCkJIBqh/AHQJIFIBDzAqQvKk3/KgLhJDAKgEoCOAL4BECbQKMAmAWwI6AXgIEA+R0A0iygkoDdBmj3/04AMQmIvUAqTgCwCxALRCdAMAdUE1ASwBghGm2tDICKBOzaDQIQUgTMAigAxc5CaAYIlTeBIwCSBDSqC6QJgPmyaP9fCYC4Wjr1e/T8uqKQJoHRAuhfQUC0AUoC5guoTYAsQJIB4ghQBEhLgJ0C4ghQpxAgPAlRBIgmgP4OGP8SGLUF0ACQugtoJwhKgKgDqACIlwAtgUYFsJbAI4DfAVJbIOwEJAgQXxJNAtIWILsXSHMBMwREEsC1wvVAbgHUBdLi+14DigCRLBB3BDC3AL8DoC5ATQhLgPBdYNQJwuuAeCUodQHUBRBXALUA0Rv/8v9LQJIB7BnAloDYF6Bs/0+JAMoIsQBoAuBDAEuCYm0g2hZQB0BXAJEq0A1B9C5QjRHAgoBgBigJoAmwIADSCAClRUBbBJIAMQIkdYD/ACnJvOqeJQ+tAAAAAElFTkSuQmCC'

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
    <div className="flex min-h-screen flex-col bg-background pb-16">
      {/* Header */}
      <header className="shrink-0 border-b border-border bg-obsidian-surface/95 backdrop-blur-lg">
        <div className="flex h-12 items-center justify-between px-4">
          <h1 className="text-xs font-bold tracking-wide">
            <span className="text-neon">AI</span>
            <span className="text-foreground"> Generator</span>
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 flex-col">
        {/* 3D Preview Section */}
        <section 
          className="relative flex-1 overflow-hidden"
          style={{ backgroundImage: 'url(/minecraft-background.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}
        >
          <div className="mx-auto flex h-full max-w-md items-center justify-center px-4">
            <SkinViewer3D
              skinUrl={generatedSkin || DEFAULT_SKIN}
              width={280}
              height={320}
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
