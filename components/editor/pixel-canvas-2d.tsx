'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import type { BrushTool, RGBAColor, BodyPart, BodyFace, SkinFormat, SkinLayer, UVRegion } from '@/types/skin'
import { getUVMap, UV_MAP_64 } from '@/types/skin'
import { 
  applyNoise, 
  applyFauxDepth, 
  getClusterPattern, 
  floodFill 
} from '@/lib/brush-algorithms'
import { cn } from '@/lib/utils'

interface PixelCanvas2DProps {
  imageData: ImageData | null
  format: SkinFormat
  selectedPart: BodyPart
  selectedFace: BodyFace
  selectedLayer: SkinLayer
  currentTool: BrushTool
  currentColor: RGBAColor
  brushSize: number
  shadingMode?: 'darken' | 'lighten'
  onPixelChange: (imageData: ImageData) => void
  onStrokeStart?: () => void
  onStrokeEnd?: (imageData: ImageData) => void
  onColorPick?: (color: RGBAColor) => void
  className?: string
}

// Get outer layer UV region offset (outer layer is shifted in the texture)
function getOuterLayerRegion(part: BodyPart, face: BodyFace, format: SkinFormat): UVRegion {
  const baseMap = getUVMap(format)
  const baseRegion = baseMap[part][face]
  const scale = format === '128x128' ? 2 : 1
  
  // Outer layer offsets for 64x64 (multiply by 2 for 128x128)
  const outerOffsets: Record<BodyPart, { x: number; y: number }> = {
    head: { x: 32, y: 0 },      // Head outer at x+32
    body: { x: 0, y: 16 },      // Body outer at y+16
    right_arm: { x: 0, y: 16 }, // Right arm outer at y+16
    left_arm: { x: 16, y: 0 },  // Left arm outer at x+16
    right_leg: { x: 0, y: 16 }, // Right leg outer at y+16  
    left_leg: { x: 0, y: 16 },  // Left leg outer at y+16
  }
  
  const offset = outerOffsets[part]
  return {
    x: baseRegion.x + (offset.x * scale),
    y: baseRegion.y + (offset.y * scale),
    width: baseRegion.width,
    height: baseRegion.height,
  }
}

