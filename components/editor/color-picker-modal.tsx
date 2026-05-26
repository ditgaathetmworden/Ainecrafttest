'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Check, Palette } from 'lucide-react'
import type { RGBAColor } from '@/types/skin'
import { rgbaToHex, hexToRgba } from '@/lib/brush-algorithms'
import { cn } from '@/lib/utils'

interface ColorPickerModalProps {
  isOpen: boolean
  onClose: () => void
  currentColor: RGBAColor
  onColorChange: (color: RGBAColor) => void
  skinPalette: RGBAColor[]
}

export function ColorPickerModal({
  isOpen,
  onClose,
  currentColor,
  onColorChange,
  skinPalette,
}: ColorPickerModalProps) {
  const [localColor, setLocalColor] = useState(currentColor)
  const [hue, setHue] = useState(0)
  const [saturation, setSaturation] = useState(100)
  const [lightness, setLightness] = useState(50)
  const satLightRef = useRef<HTMLDivElement>(null)
  const hueRef = useRef<HTMLDivElement>(null)

  // Sync local color with prop when modal opens
  useEffect(() => {
    if (isOpen) {
      setLocalColor(currentColor)
      // Convert RGB to HSL for sliders
      const { h, s, l } = rgbToHsl(currentColor.r, currentColor.g, currentColor.b)
      setHue(h)
      setSaturation(s)
      setLightness(l)
    }
  }, [isOpen, currentColor])

  // Convert RGB to HSL
  function rgbToHsl(r: number, g: number, b: number) {
    r /= 255
    g /= 255
    b /= 255
    const max = Math.max(r, g, b), min = Math.min(r, g, b)
    let h = 0, s = 0
    const l = (max + min) / 2

    if (max !== min) {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
        case g: h = ((b - r) / d + 2) / 6; break
        case b: h = ((r - g) / d + 4) / 6; break
      }
    }

    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }
  }

  // Convert HSL to RGB
  function hslToRgb(h: number, s: number, l: number): RGBAColor {
    h /= 360
    s /= 100
    l /= 100
    let r, g, b

    if (s === 0) {
      r = g = b = l
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1
        if (t > 1) t -= 1
        if (t < 1/6) return p + (q - p) * 6 * t
        if (t < 1/2) return q
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
        return p
      }
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s
      const p = 2 * l - q
      r = hue2rgb(p, q, h + 1/3)
      g = hue2rgb(p, q, h)
      b = hue2rgb(p, q, h - 1/3)
    }

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255),
      a: localColor.a
    }
  }

  // Update color when HSL values change
  const updateFromHsl = (h: number, s: number, l: number) => {
    const color = hslToRgb(h, s, l)
    setLocalColor(color)
  }

  // Handle saturation/lightness picker drag
  const handleSatLightMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!satLightRef.current) return
    const rect = satLightRef.current.getBoundingClientRect()
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    const y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height))
    const newSat = Math.round(x * 100)
    const newLight = Math.round((1 - y) * 100)
    setSaturation(newSat)
    setLightness(newLight)
    updateFromHsl(hue, newSat, newLight)
  }

  // Handle hue slider drag
  const handleHueMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!hueRef.current) return
    const rect = hueRef.current.getBoundingClientRect()
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    const newHue = Math.round(x * 360)
    setHue(newHue)
    updateFromHsl(newHue, saturation, lightness)
  }

  const handleConfirm = () => {
    onColorChange(localColor)
    onClose()
  }

  const handlePaletteClick = (color: RGBAColor) => {
    setLocalColor(color)
    const { h, s, l } = rgbToHsl(color.r, color.g, color.b)
    setHue(h)
    setSaturation(s)
    setLightness(l)
  }

  const handleHexInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hex = e.target.value
    if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
      const color = hexToRgba(hex, localColor.a)
      setLocalColor(color)
      const { h, s, l } = rgbToHsl(color.r, color.g, color.b)
      setHue(h)
      setSaturation(s)
      setLightness(l)
    }
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-md sm:items-center"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-sm animate-in slide-in-from-bottom-4 ease-out duration-500 rounded-t-3xl bg-obsidian-surface border border-border/50 p-5 sm:rounded-3xl sm:slide-in-from-bottom-0 sm:zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neon/10">
              <Palette className="h-4 w-4 text-neon" />
            </div>
            <h2 className="text-sm font-semibold tracking-wide text-foreground">
              Color Picker
            </h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-obsidian-elevated hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Saturation/Lightness Picker */}
        <div
          ref={satLightRef}
          className="relative mb-4 h-44 w-full cursor-crosshair rounded-2xl overflow-hidden shadow-inner"
          style={{
            background: `linear-gradient(to bottom, white, transparent, black), linear-gradient(to right, gray, hsl(${hue}, 100%, 50%))`,
          }}
          onMouseDown={(e) => {
            handleSatLightMove(e)
            const move = (ev: MouseEvent) => handleSatLightMove(ev as unknown as React.MouseEvent)
            const up = () => {
              document.removeEventListener('mousemove', move)
              document.removeEventListener('mouseup', up)
            }
            document.addEventListener('mousemove', move)
            document.addEventListener('mouseup', up)
          }}
          onTouchStart={handleSatLightMove}
          onTouchMove={handleSatLightMove}
        >
          <div
            className="pointer-events-none absolute h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white shadow-lg shadow-black/30"
            style={{
              left: `${saturation}%`,
              top: `${100 - lightness}%`,
              backgroundColor: rgbaToHex(localColor),
            }}
          />
        </div>

        {/* Hue Slider */}
        <div
          ref={hueRef}
          className="relative mb-5 h-7 w-full cursor-pointer rounded-full overflow-hidden shadow-inner"
          style={{
            background: 'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)',
          }}
          onMouseDown={(e) => {
            handleHueMove(e)
            const move = (ev: MouseEvent) => handleHueMove(ev as unknown as React.MouseEvent)
            const up = () => {
              document.removeEventListener('mousemove', move)
              document.removeEventListener('mouseup', up)
            }
            document.addEventListener('mousemove', move)
            document.addEventListener('mouseup', up)
          }}
          onTouchStart={handleHueMove}
          onTouchMove={handleHueMove}
        >
          <div
            className="pointer-events-none absolute top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white shadow-lg shadow-black/30"
            style={{
              left: `${(hue / 360) * 100}%`,
              backgroundColor: `hsl(${hue}, 100%, 50%)`,
            }}
          />
        </div>

        {/* Color Preview & Hex Input */}
        <div className="mb-5 flex items-center gap-3">
          <div
            className="h-14 w-14 shrink-0 rounded-2xl border-2 border-border shadow-inner"
            style={{ backgroundColor: rgbaToHex(localColor) }}
          />
          <input
            type="text"
            value={rgbaToHex(localColor).toUpperCase()}
            onChange={handleHexInput}
            className="flex-1 rounded-xl bg-obsidian-card px-4 py-3 font-mono text-sm text-foreground outline-none ring-1 ring-border transition-all focus:ring-2 focus:ring-neon"
            placeholder="#FFFFFF"
          />
        </div>

        {/* Skin Palette - Top 10 colors from skin */}
        {skinPalette.length > 0 && (
          <div className="mb-5">
            <p className="mb-3 text-[10px] font-semibold tracking-wide text-muted-foreground">
              Skin Colors
            </p>
            <div className="grid grid-cols-10 gap-1.5">
              {skinPalette.slice(0, 10).map((color, index) => {
                const hex = rgbaToHex(color)
                const isSelected =
                  color.r === localColor.r &&
                  color.g === localColor.g &&
                  color.b === localColor.b
                return (
                  <button
                    key={`${hex}-${index}`}
                    onClick={() => handlePaletteClick(color)}
                    className={cn(
                      'aspect-square w-full rounded-lg transition-all hover:scale-110 active:scale-95',
                      isSelected && 'ring-2 ring-neon ring-offset-2 ring-offset-obsidian-surface scale-110'
                    )}
                    style={{ backgroundColor: hex }}
                    title={hex}
                  />
                )
              })}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl bg-obsidian-card py-3.5 text-sm font-semibold text-muted-foreground transition-all hover:bg-obsidian-elevated hover:text-foreground active:scale-[0.98]"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-neon py-3.5 text-sm font-semibold text-obsidian transition-all hover:bg-neon-dim active:scale-[0.98]"
          >
            <Check className="h-4 w-4" />
            Select
          </button>
        </div>
      </div>
    </div>
  )
}
