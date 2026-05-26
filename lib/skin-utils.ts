import type { SkinFormat, BodyPart, SkinLayer } from '@/types/skin'
import { UV_MAP_64, getUVMap } from '@/types/skin'

/**
 * Processes a loaded HTMLImageElement and converts it to a standard square ImageData (64x64 or 128x128).
 * If the source image is in classic 2:1 format (e.g. 64x32), it maps it correctly to the top half
 * and populates the left leg/arm to prevent horizontal stretching.
 */
function processSkinImage(img: HTMLImageElement, targetSize?: SkinFormat): ImageData {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Could not get canvas context')
  }

  const isClassicRatio = Math.abs(img.width - img.height * 2) < 4

  // Determine standard size format
  let size = 64
  if (targetSize) {
    size = targetSize === '128x128' ? 128 : 64
  } else {
    size = img.width >= 128 ? 128 : 64
  }

  canvas.width = size
  canvas.height = size

  ctx.imageSmoothingEnabled = false

  if (isClassicRatio) {
    // Top half is the old skin format (transparent/cleared background by default)
    ctx.clearRect(0, 0, size, size)
    ctx.drawImage(img, 0, 0, size, size / 2)

    // Modernize: Copy Right Leg (0, 16) to Left Leg (16, 48)
    // and Right Arm (40, 16) to Left Arm (32, 48)
    const scale = size / 64
    const legArmSize = 16 * scale
    
    const rightLegX = 0
    const rightLegY = 16 * scale
    const leftLegX = 16 * scale
    const leftLegY = 48 * scale

    const rightArmX = 40 * scale
    const rightArmY = 16 * scale
    const leftArmX = 32 * scale
    const leftArmY = 48 * scale

    // Copy Right Leg -> Left Leg
    ctx.drawImage(canvas, rightLegX, rightLegY, legArmSize, legArmSize, leftLegX, leftLegY, legArmSize, legArmSize)
    
    // Copy Right Arm -> Left Arm
    ctx.drawImage(canvas, rightArmX, rightArmY, legArmSize, legArmSize, leftArmX, leftArmY, legArmSize, legArmSize)
  } else {
    // Already in a square structure, draw normally
    ctx.drawImage(img, 0, 0, size, size)
  }

  return ctx.getImageData(0, 0, size, size)
}

/**
 * Load an image from URL and return ImageData
 */
export async function loadSkinFromUrl(url: string): Promise<ImageData> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    if (url.startsWith('http')) {
      img.crossOrigin = 'anonymous'
    }
    
    img.onload = () => {
      try {
        const imageData = processSkinImage(img)
        resolve(imageData)
      } catch (err) {
        reject(err)
      }
    }

    img.onerror = () => {
      console.error(`Failed to load image from URL: ${url}`)
      reject(new Error(`Failed to load image: ${url}`))
    }
    img.src = url
  })
}

/**
 * Load an image from File and return ImageData
 */
export async function loadSkinFromFile(file: File, targetSize: SkinFormat = '64x64'): Promise<ImageData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      const img = new Image()
      
      img.onload = () => {
        try {
          const imageData = processSkinImage(img, targetSize)
          resolve(imageData)
        } catch (err) {
          reject(err)
        }
      }

      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = e.target?.result as string
    }

    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

/**
 * Create a blank skin ImageData
 */
export function createBlankSkin(format: SkinFormat = '64x64'): ImageData {
  const size = format === '128x128' ? 128 : 64
  return new ImageData(size, size)
}

/**
 * Convert ImageData to PNG data URL
 */
export function imageDataToDataUrl(imageData: ImageData): string {
  const canvas = document.createElement('canvas')
  canvas.width = imageData.width
  canvas.height = imageData.height
  
  const ctx = canvas.getContext('2d')
  if (!ctx) return ''
  
  ctx.putImageData(imageData, 0, 0)
  return canvas.toDataURL('image/png')
}

/**
 * Convert ImageData to PNG Blob
 */
export async function imageDataToBlob(imageData: ImageData): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    canvas.width = imageData.width
    canvas.height = imageData.height
    
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      reject(new Error('Could not get canvas context'))
      return
    }
    
    ctx.putImageData(imageData, 0, 0)
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob)
      } else {
        reject(new Error('Failed to create blob'))
      }
    }, 'image/png')
  })
}

