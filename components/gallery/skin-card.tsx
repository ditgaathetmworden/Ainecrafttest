'use client'

import Link from 'next/link'
import { Heart, Download, MessageCircle } from 'lucide-react'
import type { SkinData } from '@/types/skin'
import { formatNumber, getCommentsBySkinId } from '@/lib/mock-data'
import { SkinViewer3D } from '@/components/editor/skin-viewer-3d'
import { cn } from '@/lib/utils'

// Default Steve skin from Minecraft textures (reliable source)
export const DEFAULT_SKIN_URL = 'https://textures.minecraft.net/texture/1a4af718455d4aab528e7a61f86fa25e6a369d1768dcb13f7df319a713eb810b'

interface SkinCardProps {
  skin: SkinData
  className?: string
}

export function SkinCard({ skin, className }: SkinCardProps) {
  const commentCount = getCommentsBySkinId(skin.id).length

  return (
    <Link
      href={`/gallery/${skin.id}`}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-xl bg-obsidian-card transition-transform duration-200 hover:scale-[1.02]',
        className
      )}
    >
      {/* Centered Title */}
      <div className="flex items-center justify-center px-2.5 py-2.5">
        <span className="truncate text-[11px] font-semibold text-foreground leading-none text-center">
          {skin.name}
        </span>
      </div>

      {/* 3D Preview with Minecraft background — always walking */}
      <div 
        className="relative aspect-[3/4] overflow-hidden"
        style={{ backgroundImage: 'url(/minecraft-background.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        <div className="pointer-events-none absolute inset-0 z-10" />
        <SkinViewer3D
          skinUrl={skin.imageUrl ?? DEFAULT_SKIN_URL}
          className="h-full w-full"
          animation="walk"
          autoRotate={false}
          showControls={false}
        />
      </div>

      {/* Stats row */}
      <div className="flex items-center justify-center gap-3 px-2.5 py-2.5">
        <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
          <Heart className="h-3 w-3" />
          {formatNumber(skin.likes)}
        </span>
        <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
          <Download className="h-3 w-3" />
          {formatNumber(skin.downloads)}
        </span>
        <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
          <MessageCircle className="h-3 w-3" />
          {commentCount}
        </span>
      </div>

      {/* Hover ring */}
      <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-transparent transition-all group-hover:ring-neon/20" />
    </Link>
  )
}


