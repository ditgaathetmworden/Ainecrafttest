'use client'

import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { SkinViewer } from 'skinview3d'
import { Copy } from 'lucide-react'
import type { BodyPart, SkinFormat } from '@/types/skin'
import { getUVMap } from '@/types/skin'
import { cloneImageData, imageDataToDataUrl } from '@/lib/skin-utils'

type FaceType = 'front' | 'back' | 'left' | 'right' | 'top' | 'bottom'

interface CopyFaceSelectorProps {
  isOpen: boolean
  onClose: () => void
  sourcePart: BodyPart
  skinUrl: string | null
  skinImageData: ImageData | null
  skinFormat: SkinFormat
  onConfirm: (newImageData: ImageData) => void
}

// Get available faces for each body part type
function getAvailableFaces(part: BodyPart): FaceType[] {
  if (part === 'head') {
    return ['front', 'back', 'left', 'right', 'top', 'bottom']
  }
  return ['front', 'back', 'left', 'right']
}

// Get opposite limb
function getOppositeLimb(part: BodyPart): BodyPart | null {
  if (part === 'left_arm') return 'right_arm'
  if (part === 'right_arm') return 'left_arm'
  if (part === 'left_leg') return 'right_leg'
  if (part === 'right_leg') return 'left_leg'
  return null
}

// Copy selected faces to all other faces on the same body part
function copyFacesToOthers(
  imageData: ImageData,
  part: BodyPart,
  sourceFace: FaceType,
  targetFaces: FaceType[],
  format: SkinFormat
): ImageData {
  if (targetFaces.length === 0) return imageData
  
  const newImageData = cloneImageData(imageData)
  const uvMap = getUVMap(format)
  const regions = uvMap[part]
  
  const srcRegion = regions[sourceFace]
  
  for (const targetFace of targetFaces) {
    if (targetFace === sourceFace) continue
    
    const dstRegion = regions[targetFace]
    const copyHeight = Math.min(srcRegion.height, dstRegion.height)
    const copyWidth = Math.min(srcRegion.width, dstRegion.width)

    for (let y = 0; y < copyHeight; y++) {
      for (let x = 0; x < copyWidth; x++) {
        const srcX = srcRegion.x + x
        const srcY = srcRegion.y + y
        const dstX = dstRegion.x + x
        const dstY = dstRegion.y + y

        const srcIdx = (srcY * imageData.width + srcX) * 4
        const dstIdx = (dstY * imageData.width + dstX) * 4

        newImageData.data[dstIdx] = imageData.data[srcIdx]
        newImageData.data[dstIdx + 1] = imageData.data[srcIdx + 1]
        newImageData.data[dstIdx + 2] = imageData.data[srcIdx + 2]
        newImageData.data[dstIdx + 3] = imageData.data[srcIdx + 3]
      }
    }
  }

  return newImageData
}

// Copy entire limb to opposite side
function copyLimbToOpposite(
  imageData: ImageData,
  sourcePart: BodyPart,
  format: SkinFormat
): ImageData {
  const targetPart = getOppositeLimb(sourcePart)
  if (!targetPart) return imageData

  const newImageData = cloneImageData(imageData)
  const uvMap = getUVMap(format)
  const sourceRegions = uvMap[sourcePart]
  const targetRegions = uvMap[targetPart]

  const faces: FaceType[] = ['front', 'back', 'left', 'right', 'top', 'bottom']

  for (const face of faces) {
    const srcRegion = sourceRegions[face]
    const dstRegion = targetRegions[face]

    for (let y = 0; y < srcRegion.height; y++) {
      for (let x = 0; x < srcRegion.width; x++) {
        const srcX = srcRegion.x + x
        const srcY = srcRegion.y + y
        const dstX = dstRegion.x + x
        const dstY = dstRegion.y + y

        const srcIdx = (srcY * imageData.width + srcX) * 4
        const dstIdx = (dstY * imageData.width + dstX) * 4

        newImageData.data[dstIdx] = imageData.data[srcIdx]
        newImageData.data[dstIdx + 1] = imageData.data[srcIdx + 1]
        newImageData.data[dstIdx + 2] = imageData.data[srcIdx + 2]
        newImageData.data[dstIdx + 3] = imageData.data[srcIdx + 3]
      }
    }
  }

  return newImageData
}

// Small 2D preview of a single face
function FacePreview2D({
  imageData,
  part,
  face,
  format,
  size = 48,
}: {
  imageData: ImageData | null
  part: BodyPart
  face: FaceType
  format: SkinFormat
  size?: number
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current || !imageData) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const uvMap = getUVMap(format)
    const region = uvMap[part][face]

    // Clear canvas
    ctx.clearRect(0, 0, size, size)

    // Create temp canvas to extract face pixels
    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = imageData.width
    tempCanvas.height = imageData.height
    const tempCtx = tempCanvas.getContext('2d')
    if (!tempCtx) return

    tempCtx.putImageData(imageData, 0, 0)

    // Draw the face region scaled to fit
    ctx.imageSmoothingEnabled = false
    ctx.drawImage(
      tempCanvas,
      region.x,
      region.y,
      region.width,
      region.height,
      0,
      0,
      size,
      size
    )
  }, [imageData, part, face, format, size])

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className="rounded-lg border border-border/50"
      style={{ imageRendering: 'pixelated' }}
    />
  )
}