/**
 * Download ImageData as PNG file
 */
export function downloadSkin(imageData: ImageData, filename: string = 'skin.png'): void {
  const dataUrl = imageDataToDataUrl(imageData)
  const link = document.createElement('a')
  link.download = filename
  link.href = dataUrl
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Scale ImageData to different size
 */
export function scaleImageData(imageData: ImageData, newSize: number): ImageData {
  const canvas = document.createElement('canvas')
  canvas.width = imageData.width
  canvas.height = imageData.height
  
  const ctx = canvas.getContext('2d')
  if (!ctx) return imageData
  
  ctx.putImageData(imageData, 0, 0)
  
  const scaledCanvas = document.createElement('canvas')
  scaledCanvas.width = newSize
  scaledCanvas.height = newSize
  
  const scaledCtx = scaledCanvas.getContext('2d')
  if (!scaledCtx) return imageData
  
  scaledCtx.imageSmoothingEnabled = false
  scaledCtx.drawImage(canvas, 0, 0, newSize, newSize)
  
  return scaledCtx.getImageData(0, 0, newSize, newSize)
}

/**
 * Clone ImageData
 */
export function cloneImageData(imageData: ImageData): ImageData {
  return new ImageData(
    new Uint8ClampedArray(imageData.data),
    imageData.width,
    imageData.height
  )
}

/**
 * Download a skin from a data URL or URL string
 */
export function downloadSkinPNG(dataUrl: string, filename: string = 'skin.png'): void {
  const link = document.createElement('a')
  link.download = filename.endsWith('.png') ? filename : `${filename}.png`
  link.href = dataUrl
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Get similar body parts for copying
 * Arms copy to arms, legs copy to legs
 */
export function getSimilarBodyParts(part: BodyPart): BodyPart[] {
  if (part === 'right_arm' || part === 'left_arm') {
    return ['right_arm', 'left_arm']
  }
  if (part === 'right_leg' || part === 'left_leg') {
    return ['right_leg', 'left_leg']
  }
  return [part]
}

/**
 * Copy pixels from one specific face of a body part to multiple target parts and faces
 * This allows copying e.g., the right side of left_arm to the front, back, left sides of right_arm
 */
export function copyBodyPartToTargets(
  imageData: ImageData,
  sourcePart: BodyPart,
  sourceFace: BodyFace,
  targetParts: BodyPart[],
  targetFaces: BodyFace[],
  format: SkinFormat
): ImageData {
  const newImageData = cloneImageData(imageData)
  const uvMap = getUVMap(format)
  const sourceRegions = uvMap[sourcePart]
  const srcRegion = sourceRegions[sourceFace]
  
  // Copy from the source face to each target part and face
  for (const targetPart of targetParts) {
    const targetRegions = uvMap[targetPart]
    
    // Copy to each selected target face
    for (const targetFace of targetFaces) {
      const dstRegion = targetRegions[targetFace]
      
      // Copy pixel by pixel from source face to all target faces
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
  }
  
  return newImageData
}

/**
 * Copy specific faces from one body part to other body parts
 */
export function copyBodyPartFaces(
  imageData: ImageData,
  sourcePart: BodyPart,
  targetParts: BodyPart[],
  sourceFaces: Array<'front' | 'back' | 'left' | 'right' | 'top' | 'bottom'>,
  destinationFaces: Array<'front' | 'back' | 'left' | 'right' | 'top' | 'bottom'>,
  format: SkinFormat
): ImageData {
  const newImageData = cloneImageData(imageData)
  const uvMap = getUVMap(format)
  const sourceRegions = uvMap[sourcePart]
  
  // If no source or destination faces selected, return unchanged
  if (sourceFaces.length === 0 || destinationFaces.length === 0) {
    console.log('[v0] No source or destination faces selected')
    return newImageData
  }
  
  for (const targetPart of targetParts) {
    if (targetPart === sourcePart) continue // Skip self
    
    const targetRegions = uvMap[targetPart]
    
    // Copy each source face to each destination face
    for (const srcFace of sourceFaces) {
      for (const dstFace of destinationFaces) {
        const srcRegion = sourceRegions[srcFace]
        const dstRegion = targetRegions[dstFace]
        
        // Copy pixel by pixel
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
    }
  }
  
  return newImageData
}
