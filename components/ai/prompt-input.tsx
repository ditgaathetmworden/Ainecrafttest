'use client'

import { useState, useRef } from 'react'
import { Upload, Image as ImageIcon, Plus, ArrowUp, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PromptInputProps {
  onSubmit: (prompt: string, imageFile?: File) => void
  isLoading?: boolean
  placeholder?: string
  className?: string
}

export function PromptInput({
  onSubmit,
  isLoading = false,
  placeholder = 'Describe your skin...',
  className,
}: PromptInputProps) {
  const [prompt, setPrompt] = useState('')
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt.trim() && !selectedImage) return
    onSubmit(prompt, selectedImage || undefined)
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const removeImage = () => {
    setSelectedImage(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-4', className)}>
      {/* Container */}
      <div className="relative rounded-xl bg-[#1f1f1f] p-4">
        {/* Text Input */}
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={placeholder}
          rows={3}
          disabled={isLoading}
          className="w-full resize-none bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
        />

        {/* Image Preview and Buttons Row */}
        <div className="flex items-center justify-between gap-2 mt-2">
          {/* Image Preview */}
          {previewUrl && (
            <div className="relative">
              <img
                src={previewUrl}
                alt="Selected reference"
                className="h-10 w-10 rounded-xl object-cover"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground text-xs"
              >
                ×
              </button>
            </div>
          )}

          {/* Action Buttons Row */}
          <div className={cn("flex items-center gap-2", !previewUrl && "ml-auto")}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
            
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground disabled:opacity-50"
              title="Upload reference image"
            >
              <Plus className="h-5 w-5" />
            </button>
            
            <button
              type="submit"
              disabled={isLoading || (!prompt.trim() && !selectedImage)}
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-xl transition-all',
                isLoading || (!prompt.trim() && !selectedImage)
                  ? 'cursor-not-allowed bg-white/5 text-muted-foreground'
                  : 'bg-white text-black hover:bg-gray-200'
              )}
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <ArrowUp className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  )
}