export function PixelCanvas2D({
  imageData,
  format,
  selectedPart,
  selectedFace,
  selectedLayer,
  currentTool,
  currentColor,
  brushSize,
  shadingMode = 'darken',
  onPixelChange,
  onStrokeStart,
  onStrokeEnd,
  onColorPick,
  className,
}: PixelCanvas2DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [canvasSize, setCanvasSize] = useState({ width: 300, height: 300 })
  const lastPosRef = useRef<{ x: number; y: number } | null>(null)

  const themeColorsRef = useRef({
    bgColor: '#0a0a0a',
    check1: '#1a1a1a',
    check2: '#252525',
  })

  // Optimize styling: Read CSS variables outside of paint loop to avoid synchronous reflow layout penalties
  useEffect(() => {
    const updateThemeColors = () => {
      if (typeof window === 'undefined') return
      const rootStyle = getComputedStyle(document.documentElement)
      themeColorsRef.current = {
        bgColor: rootStyle.getPropertyValue('--obsidian-bg').trim() || '#0a0a0a',
        check1: rootStyle.getPropertyValue('--obsidian-card').trim() || '#1a1a1a',
        check2: rootStyle.getPropertyValue('--obsidian-elevated').trim() || '#252525',
      }
    }
    updateThemeColors()

    const observer = new MutationObserver(updateThemeColors)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })

    return () => observer.disconnect()
  }, [])

  // Get UV region for current part/face/layer
  const uvMap = getUVMap(format)
  const baseRegion: UVRegion = uvMap[selectedPart][selectedFace]
  const region: UVRegion = selectedLayer === 'outer' 
    ? getOuterLayerRegion(selectedPart, selectedFace, format)
    : baseRegion
  
  // Calculate pixel size based on canvas size and region
  const pixelSize = Math.floor(Math.min(
    canvasSize.width / region.width,
    canvasSize.height / region.height
  ))

  // Resize canvas based on container size changes via ResizeObserver
  useEffect(() => {
    if (!containerRef.current) return

    const updateSize = (entries: ResizeObserverEntry[]) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        if (width > 0 && height > 0) {
          setCanvasSize({
            width: Math.floor(width),
            height: Math.floor(height),
          })
        }
      }
    }

    const ro = new ResizeObserver(updateSize)
    ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

  // Draw the canvas
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx || !imageData) return

    const displayWidth = region.width * pixelSize
    const displayHeight = region.height * pixelSize
    const offsetX = Math.floor((canvasSize.width - displayWidth) / 2)
    const offsetY = Math.floor((canvasSize.height - displayHeight) / 2)

    // Read background color from cached ref so layout reflow changes aren't triggered synchronously during mouse movement
    const { bgColor, check1, check2 } = themeColorsRef.current

    // Clear canvas
    // Clear canvas - Removed background black fill
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw checkerboard background for transparency - REMOVED per user request
    /*
    const checkSize = pixelSize / 2
    for (let y = 0; y < region.height * 2; y++) {
      for (let x = 0; x < region.width * 2; x++) {
        ctx.fillStyle = (x + y) % 2 === 0 ? check1 : check2
        ctx.fillRect(
          offsetX + x * checkSize,
          offsetY + y * checkSize,
          checkSize,
          checkSize
        )
      }
    }
    */

    const size = format === '64x64' ? 64 : 128

    // When editing outer layer, draw base layer semi-transparently first
    if (selectedLayer === 'outer') {
      ctx.globalAlpha = 0.5
      for (let y = 0; y < baseRegion.height; y++) {
        for (let x = 0; x < baseRegion.width; x++) {
          const srcX = baseRegion.x + x
          const srcY = baseRegion.y + y
          const i = (srcY * size + srcX) * 4

          const r = imageData.data[i]
          const g = imageData.data[i + 1]
          const b = imageData.data[i + 2]
          const a = imageData.data[i + 3]

          if (a > 0) {
            ctx.fillStyle = `rgba(${r},${g},${b},${a / 255})`
            ctx.fillRect(
              offsetX + x * pixelSize,
              offsetY + y * pixelSize,
              pixelSize,
              pixelSize
            )
          }
        }
      }
      ctx.globalAlpha = 1.0
    }

    // Draw pixels from imageData (current layer)
    for (let y = 0; y < region.height; y++) {
      for (let x = 0; x < region.width; x++) {
        const srcX = region.x + x
        const srcY = region.y + y
        const i = (srcY * size + srcX) * 4

        const r = imageData.data[i]
        const g = imageData.data[i + 1]
        const b = imageData.data[i + 2]
        const a = imageData.data[i + 3]

        if (a > 0) {
          ctx.fillStyle = `rgba(${r},${g},${b},${a / 255})`
          ctx.fillRect(
            offsetX + x * pixelSize,
            offsetY + y * pixelSize,
            pixelSize,
            pixelSize
          )
        }
      }
    }

    // Draw grid
    ctx.strokeStyle = 'rgba(0, 0, 0, 1.0)'
    ctx.lineWidth = 1
    
    for (let x = 0; x <= region.width; x++) {
      ctx.beginPath()
      ctx.moveTo(offsetX + x * pixelSize + 0.5, offsetY)
      ctx.lineTo(offsetX + x * pixelSize + 0.5, offsetY + displayHeight)
      ctx.stroke()
    }
    
    for (let y = 0; y <= region.height; y++) {
      ctx.beginPath()
      ctx.moveTo(offsetX, offsetY + y * pixelSize + 0.5)
      ctx.lineTo(offsetX + displayWidth, offsetY + y * pixelSize + 0.5)
      ctx.stroke()
    }

    // Draw border
    ctx.strokeStyle = 'rgba(0, 0, 0, 1.0)'
    ctx.lineWidth = 1
    ctx.strokeRect(offsetX, offsetY, displayWidth, displayHeight)
  }, [imageData, format, region, baseRegion, selectedLayer, pixelSize, canvasSize])

  // Redraw when dependencies change
  useEffect(() => {
    drawCanvas()
  }, [drawCanvas])

  // Convert canvas coords to pixel coords
  const getPixelCoords = (clientX: number, clientY: number): { x: number; y: number } | null => {
    const canvas = canvasRef.current
    if (!canvas) return null

    const rect = canvas.getBoundingClientRect()
    const canvasX = clientX - rect.left
    const canvasY = clientY - rect.top

    const displayWidth = region.width * pixelSize
    const displayHeight = region.height * pixelSize
    const offsetX = Math.floor((canvasSize.width - displayWidth) / 2)
    const offsetY = Math.floor((canvasSize.height - displayHeight) / 2)

    const pixelX = Math.floor((canvasX - offsetX) / pixelSize)
    const pixelY = Math.floor((canvasY - offsetY) / pixelSize)

    if (pixelX < 0 || pixelX >= region.width || pixelY < 0 || pixelY >= region.height) {
      return null
    }

    return { x: pixelX, y: pixelY }
  }

  // Set pixel in imageData
  const setPixel = (x: number, y: number, color: RGBAColor) => {
    if (!imageData) return

    const size = format === '64x64' ? 64 : 128
    const srcX = region.x + x
    const srcY = region.y + y
    
    if (srcX < 0 || srcX >= size || srcY < 0 || srcY >= size) return

    const i = (srcY * size + srcX) * 4
    imageData.data[i] = color.r
    imageData.data[i + 1] = color.g
    imageData.data[i + 2] = color.b
    imageData.data[i + 3] = color.a
  }

  // Get pixel from imageData (crucial for shading/eyedropper)
  const getPixel = (x: number, y: number): RGBAColor | null => {
    if (!imageData) return null

    const size = format === '64x64' ? 64 : 128
    const srcX = region.x + x
    const srcY = region.y + y
    
    if (srcX < 0 || srcX >= size || srcY < 0 || srcY >= size) return null

    const i = (srcY * size + srcX) * 4
    return {
      r: imageData.data[i],
      g: imageData.data[i + 1],
      b: imageData.data[i + 2],
      a: imageData.data[i + 3],
    }
  }

  const latestImageDataRef = useRef<ImageData | null>(null)

  // Sync prop changes immediately to keep event handlers non-stale
  useEffect(() => {
    latestImageDataRef.current = imageData
  }, [imageData])

  // Apply shading (darken or lighten)
  const applyShading = (color: RGBAColor, mode: 'darken' | 'lighten'): RGBAColor => {
    const factor = mode === 'darken' ? 0.85 : 1.18
    return {
      r: Math.max(0, Math.min(255, Math.round(color.r * factor))),
      g: Math.max(0, Math.min(255, Math.round(color.g * factor))),
      b: Math.max(0, Math.min(255, Math.round(color.b * factor))),
      a: color.a, // Keep alpha unchanged
    }
  }

  // Apply brush at position
  const applyBrush = (pixelX: number, pixelY: number) => {
    if (!imageData) return

    const size = format === '64x64' ? 64 : 128

    switch (currentTool) {
      case 'pen':
        for (let dy = 0; dy < brushSize; dy++) {
          for (let dx = 0; dx < brushSize; dx++) {
            setPixel(pixelX + dx, pixelY + dy, currentColor)
          }
        }
        break

      case 'eraser':
        const transparent = { r: 0, g: 0, b: 0, a: 0 }
        for (let dy = 0; dy < brushSize; dy++) {
          for (let dx = 0; dx < brushSize; dx++) {
            setPixel(pixelX + dx, pixelY + dy, transparent)
          }
        }
        break

      case 'eyedropper':
        const pickedColor = getPixel(pixelX, pixelY)
        if (pickedColor && onColorPick) {
          onColorPick(pickedColor)
        }
        return // Don't trigger onChange for eyedropper

      case 'bucket':
        // Create a copy for flood fill
        const newData = new ImageData(
          new Uint8ClampedArray(imageData.data),
          imageData.width,
          imageData.height
        )
        floodFill(newData, region.x + pixelX, region.y + pixelY, currentColor)
        onPixelChange(newData)
        return

      case 'noise':
        for (let dy = 0; dy < brushSize; dy++) {
          for (let dx = 0; dx < brushSize; dx++) {
            const noisyColor = applyNoise(currentColor)
            setPixel(pixelX + dx, pixelY + dy, noisyColor)
          }
        }
        break

      case 'faux-depth':
        const depthColor = applyFauxDepth(
          currentColor,
          pixelX,
          pixelY,
          region.width,
          region.height
        )
        for (let dy = 0; dy < brushSize; dy++) {
          for (let dx = 0; dx < brushSize; dx++) {
            setPixel(pixelX + dx, pixelY + dy, depthColor)
          }
        }
        break

      case 'cluster':
        const pattern = getClusterPattern(2)
        for (const { dx, dy, probability } of pattern) {
          if (Math.random() < probability) {
            const noisyColor = applyNoise(currentColor, 0.05)
            setPixel(pixelX + dx, pixelY + dy, noisyColor)
          }
        }
        break

      case 'shading':
        // Shading tool: darken or lighten existing pixels
        for (let dy = 0; dy < brushSize; dy++) {
          for (let dx = 0; dx < brushSize; dx++) {
            const existing = getPixel(pixelX + dx, pixelY + dy)
            if (existing && existing.a > 0) {
              const shadedColor = applyShading(existing, shadingMode)
              setPixel(pixelX + dx, pixelY + dy, shadedColor)
            }
          }
        }
        break
    }

    // Create new ImageData for state update
    const newData = new ImageData(
      new Uint8ClampedArray(imageData.data),
      imageData.width,
      imageData.height
    )
    latestImageDataRef.current = newData
    onPixelChange(newData)
  }

  // Mouse/Touch handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    const coords = getPixelCoords(e.clientX, e.clientY)
    if (!coords) return

    onStrokeStart?.()
    setIsDrawing(true)
    lastPosRef.current = coords
    applyBrush(coords.x, coords.y)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDrawing) return

    const coords = getPixelCoords(e.clientX, e.clientY)
    if (!coords) return

    // Only apply if position changed
    if (lastPosRef.current?.x !== coords.x || lastPosRef.current?.y !== coords.y) {
      applyBrush(coords.x, coords.y)
      lastPosRef.current = coords
    }
  }

  const handlePointerUp = () => {
    if (!isDrawing) return
    setIsDrawing(false)
    lastPosRef.current = null
    if (onStrokeEnd && latestImageDataRef.current) {
      onStrokeEnd(latestImageDataRef.current)
    }
  }

  // Prevent context menu on right click
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
  }

  return (
    <div
      ref={containerRef}
      className={cn('relative aspect-square w-full overflow-hidden', className)}
    >
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onContextMenu={handleContextMenu}
        className="touch-none"
        style={{ cursor: currentTool === 'eyedropper' ? 'crosshair' : 'pointer' }}
      />
    </div>
  )
}
