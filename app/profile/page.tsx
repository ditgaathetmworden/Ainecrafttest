'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Settings, Plus, Eye, Globe, Lock, Download, Heart, RefreshCw } from 'lucide-react'
import { BottomNav } from '@/components/layout/bottom-nav'
import { SkinCard } from '@/components/gallery/skin-card'
import { GoogleSignInButton } from '@/components/auth/google-sign-in-button'
import { mockSkins } from '@/lib/mock-data'
import { cn } from '@/lib/utils'
import { useAuth } from '@/components/providers/firebase-auth-provider'
import { useRouter } from 'next/navigation'

type FilterOption = 'all' | 'published' | 'drafts'

export default function ProfilePage() {
  const router = useRouter()
  const { user, userProfile, loading } = useAuth()
  const [filterBy, setFilterBy] = useState<FilterOption>('all')
  const [savedSkins, setSavedSkins] = useState<any[]>([])

  // Load saved skins from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('savedSkins')
    if (stored) {
      setSavedSkins(JSON.parse(stored))
    }
  }, [])

  // Combine mock skins with user's saved skins
  const userSkins = useMemo(() => {
    if (!userProfile) return []
    const mockUserSkins = mockSkins.filter((skin) => skin.authorId === userProfile.id)
    return [
      ...savedSkins.map(s => ({ 
        ...s, 
        authorId: userProfile.id, 
        authorName: userProfile.username, 
        likes: 0, 
        downloads: 0 
      })), 
      ...mockUserSkins
    ]
  }, [savedSkins, userProfile])

  const filteredSkins = useMemo(() => {
    if (filterBy === 'published') {
      return userSkins.filter((skin) => skin.isPublished)
    } else if (filterBy === 'drafts') {
      return userSkins.filter((skin) => !skin.isPublished)
    }
    return userSkins
  }, [filterBy, userSkins])

  const filterOptions: { value: FilterOption; label: string; icon: typeof Globe }[] = [
    { value: 'all', label: 'All', icon: Eye },
    { value: 'published', label: 'Public', icon: Globe },
    { value: 'drafts', label: 'Private', icon: Lock },
  ]

  if (loading) {
    return (
      <div className="flex h-[100dvh] items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-8 w-8 animate-spin text-neon" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex h-[100dvh] items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3 text-center px-6">
          <p className="text-sm text-muted-foreground mb-4">Please sign in to view your profile.</p>
          <GoogleSignInButton />
        </div>
      </div>
    )
  }

  const formatShortNum = (num: number) => {
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k'
    return num.toString()
  }

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background pb-16">
      {/* Header */}
      <header className="shrink-0 border-b border-border bg-obsidian-surface/95 backdrop-blur-lg">
        <div className="flex h-11 items-center justify-between px-3">
          <div className="w-8" />
          <h1 className="text-xs font-bold tracking-wide">
            <span className="text-neon">My</span>
            <span className="text-foreground"> Profile</span>
          </h1>
          <Link 
            href="/settings"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-obsidian-elevated hover:text-foreground cursor-pointer"
          >
            <Settings className="h-4 w-4" />
          </Link>
        </div>
      </header>

      {/* Profile Card */}
      <section className="shrink-0 border-b border-border bg-obsidian-surface px-4 py-4 max-w-sm mx-auto w-full">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="relative">
            <div className="h-16 w-16 overflow-hidden rounded-full border-2 border-neon bg-obsidian-elevated">
              <Image
                src={userProfile.avatarUrl || `https://mc-heads.net/avatar/${userProfile.username}/128`}
                alt={userProfile.username}
                width={64}
                height={64}
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full border-2 border-obsidian-surface bg-neon" />
          </div>

          {/* Info */}
          <div className="flex-1">
            <h2 className="text-base font-bold text-foreground">{userProfile.displayName || userProfile.username}</h2>
            <p className="text-[11px] text-neon font-semibold mb-1">@{userProfile.username}</p>
            {userProfile.bio && (
              <p className="text-[11px] text-muted-foreground line-clamp-2 max-w-[210px] my-1 leading-snug">
                {userProfile.bio}
              </p>
            )}
            <div className="mt-1 flex items-center gap-4 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {userProfile.skinsCreated} skins
              </span>
              <span className="flex items-center gap-1">
                <Download className="h-3 w-3" />
                {formatShortNum(userProfile.totalDownloads)}
              </span>
              <span className="flex items-center gap-1">
                <Heart className="h-3 w-3" />
                {formatShortNum(userProfile.followers)} followers
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Filter & Create */}
      <section className="shrink-0 border-b border-border bg-obsidian-surface px-3 py-2">
        <div className="flex items-center gap-2 max-w-sm mx-auto w-full">
          {/* Filter Pills */}
          <div className="flex flex-1 gap-1.5">
            {filterOptions.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setFilterBy(value)}
                className={cn(
                  'flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-[11px] font-semibold tracking-wide transition-all cursor-pointer',
                  filterBy === value
                    ? 'pill-selected'
                    : 'pill-unselected'
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            ))}
          </div>

          {/* Create Button */}
          <Link
            href="/editor"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neon text-obsidian transition-colors hover:bg-neon-bright"
          >
            <Plus className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Skins Grid */}
      <main className="flex-1 overflow-auto p-3 max-w-md mx-auto w-full">
        {filteredSkins.length > 0 ? (
          <div className="grid grid-cols-2 gap-2">
            {filteredSkins.map((skin) => (
              <SkinCard key={skin.id} skin={skin} />
            ))}
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center py-10">
            <p className="text-sm text-muted-foreground">No skins yet</p>
            <Link
              href="/editor"
              className="mt-3 flex items-center gap-2 rounded-lg bg-neon px-4 py-2 text-xs font-semibold text-obsidian transition-colors hover:bg-neon-bright"
            >
              <Plus className="h-4 w-4" />
              Create Your First Skin
            </Link>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  )
}
