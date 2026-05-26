import type { RGBAColor } from '@/types/skin'

/**
 * Classic Noise Brush
 * Applies ±5-10% random lightness variation per pixel
 */
export function applyNoise(color: RGBAColor, intensity: number = 0.08): RGBAColor {
  const variation = (Math.random() - 0.5) * 2 * intensity * 255
  return {
    r: Math.max(0, Math.min(255, Math.round(color.r + variation))),
    g: Math.max(0, Math.min(255, Math.round(color.g + variation))),
    b: Math.max(0, Math.min(255, Math.round(color.b + variation))),
    a: color.a,
  }
}

/**
 * Faux-Depth Brush
 * Auto-shading: darker edges, lighter centers based on position in region
 */
export function applyFauxDepth(
  color: RGBAColor,
  x: number,
  y: number,
  regionWidth: number,
  regionHeight: number,
  intensity: number = 0.15
): RGBAColor {
  // Calculate distance from center (normalized 0-1)
  const centerX = regionWidth / 2
  const centerY = regionHeight / 2
  const maxDist = Math.sqrt(centerX * centerX + centerY * centerY)
  const dist = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2)
  const normalizedDist = dist / maxDist
  
  // Apply darkening based on distance from center
  const darkenFactor = 1 - (normalizedDist * intensity)
  
  return {
    r: Math.max(0, Math.min(255, Math.round(color.r * darkenFactor))),
    g: Math.max(0, Math.min(255, Math.round(color.g * darkenFactor))),
    b: Math.max(0, Math.min(255, Math.round(color.b * darkenFactor))),
    a: color.a,
  }
}

/**
 * Cluster Brush
 * Deposits 2x2 or irregular pixel clusters
 */
export function getClusterPattern(size: 2 | 3 = 2): Array<{ dx: number; dy: number; probability: number }> {
  if (size === 2) {
    return [
      { dx: 0, dy: 0, probability: 1 },
      { dx: 1, dy: 0, probability: 0.8 },
      { dx: 0, dy: 1, probability: 0.8 },
      { dx: 1, dy: 1, probability: 0.6 },
    ]
  }
  
  // 3x3 irregular cluster
  return [
    { dx: 0, dy: 0, probability: 1 },
    { dx: 1, dy: 0, probability: 0.7 },
    { dx: -1, dy: 0, probability: 0.7 },
    { dx: 0, dy: 1, probability: 0.7 },
    { dx: 0, dy: -1, probability: 0.7 },
    { dx: 1, dy: 1, probability: 0.4 },
    { dx: -1, dy: 1, probability: 0.4 },
    { dx: 1, dy: -1, probability: 0.4 },
    { dx: -1, dy: -1, probability: 0.4 },
  ]
}

/**
 * Flood Fill Algorithm (Bucket Tool)
 * Uses stack-based approach to avoid recursion limits
 */
export function floodFill(
  imageData: ImageData,
  startX: number,
  startY: number,
  fillColor: RGBAColor,
  tolerance: number = 0
): void {
  const { width, height, data } = imageData
  
  const getPixelIndex = (x: number, y: number) => (y * width + x) * 4
  
  const getPixel = (x: number, y: number): RGBAColor => {
    const i = getPixelIndex(x, y)
    return { r: data[i], g: data[i + 1], b: data[i + 2], a: data[i + 3] }
  }
  
  const setPixel = (x: number, y: number, color: RGBAColor) => {
    const i = getPixelIndex(x, y)
    data[i] = color.r
    data[i + 1] = color.g
    data[i + 2] = color.b
    data[i + 3] = color.a
  }
  
  const colorsMatch = (c1: RGBAColor, c2: RGBAColor): boolean => {
    return (
      Math.abs(c1.r - c2.r) <= tolerance &&
      Math.abs(c1.g - c2.g) <= tolerance &&
      Math.abs(c1.b - c2.b) <= tolerance &&
      Math.abs(c1.a - c2.a) <= tolerance
    )
  }
  
  // Get target color
  const targetColor = getPixel(startX, startY)
  
  // Don't fill if already the fill color
  if (colorsMatch(targetColor, fillColor)) return
  
  // Stack-based flood fill
  const stack: Array<[number, number]> = [[startX, startY]]
  const visited = new Set<string>()
  
  while (stack.length > 0) {
    const [x, y] = stack.pop()!
    const key = `${x},${y}`
    
    if (visited.has(key)) continue
    if (x < 0 || x >= width || y < 0 || y >= height) continue
    
    const currentColor = getPixel(x, y)
    if (!colorsMatch(currentColor, targetColor)) continue
    
    visited.add(key)
    setPixel(x, y, fillColor)
    
    // Add neighbors
    stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1])
  }
}

/**
 * Extract top N colors from ImageData
 */
export function extractPalette(imageData: ImageData, maxColors: number = 20): RGBAColor[] {
  const { data } = imageData
  const colorCounts = new Map<string, { color: RGBAColor; count: number }>()
  
  for (let i = 0; i < data.length; i += 4) {
    const color: RGBAColor = {
      r: data[i],
      g: data[i + 1],
      b: data[i + 2],
      a: data[i + 3],
    }
    
    // Skip fully transparent pixels
    if (color.a === 0) continue
    
    const key = `${color.r},${color.g},${color.b},${color.a}`
    const existing = colorCounts.get(key)
    
    if (existing) {
      existing.count++
    } else {
      colorCounts.set(key, { color, count: 1 })
    }
  }
  
  // Sort by count and take top N
  return Array.from(colorCounts.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, maxColors)
    .map(({ color }) => color)
}

/**
 * Convert RGBA to hex string
 */
export function rgbaToHex(color: RGBAColor): string {
  const r = color.r.toString(16).padStart(2, '0')
  const g = color.g.toString(16).padStart(2, '0')
  const b = color.b.toString(16).padStart(2, '0')
  return `#${r}${g}${b}`
}

/**
 * Parse hex string to RGBA
 */
export function hexToRgba(hex: string, alpha: number = 255): RGBAColor {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) {
    return { r: 0, g: 0, b: 0, a: alpha }
  }
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
    a: alpha,
  }
}

/**
 * Blend two colors with alpha
 */
export function blendColors(bottom: RGBAColor, top: RGBAColor): RGBAColor {
  const alphaTop = top.a / 255
  const alphaBottom = bottom.a / 255
  const alphaOut = alphaTop + alphaBottom * (1 - alphaTop)
  
  if (alphaOut === 0) {
    return { r: 0, g: 0, b: 0, a: 0 }
  }
  
  return {
    r: Math.round((top.r * alphaTop + bottom.r * alphaBottom * (1 - alphaTop)) / alphaOut),
    g: Math.round((top.g * alphaTop + bottom.g * alphaBottom * (1 - alphaTop)) / alphaOut),
    b: Math.round((top.b * alphaTop + bottom.b * alphaBottom * (1 - alphaTop)) / alphaOut),
    a: Math.round(alphaOut * 255),
  }
}
