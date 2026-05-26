'use client'

import { use, useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Download, Eye, Share2, UserPlus, UserCheck } from 'lucide-react'
import { BottomNav } from '@/components/layout/bottom-nav'
import { SkinCard } from '@/components/gallery/skin-card'
import { getMockUserById, getMockSkinsByAuthor, formatNumber } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

export default function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [isFollowing, setIsFollowing] = useState(false)
  const [followerCount, setFollowerCount] = useState(0)
  
  // In a real app, this would fetch from API
  const user = getMockUserById(id)
  const userSkins = useMemo(() => getMockSkinsByAuthor(id), [id])
  
  // Initialize follower count
  useState(() => {
    if (user) setFollowerCount(user.followers)
  })
  
  // Mock: check if this is the logged-in user's own profile
  const isOwnProfile = false

  const handleFollow = () => {
    setIsFollowing(!isFollowing)
    setFollowerCount(prev => isFollowing ? prev - 1 : prev + 1)
  }

  if (!user) {
    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-background pb-16">
        <p className="text-muted-foreground">User not found</p>
        <button
          onClick={() => router.back()}
          className="mt-4 rounded-lg bg-obsidian-elevated px-4 py-2 text-sm text-foreground"
        >
          Go Back
        </button>
        <BottomNav />
      </div>
    )
  }

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background pb-16">
      {/* Header */}
      <header className="shrink-0 border-b border-border bg-obsidian-surface/95 backdrop-blur-lg">
        <div className="flex h-11 items-center justify-between px-3">
          <button
            onClick={() => router.back()}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-obsidian-elevated hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h1 className="text-xs font-bold tracking-wide">
            <span className="text-neon">@{user.username}</span>
          </h1>
          <button className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-obsidian-elevated hover:text-foreground">
            <Share2 className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Profile Card */}
      <section className="shrink-0 border-b border-border bg-obsidian-surface px-4 py-4">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="relative">
            <div className="h-16 w-16 overflow-hidden rounded-full border-2 border-neon/50 bg-obsidian-elevated">
              {user.avatarUrl ? (
                <Image
                  src={user.avatarUrl}
                  alt={user.username}
                  width={64}
                  height={64}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-lg font-bold text-muted-foreground">
                  {user.username.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>

          {/* Info and Stats */}
          <div className="flex-1">
            <h2 className="text-base font-bold text-foreground">{user.displayName || user.username}</h2>
            
            {/* Stats Row */}
            <div className="mt-2 flex items-center gap-4">
              <div className="text-center">
                <div className="text-sm font-bold text-foreground">{user.skinsCreated}</div>
                <div className="text-[10px] text-muted-foreground">Skins</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-bold text-foreground">{formatNumber(followerCount || user.followers)}</div>
                <div className="text-[10px] text-muted-foreground">Followers</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-bold text-foreground">{formatNumber(user.following)}</div>
                <div className="text-[10px] text-muted-foreground">Following</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bio */}
        {user.bio && (
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{user.bio}</p>
        )}

        {/* Follow Button (only show if not own profile) */}
        {!isOwnProfile && (
          <button
            onClick={handleFollow}
            className={cn(
              'mt-3 flex h-9 w-full items-center justify-center gap-2 rounded-lg text-xs font-semibold tracking-wide transition-all',
              isFollowing
                ? 'bg-obsidian-card text-foreground hover:bg-destructive hover:text-destructive-foreground'
                : 'bg-neon text-obsidian hover:bg-neon-bright'
            )}
          >
            {isFollowing ? (
              <>
                <UserCheck className="h-4 w-4" />
                Following
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                Follow
              </>
            )}
          </button>
        )}

        {/* Total Stats */}
        <div className="mt-3 flex gap-4 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <Download className="h-3 w-3" />
            {formatNumber(user.totalDownloads)} total downloads
          </span>
          <span className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            Joined {user.createdAt.getFullYear()}
          </span>
        </div>
      </section>

      {/* Section Header */}
      <div className="shrink-0 border-b border-border bg-obsidian-surface px-4 py-2">
        <h3 className="text-xs font-semibold tracking-wide text-muted-foreground">
          Published Skins ({userSkins.length})
        </h3>
      </div>

      {/* Skins Grid */}
      <main className="flex-1 overflow-auto p-3">
        {userSkins.length > 0 ? (
          <div className="grid grid-cols-2 gap-2">
            {userSkins.map((skin) => (
              <SkinCard key={skin.id} skin={skin} />
            ))}
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center py-12">
            <p className="text-sm text-muted-foreground">No published skins yet</p>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  )
}
