'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { SkinViewer, WalkingAnimation, IdleAnimation } from 'skinview3d'
import * as THREE from 'three'
import type { BodyPart, BodyFace } from '@/types/skin'
import { cn } from '@/lib/utils'

interface SkinViewer3DProps {
  skinUrl: string | null
  className?: string
  width?: number
  height?: number
  animation?: 'walk' | 'idle' | 'none'
  autoRotate?: boolean
  autoRotateSpeed?: number
  selectedPart?: BodyPart | null
  selectedFace?: BodyFace
  onPartClick?: (part: BodyPart) => void
  showControls?: boolean
}

type CameraPos = { x: number; y: number; z: number; target: { x: number; y: number; z: number } }

/**
 * skinview3d coordinate system:
 * - Model center is at origin (0, 0, 0)
 * - Y axis: up/down, model spans roughly Y=-12 (feet) to Y=+12 (head top)
 * - X axis: left/right, +X is model's left side (viewer's right)
 * - Z axis: front/back, +Z faces the viewer (front)
 * 
 * Body part centers (approximate Y positions from model center):
 * - Head center: Y = +10 (8 pixels tall, top at +12, center at +10)
 * - Body center: Y = +2 (12 pixels tall, from +8 to -4, center at +2)  
 * - Arms center: Y = +2 (same height as body)
 * - Legs center: Y = -8 (12 pixels tall, from -4 to -12, center at -8)
 * 
 * X offsets for arms/legs:
 * - Right arm/leg: X = -6 (model's right = viewer's left = negative X)
 * - Left arm/leg: X = +6 (model's left = viewer's right = positive X)
 */
const PART_CONFIG: Record<BodyPart, { y: number; x: number; dist: number }> = {
  head:      { y: 10,  x: 0,  dist: 20 },
  body:      { y: 2,   x: 0,  dist: 25 },
  right_arm: { y: 2,   x: -6, dist: 20 },
  left_arm:  { y: 2,   x: 6,  dist: 20 },
  right_leg: { y: -8,  x: -2, dist: 20 },
  left_leg:  { y: -8,  x: 2,  dist: 20 },
}

/**
 * Build camera position that centers the selected body part in the viewport.
 * Camera is positioned at `dist` units away from the part center,
 * looking directly at the part center (target).
 */
function buildCameraPos(part: BodyPart, face: BodyFace): CameraPos {
  const { y: py, x: px, dist } = PART_CONFIG[part]
  // Target is exactly the center of the body part
  const target = { x: px, y: py, z: 0 }

  switch (face) {
    case 'front':
      return { x: px, y: py, z: dist, target }
    case 'back':
      return { x: px, y: py, z: -dist, target }
    case 'left':
      // Camera to model's left (+X direction)
      return { x: px + dist, y: py, z: 0, target }
    case 'right':
      // Camera to model's right (-X direction)
      return { x: px - dist, y: py, z: 0, target }
    case 'top':
      return { x: px, y: py + dist, z: 0.01, target }
    case 'bottom':
      return { x: px, y: py - dist, z: 0.01, target }
    default:
      return { x: px, y: py, z: dist, target }
  }
}

// Default Steve skin
const DEFAULT_SKIN = '/default-skin.png'

