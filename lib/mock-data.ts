import type { SkinData, UserProfile, Comment } from '@/types/skin'

// Sample skin URL using a reliable Minecraft skin texture
const SAMPLE_SKIN_BASE = 'https://textures.minecraft.net/texture/1a4af718455d4aab528e7a61f86fa25e6a369d1768dcb13f7df319a713eb810b'

export const mockSkins: SkinData[] = [
  {
    id: 'skin-1',
    name: 'Neon Reaper',
    description: 'A glowing cyber reaper with neon green highlights',
    imageUrl: SAMPLE_SKIN_BASE,
    format: '128x128',
    createdAt: new Date('2024-03-15'),
    updatedAt: new Date('2024-03-15'),
    authorId: 'user-1',
    authorName: 'AETHER_BLADE',
    authorAvatar: '/avatars/aether.jpg',
    likes: 1243,
    downloads: 12400,
    isPublished: true,
    tags: ['cyber', 'neon', 'reaper'],
  },
  {
    id: 'skin-2',
    name: 'Void Walker',
    description: 'Mysterious figure cloaked in shadow and purple energy',
    imageUrl: SAMPLE_SKIN_BASE,
    format: '128x128',
    createdAt: new Date('2024-03-10'),
    updatedAt: new Date('2024-03-12'),
    authorId: 'user-1',
    authorName: 'AETHER_BLADE',
    likes: 892,
    downloads: 8900,
    isPublished: true,
    tags: ['void', 'magic', 'dark'],
  },
  {
    id: 'skin-3',
    name: 'Cyber Knight',
    description: 'Futuristic knight with holographic armor',
    imageUrl: SAMPLE_SKIN_BASE,
    format: '128x128',
    createdAt: new Date('2024-03-08'),
    updatedAt: new Date('2024-03-08'),
    authorId: 'user-1',
    authorName: 'AETHER_BLADE',
    likes: 1567,
    downloads: 15100,
    isPublished: true,
    tags: ['cyber', 'knight', 'armor'],
  },
  {
    id: 'skin-4',
    name: 'Prism Mage',
    description: 'Elemental mage with prismatic robes',
    imageUrl: SAMPLE_SKIN_BASE,
    format: '64x64',
    createdAt: new Date('2024-03-05'),
    updatedAt: new Date('2024-03-05'),
    authorId: 'user-2',
    authorName: 'PixelMaster',
    likes: 445,
    downloads: 6200,
    isPublished: true,
    tags: ['magic', 'colorful', 'mage'],
  },
  {
    id: 'skin-5',
    name: 'Shadow Ninja',
    description: 'Stealthy assassin clad in midnight black',
    imageUrl: SAMPLE_SKIN_BASE,
    format: '128x128',
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date('2024-03-01'),
    authorId: 'user-3',
    authorName: 'ShadowCraft',
    likes: 2100,
    downloads: 18500,
    isPublished: true,
    tags: ['ninja', 'stealth', 'dark'],
  },
  {
    id: 'skin-6',
    name: 'Dragon Lord',
    description: 'Mighty warrior with dragon-scale armor',
    imageUrl: SAMPLE_SKIN_BASE,
    format: '128x128',
    createdAt: new Date('2024-02-28'),
    updatedAt: new Date('2024-02-28'),
    authorId: 'user-4',
    authorName: 'DragonForge',
    likes: 3200,
    downloads: 25000,
    isPublished: true,
    tags: ['dragon', 'warrior', 'epic'],
  },
]

export const mockUsers: UserProfile[] = [
  {
    id: 'user-1',
    username: 'AETHER_BLADE',
    displayName: 'Aether Blade',
    bio: 'Professional skin architect & digital obsidian artist. Pushing the boundaries of block-based aesthetics since 2014.',
    avatarUrl: '/avatars/aether.jpg',
    skinsCreated: 124,
    totalDownloads: 85200,
    followers: 12400,
    following: 234,
    createdAt: new Date('2014-06-15'),
  },
  {
    id: 'user-2',
    username: 'PixelMaster',
    displayName: 'Pixel Master',
    bio: 'Crafting pixel-perfect skins one block at a time.',
    skinsCreated: 67,
    totalDownloads: 42000,
    followers: 5600,
    following: 89,
    createdAt: new Date('2018-03-22'),
  },
  {
    id: 'user-3',
    username: 'ShadowCraft',
    displayName: 'Shadow Craft',
    bio: 'Master of dark and mysterious skin designs.',
    skinsCreated: 89,
    totalDownloads: 67500,
    followers: 8900,
    following: 156,
    createdAt: new Date('2016-11-08'),
  },
  {
    id: 'user-4',
    username: 'DragonForge',
    displayName: 'Dragon Forge',
    bio: 'Epic fantasy skins with incredible detail.',
    skinsCreated: 156,
    totalDownloads: 120000,
    followers: 15600,
    following: 78,
    createdAt: new Date('2015-04-20'),
  },
]

export const mockComments: Comment[] = [
  {
    id: 'comment-1',
    skinId: 'skin-1',
    authorId: 'user-2',
    authorName: 'PixelMaster',
    content: 'This is amazing! Love the neon details on the armor.',
    likes: 24,
    createdAt: new Date('2024-03-16'),
  },
  {
    id: 'comment-2',
    skinId: 'skin-1',
    authorId: 'user-3',
    authorName: 'ShadowCraft',
    content: 'How did you get that glow effect? Incredible work!',
    likes: 18,
    createdAt: new Date('2024-03-16'),
  },
  {
    id: 'comment-3',
    skinId: 'skin-1',
    authorId: 'user-4',
    authorName: 'DragonForge',
    content: 'The shading technique here is next level.',
    likes: 12,
    createdAt: new Date('2024-03-17'),
  },
  {
    id: 'comment-4',
    skinId: 'skin-5',
    authorId: 'user-1',
    authorName: 'AETHER_BLADE',
    content: 'Clean design! The stealth look is perfect.',
    likes: 31,
    createdAt: new Date('2024-03-02'),
  },
  {
    id: 'comment-5',
    skinId: 'skin-6',
    authorId: 'user-2',
    authorName: 'PixelMaster',
    content: 'This dragon armor is insane! Great texturing.',
    likes: 45,
    createdAt: new Date('2024-03-01'),
  },
]

export function getMockSkins(limit?: number): SkinData[] {
  const skins = [...mockSkins].sort((a, b) => b.downloads - a.downloads)
  return limit ? skins.slice(0, limit) : skins
}

export function getMockSkinById(id: string): SkinData | undefined {
  return mockSkins.find(skin => skin.id === id)
}

export function getMockUserById(id: string): UserProfile | undefined {
  return mockUsers.find(user => user.id === id)
}

export function getMockUserByUsername(username: string): UserProfile | undefined {
  return mockUsers.find(user => user.username.toLowerCase() === username.toLowerCase())
}

export function getMockSkinsByAuthor(authorId: string): SkinData[] {
  return mockSkins.filter(skin => skin.authorId === authorId)
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

export function getCommentsBySkinId(skinId: string): Comment[] {
  return mockComments.filter(comment => comment.skinId === skinId)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
}

export function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) return 'just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)}w ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
