export type BodyPart = 'head' | 'body' | 'right_arm' | 'left_arm' | 'right_leg' | 'left_leg'

export type BodyFace = 'front' | 'back' | 'left' | 'right' | 'top' | 'bottom'

export type SkinLayer = 'base' | 'outer'

export type BrushTool = 
  | 'pen' 
  | 'eraser' 
  | 'eyedropper' 
  | 'bucket' 
  | 'noise' 
  | 'faux-depth' 
  | 'cluster'
  | 'shading'
  | 'copy'

export type SkinFormat = '64x64' | '128x128'

export interface RGBAColor {
  r: number
  g: number
  b: number
  a: number
}

export interface HistoryState {
  imageData: ImageData
  layer: SkinLayer
  timestamp: number
}

export interface SkinData {
  id: string
  name: string
  description?: string
  imageUrl: string
  thumbnailUrl?: string
  format: SkinFormat
  createdAt: Date
  updatedAt: Date
  authorId?: string
  authorName?: string
  authorAvatar?: string
  likes: number
  downloads: number
  isPublished: boolean
  tags?: string[]
}

export interface UserProfile {
  id: string
  username: string
  displayName?: string
  bio?: string
  avatarUrl?: string
  skinsCreated: number
  totalDownloads: number
  followers: number
  following: number
  createdAt: Date
}

export interface Comment {
  id: string
  skinId: string
  authorId: string
  authorName: string
  authorAvatar?: string
  content: string
  likes: number
  createdAt: Date
}

export interface Follow {
  followerId: string
  followingId: string
  createdAt: Date
}

export interface Like {
  userId: string
  skinId: string
  createdAt: Date
}

// UV mapping regions for Minecraft skin
export interface UVRegion {
  x: number
  y: number
  width: number
  height: number
}

// Standard Minecraft skin UV layout (64x64)
export const UV_MAP_64: Record<BodyPart, Record<BodyFace, UVRegion>> = {
  head: {
    front: { x: 8, y: 8, width: 8, height: 8 },
    back: { x: 24, y: 8, width: 8, height: 8 },
    left: { x: 0, y: 8, width: 8, height: 8 },
    right: { x: 16, y: 8, width: 8, height: 8 },
    top: { x: 8, y: 0, width: 8, height: 8 },
    bottom: { x: 16, y: 0, width: 8, height: 8 },
  },
  body: {
    front: { x: 20, y: 20, width: 8, height: 12 },
    back: { x: 32, y: 20, width: 8, height: 12 },
    left: { x: 16, y: 20, width: 4, height: 12 },
    right: { x: 28, y: 20, width: 4, height: 12 },
    top: { x: 20, y: 16, width: 8, height: 4 },
    bottom: { x: 28, y: 16, width: 8, height: 4 },
  },
  right_arm: {
    front: { x: 44, y: 20, width: 4, height: 12 },
    back: { x: 52, y: 20, width: 4, height: 12 },
    left: { x: 40, y: 20, width: 4, height: 12 },
    right: { x: 48, y: 20, width: 4, height: 12 },
    top: { x: 44, y: 16, width: 4, height: 4 },
    bottom: { x: 48, y: 16, width: 4, height: 4 },
  },
  left_arm: {
    front: { x: 36, y: 52, width: 4, height: 12 },
    back: { x: 44, y: 52, width: 4, height: 12 },
    left: { x: 32, y: 52, width: 4, height: 12 },
    right: { x: 40, y: 52, width: 4, height: 12 },
    top: { x: 36, y: 48, width: 4, height: 4 },
    bottom: { x: 40, y: 48, width: 4, height: 4 },
  },
  right_leg: {
    front: { x: 4, y: 20, width: 4, height: 12 },
    back: { x: 12, y: 20, width: 4, height: 12 },
    left: { x: 0, y: 20, width: 4, height: 12 },
    right: { x: 8, y: 20, width: 4, height: 12 },
    top: { x: 4, y: 16, width: 4, height: 4 },
    bottom: { x: 8, y: 16, width: 4, height: 4 },
  },
  left_leg: {
    front: { x: 20, y: 52, width: 4, height: 12 },
    back: { x: 28, y: 52, width: 4, height: 12 },
    left: { x: 16, y: 52, width: 4, height: 12 },
    right: { x: 24, y: 52, width: 4, height: 12 },
    top: { x: 20, y: 48, width: 4, height: 4 },
    bottom: { x: 24, y: 48, width: 4, height: 4 },
  },
}

// Scale UV map for 128x128 HD skins
export function getUVMap(format: SkinFormat): Record<BodyPart, Record<BodyFace, UVRegion>> {
  if (format === '64x64') return UV_MAP_64
  
  const scale = 2
  const scaled: Record<string, Record<string, UVRegion>> = {}
  
  for (const [part, faces] of Object.entries(UV_MAP_64)) {
    scaled[part] = {}
    for (const [face, region] of Object.entries(faces)) {
      scaled[part][face] = {
        x: region.x * scale,
        y: region.y * scale,
        width: region.width * scale,
        height: region.height * scale,
      }
    }
  }
  
  return scaled as Record<BodyPart, Record<BodyFace, UVRegion>>
}

// Body part display names
export const BODY_PART_NAMES: Record<BodyPart, string> = {
  head: 'Head',
  body: 'Body',
  right_arm: 'Right Arm',
  left_arm: 'Left Arm',
  right_leg: 'Right Leg',
  left_leg: 'Left Leg',
}

export const BODY_PARTS: BodyPart[] = ['head', 'body', 'right_arm', 'left_arm', 'right_leg', 'left_leg']
export const BODY_FACES: BodyFace[] = ['front', 'back', 'left', 'right', 'top', 'bottom']