export function SkinViewer3D({
  skinUrl,
  className,
  width,
  height,
  animation = 'walk',
  autoRotate = true,
  autoRotateSpeed = 0.5,
  selectedPart,
  selectedFace = 'front',
  onPartClick,
  showControls = true,
}: SkinViewer3DProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const viewerRef = useRef<SkinViewer | null>(null)
  const animFrameRef = useRef<number | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  // Start with non-zero defaults so initViewer can run immediately
  const [dimensions, setDimensions] = useState({ width: width || 0, height: height || 0 })

  // Measure container and update dimensions
  useEffect(() => {
    if (width && height) {
      setDimensions({ width, height })
      return
    }

    const measure = () => {
      if (!containerRef.current) return
      const w = containerRef.current.offsetWidth
      const h = containerRef.current.offsetHeight
      if (w > 0 && h > 0) {
        setDimensions({ width: w, height: h })
      }
    }

    measure()

    const ro = new ResizeObserver(measure)
    if (containerRef.current) ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [width, height])

  // Initialize SkinViewer WebGL canvas exactly ONCE on mount to ensure supreme smoothness and prevent WebGL context crashes
  useEffect(() => {
    if (!canvasRef.current) return

    let viewer: SkinViewer | null = null

    try {
      viewer = new SkinViewer({
        canvas: canvasRef.current,
        width: dimensions.width || 300,
        height: dimensions.height || 300,
      })

      viewer.fov = 50
      viewer.zoom = 0.9
      viewer.controls.enableRotate = showControls
      viewer.controls.enableZoom = showControls
      viewer.controls.enablePan = showControls
      viewer.autoRotate = autoRotate
      if (autoRotate) viewer.autoRotateSpeed = autoRotateSpeed
      


      if (animation === 'walk') {
        const walk = new WalkingAnimation()
        walk.speed = 0.6
        viewer.animation = walk
      } else if (animation === 'idle') {
        const idle = new IdleAnimation()
        idle.speed = 0.5
        viewer.animation = idle
      }

      viewerRef.current = viewer

      // Load skin: use provided skinUrl if available, otherwise use DEFAULT_SKIN
      viewer.loadSkin(skinUrl || DEFAULT_SKIN).then(() => {
        setIsLoaded(true)
      }).catch((e) => {
        console.error('Failed to load skin:', e)
        // Fallback to default
        viewer?.loadSkin(DEFAULT_SKIN).then(() => {
          setIsLoaded(true)
        }).catch(() => {
          setIsLoaded(true) // Ensure loader spinner is cleared on fails
        })
      })

    } catch (error) {
      console.error('Failed to initialize skin viewer:', error)
    }

    return () => {
      if (viewer) {
        viewer.dispose()
      }
      viewerRef.current = null
    }
  }, []) // Mount-only initialization to avoid costly re-creations and black-flicker issues

  // Update animation reactively
  useEffect(() => {
    const viewer = viewerRef.current
    if (!viewer) return

    if (animation === 'walk') {
      const walk = new WalkingAnimation()
      walk.speed = 0.6
      viewer.animation = walk
    } else if (animation === 'idle') {
      const idle = new IdleAnimation()
      idle.speed = 0.5
      viewer.animation = idle
    } else {
      viewer.animation = null
    }
  }, [animation])

  // Update zoom controls reactively
  useEffect(() => {
    if (viewerRef.current) {
      viewerRef.current.controls.enableZoom = showControls
    }
  }, [showControls])

  // Toggle autoRotate reactively without re-creating the viewer
  useEffect(() => {
    if (!viewerRef.current) return
    viewerRef.current.autoRotate = autoRotate
    if (autoRotate) viewerRef.current.autoRotateSpeed = autoRotateSpeed
  }, [autoRotate])

  // Update viewer size when dimensions change
  useEffect(() => {
    if (viewerRef.current && dimensions.width > 0 && dimensions.height > 0) {
      viewerRef.current.width = dimensions.width
      viewerRef.current.height = dimensions.height
    }
  }, [dimensions])

  // Update skin texture when URL changes without re-initialising
  useEffect(() => {
    if (viewerRef.current && skinUrl) {
      viewerRef.current.loadSkin(skinUrl).catch(() => {
        // Silently fail - skin will keep current texture
      })
    }
  }, [skinUrl])

  // Animate camera smoothly to the target body part position
  useEffect(() => {
    if (!viewerRef.current || !selectedPart) return

    const viewer = viewerRef.current
    const pos = buildCameraPos(selectedPart, selectedFace)

    // Stop any in-progress animation
    if (animFrameRef.current !== null) {
      cancelAnimationFrame(animFrameRef.current)
      animFrameRef.current = null
    }

    viewer.autoRotate = false

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const startCam = viewer.camera.position.clone()
    const startTgt = viewer.controls.target.clone()
    const startZoom = viewer.zoom

    const DURATION = 600 // ms
    const startTime = performance.now()
    
    // Convert current camera relative position to spherical coordinates
    const startRel = viewer.camera.position.clone().sub(startTgt)
    const endRel = new THREE.Vector3(pos.x, pos.y, pos.z).sub(new THREE.Vector3(pos.target.x, pos.target.y, pos.target.z))
    
    const startSpher = new THREE.Spherical().setFromVector3(startRel as any)
    const endSpher = new THREE.Spherical().setFromVector3(endRel as any)
    
    function easeInOut(t: number) {
      return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
    }

    function step(now: number) {
      const raw = Math.min((now - startTime) / DURATION, 1)
      const t = easeInOut(raw)

      // LINEAR Interpolate spherical coordinates
      const curSpher = new THREE.Spherical(
        lerp(startSpher.radius, endSpher.radius, t),
        lerp(startSpher.phi, endSpher.phi, t),
        lerp(startSpher.theta, endSpher.theta, t)
      )
      
      const curRel = new THREE.Vector3().setFromSpherical(curSpher)
      viewer.camera.position.copy(curRel as any).add(
        new THREE.Vector3().lerpVectors(startTgt as any, new THREE.Vector3(pos.target.x, pos.target.y, pos.target.z) as any, t) as any
      )
      
      viewer.controls.target.lerpVectors(startTgt as any, new THREE.Vector3(pos.target.x, pos.target.y, pos.target.z) as any, t)
      viewer.zoom = startZoom + (1.6 - startZoom) * t
      viewer.controls.update()

      if (raw < 1) {
        animFrameRef.current = requestAnimationFrame(step)
      } else {
        animFrameRef.current = null
      }
    }

    animFrameRef.current = requestAnimationFrame(step)

    return () => {
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current)
        animFrameRef.current = null
      }
    }
  }, [selectedPart, selectedFace])

  return (
    <div 
      ref={containerRef} 
      className={cn('relative', className)}
    >
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-obsidian-card/80 backdrop-blur-sm">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-neon border-t-transparent" />
        </div>
      )}
      <canvas
        ref={canvasRef}
        className="block h-full w-full"
        style={{ pointerEvents: showControls ? 'auto' : 'none' }}
      />
    </div>
  )
}