/**
 * Camera configuration for each body part - same as editor
 * skinview3d coordinate system:
 * - Model center is at origin (0, 0, 0)
 * - Y axis: up/down, model spans roughly Y=-12 (feet) to Y=+12 (head top)
 * - X axis: left/right, +X is model's left side (viewer's right)
 * - Z axis: front/back, +Z faces the viewer (front)
 */
const PART_CONFIG: Record<BodyPart, { y: number; x: number; dist: number }> = {
  head:      { y: 10,  x: 0,  dist: 20 },
  body:      { y: 2,   x: 0,  dist: 25 },
  right_arm: { y: 2,   x: -6, dist: 20 },
  left_arm:  { y: 2,   x: 6,  dist: 20 },
  right_leg: { y: -8,  x: -2, dist: 20 },
  left_leg:  { y: -8,  x: 2,  dist: 20 },
}

// Focused 3D Preview component that zooms into the selected body part
function FocusedPreview3D({ 
  skinUrl,
  bodyPart,
  width = 200,
  height = 200,
}: { 
  skinUrl: string | null
  bodyPart: BodyPart
  width?: number
  height?: number
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const viewerRef = useRef<SkinViewer | null>(null)

  useEffect(() => {
    if (!canvasRef.current || !skinUrl) return

    if (viewerRef.current) {
      viewerRef.current.loadSkin(skinUrl).catch(console.error)
      return
    }

    try {
      const viewer = new SkinViewer({
        canvas: canvasRef.current,
        width,
        height,
        skin: skinUrl,
      })

      viewer.fov = 50
      viewer.autoRotate = true
      viewer.autoRotateSpeed = 0.5
      viewer.controls.enableRotate = true
      viewer.controls.enableZoom = false
      viewer.controls.enablePan = false

      // Use same camera positioning as editor
      const { y: py, x: px, dist } = PART_CONFIG[bodyPart]
      const target = { x: px, y: py, z: 0 }
      
      // Position camera at calculated position (front view by default)
      viewer.camera.position.set(px, py, dist)
      // Look at the center of the body part
      viewer.controls.target.set(target.x, target.y, target.z)
      
      // Set zoom for a good closeup view - same as editor
      viewer.zoom = 1.5
      
      viewer.controls.update()

      viewerRef.current = viewer
    } catch (error) {
      console.error('Failed to initialize 3D preview:', error)
    }

    return () => {
      viewerRef.current?.dispose()
      viewerRef.current = null
    }
  }, [skinUrl, bodyPart, width, height])

  useEffect(() => {
    if (viewerRef.current && skinUrl) {
      viewerRef.current.loadSkin(skinUrl).catch(console.error)
    }
  }, [skinUrl])

  return (
    <canvas
      ref={canvasRef}
      className="rounded-2xl"
      style={{ width, height }}
    />
  )
}

export function CopyFaceSelector({
  isOpen,
  onClose,
  sourcePart,
  skinUrl,
  skinImageData,
  skinFormat,
  onConfirm,
}: CopyFaceSelectorProps) {
  const [sourceFace, setSourceFace] = useState<FaceType>('front')
  const [targetFaces, setTargetFaces] = useState<Set<FaceType>>(new Set())
  const [copyMode, setCopyMode] = useState<'face' | 'limb'>('face')

  const availableFaces = useMemo(() => getAvailableFaces(sourcePart), [sourcePart])
  const oppositeLimb = useMemo(() => getOppositeLimb(sourcePart), [sourcePart])
  const hasOppositeLimb = oppositeLimb !== null

  // Reset selections when part changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setSourceFace('front')
      setTargetFaces(new Set())
      setCopyMode('face')
    }
  }, [sourcePart, isOpen])

  // Generate preview image data
  const previewImageData = useMemo(() => {
    if (!skinImageData) return null
    
    if (copyMode === 'limb' && hasOppositeLimb) {
      return copyLimbToOpposite(skinImageData, sourcePart, skinFormat)
    }
    
    if (copyMode === 'face' && targetFaces.size > 0) {
      return copyFacesToOthers(
        skinImageData,
        sourcePart,
        sourceFace,
        Array.from(targetFaces),
        skinFormat
      )
    }
    
    return skinImageData
  }, [skinImageData, copyMode, hasOppositeLimb, sourcePart, skinFormat, sourceFace, targetFaces])

  // Convert to URL for 3D preview
  const previewUrl = useMemo(() => {
    if (!previewImageData) return null
    return imageDataToDataUrl(previewImageData)
  }, [previewImageData])

  const toggleTargetFace = useCallback((face: FaceType) => {
    if (face === sourceFace) return // Can't copy to self
    setTargetFaces(prev => {
      const newSet = new Set(prev)
      if (newSet.has(face)) {
        newSet.delete(face)
      } else {
        newSet.add(face)
      }
      return newSet
    })
  }, [sourceFace])

  const selectSourceFace = useCallback((face: FaceType) => {
    setSourceFace(face)
    // Remove from targets if it was selected
    setTargetFaces(prev => {
      const newSet = new Set(prev)
      newSet.delete(face)
      return newSet
    })
  }, [])

  const handleConfirm = useCallback(() => {
    if (!previewImageData || !skinImageData) return
    
    if (copyMode === 'limb' && hasOppositeLimb) {
      onConfirm(previewImageData)
    } else if (copyMode === 'face' && targetFaces.size > 0) {
      onConfirm(previewImageData)
    }
    
    onClose()
  }, [previewImageData, skinImageData, copyMode, hasOppositeLimb, targetFaces, onConfirm, onClose])

  if (!isOpen) return null

  const partLabel = sourcePart.replace('_', ' ').toUpperCase()
  const oppositePartLabel = oppositeLimb?.replace('_', ' ').toUpperCase()
  const canApply = copyMode === 'limb' ? hasOppositeLimb : targetFaces.size > 0

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-sm animate-in slide-in-from-bottom-4 ease-out duration-500 rounded-t-3xl border border-border/50 bg-obsidian-surface p-5 sm:rounded-3xl sm:slide-in-from-bottom-0 sm:zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-foreground">
          <Copy className="h-5 w-5 text-neon" />
          Copy sides
        </h2>

        {/* 3D Preview with Minecraft background */}
        <div 
          className="relative mb-5 flex justify-center rounded-2xl"
          style={{ backgroundImage: 'url(/minecraft-background.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}
        >
          <FocusedPreview3D 
            skinUrl={previewUrl} 
            bodyPart={sourcePart}
            width={280} 
            height={200} 
          />
        </div>

        {/* Mode toggle for limbs */}
        {hasOppositeLimb && (
          <div className="mb-4 flex gap-2">
            <button
              onClick={() => setCopyMode('face')}
              className={`flex-1 rounded-xl py-2.5 text-xs font-semibold transition-all ${
                copyMode === 'face'
                  ? 'bg-neon text-obsidian'
                  : 'bg-obsidian-card text-muted-foreground'
              }`}
            >
              Copy Faces
            </button>
            <button
              onClick={() => setCopyMode('limb')}
              className={`flex-1 rounded-xl py-2.5 text-xs font-semibold transition-all ${
                copyMode === 'limb'
                  ? 'bg-neon text-obsidian'
                  : 'bg-obsidian-card text-muted-foreground'
              }`}
            >
              Mirror to {oppositePartLabel}
            </button>
          </div>
        )}

        {copyMode === 'face' ? (
          <>
            {/* Copy From - 2D Preview + 2x2 grid */}
            <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground">
              Copy from
            </p>
            <div className="mb-4 flex items-center gap-3">
              <FacePreview2D
                imageData={skinImageData}
                part={sourcePart}
                face={sourceFace}
                format={skinFormat}
                size={64}
              />
              <div className="grid flex-1 grid-cols-2 gap-1.5">
                {(['front', 'back', 'left', 'right'] as FaceType[]).map((face) => (
                  <button
                    key={`source-${face}`}
                    onClick={() => selectSourceFace(face)}
                    className={`rounded-lg py-2 text-xs font-semibold capitalize transition-all ${
                      sourceFace === face
                        ? 'bg-neon text-obsidian'
                        : 'bg-obsidian-card text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {face}
                  </button>
                ))}
              </div>
            </div>

            {/* Copy To - Target Faces */}
            <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground">
              Copy to
            </p>
            <div className="mb-5 grid grid-cols-3 gap-2">
              {availableFaces.map((face) => {
                const isSource = face === sourceFace
                const isSelected = targetFaces.has(face)
                return (
                  <button
                    key={`target-${face}`}
                    onClick={() => toggleTargetFace(face)}
                    disabled={isSource}
                    className={`rounded-xl py-3 text-sm font-semibold capitalize transition-all ${
                      isSource
                        ? 'bg-obsidian-card/50 text-muted-foreground/30 cursor-not-allowed'
                        : isSelected
                          ? 'bg-neon text-obsidian'
                          : 'bg-obsidian-card text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {face}
                  </button>
                )
              })}
            </div>
          </>
        ) : (
          <div className="mb-5 rounded-xl bg-obsidian-card p-4 text-center text-sm text-muted-foreground">
            Copies all faces from <span className="font-semibold text-neon">{partLabel}</span> to{' '}
            <span className="font-semibold text-neon">{oppositePartLabel}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl bg-obsidian-card py-3.5 text-sm font-semibold text-muted-foreground transition-all hover:bg-obsidian-elevated hover:text-foreground"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!canApply}
            className="flex-1 rounded-xl bg-neon py-3.5 text-sm font-bold text-obsidian transition-all disabled:opacity-40"
          >
            Copy
          </button>
        </div>
      </div>
    </div>
  )
}
